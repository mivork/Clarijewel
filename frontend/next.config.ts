import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 商品画像・鑑定書PDF等をLaravel側(S3 or public storage)から配信する想定
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
