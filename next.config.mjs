/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
    // Fix for pdfjs-dist compatibility
    experimental: {
        esmExternals: 'loose',
    },
    webpack: (config, { isServer }) => {
        // Configure canvas handling  
        config.externals = [...(config.externals || []), { canvas: 'canvas' }];

        // Fix for "Object.defineProperty called on non-object" in pdfjs-dist
        // This happens because webpack's default 'eval-source-map' in dev mode
        // breaks the worker's execution environment.
        if (config.mode === 'development') {
            config.devtool = 'source-map';
        }

        return config;
    },
}

export default nextConfig
