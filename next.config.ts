import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        assert: false,
        path: false,
        url: false,
        punycode: false,
        querystring: false,
        mongodb: false,
        nodemailer: false,
      };
      
      // Exclude server-only files from client bundle
      config.module.rules.push({
        test: /\/(mongodb-server|notificationProcessor|emailService|whatsappService)\.ts$/,
        use: 'null-loader',
      });
    }
    return config;
  },
};

export default nextConfig;
