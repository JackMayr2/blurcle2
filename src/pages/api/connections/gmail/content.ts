import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Define interface for label statistics
interface LabelStat {
    labelName: string;
    count: bigint | number;
}

// Helper function to make BigInt serializable
const serializeData = (data: any): any => {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data === 'bigint') {
        return data.toString();
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeData(item));
    }

    if (typeof data === 'object') {
        const result: Record<string, any> = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = serializeData(data[key]);
            }
        }
        return result;
    }

    return data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = session.user.id;

        // Check if user has Google account with Gmail scope
        const googleAccount = await prisma.account.findFirst({
            where: {
                userId,
                provider: 'google',
            },
        });

        if (!googleAccount) {
            return res.status(404).json({ error: 'Google account not connected' });
        }

        const hasGmailScope = googleAccount.scope?.includes('https://mail.google.com/');
        if (!hasGmailScope) {
            return res.status(403).json({
                error: 'Gmail access not authorized',
                needsReconnect: true
            });
        }

        // Get email connection or create one if it doesn't exist
        let emailConnection = await prisma.emailConnection.findUnique({
            where: { userId },
        });

        if (!emailConnection) {
            // Create a default email connection using the Google account email
            emailConnection = await prisma.emailConnection.create({
                data: {
                    userId,
                    email: session.user.email || '',
                    server: 'gmail',
                    port: 0,
                    password: '', // No password needed with OAuth
                }
            });
        }

        // Get emails with pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const label = req.query.label as string | undefined;

        // Build where clause based on whether a label filter is provided
        const whereClause = label
            ? { userId, labelName: label }
            : { userId };

        const emails = await prisma.email.findMany({
            where: whereClause,
            orderBy: { receivedAt: 'desc' },
            skip,
            take: limit,
        });

        // Get total count for pagination
        const totalEmails = await prisma.email.count({
            where: whereClause,
        });

        // Get label statistics
        const labelStatsRaw = await prisma.$queryRaw<LabelStat[]>`
      SELECT "labelName", COUNT(*) as "count"
      FROM "Email"
      WHERE "userId" = ${userId}
      GROUP BY "labelName"
      ORDER BY "count" DESC
    `;

        // Process label stats to ensure counts are numbers, not BigInts
        const labelStats = labelStatsRaw.map((stat: LabelStat) => ({
            labelName: stat.labelName,
            count: typeof stat.count === 'bigint' ? Number(stat.count) : stat.count
        }));

        // Serialize all data to handle BigInt values
        const serializedResponse = serializeData({
            connection: emailConnection,
            emails,
            pagination: {
                total: totalEmails,
                page,
                limit,
                pages: Math.ceil(totalEmails / limit),
            },
            labelStats,
        });

        return res.status(200).json(serializedResponse);
    } catch (error) {
        console.error('Error fetching Gmail content:', error);
        return res.status(500).json({ error: 'Failed to fetch Gmail content' });
    }
} 