import { neon } from "@neondatabase/serverless";

type Row = Record<string, any>;

export interface SqlClient {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]>;
  query(text: string, params?: unknown[]): Promise<Row[]>;
}

let client: SqlClient | null = null;

function getClient(): SqlClient {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill in the value.");
  }
  const raw = neon(url) as unknown as SqlClient;
  client = raw;
  return client;
}

function tag(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> {
  return getClient()(strings, ...values);
}

/**
 * Серверный SQL-клиент (Neon, HTTP, одноразовые запросы без открытых соединений).
 * Инициализируется лениво при первом обращении, чтобы сборка на Vercel не требовала DATABASE_URL.
 */
export const sql: SqlClient = Object.assign(tag, {
  query: (text: string, params: unknown[] = []) => getClient().query(text, params),
});
