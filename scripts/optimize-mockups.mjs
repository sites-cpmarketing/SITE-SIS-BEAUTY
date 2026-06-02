import sharp from "sharp";
import { join } from "path";
import { statSync } from "fs";

const ROOT = process.cwd();
const SRC = join(ROOT, "..");
const OUT = join(ROOT, "public", "fotos");

const jobs = [
  { in: "Mockup Hair Cápsula sem fundo.png", out: "mockup-capsula.webp" },
  { in: "Mockup Hair Gummy sem fundo.png", out: "mockup-goma.webp" },
];

for (const j of jobs) {
  try {
    let img = sharp(join(SRC, j.in));
    try {
      img = img.trim({ threshold: 10 }); // remove excesso transparente
    } catch {}
    await img
      .resize(900, 900, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100 })
      .toFile(join(OUT, j.out));
    const kb = statSync(join(OUT, j.out)).size / 1024;
    console.log(`  ${j.out.padEnd(22)} -> ${kb.toFixed(0)} KB`);
  } catch (e) {
    console.log(`  ERRO ${j.in}: ${e.message}`);
  }
}
console.log("Mockups prontos (com transparência).");
