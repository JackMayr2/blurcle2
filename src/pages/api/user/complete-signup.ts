import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

        const { role, organizationName } = req.body;
        console.log('Received data:', { role, organizationName });

        if (!role || !organizationName) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                role,
                organizationName,
                onboardingComplete: true
            },
            // Select all fields we need for the session
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                organizationName: true,
                onboardingComplete: true
            }
        });

        console.log('Updated user:', updatedUser);

        // Return complete user object for session update
        return res.json({
            message: 'Profile completed successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error completing signup:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 