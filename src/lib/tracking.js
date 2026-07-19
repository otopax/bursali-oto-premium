export const trackEvent = (eventName, params = {}) => {
  const sendEvent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    } else {
      // Development or GA not loaded yet
      console.log(`[GA4 Event] ${eventName}:`, params);
    }
  };

  // INP Optimization: Use requestIdleCallback to not block the main thread during interaction
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(sendEvent, { timeout: 2000 });
  } else {
    // Fallback for browsers that don't support requestIdleCallback (e.g. Safari)
    setTimeout(sendEvent, 1);
  }
};
