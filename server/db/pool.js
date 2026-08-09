const { Pool } = require('pg');

// Connection string comes from the environment (Neon in production,
// a local .env file in development) — never hardcoded here.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
