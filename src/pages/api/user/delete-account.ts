import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { signOut } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = session.user.id;

        // Transaction to delete all user data
        await prisma.$transaction(async (tx) => {
            // Delete tweets
            await tx.tweet.deleteMany({
                where: { userId },
            });

            // Delete Twitter profile
            await tx.twitterProfile.deleteMany({
                where: { userId },
            });

            // Delete emails
            await tx.email.deleteMany({
                where: { userId },
            });

            // Delete email connection
            await tx.emailConnection.deleteMany({
                where: { userId },
            });

            // Get district ID if user has one
            const district = await tx.district.findFirst({
                where: { userId },
            });

            if (district) {
                // Delete files associated with the district
                await tx.file.deleteMany({
                    where: { districtId: district.id },
                });

                // Delete district
                await tx.district.delete({
                    where: { id: district.id },
                });
            }

            // Delete sessions
            await tx.session.deleteMany({
                where: { userId },
            });

            // Delete accounts (OAuth connections)
            await tx.account.deleteMany({
                where: { userId },
            });

            // Finally, delete the user
            await tx.user.delete({
                where: { id: userId },
            });
        });

        return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return res.status(500).json({ error: 'Failed to delete account', details: error instanceof Error ? error.message : 'Unknown error' });
    }
} 