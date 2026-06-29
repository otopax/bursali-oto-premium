const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@bursalioto.com';
  const plainPassword = 'admin'; // Dev password

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(plainPassword, salt);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin'
    }
  });

  console.log('Admin user created successfully:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
