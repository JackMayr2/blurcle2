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

        // Check if user has a Twitter account
        const twitterAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'twitter',
            }
        });

        // Check if user has a Twitter profile
        const twitterProfile = await prisma.twitterProfile.findUnique({
            where: {
                userId: session.user.id,
            }
        });

        return res.status(200).json({
            hasTwitterAccount: !!twitterAccount,
            hasTwitterProfile: !!twitterProfile,
            twitterConnected: session.user.twitterConnected || false
        });
    } catch (error) {
        console.error('Error checking Twitter account:', error);
        return res.status(500).json({ error: 'Failed to check Twitter account' });
    }
} 