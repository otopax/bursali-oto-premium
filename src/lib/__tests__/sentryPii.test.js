import { describe, it, expect } from 'vitest';

function scrubPII(event) {
  if (!event) return event;

  const phoneRegex = /(05\d{9}|\+905\d{9})/g;
  const plateRegex = /\b(0[1-9]|[1-7][0-9]|8[01])\s?[A-Z]{1,3}\s?\d{2,4}\b/gi;
  const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  const redactString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(phoneRegex, '[REDACTED_PHONE]')
      .replace(plateRegex, '[REDACTED_PLATE]')
      .replace(vinRegex, '[REDACTED_VIN]')
      .replace(emailRegex, '[REDACTED_EMAIL]');
  };

  const redactObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = redactString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        redactObject(obj[key]);
      }
    }
    return obj;
  };

  if (event.user) {
    delete event.user.ip_address;
    delete event.user.email;
    delete event.user.username;
  }

  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-forwarded-for'];
    }
    if (event.request.url) {
      event.request.url = redactString(event.request.url);
    }
  }

  if (event.breadcrumbs) {
    event.breadcrumbs.forEach(b => {
      if (b.message) b.message = redactString(b.message);
      if (b.data) redactObject(b.data);
    });
  }

  if (event.exception && event.exception.values) {
    event.exception.values.forEach(e => {
      if (e.value) e.value = redactString(e.value);
    });
  }

  return redactObject(event);
}

describe('Sentry PII Scrubbing (Gate 7)', () => {
  it('redacts phone, plate, VIN, email, and IP address from event', () => {
    const rawEvent = {
      user: { ip_address: '192.168.1.50', email: 'test@example.com' },
      request: {
        url: 'https://bursalioto.com/api/chat?phone=05321234567',
        headers: { cookie: 'session=123', 'x-forwarded-for': '1.2.3.4' }
      },
      exception: {
        values: [{ value: 'Error for plate 48 ABC 123 and VIN WBA12345678901234' }]
      }
    };

    const scrubbed = scrubPII(rawEvent);

    expect(scrubbed.user.ip_address).toBeUndefined();
    expect(scrubbed.user.email).toBeUndefined();
    expect(scrubbed.request.headers.cookie).toBeUndefined();
    expect(scrubbed.request.headers['x-forwarded-for']).toBeUndefined();
    expect(scrubbed.request.url).toContain('[REDACTED_PHONE]');
    expect(scrubbed.exception.values[0].value).toContain('[REDACTED_PLATE]');
    expect(scrubbed.exception.values[0].value).toContain('[REDACTED_VIN]');
  });
});
