const db = require('../config/db');

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
  },
  {
    id: 6,
    title: 'Untuk Perempuan yang Sedang Dalam Pelukan',
    artist: 'Payung Teduh',
    chord: `[Intro]
C  G  Am  F

[Verse]
C              G
Tak terasa gelap pun jatuh
Am             F
Diujung malam menuju pagi

[Chorus]
C              G
Untuk perempuan yang sedang dalam pelukan
Am             F
Untuk perempuan yang sedang dalam pelukan

[Outro]
C  G  Am  F`
  },
  {
    id: 7,
    title: 'Mungkin Hari Ini Esok atau Nanti',
    artist: 'Anneth',
    chord: `[Intro]
C  G  Am  F

[Verse]
C              G
Ku hampiri jalan yang berliku
Am             F
Mencari arti dalam hidupku

[Chorus]
C              G
Mungkin hari ini esok atau nanti
Am             F
Takdir kan mempertemukan kita lagi

[Outro]
C  G  Am  F`
  }
];

const isProduction = process.env.NODE_ENV === 'production';

function parseSongId(value) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === undefined || rawValue === null || !/^\d+$/.test(String(rawValue))) {
    return null;
  }

  const id = Number(rawValue);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Ambil semua lagu (untuk halaman utama — index.html)
async function getAllSongs() {
  try {
    const [rows] = await db.query('SELECT id, title, artist FROM songs ORDER BY title ASC');
    if (rows && rows.length > 0) {
      return rows;
    }
    // Database tersedia tetapi belum berisi lagu.
    return isProduction
      ? []
      : fallbackSongs.map(({ id, title, artist }) => ({ id, title, artist }));
  } catch (err) {
    console.error('[songService] getAllSongs: Query database gagal:', err.message);
    if (isProduction) throw err;
  }
  return fallbackSongs.map(({ id, title, artist }) => ({ id, title, artist }));
}

// Ambil satu lagu berdasarkan ID (untuk halaman detail — termasuk chord lengkap)
async function getSongById(id) {
  try {
    const [rows] = await db.query('SELECT * FROM songs WHERE id = ?', [id]);
    if (rows && rows[0]) {
      return rows[0];
    }
    // ID tidak ditemukan di database utama.
    return isProduction
      ? null
      : fallbackSongs.find(s => String(s.id) === String(id)) || null;
  } catch (err) {
    console.error(`[songService] getSongById(${id}): Query database gagal:`, err.message);
    if (isProduction) throw err;
  }
  const song = fallbackSongs.find(s => String(s.id) === String(id));
  return song || null;
}

module.exports = {
  getAllSongs,
  getSongById,
  parseSongId
};

