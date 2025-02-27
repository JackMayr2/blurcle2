/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'lh3.googleusercontent.com', // For Google profile images
            'pbs.twimg.com',             // For Twitter profile images
            'abs.twimg.com'              // For Twitter media
        ],
    },
    experimental: {
        esmExternals: true,
    },
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
                ],
            },
        ];
    },
}

module.exports = nextConfig; 