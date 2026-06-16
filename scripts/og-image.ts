/**
 * Gera a OG image (1200x630 JPG) para WhatsApp, Facebook, LinkedIn etc.
 * Usa uma foto do portfólio como fundo, gradient escuro embaixo, logo branca
 * invertida e título da marca.
 */

import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;

async function main() {
  const bgPath = join("..", "site-original", "assets", "projetos", "apto_galeria", "1.webp");
  const logoPath = join("public", "logo.webp");

  // 1. Base: foto cobrindo 1200x630
  const base = sharp(bgPath).resize(WIDTH, HEIGHT, { fit: "cover" });

  // 2. Gradient escuro embaixo (overlay PNG via SVG)
  const overlaySvg = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1A1714" stop-opacity="0.15"/>
          <stop offset="55%" stop-color="#1A1714" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#1A1714" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)"/>
    </svg>
  `);

  // 3. Logo em CREME monocromático: extrai o canal alpha e compõe sobre creme
  const resizedLogo = await sharp(logoPath)
    .resize({ width: 720 })
    .ensureAlpha()
    .toBuffer();
  const logoMeta = await sharp(resizedLogo).metadata();
  const alphaChannel = await sharp(resizedLogo)
    .extractChannel("alpha")
    .toBuffer();
  const logoCream = await sharp({
    create: {
      width: logoMeta.width!,
      height: logoMeta.height!,
      channels: 3,
      background: "#F7F4EE",
    },
  })
    .joinChannel(alphaChannel)
    .png()
    .toBuffer();

  // 4. Texto/tagline em SVG
  const textSvg = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <text x="60" y="540" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-style="italic" font-weight="300" fill="#F7F4EE">
        Projetos residenciais que unem
      </text>
      <text x="60" y="585" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-style="italic" font-weight="300" fill="#F7F4EE">
        estética, conforto e propósito.
      </text>
    </svg>
  `);

  await base
    .composite([
      { input: overlaySvg, top: 0, left: 0 },
      { input: logoCream, top: 50, left: 60 },
      { input: textSvg, top: 0, left: 0 },
    ])
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile("public/og.jpg");

  const meta = await sharp("public/og.jpg").metadata();
  const sizeBytes = readFileSync("public/og.jpg").length;
  console.log(
    `OK ${meta.width}x${meta.height} ${meta.format} | ${(sizeBytes / 1024).toFixed(1)} KB`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
