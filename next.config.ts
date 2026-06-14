import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['pbs.twimg.com', 'ik.imagekit.io']
  },
  allowedDevOrigins: ['humid-village-stopper.ngrok-free.dev']
};

export default nextConfig;
