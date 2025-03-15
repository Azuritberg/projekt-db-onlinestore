import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { sendRes, generateToken } from "./util.js";

export class API {
  constructor(psql) {
    this.psql = psql;
  }

  async login(data) {
    const user = await this.psql`
SELECT customer_mail_address, customer_password FROM Customer WHERE customer_mail_address = ${data.email};
`;
    if (!(await bcrypt.compare(data.password, user["customer_password"]))) {
      return sendRes(401, { error: "Invalid credentials" });
    }

    const token = generateToken();
    await this
      .psql`INSERT INTO Customer_Token VALUES (user['customer_mail_address'], token)`;
    return sendRes(200, { token });
  }

  async register(data) {
    const r = await this.psql`
SELECT count(customer_mail_address) FROM Customer WHERE customer_mail_address = ${data.email};
`;
    if (r.length) {
      return sendRes(400, {
        error: `User with that e-mail already exists`,
      });
    }

    try {
      await this
        .psql`INSERT INTO Customer VALUES (${data.email}, ${await bcrypt.hash(data.password)}, ${data.fName}, ${data.lName}, ${data.address}, ${data.city}, ${data.country}, ${data.phoneNumber})`;
    } catch (err) {
      console.error(err);
      return sendRes(500, {
        message: "Internal server error",
      });
    }

    return sendRes(200, { message: "OK" });
  }

  async logout(token) {
    const r = await this
      .psql`DELETE FROM Customer_Token WHERE customer_token = ${token}`;

    if (!r.count) {
      return sendRes(500, { error: "Internal server error" });
    }

    return sendRes(200, { message: "OK" });
  }
}
