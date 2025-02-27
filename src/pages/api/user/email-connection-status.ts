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

        // Use a raw query to check if the user has emailConnected set to true
        const result = await prisma.$queryRaw`
            SELECT "emailConnected" FROM "User" WHERE id = ${session.user.id}
        `;

        // The result will be an array with one object if the user exists
        const emailConnected = result && Array.isArray(result) && result.length > 0
            ? Boolean(result[0].emailConnected)
            : false;

        return res.status(200).json({ emailConnected });
    } catch (error) {
        console.error('Error checking email connection status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 