import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Quick script to create initial admin and test users
 * Run with: npx ts-node scripts/seed-users.ts
 */
async function main() {
    console.log('🌱 Seeding users...\n');

    // Create Admin User
    const adminHash = await bcrypt.hash('admin123', 10);

    try {
        const admin = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {},
            create: {
                email: 'admin@example.com',
                passwordHash: adminHash,
                roles: ['ADMIN', 'AGENT'],
                mfaEnabled: false,
            },
        });

        console.log('✅ Admin created:');
        console.log('   Email: admin@example.com');
        console.log('   Password: admin123');
        console.log('   Roles:', admin.roles);
        console.log('   ID:', admin.id);
        console.log('');
    } catch (e) {
        console.log('⚠️  Admin user already exists');
    }

    // Create Regular User
    const userHash = await bcrypt.hash('password123', 10);

    try {
        const user = await prisma.user.upsert({
            where: { email: 'user@example.com' },
            update: {},
            create: {
                email: 'user@example.com',
                passwordHash: userHash,
                roles: ['USER'],
                mfaEnabled: false,
            },
        });

        console.log('✅ Regular user created:');
        console.log('   Email: user@example.com');
        console.log('   Password: password123');
        console.log('   Roles:', user.roles);
        console.log('   ID:', user.id);
        console.log('');
    } catch (e) {
        console.log('⚠️  Regular user already exists');
    }

    // Create Agent User
    const agentHash = await bcrypt.hash('agent123', 10);

    try {
        const agent = await prisma.user.upsert({
            where: { email: 'agent@example.com' },
            update: {},
            create: {
                email: 'agent@example.com',
                passwordHash: agentHash,
                roles: ['AGENT', 'USER'],
                mfaEnabled: false,
            },
        });

        console.log('✅ Agent user created:');
        console.log('   Email: agent@example.com');
        console.log('   Password: agent123');
        console.log('   Roles:', agent.roles);
        console.log('   ID:', agent.id);
        console.log('');
    } catch (e) {
        console.log('⚠️  Agent user already exists');
    }

    console.log('🎉 Seeding complete!\n');
    console.log('You can now use these credentials in Postman:');
    console.log('   Admin:  admin@example.com / admin123');
    console.log('   Agent:  agent@example.com / agent123');
    console.log('   User:   user@example.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
