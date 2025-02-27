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

        // Check if the user has a Google account
        const googleAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'google',
            },
            select: {
                id: true,
                scope: true
            }
        });

        // Check if the account has Gmail scope
        const hasGmailScope = !!googleAccount?.scope && (
            googleAccount.scope.includes('https://mail.google.com/') ||
            googleAccount.scope.includes('https://www.googleapis.com/auth/gmail.readonly') ||
            googleAccount.scope.includes('https://www.googleapis.com/auth/gmail.modify')
        );

        return res.status(200).json({
            hasGoogleAccount: !!googleAccount,
            hasGmailScope: hasGmailScope
        });
    } catch (error) {
        console.error('Error checking Google account:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 