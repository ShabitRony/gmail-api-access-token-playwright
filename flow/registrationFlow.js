import RegistrationPage from "../pages/RegistrationPage.js";
import { waitForToast } from "../utils/toastUtils.js";
import { config } from "../config/testConfig.js";
import { waitForEmailSubjectUnified } from "../utils/gmailUtils.js";

export async function registerUserFlow(page, userModel) {
  const regPage = new RegistrationPage(page);

  // Register and capture backend response
  const { response, data } = await regPage.registerAndCapture(userModel);

  // Wait for success toast
  await waitForToast(page);

  // Extract userId from response
  const { userId } = await regPage.extractUserInfo(data);

  // Save  userId into JSON
  userModel.userId = userId;
  regPage.saveUserModel(userModel);
}

/**
 * Email verification after registration.
 */
export async function verifyRegistrationEmail(request) {
  // await assertLatestEmailSubject(request, config.emailSubject);
  

const details = await waitForEmailSubjectUnified({
  method: "API",          //  "API" or "APP_PASSWORD"
  request,                         // only for method: "API"
  expectedSubject: config.emailSubject, // adjust as needed
});

// console.log(details.subject);
// console.log(details.body);

}
