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

        // Check if the user has a district
        const district = await prisma.district.findFirst({
            where: {
                userId: session.user.id
            }
        });

        if (!district) {
            return res.status(200).json({ hasFiles: false, fileCount: 0 });
        }

        // Count the number of files for this district
        const fileCount = await prisma.file.count({
            where: {
                districtId: district.id
            }
        });

        return res.status(200).json({
            hasFiles: fileCount > 0,
            fileCount
        });
    } catch (error) {
        console.error('Error checking files:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 