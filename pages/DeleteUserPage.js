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
  console.log(`Deleting user: ${userId}`);

  const res = await this.request.delete(deleteUrl, {
    headers: this.defaultHeaders,
  });

  // Assert HTTP status code
  const status = res.status();
  console.log(`📡 Status code: ${status}`);
  expect(status, `Expected HTTP 200 but got ${status}`).toBe(200);

  // Assert URL matches
  expect(res.url()).toBe(deleteUrl);
  console.log(`URL matches: ${res.url()}`);
  

  // Assert response body
  const body = await res.json();
  expect(body.message).toContain("User deleted successfully");

  console.log("   Delete successful:", body);
  return body;
}
}
