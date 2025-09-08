import fs from "fs";
import { expect } from "@playwright/test";
import RegistrationPage from "../pages/RegistrationPage.js";

/* ===== JWT & ID Parsing ===== */
export function decodeJwtId(token) {
  try {
    const [payloadB64] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    return payload.id || payload.userId || payload.user_id || payload.sub || payload.uid || null;
  } catch {
    return null;
  }
}

export function pickAnyId(obj) {
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
export async function captureRegistrationResponse(page, registerAction, timeoutMs = 20000) {
  let resolvedResponse = null;
  let capturedData = null;

  const handler = async (res) => {
    try {
      if (res.url().includes("/api/auth/register")) {
        //Assert method and status
        expect(res.request().method()).toBe("POST");
        console.log("Intercepted registration request:", res.request().method());
        
        expect(res.status()).toBe(201);
        console.log("Registration response status:", res.status());
        
        // Ensure it's JSON
        const ct = res.headers()["content-type"] || "";
        if (!/json/i.test(ct)) return;

        const data = await res.json().catch(() => null);
        if (!data) return;

        const id = pickAnyId(data);
        const tokenId = data?.token ? decodeJwtId(data.token) : null;

        if (id || tokenId) {
          capturedData = data;
          resolvedResponse = res;
          page.off("response", handler);
        }
      }
    } catch {}
  };

  page.on("response", handler);

  await registerAction();

  const started = Date.now();
  while (!resolvedResponse && Date.now() - started < timeoutMs) {
    await page.waitForTimeout(100);
  }

  page.off("response", handler);
  console.log("Captured registration response:", capturedData);
  return { response: resolvedResponse, data: capturedData };
}


/* ===== Fetch ID from Various Sources ===== */
export async function fetchIdFromMe(page, mePath = "/api/me") {
  return await page.evaluate(async (path) => {
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
        } catch { return null; }
      };
      if (typeof j.token === "string") return tryDecode(j.token);
      return null;
    } catch { return null; }
  }, mePath);
}

export async function idFromWebStorage(page) {
  return await page.evaluate(() => {
    const tryDecode = (tok) => {
      try {
        const parts = tok.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload.id || payload.userId || payload.user_id || payload.sub || payload.uid || null;
      } catch { return null; }
    };
    const parse = (v) => { try { return JSON.parse(v); } catch { return null; } };
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

export async function idFromCookiesJWT(page) {
  const cookies = await page.context().cookies();
  for (const c of cookies) {
    const id = decodeJwtId(c.value);
    if (id) return String(id);
  }
  return null;
}

export async function idFromUrlOrDom(page) {
  const u = page.url();
  let id =
    (u.match(/users?\/([A-Za-z0-9_-]+)/) || [])[1] ||
    (u.match(/[?&](?:userId|uid)=([^&]+)/) || [])[1] ||
    null;
  if (id) return id;

  const sel = '[data-test="user-id"], [data-testid="user-id"], .user-id, #userId';
  const el = page.locator(sel).first();
  if (await el.isVisible().catch(() => false)) {
    const txt = (await el.textContent())?.trim();
    if (txt) return txt;
  }
  return null;
}

/* ===== Orchestrator: Extract User Info ===== */
export async function extractUserInfo(page, regData) {
  let userId = regData ? pickAnyId(regData) || decodeJwtId(regData.token || "") : null;
  let source = "regData";

  if (!userId) { userId = await fetchIdFromMe(page, "/api/me"); source = "api/me"; }
  if (!userId) { userId = await idFromWebStorage(page); source = "webStorage"; }
  if (!userId) { userId = await idFromCookiesJWT(page); source = "cookies"; }
  if (!userId) { userId = await idFromUrlOrDom(page); source = "url/dom"; }

  expect.soft(userId).toBeTruthy();
  console.log(`User ID: ${userId}`);

  return { userId: userId || "UNKNOWN", source };
}

/* ===== Save User ===== */
export function saveUserModel(userModel, jsonData, filePath = "./userData.json") {
  jsonData.push(userModel);
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
}
export async function registerAndCapture(page, userModel) {
  const regPage = new RegistrationPage(page);
  
  return await captureRegistrationResponse(
    page,
    async () => { 
      await regPage.registerUser(userModel); 
    }
  );
}