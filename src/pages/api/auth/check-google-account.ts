import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the user's Google account
        const googleAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'google',
            },
        });

        // Check if the user has Gmail scope
        const hasGmailScope = googleAccount?.scope?.includes('https://mail.google.com/');

        return res.status(200).json({
            hasGoogleAccount: !!googleAccount,
            hasGmailScope: !!hasGmailScope,
        });
    } catch (error) {
        console.error('Error checking Google account:', error);
        return res.status(500).json({ error: 'Failed to check Google account' });
    }
} 