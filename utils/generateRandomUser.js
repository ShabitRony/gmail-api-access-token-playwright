import { faker } from "@faker-js/faker";
// import { generateRandomId } from "./randomNumber.js";
import {RegistrationPage} from "../pages/RegistrationPage.js";

export function generateRandomUser() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: `shabitalahi123+regtest${Date.now()}@gmail.com`,
    password: "12345",
    phoneNumber: `014${generateRandomId(10000000, 99999999)}`,
    address: faker.location.city()
  };
}

const generateRandomId =(min,max)=>{
    let randomId = Math.random()*(max-min)+min;
    return parseInt(randomId);
}
