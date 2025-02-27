import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

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

        const { email, password, server, port } = req.body;
        console.log('Received email connection request:', { email, server, port });

        if (!email || !password || !server || !port) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate the email credentials by attempting to create a transporter
        try {
            const transporter = nodemailer.createTransport({
                host: server,
                port: port,
                secure: port === 465, // true for 465, false for other ports
                auth: {
                    user: email,
                    pass: password,
                },
            });

            // Verify the connection configuration
            await transporter.verify();
            console.log('Email credentials verified successfully');
        } catch (error) {
            console.error('Email verification failed:', error);
            return res.status(400).json({ error: 'Invalid email credentials. Please check your email, password, server, and port.' });
        }

        // Store the email connection in the database (encrypt sensitive data in a production environment)
        const emailConnection = await prisma.emailConnection.upsert({
            where: {
                userId: session.user.id as string,
            },
            update: {
                email,
                server,
                port,
                // In a production environment, you would encrypt the password
                // password: encryptedPassword,
                password, // Note: This is not secure for production
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id as string,
                email,
                server,
                port,
                // In a production environment, you would encrypt the password
                // password: encryptedPassword,
                password, // Note: This is not secure for production
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
            message: 'Email connected successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error connecting email:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 