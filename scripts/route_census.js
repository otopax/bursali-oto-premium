const urls = [
    'https://www.bursaliotoservis.com/',
    'https://www.bursaliotoservis.com/hakkimizda',
    'https://www.bursaliotoservis.com/hizmetlerimiz',
    'https://www.bursaliotoservis.com/ariza-kodlari/P0011',
    'https://www.bursaliotoservis.com/ariza-kodlari/P0300'
];

async function check() {
    for (const url of urls) {
        try {
            const start = Date.now();
            const res = await fetch(url, { method: 'HEAD' });
            const time = Date.now() - start;
            console.log(`URL: ${url} | Status: ${res.status} | Time: ${time}ms`);
        } catch (e) {
            console.log(`URL: ${url} | Error: ${e.message}`);
        }
    }
}
check();
