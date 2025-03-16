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

        // Get district ID if user has one
        const district = await prisma.district.findFirst({
            where: { userId },
        });

        if (district) {
            // Delete files associated with the district
            await prisma.file.deleteMany({
                where: { districtId: district.id },
            });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error disconnecting Google Drive:', error);
        return res.status(500).json({ error: 'Failed to disconnect Google Drive' });
    }
} 