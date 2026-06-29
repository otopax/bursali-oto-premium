module.exports = {
  apps: [
    {
      name: 'bursali-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster'
    },
    {
      name: 'bursali-worker-outbox',
      script: 'src/scripts/startWorkers.js',
      instances: 3, // 3 pod, ama Redlock sayesinde sadece 1'i aktif
      exec_mode: 'cluster'
    },
    {
      name: 'bursali-worker-consumer',
      script: 'src/scripts/startConsumers.js', // Varsayılan BullMQ tüketicisi
      instances: 2
    }
  ]
};
