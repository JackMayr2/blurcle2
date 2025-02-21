import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.accessToken) {
            console.error('No access token found in session');
            return res.status(401).json({ error: 'No access token' });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: session.accessToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const { folderId = 'root' } = req.query;

        console.log('Fetching files from folder:', folderId);

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType)',
            orderBy: 'folder,name',
            pageSize: 100
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