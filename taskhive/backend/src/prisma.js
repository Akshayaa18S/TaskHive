const { Pool } = require("pg");
const dns = require("dns");

// 🔴 FORCE IPv4 DNS resolution (CRITICAL)
dns.setDefaultResultOrder("ipv4first");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("✅ Connected to Supabase Postgres via IPv4");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PG error", err);
  process.exit(1);
});

module.exports = pool;
