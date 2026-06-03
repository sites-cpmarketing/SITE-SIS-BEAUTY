import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permite servir os mockups dos potes em alta qualidade (nitidez 3D)
    qualities: [75, 95],
  },
};

export default nextConfig;
