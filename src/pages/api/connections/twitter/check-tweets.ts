import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

        // Check if the user has a Twitter profile
        const twitterProfile = await prisma.twitterProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!twitterProfile) {
            return res.status(200).json({ hasTweets: false });
        }

        // Count the number of tweets
        const tweetCount = await prisma.tweet.count({
            where: { userId: session.user.id },
        });

        return res.status(200).json({
            hasTweets: tweetCount > 0,
            tweetCount
        });
    } catch (error) {
        console.error('Error checking tweets:', error);
        return res.status(500).json({ error: 'Failed to check tweets' });
    }
} 