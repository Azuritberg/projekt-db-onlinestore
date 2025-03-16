import postgres from "https://deno.land/x/postgresjs/mod.js";
import { serveDir, serveFile } from "jsr:@std/http/file-server";
import { sendRes, validateJsonReq } from "./util.js";
import { API } from "./api.js";

export default class Server {
  constructor() {
    this.api = null;
  }

  async start() {
    let user, password, db;

    user = prompt("psql username:");
    password = prompt("psql password:");
    db = prompt("psql db:");

    const psql = postgres(
      `postgres://${user}:${password}@pgserver.mau.se:5432/${db}`,
    );

    this.api = new API(psql);
    Deno.serve({ hostname: "localhost", port: 8888 }, this._serve.bind(this));
    //await this._listenForInput();
  }

  async _serve(req) {
    console.log(req);
    const { method, headers } = req;
    if (method === "GET") {
      return await serveDir(req, { fsRoot: "./../public" });
    }

    if (!validateJsonReq(req)) {
      return sendRes(400, { error: `${method} requests must be JSON.` });
    }

    const data = await req.json();
    const path = new URL(req.url).pathname;

    if (path === "/login") {
      if (!hasKeys(data, ["email", "password"])) {
        return sendRes(400, {
          error: `${method} requests to this endpoint must contain user credentials`,
        });
      }

      return await this.api.login(data);
    } else if (path === "/register") {
      if (
        !hasKeys(data, [
          "email",
          "password",
          "fName",
          "lName",
          "address",
          "city",
          "country",
          "phoneNumber",
        ])
      ) {
        return sendRes(400, {
          error: `${method} requests to this endpoint must contain user credentials`,
        });
      }

      return await this.api.register(data);
    } else {
      if (!hasKeys(headers, "authorization")) {
        return sendRes(400, {
          error: `${method} requests to this endpoint must contain authorization header`,
        });
      }

      const token = headers["autorization"].split(" ")[1]; // Assuming "Bearer TOKEN"
      if (!(await this.api.validToken(token))) {
        return sendRes(400, { error: "Invalid token" });
      }

      // TODO: Implement endpoints
      // How do we deal with GET requests?
      switch (path) {
        case "/logout":
          return await this.api.logout(token);

        case "/suppliers":
          return await this.api.suppliers(method, data);

        case "/products":
          return await this.api.products(method, data);

        case "/orders":
          return await this.api.orders(method, data);

        case "/discounts":
          return await this.api.discounts(method, data);

        default:
          return sendRes(400, { error: "Bad request" });
      }
    }
  }

  async _listenForInput() {
    while (true) {
      const input = prompt(">");
      switch (input) {
        case "hello":
          console.log("Hello!");
          break;

        case "suppliers":
          break;

        case "exit":
          Deno.exit();
          break;

        default:
          break;
      }
    }
  }
}
