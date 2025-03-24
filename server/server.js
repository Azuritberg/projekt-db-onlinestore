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
    const path = new URL(req.url).pathname;

    if (method === "GET" && path === "/") {
      return await serveDir(req, { fsRoot: "./../public" });
    }

    if (!validateJsonReq(req)) {
      return sendRes(400, { error: `${method} requests must be JSON.` });
    }

    const data = await req.json();

    if (method === "POST" && path === "/login") {
      if (!hasKeys(data, ["email", "password"])) {
        return sendRes(400, {
          error: `${method} requests to this endpoint must contain user credentials`,
        });
      }

      return await this.api.login(data);
    } else if (method === "POST" && path === "/register") {
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

      // All requests following has to be made with authorisation by token header
      // Server assumes you're logged in at this point
      const token = headers["autorization"].split(" ")[1]; // Assuming "Bearer TOKEN"
      if (!(await this.api.validToken(token))) {
        return sendRes(400, { error: "Invalid token" });
      }

      if (path === "/logout") {
        return await this.api.logout(token);
      }

      switch (method) {
        case "GET":
          return await this.api.get(path);
        case "POST":
          return await this.api.post(path);
        case "PATCH":
          return await this.api.patch(path);
        case "PUT":
          return await this.api.put(path);
        case "DELETE":
          return await this.api.delete(path);
        default:
          break;
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
