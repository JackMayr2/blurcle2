import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { google } from 'googleapis';
import { GaxiosError } from 'gaxios';
import { PrismaClientKnownRequestError } from '@prisma/client';

interface GmailLabel {
    id: string;
    name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            console.log('No session or user ID found');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the labels from the request body
        const { labels } = req.body as { labels: GmailLabel[] };

        if (!labels || !Array.isArray(labels) || labels.length === 0) {
            return res.status(400).json({ error: 'No labels provided' });
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
            // Process each label
            const results = await Promise.all(
                labels.map(async (label) => {
                    try {
                        // Get messages for this label
                        const messagesResponse = await gmail.users.messages.list({
                            userId: 'me',
                            labelIds: [label.id],
                            maxResults: 100, // Limit to 100 emails per label for performance
                        });

                        const messages = messagesResponse.data.messages || [];
                        const processedEmails = [];

                        // Process each message
                        for (const message of messages) {
                            try {
                                // Get full message details
                                const messageDetails = await gmail.users.messages.get({
                                    userId: 'me',
                                    id: message.id as string,
                                    format: 'full',
                                });

                                const headers = messageDetails.data.payload?.headers || [];
                                const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';
                                const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
                                const to = headers.find(h => h.name?.toLowerCase() === 'to')?.value || '';
                                const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';

                                // Extract message body
                                let body = '';
                                if (messageDetails.data.payload?.body?.data) {
                                    // Base64 encoded body
                                    body = Buffer.from(messageDetails.data.payload.body.data, 'base64').toString('utf-8');
                                } else if (messageDetails.data.payload?.parts) {
                                    // Multipart message, find text part
                                    const textPart = messageDetails.data.payload.parts.find(
                                        part => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
                                    );
                                    if (textPart?.body?.data) {
                                        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                                    }
                                }

                                // Store the email in the database
                                const email = await prisma.email.upsert({
                                    where: {
                                        messageId: message.id as string
                                    },
                                    update: {
                                        // Update existing record
                                        labelId: label.id,
                                        labelName: label.name,
                                        subject,
                                        from,
                                        to,
                                        body,
                                        receivedAt: new Date(date),
                                    },
                                    create: {
                                        userId: session.user.id,
                                        messageId: message.id as string,
                                        labelId: label.id,
                                        labelName: label.name,
                                        subject,
                                        from,
                                        to,
                                        body,
                                        receivedAt: new Date(date),
                                    }
                                });

                                processedEmails.push(email.id);
                            } catch (error) {
                                console.error(`Error processing message ${message.id}:`, error);

                                // Don't throw the error, just log it and continue with other messages
                                if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                                    console.log(`Message ${message.id} already exists, skipping`);
                                }

                                // Return information about the error for reporting
                                return {
                                    messageId: message.id,
                                    error: error instanceof Error ? error.message : 'Unknown error',
                                    processed: false
                                };
                            }
                        }

                        return {
                            labelId: label.id,
                            labelName: label.name,
                            processedCount: processedEmails.length,
                            totalCount: messages.length,
                        };
                    } catch (error) {
                        console.error(`Error processing label ${label.name}:`, error);
                        return {
                            labelId: label.id,
                            labelName: label.name,
                            processedCount: 0,
                            totalCount: 0,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        };
                    }
                })
            );

            return res.json({
                success: true,
                results,
                totalProcessed: results.reduce((sum, result) => sum + result.processedCount, 0),
            });
        } catch (error) {
            console.error('Error importing emails:', error);

            if (error instanceof GaxiosError) {
                if (error.message.includes('Insufficient Permission') ||
                    error.response?.headers?.['www-authenticate']?.includes('insufficient_scope')) {
                    return res.status(403).json({
                        error: 'Gmail access permission required. Please reconnect your account with Gmail permissions.'
                    });
                }
            }

            return res.status(500).json({ error: 'Failed to import emails' });
        }
    } catch (error) {
        console.error('Error in import emails API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 