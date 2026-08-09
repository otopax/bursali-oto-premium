import * as Sentry from '@sentry/nextjs';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Capture exceptions and dispatch alerts to Sentry and Slack Webhook
 * @param {Error|string} error - Error object or error message
 * @param {Object} [context={}] - Additional context (user, path, tags)
 */
export async function captureAndAlertError(error, context = {}) {
  const errObj = typeof error === 'string' ? new Error(error) : error;

  // 1. Report to Sentry
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context.tags) scope.setTags(context.tags);
      if (context.extra) scope.setExtras(context.extra);
      if (context.user) scope.setUser(context.user);
      Sentry.captureException(errObj);
    });
  }

  console.error('🔴 [ErrorMonitor Captured]:', errObj.message, context);

  // 2. Dispatch Slack/Webhook Alert if configured
  if (SLACK_WEBHOOK_URL) {
    try {
      const payload = {
        text: `⚠️ *[Bursalı Oto Production Alert]*: ${errObj.message}`,
        attachments: [
          {
            color: '#dc2626',
            fields: [
              { title: 'Environment', value: process.env.NODE_ENV || 'production', short: true },
              { title: 'Service', value: 'bursali-oto-web', short: true },
              { title: 'Path', value: context.path || 'N/A', short: true },
              { title: 'Timestamp', value: new Date().toISOString(), short: true },
              { title: 'Stack Trace', value: `\`\`\`${errObj.stack ? errObj.stack.substring(0, 500) : 'N/A'}\`\`\``, short: false }
            ]
          }
        ]
      };

      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (webhookErr) {
      console.error('Slack webhook alert dispatch failed:', webhookErr.message);
    }
  }

  return { captured: true, timestamp: new Date().toISOString() };
}

export function initErrorMonitoring() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.2,
      environment: process.env.NODE_ENV || 'production'
    });
  }
}
