import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Production CDN benchmark (1000 VU):
    // { duration: '30s', target: 100 },
    // { duration: '1m',  target: 100 },
    // { duration: '30s', target: 500 },
    // { duration: '1m',  target: 500 },
    // { duration: '30s', target: 1000 },
    // { duration: '30s', target: 0 },
    //
    // Local single-node benchmark (100 VU peak):
    { duration: '15s', target: 50 },   // Ramp to 50 VUs
    { duration: '30s', target: 50 },   // Sustain 50 VUs
    { duration: '15s', target: 100 },  // Ramp to 100 Peak VUs
    { duration: '30s', target: 100 },  // Sustain 100 Peak VUs
    { duration: '15s', target: 0 },    // Cooldown
  ],
  thresholds: {
    // Production CDN thresholds (Cloudflare + Redis):
    // http_req_duration: ['p(95)<500', 'p(99)<1000'],
    // http_req_failed: ['rate<0.001'],
    //
    // Local single-node thresholds:
    http_req_duration: ['p(95)<8000', 'p(99)<20000'],
    http_req_failed: ['rate<0.30'], // Includes intentional 401s from LOAD-D (~25% of requests)
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // LOAD-A: Fault Code Page
  const resA = http.get(`${BASE_URL}/tr/ariza-kodlari/p0420`);
  check(resA, {
    'LOAD-A status 200': (r) => r.status === 200,
    'LOAD-A duration < 10s': (r) => r.timings.duration < 10000,
  });

  // LOAD-B: Uncached / Cold Search Page
  const resB = http.get(`${BASE_URL}/tr/ariza-kodlari`);
  check(resB, {
    'LOAD-B status 200': (r) => r.status === 200,
  });

  // LOAD-C: Public Health & Ready API
  const resC = http.get(`${BASE_URL}/api/health/ready`);
  check(resC, {
    'LOAD-C status 200': (r) => r.status === 200,
  });

  // LOAD-D: Unauthorized Admin Call Block Check (401 is EXPECTED, not a failure)
  const resD = http.get(`${BASE_URL}/api/admin/metrics`, {
    responseType: 'text',
    tags: { expected_status: '401' },
  });
  check(resD, {
    'LOAD-D status 401': (r) => r.status === 401,
  });

  sleep(1);
}
