/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy the PHP API so the browser only ever talks to one origin (cookies, passkeys and OAuth callbacks need that).
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:8000';
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }];
  },
};
export default nextConfig;
