const fs = require('fs');
const models = `
// ----- FUSE BOX DATA (Mining Bot) -----
model FuseBox {
  id        String   @id @default(uuid())
  brand     String
  model     String
  year      String
  name      String?  // Sigorta kutusu adı (Örn: Motor İçi)
  fuses     Fuse[]
  createdAt DateTime @default(now())

  @@index([brand, model, year])
}

model Fuse {
  id          String   @id @default(uuid())
  fuseBoxId   String
  fuseBox     FuseBox  @relation(fields: [fuseBoxId], references: [id], onDelete: Cascade)
  fuseNumber  String   // Sigorta numarası (Örn: "1")
  type        String?  // Sigorta tipi (Örn: "mini")
  amp         Float?   // Amper (Örn: 15)
  description String   // Açıklama
  createdAt   DateTime @default(now())
}
`;
fs.appendFileSync('prisma/schema.prisma', models);
console.log('Schema appended successfully!');
