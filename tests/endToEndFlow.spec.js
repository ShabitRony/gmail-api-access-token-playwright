// tests/regressionSuite.spec.js
import { test } from "@playwright/test";

test.describe("Full Regression Suite", () => {
  test("Run User Registration", async () => {
    await import("./1_userRegistration.spec.js");
  });

  test("Run Reset Password Flow", async () => {
    await import("./2_resetPassword.spec.js");
  });
   test("Run Admin Login Flow", async () => {
    await import("./3_adminLogin.spec.js");
  });

  test("Run Delete User Flow", async () => {
    await import("./4_deleteUser.spec.js");
  });

});
