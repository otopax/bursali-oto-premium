import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 5 }, // Stage 1 (Sustained): 5 RPS for 10 minutes
    ],
    thresholds: {
        http_req_failed: ['rate==0.0'], // EXACTLY 0% errors (No 5xx)
    }
};

const BASE_URL = 'http://localhost:3055';

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

    // Traffic Mix: 70% Public, 15% Search, 15% DTC
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
    
    // Attempt to space requests evenly per VU
    sleep(1);
}
