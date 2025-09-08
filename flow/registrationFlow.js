import { registerAndCapture, extractUserInfo, saveUserModel } from "../utils/registrationHelper.js";
import { waitForToast } from "../utils/toastUtils.js";
import jsonData from "../userData.json";
import { config } from "../config/testConfig.js";
import { assertLatestEmailSubject } from "../utils/gmailUtils.js";

export async function registerUserFlow(page, userModel) {
  // Register and capture backend response
  const { response, data } = await registerAndCapture(page, userModel);

  // Wait for success toast
  await waitForToast(page);

  // Extract userId from response
  const { userId } = await extractUserInfo(page, data, response);

  // Save user details (with userId) into JSON
  userModel.userId = userId;
  saveUserModel(userModel, jsonData);

  return userModel; // return enriched model
}

/**
 * Email verification after registration.
 */
export async function verifyRegistrationEmail(request) {
  await assertLatestEmailSubject(request, config.emailSubject);
}
