#!/usr/bin/env node
/**
 * Apply a single migration file to the Supabase Postgres instance.
 *
 * Unlike scripts/run-schema.mjs (which re-runs the whole schema.sql and
 * errors on the `create type` enum lines), this runs one idempotent
 * migration file so you can layer changes onto an existing database.
 *
 * Uses POSTGRES_URL_NON_POOLING (direct connection) — DDL + multi-statement
 * scripts misbehave through pgbouncer.
 *
 * Run with:
 *   node --env-file=.env.local scripts/run-migration.mjs supabase/migrations/<file>.sql
 *
 * The file should be written to be safe to re-run (ADD COLUMN IF NOT EXISTS,
 * INSERT ... ON CONFLICT, DROP POLICY IF EXISTS + CREATE POLICY, etc.).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("✗ Usage: node --env-file=.env.local scripts/run-migration.mjs <path-to-migration.sql>");
  process.exit(1);
}

const migrationPath = resolve(process.cwd(), fileArg);

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error("✗ Missing POSTGRES_URL_NON_POOLING. Run `npx vercel env pull .env.local` first.");
  process.exit(1);
}

let sql;
try {
  sql = readFileSync(migrationPath, "utf8");
} catch (err) {
  console.error(`✗ Could not read migration file ${migrationPath}: ${err.message}`);
  process.exit(1);
}

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
  console.log(`→ Applying ${migrationPath} (${sql.length} bytes)…`);
  // Wrap in a transaction so a partial failure rolls back cleanly.
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`✓ Migration applied successfully`);
} catch (err) {
  try {
    await client.query("rollback");
  } catch {
    /* ignore rollback errors */
  }
  console.error(`✗ Migration failed (rolled back):`, err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
