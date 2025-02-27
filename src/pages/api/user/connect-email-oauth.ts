import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            console.log('No session or user email found');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the user's Google account
        const userAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id as string,
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

        // Check if the scope includes Gmail access
        if (!userAccount.scope?.includes('https://mail.google.com/')) {
            return res.status(403).json({
                error: 'Gmail access not authorized',
                needsReauthorization: true
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

        // Verify Gmail access by getting user profile
        const profile = await gmail.users.getProfile({
            userId: 'me',
        });

        if (!profile.data.emailAddress) {
            throw new Error('Failed to retrieve Gmail profile');
        }

        // Store the email connection in the database
        const emailConnection = await prisma.emailConnection.upsert({
            where: {
                userId: session.user.id as string,
            },
            update: {
                email: profile.data.emailAddress,
                // We don't need to store server, port, or password since we're using OAuth
                server: 'gmail',
                port: 0,
                password: '', // No password needed with OAuth
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id as string,
                email: profile.data.emailAddress,
                server: 'gmail',
                port: 0,
                password: '', // No password needed with OAuth
            },
        });

        // Update user profile to indicate email is connected
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                emailConnected: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                organizationName: true,
                onboardingComplete: true,
                emailConnected: true,
            }
        });

        console.log('Email connection saved:', emailConnection.id);

        // Return success response
        return res.json({
            message: 'Gmail connected successfully',
            user: updatedUser,
            gmailAddress: profile.data.emailAddress
        });
    } catch (error) {
        console.error('Error connecting Gmail:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 