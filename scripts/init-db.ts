const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        // Clean up existing data if needed
        await prisma.district.deleteMany({});
        await prisma.user.deleteMany({});

        console.log('🗑️ Cleaned up existing data');

        // Create a test consultant user
        const consultant = await prisma.user.create({
            data: {
                email: 'test@consultant.com',
                name: 'Test Consultant',
                role: 'consultant',
                tier: 'trial',
                organizationName: 'Test Consulting LLC',
                onboardingComplete: true,
                districts: {
                    create: [
                        {
                            name: 'Sample District 1',
                            contactEmail: 'contact1@district.edu',
                            contactName: 'John Doe'
                        },
                        {
                            name: 'Sample District 2',
                            contactEmail: 'contact2@district.edu',
                            contactName: 'Jane Smith'
                        }
                    ]
                }
            }
        });

        // Create a test district user
        const district = await prisma.user.create({
            data: {
                email: 'test@district.edu',
                name: 'Test District',
                role: 'district',
                tier: 'trial',
                organizationName: 'Sample School District',
                onboardingComplete: false
            }
        });

        console.log('✅ Database seeded successfully');
        console.log('Created users:', { consultant, district });
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 