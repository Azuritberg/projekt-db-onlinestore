import postgres from "https://deno.land/x/postgresjs/mod.js";
import { views } from "./views.js";
import { Session } from "./session.js";
import { print } from "./utils.js";

function initSQL() {
  //const ch = prompt("sql-less mode? (y/n)");
  //if (ch === "y") {
  //  return null;
  //}

  let user, password, db;

  user = prompt("psql username:");
  password = prompt("psql password:");
  db = prompt("psql db:");

  return postgres(`postgres://${user}:${password}@pgserver.mau.se:5432/${db}`);
}

async function main() {
  let currentView = "start";
  let data = null;

  while (true) {
    console.clear();
    print("Online Store", "h1");
    await views[currentView](
      session,
      (nextView, nextData = null) => {
        currentView = nextView;
        data = nextData;
      },
      data,
    );
  }
}

export const sql = initSQL();
const session = new Session();
main();
