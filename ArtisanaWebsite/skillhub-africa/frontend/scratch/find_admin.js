const { PrismaClient } = require('../src/generated/prisma/client');

const DATABASE_URL = "mysql://u633695266_Kalideone:Kalide789@srv1319.hstgr.io:3306/u633695266_Artisana?connect_timeout=30&sslmode=no-verify";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  try {
    const superuser = await prisma.users_user.findFirst({
      where: {
        is_superuser: true
      },
      select: {
        email: true,
        name: true,
        role: true
      }
    });

    if (superuser) {
      console.log('Superuser found:');
      console.log(JSON.stringify(superuser, null, 2));
    } else {
      console.log('No superuser found in the database.');
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
