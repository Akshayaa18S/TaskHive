const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("✅ Connected to Supabase via pooler");
});

pool.on("error", (err) => {
  console.error("❌ PG error", err);
  process.exit(1);
});

module.exports = pool;
