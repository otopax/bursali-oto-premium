require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, '../public/ariza_kodlari_data');

async function runSeeder() {
  console.log("🚀 Starting DB Seeder from Local JSON Files...");

  if (!fs.existsSync(DATA_DIR)) {
    console.log("❌ No local data directory found!");
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  
  if (files.length === 0) {
    console.log("⚠️ No JSON files to process.");
    return;
  }

  console.log(`📦 Found ${files.length} JSON files to inject.`);

  for (const file of files) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const code = data.code;

      console.log(`\n⏳ Injecting ${code}...`);

      // 1. Upsert Fault Code
      const faultCodeRecord = await prisma.faultCode.upsert({
        where: { code: code },
        update: {
          description: data.description,
          severity: data.severity,
          symptoms: data.symptoms || [],
          commonCauses: data.commonCauses || [],
          stepByStepSolution: data.stepByStepSolution || [],
          estimatedCostInfo: data.estimatedCostInfo,
          videoAnalysis: data.videoAnalysis || null,
        },
        create: {
          code: code,
          description: data.description,
          severity: data.severity,
          symptoms: data.symptoms || [],
          commonCauses: data.commonCauses || [],
          stepByStepSolution: data.stepByStepSolution || [],
          estimatedCostInfo: data.estimatedCostInfo,
          videoAnalysis: data.videoAnalysis || null,
        }
      });

      console.log(`✅ Upserted FaultCode: ${code} (ID: ${faultCodeRecord.id})`);

      // 2. Insert Repair Videos
      if (data.videos && Array.isArray(data.videos)) {
        for (const video of data.videos) {
          try {
            await prisma.repairVideo.upsert({
              where: { url: video.url },
              update: {
                title: video.title,
                duration: video.duration || null,
                thumbnail: video.thumbnail || null,
                faultCodeId: faultCodeRecord.id,
              },
              create: {
                title: video.title,
                url: video.url,
                source: video.source || "YouTube",
                duration: video.duration || null,
                thumbnail: video.thumbnail || null,
                faultCodeId: faultCodeRecord.id,
              }
            });
            console.log(`  🎥 Upserted Video: ${video.title}`);
          } catch (vidErr) {
            console.log(`  ⚠️ Failed to upsert video ${video.url}:`, vidErr.message);
          }
        }
      }

    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error.message);
    }
  }

  console.log("\n🎉 Seeding Complete!");
  await prisma.$disconnect();
}

runSeeder().catch(e => {
  console.error("Critical Seeder Error:", e);
  process.exit(1);
});
