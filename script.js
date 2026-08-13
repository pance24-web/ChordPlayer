// ─── DARK MODE MANAGEMENT ─────────────────────────────────────
const DARK_MODE_KEY = 'chordplayer-dark-mode';
const SCROLL_POSITION_PREFIX = 'chordplayer-scroll-'; // ← Ditambahkan

function initDarkMode() {
  // Cek localStorage atau system preference
  const savedTheme = localStorage.getItem(DARK_MODE_KEY);
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeToggle(true);
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    updateThemeToggle(false);
  } else {
    // Jika belum ada setting, ikuti system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark-mode');
    }
    updateThemeToggle(prefersDark);
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(DARK_MODE_KEY, isDark ? 'dark' : 'light');
  updateThemeToggle(isDark);
}

function updateThemeToggle(isDark) {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

// ─── DEBOUNCE UTILITY ─────────────────────────────────────────
// Fungsi ini menundakan eksekusi function sampai user berhenti ngetik
// Misal: kalau ngetik 3 huruf berturut-turut (3 oninput events),
// function hanya dijalankan 1x setelah 300ms user berhenti
function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// ─── STATE APLIKASI ───────────────────────────────────────────
let allSongs = [];
const API_BASE_URL = '/api/songs';
let searchFilter = 'all'; // 'all', 'title', atau 'artist'

// Buat debounced version dari handleSearch
const debouncedSearch = debounce(handleSearch, 300);

// ─── DETAIL CONTROL STATE ─────────────────────────────────────
let currentChord = "";
let transposeValue = 0;
let scrollInterval = null;


// ─── SECURITY: ESCAPE HTML ────────────────────────────────────
// Mencegah kode HTML/script masuk langsung ke halaman
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── UPDATE TAMPILAN TRANSPOSE ────────────────────────────────
function updateTransposeDisplay() {
  const display = document.getElementById('transposeDisplay');
  if (!display) return;

  const sign = transposeValue > 0 ? '+' : '';
  display.textContent = `Transpose: ${sign}${transposeValue}`;
}

// ─── LOAD DATA LAGU ───────────────────────────────────────────
async function loadSongs() {
  const songListContainer = document.getElementById('songList');
  if (!songListContainer) return;

  try {
    // Tampilkan loading state
    songListContainer.innerHTML = `
      <div class="empty-state">
        <div class="loading-spinner"></div>
        <p>Memuat daftar lagu...</p>
      </div>
    `;

    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error("Gagal membaca data lagu");
    }

    const result = await response.json();
    allSongs = result.data;
    renderSongList(allSongs);

  } catch (error) {
    console.error(error);
    songListContainer.innerHTML = `
      <div class="empty-state error-state">
        <div class="empty-icon">⚠️</div>
        <p>Gagal memuat daftar lagu.</p>
        <span class="empty-hint">Periksa koneksi internet kamu</span>
        <button class="btn-retry" onclick="loadSongs()">🔄 Coba Lagi</button>
      </div>
    `;
  }
}

