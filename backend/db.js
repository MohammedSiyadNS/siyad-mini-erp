require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Handle unexpected errors on idle clients inside the pg pool to prevent process crashes
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message || err);
});

pool.query("SELECT 1")
  .then(() => {
    console.log("PostgreSQL Connected");
  })
  .catch((err) => {
    console.log("Database connection error");
    console.log(err);
  });

module.exports = pool;