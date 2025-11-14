# 📌 Project Highlights

## In this automation flow, a user completes the registration process, continues through the remaining user flows, and finally we call a Delete API to remove the user in order to keep the database clean.

- In the Gmail utility, we have implemented three methods to support different authentication approaches: OAuth 2.0 Playground (gmail_api_token), Gmail App Password, and Client ID / Client Secret.

### The Gmail utility covers the following functionalities:

- Extracting OTP codes

- Clicking buttons or links within emails

- Navigating to links extracted from plain text

- Fetching the email subject and email body

# Note:
- OAuth gmail_api_token expires quickly and needs to be refreshed every hour. However, it is secure and easy to generate and use.

- An App Password is also easy to generate, but it is less secure compared to using an OAuth-based gmail_api_token.


## This project automates end-to-end user flows using Playwright.
## It covers user registration, Gmail validation (via OAuth 2.0 Gmail API), reset password flow, and user deletion with API calls.

# 🚀 Features Automated

## ✅ User Registration

- Automates new user registration on the application.

- Verifies congratulations toast message.

- Fetches registration validation mail from Gmail using Gmail API.

- Stores registered user information in JSON format.

## 🔑 Reset Password

- Automates Forgot Password flow.

- Accesses reset password link from Gmail (OAuth 2.0 Gmail API).

- Validates the reset process.

## 🗑️ User Deletion

- Calls the Delete User API.

- Validates successful deletion with response assertion.

## Prerequisites

Node.js
 installed (v18+ recommended).

Gmail account with 2-Factor Authentication enabled.

A valid OAuth 2.0 token generated from Google OAuth Playground

## ⚙️ Installation & Setup


# Clone the Repository
`git clone https://github.com/ShabitRony/gmail-api-access-token-playwright`
` cd gmail-api-token-access`

# Install Dependencies
`npm install`

# Install Playwright Browsers:
`npx playwright install`

## 📧 Generate Gmail API Token using OAuth 2.0 Playground
- [Visit OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
- On the left side, scroll down or search Gmail API v1

- Check ✅ https://www.googleapis.com/auth/gmail.readonly

- This gives your app read-only access to emails.

- Click Authorize APIs.

- Sign in with your Gmail account and allow access.

## Configure Environment Variabless

- Create a .env file in the project root and add:

```Gmail_URL=https://gmail.googleapis.com/gmail/v1/users/me/messages/```

```GMAIL_API_TOKEN=<your-oauth2-token>```


## Option 2 — Generate Gmail App Password (simpler, for scripts that use SMTP/IMAP clients which don’t support OAuth)

- When to use: quick for personal accounts or development when the app accepts username+password (but not preferable for production). App passwords        require 2-Step Verification on the Google account. 

Step-by-step (desktop / web browser):

### 1. Open https://myaccount.google.com and sign in to the Google account you want to use.

### 2. In the left column click Security (or click the grid icon → Manage your Google Account → Security). 

### 3. Under “How you sign in to Google”, find 2-Step Verification → click it.

 - If not enabled yet, click Get started (or Turn on) and follow the prompts:

 - Enter your account password

 - Add a phone number or authenticator app

 - Verify the second factor and complete setup.

 - If already enabled, simply open the 2-Step Verification page, scroll down, and click App passwords.

  ### 4. In App passwords:

 - Select app: choose Mail (or choose Other (Custom name) and type a recognizable name like gmail-otp-extractor).

 - Select device: choose the appropriate device or Other → give a name.

 - Click Generate.

 - Google will display a 16-character app password (grouped like abcd efgh ijkl mnop). Copy this password now — you will not be able to view it again after closing.

 - Put this in your .env (example):

 `GMAIL_APP_PASSWORD=abcd efgh ijkl mnop`

 - Configure Environment Variables


## 📂 Fonlder Structure
GMAIL-API-TOKEN-ACCESS/

    │── 📂 flow                   # High-level test flows
    │   └── registrationFlow.js
    │
    │── 📂 pages                  # Page Object classes
    │   ├── RegistrationPage.js
    │   ├── ResetPasswordPage.js
    │   └── DeleteUserPage.js
    │
    │── 📂 tests                  # Test cases (spec files)
    │   ├── 1_registration.spec.js
    │   ├── 2_resetPassword.spec.js
    │   └── 3_deleteUser.spec.js
    │
    │── 📂 utils                  # Utility/helper functions
    │   ├── gmailUtils.js
    │   ├── userUtils.js
    │   ├── toastUtils.js
    │   ├── generateRandomUser.js
    │   
    └── userData.json             # Store Test data


## 🛠️ Tech Stack

- Playwright – Browser automation

- Node.js – Runtime environment

- Gmail API – Accessing emails programmatically

- OAuth 2.0 Playground – To generate Gmail API tokens

- JSON – For storing user data




## Run Tests
# Run all Test
`npx playwright test`
# For Single test
`npx playwright test "./tests/1_UserRegistration.spec.js"`
