import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, role, tier, organizationName } = req.body;

        const user = await prisma.user.create({
            data: {
                email,
                role,
                tier,
                organizationName,
                trialEndsAt: tier === 'trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null, // 14 days trial
            },
        });

        res.status(200).json(user);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
} 