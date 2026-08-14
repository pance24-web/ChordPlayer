// ─── DARK MODE MANAGEMENT ─────────────────────────────────────
const DARK_MODE_KEY = 'chordplayer-dark-mode';
const SCROLL_POSITION_PREFIX = 'chordplayer-scroll-';

function initDarkMode() {
  const savedTheme = localStorage.getItem(DARK_MODE_KEY);

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeToggle(true);
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    updateThemeToggle(false);
  } else {
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

const debouncedSearch = debounce(handleSearch, 300);

// ─── DETAIL CONTROL STATE ─────────────────────────────────────
let currentChord = "";
let transposeValue = 0;
let scrollInterval = null;

// ─── SECURITY: ESCAPE HTML ────────────────────────────────────
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── TOAST NOTIFICATION SYSTEM ─────────────────────────────────
// type: 'default' | 'success' | 'error'
function showToast(message, type = 'default', duration = 2500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { default: 'ℹ️', success: '✅', error: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.setProperty('--toast-duration', `${duration}ms`);
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.default}</span>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration + 250);
}

// ─── UPDATE TAMPILAN TRANSPOSE ────────────────────────────────
function updateTransposeDisplay() {
  const display = document.getElementById('transposeDisplay');
  if (!display) return;

  const sign = transposeValue > 0 ? '+' : '';
  display.textContent = `Transpose: ${sign}${transposeValue}`;
}

// ─── SKELETON RENDERER ─────────────────────────────────────────
function renderSongSkeletons(count = 4) {
  return Array.from({ length: count }, () => `
    <div class="skeleton-song-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-artist"></div>
    </div>
  `).join('');
}

function renderLyricsSkeleton() {
  return `
    <div class="skeleton-lyrics">
      <div class="skeleton skeleton-line w-3-5"></div>
      <div class="skeleton skeleton-line w-full"></div>
      <div class="skeleton skeleton-line w-4-5"></div>
      <div class="skeleton skeleton-line w-full"></div>
      <div class="skeleton skeleton-line w-2-5"></div>
      <div class="skeleton skeleton-line w-4-5"></div>
    </div>
  `;
}

// ─── LOAD DATA LAGU ───────────────────────────────────────────
async function loadSongs() {
  const songListContainer = document.getElementById('songList');
  if (!songListContainer) return;

  try {
    songListContainer.innerHTML = renderSongSkeletons(4);

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
    showToast('Gagal memuat daftar lagu', 'error');
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

  if (btnClear) {
    btnClear.style.display = keyword.length > 0 ? 'block' : 'none';
  }

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
    return song.title.toLowerCase().includes(keyword) ||
           song.artist.toLowerCase().includes(keyword);
  });

  renderSongList(result);
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

  renderSongList(allSongs);
}

// ─── FILTER CHIPS (Semua/Judul/Artis) ──────────────────────────
function setupFilterChips() {
  const chips = document.querySelectorAll('.filter-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      searchFilter = chip.dataset.filter;
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
    lyrics.innerHTML = renderLyricsSkeleton();

    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);

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

    updateTransposeDisplay();
    restoreScrollPosition(id);

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
    showToast('Gagal memuat chord', 'error');
  }
}

// ─── TOMBOL KEMBALI (SMART BACK) ───────────────────────────────
function handleBackClick(event) {
  if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
    event.preventDefault();
    window.history.back();
  }
}

// ─── TRANSPOSE CHORD ──────────────────────────────────────────
const chordList = [
  "C","C#","D","D#","E","F",
  "F#","G","G#","A","A#","B"
];

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

      if (match.length > 1) {
        if (match[1] === "#" || match[1] === "b") {
          root = match.substring(0, 2);
          suffix = match.substring(2);
        } else {
          root = match.substring(0, 1);
          suffix = match.substring(1);
        }
      }

      if (flatToSharp[root]) {
        root = flatToSharp[root];
      }

      let index = chordList.indexOf(root);

      if (index === -1) {
        return match;
      }

      index += step;

      if (index < 0) {
        index += chordList.length;
      }

      if (index >= chordList.length) {
        index -= chordList.length;
      }

      return chordList[index] + suffix;
    }
  );
}

