import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = session.user.id;

        // Delete tweets
        await prisma.tweet.deleteMany({
            where: { userId },
        });

        // Delete Twitter profile
        await prisma.twitterProfile.deleteMany({
            where: { userId },
        });

        // Update user to mark Twitter as disconnected
        await prisma.user.update({
            where: { id: userId },
            data: { twitterConnected: false },
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error disconnecting Twitter:', error);
        return res.status(500).json({ error: 'Failed to disconnect Twitter' });
    }
} 