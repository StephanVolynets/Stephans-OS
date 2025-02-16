/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: "/Stephans-OS", // Match your GitHub repo name
  assetPrefix: "/Stephans-OS/",
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

