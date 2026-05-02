const { PrismaClient } = require('./src/generated/prisma');

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.users_user.count();
    console.log(`Connection successful! Total users: ${count}`);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
