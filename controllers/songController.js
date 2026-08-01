const db = require('../config/db');

// ─── HELPER: RESPONSE ERROR AMAN ───────────────────────────────
// Konsep: Di production, kita TIDAK boleh kirim detail error asli
// (misal query MySQL, nama kolom, dll) ke client — itu bisa membantu
// orang jahat memahami struktur database kita.
// Detail error tetap dicatat di server (console.error) untuk debugging,
// tapi client hanya menerima pesan umum yang aman.
function sendServerError(res, context, error) {
  console.error(`Error di ${context}:`, error);

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
    // ❌ 'error: error.message' sengaja dihapus — tidak boleh bocor ke client
  });
}

// ─── HELPER: VALIDASI INPUT LAGU ───────────────────────────────
// Dipakai bersama oleh createSong dan updateSong supaya
// aturan validasi konsisten di kedua endpoint.
function validateSongInput({ title, artist, chord }) {
  const errors = [];

  // Cek field ada dan bertipe string
  if (typeof title !== 'string' || title.trim() === '') {
    errors.push('title wajib diisi dan harus berupa teks');
  } else if (title.trim().length > 255) {
    errors.push('title maksimal 255 karakter');
  }

  if (typeof artist !== 'string' || artist.trim() === '') {
    errors.push('artist wajib diisi dan harus berupa teks');
  } else if (artist.trim().length > 255) {
    errors.push('artist maksimal 255 karakter');
  }

  if (typeof chord !== 'string' || chord.trim() === '') {
    errors.push('chord wajib diisi dan harus berupa teks');
  } else if (chord.length > 10000) {
    errors.push('chord terlalu panjang (maksimal 10000 karakter)');
  }

  return errors; // array kosong berarti valid
}

// ─── HELPER: VALIDASI ID ───────────────────────────────────────
// Memastikan id dari URL adalah angka positif yang valid,
// sebelum dipakai di query database.
function isValidId(id) {
  return /^\d+$/.test(id); // hanya boleh angka, tidak boleh huruf/simbol
}

// GET semua lagu (untuk index.html)
const getAllSongs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, title, artist FROM songs ORDER BY title ASC');
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    sendServerError(res, 'getAllSongs', error);
  }
};

// GET satu lagu berdasarkan ID (untuk detail.html — termasuk chord lengkap)
const getSongById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validasi id harus angka sebelum query ke database
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID lagu tidak valid'
      });
    }

    const [rows] = await db.query('SELECT * FROM songs WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    sendServerError(res, 'getSongById', error);
  }
};

// POST tambah lagu baru
const createSong = async (req, res) => {
  try {
    const { title, artist, chord } = req.body;

    // ✅ Validasi lebih ketat: trim, panjang, tipe data
    const errors = validateSongInput({ title, artist, chord });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors // daftar semua kesalahan validasi
      });
    }

    // ✅ Simpan versi yang sudah di-trim, bukan input mentah
    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    const cleanChord = chord.trim();

    const [result] = await db.query(
      'INSERT INTO songs (title, artist, chord) VALUES (?, ?, ?)',
      [cleanTitle, cleanArtist, cleanChord]
    );

    res.status(201).json({
      success: true,
      message: 'Lagu berhasil ditambahkan',
      data: { id: result.insertId, title: cleanTitle, artist: cleanArtist, chord: cleanChord }
    });
  } catch (error) {
    sendServerError(res, 'createSong', error);
  }
};

// PUT update lagu
const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, chord } = req.body;

    // ✅ Validasi id
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID lagu tidak valid'
      });
    }

    // ✅ Validasi input sama seperti createSong
    const errors = validateSongInput({ title, artist, chord });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors
      });
    }

    const [existing] = await db.query('SELECT id FROM songs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    const cleanChord = chord.trim();

    await db.query(
      'UPDATE songs SET title = ?, artist = ?, chord = ? WHERE id = ?',
      [cleanTitle, cleanArtist, cleanChord, id]
    );

    res.status(200).json({
      success: true,
      message: 'Lagu berhasil diperbarui'
    });
  } catch (error) {
    sendServerError(res, 'updateSong', error);
  }
};

// DELETE lagu
const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validasi id
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID lagu tidak valid'
      });
    }

    const [existing] = await db.query('SELECT id FROM songs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    await db.query('DELETE FROM songs WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Lagu berhasil dihapus'
    });
  } catch (error) {
    sendServerError(res, 'deleteSong', error);
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong
};