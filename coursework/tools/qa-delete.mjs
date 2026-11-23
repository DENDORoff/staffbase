import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

// .env.local лежит в корне репозитория: coursework/tools/qa-delete.mjs → ../../.env.local
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", ".env.local");
const env = readFileSync(envPath, "utf8");
const url = env.match(/DATABASE_URL=(.*)/)[1].trim();
const sql = neon(url);

const rows = await sql`SELECT id, email, status, created_at FROM data_deletion_requests ORDER BY id`;
console.log("rows:", JSON.stringify(rows));
const del = await sql`DELETE FROM data_deletion_requests WHERE email = 'qa-delete@staffbase.kz' RETURNING id`;
console.log("deleted:", JSON.stringify(del));
process.exit(0);
