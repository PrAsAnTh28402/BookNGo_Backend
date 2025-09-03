// dbTest.js
const { Pool } = require('pg');

// Configure your database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bookngo',
  password: '280402',
  port: 5432, 
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully!');

    // Optional: Run a test query
    const result = await client.query('SELECT NOW() AS current_time');
    console.log('Current time from DB:', result.rows[0].current_time);

    client.release(); // release client back to pool
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

testConnection();
