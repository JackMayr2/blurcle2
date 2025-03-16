import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Helper function to make BigInt serializable
const serializeData = (data: any): any => {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data === 'bigint') {
        return data.toString();
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeData(item));
    }

    if (typeof data === 'object') {
        const result: Record<string, any> = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = serializeData(data[key]);
            }
        }
        return result;
    }

    return data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the user session
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the user's Twitter profile and tweets
        const twitterProfile = await prisma.twitterProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!twitterProfile) {
            return res.status(404).json({ error: 'Twitter profile not found' });
        }

        const tweets = await prisma.tweet.findMany({
            where: { userId: session.user.id },
            orderBy: { tweetCreatedAt: 'desc' },
            take: 50, // Limit to 50 most recent tweets
        });

        // Serialize the response to handle any BigInt values
        const serializedResponse = serializeData({
            profile: twitterProfile,
            tweets: tweets,
        });

        return res.status(200).json(serializedResponse);
    } catch (error) {
        console.error('Error fetching Twitter content:', error);
        return res.status(500).json({ error: 'Failed to fetch Twitter content' });
    }
} 