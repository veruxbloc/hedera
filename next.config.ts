import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@hashgraph/sdk', 'hedera-agent-kit'],
};

export default nextConfig;
