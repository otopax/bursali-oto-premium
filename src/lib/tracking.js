export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  } else {
    // Development or GA not loaded yet
    console.log(`[GA4 Event] ${eventName}:`, params);
  }
};
