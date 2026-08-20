-- Struktur database ChordPlayer
--
-- Nama database TIDAK di-hardcode di sini karena provider cloud
-- (seperti Aiven) biasanya sudah menyediakan nama database sendiri
-- (contoh: `defaultdb`). Jalankan CREATE TABLE ini di dalam
-- database yang sudah kamu punya — sesuaikan dengan DB_NAME di .env.
--
-- Contoh untuk MySQL lokal (jika belum punya database):
-- CREATE DATABASE IF NOT EXISTS chordplayer;
-- USE chordplayer;

CREATE TABLE IF NOT EXISTS songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    chord TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contoh data (opsional, sesuaikan / hapus sesuai kebutuhan)
INSERT INTO
    songs (title, artist, chord)
VALUES (
        'Hapus Aku',
        'Nidji',
        'C       G\nLirik lagu di sini'
    ),
    (
        'Akad',
        'Payung Teduh',
        'F       G\nLirik lagu lainnya'
    ),
    (
        'Sempurna',
        'Andra & Backbone',
        'D       A\nLirik lagu ketiga'
    ),
    (
        'Kukira Kau Rumah',
        'Amigdala',
        'C       G\nLirik lagu keempat'
    ),
    (
        'Risalah Hati',
        'Dewa 19',
        'Am      Em\nLirik lagu kelima'
    );