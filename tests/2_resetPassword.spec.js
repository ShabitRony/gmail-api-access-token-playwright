import { test } from "@playwright/test";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { getResetPasswordLink } from "../utils/gmailUtils";
import { getLatestUser, updateLatestUserPassword } from "../utils/userUtils";
import { config } from "../config/testConfig";

test("Reset Password", async ({ page, request }) => {
  await page.goto(process.env.BASE_URL);

  const user = getLatestUser();
  const resetPage = new ResetPasswordPage(page);

  // Step 1: request password reset
  await resetPage.requestReset(user.email);

  // Step 2: fetch reset link from email
  const resetLink = await getResetPasswordLink(request, config.resetPasswordSubject);

  // Step 3: reset password
  await page.goto(resetLink);
  const newPassword = "12345";
  await resetPage.setNewPassword(newPassword);

  // Step 4: update user data
  updateLatestUserPassword(newPassword);
  
});
