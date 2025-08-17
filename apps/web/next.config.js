/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  sassOptions: {
    includePaths: ['./app/styles'],
  },
};

export default nextConfig;
