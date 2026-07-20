/**
 * Policy-based RBAC (Faz 2.5)
 * Kullanıcı yetki kontrollerini merkezileştiren yapı.
 */

// Varsayılan roller ve yetkileri (JSON tabanlı - DB patlamasını önler)
const DEFAULT_POLICIES = {
  SUPER_ADMIN: ['*'], // Her şeye yetkili
  ADMIN: [
    'Vehicle.Read', 'Vehicle.Write', 'Vehicle.Delete',
    'Invoice.Read', 'Invoice.Create', 'Invoice.Export', 'Invoice.Delete',
    'Customer.Read', 'Customer.Write', 'Customer.Delete',
    'User.Read', 'User.Write', 'User.Delete',
    'GooglePost.Create'
  ],
  MANAGER: [
    'Vehicle.Read', 'Vehicle.Write', 
    'Invoice.Read', 'Invoice.Create', 'Invoice.Export',
    'Customer.Read', 'Customer.Write',
    'GooglePost.Create'
  ],
  ADVISOR: [
    'Vehicle.Read', 'Vehicle.Write',
    'Invoice.Read', 'Invoice.Create',
    'Customer.Read', 'Customer.Write'
  ],
  MECHANIC: [
    'Vehicle.Read', 'Vehicle.Write'
  ],
  VIP_CUSTOMER: [
    'Vehicle.Read', 'Invoice.Read', 'Appointment.Create'
  ],
  CUSTOMER: [
    'Vehicle.Read', 'Invoice.Read', 'Appointment.Create'
  ],
  GUEST: [
    'Vehicle.ReadPublic'
  ],
  BOT: ['*'],
  SCHEDULER: ['Job.Execute', 'Report.Generate'],
  WEBHOOK: ['Event.Publish', 'Data.Sync']
};

/**
 * Kullanıcının belirtilen eylemi yapmaya yetkisi olup olmadığını kontrol eder.
 * @param {Object} user - JWT'den veya DB'den gelen kullanıcı/apikey nesnesi
 * @param {string} action - Yapılmak istenen eylem (örn: "Invoice.Delete")
 * @param {string|null} resourceOwnerId - Kaynağın sahibinin ID'si (context-aware politikalar için)
 * @returns {boolean}
 */
export function can(user, action, resourceOwnerId = null) {
  if (!user || (!user.role && !user.scopes)) return false;

  // 1. ApiKey Scopes kontrolü (Eğer bu bir ApiKey ise)
  if (user.type === 'API_KEY' && user.scopes) {
    if (user.scopes.includes('*') || user.scopes.includes(action)) {
      return true;
    }
    // ApiKey için rol bazlı default izinlere düşülebilir ama scopes daha güvenlidir.
  }

  const role = user.role ? user.role.toUpperCase() : null;

  if (role) {
    // 2. Süper yetki kontrolü
    if (DEFAULT_POLICIES[role] && DEFAULT_POLICIES[role].includes('*')) {
      return true;
    }

    // 3. Özel (override) izinler (Eğer veritabanından çekilip token'a konulduysa)
    if (user.permissions && Array.isArray(user.permissions)) {
      // Override listesinde açıkça verilmişse
      if (user.permissions.includes(action)) {
        return true;
      }
      // Override listesinde açıkça yasaklanmışsa (-Invoice.Delete gibi bir notasyon kullanılabilir)
      if (user.permissions.includes(`-${action}`)) {
        return false;
      }
    }

    // 4. Varsayılan rol izinleri
    const defaultPermissions = DEFAULT_POLICIES[role] || [];
    let hasPermission = defaultPermissions.includes(action);

    // 5. Context-aware (Sahip) kontrolü (Eğer kaynak kişinin kendisine aitse)
    if (!hasPermission && resourceOwnerId && user.id === resourceOwnerId) {
      // Kişi kendi kaynağını okuyabilir/düzenleyebilir (Senaryoya göre genişletilebilir)
      const allowedSelfActions = ['Vehicle.Read', 'Invoice.Read', 'Appointment.Read', 'Appointment.Create', 'Customer.Write'];
      if (allowedSelfActions.includes(action)) {
        hasPermission = true;
      }
    }

    if (hasPermission) return true;
  }

  return false;
}
