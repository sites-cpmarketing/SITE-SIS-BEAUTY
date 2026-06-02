import sharp from "sharp";
import { readdirSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "..", "fotos-originais");
const files = readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f));

console.log(`Encontradas ${files.length} imagens\n`);
for (const f of files) {
  try {
    const meta = await sharp(join(SRC, f)).metadata();
    console.log(
      `${f.padEnd(20)} | ${String(meta.width).padStart(5)}x${String(
        meta.height
      ).padEnd(5)} | orientation=${meta.orientation ?? "none"} | ${(
        (meta.width ?? 0) > (meta.height ?? 0) ? "LANDSCAPE" : "PORTRAIT"
      )}`
    );
  } catch (e) {
    console.log(`${f} ERRO: ${e.message}`);
  }
}
