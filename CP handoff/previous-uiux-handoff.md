# ChordPlayer — UI/UX Design Handoff

**Versi:** 1.0  
**Fokus:** Pengalaman mencari, membaca, dan memainkan chord di desktop serta mobile.

## 1. Product Direction

ChordPlayer diposisikan sebagai workspace latihan gitar yang cepat, bersih, dan mudah digunakan ketika kedua tangan pengguna sedang memegang gitar. Hierarki utama produk adalah: **temukan lagu**, **buka chord/lirik**, **sesuaikan nada dan kecepatan**, lalu **ikuti lagu melalui popup diagram dan mode fullscreen**.

## 2. Information Architecture

| Area | Tujuan | Entry point |
|---|---|---|
| Home | Mencari dan memilih lagu | `/index.html` |
| Search results | Menampilkan hasil pencarian dan filter | Home search |
| Detail lagu | Membaca chord dan lirik | Song card |
| Chord popup | Melihat fretboard chord yang disentuh | Chord token |
| Play mode | Fokus bermain tanpa distraksi | Fullscreen |
| Feedback states | Loading, empty, error, dan success feedback | Semua halaman |

## 3. Screen Inventory

| Screen/state | Desktop | Mobile | Prioritas |
|---|---:|---:|---:|
| Home default | Ya | Ya | P0 |
| Search results | Ya | Ya | P0 |
| Empty search | Ya | Ya | P0 |
| Loading | Ya | Ya | P0 |
| Error | Ya | Ya | P0 |
| Detail lagu | Ya | Ya | P0 |
| Chord diagram popup | Ya | Ya | P0 |
| Transpose/reset | Ya | Ya | P0 |
| Auto-scroll speed | Ya | Ya | P0 |
| Capo recommendation | Ya | Ya | P0 |
| Fullscreen/play mode | Ya | Ya | P1 |
| Dark mode | Ya | Ya | P1 |

## 4. Core Components

| Component | Behavior |
|---|---|
| Header | Desktop menampilkan wordmark dan theme toggle; mobile menampilkan hamburger, wordmark, dan theme toggle. |
| Search field | Mendukung pencarian judul/artis; tombol clear muncul setelah ada input. |
| Filter chips | `Semua`, `Judul`, dan `Artis`; pada mobile dapat digeser horizontal. |
| Song card | Memiliki target sentuh minimal 44px, judul, artis, ikon chord, dan affordance panah. |
| Control toolbar | Transpose, reset, auto-scroll, speed selector, copy, share, print, fullscreen. |
| Chord token | Dapat di-hover dengan mouse, disentuh pada mobile, dan difokuskan dengan keyboard. |
| Chord popup | Floating card dekat token; berisi chord title, fretboard SVG, open/mute marker, posisi fret, dan close control. |
| Capo card | Menampilkan posisi capo, transposisi, dan penjelasan singkat. |
| Toast | Memberikan feedback untuk copy, share, error, dan diagram yang belum tersedia. |
| Bottom navigation | Hanya mobile; `Beranda`, `Lagu`, `Favorit`, `Akun`. |

## 5. Design Tokens

| Token | Nilai rekomendasi |
|---|---|
| Primary | `#0D47A1` / cobalt blue |
| Accent | `#22C55E` / green |
| Surface | `#FFFFFF` |
| Surface subtle | `#F5F7FA` |
| Text primary | `#111827` |
| Text secondary | `#374151` |
| Muted | `#6B7280` |
| Border | `#E5E7EB` |
| Radius | 8–16px |
| Touch target | Minimum 44×44px |
| Body type | Inter or system sans-serif, 16px/24px |
| Caption | 12px/16px |

## 6. Interaction Rules

Popup diagram muncul melalui hover pada desktop dan sentuhan langsung pada mobile. Popup dapat ditutup melalui tombol `×`, sentuhan di luar, atau tombol `Esc`. Chord yang sedang aktif karena posisi scroll tetap diberi highlight, tetapi chord yang disentuh memperoleh state focus/selected yang lebih kuat.

Pada detail lagu, perubahan transpose harus memperbarui chord token, diagram yang dibuka berikutnya, rekomendasi capo, dan indikator transpose secara konsisten. Perubahan speed auto-scroll harus diterapkan tanpa menghentikan proses scroll yang sedang berjalan.

## 7. Accessibility Checklist

| Requirement | Target |
|---|---|
| Keyboard focus | Semua tombol, chip, select, dan chord token memiliki focus ring yang jelas. |
| Touch target | Semua kontrol utama minimal 44×44px. |
| Popup semantics | `role="dialog"`, `aria-hidden`, judul popup, dan tombol close berlabel. |
| Chord semantics | Token menggunakan button, bukan elemen non-interaktif. |
| Reduced motion | Animasi popup dan transisi dapat dikurangi melalui `prefers-reduced-motion`. |
| Contrast | Teks dan kontrol memenuhi kontras AA. |
| Error feedback | Error memiliki pesan yang jelas dan action `Coba lagi`. |

## 8. Implementation Priorities

**P0** adalah fondasi pengalaman utama: Home responsive, pencarian/filter, detail lagu, chord token interaktif, popup diagram, transpose/reset, auto-scroll, dan states loading/empty/error. **P1** adalah penyempurnaan pengalaman latihan: dark mode yang konsisten, fullscreen play mode, rekomendasi capo yang lebih cerdas, dan bottom navigation yang terhubung dengan fitur favorit.

## 9. Visual Deliverables

- `ChordPlayer-design-system-reference.png`: tokens, components, surfaces, dan interaction states.
- `ChordPlayer-core-screens-uiux.png`: Home dan Detail pada desktop/mobile.
- `ChordPlayer-states-uiux.png`: search results, empty, loading, error, dark mode, dan play mode.
