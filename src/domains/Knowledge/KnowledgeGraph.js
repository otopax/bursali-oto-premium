// 🚀 V5.0 FEATURE 5: Knowledge Graph üzerinde hiyerarşik sorgular.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class KnowledgeGraph {
  // Bir arıza kodundan başlayarak ilişkili tüm verileri getir (OEM -> Araç -> Motor -> ECU -> Sensör -> Video -> Parça)
  async getFaultDiagnosis(faultCode) {
    const result = await prisma.faultCode.findUnique({
      where: { code: faultCode },
      include: {
        vehicle: {
          include: {
            manufacturer: true,
            engines: {
              include: {
                ecus: {
                  include: {
                    sensors: true
                  }
                }
              }
            }
          }
        },
        sensor: true,
        repairVideos: true,
        parts: true
      }
    });

    if (!result) return null;

    // Hiyerarşik bir ağaç yapısı oluştur
    return {
      faultCode: result.code,
      description: result.description,
      severity: result.severity,
      vehicle: result.vehicle ? {
        manufacturer: result.vehicle.manufacturer.name,
        model: result.vehicle.model,
        year: result.vehicle.yearStart,
        engines: result.vehicle.engines.map(e => ({
          code: e.code,
          displacement: e.displacement,
          ecus: e.ecus.map(ecu => ({
            partNumber: ecu.partNumber,
            sensors: ecu.sensors.map(s => ({
              name: s.name,
              type: s.type,
              unit: s.unit
            }))
          }))
        }))
      } : null,
      affectedSensor: result.sensor ? result.sensor.name : null,
      repairResources: result.repairVideos.map(v => ({ title: v.title, url: v.url })),
      compatibleParts: result.parts.map(p => ({ name: p.name, oemNumber: p.oemNumber, price: p.price }))
    };
  }

  // Araç bazında yaygın arızaları getir (AI ile birleştirilebilir)
  async getCommonFailuresForVehicle(manufacturer, model, year) {
    const faults = await prisma.faultCode.findMany({
      where: {
        vehicle: {
          manufacturer: { name: manufacturer },
          model: model,
          yearStart: { lte: year },
          yearEnd: { gte: year }
        }
      },
      include: {
        repairVideos: { take: 1 },
        parts: { take: 3 }
      },
      take: 10
    });

    return faults.map(f => ({
      code: f.code,
      description: f.description,
      severity: f.severity,
      hasVideo: f.repairVideos.length > 0,
      hasParts: f.parts.length > 0
    }));
  }

  // Yeni bir araç ekleme (OEM -> Araç -> Motor -> ECU zinciri)
  async addVehicleGraph(data) {
    // data: { manufacturer, model, year, engineCode, ecus: [{ partNumber, sensors: [] }] }
    return prisma.$transaction(async (tx) => {
      // 1. Manufacturer'ı bul veya oluştur
      const manufacturer = await tx.manufacturer.upsert({
        where: { name: data.manufacturer },
        update: {},
        create: { name: data.manufacturer, country: 'Unknown' }
      });

      // 2. Vehicle'ı oluştur
      const vehicle = await tx.vehicle.create({
        data: {
          manufacturerId: manufacturer.id,
          model: data.model,
          yearStart: data.year,
          bodyType: 'Unknown',
          fuelType: 'Unknown'
        }
      });

      // 3. Engine oluştur
      const engine = await tx.engine.create({
        data: {
          vehicleId: vehicle.id,
          code: data.engineCode || 'UNKNOWN',
          cylinders: 4,
          displacement: 0,
          fuelSystem: 'Unknown'
        }
      });

      // 4. ECU ve Sensor'ları oluştur
      for (const ecuData of (data.ecus || [])) {
        const ecu = await tx.eCU.create({
          data: {
            engineId: engine.id,
            partNumber: ecuData.partNumber,
            softwareVersion: ecuData.softwareVersion || '1.0'
          }
        });
        for (const sensorName of (ecuData.sensors || [])) {
          await tx.sensor.create({
            data: {
              ecuId: ecu.id,
              name: sensorName,
              type: 'Unknown'
            }
          });
        }
      }

      return vehicle;
    });
  }
}

module.exports = new KnowledgeGraph();
