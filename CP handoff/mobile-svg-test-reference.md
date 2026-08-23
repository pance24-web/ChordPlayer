# Pengujian Mobile SVG Chord Diagram

Preview lokal: https://4173-iaiup4oo3v6cqrrkcem0g-4608fa16.sg1.manus.computer/detail.html?id=2
Tanggal: 2026-08-14

Preview lokal berhasil dimuat menggunakan data lagu tiruan yang berisi F, G, Am, dan Cmaj7. Area lirik menampilkan chord token sebagai tombol yang dapat disentuh. Halaman detail, kontrol transpose, auto-scroll, capo, dan popup chord tersedia.

Tampilan final popup belum dibuka pada tahap awal. Pengujian berikutnya akan memeriksa SVG, marker nomor jari, legenda posisi jari, open/mute, serta batas popup pada viewport.

## Popup F

Sentuhan pada F berhasil membuka popup. SVG memiliki viewBox `0 0 260 195`, enam marker nomor jari `1, 3, 4, 2, 1, 1`, dan aria-label untuk setiap senar/fret/jari. Legenda menampilkan Telunjuk, Jari tengah, Jari manis, Kelingking, serta keterangan open/mute.

Screenshot menunjukkan popup berada di dekat area chord, fretboard terbaca, marker hijau terlihat jelas, dan legenda berada di bawah diagram. Pada viewport 1280×1100, popup berukuran sekitar 262×396 px dan tidak overflow ke kiri, kanan, atau bawah.

## Chord open/mute dan kompleks

Am berhasil menampilkan tiga nomor jari `2, 3, 1`, satu marker mute pada senar E, dan dua marker open pada senar A/e. Popup tetap berada dalam batas viewport.

Cmaj7 berhasil menampilkan dua nomor jari `3, 2`, tiga marker open, satu marker mute, legenda posisi jari, dan tidak overflow pada viewport. Ini mengonfirmasi diagram kompleks tetap dirender melalui popup touch.
