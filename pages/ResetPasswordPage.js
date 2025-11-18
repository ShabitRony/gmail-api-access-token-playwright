import { getResetPasswordLinkUnified } from "../utils/gmailUtils.js";
import { getLatestUser, updateLatestUserPassword } from "../utils/userUtils.js";
import { config } from "../config/testConfig.js";

class ResetPasswordPage {
    constructor(page,request) {
        this.page = page;
        this.request = request;
        this.resetPasswordLink = page.getByRole("link", { name: "Reset it here" });
        this.emailTxt = page.getByRole("textbox", { name: "Email" });
        this.resetBtn = page.getByRole("button", { name: "SEND RESET LINK" });
        this.newPassTxt = page.getByRole("textbox", { name: "New Password" });
        this.confirmPassTxt = page.getByRole("textbox", { name: "Confirm Password" });
        this.resetPassBtn = page.getByRole("button", { name: "RESET PASSWORD" });
    }

    async requestReset(email) {
        await this.resetPasswordLink.click();
        await this.emailTxt.fill(email);
        await this.resetBtn.click();
    }

    async setNewPassword(newPassword) {
        await this.newPassTxt.fill(newPassword);
        await this.confirmPassTxt.fill(newPassword);
        await this.resetPassBtn.click();
    }

    async resetLatestUserPassword() {
        const user = getLatestUser();  
        await this.page.goto(process.env.BASE_URL);

        // Request reset
        await this.requestReset(user.email);

        // Get reset link from email
        // const resetLink = await getResetPasswordLinkUnified(this.request, config.resetPasswordSubject);
        const resetLink = await getResetPasswordLinkUnified({
      method: "API",          //  "API" or "APP_PASSWORD"
      request: this.request,
      expectedSubject: config.resetPasswordSubject,
    });


        // Define new password
        const newPassword = "12345";

        // Complete reset flow
        await this.page.goto(resetLink);
        await this.setNewPassword(newPassword);

        // Update user data
        updateLatestUserPassword(newPassword);

        return user; 
    }
}

export { ResetPasswordPage };
