import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 1 }, // Stage 1 (Warmup): 1 RPS
        { duration: '60s', target: 2 }, // Stage 2 (Normal Load): 2 RPS
        { duration: '60s', target: 5 }, // Stage 3 (Burst): 5 RPS
        { duration: '30s', target: 1 }, // Stage 4 (Recovery): 1 RPS
    ],
    thresholds: {
        http_req_failed: ['rate==0.0'], // EXACTLY 0% errors (No 5xx)
        http_req_duration: ['p(95)<=500'], // Search/Global p95 tolerance
    }
};

const BASE_URL = 'https://www.bursaliotoservis.com';

const publicRoutes = [
    `${BASE_URL}/`,
    `${BASE_URL}/hakkimizda`,
    `${BASE_URL}/hizmetler`
];

const searchQueries = [
    'motor',              // HIGH
    'fren',               // LOW
    'zzzzz_nonexistent'   // ZERO
];

const dtcRoutes = [
    `${BASE_URL}/ariza-kodlari/P0011`,
    `${BASE_URL}/ariza-kodlari/P0300`
];

export default function () {
    let rand = Math.random();
    let res;

    // Traffic Mix: 70% Public, 15% Search, 15% DTC (AI is excluded as per GATE 6 scope)
    if (rand < 0.70) {
        // Public Pages
        const route = publicRoutes[Math.floor(Math.random() * publicRoutes.length)];
        res = http.get(route);
        check(res, { 'Public status 200': (r) => r.status === 200 });
    } else if (rand < 0.85) {
        // Search API
        const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
        res = http.get(`${BASE_URL}/api/search?q=${query}`);
        check(res, { 'Search status 200': (r) => r.status === 200 });
    } else {
        // DTC / pSEO
        const route = dtcRoutes[Math.floor(Math.random() * dtcRoutes.length)];
        res = http.get(route);
        check(res, { 'DTC status 200': (r) => r.status === 200 });
    }
    
    // Attempt to space requests evenly per VU (approx 1 sec)
    sleep(1);
}
