import { expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

const Gmail_URL = process.env.Gmail_URL || "https://gmail.googleapis.com/gmail/v1/users/me/messages";

/* ---------------------------
   Helper: REST (OAuth 2.0)
   --------------------------- */
async function fetchMessagesViaRest(request, token) {
  const res = await request.get(Gmail_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Gmail REST fetch failed (${res.status()}): ${text}`);
  }

  return res.json();
}

async function fetchMessageByIdViaRest(request, token, messageId) {
  const res = await request.get(`${Gmail_URL}/${messageId}?format=full`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Gmail REST message fetch failed (${res.status()}): ${text}`);
  }

  return res.json();
}

/* ---------------------------
   Helper: IMAP (App Password)
   --------------------------- */
async function fetchLatestMessageViaImap() {
  const imaps = await import("imap-simple");
  const { simpleParser } = await import("mailparser");

  const config = {
    imap: {
      user: process.env.GMAIL_EMAIL,
      password: process.env.GMAIL_APP_PASSWORD,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      authTimeout: 30000,
    },
  };

  const connection = await imaps.connect(config);
  try {
    await connection.openBox("INBOX");
    const searchCriteria = ["ALL"];
    const fetchOptions = { bodies: [""], markSeen: false };

    const results = await connection.search(searchCriteria, fetchOptions);
    if (!results || results.length === 0) {
      throw new Error("No emails found (IMAP).");
    }

    const latest = results[results.length - 1];
    const raw = latest["parts"].find(part => part.which === "") || latest;
    const parsed = await simpleParser(raw.body || raw);

    const subject = parsed.subject || "";
    const body = parsed.text || (parsed.html ? parsed.html.replace(/<[^>]+>/g, "") : "");
    const linkMatch = (body || "").match(/https?:\/\/[^\s'"]+/);
    const link = linkMatch ? linkMatch[0] : null;

    return { subject, body, link };
  } finally {
    connection.end();
  }
}

/* ---------------------------
   Core: getLatestEmailDetails
   --------------------------- */
export async function getLatestEmailDetails(request, method = "oauth") {
  if (method === "appPassword") {
    return fetchLatestMessageViaImap();
  }

  // OAuth 2.0 flow
  const token = process.env.OAUTH_TOKEN;
  if (!token) throw new Error("OAUTH_TOKEN not set in .env");

  const listJson = await fetchMessagesViaRest(request, token);
  if (!listJson.messages || listJson.messages.length === 0) {
    throw new Error("No emails found");
  }

  const latestEmailId = listJson.messages[0].id;
  const messageJson = await fetchMessageByIdViaRest(request, token, latestEmailId);

  const subjectHeader = (messageJson.payload?.headers || []).find(
    (header) => header.name.toLowerCase() === "subject"
  );
  const subject = subjectHeader?.value || "";

  let body = "";
  function decodeBase64Url(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return Buffer.from(str, "base64").toString("utf-8");
  }

  if (messageJson.payload?.parts && messageJson.payload.parts.length > 0) {
    const textPart = messageJson.payload.parts.find(part => part.mimeType === "text/plain");
    if (textPart?.body?.data) body = decodeBase64Url(textPart.body.data);
  }

  if (!body) body = messageJson.snippet || "";

  const linkMatch = body.match(/https?:\/\/[^\s'"]+/);
  const link = linkMatch ? linkMatch[0] : null;

  return { subject, body, link };
}

/* ---------------------------
   Assertion Helpers
   --------------------------- */
export async function assertLatestEmailSubject(request, expectedSubject, method = "oauth", timeoutMs = 30000) {
  const intervalMs = 2000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { subject, body } = await getLatestEmailDetails(request, method);
      if (subject.includes(expectedSubject)) {
        console.log("Email subject:", subject);
        console.log("Email body:", body?.slice?.(0, 200) || "(body omitted)");
        expect(subject).toContain(expectedSubject);
        return;
      }
    } catch (err) {
      if (!/No emails found/.test(err.message)) throw err;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`Email with subject containing "${expectedSubject}" not received within ${Math.round(timeoutMs / 1000)}s`);
}

export async function getResetPasswordLink(request, expectedSubject, method = "oauth", timeoutMs = 30000) {
  const intervalMs = 2000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const { subject, body, link } = await getLatestEmailDetails(request, method);
      if (subject.includes(expectedSubject) && link) {
        console.log("✅ Reset email subject:", subject);
        console.log("✅ Reset link:", link);
        return link;
      }
    } catch (err) {
      if (!/No emails found/.test(err.message)) throw err;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`Password Reset Request "${expectedSubject}" not received within ${Math.round(timeoutMs / 1000)}s`);
}
