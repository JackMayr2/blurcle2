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

        // Get all files for the user's district
        const result = await prisma.user.findUnique({
            where: {
                id: session.user.id
            },
            include: {
                district: {
                    include: {
                        files: {
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    }
                }
            }
        });

        if (!result?.district) {
            return Response.json({ error: 'District not found' }, { status: 404 });
        }

        return Response.json({ files: result.district.files });
    } catch (error) {
        console.error('Error fetching district files:', error);
        return Response.json(
            { error: 'Failed to fetch district files' },
            { status: 500 }
        );
    }
} 