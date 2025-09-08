import { test } from "@playwright/test";
import { generateRandomUser } from "../utils/generateRandomUser.js";
import { 
  registerUserFlow, 
  verifyRegistrationEmail 
} from "../flow/registrationFlow.js";  // <-- new refactored helper

test("User Registration End-to-End Flow", async ({ page, request }) => {
  // Step 1: Open the application
  await page.goto(process.env.BASE_URL);

  // Step 2: Generate a random test user
  const userModel = generateRandomUser();

  // Step 3: Register the user & capture User ID
  const registeredUser = await registerUserFlow(page, userModel);

  // Step 4: Verify confirmation email
  await verifyRegistrationEmail(request);

});
