const db = require('../config/db');

// Ambil semua lagu (untuk halaman utama — index.html)
// Hanya ambil kolom yang dibutuhkan, chord tidak perlu di daftar lagu
async function getAllSongs() {
  const [rows] = await db.query('SELECT id, title, artist FROM songs ORDER BY title ASC');
  return rows;
}

// Ambil satu lagu berdasarkan ID (untuk halaman detail — termasuk chord lengkap)
async function getSongById(id) {
  const [rows] = await db.query('SELECT * FROM songs WHERE id = ?', [id]);
  return rows[0] || null; // null kalau tidak ketemu
}

module.exports = {
  getAllSongs,
  getSongById
};
