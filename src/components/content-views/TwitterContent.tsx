import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface Tweet {
    id: string;
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
    name: string;
    profileImageUrl: string;
    description: string;
    followersCount: number;
    followingCount: number;
}

interface TwitterContentProps {
    onError?: (error: string) => void;
}

const TwitterContent: React.FC<TwitterContentProps> = ({ onError }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<TwitterProfile | null>(null);
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);

    useEffect(() => {
        const fetchTwitterContent = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/connections/twitter/content');

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch Twitter content');
                }

                const data = await response.json();
                console.log('Twitter content data:', data);

                setProfile(data.profile);
                setTweets(data.tweets || []);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                console.error('Error fetching Twitter content:', errorMessage);
                setError(errorMessage);
                if (onError) onError(errorMessage);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        fetchTwitterContent();
    }, [onError, refreshing]);

    const handleRefresh = () => {
        setRefreshing(true);
    };

    if (loading && !refreshing) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">No Twitter profile found. Try reconnecting your account.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (tweets.length === 0) {
        return (
            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                            {profile.profileImageUrl && (
                                <img
                                    src={profile.profileImageUrl}
                                    alt={profile.name}
                                    className="w-16 h-16 rounded-full"
                                />
                            )}
                            <div>
                                <h3 className="text-lg font-bold">{profile.name}</h3>
                                <p className="text-gray-500">@{profile.username}</p>
                                {profile.description && (
                                    <p className="text-gray-700 mt-2">{profile.description}</p>
                                )}
                                <div className="flex space-x-4 mt-2">
                                    <div>
                                        <span className="font-bold">{profile.followersCount.toLocaleString()}</span>
                                        <span className="text-gray-500 ml-1">Followers</span>
                                    </div>
                                    <div>
                                        <span className="font-bold">{profile.followingCount.toLocaleString()}</span>
                                        <span className="text-gray-500 ml-1">Following</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                No tweets have been imported yet. Use the "Update" button on the Twitter card to import tweets.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                        {profile.profileImageUrl && (
                            <img
                                src={profile.profileImageUrl}
                                alt={profile.name}
                                className="w-16 h-16 rounded-full"
                            />
                        )}
                        <div>
                            <h3 className="text-lg font-bold">{profile.name}</h3>
                            <p className="text-gray-500">@{profile.username}</p>
                            {profile.description && (
                                <p className="text-gray-700 mt-2">{profile.description}</p>
                            )}
                            <div className="flex space-x-4 mt-2">
                                <div>
                                    <span className="font-bold">{profile.followersCount.toLocaleString()}</span>
                                    <span className="text-gray-500 ml-1">Followers</span>
                                </div>
                                <div>
                                    <span className="font-bold">{profile.followingCount.toLocaleString()}</span>
                                    <span className="text-gray-500 ml-1">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tweets Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recent Tweets</h3>
                    <div className="flex space-x-2">
                        <a
                            href={`https://twitter.com/${profile.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            View Profile
                        </a>
                    </div>
                </div>

                {selectedTweet ? (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                {profile.profileImageUrl && (
                                    <img
                                        src={profile.profileImageUrl}
                                        alt={profile.name}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                )}
                                <div>
                                    <h4 className="font-bold">{profile.name}</h4>
                                    <p className="text-gray-500">@{profile.username}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTweet(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-gray-800 whitespace-pre-line text-lg mb-4">{selectedTweet.text}</p>

                        {selectedTweet.mediaUrls && selectedTweet.mediaUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {selectedTweet.mediaUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Media ${index + 1}`}
                                        className="rounded-md max-h-80 object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-3 text-sm text-gray-500">
                            {new Date(selectedTweet.tweetCreatedAt).toLocaleString()}
                        </div>

                        <div className="mt-4 flex space-x-6 text-gray-500 text-sm">
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                </svg>
                                {selectedTweet.retweetCount} Retweets
                            </div>
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {selectedTweet.likeCount} Likes
                            </div>
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                {selectedTweet.replyCount} Replies
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t flex justify-end space-x-2">
                            <a
                                href={`https://twitter.com/${profile.username}/status/${selectedTweet.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                View on Twitter
                            </a>
                            <button
                                onClick={() => setSelectedTweet(null)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Back to list
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tweets.map((tweet) => (
                            <div key={tweet.id} className="bg-white rounded-lg shadow p-4">
                                <p className="text-gray-800 whitespace-pre-line">{tweet.text}</p>

                                {tweet.mediaUrls && tweet.mediaUrls.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {tweet.mediaUrls.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Media ${index + 1}`}
                                                className="rounded-md max-h-48 object-cover"
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="mt-3 text-sm text-gray-500">
                                    {new Date(tweet.tweetCreatedAt).toLocaleString()}
                                </div>

                                <div className="mt-2 flex justify-between items-center">
                                    <div className="flex space-x-6 text-gray-500 text-sm">
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                            </svg>
                                            {tweet.retweetCount}
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                            {tweet.likeCount}
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                            {tweet.replyCount}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSelectedTweet(tweet)}
                                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            View Details
                                        </button>
                                        <a
                                            href={`https://twitter.com/${profile.username}/status/${tweet.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                            Twitter
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwitterContent; 