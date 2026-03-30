/**
 * MySQL connection pool (mysql2/promise).
 * Credentials come from environment variables.
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool(process.env.MYSQL_URL || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log(process.env.MYSQL_URL)

module.exports = pool;
