const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete all codes that have a vehicleId because FaultCodes shouldn't be tied to specific vehicles anymore, 
  // they are universal. The crawler incorrectly mapped fusebox file paths to Vehicle models for FaultCodes.
  const deleted = await prisma.faultCode.deleteMany({
    where: {
      vehicleId: { not: null }
    }
  });
  console.log(`Deleted ${deleted.count} fault codes that had incorrect vehicle associations.`);

  // Also delete the ones with null description if any
  const deletedDescriptions = await prisma.faultCode.deleteMany({
    where: {
      description: ''
    }
  });
  console.log(`Deleted ${deletedDescriptions.count} fault codes with empty descriptions.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
