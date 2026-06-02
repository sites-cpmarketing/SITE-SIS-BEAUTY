import sharp from "sharp";
import { join } from "path";
import { statSync } from "fs";

const ROOT = process.cwd();
const SRC = join(ROOT, "..");
const OUT = join(ROOT, "public", "fotos");

const jobs = [
  { in: "DSC06156.JPG", out: "hero-principal.webp" }, // cabelo + goma (hero)
  { in: "DSC06137.JPG", out: "marca-boutique.webp" }, // pote na boutique (marca)
];

for (const j of jobs) {
  try {
    await sharp(join(SRC, j.in))
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(join(OUT, j.out));
    const kb = statSync(join(OUT, j.out)).size / 1024;
    console.log(`  ${j.out.padEnd(22)} -> ${kb.toFixed(0)} KB`);
  } catch (e) {
    console.log(`  ERRO ${j.in}: ${e.message}`);
  }
}
console.log("Fotos novas otimizadas.");
