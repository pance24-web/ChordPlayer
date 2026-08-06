const { Pool } = require('pg');

// Mengambil URL koneksi dari environment variable (.env)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL belum diatur di environment variables!');
}

// Inisialisasi Pool Database
const pool = new Pool({
  connectionString: connectionString,
  
  // Konfigurasi krusial untuk Serverless (Vercel)
  max: 10, // Batas maksimal koneksi per instance function
  idleTimeoutMillis: 30000, // Tutup koneksi yang nganggur setelah 30 detik
  connectionTimeoutMillis: 2000, // Waktu maksimal tunggu koneksi baru (2 detik)
  
  // Wajib untuk koneksi ke Aiven PostgreSQL
  ssl: {
    rejectUnauthorized: false // Mengizinkan koneksi SSL tanpa sertifikat CA khusus (cukup aman untuk MVP)
  }
});

// Helper function supaya gampang dipanggil di file API kamu
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Kita export juga pool-nya untuk jaga-jaga
};