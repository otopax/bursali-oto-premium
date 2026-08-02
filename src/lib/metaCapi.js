import crypto from 'crypto';

/**
 * Meta Conversions API (CAPI) Dispatcher with event_id Deduplication
 * Deduplicates browser pixel events and server-side events using matching event_id.
 */

export function generateEventId(eventName, identifier) {
  const nonce = crypto.randomBytes(4).toString('hex');
  return crypto
    .createHash('sha256')
    .update(`${eventName}:${identifier}:${Date.now()}:${nonce}`)
    .digest('hex');
}

export async function sendMetaCapiEvent({
  eventName,
  eventId,
  userEmail,
  userPhone,
  clientIpAddress,
  clientUserAgent,
  customData = {},
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[Meta CAPI] Skipped: META_PIXEL_ID or META_CAPI_ACCESS_TOKEN missing in environment.');
    return { success: false, reason: 'unconfigured' };
  }

  const hashData = (data) => {
    if (!data) return undefined;
    return crypto.createHash('sha256').update(String(data).trim().toLowerCase()).digest('hex');
  };

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        user_data: {
          em: hashData(userEmail),
          ph: hashData(userPhone),
          client_ip_address: clientIpAddress,
          client_user_agent: clientUserAgent,
        },
        custom_data: customData,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error('[Meta CAPI Error]', result);
      return { success: false, error: result };
    }

    console.log(`[Meta CAPI] ✅ Event '${eventName}' sent with event_id: ${eventId}`);
    return { success: true, result };
  } catch (err) {
    console.error('[Meta CAPI Dispatch Error]', err.message);
    return { success: false, error: err.message };
  }
}
