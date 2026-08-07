import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: parseInt(__ENV.VUS || '25') },
    { duration: '10s', target: parseInt(__ENV.VUS || '25') },
    { duration: '2s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const url = __ENV.TARGET_URL || 'https://bursaliotoservis.com/tr';
  const res = http.get(url);
  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
  sleep(0.1);
}
