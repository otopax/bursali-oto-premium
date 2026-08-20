const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Analyzing DTC Records in the local database...");
    const faultCodeCount = await prisma.faultCode.count();
    const vagDtcCount = await prisma.vagDtcCode.count();
    const vagFitmentCount = await prisma.vagDtcVehicleFitment.count();

    const faultCodesWithVehicle = await prisma.faultCode.count({
        where: { vehicleId: { not: null } }
    });

    console.log(`\nFaultCode Records: ${faultCodeCount}`);
    console.log(`FaultCode with Vehicle relation: ${faultCodesWithVehicle}`);
    
    console.log(`\nVagDtcCode Records: ${vagDtcCount}`);
    console.log(`VagDtcVehicleFitment Records: ${vagFitmentCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
