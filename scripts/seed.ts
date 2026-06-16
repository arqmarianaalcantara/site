/**
 * Seed: migra os 10 projetos do site original para o Supabase.
 *
 * Pré-requisitos:
 *   1. .env.local configurado com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *   2. Migrations 001 e 002 rodadas no Supabase
 *   3. Pasta ../site-original/assets/projetos disponível
 *
 * Uso:  npm run seed
 *
 * Idempotente: pula projetos que já existem (por slug).
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

config({ path: ".env.local" });
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE) {
  console.error("Faltam variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ORIGINAL = join(process.cwd(), "..", "site-original", "assets", "projetos");

interface Seed {
  slug: string;
  title: string;
  category: string;
  description: string;
  numImages: number;
  order: number;
}

const PROJECTS: Seed[] = [
  {
    slug: "apto_bm",
    title: "APTO BM",
    category: "apartamento",
    order: 1,
    numImages: 10,
    description:
      "Living integrado contemporâneo, marcado pela sofisticação nos detalhes e pela paleta neutra. Painéis amadeirados conferem aconchego e elegância, enquanto espelhos ampliam o espaço e potencializam a iluminação. A marcenaria sob medida garante funcionalidade e harmonia, contrastando com o mobiliário clean em tons claros que reforça a sensação de amplitude. O design prioriza conforto, integração entre sala de estar e jantar e uma atmosfera acolhedora e moderna.",
  },
  {
    slug: "apto_brisa",
    title: "APTO BRISA",
    category: "apartamento",
    order: 2,
    numImages: 10,
    description:
      "Atmosfera leve e acolhedora, valorizando a integração entre estar e jantar em um espaço compacto e bem resolvido. A paleta neutra, com destaque para os tons claros da marcenaria e do mobiliário, amplia a sensação de luminosidade e traz serenidade ao ambiente.",
  },
  {
    slug: "apto_urbano",
    title: "APTO URBANO",
    category: "apartamento",
    order: 3,
    numImages: 10,
    description:
      "Integração entre sala de estar e jantar em um layout compacto e harmônico. A marcenaria em tons amadeirados adiciona aconchego e textura, enquanto a iluminação linear embutida e o design minimalista dos pendentes criam uma atmosfera sofisticada e contemporânea. A paleta neutra, combinada com toques de verde natural e mobiliário em couro, traz equilíbrio entre elegância e conforto.",
  },
  {
    slug: "apto_dd",
    title: "APTO DD",
    category: "apartamento",
    order: 4,
    numImages: 17,
    description:
      "Integração entre sala e cozinha de forma funcional e acolhedora, com destaque para a marcenaria ripada em madeira que aquece o ambiente e cria unidade visual. A paleta clara amplia a luminosidade, enquanto detalhes em iluminação embutida e pontos de verde natural trazem frescor e dinamismo. Mobiliário de linhas retas e layout compacto priorizam conforto e praticidade.",
  },
  {
    slug: "apto_galeria",
    title: "APTO GALERIA",
    category: "apartamento",
    order: 5,
    numImages: 19,
    description:
      "Estar, jantar e cozinha em um único ambiente amplo e iluminado. A marcenaria em madeira aquece o espaço e contrasta com os tons neutros predominantes. O grande sofá garante conforto e acolhimento, enquanto obras de arte e detalhes em pedra trazem textura e sofisticação. A varanda envidraçada amplia a entrada de luz natural e conecta o apartamento à paisagem urbana.",
  },
  {
    slug: "apto_mv",
    title: "APTO MV",
    category: "apartamento",
    order: 6,
    numImages: 9,
    description:
      "Aproveitamento inteligente de espaços compactos, unindo sala de estar e jantar em uma composição leve e funcional. A marcenaria em madeira aquece o ambiente e se destaca tanto no painel da TV quanto no mobiliário sob medida. O uso do espelho amplia a percepção de espaço e luminosidade, enquanto a paleta neutra, com pontos de verde natural, reforça a atmosfera acolhedora.",
  },
  {
    slug: "quarto_romeo",
    title: "QUARTO ROMEO",
    category: "quarto",
    order: 7,
    numImages: 8,
    description:
      "Projetado para transmitir tranquilidade e acolhimento, combinando tons suaves de verde com madeira clara. A marcenaria sob medida integra armário, cômoda e trocador, otimizando o espaço e garantindo funcionalidade no dia a dia. Detalhes delicados, como puxadores em formato orgânico e iluminação embutida, reforçam o clima lúdico e sereno.",
  },
  {
    slug: "quarto_samuel",
    title: "QUARTO SAMUEL",
    category: "quarto",
    order: 8,
    numImages: 8,
    description:
      "Atmosfera leve e lúdica com inspiração no universo náutico. A cabeceira em tom azul claro e formato orgânico se destaca, dialogando com as nuvens iluminadas na parede e os elementos decorativos sutis. A marcenaria em madeira natural e o mobiliário em tons neutros trazem aconchego e equilíbrio.",
  },
  {
    slug: "cozinha_dl",
    title: "COZINHA DL",
    category: "cozinha",
    order: 9,
    numImages: 10,
    description:
      "Funcionalidade e leveza visual, integrando tons suaves de verde acinzentado com a textura natural da madeira. A marcenaria sob medida otimiza o armazenamento e garante um visual contínuo e elegante. A iluminação embutida sob os armários realça o revestimento ripado e cria uma atmosfera acolhedora.",
  },
  {
    slug: "apto_bossa",
    title: "APTO BOSSA",
    category: "apartamento",
    order: 10,
    numImages: 18,
    description:
      "Estilo atual, funcional e sofisticado, com destaque para o uso inteligente da marcenaria em madeira natural que reveste paredes e integra portas camufladas, garantindo unidade visual e amplitude. Os ambientes são iluminados de forma estratégica, mesclando luz natural filtrada por cortinas leves e iluminação indireta que valoriza texturas e volumes.",
  },
];

async function uploadFile(bucket: string, path: string, localPath: string, contentType: string) {
  const buffer = readFileSync(localPath);
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload ${path}: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function seedProject(p: Seed) {
  console.log(`\n→ ${p.title}`);

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", p.slug)
    .maybeSingle();

  if (existing) {
    console.log(`  já existe (id ${existing.id}), pulando.`);
    return;
  }

  console.log(`  enviando capa...`);
  const coverLocal = join(ORIGINAL, `${p.slug}.webp`);
  const coverUrl = await uploadFile(
    "projects",
    `${p.slug}/cover.webp`,
    coverLocal,
    "image/webp"
  );

  const { data: inserted, error: insertError } = await supabase
    .from("projects")
    .insert({
      slug: p.slug,
      title: p.title,
      category: p.category,
      description: p.description,
      cover_url: coverUrl,
      order_index: p.order,
      published: true,
    })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);

  console.log(`  enviando ${p.numImages} fotos...`);
  for (let i = 1; i <= p.numImages; i++) {
    const local = join(ORIGINAL, p.slug, `${i}.webp`);
    const url = await uploadFile(
      "projects",
      `${p.slug}/${i.toString().padStart(2, "0")}.webp`,
      local,
      "image/webp"
    );
    const { error: imgErr } = await supabase.from("project_images").insert({
      project_id: inserted.id,
      url,
      order_index: i - 1,
      alt: `${p.title} foto ${i}`,
    });
    if (imgErr) throw new Error(imgErr.message);
    process.stdout.write(`    ${i}/${p.numImages}\r`);
  }
  console.log(`  ✓ pronto`);
}

async function main() {
  console.log("Seed inicial do portfólio da Mariana");
  console.log("URL:", SUPABASE_URL);

  for (const p of PROJECTS) {
    try {
      await seedProject(p);
    } catch (err) {
      console.error(`  erro em ${p.slug}:`, err);
    }
  }

  console.log("\n✓ Seed concluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
