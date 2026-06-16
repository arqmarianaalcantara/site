/**
 * Configura o projeto na Vercel: lista, encontra o projeto "site",
 * seta env vars de produção e dispara um redeploy se necessário.
 */

import { config } from "dotenv";

config({ path: ".env.local" });
config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN ?? "";
const TEAM_SLUG = process.env.VERCEL_TEAM_SLUG ?? "";

if (!VERCEL_TOKEN) {
  console.error("Defina VERCEL_TOKEN no .env.local");
  process.exit(1);
}

const BASE = "https://api.vercel.com";

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  accountId: string;
  link?: { repo?: string; org?: string; type?: string };
}

interface ProjectsList {
  projects: VercelProject[];
}

async function api(path: string, init: RequestInit = {}): Promise<unknown> {
  const url = TEAM_SLUG && !path.includes("teamId=")
    ? `${BASE}${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM_SLUG}`
    : `${BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} on ${path}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function main() {
  console.log("Listando projetos Vercel...\n");
  const list = (await api("/v9/projects")) as ProjectsList;

  for (const p of list.projects) {
    console.log(
      `  ${p.id}  ${p.name.padEnd(28)}  ${(p.framework ?? "?").padEnd(12)}  repo=${p.link?.repo ?? "-"}  account=${p.accountId}`
    );
  }
  console.log();

  const target = list.projects.find(
    (p) => p.name === "site" || p.link?.repo === "site"
  );

  if (!target) {
    console.error('Não achei projeto chamado "site" nem repo vinculado a "site".');
    process.exit(1);
  }

  console.log(`Projeto alvo: ${target.id} (${target.name})\n`);
  return target;
}

const proj = await main();

// Guarda o accountId pra usar nas próximas chamadas
const ACCOUNT_ID = proj.accountId;
console.log(`Account ID: ${ACCOUNT_ID}\n`);

// Lista env vars existentes (decrypted=false só para nomes)
const existing = (await fetch(
  `${BASE}/v9/projects/${proj.id}/env?teamId=${ACCOUNT_ID}`,
  { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
).then((r) => r.json())) as { envs: { id: string; key: string; target: string[] }[] };

console.log("Env vars existentes:");
for (const e of existing.envs ?? []) {
  console.log(`  ${e.key} (${e.target.join(",")})`);
}

const ENV_VARS = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    value: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    type: "plain" as const,
    target: ["production", "preview", "development"],
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    type: "encrypted" as const,
    target: ["production", "preview", "development"],
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    value: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    type: "encrypted" as const,
    target: ["production", "preview", "development"],
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    value: process.env.NEXT_PUBLIC_SITE_URL ?? "https://arquitetamariana.com.br",
    type: "plain" as const,
    target: ["production"],
  },
];

console.log("\nAplicando env vars...");
for (const env of ENV_VARS) {
  // Remove existing one if exists
  const dup = (existing.envs ?? []).find((e) => e.key === env.key);
  if (dup) {
    await fetch(
      `${BASE}/v9/projects/${proj.id}/env/${dup.id}?teamId=${ACCOUNT_ID}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      }
    );
    console.log(`  removido antigo: ${env.key}`);
  }
  const created = await fetch(
    `${BASE}/v10/projects/${proj.id}/env?teamId=${ACCOUNT_ID}&upsert=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(env),
    }
  );
  if (!created.ok) {
    console.error(`  ✗ ${env.key}: HTTP ${created.status} ${await created.text()}`);
    continue;
  }
  console.log(`  ✓ ${env.key} aplicado`);
}

// Trigger redeploy
console.log("\nDisparando deploy...");
const lastDeploy = await fetch(
  `${BASE}/v6/deployments?projectId=${proj.id}&teamId=${ACCOUNT_ID}&limit=1`,
  { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
).then((r) => r.json()) as { deployments?: { uid: string; url: string }[] };

if (lastDeploy.deployments?.[0]) {
  const last = lastDeploy.deployments[0];
  console.log(`Último deploy: ${last.url} (uid ${last.uid})`);
}

const trigger = await fetch(
  `${BASE}/v13/deployments?teamId=${ACCOUNT_ID}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: proj.name,
      project: proj.id,
      target: "production",
      gitSource: {
        type: "github",
        ref: "main",
        repo: proj.link?.repo ?? "site",
        org: proj.link?.org ?? "arqmarianaalcantara",
      },
    }),
  }
);

if (!trigger.ok) {
  console.error(`Falha ao disparar deploy: ${trigger.status}`);
  console.error(await trigger.text());
  process.exit(1);
}

const newDeploy = (await trigger.json()) as {
  id: string;
  url: string;
  inspectorUrl?: string;
};
console.log(`\n✓ Deploy iniciado:`);
console.log(`  URL: https://${newDeploy.url}`);
console.log(`  Inspector: ${newDeploy.inspectorUrl ?? "-"}`);
