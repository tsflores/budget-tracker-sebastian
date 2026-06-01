module.exports = {
  apps: [
    {
      name: 'financeflow-api',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
    },
  ],
};
