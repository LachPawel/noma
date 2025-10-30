import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable the problematic rules during build
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  
  // Disable the custom font warning
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Externalize node modules for server-side
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    return config;
  },
  
  // Ensure server components can use these packages
  serverExternalPackages: [
    '@reflectmoney/stable.ts',
    '@drift-labs/sdk',
    '@coral-xyz/anchor',
    '@sqds/grid'
  ],

};

export default nextConfig;
