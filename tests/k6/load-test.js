import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Stage 1: 100 VUs
    { duration: '1m',  target: 100 },
    { duration: '30s', target: 500 },  // Stage 2: 500 VUs
    { duration: '1m',  target: 500 },
    { duration: '30s', target: 1000 }, // Stage 3: 1000 Peak VUs
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.001'], // Failure rate strictly < 0.1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // LOAD-A: Cached DTC Page
  const resA = http.get(`${BASE_URL}/tr/ariza-cozumleri/p0420`);
  check(resA, {
    'LOAD-A status 200': (r) => r.status === 200,
    'LOAD-A duration < 500ms': (r) => r.timings.duration < 500,
  });

  // LOAD-B: Uncached / Cold DTC Index Search
  const resB = http.get(`${BASE_URL}/tr/ariza-cozumleri?q=lambda`);
  check(resB, {
    'LOAD-B status 200': (r) => r.status === 200,
  });

  // LOAD-C: Public Health & Ready API
  const resC = http.get(`${BASE_URL}/api/health/ready`);
  check(resC, {
    'LOAD-C status 200': (r) => r.status === 200,
  });

  // LOAD-D: Unauthorized Admin Call Block Check
  const resD = http.get(`${BASE_URL}/api/admin/metrics`);
  check(resD, {
    'LOAD-D status 401': (r) => r.status === 401,
  });

  sleep(1);
}
