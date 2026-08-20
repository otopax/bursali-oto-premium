import http from 'k6/http';
import { check } from 'k6';

export let options = {
    scenarios: {
        constant_load: {
            executor: 'constant-arrival-rate',
            rate: 3,         // 3 RPS exactly
            timeUnit: '1s',
            duration: '10m',
            preAllocatedVUs: 15,
            maxVUs: 100,
            gracefulStop: '30s',
        },
    },
    thresholds: {
        http_req_failed: ['rate==0.0'],
    }
};

const BASE_URL = 'https://www.bursaliotoservis.com';

const publicRoutes = [
    `${BASE_URL}/`,
    `${BASE_URL}/hakkimizda`,
    `${BASE_URL}/hizmetler`
];

const searchQueries = ['motor', 'fren', 'zzzzz_nonexistent'];

const dtcRoutes = [
    `${BASE_URL}/ariza-kodlari/P0011`,
    `${BASE_URL}/ariza-kodlari/P0300`
];

export default function () {
    let rand = Math.random();
    let res;
    
    // Test Correlation ID
    let correlationId = `gate5c4-VU${__VU}-ITER${__ITER}-${new Date().getTime()}`;
    let headers = {
        'X-K6-Correlation-Id': correlationId,
        'User-Agent': 'K6-Gate5C4-SRE'
    };

    if (rand < 0.70) {
        const route = publicRoutes[Math.floor(Math.random() * publicRoutes.length)];
        res = http.get(route, { headers, tags: { endpoint_type: 'public' } });
        check(res, { 'Public status 200': (r) => r.status === 200 });
    } else if (rand < 0.85) {
        const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
        res = http.get(`${BASE_URL}/api/search?q=${query}`, { headers, tags: { endpoint_type: 'search' } });
        check(res, { 'Search status 200': (r) => r.status === 200 });
    } else {
        const route = dtcRoutes[Math.floor(Math.random() * dtcRoutes.length)];
        res = http.get(route, { headers, tags: { endpoint_type: 'dtc' } });
        check(res, { 'DTC status 200': (r) => r.status === 200 });
    }
    
    // NO SLEEP: constant-arrival-rate executor schedules iterations exactly at the specified rate.
}
