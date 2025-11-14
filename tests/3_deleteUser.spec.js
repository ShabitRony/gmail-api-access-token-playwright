import { test } from "@playwright/test";
import { getLatestUser, removeLatestUserFromFile } from "../utils/userUtils.js";
import DeleteUser from "../pages/DeleteUserPage.js";
import AdminLoginPage from "../pages/AdminLoginpage.js";
import dotenv from "dotenv";
dotenv.config();
test("Delete the latest registered user", async ({ page,request }) => {
    // navigate to app
  await page.goto(process.env.BASE_URL);

  // perform login - all assertions are handled inside adminLogin()
  const adminPage = new AdminLoginPage(page);
  await adminPage.adminLogin();
  
  //  Get latest user
  const latestUser = getLatestUser();

  // Create DeleteUser page object
  const apiPage = new DeleteUser(request);

  // Delete user & assert
  await apiPage.deleteUserById(latestUser.userId);

  // Remove user from local file only after successful delete
  removeLatestUserFromFile();
});
