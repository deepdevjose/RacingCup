/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
    turbopack: {},
    webpack: (config, { isServer }) => {
        // Configure canvas handling  
        config.externals = [...(config.externals || []), { canvas: 'canvas' }];
        return config;
    },
}

export default nextConfig
