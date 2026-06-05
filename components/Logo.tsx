import Image from "next/image";

/**
 * Logo horizontal da SIS Beauty (SVG de public/SVG/SVG/LOGO.svg).
 * viewBox original: 382.117 × 127.562  →  proporção ~3:1
 *
 * Use a prop `size` para controlar a largura:
 *   "sm"  → 120px  (rodapé, mobile)
 *   "md"  → 150px  (header desktop — padrão)
 *   "lg"  → 180px  (hero, e-mail)
 */

const SIZES = {
  sm: { w: 120, h: 40 },
  md: { w: 150, h: 50 },
  lg: { w: 180, h: 60 },
};

type Props = {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
};

export default function Logo({ size = "md", className, priority }: Props) {
  const { w, h } = SIZES[size];
  return (
    <Image
      src="/SVG/SVG/LOGO.svg"
      alt="SIS Beauty"
      width={w}
      height={h}
      priority={priority}
      className={className}
      style={{ width: w, height: "auto" }}
    />
  );
}
