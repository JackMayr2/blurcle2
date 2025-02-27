import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check authentication
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized - No session' });
        }

        const { content, fileName, mimeType } = req.body;

        if (!content || !fileName) {
            return res.status(400).json({ error: 'Content and fileName are required' });
        }

        // Get user's Google account
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { accounts: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const googleAccount = user.accounts.find(
            (account) => account.provider === 'google'
        );

        if (!googleAccount) {
            return res.status(400).json({ error: 'Google account not connected' });
        }

        console.log('Google account found:', {
            provider: googleAccount.provider,
            hasAccessToken: !!googleAccount.access_token,
            hasRefreshToken: !!googleAccount.refresh_token,
            expiresAt: googleAccount.expires_at,
            currentTime: Math.floor(Date.now() / 1000)
        });

        // Check if we have the necessary tokens
        if (!googleAccount.access_token) {
            return res.status(400).json({ error: 'Missing access token' });
        }

        if (!googleAccount.refresh_token) {
            return res.status(400).json({ error: 'Missing refresh token. Please reconnect your Google account.' });
        }

        // Set up OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_ID,
            process.env.GOOGLE_SECRET,
            process.env.NEXTAUTH_URL
        );

        // Check if the required environment variables are set
        if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
            console.error('Missing Google OAuth credentials');
            console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
            return res.status(500).json({ error: 'Server configuration error: Missing Google OAuth credentials' });
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: googleAccount.access_token,
            refresh_token: googleAccount.refresh_token,
            expiry_date: googleAccount.expires_at ? googleAccount.expires_at * 1000 : undefined,
        });

        // Handle token refresh if needed
        const isTokenExpired = googleAccount.expires_at && Date.now() > googleAccount.expires_at * 1000;

        if (isTokenExpired) {
            console.log('Token expired, attempting to refresh...');

            try {
                const { credentials } = await oauth2Client.refreshAccessToken();
                console.log('Token refreshed successfully');

                // Update the token in the database
                await prisma.account.update({
                    where: { id: googleAccount.id },
                    data: {
                        access_token: credentials.access_token,
                        expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : undefined,
                    },
                });

                oauth2Client.setCredentials(credentials);
            } catch (error) {
                console.error('Error refreshing token:', error);

                // If refresh fails, we need to prompt the user to reconnect their account
                return res.status(401).json({
                    error: 'Your Google session has expired. Please sign out and sign back in to reconnect your Google account.',
                    requiresReconnect: true
                });
            }
        }

        // Create Drive client
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Save file to Google Drive
        const fileMetadata = {
            name: fileName,
            mimeType: mimeType || 'text/plain',
        };

        const media = {
            mimeType: mimeType || 'text/plain',
            body: content,
        };

        try {
            const driveResponse = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id,webViewLink',
            });

            return res.status(200).json({
                success: true,
                fileId: driveResponse.data.id,
                webViewLink: driveResponse.data.webViewLink,
            });
        } catch (driveError) {
            console.error('Google Drive API error:', driveError);

            // Check for specific Google API errors
            const errorMessage = driveError instanceof Error ? driveError.message : 'Unknown error';

            if (errorMessage.includes('invalid_grant')) {
                return res.status(401).json({
                    error: 'Your Google authorization has expired. Please sign out and sign back in.',
                    requiresReconnect: true
                });
            }

            if (errorMessage.includes('insufficient_scope') || errorMessage.includes('scope')) {
                return res.status(403).json({
                    error: 'Insufficient permissions to access Google Drive. Please reconnect with the required permissions.',
                    requiresReconnect: true
                });
            }

            throw driveError; // Re-throw to be caught by the outer catch block
        }
    } catch (error) {
        console.error('Error saving to Google Drive:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: `Failed to save to Google Drive: ${errorMessage}` });
    }
} 