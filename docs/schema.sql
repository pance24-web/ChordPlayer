-- Jalankan ini di TablePlus (atau client MySQL lain) setelah membuat database `song_db`

CREATE DATABASE IF NOT EXISTS song_db;
USE song_db;

CREATE TABLE IF NOT EXISTS songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  chord TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contoh data (opsional, sesuaikan / hapus sesuai kebutuhan)
INSERT INTO songs (title, artist, chord) VALUES
('Contoh Lagu', 'Contoh Artis', 'C     G     Am    F\nIni contoh lirik dengan chord di atasnya');
