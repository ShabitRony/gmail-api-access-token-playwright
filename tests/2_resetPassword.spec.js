import { test } from "@playwright/test";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import DeleteUserPage from "../pages/DeleteUserPage";

test("Reset Password Flow with Cleanup", async ({ page, request }) => {
    const resetPage = new ResetPasswordPage(page,request);

    // Reset password and get latest user
     await resetPage.resetLatestUserPassword({});

  
});
