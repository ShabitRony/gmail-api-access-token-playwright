import fs from "fs";
import { expect } from "@playwright/test";

class RegistrationPage {
  constructor(page) {
    this.page = page;

    // === Locators ===
    this.registrationLink = page.getByRole("link", { name: "register" });
    this.firstNameTxt = page.getByRole("textbox", { name: "First Name" });
    this.lastNameTxt = page.getByRole("textbox", { name: "Last Name" });
    this.emailTxt = page.getByRole("textbox", { name: "Email" });
    this.passwordTxt = page.getByRole("textbox", { name: "Password" });
    this.phoneNumberTxt = page.getByRole("textbox", { name: "Phone Number" });
    this.addressTxt = page.getByRole("textbox", { name: "Address" });
    this.genderRadioBtn = page.getByRole("radio");
    this.terms = page.getByRole("checkbox");
    this.registerBtn = page.getByRole("button", { name: "REGISTER" });
  }

  /* ===== Registration Action ===== */
  async registerUser(userModel) {
    await this.registrationLink.click();
    await this.firstNameTxt.fill(userModel.firstName);
    await this.lastNameTxt.fill(userModel.lastName);
    await this.emailTxt.fill(userModel.email);
    await this.passwordTxt.fill(userModel.password);
    await this.phoneNumberTxt.fill(userModel.phoneNumber);
    await this.addressTxt.fill(userModel.address);
    await this.genderRadioBtn.first().click();
    await this.terms.click();
    await this.registerBtn.click();
  }

  /* ===== JWT Decode Helpers ===== */
  decodeJwtId(token) {
    try {
      const [payloadB64] = token.split(".");
      const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
      return payload.id || payload.userId || payload.user_id || payload.sub || payload.uid || null;
    } catch {
      return null;
    }
  }

  pickAnyId(obj) {
    if (!obj || typeof obj !== "object") return undefined;
    return (
      obj._id ||
      obj.id ||
      obj.userId ||
      obj.user_id ||
      obj.data?._id ||
      obj.data?.id ||
      obj.data?.userId ||
      obj.user?._id ||
      obj.user?.id ||
      obj.user?.userId ||
      obj.profile?._id ||
      obj.profile?.id
    );
  }

  /* ===== Capture Registration Response ===== */
  async captureRegistrationResponse(registerAction, timeoutMs = 20000) {
    let resolvedResponse = null;
    let capturedData = null;

    const handler = async (res) => {
      try {
        if (res.url().includes("/api/auth/register")) {
          const method = res.request().method();
          const status = res.status();

          if (method !== "POST") {
            console.warn(`❌ Expected request method: POST, but got: ${method}`);
          } else {
            console.log(`✅ Request method as expected: ${method}`);
          }

          if (status !== 201) {
            console.warn(`❌ Expected status: 201, but got: ${status}`);
          } else {
            console.log(`✅ Response status as expected: ${status}`);
          }

          const ct = res.headers()["content-type"] || "";
          if (!/json/i.test(ct)) return;

          const data = await res.json().catch(() => null);
          if (!data) return;

          const id = this.pickAnyId(data);
          const tokenId = data?.token ? this.decodeJwtId(data.token) : null;

          if (id || tokenId) {
            capturedData = data;
            resolvedResponse = res;
            this.page.off("response", handler);
          }
        }
      } catch (err) {
        console.error("Error handling response:", err);
      }
    };

    this.page.on("response", handler);
    await registerAction();

    const started = Date.now();
    while (!resolvedResponse && Date.now() - started < timeoutMs) {
      await this.page.waitForTimeout(100);
    }

    this.page.off("response", handler);
    console.log("Captured registration response:", capturedData);
    return { response: resolvedResponse, data: capturedData };
  }

  /* ===== Fetch / Extract User ID from Multiple Sources ===== */
  async fetchIdFromMe(mePath = "/api/me") {
    return await this.page.evaluate(async (path) => {
      try {
        const res = await fetch(path, { credentials: "include" });
        if (!res.ok) return null;
        const j = await res.json().catch(() => null);
        if (!j) return null;

        const id =
          j._id || j.id || j.userId || j.user_id ||
          j.data?._id || j.data?.id ||
          j.user?._id || j.user?.id || null;
        if (id) return String(id);

        const tryDecode = (tok) => {
          try {
            const parts = tok.split(".");
            if (parts.length !== 3) return null;
            const payload = JSON.parse(atob(parts[1]));
            return payload.id || payload.userId || payload.sub || payload.uid || null;
          } catch {
            return null;
          }
        };
        if (typeof j.token === "string") return tryDecode(j.token);
        return null;
      } catch {
        return null;
      }
    }, mePath);
  }

