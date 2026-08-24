const express = require('express');
const path = require('path');
const { getSongById, searchSongs } = require('./services/songService');
const { parsePositiveSongId } = require('./utils/requestValidation');

const app = express();
const PORT = 3000;
const ALLOWED_FIELDS = new Set(['all', 'title', 'artist']);
const MAX_PAGE_SIZE = 50;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseSongIds(value) {
  if (value === undefined || value === '') return [];
  if (typeof value !== 'string') return null;

  const parts = value.split(',');
  if (parts.length > 100 || parts.some(part => !/^\d+$/.test(part))) return null;

  const ids = [...new Set(parts.map(Number))];
  return ids.every(id => Number.isSafeInteger(id) && id > 0) ? ids : null;
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json());

// ─── API ROUTES ───────────────────────────────────────────────
// Endpoint untuk mengambil daftar lagu dengan search dan pagination
app.get('/api/songs', async (req, res) => {
  try {
    const {
      search = '',
      field = 'all',
      page: rawPage,
      limit: rawLimit,
      ids: rawIds
    } = req.query;

    if (typeof search !== 'string' || search.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Parameter search tidak valid'
      });
    }

    if (typeof field !== 'string' || !ALLOWED_FIELDS.has(field)) {
      return res.status(400).json({
        success: false,
        message: 'Parameter field tidak valid'
      });
    }

    const page = parsePositiveInteger(rawPage, 1);
    const limit = parsePositiveInteger(rawLimit, 20);
    const ids = parseSongIds(rawIds);
    if (!page || !limit || limit > MAX_PAGE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Parameter page/limit tidak valid. Limit maksimal ${MAX_PAGE_SIZE}.`
      });
    }

    if (ids === null) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ids tidak valid'
      });
    }

    const result = await searchSongs({ search, field, page, limit, ids });
    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('Error di GET /api/songs:', error);
    const statusCode = error.code === 'DB_UNAVAILABLE' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503
        ? 'Database sedang tidak tersedia'
        : 'Gagal mengambil data lagu'
    });
  }
});

// Endpoint untuk mengambil detail lagu berdasarkan query parameter (?id=...)
app.get('/api/song-detail', async (req, res) => {
  try {
    const id = parsePositiveSongId(req.query.id);
    if (id === null) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID harus berupa bilangan bulat positif'
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
    const statusCode = error.code === 'DB_UNAVAILABLE' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503
        ? 'Database sedang tidak tersedia'
        : 'Gagal mengambil data lagu'
    });
  }
});

// Endpoint untuk mengambil detail lagu berdasarkan route parameter (/:id)
app.get('/api/songs/:id', async (req, res) => {
  try {
    const id = parsePositiveSongId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID harus berupa bilangan bulat positif'
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
    console.error('Error di GET /api/songs/:id:', error);
    const statusCode = error.code === 'DB_UNAVAILABLE' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503
        ? 'Database sedang tidak tersedia'
        : 'Gagal mengambil data lagu'
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
