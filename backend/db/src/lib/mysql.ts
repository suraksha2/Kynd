import mysql from 'mysql2/promise';

// Update these values with your MySQL server credentials
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root123',
  database: process.env.MYSQL_DATABASE || 'urban_service',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
