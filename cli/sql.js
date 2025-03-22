import postgres from "https://deno.land/x/postgresjs/mod.js";

let user, password, db;

user = prompt("psql username:");
password = prompt("psql password:");
db = prompt("psql db:");

export const sql = postgres(
  `postgres://${user}:${password}@pgserver.mau.se:5432/${db}`,
);
