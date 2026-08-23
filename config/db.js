const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
const isPlaceholderHost = !host || 
  host.toLowerCase() === 'your-db-host' || 
  host.toLowerCase() === 'your_db_host' || 
  host.toLowerCase() === 'example.com' ||
  host.toLowerCase() === 'host' ||
  host.includes('your-');

let pool = null;

if (!isPlaceholderHost) {
  try {
    pool = mysql.createPool({
      host: host,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chordplayer',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000,
      ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined
    });

    pool.getConnection()
      .then(conn => {
        console.log('✅ MySQL Connected');
        conn.release();
      })
      .catch(err => {
        console.warn('ℹ️ MySQL database tidak dapat dijangkau, menggunakan fallback data in-memory:', err.message);
      });
  } catch (err) {
    console.warn('ℹ️ Error inisialisasi pool MySQL:', err.message);
  }
}

const db = {
  async query(sql, params) {
    if (!pool) {
      throw new Error('Database pool not configured');
    }
    return await pool.query(sql, params);
  },
  getConnection() {
    if (!pool) {
      return Promise.reject(new Error('Database pool not configured'));
    }
    return pool.getConnection();
  }
};

module.exports = db;


