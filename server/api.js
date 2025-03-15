import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { sendRes, hasKeys, generateToken } from "./util.js";

export class API {
  constructor(psql) {
    this.psql = psql;
  }

  async login(data) {
    if (!hasKeys(data, ["email", "password"])) {
      return sendRes(400, {
        error: `${req.method} requests to this endpoint must contain user credentials`,
      });
    }

    const user = await this.psql`
SELECT customer_mail_address, customer_password FROM Customer WHERE customer_mail_address = ${data.email};
`;
    if (!(await bcrypt.compare(data.password, user["customer_password"]))) {
      return sendRes(401, { error: "Invalid credentials" });
    }

    const token = generateToken();
    // TODO: IMPLEMENT THIS
    await this
      .psql`INSERT INTO Customer_Token VALUES (user['customer_mail_address'], token)`;
    sendRes(200, { token });
  }

  async register(data) {
    if (!hasKeys(data, ["email", "password"])) {
      return sendRes(400, {
        error: `${req.method} requests to this endpoint must contain user credentials`,
      });
    }

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
}
