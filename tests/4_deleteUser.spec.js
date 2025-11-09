import { test } from "@playwright/test";
import { getLatestUser, removeLatestUserFromFile } from "../utils/userUtils.js";
import DeleteUser from "../pages/DeleteUserPage.js";

test("Delete the latest registered user", async ({ request }) => {
  //  Get latest user
  const latestUser = getLatestUser();

  // Create DeleteUser page object
  const apiPage = new DeleteUser(request);

  // Delete user & assert
  await apiPage.deleteUserById(latestUser.userId);

  // Remove user from local file only after successful delete
  removeLatestUserFromFile();
});
