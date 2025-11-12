// pages/adminLoginPage.js
import { log } from "console";
import fs from "fs";
import path from "path";

class AdminLoginPage {
  constructor(page) {
    this.page = page;

    this.emailTxt = page.getByRole("textbox", { name: "Email" });
    this.passwordTxt = page.getByRole("textbox", { name: "Password" });
    this.loginBtn = page.getByRole("button", { name: "LOGIN" });
  }

  /**
   * Perform admin login, capture response, store token in .env, and assert request/response
   * @param {string} email
   * @param {string} password
   */
  async adminLogin() {
    // Intercept the login request
    const email = process.env.Admin_Email;
    const password = process.env.Admin_Pass;
    const loginPromise = this.page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/auth/login") &&
        resp.request().method() === "POST"
    );

    // Fill login form and submit
    await this.emailTxt.fill(email);
    await this.passwordTxt.fill(password);
    await this.loginBtn.click();

    // Wait for response
    const response = await loginPromise;

    // Assertions
    const req = response.request();
    const status = response.status();
    const url = req.url();
    const method = req.method();
    
    //Assertions
    
    console.log("Status Code",status);
    console.log("URL",url);
    console.log("Method",method);
    
    

    if (url !== "https://dailyfinanceapi.roadtocareer.net/api/auth/login") {
      throw new Error(`Unexpected request URL: ${url}`);
    }
    if (method !== "POST") {
      throw new Error(`Unexpected request method: ${method}`);
    }
    if (status !== 200) {
      throw new Error(`Unexpected status code: ${status}`);
    }

    // Extract token from response JSON
    const data = await response.json();
    const token = data.token;
    log("Token:", token);
    if (!token) throw new Error("Token not found in login response");

    // Save token in .env file
    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    // Replace or add TOKEN line
    if (envContent.includes("ADMIN_TOKEN=")) {
      envContent = envContent.replace(/ADMIN_TOKEN=.*/, `ADMIN_TOKEN=${token}`);
    } else {
      envContent += `\nADMIN_TOKEN=${token}\n`;
    }

    fs.writeFileSync(envPath, envContent, "utf-8");
    console.log("✅ Token saved to .env file");


    return { url, method, status, token };
   
    
  }
}

export default AdminLoginPage;
