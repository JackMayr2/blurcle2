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
                needsConnection: true
            });
        }

        // Get the user's Twitter profile
        const twitterProfile = await prisma.twitterProfile.findUnique({
            where: {
                userId: session.user.id,
            }
        });

        if (!twitterProfile) {
            return res.status(404).json({ error: 'Twitter profile not found' });
        }

        // Create Twitter API client
        const twitterClient = new TwitterApi(twitterAccount.access_token!);

        // Fetch user's tweets
        const tweets = await twitterClient.v2.userTimeline(twitterProfile.twitterId, {
            max_results: 100,
            'tweet.fields': ['created_at', 'public_metrics', 'attachments'],
            'media.fields': ['url', 'preview_image_url'],
            expansions: ['attachments.media_keys']
        });

        if (!tweets.data) {
            return res.status(500).json({ error: 'Failed to fetch tweets' });
        }

        // Process and store tweets
        const savedTweets = [];
        for (const tweet of tweets.data.data) {
            // Get media URLs if available
            const mediaUrls: string[] = [];
            if (tweet.attachments?.media_keys) {
                const mediaItems = tweets.includes?.media?.filter(media =>
                    tweet.attachments?.media_keys?.includes(media.media_key)
                );

                if (mediaItems) {
                    for (const media of mediaItems) {
                        if (media.url) {
                            mediaUrls.push(media.url);
                        } else if (media.preview_image_url) {
                            mediaUrls.push(media.preview_image_url);
                        }
                    }
                }
            }

            // Save tweet to database
            const savedTweet = await prisma.tweet.upsert({
                where: {
                    tweetId: tweet.id,
                },
                update: {
                    text: tweet.text,
                    likeCount: tweet.public_metrics?.like_count || 0,
                    retweetCount: tweet.public_metrics?.retweet_count || 0,
                    replyCount: tweet.public_metrics?.reply_count || 0,
                    quoteCount: tweet.public_metrics?.quote_count || 0,
                    mediaUrls: mediaUrls,
                },
                create: {
                    user: {
                        connect: {
                            id: session.user.id,
                        }
                    },
                    tweetId: tweet.id,
                    text: tweet.text,
                    tweetCreatedAt: new Date(tweet.created_at || Date.now()),
                    likeCount: tweet.public_metrics?.like_count || 0,
                    retweetCount: tweet.public_metrics?.retweet_count || 0,
                    replyCount: tweet.public_metrics?.reply_count || 0,
                    quoteCount: tweet.public_metrics?.quote_count || 0,
                    mediaUrls: mediaUrls,
                },
            });

            savedTweets.push(savedTweet);
        }

        return res.status(200).json({
            success: true,
            tweetsCount: savedTweets.length,
        });
    } catch (error) {
        console.error('Error fetching tweets:', error);
        return res.status(500).json({ error: 'Failed to fetch tweets' });
    }
} 