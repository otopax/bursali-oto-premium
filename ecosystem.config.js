module.exports = {
  apps: [
    {
      name: "BursaliOtoWeb",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "CrawlerWorker",
      script: "src/scripts/worker.js",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
