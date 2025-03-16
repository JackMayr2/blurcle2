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

        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = session.user.id;

        // Get district ID if user has one
        const district = await prisma.district.findFirst({
            where: { userId },
        });

        if (!district) {
            return res.status(404).json({ error: 'District not found' });
        }

        // Get files
        const files = await prisma.file.findMany({
            where: { districtId: district.id },
            orderBy: { updatedAt: 'desc' },
        });

        // Get file type statistics
        const fileTypeStats = files.reduce((acc, file) => {
            const type = file.mimeType.split('/')[1] || 'other';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return res.status(200).json({
            files,
            stats: {
                total: files.length,
                byType: fileTypeStats,
            },
        });
    } catch (error) {
        console.error('Error fetching Google Drive content:', error);
        return res.status(500).json({ error: 'Failed to fetch Google Drive content' });
    }
} 