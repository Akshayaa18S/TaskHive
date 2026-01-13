const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  family: 4, // ⭐ FORCE IPv4 (THIS FIXES ENETUNREACH)
});

pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
  process.exit(1);
});

module.exports = pool;
