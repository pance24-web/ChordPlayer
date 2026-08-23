# 📋 ChordPlayer Improvement Todo List

> Last Updated: August 2026

## 🎨 UI/UX Redesign (Handoff Sprint 1–3)

- [ ] Sprint 1 — Foundation: design tokens (#0D47A1/#22C55E/surface/text), radius, typography, fokus ring
- [ ] Sprint 1 — Header baru: logo mark hijau + wordmark, tagline desktop, toggle SVG
- [ ] Sprint 2 — Home: hero heading + subtitle, search field dengan ikon & tombol hijau
- [ ] Sprint 2 — Home: filter chip aktif hijau, song card ikon chord bulat + chevron
- [ ] Sprint 2 — Home: grid dua kolom desktop, bottom navigation mobile
- [ ] Sprint 2 — Home: empty state & error state sesuai mockup (ikon, teks, tombol aksi)
- [ ] Sprint 3 — Detail: tombol kembali, ikon artis, hint sentuh chord
- [ ] Sprint 3 — Detail: ganti emoji kontrol dengan ikon SVG, popup + badge capo
- [ ] QA — uji desktop/mobile/light/dark di browser, cek console & node --check

## 🎯 Goal

Meningkatkan kualitas ChordPlayer dari sisi **User Experience**, **Performance**, **Code Quality**, dan **Scalability** tanpa mengubah konsep utama sebagai aplikasi pencarian chord dan lirik lagu.

---

# 🚀 Version 1.1 — User Experience

## Search

- [x] Tambahkan debounce pada pencarian completed:2026-08-12
- [x] Tampilkan loading saat mengambil data completed:2026-08-13
- [x] Tampilkan empty state jika lagu tidak ditemukan completed:2026-08-13
- [x] Tampilkan pesan error jika API gagal completed:2026-08-13
- [x] Tambahkan tombol clear search completed:2026-08-13
- [x] Tambahkan pencarian berdasarkan artis completed:2026-08-13

## Song Detail

- [x] Tambahkan tombol copy chord completed:2026-08-13
- [x] Tambahkan tombol share lagu completed:2026-08-13
- [x] Tambahkan tombol print chord completed:2026-08-13
- [x] Tambahkan tombol kembali ke daftar lagu completed:2026-08-14
- [x] Simpan posisi auto scroll terakhir completed:2026-08-14

## Interface

- [x] Perhalus animasi transisi completed:2026-08-14
- [x] Tambahkan skeleton loading completed:2026-08-14
- [x] Tambahkan toast notification completed:2026-08-14
- [x] Perbaiki konsistensi spacing completed:2026-08-14
- [x] Tingkatkan responsive layout completed:2026-08-14

---

# 🚀 Version 1.2 — Guitar Features

- [ ] Tingkatkan fitur transpose chord
- [ ] Pengaturan kecepatan auto scroll
- [ ] Tambahkan fullscreen mode
- [ ] Highlight chord aktif
- [ ] Tambahkan chord diagram gitar
- [ ] Tambahkan rekomendasi capo

---

# 🚀 Version 1.3 — Data Management

## Database

- [ ] Optimasi query database
- [ ] Pisahkan data artis ke tabel tersendiri
- [ ] Tambahkan tabel kategori lagu
- [ ] Tambahkan indeks pada kolom pencarian
- [ ] Tambahkan validasi data sebelum disimpan

## API

- [ ] Validasi parameter request
- [ ] Standarisasi format response JSON
- [ ] Tambahkan HTTP status code yang sesuai
- [ ] Perbaiki error handling API

---

# 🚀 Version 1.4 — Admin Panel

- [ ] Login Admin
- [ ] Dashboard Admin
- [ ] CRUD Lagu
- [ ] CRUD Artis
- [ ] CRUD Kategori
- [ ] Upload lagu baru
- [ ] Edit chord dan lirik
- [ ] Hapus lagu
- [ ] Dashboard statistik sederhana

---

# 🚀 Version 1.5 — User Features

- [ ] Login pengguna
- [ ] Registrasi akun
- [ ] Profil pengguna
- [ ] Favorite lagu
- [ ] Recently Viewed
- [ ] Riwayat pencarian

---

# 🚀 Version 1.6 — Performance

- [ ] Optimasi JavaScript
- [ ] Optimasi CSS
- [ ] Lazy loading
- [ ] Cache API
- [ ] Minify asset
- [ ] Optimasi gambar
- [ ] Audit performa dengan Lighthouse

---

# 🚀 Version 1.7 — SEO

- [ ] Dynamic meta title
- [ ] Dynamic meta description
- [ ] Open Graph
- [ ] Twitter Card
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Structured Data (Schema.org)

---

# 🚀 Version 2.0 — Future Features

- [ ] Progressive Web App (PWA)
- [ ] Offline mode
- [ ] Export chord ke PDF
- [ ] Guitar tuner
- [ ] Metronome
- [ ] Playlist latihan
- [ ] Community song contribution
- [ ] Rating lagu
- [ ] Request lagu

---

# 🛠️ Code Quality

- [ ] Rapikan struktur folder
- [ ] Modularisasi JavaScript
- [ ] Tambahkan util/helper functions
- [ ] Hilangkan duplikasi kode
- [ ] Tambahkan komentar pada bagian kompleks
- [ ] Standarisasi penamaan variabel dan fungsi
- [ ] Tambahkan konfigurasi linting (ESLint)
- [ ] Tambahkan formatter (Prettier)

---

# 📚 Documentation

- [ ] Lengkapi README
- [ ] Dokumentasi API
- [ ] Dokumentasi database
- [ ] Deployment guide
- [ ] Contribution guide
- [ ] Changelog yang konsisten

---

# ✅ Completed

- [x] Halaman Home
- [x] Halaman Detail Lagu
- [x] Pencarian lagu
- [x] Dark Mode
- [x] Responsive Layout
- [x] Backend API dasar
- [x] Integrasi MySQL
- [x] Deployment ke Vercel

---

## 📌 Priority

### High

- UX Search
- Error Handling
- API Validation
- Performance
- Responsive UI

### Medium

- Guitar Features
- Admin Panel
- Database Optimization

### Low

- Login
- PWA
- Community Features
- SEO
- Export PDF
