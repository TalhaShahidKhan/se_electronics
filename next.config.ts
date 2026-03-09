import { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pub-b7899c318e61486a9064d03a5d18f99c.r2.dev',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'service-manager.45739e2ef39226b7c581576fc26bd700.r2.cloudflarestorage.com',
                port: '',
                pathname: '/**',
            },
        ]
    },
    serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
    outputFileTracingIncludes: {
        '/': ['./src/assets/**/*'],
    },
    experimental: {
        // missingSuspenseWithCSRBailout: false,
        serverActions: {
            bodySizeLimit: '10mb'
        }
    },
    async redirects() {
        return [
            {
                source: '/servicestatus',
                destination: '/service-report',
                permanent: true,
            },
            {
                source: '/feedback',
                destination: '/service-feedback',
                permanent: true,
            },
            {
                source: '/servicetrack',
                destination: '/service-track',
                permanent: true,
            },
            {
                source: '/applicationtrack',
                destination: '/application-track',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
