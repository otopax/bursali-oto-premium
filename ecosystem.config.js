// PM2 process manager — crash-loop koruması + memory guard aktif
// Bkz. yol haritası Bölüm 3.4 / 6.5
module.exports = {
  apps: [
    {
      name: 'bursali-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '1G',        // Bellek 1GB'yi geçerse restart
      min_uptime: '30s',               // 30sn ayakta kalmadan çökerse crash-loop sayılır
      max_restarts: 10,                // 15 dakikada 10 restart üstü = durdur, alarm ver
      restart_delay: 5000,             // Restartlar arası 5sn bekle
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bursali-worker-outbox',
      script: 'src/scripts/startWorkers.js',
      instances: 3,                    // 3 pod, Redlock sayesinde sadece 1'i aktif
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '512M',
      min_uptime: '30s',
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bursali-worker-consumer',
      script: 'src/scripts/startConsumers.js',
      instances: 2,
      autorestart: true,
      max_memory_restart: '512M',
      min_uptime: '30s',
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
