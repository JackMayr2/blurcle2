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

        // Get the user's district and its files
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                district: {
                    include: {
                        files: {
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (!user?.district) {
            return Response.json({ error: 'District not found' }, { status: 404 });
        }

        return Response.json({ files: user.district.files });
    } catch (error) {
        console.error('Error fetching district files:', error);
        return Response.json(
            { error: 'Failed to fetch district files' },
            { status: 500 }
        );
    }
} 