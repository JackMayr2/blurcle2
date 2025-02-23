import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First get the user's district
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                district: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!user?.district) {
            return Response.json({ error: 'District not found' }, { status: 404 });
        }

        // Then get the files separately
        const files = await prisma.file.findMany({
            where: {
                districtId: user.district.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return Response.json({ files });
    } catch (error) {
        console.error('Error fetching district files:', error);
        return Response.json(
            { error: 'Failed to fetch district files' },
            { status: 500 }
        );
    }
} 