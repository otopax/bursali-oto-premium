import schedules from '@/data/maintenance-schedules.json';

// Maintenance Repository (Phase 3)
// Abstracting the data source so we can swap JSON with Prisma later without changing UI code.

export class MaintenanceRepository {
  /**
   * Retrieves maintenance schedule for a specific vehicle at a specific mileage.
   */
  static async getSchedule(brand, model, mileage) {
    const b = (brand || '').toLowerCase();
    const m = (model || '').toLowerCase();
    
    // Nearest mileage logic (e.g., if user enters 62000, snap to 60000)
    const normalizedMileage = this.snapToNearestInterval(mileage);

    try {
      if (schedules[b]) {
        let targetModel = m;
        // If model not provided or doesn't exist, fallback to first available model for that brand
        if (!targetModel || !schedules[b][targetModel]) {
          targetModel = Object.keys(schedules[b])[0];
        }

        if (schedules[b][targetModel] && schedules[b][targetModel][normalizedMileage]) {
          return {
            success: true,
            brand: b,
            model: targetModel,
            mileage: normalizedMileage,
            items: schedules[b][targetModel][normalizedMileage]
          };
        }
      }
      
      return {
        success: false,
        error: 'Bu araç veya kilometre için bakım verisi bulunamadı.'
      };
    } catch (error) {
      console.error('MaintenanceRepository Error:', error);
      return { success: false, error: 'Sistem hatası.' };
    }
  }

  /**
   * Snaps a given mileage to standard maintenance intervals (15k, 30k, 60k, 120k, etc.)
   */
  static snapToNearestInterval(mileage) {
    const intervals = [15000, 30000, 45000, 60000, 90000, 120000];
    return intervals.reduce((prev, curr) => 
      Math.abs(curr - mileage) < Math.abs(prev - mileage) ? curr : prev
    ).toString();
  }
}
