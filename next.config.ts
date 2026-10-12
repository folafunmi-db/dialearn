import type { NextConfig } from 'next';
const config: NextConfig = { distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next', output: 'export', trailingSlash: true, images: { unoptimized: true }, poweredByHeader: false };
export default config;
