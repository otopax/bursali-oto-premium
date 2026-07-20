import http from 'k6/http';
import { check, sleep } from 'k6';

// Sprint 5: Chaos & Resilience Testing
// Bu script 1000'e kadar çıkan Concurrent User simülasyonunu hedefler.
export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 500 },  // Spike to 500 users
    { duration: '1m', target: 500 },   // Stay at 500 users
    { duration: '30s', target: 1000 }, // Peak load 1000 users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<800'], // 95% of requests must complete below 300ms, 99% below 800ms
    http_req_failed: ['rate<0.01'],                // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Public sayfaların testleri
  const res = http.get(`${BASE_URL}/tr`);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'has fast response': (r) => r.timings.duration < 500,
  });

  // Gözlemlenebilirlik Doğrulaması (Chaos endpoint'i denemesi - yetkisiz olarak dönmeli)
  const chaosRes = http.post(`${BASE_URL}/api/admin/chaos`, JSON.stringify({ scenario: 'redis_down' }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(chaosRes, {
    'chaos api blocks unauthorized': (r) => r.status === 403,
  });

  sleep(1);
}
