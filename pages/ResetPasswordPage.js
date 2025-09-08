class ResetPasswordPage {
    constructor(page) {
        this.page = page;
        this.resetPasswordLink = page.getByRole("link", { name: "Reset it here" });
        this.emailTxt = page.getByRole("textbox", { name: "Email" });
        this.resetBtn = page.getByRole("button", { name: "SEND RESET LINK" });
        this.newPassBtn = page.getByRole("textbox", { name: "New Password" });
        this.confirmPassBtn = page.getByRole("textbox", { name: "Confirm Password" });
        this.resetPassBtn = page.getByRole("button", { name: "RESET PASSWORD" });
    }

    async requestReset(email) {
        await this.resetPasswordLink.click();
        await this.emailTxt.fill(email);
        await this.resetBtn.click();
    }

    async setNewPassword(newPassword) {
        await this.newPassBtn.fill(newPassword);
        await this.confirmPassBtn.fill(newPassword);
        await this.resetPassBtn.click();
    }
}

export { ResetPasswordPage };
