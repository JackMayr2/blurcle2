import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the user's tweets
        const tweets = await prisma.tweet.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                tweetCreatedAt: 'desc',
            },
            take: 50, // Limit to 50 tweets
        });

        return res.status(200).json({
            success: true,
            tweets,
        });
    } catch (error) {
        console.error('Error getting tweets:', error);
        return res.status(500).json({ error: 'Failed to get tweets' });
    }
} 