/** @type {import('next').NextConfig} */
const nextConfig = {
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
