const express = require('express');
const path = require('path');
const { getAllSongs, getSongById } = require('./services/songService');

const app = express();
const PORT = 3000;

app.use(express.json());

// ─── API ROUTES ───────────────────────────────────────────────
// Endpoint untuk mengambil seluruh daftar lagu
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await getAllSongs();
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error('Error di GET /api/songs:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data lagu'
    });
  }
});

// Endpoint untuk mengambil detail lagu berdasarkan query parameter (?id=...)
app.get('/api/song-detail', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID diperlukan'
      });
    }

    const song = await getSongById(id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    console.error('Error di GET /api/song-detail:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data lagu'
    });
  }
});

// Endpoint untuk mengambil detail lagu berdasarkan route parameter (/:id)
app.get('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const song = await getSongById(id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    console.error('Error di GET /api/songs/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data lagu'
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
