import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { UserRole, UserTier } from '@/types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        console.log('Complete signup - Session:', session);

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Not authenticated or missing email' });
        }

        const { role, organizationName } = req.body;
        console.log('Complete signup - Input:', { role, organizationName });

        if (!role || !organizationName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Start a transaction to ensure both user and district (if needed) are created
        const result = await prisma.$transaction(async (tx) => {
            // Update user
            const user = await tx.user.update({
                where: {
                    email: session.user.email as string // Type assertion since we checked it exists
                },
                data: {
                    role,
                    organizationName,
                    onboardingComplete: true,
                    tier: 'trial' as UserTier,
                    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
                },
            });

            // If user is a district representative, create a district record
            if (role === 'district') {
                const district = await tx.district.create({
                    data: {
                        name: organizationName,
                        contactEmail: user.email || '',
                        contactName: user.name || undefined,
                        userId: user.id,
                    }
                });
                return { user, district };
            }

            return { user };
        });

        console.log('Complete signup - Final result:', result);
        res.status(200).json(result);
    } catch (error) {
        console.error('Complete signup error:', error);
        res.status(500).json({
            error: 'Failed to complete signup',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 