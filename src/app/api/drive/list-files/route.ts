import { google } from 'googleapis';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return Response.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const folderId = searchParams.get('folderId') || 'root';

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: session.accessToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType)',
            orderBy: 'folder,name',
            pageSize: 1000
        });

        return Response.json({ files: response.data.files });

    } catch (error) {
        console.error('Drive API Error:', error);
        return Response.json(
            { error: 'Failed to fetch files' },
            { status: 500 }
        );
    }
} 