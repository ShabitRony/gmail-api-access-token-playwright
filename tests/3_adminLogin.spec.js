// tests/adminLogin.spec.js
import { test, expect } from "@playwright/test";
import AdminLoginPage from "../pages/AdminLoginpage.js";
import dotenv from "dotenv";

dotenv.config();

test.describe("Admin Login", () => {
  test("should login and store token", async ({ page }) => {
    await page.goto(process.env.BASE_URL);

    const adminPage = new AdminLoginPage(page);

    const { url, method, status, token } = await adminPage.adminLogin(
      "admin@test.com",
      "admin123"
    );

    console.log({ url, method, status, token });

    // Additional assertion if needed
    expect(url).toBe("https://dailyfinanceapi.roadtocareer.net/api/auth/login");
    expect(method).toBe("POST");
    expect(status).toBe(200);
    expect(token).toBeTruthy();
  });
});
