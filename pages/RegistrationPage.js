import { generateRandomUser } from "../utils/generateRandomUser";
class RegistrationPage{

    constructor(page) {

        this.page=page;

        this.registrationLink = page.getByRole("link",{name:"register"});
        this.firstNameTxt = page.getByRole("textbox",{name : "First Name"})
        this.lastNameTxt = page.getByRole("textbox",{name : "Last Name"})
        this.emailTxt = page.getByRole("textbox",{name : "Email"})
        this.passwordTxt = page.getByRole("textbox",{name : "Password"})
        this.phoneNumberTxt = page.getByRole("textbox",{name : "Phone Number"})
        this.addressTxt = page.getByRole("textbox",{name : "Address"})
        this.genderRadioBtn = page.getByRole("radio");
        this.terms = page.getByRole("checkbox")
        this.registerBtn = page.getByRole("button",{name:"REGISTER"})
    }

    async registerUser(userModel){
        await this.registrationLink.click();
        await this.firstNameTxt.fill(userModel.firstName);
        await this.lastNameTxt.fill(userModel.lastName);
        await this.emailTxt.fill(userModel.email);
        await this.passwordTxt.fill(userModel.password);
        await this.phoneNumberTxt.fill(userModel.phoneNumber);
        await this.addressTxt.fill(userModel.address);
        await this.genderRadioBtn.first().click();
        await this.terms.click();
        await this.registerBtn.click();

        
    }
}
export default RegistrationPage;