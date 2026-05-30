// ecosystem.config.js
// PM2 Cluster Mode Configuration untuk Parfum Store

/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "parfum-store",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/parfum-store",

      // ─── Cluster mode ────────────────────────────────────────────────────
      instances: "max",      // Gunakan semua CPU core
      exec_mode: "cluster",  // Fork + load balance

      // ─── Environment ─────────────────────────────────────────────────────
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // ─── Auto restart ─────────────────────────────────────────────────────
      // Restart jika penggunaan memori melebihi 512MB
      max_memory_restart: "512M",

      // Restart delay (backoff)
      restart_delay: 3000,
      max_restarts: 10,

      // ─── Logs ─────────────────────────────────────────────────────────────
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/pm2/parfum-store-error.log",
      out_file: "/var/log/pm2/parfum-store-out.log",
      merge_logs: true,

      // Log rotation (pm2-logrotate module)
      // Install: pm2 install pm2-logrotate
      // pm2 set pm2-logrotate:max_size 50M
      // pm2 set pm2-logrotate:retain 7

      // ─── Watch & Reload ───────────────────────────────────────────────────
      watch: false,  // Disable di production, gunakan pm2 reload saat deploy

      // ─── Health check ─────────────────────────────────────────────────────
      health_check_grace_period: 3000,

      // ─── Zero-downtime reload ─────────────────────────────────────────────
      // Gunakan: pm2 reload parfum-store
      // Tiap instance akan di-reload satu per satu
      kill_timeout: 5000,  // Waktu tunggu sebelum force kill (ms)
      listen_timeout: 8000, // Waktu tunggu sebelum instance dianggap ready

      // ─── Node.js flags ────────────────────────────────────────────────────
      node_args: [
        "--max-old-space-size=512",  // Batasi heap JS per instance
      ],
    },
  ],
};
