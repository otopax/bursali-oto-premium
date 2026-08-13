const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== GATE 11-A.1 FALLBACK FORENSIC ===\n");

  // Helper to test errors
  const testError = async (query, expectedCode) => {
    try {
      await prisma.$queryRawUnsafe(query);
      return { actualError: null, bubbled: false, fellBack: false };
    } catch (error) {
      // Log the exact structure
      // console.log("Raw Error Object:", error.name, error.code, error.meta);
      
      // Let's implement the logic exactly as it needs to be to catch it
      // Based on Prisma: raw query errors usually have error.code = 'P2010' and error.meta.code = '42703'
      // But let's check both just in case.
      const isMissingColumn = error?.code === '42703' || (error?.meta && error.meta.code === '42703');
      const isUnknownFunction = error?.code === '42883' || (error?.meta && error.meta.code === '42883');
      const is42704 = error?.code === '42704' || (error?.meta && error.meta.code === '42704');
      
      let fellBack = false;
      let bubbled = true;

      if (isMissingColumn || isUnknownFunction) {
         fellBack = true;
         bubbled = false;
      }

      const exactCode = error.code;
      const exactMetaCode = error.meta ? error.meta.code : 'undefined';
      const actualPostgresCode = exactCode === 'P2010' ? exactMetaCode : exactCode;
      
      return { 
         exactCode,
         exactMetaCode,
         actualPostgresCode,
         isMissingColumn,
         isUnknownFunction,
         is42704,
         fellBack,
         bubbled
      };
    }
  };

  // 1. 42703
  const res1 = await testError(`SELECT search_vector_english FROM "public"."Fuse" LIMIT 1`, '42703');
  console.log(`42703:\nerror.code = ${res1.exactCode}\nerror.meta.code = ${res1.exactMetaCode}\nfallback = ${res1.fellBack ? 'TRUE' : 'FALSE'}\nresult = ${res1.fellBack && res1.actualPostgresCode === '42703' ? 'PASS' : 'FAIL'}\n`);

  // 2. 42883
  const res2 = await testError(`SELECT fake_function_xyz()`, '42883');
  console.log(`42883:\nerror.code = ${res2.exactCode}\nerror.meta.code = ${res2.exactMetaCode}\nfallback = ${res2.fellBack ? 'TRUE' : 'FALSE'}\nresult = ${res2.fellBack && res2.actualPostgresCode === '42883' ? 'PASS' : 'FAIL'}\n`);

  // 3. 42704
  const res3 = await testError(`SELECT to_tsvector('fake_dict', 'test')`, '42704');
  console.log(`42704:\nerror.code = ${res3.exactCode}\nerror.meta.code = ${res3.exactMetaCode}\nfallback = ${res3.fellBack ? 'TRUE' : 'FALSE'}\nbubbled = ${res3.bubbled ? 'TRUE' : 'FALSE'}\nresult = ${res3.bubbled && !res3.fellBack && res3.actualPostgresCode === '42704' ? 'PASS' : 'FAIL'}\n`);

  // 4. Network/timeout
  const badPrisma = new PrismaClient({ datasources: { db: { url: "postgresql://postgres:bad@10.255.255.1:5432/fake?connect_timeout=1" } } });
  try {
     await badPrisma.$queryRawUnsafe(`SELECT 1`);
     console.log(`Network/timeout:\nfallback = FALSE\nbubbled = FALSE\nresult = FAIL\n`);
  } catch(error) {
     const isMissingColumn = error?.code === '42703' || (error?.meta && error.meta.code === '42703');
     const isUnknownFunction = error?.code === '42883' || (error?.meta && error.meta.code === '42883');
     const fellBack = isMissingColumn || isUnknownFunction;
     console.log(`Network/timeout:\nerror.code = ${error.code}\nfallback = ${fellBack ? 'TRUE' : 'FALSE'}\nbubbled = ${!fellBack ? 'TRUE' : 'FALSE'}\nresult = ${!fellBack ? 'PASS' : 'FAIL'}\n`);
  }
  await badPrisma.$disconnect();
  await prisma.$disconnect();

}

run().catch(console.error);