// ─── UPDATE TAMPILAN CHORD ─────────────────────────────────────
function updateChordDisplay() {
  const lyrics = document.getElementById("lyricsArea");
  if (!lyrics) return;

  // Fade out sebentar, ganti teks, fade in — perubahan transpose
  // terasa halus, bukan "kedip" instan
  lyrics.classList.add('text-transition');

  setTimeout(() => {
    lyrics.textContent = transposeChord(currentChord, transposeValue);
    lyrics.classList.remove('text-transition');
  }, 120);
}

function transposeUp() {
  transposeValue++;
  updateChordDisplay();
  updateTransposeDisplay();
}

function transposeDown() {
  transposeValue--;
  updateChordDisplay();
  updateTransposeDisplay();
}

// ─── AUTO SCROLL ───────────────────────────────────────────────
function autoScroll() {
  const btn = document.getElementById('btnAutoScroll');

  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
    if (btn) btn.textContent = '▶ Auto Scroll';
    return;
  }

  scrollInterval = setInterval(() => {
    window.scrollBy({ top: 1, behavior: "smooth" });
  }, 100);

  if (btn) btn.textContent = '⏸ Stop Scroll';
}

// ─── COPY CHORD ────────────────────────────────────────────────
async function copyChord() {
  const btn = document.getElementById('btnCopyChord');
  const lyrics = document.getElementById('lyricsArea');
  if (!lyrics || !btn) return;

  const textToCopy = lyrics.textContent;

  try {
    await navigator.clipboard.writeText(textToCopy);
    showCopyFeedback(btn);
    showToast('Chord berhasil disalin', 'success');
  } catch (error) {
    fallbackCopy(textToCopy);
    showCopyFeedback(btn);
    showToast('Chord berhasil disalin', 'success');
  }
}

// ─── SHARE LAGU ────────────────────────────────────────────────
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

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Gagal share:', error);
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.url);
      showShareFeedback(btn);
      showToast('Link berhasil disalin', 'success');
    } catch (error) {
      fallbackCopy(shareData.url);
      showShareFeedback(btn);
      showToast('Link berhasil disalin', 'success');
    }
  }
}

// ─── PRINT CHORD ───────────────────────────────────────────────
function printChord() {
  window.print();
}

// ─── SIMPAN & PULIHKAN POSISI SCROLL ──────────────────────────
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

  setTimeout(() => {
    window.scrollTo({ top: position, behavior: 'instant' });
  }, 100);
}

const debouncedSaveScroll = debounce((songId) => {
  saveScrollPosition(songId);
}, 500);

// ─── FEEDBACK HELPERS ──────────────────────────────────────────
function showShareFeedback(btn) {
  const originalText = btn.textContent;
  btn.textContent = '✅ Link tersalin!';
  btn.classList.add('copied');

  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('copied');
  }, 1500);
}

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
function setupDetailControls() {
  const btnUp = document.getElementById('btnTransposeUp');
  const btnDown = document.getElementById('btnTransposeDown');
  const btnScroll = document.getElementById('btnAutoScroll');
  const btnCopy = document.getElementById('btnCopyChord');
  const btnShare = document.getElementById('btnShareSong');
  const btnPrint = document.getElementById('btnPrintChord');
  const btnBack = document.getElementById('btnBack');

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

  if (btnPrint) {
    btnPrint.addEventListener('click', printChord);
  }

  if (btnBack) {
    btnBack.addEventListener('click', handleBackClick);
  }
}

// ─── START ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleDarkMode);
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debouncedSearch);
  }

  const btnClearSearch = document.getElementById('btnClearSearch');
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', clearSearch);
  }

  setupFilterChips();

  loadSongs();
  loadSongDetail();
  setupDetailControls();

  // Setup penyimpanan posisi scroll (hanya relevan di halaman detail)
  const params = new URLSearchParams(window.location.search);
  const currentSongId = params.get('id');
  if (currentSongId) {
    window.addEventListener('scroll', () => {
      debouncedSaveScroll(currentSongId);
    });
  }
});