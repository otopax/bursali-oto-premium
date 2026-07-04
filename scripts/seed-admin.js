// Bursalı Oto - Admin Kullanıcı Oluşturucu
// Bu script veritabanında admin kullanıcı oluşturur

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@bursalioto.com';
  const password = 'Bursali2026!';
  const hash = bcrypt.hashSync(password, 10);

  // Eğer zaten varsa güncelle, yoksa oluştur
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, globalRole: 'ADMIN' },
    create: {
      email,
      passwordHash: hash,
      globalRole: 'ADMIN',
    },
  });

  console.log('✅ Admin kullanıcı oluşturuldu/güncellendi:');
  console.log(`   📧 E-posta: ${email}`);
  console.log(`   🔑 Şifre:   ${password}`);
  console.log(`   🆔 ID:      ${user.id}`);
  console.log(`   👤 Rol:     ${user.globalRole}`);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
