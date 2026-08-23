const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isConnected = false;

const host = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
const isPlaceholderHost = !host || 
  host.toLowerCase() === 'your-db-host' || 
  host.toLowerCase() === 'your_db_host' || 
  host.toLowerCase() === 'example.com' ||
  host.toLowerCase() === 'host' ||
  host.includes('your-');

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
      connectTimeout: 4000,
      ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined
    });

    pool.getConnection()
      .then(conn => {
        isConnected = true;
        console.log('✅ MySQL Connected successfully to', host);
        conn.release();
      })
      .catch(err => {
        isConnected = false;
        console.log('ℹ️ Database MySQL belum dapat diakses, menggunakan data in-memory fallback.');
      });
  } catch (err) {
    isConnected = false;
    console.log('ℹ️ Menggunakan data in-memory fallback.');
  }
} else {
  console.log('ℹ️ DB_HOST belum dikonfigurasi, menggunakan data in-memory ChordPlayer.');
}

async function dbQuery(sql, params) {
  if (!pool || !isConnected) {
    return null;
  }
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    isConnected = false;
    return null;
  }
}

module.exports = {
  pool,
  dbQuery,
  get isConnected() {
    return isConnected;
  }
};
