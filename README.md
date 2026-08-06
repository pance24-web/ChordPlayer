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

* HTML5
* CSS3
* JavaScript

## Backend

* JavaScript API
* Vercel Serverless Function

## Database

* MySQL

## Tools

* Git
* GitHub
* Vercel

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

Buat file `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chordplayer
```

Import database:

```sql
docs/schema.sql
```

---

# ▶️ Running Locally

Jalankan aplikasi:

```bash
npm start
```

Buka browser:

```text
http://localhost:3000
```

---

# 🗺️ Roadmap

## ✅ Completed

* [x] Basic chord search
* [x] Song detail page
* [x] MySQL database integration
* [x] Dark mode
* [x] Responsive layout

## 🚧 In Progress

* [ ] User favorites
* [ ] User authentication
* [ ] Improved chord editor
* [ ] Better mobile experience

## 🔮 Future Plans

* [ ] Export chord ke PDF
* [ ] Audio preview
* [ ] Guitar tuning assistant
* [ ] Community song contribution
* [ ] Progressive Web App (PWA)

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

* Buat Issue baru
* Jelaskan masalah atau saran
* Sertakan langkah reproduksi jika diperlukan

---

# 📜 License

Project ini dibuat sebagai proyek pembelajaran dan portofolio.

---

# 👨‍💻 Author

**pance24-web**

Made with ❤️ for guitar players and music enthusiasts.

⭐ Jika proyek ini membantu, jangan lupa memberikan star pada repository!
