const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function test() {
  try {
    const count = await prisma.users_user.count();
    console.log('Database connection successful. User count:', count);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
