import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

type ApiHandler = (
    req: NextApiRequest,
    res: NextApiResponse,
    session: Session
) => Promise<void | NextApiResponse>;

export const withAuth = (handler: ApiHandler) => async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return handler(req, res, session);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}; 