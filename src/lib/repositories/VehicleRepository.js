import { prisma } from '@/lib/prisma';

export class VehicleRepository {
  /**
   * Müşterinin şasi numarasına göre aracını ve son servis kayıtlarını getirir
   * @param {string} vin - 17 Haneli Şasi Numarası
   */
  static async getVehicleWithHistory(vin) {
    if (!vin) return null;

    try {
      return await prisma.customerVehicle.findFirst({
        where: { vin },
        include: { 
          serviceHistories: { orderBy: { date: 'desc' }, take: 3 },
          workOrders: { 
            where: { status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
            take: 3,
            include: { items: true }
          }
        }
      });
    } catch (error) {
      console.error("VehicleRepository.getVehicleWithHistory Error:", error);
      throw error;
    }
  }
}
