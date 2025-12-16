import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
   env: {
    PAWAPAY_API_KEY: process.env.PAWAPAY_API_KEY,
  },
    distDir: 'build' // Modifie ce nom selon ta sortie

};


export default nextConfig;
