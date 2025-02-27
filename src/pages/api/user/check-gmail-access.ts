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

        if (!session?.user?.email) {
            console.log('No session or user email found');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the user's account to check for Gmail access
        const userAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id as string,
                provider: 'google',
            },
            select: {
                scope: true,
                access_token: true,
            }
        });

        if (!userAccount) {
            return res.status(404).json({
                hasAccess: false,
                error: 'No Google account found'
            });
        }

        // Check if the scope includes Gmail access
        const hasGmailScope = userAccount.scope?.includes('https://mail.google.com/') || false;
        const hasValidToken = !!userAccount.access_token;

        return res.json({
            hasAccess: hasGmailScope && hasValidToken,
            needsReauthorization: !hasGmailScope
        });
    } catch (error) {
        console.error('Error checking Gmail access:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 