import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        console.log('District info - Session:', session);

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get user with district
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                district: true
            }
        });
        console.log('District info - User:', user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'district') {
            return res.status(403).json({ error: `Not authorized. User role is ${user.role}` });
        }

        if (!user.district) {
            // Try to create district if it doesn't exist
            const district = await prisma.district.create({
                data: {
                    name: user.organizationName || 'Unknown District',
                    contactEmail: user.email || '',
                    contactName: user.name || undefined,
                    userId: user.id
                }
            });
            console.log('District info - Created new district:', district);
            return res.status(200).json(district);
        }

        console.log('District info - Found district:', user.district);
        res.status(200).json(user.district);
    } catch (error) {
        console.error('Error fetching district info:', error);
        res.status(500).json({
            error: 'Failed to fetch district info',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 