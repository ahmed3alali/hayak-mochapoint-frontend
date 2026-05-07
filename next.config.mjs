/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Added your mobile IP here so you can preview on your phone
  allowedDevOrigins: [
    "localhost:3000",
    "192.168.1.7",
    "192.168.1.7:3000"
  ],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
}

export default nextConfig