// ─── RENDER DAFTAR LAGU ────────────────────────────────────────
function renderSongList(songArray) {
  const songListContainer = document.getElementById('songList');
  const songCountContainer = document.getElementById('songCount');

  if (!songListContainer) return;

  if (songCountContainer) {
    songCountContainer.textContent = `${songArray.length} lagu`;
  }

  // ✅ Tampilkan pesan jika hasil pencarian kosong
  if (songArray.length === 0) {
    songListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>Lagu yang kamu cari tidak ditemukan.</p>
        <span class="empty-hint">Coba kata kunci lain</span>
      </div>
    `;
  return;
  }
  songListContainer.innerHTML = songArray.map(song => `
    <a href="detail.html?id=${encodeURIComponent(song.id)}" class="song-card">
      <div class="song-info">
        <div class="title">${escapeHTML(song.title)}</div>
        <div class="artist">${escapeHTML(song.artist)}</div>
      </div>
      <span class="arrow">→</span>
    </a>
  `).join('');
}

// ─── SEARCH ───────────────────────────────────────────────────
function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBox = document.querySelector('.search-box');
  const btnClear = document.getElementById('btnClearSearch');
  if (!searchInput) return;

  const keyword = searchInput.value.toLowerCase().trim();

  // Tampilkan/sembunyikan tombol clear
  if (btnClear) {
    btnClear.style.display = keyword.length > 0 ? 'block' : 'none';
  }

  // Tampilkan loading indicator saat searching
  if (keyword.length > 0) {
    searchBox?.classList.add('loading');
  } else {
    searchBox?.classList.remove('loading');
  }

  const result = allSongs.filter(song => {
    if (searchFilter === 'title') {
      return song.title.toLowerCase().includes(keyword);
    }
    if (searchFilter === 'artist') {
      return song.artist.toLowerCase().includes(keyword);
    }
    // default: 'all'
    return song.title.toLowerCase().includes(keyword) ||
           song.artist.toLowerCase().includes(keyword);
  });

  renderSongList(result);
  
  // Hilangkan loading setelah hasil ditampilkan
  searchBox?.classList.remove('loading');
}

// ─── CLEAR SEARCH ──────────────────────────────────────────────
function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const btnClear = document.getElementById('btnClearSearch');
  
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  
  if (btnClear) {
    btnClear.style.display = 'none';
  }
  
  renderSongList(allSongs); // Tampilkan semua lagu lagi
}

// ─── FILTER CHIPS (Semua/Judul/Artis) ──────────────────────────
function setupFilterChips() {
  const chips = document.querySelectorAll('.filter-chip');
  
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Reset semua chip ke non-active
      chips.forEach(c => c.classList.remove('active'));
      // Set chip yang diklik jadi active
      chip.classList.add('active');
      // Update filter state
      searchFilter = chip.dataset.filter;
      // Jalankan ulang search dengan filter baru
      handleSearch();
    });
  });
}

// ─── DETAIL LAGU ───────────────────────────────────────────────
async function loadSongDetail() {
  const title = document.getElementById('songTitle');
  const artist = document.getElementById('songArtist');
  const lyrics = document.getElementById('lyricsArea');

  if (!title || !artist || !lyrics) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    title.textContent = "-";
    artist.textContent = "-";
    lyrics.textContent = "Pilih lagu dari halaman utama.";
    return;
  }

  try {
    // Tampilkan loading dengan spinner
    lyrics.innerHTML = `<div class="loading-spinner"></div> Memuat chord...`;

    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);

    // ✅ Cek dulu apakah fetch berhasil sebelum membaca isinya
    if (response.status === 404) {
      title.textContent = "-";
      artist.textContent = "-";
      lyrics.textContent = "Lagu tidak ditemukan.";
      return;
    }

    if (!response.ok) {
      throw new Error(`Gagal membaca data: ${response.status}`);
    }

    const result = await response.json();
    const song = result.data;

    title.textContent = song.title;
    artist.textContent = song.artist;

    currentChord = song.chord;
    transposeValue = 0;
    lyrics.textContent = currentChord;

    // ✅ Reset tampilan transpose
    updateTransposeDisplay();

    // ✅ Pulihkan posisi scroll terakhir untuk lagu ini
    restoreScrollPosition(id); // ← Ditambahkan
    // ✅ Reset tombol scroll jika sebelumnya aktif
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
    const btn = document.getElementById('btnAutoScroll');
    if (btn) btn.textContent = '▶ Auto Scroll';

  } catch (error) {
    console.error(error);
    lyrics.innerHTML = `
      <div class="error-state">
        <p>⚠️ Gagal memuat lagu.</p>
        <span class="empty-hint">Periksa koneksi internet kamu</span>
      </div>
    `;
  }
}
// ─── TRANSPOSE CHORD ──────────────────────────────────────────
// Fungsi ini mengubah nada chord (misal C jadi D) berdasarkan
// jumlah langkah (step). Step positif = naik nada, negatif = turun nada.
// Contoh: transposeChord("C G Am", 2) akan menghasilkan "D A Bm"
const chordList = [
  "C","C#","D","D#","E","F",
  "F#","G","G#","A","A#","B"
];

// ✅ Tabel konversi flat → sharp
// Karena Bb sama dengan A#, Eb sama dengan D#, dst
const flatToSharp = {
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#"
};

function transposeChord(chord, step) {

  return chord.replace(
    /\b[A-G](#|b)?(m|maj|min|7|sus|dim|add)?\b/g,
    function(match) {
      
      let root = match;
      let suffix = "";

      if(match.length > 1){
        if(match[1] === "#" || match[1] === "b"){
          root = match.substring(0,2);
          suffix = match.substring(2);
        }
        else{
          root = match.substring(0,1);
          suffix = match.substring(1);
        }
      }

      // ✅ Jika root adalah nada flat (misal "Bb"), ubah dulu ke bentuk sharp ("A#")
      if (flatToSharp[root]) {
        root = flatToSharp[root];
      }

      let index = chordList.indexOf(root);

      if(index === -1){
        return match; // chord tidak dikenali, biarkan apa adanya
      }

      index += step;

      if(index < 0){
        index += chordList.length;
      }

      if(index >= chordList.length){
        index -= chordList.length;
      }

      return chordList[index] + suffix;

    }
  );
}  
// ─── UPDATE TAMPILAN CHORD ─────────────────────────────────────
// Menampilkan ulang chord ke layar setelah nilai transpose berubah
function updateChordDisplay() {
  const lyrics = document.getElementById("lyricsArea");
  lyrics.textContent = transposeChord(currentChord, transposeValue);
}
function transposeUp() {
  transposeValue++;
  updateChordDisplay();
  updateTransposeDisplay(); // ✅ perbarui angka
}

function transposeDown() {
  transposeValue--;
  updateChordDisplay();
  updateTransposeDisplay(); // ✅ perbarui angka
}

// ─── AUTO SCROLL ───────────────────────────────────────────────
// Fungsi ini menyalakan/mematikan scroll otomatis halaman.
// Jika sudah aktif (scrollInterval ada isinya), maka klik akan
// menghentikannya. Jika belum aktif, klik akan menyalakannya.
function autoScroll() {
  const btn = document.getElementById('btnAutoScroll');

  if (scrollInterval) {
    // Scroll aktif → hentikan
    clearInterval(scrollInterval);
    scrollInterval = null;
    if (btn) btn.textContent = '▶ Auto Scroll';
    return;
  }

  // Scroll belum aktif → mulai
  scrollInterval = setInterval(() => {
    window.scrollBy({ top: 1, behavior: "smooth" });
  }, 100);

  if (btn) btn.textContent = '⏸ Stop Scroll';
}

// ─── COPY CHORD ────────────────────────────────────────────────
// Menyalin chord & lirik yang sedang ditampilkan (sudah termasuk transpose) ke clipboard
async function copyChord() {
  const btn = document.getElementById('btnCopyChord');
  const lyrics = document.getElementById('lyricsArea');
  if (!lyrics || !btn) return;

  const textToCopy = lyrics.textContent;

  try {
    await navigator.clipboard.writeText(textToCopy);
    showCopyFeedback(btn);
  } catch (error) {
    // Fallback untuk browser lama / permission ditolak
    fallbackCopy(textToCopy);
    showCopyFeedback(btn);
  }
}

// ─── SHARE LAGU ────────────────────────────────────────────────
// Pakai Web Share API (native share sheet) kalau didukung browser,
// fallback ke copy link kalau tidak didukung (misal di desktop Chrome/Firefox)
async function shareSong() {
  const btn = document.getElementById('btnShareSong');
  const title = document.getElementById('songTitle');
  const artist = document.getElementById('songArtist');
  if (!btn) return;

  const shareData = {
    title: `${title?.textContent || 'Chord Lagu'} - ChordPlayer`,
    text: `Lihat chord "${title?.textContent}" oleh ${artist?.textContent} di ChordPlayer`,
    url: window.location.href
  };

  // Cek apakah browser support native share (biasanya di HP)
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      // User batal share (klik cancel) — tidak perlu tampilkan error
      if (error.name !== 'AbortError') {
        console.error('Gagal share:', error);
      }
    }
  } else {
    // Fallback: copy link ke clipboard (untuk desktop)
    try {
      await navigator.clipboard.writeText(shareData.url);
      showShareFeedback(btn);
    } catch (error) {
      fallbackCopy(shareData.url);
      showShareFeedback(btn);
    }
  }
}
// ─── PRINT CHORD ───────────────────────────────────────────────
// Memicu dialog print browser. Layout kertas diatur penuh lewat
// @media print di styles.css — nav, tombol, dark mode disembunyikan
// otomatis, tanpa perlu manipulasi DOM di sini.
function printChord() {
  window.print();
}

// ─── SIMPAN & PULIHKAN POSISI SCROLL ──────────────────────────
// Posisi disimpan per-lagu (pakai song ID) supaya tidak tertukar
// antar lagu. Disimpan hanya saat scroll berhenti (debounce),
// bukan di setiap event scroll, biar tidak boros write ke localStorage.

function getScrollKey(songId) {
  return `${SCROLL_POSITION_PREFIX}${songId}`;
}

function saveScrollPosition(songId) {
  if (!songId) return;
  localStorage.setItem(getScrollKey(songId), window.scrollY.toString());
}

function restoreScrollPosition(songId) {
  if (!songId) return;

  const savedPosition = localStorage.getItem(getScrollKey(songId));
  if (savedPosition === null) return;

  const position = parseInt(savedPosition, 10);
  if (isNaN(position) || position <= 0) return;

  // Delay singkat supaya konten (chord/lirik) sudah selesai dirender
  // sebelum browser scroll ke posisi tersimpan
  setTimeout(() => {
    window.scrollTo({ top: position, behavior: 'instant' });
  }, 100);
}

// Debounced version — dipanggil di event listener scroll
const debouncedSaveScroll = debounce((songId) => {
  saveScrollPosition(songId);
}, 500);

// Tampilkan feedback visual sesaat setelah link berhasil di-copy (fallback path)
function showShareFeedback(btn) {
  const originalText = btn.textContent;
  btn.textContent = '✅ Link tersalin!';
  btn.classList.add('copied');

  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('copied');
  }, 1500);
}

// Fallback pakai textarea sementara (untuk browser yang tidak support Clipboard API)
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Tampilkan feedback visual sesaat setelah berhasil copy
function showCopyFeedback(btn) {
  const originalText = btn.textContent;
  btn.textContent = '✅ Tersalin!';
  btn.classList.add('copied');

  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('copied');
  }, 1500);
}

// ─── EVENT LISTENERS (Halaman Detail) ─────────────────────────
// Menghubungkan tombol dengan fungsinya lewat JavaScript,
// bukan lewat onclick di HTML

function setupDetailControls() {
  const btnUp = document.getElementById('btnTransposeUp');
  const btnDown = document.getElementById('btnTransposeDown');
  const btnScroll = document.getElementById('btnAutoScroll');
  const btnCopy = document.getElementById('btnCopyChord');
  const btnShare = document.getElementById('btnShareSong');
  const btnPrint = document.getElementById('btnPrintChord'); // ← Ditambahkan

  if (btnUp) {
    btnUp.addEventListener('click', transposeUp);
  }

  if (btnDown) {
    btnDown.addEventListener('click', transposeDown);
  }

  if (btnScroll) {
    btnScroll.addEventListener('click', autoScroll);
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', copyChord);
  }

  if (btnShare) {
    btnShare.addEventListener('click', shareSong);
  }

  if (btnPrint) {                              // ← Ditambahkan
    btnPrint.addEventListener('click', printChord); // ← Ditambahkan
  }                                             // ← Ditambahkan
}

// ─── START ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi dark mode
  initDarkMode();
  
  // Setup theme toggle button
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleDarkMode);
  }

  // Setup search input dengan debounce
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debouncedSearch);
  }

  // Setup tombol clear search
  const btnClearSearch = document.getElementById('btnClearSearch');
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', clearSearch);
  }

  // Setup filter chips (Semua/Judul/Artis)
  setupFilterChips();

  loadSongs();        // Untuk halaman utama (index.html)
  loadSongDetail();   // Untuk halaman detail (detail.html)
  setupDetailControls(); // ✅ Pasang event listener tombol detail

  // ✅ Setup penyimpanan posisi scroll (hanya relevan di halaman detail)
  const params = new URLSearchParams(window.location.search); // ← Ditambahkan
  const currentSongId = params.get('id');                     // ← Ditambahkan
  if (currentSongId) {                                         // ← Ditambahkan
    window.addEventListener('scroll', () => {                  // ← Ditambahkan
      debouncedSaveScroll(currentSongId);                       // ← Ditambahkan
    });                                                          // ← Ditambahkan
  }                                                              // ← Ditambahkan

});