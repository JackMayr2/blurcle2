import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First get the user's district
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                district: true
            }
        });

        if (!user?.district) {
            return Response.json({ error: 'District not found' }, { status: 404 });
        }

        // Then get the district's files
        const files = await prisma.district.findUnique({
            where: {
                id: user.district.id
            },
            include: {
                files: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        }).then(district => district?.files || []);

        return Response.json({ files });
    } catch (error) {
        console.error('Error fetching district files:', error);
        return Response.json(
            { error: 'Failed to fetch district files' },
            { status: 500 }
        );
    }
} 