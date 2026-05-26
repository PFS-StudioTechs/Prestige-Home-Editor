import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.coverstyl.com",
        pathname: "/img-optim/**",
      },
    ],
  },
};

export default nextConfig;
