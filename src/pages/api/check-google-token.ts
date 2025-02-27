import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check authentication
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
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
            return res.status(200).json({
                status: 'not_connected',
                message: 'Google account not connected'
            });
        }

        // Check token status
        const tokenStatus = {
            hasAccessToken: !!googleAccount.access_token,
            hasRefreshToken: !!googleAccount.refresh_token,
            expiresAt: googleAccount.expires_at ? new Date(googleAccount.expires_at * 1000).toISOString() : null,
            isExpired: googleAccount.expires_at ? Date.now() > googleAccount.expires_at * 1000 : false,
            currentTime: new Date().toISOString()
        };

        // If token is expired, try to refresh it
        if (tokenStatus.isExpired && googleAccount.refresh_token) {
            try {
                // Set up OAuth2 client
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_ID,
                    process.env.GOOGLE_SECRET,
                    process.env.NEXTAUTH_URL
                );

                oauth2Client.setCredentials({
                    refresh_token: googleAccount.refresh_token
                });

                const { credentials } = await oauth2Client.refreshAccessToken();

                // Update the token in the database
                await prisma.account.update({
                    where: { id: googleAccount.id },
                    data: {
                        access_token: credentials.access_token,
                        expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : undefined,
                    },
                });

                return res.status(200).json({
                    status: 'refreshed',
                    message: 'Token was expired but has been refreshed successfully',
                    tokenStatus: {
                        ...tokenStatus,
                        isExpired: false,
                        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null
                    }
                });
            } catch (error) {
                console.error('Error refreshing token:', error);

                return res.status(200).json({
                    status: 'expired',
                    message: 'Token is expired and could not be refreshed',
                    tokenStatus,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        // Return token status
        return res.status(200).json({
            status: tokenStatus.isExpired ? 'expired' : 'valid',
            message: tokenStatus.isExpired ? 'Token is expired' : 'Token is valid',
            tokenStatus
        });
    } catch (error) {
        console.error('Error checking Google token:', error);
        return res.status(500).json({
            error: 'Failed to check Google token status',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 