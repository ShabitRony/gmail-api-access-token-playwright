import { expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

const Gmail_URL = process.env.Gmail_URL;
const token = process.env.GMAIL_API_TOKEN;

/**
 * Fetch the latest Gmail email's subject, body text, and first link (if any).
 * Works for both Registration & Reset Password tests.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright API request context
 * @returns {Promise<{subject: string, body: string, link: string | null}>}
 */
export async function getLatestEmailDetails(request) {
  //Get list of messages
  const res1 = await request.get(`${Gmail_URL}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res1.json();
  if (!data.messages || data.messages.length === 0) {
    throw new Error("No emails found");
  }

  //Fetch latest email details
  const latestEmailId = data.messages[0].id;
  const res2 = await request.get(`${Gmail_URL}${latestEmailId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const emailData = await res2.json();

  //Extract Subject
  const subjectHeader = emailData.payload.headers.find(
    (header) => header.name.toLowerCase() === "subject"
  );
  const subject = subjectHeader?.value || "";

  //Extract Body (from parts if available, else snippet)
  let body = "";
  if (emailData.payload.parts && emailData.payload.parts.length > 0) {
    const textPart = emailData.payload.parts.find(
      (part) => part.mimeType === "text/plain"
    );
    if (textPart && textPart.body && textPart.body.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  }
  if (!body) {
    body = emailData.snippet || "";
  }

  //Extract first link
  const linkMatch = body.match(/https?:\/\/[^\s]+/);
  const link = linkMatch ? linkMatch[0] : null;

  return { subject, body, link };
}

/**
 * Assert the latest email contains the expected subject.
 * Waits/polls until the email arrives (default 30s, check every 2s).
 * @param {import('@playwright/test').APIRequestContext} request 
 * @param {string} expectedSubject 
 */
export async function assertLatestEmailSubject(request, expectedSubject) {
  const timeoutMs = 30000; // 30 seconds
  const intervalMs = 2000; // retry every 2 seconds
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { subject, body } = await getLatestEmailDetails(request);

      if (subject.includes(expectedSubject)) {
        console.log("Email subject:", subject);
        console.log("Email body:", body?.slice?.(0, 200) || "(body omitted)");
        expect(subject).toContain(expectedSubject);
        return;
      }
    } catch (err) {
      if (!err.message.includes("No emails found")) throw err;
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`Email with subject containing "${expectedSubject}" not received within ${timeoutMs / 1000}s`);
}
