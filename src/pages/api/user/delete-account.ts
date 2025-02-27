import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        district: true,
        consultantDistricts: true,
        emailConnection: true,
        emails: true,
        twitterProfile: true,
        tweets: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Begin deletion process
    await prisma.$transaction(async (tx) => {
      // Delete tweets
      if (user.tweets.length > 0) {
        await tx.tweet.deleteMany({
          where: { userId: user.id },
        });
      }

      // Delete Twitter profile
      if (user.twitterProfile) {
        await tx.twitterProfile.delete({
          where: { userId: user.id },
        });
      }

      // Delete emails
      if (user.emails.length > 0) {
        await tx.email.deleteMany({
          where: { userId: user.id },
        });
      }

      // Delete email connection
      if (user.emailConnection) {
        await tx.emailConnection.delete({
          where: { userId: user.id },
        });
      }

      // Delete files associated with district if user is a district representative
      if (user.district) {
        await tx.file.deleteMany({
          where: { districtId: user.district.id },
        });

        // Delete district
        await tx.district.delete({
          where: { id: user.district.id },
        });
      }

      // Handle consultant-district relationships
      if (user.consultantDistricts.length > 0) {
        // Remove consultant role from districts
        await tx.district.updateMany({
          where: { consultantId: user.id },
          data: { consultantId: null },
        });
      }

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // Delete accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId: user.id },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return res.status(200).json({ message: 'Account successfully deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}
