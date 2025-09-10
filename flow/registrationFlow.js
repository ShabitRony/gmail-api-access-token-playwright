import { registerAndCapture, extractUserInfo, saveUserModel } from "../utils/registrationHelper.js";
import { waitForToast } from "../utils/toastUtils.js";
import { config } from "../config/testConfig.js";
import { assertLatestEmailSubject } from "../utils/gmailUtils.js";
import { json } from "stream/consumers";

export async function registerUserFlow(page, userModel) {
  // Register and capture backend response
  const { response, data } = await registerAndCapture(page, userModel);

  // Wait for success toast
  await waitForToast(page);

  // Extract userId from response
  const { userId } = await extractUserInfo(page, data, response);

  // Save  userId into JSON
  userModel.userId = userId;
  saveUserModel(userModel);
}

/**
 * Email verification after registration.
 */
export async function verifyRegistrationEmail(request) {
  await assertLatestEmailSubject(request, config.emailSubject);
}
