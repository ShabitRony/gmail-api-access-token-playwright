// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  reporter: [
    ['list'],
    ['allure-playwright']
  ],
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  timeout:60000,
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  expect:{
    timeout:60000,
  },
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'https://dailyfinance.roadtocareer.net/',
    video:"on-first-retry",
    screenshot:"only-on-failure",
    headless:false,
    actionTimeout:60000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',


    viewport: null, 
    launchOptions: {
      // Ensure the browser starts maximized
      args: ['--start-maximized'],
    },
  },
  

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      
    },
    //  {
    //   name: 'smoke',
    //   testMatch: [
    //     'tests/1_UserRegistration/1_registrationTestRunner.spec.js',
    //     'tests/2_ResetPassword/2_resetPasswordTestRunner.spec.js',
    //     'tests/3_DeleteUser/3_deleteUserTestRunner.spec.js',
    //   ],
    //   fullyParallel: false, // run sequentially inside project
    // },
    // {
    //   name: 'regression',
    //   testMatch: [
    //     'tests/1_RegistrationTestRunner.spec.js',
    //     'tests/2_AddCostTestRunner.spec.js',
    //     'tests/3_UploadPhotoTestRunner.spec.js',
    //     'tests/4_ResetPasswordTestRnner.spec.js',
    //     'tests/5_LoginWithNewPassTestRunner.spec.js',
    //   ],
    // }
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

