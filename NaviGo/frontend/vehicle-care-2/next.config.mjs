/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable features that don't work with static export
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
