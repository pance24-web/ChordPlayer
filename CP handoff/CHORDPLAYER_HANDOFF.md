# ChordPlayer — Complete Product, UI/UX, and Engineering Handoff

**Dokumen untuk:** Developer/designer yang melanjutkan proyek  
**Repository:** [pance24-web/ChordPlayer](https://github.com/pance24-web/ChordPlayer)  
**Branch kerja:** `main`  
**Commit baseline:** `d7d6c80 fix: open chord popup on hover and touch`  
**Status baseline:** Fitur utama Version 1.2 sudah tersedia; redesign visual dan penyempurnaan UI dikerjakan berdasarkan dokumen ini.

> **Tujuan utama:** membuat ChordPlayer terasa seperti workspace latihan gitar yang cepat, bersih, dan nyaman digunakan ketika kedua tangan pengguna sedang memegang gitar.

---

## 1. Cara Menggunakan Paket Ini

Mulailah dengan membaca dokumen ini sampai bagian acceptance criteria. Setelah itu buka aset visual dalam folder `assets/` sesuai urutan nomor. Gambar-gambar tersebut adalah **visual direction**, bukan spesifikasi pixel final; jika terdapat perbedaan kecil antara mockup dan codebase, pertahankan struktur data dan fitur yang sudah bekerja, lalu pilih implementasi yang paling konsisten dengan design tokens dan interaction rules di dokumen ini.

Urutan kerja yang disarankan adalah membuat fondasi visual terlebih dahulu, merapikan Home Page, merapikan Detail Page, mengimplementasikan popup diagram, kemudian menyelesaikan state loading/empty/error, dark mode, dan QA responsive. Jangan menghapus fitur yang sudah ada hanya karena mockup menampilkan bentuk yang lebih sederhana.

## 2. Product Brief

ChordPlayer membantu pengguna menemukan lagu, membaca chord/lirik, menyesuaikan nada, melihat diagram gitar, dan mengikuti lagu saat bermain. Target utama adalah gitaris pemula sampai menengah yang membutuhkan informasi chord secara cepat tanpa antarmuka yang ramai.

Keberhasilan desain diukur dari tiga hal: lagu dapat ditemukan dalam beberapa detik, chord dapat dibaca tanpa kebingungan, dan kontrol bermain dapat digunakan dengan satu tangan atau sentuhan minimal ketika pengguna sedang memegang gitar.

### Prinsip produk

| Prinsip | Implikasi desain |
|---|---|
| Cepat ditemukan | Search menjadi fokus utama Home dan selalu memiliki feedback loading/empty/error. |
| Mudah dimainkan | Chord token jelas, popup diagram dekat token, target sentuh minimal 44×44px. |
| Tidak mengganggu | Popup bersifat floating; tidak mendorong lirik secara berlebihan. |
| Konsisten | Warna, radius, tombol, spacing, dan state dipakai ulang di semua halaman. |
| Inklusif | Focus ring, kontras AA, keyboard support, reduced motion, dan label semantik wajib. |

## 3. Scope Pekerjaan

### P0 — Wajib

Home responsive, pencarian lagu, filter berdasarkan semua/judul/artis, daftar lagu, song detail, transpose up/down/reset, highlight chord aktif, popup chord diagram, rekomendasi capo, auto-scroll, speed control, fullscreen, copy chord, share, print, loading state, empty state, error state, dan dark mode dasar.

### P1 — Setelah P0 stabil

Favorit, bottom navigation yang benar-benar terhubung, multi-shape chord navigation, chord editor, metadata genre/tahun, section marker seperti Intro/Verse/Chorus, loop bagian lagu, metronom, dan riwayat lagu.

### Di luar scope saat ini

Autentikasi, sinkronisasi akun, pembayaran, streaming audio, social profile, dan editor chord kolaboratif tidak termasuk pekerjaan redesign ini kecuali disepakati ulang.

## 4. Information Architecture dan Routes

| Area | Route | Tujuan |
|---|---|---|
| Home | `/index.html` | Search, filter, dan daftar lagu |
| Detail lagu | `/detail.html?id={id}` | Chord, lirik, transpose, auto-scroll, capo, fullscreen |
| Daftar lagu API | `/api/songs` | Mengambil koleksi lagu |
| Detail lagu API | `/api/songs/{id}` | Mengambil satu lagu berdasarkan ID |

### User flow utama

```text
Home
  → masukkan judul/artis
  → pilih filter atau buka hasil
  → buka Song Detail
  → scroll atau aktifkan Auto Scroll
  → sentuh/hover chord token
  → baca popup diagram
  → transpose jika perlu
  → gunakan capo recommendation
  → masuk Fullscreen Play Mode
```

### User flow alternatif

```text
Home → pencarian tanpa hasil → Empty State → Reset pencarian
Home → API gagal → Error State → Coba lagi
Detail → chord tidak memiliki shape → toast “Diagram belum tersedia”
Detail → tekan Esc/klik luar → popup tertutup
```

## 5. Design System

### Color tokens

| Token | Nilai | Penggunaan |
|---|---|---|
| `--blue-600` | `#0D47A1` | Header, primary button, link aktif |
| `--green-500` | `#22C55E` | Chord token, active state, success, accent |
| `--surface-base` | `#FFFFFF` | Card dan page surface light |
| `--surface-subtle` | `#F5F7FA` | Background page dan secondary surface |
| `--surface-dark` | `#0F172A` | Page surface dark |
| `--text-primary` | `#111827` | Heading dan body utama |
| `--text-secondary` | `#374151` | Metadata dan helper text |
| `--text-muted` | `#6B7280` | Caption dan placeholder |
| `--border` | `#E5E7EB` | Divider dan outline |
| `--danger` | `#EF4444` | Error state |

### Typography

Gunakan Inter atau system sans-serif. Heading utama menggunakan 32–40px desktop dan 24–28px mobile dengan weight 600–700. Body menggunakan 16px/24px. Metadata menggunakan 13–14px/20px. Caption dan label menggunakan 12px/16px. Hindari terlalu banyak weight dan jangan menggunakan uppercase untuk teks panjang.

### Layout and breakpoints

| Breakpoint | Aturan |
|---|---|
| `< 640px` | Mobile satu kolom; toolbar dapat wrap; filter dapat horizontal scroll; bottom navigation tampil. |
| `640–767px` | Mobile besar/tablet kecil; card tetap satu kolom, spacing bertambah. |
| `768–1023px` | Tablet; Home dapat menggunakan dua kolom; popup dibatasi viewport. |
| `≥ 1024px` | Desktop; Home dua kolom atau grid; toolbar satu baris; bottom navigation disembunyikan. |
| `≥ 1440px` | Container maksimal sekitar 1180–1280px agar teks tidak terlalu melebar. |

Gunakan spacing berbasis kelipatan 4 atau 8px. Semua target interaksi minimal 44×44px. Popup tidak boleh keluar dari viewport dan harus memiliki margin minimal 12px dari tepi layar.

### Radius and elevation

Gunakan radius 8px untuk input/chip kecil, 12px untuk card, dan 16px untuk panel besar. Shadow harus lembut dan tidak mendominasi. Dark mode menggunakan border yang sedikit lebih terang daripada surface, bukan shadow hitam pekat.

## 6. Screen Specifications

### 6.1 Home Desktop

Header memiliki wordmark ChordPlayer di kiri, navigasi Home di tengah atau kiri sesuai implementasi, dan theme toggle di kanan. Hero berisi heading `Cari Chord Lagu`, subtitle `Temukan chord dan lirik lagu favoritmu`, lalu search field utama dengan placeholder `Cari judul lagu atau nama artis...`.

Filter chip berisi `Semua`, `Judul`, dan `Artis`. Di area daftar lagu tampilkan heading `Daftar Lagu` dan badge jumlah seperti `7 lagu`. Song card memiliki ikon chord hijau, judul, artis, optional metadata, dan panah. Gunakan grid dua kolom pada desktop dengan jarak konsisten.

### 6.2 Home Mobile

Header menjadi compact dengan hamburger, wordmark, dan theme toggle. Search field menggunakan lebar penuh. Filter chip dapat digeser horizontal tanpa merusak layout. Song card menjadi satu kolom dengan target sentuh besar. Bottom navigation dapat ditampilkan dengan label `Beranda`, `Lagu`, `Favorit`, dan `Akun`; jika route belum tersedia, tampilkan sebagai visual direction atau nonaktifkan dengan jelas, jangan membuat navigasi palsu yang membingungkan.

### 6.3 Search Results

Setelah pengguna mengetik query, tampilkan query secara visual dan jumlah hasil. Filter aktif harus memiliki style yang berbeda. Sediakan opsi reset/clear. Jika hasil banyak, pertahankan card layout dan tambahkan sort hanya bila data memang mendukungnya.

### 6.4 Empty Search

Gunakan icon search sederhana, heading `Lagu tidak ditemukan`, helper text `Coba kata kunci lainnya`, dan tombol sekunder `Reset pencarian`. Empty state tidak boleh terlihat seperti error.

### 6.5 Loading

Pertahankan struktur layout akhir menggunakan skeleton. Skeleton harus memiliki tinggi yang sama dengan heading/search/card agar halaman tidak meloncat ketika data selesai. Hindari spinner besar sebagai satu-satunya indikator.

### 6.6 Error

Tampilkan card dengan heading `Gagal memuat lagu`, helper `Periksa koneksi lalu coba lagi.`, dan tombol primary `Coba lagi`. Jangan menampilkan stack trace atau detail database kepada pengguna.

### 6.7 Detail Lagu Desktop

Header detail menampilkan tombol kembali, judul lagu, artis, dan optional metadata. Toolbar berisi `Transpose Up`, `Transpose Down`, `Reset`, `Auto Scroll`, speed selector, `Copy Chord`, `Bagikan`, `Print`, dan `Fullscreen`. Capo recommendation tampil sebagai card yang informatif tetapi tidak mengalahkan lirik.

Area lirik harus mempertahankan whitespace dan section marker. Chord token berwarna accent green. Baris chord aktif mendapat background highlight ringan. Popup diagram muncul dekat chord yang di-hover/disentuh; popup tidak mengambil layout space permanen.

### 6.8 Detail Lagu Mobile

Header detail compact dan toolbar dapat wrap atau menggunakan horizontal scroll. Kontrol yang paling sering digunakan—transpose, auto-scroll, speed, fullscreen—harus mudah dicapai dengan ibu jari. Search dan metadata tidak boleh mengambil ruang berlebihan di atas lirik.

Tampilkan hint kecil `Sentuh chord untuk melihat diagram` hanya jika pengguna belum pernah membuka popup dalam sesi tersebut. Hint dapat disembunyikan setelah interaksi pertama.

## 7. Chord Popup Specification

Popup adalah floating card yang menempel secara visual pada chord token. Pada desktop, popup terbuka ketika pointer mouse hover. Pada mobile, popup terbuka melalui `pointerdown` dengan `pointerType: touch`; jangan mengharuskan click tambahan.

Popup wajib memiliki title chord, tombol close, SVG fretboard sederhana, label enam senar `E A D G B e`, marker open `○`, marker mute `×`, posisi fret dasar untuk barre chord, dan kontrol previous/next jika shape alternatif tersedia. Jika hanya satu shape tersedia, tampilkan `1 dari 1` atau sembunyikan navigasi sesuai keputusan desain.

Popup tertutup ketika pengguna menekan `Esc`, menyentuh area di luar, atau mengganti lagu/transpose. Popup harus memiliki `role="dialog"`, `aria-hidden`, accessible name, dan tombol close dengan aria-label.

### Fretboard SVG minimum

| Elemen | Spesifikasi |
|---|---|
| Strings | 6 garis vertikal dengan urutan E-A-D-G-B-e |
| Frets | 5 garis horizontal per viewport diagram |
| Nut | Garis lebih tebal pada posisi fret 1 |
| Base fret | Label seperti `4fr` untuk barre chord |
| Open string | Lingkaran kecil di atas grid |
| Muted string | Simbol `×` di atas grid |
| Position marker | Lingkaran accent green pada fret yang dimainkan |
| Accessibility | `aria-label` menjelaskan chord, senar, dan fret |

## 8. Interaction and State Rules

| Komponen | Default | Hover | Focus | Touch/Active | Error |
|---|---|---|---|---|---|
| Song card | White surface | Border/accent lebih jelas | Focus ring | Sedikit pressed | Tidak berlaku |
| Filter chip | Outline | Accent tint | Focus ring | Accent fill | Tidak berlaku |
| Chord token | Green text | Green background | Focus ring | Popup open + selected | Toast bila shape unavailable |
| Primary button | Blue fill | Darker blue | Focus ring | Pressed state | Disabled bila request berjalan |
| Popup | Hidden | Open on hover | Open on focus | Open on touch | Close/empty fallback |
| Search | Empty | Border accent | Focus ring | Active input | Empty/error result |

## 9. Functional Requirements

### Search

Search harus bisa mencari berdasarkan judul dan artis. Filter `Semua`, `Judul`, dan `Artis` harus menghasilkan daftar yang konsisten. Input kosong menampilkan daftar default. Input dengan hasil nol menampilkan Empty State. API error menampilkan Error State dan tombol retry.

### Transpose

Transpose harus mendukung nilai positif, negatif, lebih dari satu oktaf, flat/sharp, chord kompleks, dan slash chord. Tombol Reset mengembalikan nilai ke 0. Setelah transpose, chord token dan display transpose harus konsisten. Capo recommendation harus diperbarui.

### Auto-scroll

Speed control minimal menyediakan 0,25×, 0,5×, 1×, 1,5×, 2×, 3×, dan 4× bila desain terbaru digunakan. Preferensi boleh disimpan di localStorage dengan key yang konsisten. Perubahan speed saat auto-scroll berjalan harus langsung diterapkan. Auto-scroll sebaiknya berhenti atau berubah state ketika mencapai akhir dokumen.

### Fullscreen

Fullscreen harus memakai Fullscreen API dengan fallback vendor bila perlu. Tombol harus memperbarui label dan `aria-pressed`. `Esc` harus dapat keluar. Dalam play mode, sembunyikan distraksi yang tidak penting tetapi jangan menghilangkan kontrol exit.

### Capo

Panel capo menampilkan posisi capo, penjelasan, dan badge. Nilai transpose 0 menampilkan `Capo 0`. Nilai positif dapat menyarankan capo sesuai aturan aplikasi. Nilai negatif tidak boleh disampaikan seolah-olah capo dapat menurunkan nada.

## 10. Data Contract

### GET `/api/songs`

Contoh respons sukses:

```json
{
  "data": [
    {
      "id": 2,
      "title": "Akad",
      "artist": "Payung Teduh"
    }
  ]
}
```

### GET `/api/songs/{id}`

Contoh respons sukses:

```json
{
  "data": {
    "id": 2,
    "title": "Akad",
    "artist": "Payung Teduh",
    "chord": "F       G\nLirik lagu lainnya"
  }
}
```

Error response minimal:

```json
{
  "error": "Lagu tidak ditemukan"
}
```

Jangan merender `title`, `artist`, atau `chord` sebagai HTML mentah. Escape data eksternal sebelum masuk ke DOM. Query database harus tetap menggunakan parameter binding.

## 11. Acceptance Criteria

### Home

- Desktop menampilkan header, hero search, filter, jumlah lagu, dan grid card.
- Mobile menampilkan layout satu kolom dengan target sentuh yang nyaman.
- Search judul/artis berhasil dan filter menghasilkan data sesuai kategorinya.
- Loading, empty, dan error state tersedia.
- Dark mode tidak merusak kontras atau keterbacaan.

### Detail

- Judul/artis/lirik tampil setelah API selesai.
- Chord token terlihat jelas dan baris aktif ter-highlight saat scroll.
- Popup muncul saat hover desktop dan touch mobile tanpa click tambahan.
- Popup tidak overflow viewport dan dapat ditutup dengan outside touch atau Esc.
- Transpose/reset memperbarui chord, display, diagram berikutnya, dan capo.
- Speed selector tersimpan dan tidak menghentikan auto-scroll saat nilai berubah.
- Fullscreen masuk/keluar dan tetap menyediakan exit control.

### Quality

- Tidak ada `node --check` error.
- Tidak ada `git diff --check` error.
- Tidak ada console error blocking pada Home dan Detail.
- Tidak ada data eksternal yang masuk DOM tanpa escaping.
- Keyboard focus terlihat dan kontrol utama dapat dicapai tanpa mouse.

## 12. QA Matrix

| Test | Desktop Chrome | Mobile viewport | Keyboard | Dark mode |
|---|---:|---:|---:|---:|
| Home initial load | Wajib | Wajib | Wajib | Wajib |
| Search by title | Wajib | Wajib | Wajib | Wajib |
| Search by artist | Wajib | Wajib | Wajib | Wajib |
| Empty search | Wajib | Wajib | Wajib | Wajib |
| API error/retry | Wajib | Wajib | Tidak wajib | Wajib |
| Open song detail | Wajib | Wajib | Wajib | Wajib |
| Chord hover | Wajib | Tidak berlaku | Tidak wajib | Wajib |
| Chord touch | Tidak wajib | Wajib | Tidak wajib | Wajib |
| Popup outside close | Wajib | Wajib | Tidak wajib | Wajib |
| Popup Esc close | Wajib | Wajib bila keyboard tersedia | Wajib | Wajib |
| Transpose/reset | Wajib | Wajib | Wajib | Wajib |
| Auto-scroll speed | Wajib | Wajib | Tidak wajib | Wajib |
| Fullscreen | Wajib | Wajib | Wajib | Wajib |
| Print | Wajib | Opsional | Tidak wajib | Tidak wajib |

## 13. Implementation Plan

### Sprint 1 — Foundation

Rapikan token CSS, container width, typography, header, button, input, chip, card, state, dan responsive breakpoints. Jangan mengubah API atau logika fitur yang sudah stabil pada sprint ini.

### Sprint 2 — Home

Implementasikan Home desktop/mobile sesuai mockup. Pastikan search, filter, loading, empty, error, count badge, song card, dan dark mode memiliki state lengkap.

### Sprint 3 — Detail and Popup

Implementasikan toolbar detail, lirik, chord token, active line highlight, popup SVG, outside close, Esc, hover, touch, dan responsive positioning.

### Sprint 4 — Play Utilities

Rapikan transpose, reset, capo recommendation, auto-scroll speed, persistence, fullscreen, copy, share, dan print. Uji setiap fitur secara terpisah dan gabungan.

### Sprint 5 — QA and Handoff

Jalankan QA matrix, review accessibility, periksa console, dokumentasikan known limitations, dan buka pull request dengan screenshot before/after.

## 14. Git and Delivery Rules

Kerjakan dalam branch fitur, bukan langsung di `main`. Gunakan commit kecil dengan pesan jelas, misalnya `feat: refine responsive home page`, `feat: add chord popup states`, atau `fix: prevent popup overflow on mobile`. Setiap pull request wajib menyertakan ringkasan, screenshot desktop/mobile, daftar test yang dijalankan, dan known limitations.

Sebelum merge, pastikan working tree bersih, branch sudah rebase/merge dari `main`, dan tidak ada perubahan yang tidak berkaitan dengan scope.

## 15. Known Baseline Notes

Repository saat ini sudah memiliki fitur Version 1.2 seperti transpose chord, auto-scroll speed, fullscreen, highlight chord aktif, chord diagram popup, dan rekomendasi capo. Mockup baru merupakan arah penyempurnaan UI/UX, bukan alasan untuk menghapus perilaku yang sudah bekerja.

Dokumentasi local run dan konfigurasi database sebaiknya diverifikasi terpisah sebelum onboarding developer. Fokus handoff ini adalah implementasi UI/UX dan integrasi ke API yang sudah ada.

## 16. Asset Manifest

| File | Isi |
|---|---|
| `assets/01-design-system-reference.png` | Warna, typography, buttons, forms, cards, interaction states, light/dark surface |
| `assets/02-home-desktop-mobile.png` | Home Page desktop/mobile, loading, empty, dark mode |
| `assets/03-core-screens.png` | Home dan Detail pada desktop/mobile |
| `assets/04-application-states.png` | Search results, empty, loading, error, dark mode, play mode |
| `assets/05-detail-chord-popup.png` | Detail mobile dengan popup diagram chord |
| `previous-uiux-handoff.md` | Ringkasan handoff UI/UX versi sebelumnya |
| `mobile-svg-test-reference.md` | Catatan pengujian SVG mobile sebelumnya jika tersedia |

## 17. Message Template untuk Developer

> Hai, ini paket handoff lengkap ChordPlayer. Tolong baca `CHORDPLAYER_HANDOFF.md` terlebih dahulu, lalu lihat aset di folder `assets/` sesuai nomor. Repository baseline ada di https://github.com/pance24-web/ChordPlayer.
>
> Fokus implementasi: responsive Home, Detail Lagu, chord popup hover/touch, transpose/reset, auto-scroll speed, capo, fullscreen, dark mode, dan loading/empty/error state. Mockup adalah visual direction; pertahankan fitur dan API yang sudah ada. Setiap PR harus menyertakan screenshot desktop/mobile, acceptance criteria yang terpenuhi, dan daftar test.

## References

[1]: https://github.com/pance24-web/ChordPlayer "ChordPlayer GitHub repository"
[2]: https://github.com/pance24-web/ChordPlayer/tree/main/docs "ChordPlayer database documentation"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen "Fullscreen API reference"
