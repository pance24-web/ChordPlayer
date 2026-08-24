const db = require('../config/db');

class DatabaseUnavailableError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = 'DatabaseUnavailableError';
    this.code = 'DB_UNAVAILABLE';
  }
}

function isFallbackAllowed() {
  return process.env.NODE_ENV !== 'production';
}

// Data fallback saat database offline atau belum terhubung
const fallbackSongs = [
  {
    id: 1,
    title: 'Hapus Aku',
    artist: 'Nidji',
    chord: `[Intro]
C  G  Am  F
C  G  Am  F

[Verse 1]
C             G
Tuliskan kesedihan
Am            F
Semua tak terkendali
C          G
Lupakan semua beban
Am           F
Yang membelenggu jiwa

[Chorus]
C              G
Hapuskan semua air mata
Am             F
Yang menetes di pipimu
C              G
Hapuskan semua rasa cinta
Am             F
Yang telah sirna darimu

[Interlude]
C  G  Am  F

[Verse 2]
C              G
Jangan pernah berhenti
Am             F
Melangkah ke depan
C              G
Buka matamu kawan
Am             F
Sambut hari yang baru

[Chorus]
C              G
Hapuskan semua air mata
Am             F
Yang menetes di pipimu
C              G
Hapuskan semua rasa cinta
Am             F
Yang telah sirna darimu

[Outro]
C  G  Am  F
C`
  },
  {
    id: 2,
    title: 'Akad',
    artist: 'Payung Teduh',
    chord: `[Intro]
F  G  Em  Am
Dm  G  C

[Verse 1]
C
Betapa bahagianya hatiku saat
F
Kududuk berdua denganmu
Dm                G
Berjalan bersamamu
Em                 Am
Menarilah denganku

[Verse 2]
C
Namun bila hari ini adalah yang terakhir
F
Namun ku tetap bahagia
Dm                 G
Selalu ada di sampingmu
Em                 Am
Menatap senyum manismu

[Chorus]
F             G
Bila nanti saatnya tlah tiba
Em            Am
Kuingin kau menjadi istriku
Dm            G
Berjalan dan menua bersama
C
Mengarungi waktu
F             G
Bila nanti saatnya tlah tiba
Em            Am
Kuingin kau menjadi milikku
Dm            G
Berjalan bersamamu
C
Dalam akad suci

[Outro]
F  G  Em  Am
Dm  G  C`
  },
  {
    id: 3,
    title: 'Sempurna',
    artist: 'Andra & Backbone',
    chord: `[Intro]
D  G  D  G

[Verse 1]
D              G
Kau begitu sempurna
D              G
Di mataku kau begitu indah
D              G
Kau membuat diriku
Bm             A          G
Akan selalu memujamu

[Verse 2]
D              G
Di setiap langkahku
D              G
Kukan selalu memikirkan dirimu
D              G
Tak bisa kubayangkan
Bm             A          G
Hidupku tanpa cintamu

[Chorus]
D              A
Janganlah kau tinggalkan diriku
Bm             G
Takkan mampu kuhadapi dunia
D              A
Bersamamu ku merasa tenang
Bm             G
Kaulah darahku dan nafasku

[Outro]
D  G  D  G
D`
  },
  {
    id: 4,
    title: 'Kukira Kau Rumah',
    artist: 'Amigdala',
    chord: `[Intro]
C  G  Am  F
C  G  Am  F

[Verse 1]
C
Kau datang tatkala
G
Sinar senjaku telah redup
Am
Dan kau hadir ketika
F
Langkahku mulai terhenti

[Verse 2]
C
Kau basuh lukaku
G
Dengan senyum manismu
Am
Kau dekap jiwaku
F
Yang penuh keraguan

[Chorus]
C              G
Kukira kau rumah
Am             F
Tempatku bersandar dan pulang
C              G
Ternyata kau cuma
Am             F
Satu tempat singgah yang hilang

[Outro]
C  G  Am  F
C`
  },
  {
    id: 5,
    title: 'Risalah Hati',
    artist: 'Dewa 19',
    chord: `[Intro]
Am  Em  F  G
Am  Em  F  G

[Verse 1]
Am          Em
Hidupku tanpa cintamu
F           G
Bagai malam tanpa bintang
Am          Em
Cintaku tanpa hadirmu
F           G
Bagai raga tanpa jiwa

[Chorus]
C              Em
Aku bisa membuatmu
F              G
Jatuh cinta kepadaku
C              Em
Meski kau tak pernah
F              G
Mencintaiku lebih dulu

[Verse 2]
Am          Em
Beri sedikit waktu
F           G
Biar cinta datang karena terbiasa
Am          Em
Beri sedikit ruang
F           G
Di sudut relung hatimu

[Chorus]
C              Em
Aku bisa membuatmu
F              G
Jatuh cinta kepadaku
C              Em
Meski kau tak pernah
F              G
Mencintaiku lebih dulu

[Outro]
Am  Em  F  G
C`
  }
];

