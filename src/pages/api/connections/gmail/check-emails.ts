import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if the user has Gmail scope
        const account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'google'
            }
        });

        const hasGmailScope = account?.scope?.includes('https://mail.google.com/');

        if (!hasGmailScope) {
            return res.status(200).json({ hasEmails: false, emailCount: 0 });
        }

        // Count the number of emails for this user
        const emailCount = await prisma.email.count({
            where: {
                userId: session.user.id
            }
        });

        return res.status(200).json({
            hasEmails: emailCount > 0,
            emailCount
        });
    } catch (error) {
        console.error('Error checking emails:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 