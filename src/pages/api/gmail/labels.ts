import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { google } from 'googleapis';
import { GaxiosError } from 'gaxios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            console.log('No session or user ID found');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the user's Google account
        const userAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'google',
            },
            select: {
                access_token: true,
                refresh_token: true,
                expires_at: true,
                scope: true,
            }
        });

        if (!userAccount) {
            return res.status(404).json({ error: 'No Google account found' });
        }

        // Check if the account has Gmail scope
        const hasGmailScope = !!userAccount.scope && (
            userAccount.scope.includes('https://mail.google.com/') ||
            userAccount.scope.includes('https://www.googleapis.com/auth/gmail.readonly') ||
            userAccount.scope.includes('https://www.googleapis.com/auth/gmail.modify')
        );

        if (!hasGmailScope) {
            return res.status(403).json({
                error: 'Gmail access permission required. Please reconnect your account with Gmail permissions.'
            });
        }

        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_ID,
            process.env.GOOGLE_SECRET,
            process.env.NEXTAUTH_URL
        );

        // Set credentials
        oauth2Client.setCredentials({
            access_token: userAccount.access_token,
            refresh_token: userAccount.refresh_token,
            expiry_date: userAccount.expires_at ? userAccount.expires_at * 1000 : undefined,
        });

        // Initialize Gmail API
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        try {
            // Fetch labels
            const response = await gmail.users.labels.list({
                userId: 'me',
            });

            const labels = response.data.labels || [];

            // For each label, get the message count
            const labelsWithCounts = await Promise.all(
                labels.map(async (label) => {
                    try {
                        const labelInfo = await gmail.users.labels.get({
                            userId: 'me',
                            id: label.id as string,
                        });

                        return {
                            id: label.id,
                            name: label.name,
                            type: label.type,
                            messagesTotal: labelInfo.data.messagesTotal || 0,
                        };
                    } catch (error) {
                        console.error(`Error fetching details for label ${label.name}:`, error);
                        return {
                            id: label.id,
                            name: label.name,
                            type: label.type,
                            messagesTotal: 0,
                        };
                    }
                })
            );

            // Filter out system labels with 0 messages and sort by name
            const filteredLabels = labelsWithCounts
                .filter(label => label.messagesTotal > 0 || label.type === 'user')
                .sort((a, b) => {
                    // Put user labels first, then sort by name
                    if (a.type === 'user' && b.type !== 'user') return -1;
                    if (a.type !== 'user' && b.type === 'user') return 1;
                    return (a.name || '').localeCompare(b.name || '');
                });

            return res.json({ labels: filteredLabels });
        } catch (error) {
            console.error('Error fetching Gmail labels:', error);

            if (error instanceof GaxiosError) {
                if (error.message.includes('Insufficient Permission') ||
                    error.response?.headers?.['www-authenticate']?.includes('insufficient_scope')) {
                    return res.status(403).json({
                        error: 'Gmail access permission required. Please reconnect your account with Gmail permissions.'
                    });
                }
            }

            return res.status(500).json({ error: 'Failed to fetch Gmail labels' });
        }
    } catch (error) {
        console.error('Error in Gmail labels API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 