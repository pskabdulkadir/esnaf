module.exports = {
  apps: [
    {
      name: 'siftah-app',
      script: './dist/server.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        PRODUCTION_URL: 'http://localhost:3000'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'dist', '.backups', 'db_data.json', 'logs'],
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      kill_timeout: 5000,
    }
  ]
};
