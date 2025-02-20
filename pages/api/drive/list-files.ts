import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { folderId = 'root', q = '' } = req.query;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: session.accessToken as string
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Construct the query string
        const queryString = typeof q === 'string' ? q :
            folderId === 'root' ? "'root' in parents" :
                `'${folderId}' in parents`;

        const response = await drive.files.list({
            pageSize: 100,
            fields: 'files(id, name, mimeType, parents)',
            orderBy: 'folder,name',
            q: queryString // Use the properly typed query string
        });

        res.status(200).json({ files: response.data.files || [] });
    } catch (error) {
        console.error('Drive API error:', error);
        res.status(500).json({ error: 'Failed to fetch files from Google Drive' });
    }
} 