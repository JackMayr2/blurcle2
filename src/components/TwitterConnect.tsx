import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';

interface Tweet {
    id: string;
    tweetId: string;
    text: string;
    tweetCreatedAt: string;
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    quoteCount: number;
    mediaUrls: string[];
}

interface TwitterProfile {
    id: string;
    username: string;
    name: string | null;
    profileImageUrl: string | null;
    description: string | null;
    followersCount: number;
    followingCount: number;
}

export default function TwitterConnect() {
    const { data: session } = useSession();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [profile, setProfile] = useState<TwitterProfile | null>(null);
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [showUsernameInput, setShowUsernameInput] = useState(false);

    // Check if user has Twitter connected
    useEffect(() => {
        const checkTwitterAccount = async () => {
            try {
                const response = await fetch('/api/user/check-twitter-account');
                const data = await response.json();

                if (data.hasTwitterProfile) {
                    await fetchTwitterProfile();
                    // Automatically fetch tweets if profile exists
                    if (data.twitterConnected) {
                        fetchTweets();
                    }
                }
            } catch (err) {
                console.error('Error checking Twitter account:', err);
            }
        };

        if (session) {
            checkTwitterAccount();
        }
    }, [session]);

    // Connect Twitter account
    const connectTwitter = async () => {
        if (!session) {
            return;
        }

        try {
            setIsConnecting(true);
            setError(null);

            // If not connected, redirect to Twitter OAuth
            if (!session.user.twitterConnected) {
                await signIn('twitter', { callbackUrl: window.location.href });
                return;
            }

            // If already connected, fetch profile
            const response = await fetch('/api/user/connect-twitter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.needsConnection) {
                    await signIn('twitter', { callbackUrl: window.location.href });
                    return;
                }
                throw new Error(data.message || data.error || 'Failed to connect Twitter account');
            }

            setProfile(data.profile);
            fetchTweets();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsConnecting(false);
        }
    };

    // Fetch Twitter profile
    const fetchTwitterProfile = async () => {
        try {
            const response = await fetch('/api/user/connect-twitter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.needsConnection) {
                    return; // Don't show error, just don't load profile
                }
                throw new Error(data.error || 'Failed to fetch Twitter profile');
            }

            setProfile(data.profile);
        } catch (err: any) {
            console.error('Error fetching Twitter profile:', err);
        }
    };

    // Fetch tweets
    const fetchTweets = async () => {
        try {
            setIsFetching(true);
            setError(null);
            setSuccessMessage(null);

            const response = await fetch('/api/user/fetch-tweets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch tweets');
            }

            // Fetch the stored tweets
            const tweetsResponse = await fetch('/api/user/get-tweets');
            const tweetsData = await tweetsResponse.json();

            if (!tweetsResponse.ok) {
                throw new Error(tweetsData.error || 'Failed to get tweets');
            }

            setTweets(tweetsData.tweets);
            setSuccessMessage(`Successfully imported ${tweetsData.tweets.length} tweets from your Twitter account.`);

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsFetching(false);
        }
    };

    // Fetch tweets by username
    const fetchTweetsByUsername = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Please enter a Twitter username');
            return;
        }

        try {
            setIsFetching(true);
            setError(null);
            setSuccessMessage(null);

            const response = await fetch('/api/user/fetch-tweets-by-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch tweets');
            }

            setTweets(data.tweets);
            setSuccessMessage(`Successfully fetched ${data.tweets.length} tweets from @${username}`);

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Twitter/X Integration</h2>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {!session?.user?.twitterConnected ? (
                <div>
                    <p className="mb-4">Connect your Twitter/X account to import your tweets or enter a Twitter username to fetch tweets without logging in.</p>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        <button
                            onClick={connectTwitter}
                            disabled={isConnecting}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium text-lg"
                        >
                            {isConnecting ? 'Connecting...' : 'Connect Twitter/X'}
                        </button>

                        <span className="text-gray-500">or</span>

                        <button
                            onClick={() => setShowUsernameInput(!showUsernameInput)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-medium"
                        >
                            {showUsernameInput ? 'Hide Username Input' : 'Enter Username Instead'}
                        </button>
                    </div>

                    {showUsernameInput && (
                        <form onSubmit={fetchTweetsByUsername} className="mt-4">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-grow">
                                    <label htmlFor="username" className="sr-only">Twitter Username</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">@</span>
                                        </div>
                                        <input
                                            type="text"
                                            id="username"
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                                            placeholder="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isFetching || !username.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                                >
                                    {isFetching ? 'Fetching...' : 'Fetch Tweets'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="mt-4 text-sm text-gray-500">
                        Debug: Session has twitterConnected = {String(session?.user?.twitterConnected)}
                    </p>
                </div>
            ) : (
                <div>
                    {profile ? (
                        <div className="mb-6 flex items-center">
                            {profile.profileImageUrl && (
                                <img
                                    src={profile.profileImageUrl}
                                    alt={profile.name || profile.username}
                                    className="w-12 h-12 rounded-full mr-3"
                                />
                            )}
                            <div>
                                <h3 className="font-medium">{profile.name}</h3>
                                <p className="text-gray-600">@{profile.username}</p>
                                <div className="text-sm text-gray-500 mt-1">
                                    <span className="mr-3">{profile.followersCount} followers</span>
                                    <span>{profile.followingCount} following</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mb-4">Loading profile...</p>
                    )}

                    <div className="mb-4 flex flex-wrap gap-2">
                        <button
                            onClick={fetchTweets}
                            disabled={isFetching}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {isFetching ? 'Fetching...' : 'Fetch My Tweets'}
                        </button>

                        <button
                            onClick={() => setShowUsernameInput(!showUsernameInput)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
                        >
                            {showUsernameInput ? 'Hide Username Input' : 'Fetch Other User\'s Tweets'}
                        </button>
                    </div>

                    {showUsernameInput && (
                        <form onSubmit={fetchTweetsByUsername} className="mt-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-grow">
                                    <label htmlFor="username" className="sr-only">Twitter Username</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">@</span>
                                        </div>
                                        <input
                                            type="text"
                                            id="username"
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                                            placeholder="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isFetching || !username.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                                >
                                    {isFetching ? 'Fetching...' : 'Fetch Tweets'}
                                </button>
                            </div>
                        </form>
                    )}

                    {tweets.length > 0 ? (
                        <div>
                            <h3 className="font-medium mb-3">
                                {session?.user?.twitterConnected ? 'Your Tweets' : `Tweets from @${username}`}
                            </h3>
                            <div className="space-y-4">
                                {tweets.map(tweet => (
                                    <div key={tweet.id} className="border rounded p-3">
                                        <p>{tweet.text}</p>
                                        {tweet.mediaUrls.length > 0 && (
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                {tweet.mediaUrls.map((url, index) => (
                                                    <img
                                                        key={index}
                                                        src={url}
                                                        alt="Tweet media"
                                                        className="rounded max-h-40 object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-2 text-sm text-gray-500 flex space-x-4">
                                            <span>{new Date(tweet.tweetCreatedAt).toLocaleDateString()}</span>
                                            <span>❤️ {tweet.likeCount}</span>
                                            <span>🔄 {tweet.retweetCount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p>No tweets found. {session?.user?.twitterConnected ? 'Click "Fetch Latest Tweets" to import your tweets.' : 'Enter a Twitter username to fetch tweets.'}</p>
                    )}
                </div>
            )}
        </div>
    );
} 