import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('API endpoint called:', req.method);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        console.log('Session:', session);

        if (!session?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { files } = req.body;
        console.log('Files to upload:', files);

        if (!Array.isArray(files)) {
            return res.status(400).json({ error: 'Invalid files format' });
        }

        // Get the user's district
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { district: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let districtId = user.district?.id;

        if (!districtId) {
            // Create a district if it doesn't exist
            const district = await prisma.district.create({
                data: {
                    name: user.organizationName || 'Unnamed District',
                    contactEmail: user.email || '',
                    user: {
                        connect: { id: user.id }
                    }
                }
            });
            districtId = district.id;
        }

        console.log('District ID:', districtId);

        // Create File records for each selected file
        const filePromises = files.map(file =>
            prisma.file.create({
                data: {
                    name: file.name,
                    googleDriveId: file.id,
                    mimeType: file.mimeType,
                    district: {
                        connect: { id: districtId }
                    }
                }
            })
        );

        const createdFiles = await Promise.all(filePromises);

        res.status(200).json({
            message: 'Files uploaded successfully',
            files: createdFiles
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to upload files',
            details: error instanceof Error ? error.stack : undefined
        });
    }
} 