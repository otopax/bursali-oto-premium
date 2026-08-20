import http from 'k6/http';
import { check, sleep } from 'k6';

// Test Configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp-up to 50 users over 1 minute
    { duration: '3m', target: 200 }, // Ramp-up and hold at 200 users for 3 minutes
    { duration: '1m', target: 0 },   // Ramp-down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

// Yük bindirilecek URL listesi (OOM yaratan kritik rotalar)
const BASE_URL = 'https://staging.bursaliotoservis.com';

export default function () {
  const endpoints = [
    `${BASE_URL}/tr/sanal-usta`,
    `${BASE_URL}/tr/fethiye/bmw-servisi`,
    `${BASE_URL}/api/vehicle-tree` // Asenkron cache performansını test eder
  ];

  // Rastgele bir endpoint seç
  const url = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  // İsteği gönder
  const res = http.get(url);

  // Doğrulama yap
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response body is not empty': (r) => r.body && r.body.length > 0,
  });

  // Kullanıcı bekleme süresini (Think time) simüle et (0.5 sn - 2 sn)
  sleep(Math.random() * 1.5 + 0.5);
}
