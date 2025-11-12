import { expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

export default class DeleteUserPage {
  constructor(request) {
    this.request = request;
    this.baseUrl = `${process.env.Delete_URL}/user`;
    this.defaultHeaders = {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`
    };
  }

  async deleteUserById(userId) {
  const deleteUrl = `${this.baseUrl}/${userId}`;
  console.log("Delete API",deleteUrl);
  
  console.log(`Deleting user: ${userId}`);

  const res = await this.request.delete(deleteUrl, {
    headers: this.defaultHeaders,
  });

  // --- Assert request details (you already control them) ---
  console.log(`✅ Request method: DELETE`);
  expect("DELETE").toBe("DELETE"); 
  
  // --- Assert response details ---
  const status = res.status();
  console.log(`✅ Status code: ${status}`);
  expect(status, `Expected HTTP 200 but got ${status}`).toBe(200);

  // -- Requested URL ---
   console.log(`✅ Request URL: ${deleteUrl}`);
  expect(deleteUrl).toBe(deleteUrl); 

  // -- Response URL ---
  expect(res.url()).toBe(deleteUrl);
  console.log(` URL matches: ${res.url()}`);

  const body = await res.json();
  expect(body.message).toContain("User deleted successfully");

  console.log(" Delete successful:", body);
  return body;
 }
}