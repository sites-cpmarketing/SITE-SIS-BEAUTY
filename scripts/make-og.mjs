/**
 * Gera a imagem de compartilhamento social (Open Graph) 1200x630.
 * Fonte: uma foto de produto em paisagem. Saída: public/og-sisbeauty.jpg
 * Rode com: node scripts/make-og.mjs
 */
import sharp from "sharp";

const ORIGEM = "public/fotos/dsc06133.webp";
const SAIDA = "public/og-sisbeauty.jpg";

await sharp(ORIGEM)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(SAIDA);

console.log("✅ OG gerada:", SAIDA);
