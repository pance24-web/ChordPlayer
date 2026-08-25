const express = require('express');
const path = require('path');
require('dotenv').config();
const { getAllSongs, getSongById, parseSongId } = require('./services/songService');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── API ROUTES ───────────────────────────────────────────────
// Endpoint untuk mengambil seluruh daftar lagu
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await getAllSongs();
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error('Error di GET /api/songs:', error);
    const statusCode = process.env.NODE_ENV === 'production' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503 ? 'Database tidak tersedia' : 'Gagal mengambil data lagu'
    });
  }
});

// Endpoint untuk mengambil detail lagu berdasarkan query parameter (?id=...)
app.get('/api/song-detail', async (req, res) => {
  try {
    const { id } = req.query;
    const songId = parseSongId(id);
    if (songId === null) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID harus berupa bilangan bulat positif'
      });
    }

    const song = await getSongById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    console.error('Error di GET /api/song-detail:', error);
    const statusCode = process.env.NODE_ENV === 'production' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503 ? 'Database tidak tersedia' : 'Gagal mengambil data lagu'
    });
  }
});

// Endpoint untuk mengambil detail lagu berdasarkan route parameter (/:id)
app.get('/api/songs/:id', async (req, res) => {
  try {
    const songId = parseSongId(req.params.id);
    if (songId === null) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID harus berupa bilangan bulat positif'
      });
    }

    const song = await getSongById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    console.error('Error di GET /api/songs/:id:', error);
    const statusCode = process.env.NODE_ENV === 'production' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503 ? 'Database tidak tersedia' : 'Gagal mengambil data lagu'
    });
  }
});

// ─── STATIC FILES & SPA SERVING ──────────────────────────────
app.use(express.static(path.join(__dirname)));

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'detail.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start dev server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ChordPlayer server running on http://0.0.0.0:${PORT}`);
});
