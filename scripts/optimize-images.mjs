import sharp from "sharp";
import { readdirSync, mkdirSync, statSync } from "fs";
import { join, parse } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "..", "fotos-originais");
const OUT = join(ROOT, "public", "fotos");
const SHEET = join(ROOT, "scripts");

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC)
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort();

const sanitize = (name) =>
  parse(name).name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

console.log(`Otimizando ${files.length} imagens...\n`);

const thumbs = [];
let totalKb = 0;

for (const f of files) {
  const slug = sanitize(f);
  const outPath = join(OUT, `${slug}.webp`);
  try {
    // Versão full para o site: auto-orienta via EXIF, max 1500px, webp
    await sharp(join(SRC, f))
      .rotate() // aplica orientação EXIF e remove a flag
      .resize(1500, 1500, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    const kb = statSync(outPath).size / 1024;
    totalKb += kb;

    // Thumb para o contact sheet
    const thumbBuf = await sharp(join(SRC, f))
      .rotate()
      .resize(260, 340, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();
    const tMeta = await sharp(thumbBuf).metadata();
    thumbs.push({ slug, buf: thumbBuf, w: tMeta.width, h: tMeta.height });

    console.log(`  ${slug.padEnd(18)} -> ${kb.toFixed(0)} KB`);
  } catch (e) {
    console.log(`  ERRO ${f}: ${e.message}`);
  }
}

console.log(`\nTotal site: ${(totalKb / 1024).toFixed(1)} MB em ${files.length} imagens`);

// ---- Contact sheet com labels ----
const COLS = 4;
const ROWS = Math.ceil(thumbs.length / COLS);
const CELL_W = 280;
const CELL_H = 380; // 350 imagem + 30 label
const W = COLS * CELL_W;
const H = ROWS * CELL_H;

const composites = [];
let labelsSvg = "";
thumbs.forEach((t, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const left = col * CELL_W + Math.round((CELL_W - t.w) / 2);
  const top = row * CELL_H + Math.round((350 - t.h) / 2) + 5;
  composites.push({ input: t.buf, left, top });
  const tx = col * CELL_W + CELL_W / 2;
  const ty = row * CELL_H + 372;
  labelsSvg += `<text x="${tx}" y="${ty}" font-family="monospace" font-size="16" fill="#222" text-anchor="middle">${t.slug}</text>`;
});

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${labelsSvg}</svg>`;

await sharp({
  create: { width: W, height: H, channels: 3, background: "#ffffff" },
})
  .composite([...composites, { input: Buffer.from(svg), left: 0, top: 0 }])
  .webp({ quality: 78 })
  .toFile(join(SHEET, "contact-sheet.webp"));

console.log(`\nContact sheet gerado: scripts/contact-sheet.webp (${W}x${H})`);
