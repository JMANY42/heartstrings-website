module.exports = {
    name: "production",
    script: "./server.js",
    cwd: "/home/jmany42/Projects/heartstrings-website/backend/dist",
    watch: false, // production should not auto-reload
    instances: 1, // single instance; can use cluster if needed
    exec_mode: "cluster", // Enable cluster mode for better performance
    env: {
        NODE_ENV: "production",
        PORT: 5003
    },
    // Logging
    error_file: "/var/www/heartstrings-website/backend/logs/error.log",
    out_file: "/var/www/heartstrings-website/backend/logs/out.log",
    log_file: "/var/www/heartstrings-website/backend/logs/combined.log",
    time: true,
    // Auto-restart settings
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    max_memory_restart: "200M"
}