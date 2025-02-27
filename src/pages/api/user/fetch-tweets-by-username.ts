import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwitterApi } from 'twitter-api-v2';
import prisma from '@/lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Create a Twitter API client
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
        const readOnlyClient = client.readOnly;

        // Fetch user by username
        const user = await readOnlyClient.v2.userByUsername(username);
        if (!user.data) {
            return res.status(404).json({ error: 'Twitter user not found' });
        }

        // Fetch tweets
        const tweets = await readOnlyClient.v2.userTimeline(user.data.id, {
            max_results: 10,
            'tweet.fields': ['created_at', 'public_metrics', 'entities'],
            expansions: ['attachments.media_keys'],
            'media.fields': ['url', 'preview_image_url', 'type'],
        });

        if (!tweets.data.data || tweets.data.data.length === 0) {
            return res.status(404).json({ error: 'No tweets found for this user' });
        }

        // Process tweets and save to database
        const processedTweets = tweets.data.data.map((tweet) => {
            // Extract media URLs if available
            let mediaUrls: string[] = [];
            if (tweet.attachments?.media_keys && tweets.includes?.media) {
                mediaUrls = tweet.attachments.media_keys
                    .map((key) => {
                        const media = tweets.includes.media?.find((m) => m.media_key === key);
                        return media?.url || media?.preview_image_url || null;
                    })
                    .filter((url): url is string => url !== null);
            }

            return {
                tweetId: tweet.id,
                text: tweet.text,
                tweetCreatedAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
                likeCount: tweet.public_metrics?.like_count || 0,
                retweetCount: tweet.public_metrics?.retweet_count || 0,
                replyCount: tweet.public_metrics?.reply_count || 0,
                quoteCount: tweet.public_metrics?.quote_count || 0,
                mediaUrls: mediaUrls,
                userId: session.user.id,
                processed: false
            };
        });

        // Delete existing tweets for this user with the same tweet IDs
        const tweetIds = processedTweets.map(t => t.tweetId);

        // Use the correct model access
        await prisma.tweet.deleteMany({
            where: {
                userId: session.user.id,
                tweetId: {
                    in: tweetIds
                }
            },
        });

        // Save new tweets
        const savedTweets = [];
        for (const tweetData of processedTweets) {
            const savedTweet = await prisma.tweet.create({
                data: tweetData
            });
            savedTweets.push(savedTweet);
        }

        return res.status(200).json({ tweets: savedTweets });
    } catch (error) {
        console.error('Error fetching tweets by username:', error);
        return res.status(500).json({ error: 'Failed to fetch tweets' });
    }
} 