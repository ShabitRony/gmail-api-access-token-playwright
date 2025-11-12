// // tests/adminLogin.spec.js
// import { test } from "@playwright/test";
// import AdminLoginPage from "../pages/AdminLoginpage.js";
// import dotenv from "dotenv";

// dotenv.config();

// test("Admin login and store token", async ({ page }) => {
//   // navigate to app
//   await page.goto(process.env.BASE_URL);

//   // perform login - all assertions are handled inside adminLogin()
//   const adminPage = new AdminLoginPage(page);
//   await adminPage.adminLogin();
// });
