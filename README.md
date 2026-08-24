# ChordPlayer

![ChordPlayer Banner](docs/assets/banner.png)

**ChordPlayer** adalah aplikasi web untuk mencari **chord dan lirik lagu** yang membantu musisi, gitaris pemula, maupun pemain band berlatih lagu dengan lebih mudah.

Dengan tampilan sederhana dan cepat, pengguna dapat mencari lagu, melihat chord, membaca lirik, melakukan transpose nada, serta menggunakan fitur auto scroll untuk menemani latihan bermain gitar.

---

## Demo

**Live Demo:**
https://chord-player-phi.vercel.app

---

## Features

| Fitur | Deskripsi |
| --- | --- |
| Song Search | Mencari lagu berdasarkan judul atau nama artis |
| Chord & Lyrics | Menampilkan chord dan lirik lagu |
| Transpose Chord | Mengubah nada chord sesuai kebutuhan pemain |
| Auto Scroll | Membantu mengikuti lirik saat bermain gitar |
| Dark Mode | Mode tampilan gelap untuk kenyamanan |
| Responsive UI | Mendukung berbagai ukuran layar |

---

## Screenshot

### Homepage

![Homepage Screenshot](docs/assets/homepage.png)

### Song Detail

![Song Detail Screenshot](docs/assets/detail.png)

> Tambahkan gambar screenshot ke folder `docs/assets/` agar tampil pada README.

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- JavaScript API
- Express.js

### Database

- MySQL

### Tools

- Git
- GitHub
- Vercel

---

## Project Structure

```text
ChordPlayer/
├── index.html
├── detail.html
├── script.js
├── css/
│   └── styles.css
├── api/
│   ├── songs.js
│   └── song-detail.js
├── services/
│   └── songService.js
├── config/
│   └── db.js
├── docs/
│   ├── README.md
│   ├── Changelog.md
│   ├── dark-mode-guide.md
│   └── schema.sql
├── CP handoff/
│   ├── START_HERE.md
│   └── CHORDPLAYER_HANDOFF.md
├── todo.md
├── asset/
│   └── favicon.svg
├── package.json
└── vercel.json
```

---

## Installation

Clone repository:

```bash
git clone https://github.com/pance24-web/ChordPlayer.git
```

Masuk ke folder:

```bash
cd ChordPlayer
```

Install dependency:

```bash
npm install
```

---

## Environment Setup

Buat file `.env` di root project:

```env
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSL=false
```

> Menggunakan database cloud seperti Aiven, PlanetScale, atau provider MySQL lain?
> Sesuaikan `DB_HOST` dan `DB_PORT` dengan connection info dari provider kamu, lalu set `DB_SSL=true` jika provider mewajibkan koneksi SSL.

Jalankan query pada `docs/schema.sql` untuk membuat tabel `songs`.

---

## Running Locally

Project ini menggunakan Express untuk server lokal, dengan route API yang juga kompatibel dengan deploy di Vercel.

Jalankan aplikasi:

```bash
npm run dev
```

Lalu buka `http://localhost:5000` jika memakai `.env` bawaan, atau `http://localhost:3000` jika variabel `PORT` belum diatur.

Di PowerShell Windows, jika `npm run dev` ditolak karena execution policy, gunakan:

```bash
npm.cmd run dev
```

Jika ingin menjalankan preview seperti environment Vercel, kamu juga bisa memakai:

```bash
npx vercel dev
```

---

## Roadmap

### Completed

- [x] Basic chord search
- [x] Song detail page
- [x] MySQL database integration
- [x] Dark mode
- [x] Responsive layout

### In Progress

- [ ] User favorites
- [ ] User authentication
- [ ] Improved chord editor
- [ ] Better mobile experience

### Future Plans

- [ ] Export chord ke PDF
- [ ] Audio preview
- [ ] Guitar tuning assistant
- [ ] Community song contribution
- [ ] Progressive Web App (PWA)

---

## Contributing

Kontribusi sangat terbuka.

Jika ingin membantu pengembangan:

1. Fork repository ini.
2. Buat branch baru.

```bash
git checkout -b feature/nama-fitur
```

3. Commit perubahan.

```bash
git commit -m "Add new feature"
```

4. Push branch.

```bash
git push origin feature/nama-fitur
```

5. Buat Pull Request.

---

## Reporting Issues

Jika menemukan bug atau memiliki ide fitur baru:

- Buat Issue baru
- Jelaskan masalah atau saran
- Sertakan langkah reproduksi jika diperlukan

---

## License

Project ini dibuat sebagai proyek pembelajaran dan portofolio.

---

## Author

**pance24-web**

Made with love for guitar players and music enthusiasts.

Jika proyek ini membantu, jangan lupa memberikan star pada repository.
