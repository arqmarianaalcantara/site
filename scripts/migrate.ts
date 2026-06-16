/**
 * Aplica migrations 001 e 002 contra um Supabase cloud.
 * Tenta vários hostnames de connection pooler até achar um que funcione.
 *
 * Uso:
 *   tsx scripts/migrate.ts
 *
 * Variáveis necessárias (em .env.local):
 *   SUPABASE_DB_URL  (preferencial)
 *   ou
 *   SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD
 */

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

config({ path: ".env.local" });
config();

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ??
  (() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    return m?.[1] ?? "";
  })();
const PASSWORD = process.env.SUPABASE_DB_PASSWORD ?? "";

if (!PROJECT_REF || !PASSWORD) {
  console.error("Faltam variáveis: defina SUPABASE_DB_PASSWORD no .env.local");
  process.exit(1);
}

const REGIONS = [
  "sa-east-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "eu-north-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "ca-central-1",
];

async function tryConnect() {
  const prefixes = ["aws-0", "aws-1"];
  for (const region of REGIONS) {
    for (const prefix of prefixes) {
      const host = `${prefix}-${region}.pooler.supabase.com`;
      const client = new Client({
        host,
        port: 6543,
        database: "postgres",
        user: `postgres.${PROJECT_REF}`,
        password: PASSWORD,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 6000,
      });
      process.stdout.write(`tentando ${prefix} ${region}... `);
      try {
        await client.connect();
        console.log("OK");
        return client;
      } catch (err) {
        const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
        console.log("falhou (" + msg.slice(0, 60) + ")");
        try {
          await client.end();
        } catch {
          /* ignore */
        }
      }
    }
  }
  throw new Error("Não consegui conectar em nenhuma região do pooler Supabase.");
}

async function runSql(client: Client, file: string) {
  const path = join("supabase", "migrations", file);
  const sql = readFileSync(path, "utf-8");
  console.log(`\n→ ${file}`);
  await client.query(sql);
  console.log(`  ✓ aplicado`);
}

async function main() {
  console.log(`Migrating cloud: ${PROJECT_REF}.supabase.co\n`);
  const client = await tryConnect();
  try {
    await runSql(client, "001_init.sql");
    await runSql(client, "002_storage.sql");
    console.log("\n✓ Migrations concluídas.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
