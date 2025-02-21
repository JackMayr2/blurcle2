const config = {
    nextAuth: {
        url: process.env.NEXTAUTH_URL!,
        secret: process.env.NEXTAUTH_SECRET!,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    database: {
        url: process.env.POSTGRES_PRISMA_URL!,
        directUrl: process.env.POSTGRES_URL_NON_POOLING,
    },
} as const;

// Validate all required env vars are present
Object.entries(config).forEach(([key, value]) => {
    Object.entries(value).forEach(([subKey, subValue]) => {
        if (!subValue) {
            throw new Error(`Missing environment variable: ${key}.${subKey}`);
        }
    });
});

export default config; 