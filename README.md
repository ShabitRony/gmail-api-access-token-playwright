📌 Playwright Automation – User Registration, Gmail Validation & Reset Password

This project automates end-to-end user flows using Playwright.
It covers user registration, Gmail validation (via OAuth 2.0 Gmail API), reset password flow, and user deletion with API calls.

🚀 Features Automated
✅ User Registration

Automates new user registration on the application.

Verifies congratulations toast message.

Fetches registration validation mail from Gmail using Gmail API.

Stores registered user information in JSON format.

🔑 Reset Password

Automates Forgot Password flow.

Accesses reset password link from Gmail (OAuth 2.0 Gmail API).

Validates the reset process.

🗑️ User Deletion

Calls the Delete User API.

Validates successful deletion with response assertion.

🛠️ Tech Stack

Playwright – Browser automation

Node.js – Runtime environment

Gmail API – Accessing emails programmatically

OAuth 2.0 Playground – To generate Gmail API tokens

JSON – For storing user data

⚙️ Installation & Setup
1️⃣ Prerequisites

Node.js
 installed (v18+ recommended).

Gmail account with 2-Factor Authentication enabled.

A valid OAuth 2.0 token generated from Google OAuth Playground
.

2️⃣ Clone the Repository
git clone <your-repo-url>
cd <repo-folder>

3️⃣ Install Dependencies
npm install

4️⃣ Configure Environment Variables

Create a .env file in the project root and add:

GMAIL_API_URL=https://gmail.googleapis.com/gmail/v1/users/me/messages
GMAIL_API_TOKEN=<your-oauth2-token>
APP_BASE_URL=<your-application-url>
DELETE_USER_API=<delete-user-api-endpoint>


🔹 Replace placeholders with your actual values.

5️⃣ Run Tests
npx playwright test 