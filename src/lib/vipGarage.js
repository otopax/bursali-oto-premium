import { prisma } from '@/lib/prisma';

/**
 * VIP Garaj — Plaka + Telefon ile aracın servis/iş emri durumunu getirir.
 * Tek doğruluk kaynağı: hem /api/vip/auth hem Sanal Usta (getServiceStatus) bunu kullanır.
 * Güvenlik: plaka + kayıtlı telefon eşleşmesi zorunlu (mevcut VIP giriş modeliyle aynı).
 *
 * @param {string} plate
 * @param {string} phone
 * @returns {Promise<null | {vehicleInfo, customerInfo, serviceName, history}>}
 */
export async function getVehicleServiceStatus(plate, phone) {
  if (!plate || !phone) return null;

  const cleanPlate = String(plate).replace(/\s+/g, '').toUpperCase();
  const cleanPhone = String(phone).replace(/\s+/g, '');

  const vehicle = await prisma.customerVehicle.findFirst({
    where: {
      plate: cleanPlate,
      customer: { phone: cleanPhone },
    },
    include: {
      customer: true,
      workOrders: {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      },
      tenant: { select: { name: true } },
    },
  });

  if (!vehicle) return null;

  return {
    vehicleInfo: {
      id: vehicle.id,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
    },
    customerInfo: {
      firstName: vehicle.customer.firstName,
      lastName: vehicle.customer.lastName,
    },
    serviceName: vehicle.tenant?.name,
    history: vehicle.workOrders,
  };
}
