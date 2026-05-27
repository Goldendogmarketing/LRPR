#!/usr/bin/env node
/**
 * Apply supabase/schema.sql to the Supabase Postgres instance.
 *
 * Uses POSTGRES_URL_NON_POOLING (direct connection) instead of the pooled URL
 * because DDL statements + multi-statement scripts can misbehave through pgbouncer.
 *
 * Run with:
 *   node --env-file=.env.local scripts/run-schema.mjs
 *
 * Or via npm:
 *   npm run db:migrate
 *
 * Safe to re-run for new `create table if not exists` statements, but the
 * `create type` lines will error on re-run. To reset, drop the types/tables
 * manually in Supabase SQL editor first or migrate to versioned migrations.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "supabase", "schema.sql");

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error(
    "✗ Missing POSTGRES_URL_NON_POOLING. Run `npx vercel env pull .env.local` first.",
  );
  process.exit(1);
}

const sql = readFileSync(schemaPath, "utf8");

// Parse the connection URL manually so we can override SSL behavior cleanly.
// Recent pg/pg-connection-string treats sslmode=require as verify-full, which
// rejects Supabase's pooler certificate chain. We need encryption WITHOUT
// strict cert verification.
const url = new URL(connectionString);
const client = new Client({
  host: url.hostname,
  port: Number(url.port || 5432),
  database: url.pathname.replace(/^\//, ""),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`→ Connected to Postgres`);
  console.log(`→ Applying ${schemaPath} (${sql.length} bytes)…`);
  await client.query(sql);
  console.log(`✓ Schema applied successfully`);

  // Sanity-check: list tables in public schema.
  const { rows } = await client.query(
    `select table_name from information_schema.tables
       where table_schema = 'public' and table_type = 'BASE TABLE'
       order by table_name;`,
  );
  console.log(`✓ Tables in public schema (${rows.length}):`);
  for (const r of rows) {
    console.log(`    • ${r.table_name}`);
  }
} catch (err) {
  console.error(`✗ Schema apply failed:`, err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
