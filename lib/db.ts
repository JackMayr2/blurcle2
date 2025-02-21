import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
        include: {
            districts: true,
        },
    });
}

export async function getDistrictsByConsultant(consultantId: string) {
    return prisma.district.findMany({
        where: { consultantId },
    });
}

export async function createDistrict(data: {
    name: string;
    contactEmail?: string;
    contactName?: string;
    consultantId?: string;
}) {
    return prisma.district.create({
        data,
    });
}

export async function updateUser(userId: string, data: {
    onboardingComplete?: boolean;
    organizationName?: string;
    role?: 'district' | 'consultant';
    tier?: 'trial' | 'premium';
}) {
    return prisma.user.update({
        where: { id: userId },
        data,
    });
} 