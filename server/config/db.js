/**
 * MySQL connection pool (mysql2/promise).
 * Credentials come from environment variables.
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool(process.env.MYSQL_URL || {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'econquest',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
