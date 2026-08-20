const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('k6-gate5c4-3rps.json');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let stats = {
    total_iterations: 0,
    dropped_iterations: 0,
    total_requests: 0,
    status_dist: {},
    error_code_dist: {},
    http_req_failed: 0,
    endpoint_reqs: { public: 0, search: 0, dtc: 0 },
    endpoint_fails: { public: 0, search: 0, dtc: 0 },
    start_utc: null,
    end_utc: null,
    vus: [],
    waiting: [],
    receiving: [],
    connecting: [],
    tls: [],
    duration: []
};

function pct(arr, p) {
    if (arr.length === 0) return 0;
    arr.sort((a,b) => a-b);
    let idx = Math.floor((arr.length - 1) * p);
    return arr[idx];
}
function max(arr) { return arr.length ? Math.max(...arr) : 0; }

rl.on('line', (line) => {
    let data;
    try { data = JSON.parse(line); } catch(e) { return; }
    
    if (data.type === 'Point' && data.data) {
        if (data.data.time) {
            let t = new Date(data.data.time).getTime();
            if (!isNaN(t)) {
                if (!stats.start_utc || t < stats.start_utc) stats.start_utc = t;
                if (!stats.end_utc || t > stats.end_utc) stats.end_utc = t;
            }
        }
        
        if (data.metric === 'iterations') stats.total_iterations++;
        if (data.metric === 'dropped_iterations') stats.dropped_iterations++;
        if (data.metric === 'vus') stats.vus.push(data.data.value);
        if (data.metric === 'http_reqs') {
            stats.total_requests++;
            let status = data.data.tags.status || 'unknown';
            stats.status_dist[status] = (stats.status_dist[status]||0) + 1;
            
            let err = data.data.tags.error_code || 'none';
            stats.error_code_dist[err] = (stats.error_code_dist[err]||0) + 1;
            
            let endpoint = data.data.tags.endpoint_type || 'unknown';
            if (stats.endpoint_reqs[endpoint] !== undefined) stats.endpoint_reqs[endpoint]++;
            
            let expected = data.data.tags.expected_response;
            if (expected === "false") {
                stats.http_req_failed++;
                if (stats.endpoint_fails[endpoint] !== undefined) stats.endpoint_fails[endpoint]++;
            }
        }
        if (data.metric === 'http_req_waiting') stats.waiting.push(data.data.value);
        if (data.metric === 'http_req_receiving') stats.receiving.push(data.data.value);
        if (data.metric === 'http_req_connecting') stats.connecting.push(data.data.value);
        if (data.metric === 'http_req_tls_handshaking') stats.tls.push(data.data.value);
        if (data.metric === 'http_req_duration') stats.duration.push(data.data.value);
    }
});

rl.on('close', () => {
    let vu_min = stats.vus.length ? Math.min(...stats.vus) : 0;
    let vu_max = stats.vus.length ? Math.max(...stats.vus) : 0;
    
    let dt_start = stats.start_utc ? new Date(stats.start_utc).toISOString() : 'UNKNOWN';
    let dt_end = stats.end_utc ? new Date(stats.end_utc).toISOString() : 'UNKNOWN';

    console.log(JSON.stringify({
        total_iterations: stats.total_iterations,
        dropped_iterations: stats.dropped_iterations,
        total_requests: stats.total_requests,
        status_dist: stats.status_dist,
        error_code_dist: stats.error_code_dist,
        http_req_failed: stats.http_req_failed,
        endpoint_reqs: stats.endpoint_reqs,
        endpoint_fails: stats.endpoint_fails,
        vu_min, vu_max,
        start_utc: dt_start,
        end_utc: dt_end,
        duration_p50: pct(stats.duration, 0.5),
        duration_p90: pct(stats.duration, 0.9),
        duration_p95: pct(stats.duration, 0.95),
        duration_p99: pct(stats.duration, 0.99),
        duration_max: max(stats.duration),
        waiting_p95: pct(stats.waiting, 0.95),
        waiting_p99: pct(stats.waiting, 0.99),
        waiting_max: max(stats.waiting),
        receiving_p95: pct(stats.receiving, 0.95),
        receiving_p99: pct(stats.receiving, 0.99),
        receiving_max: max(stats.receiving),
        connecting_p95: pct(stats.connecting, 0.95),
        connecting_p99: pct(stats.connecting, 0.99),
        connecting_max: max(stats.connecting),
        tls_p95: pct(stats.tls, 0.95),
        tls_p99: pct(stats.tls, 0.99),
        tls_max: max(stats.tls),
    }, null, 2));
});
