// utils/gmailUtils.js
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import Imap from "imap";
import { simpleParser } from "mailparser";
import fs from "fs";
import path from "path";
import { google } from "googleapis";

dotenv.config();

const TOKEN_PATH = path.join(process.cwd(), "token.json");

// ---------- helpers ----------
function extractOtp(text) {
  if (!text) return null;
  const m = text.match(/\b\d{6}\b/);
  return m ? m[0] : null;
}

function decodeBase64WebSafe(data) {
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf-8");
}

function firstLinkFromHtml(html) {
  if (!html) return { link: null, buttonName: null };
  const dom = new JSDOM(html);
  const a = dom.window.document.querySelector("a");
  return {
    link: a ? a.href : null,
    buttonName: a ? a.textContent.trim() : null,
  };
}

function firstLinkFromText(text) {
  const m = text?.match(/https?:\/\/[^\s]+/);
  return m ? m[0] : null;
}

// ---------- METHOD 1: API token (Playwright request) ----------
async function fetchEmailUsingApi(request) {
  const baseURL = process.env.Gmail_URL;           // e.g. https://gmail.googleapis.com/gmail/v1/users/me/messages/
  const token   = process.env.GMAIL_API_TOKEN;

  const res1 = await request.get(`${baseURL}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const data = await res1.json();
  if (!data.messages?.length) throw new Error("No emails found");

  const latestId = data.messages[0].id;
  const res2 = await request.get(`${baseURL}${latestId}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const emailData = await res2.json();

  // Subject
  const subject =
    emailData.payload.headers.find(
      (h) => h.name.toLowerCase() === "subject"
    )?.value || "";

  // Body (prefer text/plain, fallback snippet)
  let body = "";
  let htmlBody = "";

  if (emailData.payload.parts?.length) {
    for (const part of emailData.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        htmlBody = decodeBase64WebSafe(part.body.data);
      }
      if (part.mimeType === "text/plain" && part.body?.data) {
        body = decodeBase64WebSafe(part.body.data);
      }
    }
  } else if (emailData.payload.body?.data) {
    // single part
    body = decodeBase64WebSafe(emailData.payload.body.data);
  }

  if (!body) body = emailData.snippet || "";

  // Link + button
  let { link, buttonName } = firstLinkFromHtml(htmlBody);
  if (!link) link = firstLinkFromText(body);

  const otp = extractOtp(body || htmlBody);

  // ⚠️ no throw if link is missing – you can still use subject/body-only emails
  return { subject, body, link, buttonName, otp };
}

// ---------- METHOD 2: App Password (IMAP) ----------
async function fetchEmailUsingAppPassword() {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.GMAIL_EMAIL,
      password: process.env.GMAIL_APP_PASSWORD,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const openInbox = (cb) => imap.openBox("INBOX", true, cb);

    imap.once("ready", () => {
      openInbox((err, box) => {
        if (err) return reject(err);

        const fetch = imap.seq.fetch(
          `${box.messages.total}:*`,
          { bodies: "", markSeen: false }
        );

        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err2, parsed) => {
              if (err2) return reject(err2);

              const subject  = parsed.subject || "";
              const body     = parsed.text || "";
              const htmlBody = parsed.html || "";

              let { link, buttonName } = firstLinkFromHtml(htmlBody);
              if (!link) link = firstLinkFromText(body);

              const otp = extractOtp(body || htmlBody);

              resolve({ subject, body, link, buttonName, otp });
              imap.end();
            });
          });
        });

        fetch.once("error", (e) => reject(e));
      });
    });

    imap.once("error", (e) => reject(e));
    imap.connect();
  });
}

// ---------- METHOD 3: OAuth Client (googleapis) ----------
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

async function authorize() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    oAuth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      }
    });
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });

  throw new Error(
    `No token found. Authorize the app first:\n${authUrl}\nThen call saveToken(code).`
  );
}

export async function saveToken(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  return oAuth2Client;
}

async function fetchEmailUsingOAuth() {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const res1 = await gmail.users.messages.list({ userId: "me", maxResults: 1 });
  if (!res1.data.messages?.length) throw new Error("No emails found");

  const id = res1.data.messages[0].id;
  const res2 = await gmail.users.messages.get({ userId: "me", id });
  const emailData = res2.data;

  const subject =
    emailData.payload.headers.find(
      (h) => h.name.toLowerCase() === "subject"
    )?.value || "";

  let body = "";
  let htmlBody = "";

  if (emailData.payload.parts?.length) {
    for (const part of emailData.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        htmlBody = decodeBase64WebSafe(part.body.data);
      }
      if (part.mimeType === "text/plain" && part.body?.data) {
        body = decodeBase64WebSafe(part.body.data);
      }
    }
  } else if (emailData.payload.body?.data) {
    body = decodeBase64WebSafe(emailData.payload.body.data);
  }

  if (!body) body = emailData.snippet || "";

  let { link, buttonName } = firstLinkFromHtml(htmlBody);
  if (!link) link = firstLinkFromText(body);

  const otp = extractOtp(body || htmlBody);
  return { subject, body, link, buttonName, otp };
}

// ---------- Unified entry ----------
/**
 * @param {"APP_PASSWORD"|"API"|"OAUTH"} method
 * @param {import('@playwright/test').APIRequestContext} [request] required for "API"
 * @returns {Promise<{subject:string, body:string, link:string|null, buttonName:string|null, otp:string|null}>}
 */
export async function getLatestEmailDetailsUnified(
  { method = "APP_PASSWORD", request } = {}
) {
  if (method === "API") {
    if (!request) throw new Error("APIRequestContext is required for API method");
    return fetchEmailUsingApi(request);
  }
  if (method === "OAUTH") {
    return fetchEmailUsingOAuth();
  }
  // default: app password
  return fetchEmailUsingAppPassword();
}

// ---------- Subject-based helpers (like your old util) ----------

/**
 * Poll until an email arrives whose subject contains expectedSubject.
 * Works with any method (API / APP_PASSWORD / OAUTH).
 */
export async function waitForEmailSubjectUnified({
  method = "APP_PASSWORD",
  request,
  expectedSubject,
  timeoutMs = 30000,
  intervalMs = 2000,
} = {}) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { subject, body, link, buttonName, otp } =
        await getLatestEmailDetailsUnified({ method, request });

      if (subject && subject.includes(expectedSubject)) {
        console.log("Email subject:", subject);
        console.log("Email body:", body?.slice?.(0, 200) || "(body omitted)");
        return { subject, body, link, buttonName, otp };
      }
    } catch (err) {
      // same behavior as your old code: ignore "No emails found" only
      if (!String(err.message || "").includes("No emails found")) {
        throw err;
      }
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `Email with subject containing "${expectedSubject}" not received within ${
      timeoutMs / 1000
    }s`
  );
}

/**
 * Wait for an email with expectedSubject AND a link present.
 * Equivalent of your old getResetPasswordLink() but works for all methods.
 */
export async function getResetPasswordLinkUnified({
  method = "APP_PASSWORD",
  request,
  expectedSubject,
  timeoutMs = 30000,
  intervalMs = 2000,
} = {}) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { subject, body, link } =
        await getLatestEmailDetailsUnified({ method, request });

      if (subject && subject.includes(expectedSubject) && link) {
        console.log("✅ Email subject:", subject);
        console.log("✅ Link:", link);
        return link;
      }
    } catch (err) {
      if (!String(err.message || "").includes("No emails found")) {
        throw err;
      }
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `Email with subject "${expectedSubject}" and link not received within ${
      timeoutMs / 1000
    }s`
  );
}
