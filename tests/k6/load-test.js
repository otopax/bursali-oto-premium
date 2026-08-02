import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 100 },
    { duration: '20s', target: 500 },
    { duration: '30s', target: 1000 },
    { duration: '60s', target: 1000 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const res = http.get(`${baseUrl}/api/health/live`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'TTFB < 150ms': (r) => r.timings.waiting < 150,
  });
  sleep(1);
}
