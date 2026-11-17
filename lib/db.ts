import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill in the value.");
}

/** Serverless SQL client (HTTP, одноразовые запросы без открытых соединений). */
export const sql = neon(url);
