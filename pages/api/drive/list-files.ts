import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        console.log('Drive API - Session:', session);

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get the user's access token
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                accounts: {
                    where: { provider: 'google' },
                    select: { access_token: true }
                }
            }
        });

        const accessToken = user?.accounts[0]?.access_token;
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }

        const { folderId = 'root', q = '' } = req.query;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: accessToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false ${q ? `and name contains '${q}'` : ''}`,
            fields: 'files(id, name, mimeType)',
            orderBy: 'folder,name',
        });

        console.log('Drive API Response:', response.data);
        res.status(200).json(response.data.files || []);
    } catch (error) {
        console.error('Drive API Error:', error);
        res.status(500).json({
            error: 'Failed to list files',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 