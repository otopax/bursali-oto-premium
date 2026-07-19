/**
 * Production Analytics Helper (Phase 4)
 * Pushes custom events to Google Analytics (gtag) or other providers
 */

export const AnalyticsEvent = {
  // Araç/Kullanıcı İşlemleri
  VEHICLE_ADDED: 'Vehicle_Added',
  VEHICLE_UPDATED: 'Vehicle_Updated',
  SERVICE_REMINDER_CLICK: 'Service_Reminder_Click',
  
  // Teşhis ve Arama
  VIN_DECODE_SUCCESS: 'VIN_Decode_Success',
  VIN_DECODE_FAILURE: 'VIN_Decode_Failure',
  OBD_RESULT_VIEW: 'OBD_Result_View',
  MAINTENANCE_SEARCH: 'Maintenance_Search',
  
  // Sanal Usta
  AI_CHAT_STARTED: 'AI_Chat_Started',
  AI_TOOL_USED: 'AI_Tool_Used',
  
  // Dönüşüm (Conversion)
  QUOTE_REQUEST: 'Quote_Request',
  BOOKING_COMPLETED: 'Booking_Completed',
  WHATSAPP_CLICK: 'WhatsApp_Click',
  PHONE_CLICK: 'Phone_Click',
  PDF_DOWNLOAD: 'PDF_Download',
};

/**
 * Tracks an event globally.
 * Make sure Google Analytics (gtag.js) is loaded in layout.js.
 * 
 * @param {string} eventName - Kategori / Olay Adı (Örn: 'WhatsApp_Click')
 * @param {object} params - Ek parametreler (Örn: { brand: 'BMW', model: '320i' })
 */
export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
      console.debug(`[Analytics] Tracked: ${eventName}`, params);
    } else {
      // Development mode veya adblocker aktif
      console.debug(`[Analytics (Dry Run)] Tracked: ${eventName}`, params);
    }
  } catch (error) {
    console.error(`[Analytics] Error tracking event ${eventName}:`, error);
  }
}
