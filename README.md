# 🎸 ChordPlayer

![ChordPlayer Banner](docs/assets/banner.png)

**ChordPlayer** adalah aplikasi web untuk mencari **chord dan lirik lagu** yang membantu musisi, gitaris pemula, maupun pemain band berlatih lagu dengan lebih mudah.

Dengan tampilan sederhana dan cepat, pengguna dapat mencari lagu, melihat chord, membaca lirik, melakukan transpose nada, serta menggunakan fitur auto scroll untuk menemani latihan bermain gitar.

---

## 🚀 Demo

🌐 **Live Demo:**
https://chord-player-phi.vercel.app

---

## 📌 Features

| Fitur              | Deskripsi                                      |
| ------------------ | ---------------------------------------------- |
| 🔎 Song Search     | Mencari lagu berdasarkan judul atau nama artis |
| 🎵 Chord & Lyrics  | Menampilkan chord dan lirik lagu               |
| 🔄 Transpose Chord | Mengubah nada chord sesuai kebutuhan pemain    |
| 📜 Auto Scroll     | Membantu mengikuti lirik saat bermain gitar    |
| 🌙 Dark Mode       | Mode tampilan gelap untuk kenyamanan           |
| 📱 Responsive UI   | Mendukung berbagai ukuran layar                |

---

## 🖼️ Screenshot

### Homepage

![Homepage Screenshot](docs/assets/homepage.png)

### Song Detail

![Song Detail Screenshot](docs/assets/detail.png)

> Tambahkan gambar screenshot ke folder `docs/assets/` agar tampil pada README.

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- JavaScript API
- Vercel Serverless Function

## Database

- MySQL

## Tools

- Git
- GitHub
- Vercel

---

# 📂 Project Structure

```text
ChordPlayer/
│
├── index.html
├── detail.html
├── script.js
│
├── css/
│   └── styles.css
│
├── api/
│   ├── songs.js
│   └── song-detail.js
│
├── services/
│   └── songService.js
│
├── config/
│   └── db.js
│
├── docs/
│   ├── Changelog.md
│   ├── schema.sql
│   └── dark-mode-guide.md
│
├── asset/
│   └── favicon.svg
│
├── package.json
└── vercel.json
```

---

# ⚙️ Installation

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

# 🔐 Environment Setup

Buat file `.env` di root project:

```env
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSL=false
# Opsional: PEM CA certificate; gunakan literal \n untuk line break jika secret provider tidak mendukung multiline.
DB_SSL_CA=
```

> **Menggunakan database cloud (contoh: Aiven, PlanetScale, dll)?**
> Sesuaikan `DB_HOST` dan `DB_PORT` dengan connection info dari provider, lalu set `DB_SSL=true`. Koneksi TLS selalu memverifikasi sertifikat server. Jika provider memakai CA khusus, isi `DB_SSL_CA` dengan PEM CA certificate; jika secret provider tidak mendukung multiline, gunakan literal `\n` sebagai line break.

## Buat tabel `songs` dengan menjalankan query di `docs/schema.sql` lewat client MySQL pilihanmu (TablePlus, MySQL Workbench, VS Code Database Client, dll).

# ▶️ Running Locally

Project ini menggunakan **Vercel Serverless Functions**, sehingga cara termudah menjalankannya secara lokal adalah dengan Vercel CLI.

Install Vercel CLI (sekali saja, secara global):

```bash
npm install -g vercel
```

Jalankan aplikasi:

```bash
vercel dev
```

## Ikuti instruksi di terminal (biasanya akan meminta login/link project untuk pertama kali). Setelah berjalan, buka URL yang ditampilkan di terminal (biasanya `http://localhost:3000`).

# 🗺️ Roadmap

## ✅ Completed

- [x] Basic chord search
- [x] Song detail page
- [x] MySQL database integration
- [x] Dark mode
- [x] Responsive layout

## 🚧 In Progress

- [ ] User favorites
- [ ] User authentication
- [ ] Improved chord editor
- [ ] Better mobile experience

## 🔮 Future Plans

- [ ] Export chord ke PDF
- [ ] Audio preview
- [ ] Guitar tuning assistant
- [ ] Community song contribution
- [ ] Progressive Web App (PWA)

---

# 🤝 Contributing

Kontribusi sangat terbuka.

Jika ingin membantu pengembangan:

1. Fork repository ini
2. Buat branch baru

```bash
git checkout -b feature/nama-fitur
```

3. Commit perubahan

```bash
git commit -m "Add new feature"
```

4. Push branch

```bash
git push origin feature/nama-fitur
```

5. Buat Pull Request

---

# 🐛 Reporting Issues

Jika menemukan bug atau memiliki ide fitur baru:

- Buat Issue baru
- Jelaskan masalah atau saran
- Sertakan langkah reproduksi jika diperlukan

---

# 📜 License

Project ini dibuat sebagai proyek pembelajaran dan portofolio.

---

# 👨‍💻 Author

**pance24-web**

Made with ❤️ for guitar players and music enthusiasts.

⭐ Jika proyek ini membantu, jangan lupa memberikan star pada repository!
