module.exports = {
  apps: [{
    name: 'claude-backend',
    script: 'src/index.js',
    cwd: '/root/p3/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PORT: 3300,
      NODE_ENV: 'development'
    }
  }]
};