  async idFromWebStorage() {
    return await this.page.evaluate(() => {
      const tryDecode = (tok) => {
        try {
          const parts = tok.split(".");
          if (parts.length !== 3) return null;
          const payload = JSON.parse(atob(parts[1]));
          return payload.id || payload.userId || payload.user_id || payload.sub || payload.uid || null;
        } catch {
          return null;
        }
      };
      const parse = (v) => {
        try {
          return JSON.parse(v);
        } catch {
          return null;
        }
      };
      const pickId = (o) =>
        o?._id || o?.id || o?.userId || o?.user_id ||
        o?.data?._id || o?.data?.id ||
        o?.user?._id || o?.user?.id || null;

      for (const store of [localStorage, sessionStorage]) {
        for (let i = 0; i < store.length; i++) {
          const raw = store.getItem(store.key(i)) || "";
          const fromRaw = tryDecode(raw);
          if (fromRaw) return String(fromRaw);
          const obj = parse(raw);
          if (obj) {
            const byId = pickId(obj) || pickId(obj?.auth) || pickId(obj?.profile);
            if (byId) return String(byId);
            for (const k of ["token", "accessToken", "idToken"]) {
              if (typeof obj[k] === "string") {
                const fromTok = tryDecode(obj[k]);
                if (fromTok) return String(fromTok);
              }
            }
          }
        }
      }
      return null;
    });
  }

  async idFromCookiesJWT() {
    const cookies = await this.page.context().cookies();
    for (const c of cookies) {
      const id = this.decodeJwtId(c.value);
      if (id) return String(id);
    }
    return null;
  }

  async idFromUrlOrDom() {
    const u = this.page.url();
    let id =
      (u.match(/users?\/([A-Za-z0-9_-]+)/) || [])[1] ||
      (u.match(/[?&](?:userId|uid)=([^&]+)/) || [])[1] ||
      null;
    if (id) return id;

    const sel = '[data-test="user-id"], [data-testid="user-id"], .user-id, #userId';
    const el = this.page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      const txt = (await el.textContent())?.trim();
      if (txt) return txt;
    }
    return null;
  }

  /* ===== Extract User Info ===== */
  async extractUserInfo(regData) {
    let userId = regData ? this.pickAnyId(regData) || this.decodeJwtId(regData.token || "") : null;
    let source = "regData";

    if (!userId) {
      userId = await this.fetchIdFromMe("/api/me");
      source = "api/me";
    }
    if (!userId) {
      userId = await this.idFromWebStorage();
      source = "webStorage";
    }
    if (!userId) {
      userId = await this.idFromCookiesJWT();
      source = "cookies";
    }
    if (!userId) {
      userId = await this.idFromUrlOrDom();
      source = "url/dom";
    }

    expect.soft(userId).toBeTruthy();
    console.log(`User ID: ${userId}`);

    return { userId: userId || "UNKNOWN", source };
  }

  /* ===== Save User Model ===== */
  saveUserModel(userModel, filePath = "./userData.json") {
    let jsonData = [];

    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8").trim();
        jsonData = content ? JSON.parse(content) : [];
      }
    } catch (e) {
      jsonData = [];
    }

    if (userModel.userId) {
      const index = jsonData.findIndex((u) => u.userId === userModel.userId);
      if (index !== -1) {
        jsonData[index] = userModel;
      } else {
        jsonData.push(userModel);
      }
    } else {
      jsonData.push(userModel);
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
  }

  /* ===== Combined Method: Register + Capture ===== */
  async registerAndCapture(userModel) {
    return await this.captureRegistrationResponse(async () => {
      await this.registerUser(userModel);
    });
  }

  async registerUserFullFlow(userModel, verifyEmailFn = null) {
  const { response, data } = await this.registerAndCapture(userModel);
  const { userId } = await this.extractUserInfo(data);
  this.saveUserModel({ ...userModel, userId });

  if (verifyEmailFn) {
    await verifyEmailFn(); // call email verification if provided
  }

  console.log(`✅ Registration completed for userId: ${userId}`);
  return { userId, response, data };
}
}

export default RegistrationPage;
