import type { Prisma } from '@prisma/client';
import type { User, District, File } from '@prisma/client';

// Re-export the Prisma types
export type {
    User,
    District,
    File
};

// Define types based on Prisma schema
export type EmailConnection = {
    id: string;
    email: string;
    server: string;
    port: number;
    password: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Email = {
    id: string;
    userId: string;
    messageId: string;
    labelId: string;
    labelName: string;
    subject: string;
    from: string;
    to: string;
    body: string;
    receivedAt: Date;
    createdAt: Date;
    processed: boolean;
};

export type TwitterProfile = {
    id: string;
    userId: string;
    twitterId: string;
    username: string;
    name?: string | null;
    profileImageUrl?: string | null;
    description?: string | null;
    followersCount: number;
    followingCount: number;
    createdAt: Date;
    updatedAt: Date;
};

export type Tweet = {
    id: string;
    userId: string;
    tweetId: string;
    text: string;
    createdAt: Date;
    tweetCreatedAt: Date;
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    quoteCount: number;
    mediaUrls: string[];
    processed: boolean;
};

// Extended types with relations
export interface UserWithRelations extends User {
    district?: District;
    consultantDistricts?: District[];
    emailConnection?: EmailConnection;
    emails?: Email[];
    twitterProfile?: TwitterProfile;
    tweets?: Tweet[];
}

export interface DistrictWithRelations extends District {
    user: User;
    consultant?: User;
    files?: File[];
}

// Input types for creating/updating records
export type UserCreateInput = Omit<User, 'id' | 'createdAt'>;
export type DistrictCreateInput = Omit<District, 'id' | 'createdAt' | 'updatedAt'>;
export type FileCreateInput = Omit<File, 'id' | 'createdAt' | 'updatedAt'>; 