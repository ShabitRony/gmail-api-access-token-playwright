# 📌 Playwright Automation – User Registration, Gmail Validation & Reset Password

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
- Visit OAuth 2.0 Playground
- On the left side, scroll down or search Gmail API v1

- Check ✅ https://www.googleapis.com/auth/gmail.readonly

- This gives your app read-only access to emails.

- Click Authorize APIs.

- Sign in with your Gmail account and allow access.

## Configure Environment Variabless

- Create a .env file in the project root and add:

```GMAIL_API_URL=https://gmail.googleapis.com/gmail/v1/users/me/messages```

```GMAIL_API_TOKEN=<your-oauth2-token>```

```APP_BASE_URL=<your-application-url>```

```DELETE_USER_API=<delete-user-api-endpoint>```

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
│   ├── registration.spec.js
│   ├── resetPassword.spec.js
│   └── deleteUser.spec.js
│

│── 📂 utils                  # Utility/helper functions
│   ├── gmailUtils.js
│   ├── userUtils.js
│   ├── toastUtils.js
│   ├── generateRandomUser.js
│   └── registrationHelper.js
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
