import postgres from "https://deno.land/x/postgresjs/mod.js";
import { serveDir, serveFile } from "jsr:@std/http/file-server";

export default class Server {
  constructor() {
    this.psql = null;
  }

  async start() {
    let user,
      password,
      db = "";

    user = prompt("psql username:");
    password = prompt("psql password:");
    db = prompt("psql db:");

    this.psql = postgres(
      `postgres://${user}:${password}@pgserver.mau.se:5432/${db}`,
    );

    Deno.serve({ hostname: "localhost", port: 8888 }, this._serve.bind(this));
    //await this._listenForInput();
  }

  async _serve(req) {
    const url = new URL(req.url);
    const { pathname, method, searchParams, headers, body } = req;
    return await serveDir(req, { fsRoot: "./../public" });
  }

  async _listenForInput() {
    while (true) {
      const input = prompt(">");
      switch (input) {
        case "hello":
          console.log("Hello!");
          break;

        case "suppliers":
          console.log(await this.psql`SELECT * FROM supplier`);
          break;

        case "exit":
          this.psql.end();
          Deno.exit();
          break;

        default:
          break;
      }
    }
  }
}
