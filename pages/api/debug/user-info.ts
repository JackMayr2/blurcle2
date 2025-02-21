import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ error: 'Not available in production' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                districts: true, // For consultants
            }
        });

        // If user is a district rep, find their district
        const district = user?.role === 'district' ? await prisma.district.findFirst({
            where: { contactEmail: user.email }
        }) : null;

        res.status(200).json({
            user,
            district,
            session
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: 'Failed to fetch debug info' });
    }
} 