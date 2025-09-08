// utils/toastUtils.js

import { expect } from "@playwright/test";

/**
 * Waits for any toast message to appear and returns its text.
 * @param {import('@playwright/test').Page} page
 * @param {Object} options
 * @param {string} options.selector - CSS selector to match toast container. Default matches common toast libraries.
 * @param {number} options.timeout - Maximum wait time in ms. Default 5000.
 * @returns {Promise<string>} - Text content of the toast
 */
export async function waitForToast(page, options = {}) {
  const selector = options.selector || '[class*="toast"], [class*="Toastify__toast"]';
  const timeout = options.timeout || 5000;

  const toast = page.locator(selector);
  await toast.first().waitFor({ timeout });
  const text = await toast.first().textContent();
  
  
  console.log("Toast message:", text?.trim() || "(empty)");
  return text?.trim() || "";
}

/**
 * Assert that a toast contains specific text
 */
export async function expectToastToContain(page, expectedText, options = {}) {
  const text = await waitForToast(page, options);
  expect(text).toContain(expectedText);
}
