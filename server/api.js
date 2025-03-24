import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { sendRes, generateToken, splitPath } from "./util.js";

export class API {
  constructor(psql) {
    this.psql = psql;
  }

  async validToken(token) {
    const r = await this
      .psql`SELECT count(*) FROM Customer_Token WHERE customer_token = ${token}`;

    return r.length ? true : false;
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

  async get(path) {
    const _path = splitPath(path);
    const endpoint = _path[0];
    const len = _path.length;
    const parametersExist = endpoint.indexOf("?") === -1 ? false : true;

    switch (endpoint) {
      case "products":
        if (len > 1 && _path[1]) {
          const pNum = _path[1];
          // Return product according to product number
        }

        if (len === 1) {
          if (parametersExist) {
            // Return filtered search results
          }
          // Return all products
        }

      case "orders":
        if (len > 1) {
          const action = _path[1];
          if (action === "all") {
            // Return all orders
          }

          if (action === "unconfirmed") {
            // Return unconfirmed orders
          }

          if (action === "confirmed") {
          }
        }
    }
  }

  async post(path, data) {
    const _path = splitPath(path);
    const endpoint = _path[0];
    const len = _path.length;
  }

  async patch(path, data) {
    const _path = splitPath(path);
  }

  async put(path, data) {
    const _path = splitPath(path);
  }

  async delete(path, data) {
    const _path = splitPath(path);
  }
}