const SONG_PAGE_DEFAULT = 20;
const SONG_PAGE_MAX = 50;
const SEARCH_FIELDS = {
  all: ['title', 'artist'],
  title: ['title'],
  artist: ['artist']
};

function normalizeSongSearchOptions(options = {}) {
  const search = typeof options.search === 'string' ? options.search.trim().slice(0, 100) : '';
  const field = Object.prototype.hasOwnProperty.call(SEARCH_FIELDS, options.field)
    ? options.field
    : 'all';
  const page = Number.isInteger(options.page) && options.page > 0 ? options.page : 1;
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? Math.min(options.limit, SONG_PAGE_MAX)
    : SONG_PAGE_DEFAULT;
  const ids = Array.isArray(options.ids)
    ? [...new Set(options.ids.filter(id => Number.isInteger(id) && id > 0))].slice(0, 100)
    : [];

  return {
    search,
    field,
    page,
    limit,
    ids
  };
}

function filterFallbackSongs({ search, field, ids }) {
  const normalizedSearch = search.toLowerCase();
  return fallbackSongs
    .filter(song => {
      if (ids.length > 0 && !ids.includes(Number(song.id))) return false;
      if (!normalizedSearch) return true;
      return SEARCH_FIELDS[field].some(column => song[column].toLowerCase().includes(normalizedSearch));
    })
    .map(({ id, title, artist }) => ({ id, title, artist }));
}

function paginateSongs(rows, page, limit) {
  const total = rows.length;
  const offset = (page - 1) * limit;
  return {
    rows: rows.slice(offset, offset + limit),
    total
  };
}

async function searchSongs(options = {}) {
  const normalized = normalizeSongSearchOptions(options);
  const { search, field, page, limit, ids } = normalized;
  const whereParts = [];
  const queryParams = [];

  if (ids.length > 0) {
    whereParts.push(`id IN (${ids.map(() => '?').join(', ')})`);
    queryParams.push(...ids);
  }

  if (search) {
    const searchValue = `%${search}%`;
    const searchColumns = SEARCH_FIELDS[field];
    whereParts.push(searchColumns.length === 1
      ? `${searchColumns[0]} LIKE ?`
      : `(${searchColumns.map(column => `${column} LIKE ?`).join(' OR ')})`);
    queryParams.push(...searchColumns.map(() => searchValue));
  }

  const whereClause = whereParts.length > 0 ? ` WHERE ${whereParts.join(' AND ')}` : '';
  const countQuery = `SELECT COUNT(*) AS total FROM songs${whereClause}`;
  const songsQuery = `SELECT id, title, artist FROM songs${whereClause} ORDER BY title ASC, id ASC LIMIT ? OFFSET ?`;

  try {
    const [countRows] = await db.query(countQuery, queryParams);
    const total = Number(countRows[0]?.total || 0);

    if (total === 0 && !search && ids.length === 0 && field === 'all' && isFallbackAllowed()) {
      const fallbackPage = paginateSongs(
        fallbackSongs.map(({ id, title, artist }) => ({ id, title, artist })),
        page,
        limit
      );
      console.warn('[songService] searchSongs: Database kosong. Menggunakan fallback development.');
      return fallbackPage;
    }

    const [rows] = await db.query(songsQuery, [...queryParams, limit, (page - 1) * limit]);
    return { rows, total };
  } catch (err) {
    if (isFallbackAllowed()) {
      const fallbackPage = paginateSongs(filterFallbackSongs(normalized), page, limit);
      console.warn('[songService] searchSongs: Database tidak tersedia. Menggunakan fallback development:', err.message);
      return fallbackPage;
    }

    throw new DatabaseUnavailableError('Database tidak tersedia', err);
  }
}

// Kompatibilitas untuk consumer lama yang hanya membutuhkan array lagu.
async function getAllSongs(options = {}) {
  const result = await searchSongs(options);
  return result.rows;
}

// Ambil satu lagu berdasarkan ID (untuk halaman detail — termasuk chord lengkap)
async function getSongById(id) {
  try {
    const [rows] = await db.query('SELECT id, title, artist, chord FROM songs WHERE id = ?', [id]);
    if (rows && rows[0]) {
      return rows[0];
    }

    if (isFallbackAllowed()) {
      console.warn(`[songService] getSongById(${id}): Tidak ditemukan di database. Mengecek fallback development.`);
      const fallbackSong = fallbackSongs.find(song => String(song.id) === String(id));
      return fallbackSong || null;
    }

    return null;
  } catch (err) {
    if (isFallbackAllowed()) {
      console.warn(`[songService] getSongById(${id}): Database tidak tersedia. Mengecek fallback development:`, err.message);
      const fallbackSong = fallbackSongs.find(song => String(song.id) === String(id));
      return fallbackSong || null;
    }

    throw new DatabaseUnavailableError('Database tidak tersedia', err);
  }
}

module.exports = {
  getAllSongs,
  getSongById,
  searchSongs,
  normalizeSongSearchOptions,
  SONG_PAGE_DEFAULT,
  SONG_PAGE_MAX
};

