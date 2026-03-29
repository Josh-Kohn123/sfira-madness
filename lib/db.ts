import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export async function queryOne<T>(
  sql: TemplateStringsArray,
  ...params: unknown[]
): Promise<T | null> {
  const db = getDb();
  const rows = await db(sql, ...params);
  return (rows[0] as T) ?? null;
}

export async function queryMany<T>(
  sql: TemplateStringsArray,
  ...params: unknown[]
): Promise<T[]> {
  const db = getDb();
  const rows = await db(sql, ...params);
  return rows as T[];
}
