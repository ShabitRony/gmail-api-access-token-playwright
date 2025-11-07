import { test } from "@playwright/test";
import { generateRandomUser } from "../utils/generateRandomUser.js";
import RegistrationPage from "../pages/RegistrationPage.js";
import { verifyRegistrationEmail } from "../flow/registrationFlow.js"; 

test("User Registration End-to-End Flow", async ({ page, request }) => {
  await page.goto(process.env.BASE_URL);

  const userModel = generateRandomUser();
  const regPage = new RegistrationPage(page);

 
  await regPage.registerUserFullFlow(userModel,() => verifyRegistrationEmail(request) 
  );
});
