/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  sassOptions: {
    includePaths: ['./app/styles'],
    additionalData: `@use './app/styles/variables' as *;
                     @use './app/styles/mixins' as *;`,
  },
};
export default nextConfig;