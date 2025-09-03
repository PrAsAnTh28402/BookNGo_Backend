const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => console.log("✅ Connected to PostgreSQL"));
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL error:", err);
  process.exit(-1);
});

module.exports = pool;



// const { Pool } = require("pg");
// require("dotenv").config();

// const isLocal = process.env.DB_HOST === "localhost";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: isLocal ? false : { rejectUnauthorized: false }, // 👈 Local = no SSL, Neon = SSL
// });

// pool.on("connect", () => console.log("✅ Connected to PostgreSQL"));
// pool.on("error", (err) => {
//   console.error("❌ Unexpected PostgreSQL error:", err);
//   process.exit(-1);
// });

// module.exports = pool;
