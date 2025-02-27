import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get the user's Twitter account
        const twitterAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'twitter',
            },
            select: {
                access_token: true,
                refresh_token: true,
                providerAccountId: true,
            }
        });

        if (!twitterAccount) {
            return res.status(404).json({
                error: 'No Twitter account found',
                needsConnection: true,
                message: 'Please connect your Twitter account first'
            });
        }

        // Create Twitter API client
        const twitterClient = new TwitterApi(twitterAccount.access_token!);
        const twitterUser = await twitterClient.v2.me({
            'user.fields': ['description', 'profile_image_url', 'public_metrics']
        });

        if (!twitterUser.data) {
            return res.status(500).json({ error: 'Failed to fetch Twitter user data' });
        }

        // Store Twitter profile in database
        const twitterProfile = await prisma.twitterProfile.upsert({
            where: {
                twitterId: twitterUser.data.id,
            },
            update: {
                username: twitterUser.data.username,
                name: twitterUser.data.name,
                description: twitterUser.data.description,
                profileImageUrl: twitterUser.data.profile_image_url,
                followersCount: twitterUser.data.public_metrics?.followers_count || 0,
                followingCount: twitterUser.data.public_metrics?.following_count || 0,
                updatedAt: new Date(),
            },
            create: {
                user: {
                    connect: {
                        id: session.user.id,
                    }
                },
                twitterId: twitterUser.data.id,
                username: twitterUser.data.username,
                name: twitterUser.data.name,
                description: twitterUser.data.description,
                profileImageUrl: twitterUser.data.profile_image_url,
                followersCount: twitterUser.data.public_metrics?.followers_count || 0,
                followingCount: twitterUser.data.public_metrics?.following_count || 0,
            },
        });

        // Update user to mark Twitter as connected
        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                twitterConnected: true,
            },
        });

        return res.status(200).json({
            success: true,
            profile: twitterProfile
        });
    } catch (error) {
        console.error('Error connecting Twitter account:', error);
        return res.status(500).json({ error: 'Failed to connect Twitter account' });
    }
} 