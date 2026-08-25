// ─── DARK MODE MANAGEMENT ─────────────────────────────────────
const DEBUG_LOGGING = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const DARK_MODE_KEY = 'chordplayer-dark-mode';
const SCROLL_POSITION_PREFIX = 'chordplayer-scroll-';
const AUTO_SCROLL_SPEED_KEY = 'chordplayer-auto-scroll-speed';

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
let autoScrollSpeed = Number(localStorage.getItem(AUTO_SCROLL_SPEED_KEY)) || 1;
let activeLineIndex = -1;
let activeHighlightFrame = null;
let activeChordPopup = null;
let activeChordShapeIndex = 0;

// ─── SECURITY: ESCAPE HTML ────────────────────────────────────
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── CHORD REGEX (SHARED SOURCE) ───────────────────────────────
// Sebelumnya regex quality memakai daftar alternatif statis
// (mis. "m7", "sus4", "maj9" sebagai pilihan terpisah). Itu gagal
// total untuk kombinasi seperti "Cm7sus4" karena tidak ada satu
// alternatif pun yang cocok dengan seluruh string, dan regex
// engine tidak bisa "menggabungkan" dua alternatif.
//
// Sekarang quality dibangun dari potongan-potongan yang boleh
// berulang: maj/min/dim/aug/sus/add/m + angka ekstensi tertentu.
// "Cm7sus4" akan cocok sebagai: root "C" + "m" + "7" + "sus" + "4".
//
// Angka ekstensi sengaja dibatasi (bukan \d+ bebas) supaya teks
// lain seperti "G20" atau "F1" tidak salah dianggap chord.
const CHORD_QUALITY_SOURCE = '(?:maj|min|dim|aug|sus|add|m|2|4|5|6|7|9|11|13)*';
const CHORD_PATTERN_SOURCE =
  '([A-G](?:#|b)?)(' + CHORD_QUALITY_SOURCE + ')(?:/([A-G](?:#|b)?))?(?![#bA-Za-z0-9])';

// Dipakai untuk highlight/wrap token chord di lirik.
const chordTokenPattern = new RegExp('\\b' + CHORD_PATTERN_SOURCE, 'g');

const guitarChordShapes = {
  C: { frets: ['x', 3, 2, 0, 1, 0], fingers: ['x', 3, 2, 'o', 1, 'o'], baseFret: 1 },
  C7: { frets: ['x', 3, 2, 3, 1, 0], fingers: ['x', 3, 2, 4, 1, 'o'], baseFret: 1 },
  Cmaj7: { frets: ['x', 3, 2, 0, 0, 0], fingers: ['x', 3, 2, 'o', 'o', 'o'], baseFret: 1 },
  Cadd9: { frets: ['x', 3, 2, 0, 3, 3], fingers: ['x', 2, 1, 'o', 3, 4], baseFret: 1 },
  D: { frets: ['x', 'x', 0, 2, 3, 2], fingers: ['x', 'x', 'o', 1, 3, 2], baseFret: 1 },
  Dm: { frets: ['x', 'x', 0, 2, 3, 1], fingers: ['x', 'x', 'o', 2, 3, 1], baseFret: 1 },
  D7: { frets: ['x', 'x', 0, 2, 1, 2], fingers: ['x', 'x', 'o', 2, 1, 3], baseFret: 1 },
  Dsus2: { frets: ['x', 'x', 0, 2, 3, 0], fingers: ['x', 'x', 'o', 1, 3, 'o'], baseFret: 1 },
  Dsus4: { frets: ['x', 'x', 0, 2, 3, 3], fingers: ['x', 'x', 'o', 1, 3, 4], baseFret: 1 },
  E: { frets: [0, 2, 2, 1, 0, 0], fingers: ['o', 2, 3, 1, 'o', 'o'], baseFret: 1 },
  Em: { frets: [0, 2, 2, 0, 0, 0], fingers: ['o', 2, 3, 'o', 'o', 'o'], baseFret: 1 },
  E7: { frets: [0, 2, 0, 1, 0, 0], fingers: ['o', 2, 'o', 1, 'o', 'o'], baseFret: 1 },
  Emaj7: { frets: [0, 2, 1, 1, 0, 0], fingers: ['o', 3, 1, 2, 'o', 'o'], baseFret: 1 },
  Esus4: { frets: [0, 2, 2, 2, 0, 0], fingers: ['o', 2, 3, 4, 'o', 'o'], baseFret: 1 },
  F: { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1 },
  Fmaj7: { frets: [1, 3, 3, 2, 1, 0], fingers: ['x', 3, 4, 2, 1, 'o'], baseFret: 1 },
  G: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 'o', 'o', 'o', 3], baseFret: 1 },
  G7: { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 'o', 'o', 'o', 1], baseFret: 1 },
  Gadd9: { frets: [3, 2, 0, 2, 0, 3], fingers: [2, 1, 'o', 3, 'o', 4], baseFret: 1 },
  A: { frets: ['x', 0, 2, 2, 2, 0], fingers: ['x', 'o', 1, 2, 3, 'o'], baseFret: 1 },
  A7: { frets: ['x', 0, 2, 0, 2, 0], fingers: ['x', 'o', 2, 'o', 3, 'o'], baseFret: 1 },
  Am: { frets: ['x', 0, 2, 2, 1, 0], fingers: ['x', 'o', 2, 3, 1, 'o'], baseFret: 1 },
  Am7: { frets: ['x', 0, 2, 0, 1, 0], fingers: ['x', 'o', 2, 'o', 1, 'o'], baseFret: 1 },
  Asus2: { frets: ['x', 0, 2, 2, 0, 0], fingers: ['x', 'o', 1, 2, 'o', 'o'], baseFret: 1 },
  B: { frets: ['x', 2, 4, 4, 4, 2], fingers: ['x', 1, 2, 3, 4, 1], baseFret: 2 },
  B7: { frets: ['x', 2, 1, 2, 0, 2], fingers: ['x', 2, 1, 3, 'o', 4], baseFret: 1 },
  Bm: { frets: ['x', 2, 4, 4, 3, 2], fingers: ['x', 1, 3, 4, 2, 1], baseFret: 2 },
  'C#': { frets: ['x', 4, 6, 6, 6, 4], fingers: ['x', 1, 2, 3, 4, 1], baseFret: 4 },
  'D#': { frets: ['x', 6, 8, 8, 8, 6], fingers: ['x', 1, 2, 3, 4, 1], baseFret: 6 },
  'F#': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], baseFret: 2 },
  'G#': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4 },
  'A#': { frets: ['x', 1, 3, 3, 3, 1], fingers: ['x', 1, 2, 3, 4, 1], baseFret: 1 }
};

const chordQualityAliases = {
  min: 'm',
  min7: 'm7',
  min9: 'm9'
};

function parseChordName(chordText) {
  const match = String(chordText).match(new RegExp('^' + CHORD_PATTERN_SOURCE));
  if (!match) return null;
  const normalizedRoot = flatToSharp[match[1]] || match[1];
  const quality = chordQualityAliases[match[2] || ''] || match[2] || '';
  return `${normalizedRoot}${quality}`;
}

function resolveChordShape(chordName) {
  if (!chordName) return null;
  const exactShape = guitarChordShapes[chordName];
  if (exactShape) return exactShape;

  const root = chordName.match(/^[A-G](?:#)?/)?.[0];
  if (!root) return null;
  const fallbackQuality = chordName.slice(root.length);
  const isMinorQuality = /^(?:m(?!aj)|min)/.test(fallbackQuality);
  const fallbackKey = isMinorQuality ? `${root}m` : fallbackQuality.includes('7') ? `${root}7` : root;
  return guitarChordShapes[fallbackKey] || guitarChordShapes[root] || null;
}

function getChordShapeOptions(chordText) {
  const chordName = parseChordName(chordText);
  if (!chordName) return [];

  const shape = resolveChordShape(chordName);
  return shape ? [{ name: chordName, shape }] : [];
}

function renderPopupShape(option) {
  const container = document.getElementById('chordPopupDiagram');
  const title = document.getElementById('chordPopupTitle');
  const count = document.getElementById('chordPopupCount');
  const capoEl = document.getElementById('chordPopupCapo');
  if (!container || !title || !count || !option) return;

  title.textContent = option.name;
  count.textContent = `${activeChordShapeIndex + 1} dari ${getChordShapeOptions(activeChordPopup?.textContent || '').length || 1}`;
  if (capoEl) {
    const capoInfo = getCapoRecommendation(transposeValue);
    capoEl.textContent = capoInfo.fret;
  }
  container.innerHTML = createGuitarDiagramSvg(option.name, option.shape, 'popup');
}

function createGuitarDiagramSvg(chordName, shape, variant = 'default') {
  const width = 240;
  const height = 195;
  const left = 32;
  const top = 32;
  const stringGap = 35;
  const fretGap = 24;
  const fretCount = 5;
  const baseFret = shape.baseFret || 1;
  const right = left + stringGap * 5;
  const bottom = top + fretGap * fretCount;

  // 6 Garis Senar Vertikal
  const strings = Array.from({ length: 6 }, (_, index) => {
    const x = left + stringGap * index;
    return `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" class="diagram-string" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.6"/>`;
  }).join('');

  // 5 Fret Horizontal
  const frets = Array.from({ length: fretCount + 1 }, (_, index) => {
    const y = top + fretGap * index;
    return `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" class="diagram-fret" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.4"/>`;
  }).join('');

  // Open (○) / Muted (×) & Fret Finger Markers
  const markers = shape.frets.map((value, stringIndex) => {
    const x = left + stringGap * stringIndex;
    if (value === 'x') {
      return `<text x="${x}" y="20" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text-muted, #6B7280)" class="diagram-muted">×</text>`;
    }
    if (value === 0) {
      return `<circle cx="${x}" cy="15" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" class="diagram-open"/>`;
    }
    const fret = Number(value);
    const relativeFret = fret - baseFret + 1;
    if (relativeFret < 1 || relativeFret > fretCount) return '';
    const y = top + fretGap * (relativeFret - 0.5);
    const fingerVal = (shape.fingers && shape.fingers[stringIndex] !== undefined)
      ? shape.fingers[stringIndex]
      : fret;
    const displayLabel = (typeof fingerVal === 'number' || (!isNaN(Number(fingerVal)) && fingerVal !== 'x' && fingerVal !== 'o'))
      ? fingerVal
      : fret;

    return `
      <circle cx="${x}" cy="${y}" r="9" fill="var(--accent-color, #22C55E)" class="diagram-dot"/>
      <text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffffff" class="diagram-dot-label">${displayLabel}</text>
    `;
  }).join('');

  // Label Senar di Bawah: E A D G B e
  const labels = ['E', 'A', 'D', 'G', 'B', 'e'].map((label, index) =>
    `<text x="${left + stringGap * index}" y="${bottom + 18}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-secondary, #374151)" class="diagram-string-label">${label}</text>`
  ).join('');

  // Nut atau Label Base Fret
  const topMarker = baseFret === 1
    ? `<line x1="${left}" y1="${top}" x2="${right}" y2="${top}" class="diagram-nut" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>`
    : `<line x1="${left}" y1="${top}" x2="${right}" y2="${top}" class="diagram-nut" stroke="currentColor" stroke-width="2"/><text x="12" y="${top + 16}" font-size="11" font-weight="700" fill="var(--accent-color, #22C55E)" class="diagram-position">${baseFret}fr</text>`;

  return `<svg class="guitar-diagram-svg ${variant === 'popup' ? 'guitar-diagram-popup-svg' : ''}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Diagram chord ${escapeHTML(chordName)}">
    ${topMarker}${strings}${frets}${markers}${labels}
  </svg>`;
}

function openChordPopup(token) {
  const popup = document.getElementById('chordPopup');
  if (!popup || !token) return;

  const options = getChordShapeOptions(token.textContent);
  if (!options.length) {
    showToast(`Diagram untuk ${token.textContent} belum tersedia`, 'default');
    return;
  }

  if (activeChordPopup && activeChordPopup !== token) {
    activeChordPopup.setAttribute('aria-expanded', 'false');
  }
  activeChordPopup = token;
  activeChordShapeIndex = 0;
  token.setAttribute('aria-expanded', 'true');
  popup.setAttribute('aria-hidden', 'false');
  popup.classList.add('is-open');
  renderPopupShape(options[activeChordShapeIndex]);
  positionChordPopup(token, popup);
}

function closeChordPopup() {
  const popup = document.getElementById('chordPopup');
  if (!popup) return;
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
  activeChordPopup?.setAttribute('aria-expanded', 'false');
  activeChordPopup = null;
  activeChordShapeIndex = 0;
}

function positionChordPopup(token, popup) {
  const rect = token.getBoundingClientRect();
  const popupWidth = 300;
  const popupHeight = 320;
  const margin = 16;
  const scrollY = window.scrollY;

  // Horizontal: coba tengahkan di bawah token
  let left = rect.left + rect.width / 2 - popupWidth / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - popupWidth - margin));

  // Vertical: utamakan di bawah token, kalau tidak muat taruh di atas
  let top = rect.bottom + scrollY + 10;
  const bottomEdge = rect.bottom + popupHeight + 10;
  if (bottomEdge > window.innerHeight) {
    top = rect.top + scrollY - popupHeight - 10;
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${Math.max(scrollY + margin, top)}px`;
}

function showPreviousChordShape() {
  const options = getChordShapeOptions(activeChordPopup?.textContent || '');
  if (!options.length) return;
  activeChordShapeIndex = (activeChordShapeIndex - 1 + options.length) % options.length;
  renderPopupShape(options[activeChordShapeIndex]);
}

function showNextChordShape() {
  const options = getChordShapeOptions(activeChordPopup?.textContent || '');
  if (!options.length) return;
  activeChordShapeIndex = (activeChordShapeIndex + 1) % options.length;
  renderPopupShape(options[activeChordShapeIndex]);
}

function setupChordPopup() {
  const lyrics = document.getElementById('lyricsArea');
  const popup = document.getElementById('chordPopup');
  const close = document.getElementById('closeChordPopup');
  const previous = document.getElementById('previousChordShape');
  const next = document.getElementById('nextChordShape');
  if (!lyrics || !popup) return;

  lyrics.addEventListener('pointerover', event => {
    const token = event.target.closest('.chord-token');
    if (token && event.pointerType === 'mouse') openChordPopup(token);
  });
  lyrics.addEventListener('pointerdown', event => {
    const token = event.target.closest('.chord-token');
    if (token && event.pointerType === 'touch') openChordPopup(token);
  });
  lyrics.addEventListener('focusin', event => {
    const token = event.target.closest('.chord-token');
    if (token) openChordPopup(token);
  });
  close?.addEventListener('click', closeChordPopup);
  previous?.addEventListener('click', showPreviousChordShape);
  next?.addEventListener('click', showNextChordShape);
  document.addEventListener('click', event => {
    if (activeChordPopup && !popup.contains(event.target) && !event.target.closest('.chord-token')) {
      closeChordPopup();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeChordPopup();
  });
  window.addEventListener('resize', () => {
    if (activeChordPopup) positionChordPopup(activeChordPopup, popup);
  });
}

function renderLyrics(text) {
  return String(text).split("\n").map((line, lineIndex) => {
    const trimmed = line.trim();
    if (/^\[.+\]$/.test(trimmed)) {
      return `<div class="lyrics-line section-marker-line" data-line-index="${lineIndex}"><span class="section-marker">${escapeHTML(trimmed)}</span></div>`;
    }
    const safeLine = escapeHTML(line);
    const renderedLine = safeLine.replace(chordTokenPattern, '<button type="button" class="chord-token" data-line-index="' + lineIndex + '" aria-expanded="false">$&</button>');
    return `<div class="lyrics-line" data-line-index="${lineIndex}">${renderedLine || '&nbsp;'}</div>`;
  }).join('');
}

function updateActiveChord() {
  const lyrics = document.getElementById('lyricsArea');
  if (!lyrics) return;

  const lines = Array.from(lyrics.querySelectorAll('.lyrics-line'));
  if (!lines.length) return;

  // Anchor: 30% dari atas viewport
  const anchor = window.innerHeight * 0.30;
  let closestLine = null;
  let closestDistance = Infinity;

  lines.forEach(line => {
    // Hanya pertimbangkan baris yang punya chord token
    const tokens = line.querySelectorAll('.chord-token');
    if (!tokens.length) return;

    const rect = line.getBoundingClientRect();
    // Ukur dari tengah baris ke anchor
    const midpoint = rect.top + rect.height / 2;
    // Prioritaskan baris yang sudah melewati anchor (lebih natural saat scroll)
    const distance = midpoint <= anchor
      ? anchor - midpoint
      : (midpoint - anchor) * 1.5;

    if (distance < closestDistance) {
      closestDistance = distance;
      closestLine = line;
    }
  });

  // Hanya update DOM jika baris aktif berubah
  const newIndex = closestLine ? Number(closestLine.dataset.lineIndex) : -1;
  if (newIndex === activeLineIndex) return;

  lines.forEach(line => {
    const isActive = line === closestLine;
    line.classList.toggle('active-chord-line', isActive);
    line.querySelectorAll('.chord-token').forEach(token => {
      token.classList.toggle('active-chord', isActive);
      token.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  });

  activeLineIndex = newIndex;
}

function scheduleActiveChordUpdate() {
  if (activeHighlightFrame !== null) return;
  activeHighlightFrame = requestAnimationFrame(() => {
    activeHighlightFrame = null;
    updateActiveChord();
  });
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

// ─── REKOMENDASI CAPO ───────────────────────────────────────────
function updateCapoRecommendation() {
  const description = document.getElementById('capoDescription');
  const badge = document.getElementById('capoBadge');
  const title = document.getElementById('capoTitle');
  const icon = document.querySelector('.capo-icon');
  if (!description || !badge || !title) return;

  // Animasi badge saat nilai berubah
  badge.style.transform = 'scale(0.85)';
  badge.style.opacity = '0.5';
  setTimeout(() => {
    badge.style.transform = 'scale(1)';
    badge.style.opacity = '1';
  }, 150);

  if (transposeValue === 0) {
    if (icon) icon.textContent = '♩';
    title.textContent = 'Tanpa capo';
    description.textContent = 'Mainkan chord seperti yang tertulis.';
    badge.textContent = 'Capo 0';
    return;
  }

  if (transposeValue < 0) {
    if (icon) icon.textContent = '↓';
    title.textContent = 'Nada diturunkan';
    description.textContent = `Transpose −${Math.abs(transposeValue)} semitone. Capo tidak bisa menurunkan nada — mainkan tanpa capo.`;
    badge.textContent = 'Tanpa Capo';
    return;
  }

  const fret = Math.min(transposeValue, 7);
  if (icon) icon.textContent = '⬆';
  title.textContent = `Pasang capo di fret ${fret}`;
  description.textContent = `Gunakan bentuk chord ${fret} semitone lebih rendah dari yang tampil.`;
  badge.textContent = `Capo ${fret}`;
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
    allSongs = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
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

// ─── FAVORITES MANAGEMENT (Local Storage) ────────────────────
const FAVORITES_STORAGE_KEY = 'chordplayer_favorites';

function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function isFavorite(songId) {
  const favs = getFavorites();
  return favs.some(item => String(item.id || item) === String(songId));
}

function toggleFavorite(songId, songTitle = '', songArtist = '') {
  try {
    let favs = getFavorites();
    const idStr = String(songId);
    const existingIndex = favs.findIndex(item => String(item.id || item) === idStr);

    let isAdded = false;
    if (existingIndex >= 0) {
      favs.splice(existingIndex, 1);
      isAdded = false;
    } else {
      favs.push({
        id: songId,
        title: songTitle,
        artist: songArtist,
        savedAt: new Date().toISOString()
      });
      isAdded = true;
    }

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
    showToast(isAdded ? 'Ditambahkan ke Favorit ❤️' : 'Dihapus dari Favorit', isAdded ? 'success' : 'default');

    // Update UI card jika ada di halaman
    document.querySelectorAll(`.btn-favorite-card[data-song-id="${idStr}"]`).forEach(btn => {
      btn.classList.toggle('is-favorite', isAdded);
      btn.setAttribute('aria-pressed', String(isAdded));
    });

    // Update UI detail page jika ada
    const detailFavBtn = document.getElementById('btnToggleFavoriteDetail');
    if (detailFavBtn) {
      detailFavBtn.classList.toggle('is-favorite', isAdded);
      detailFavBtn.setAttribute('aria-pressed', String(isAdded));
    }

    // Jika sedang di filter favorit, re-render list
    if (searchFilter === 'favorite') {
      handleSearch();
    }

    return isAdded;
  } catch (err) {
    console.error('Error toggle favorite:', err);
    return false;
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
    if (searchFilter === 'favorite') {
      songListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🤍</div>
          <p>Belum ada lagu favorit yang disimpan.</p>
          <span class="empty-hint">Klik ikon hati pada lagu untuk menyimpannya di sini.</span>
        </div>
      `;
    } else {
      songListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>Lagu yang kamu cari tidak ditemukan.</p>
          <span class="empty-hint">Coba kata kunci lain</span>
        </div>
      `;
    }
    return;
  }
  songListContainer.innerHTML = songArray.map(song => {
    const fav = isFavorite(song.id);
    return `
      <div class="song-card-wrapper" style="position: relative;">
        <a href="detail.html?id=${encodeURIComponent(song.id)}" class="song-card">
          <div class="song-info">
            <div class="title">${escapeHTML(song.title)}</div>
            <div class="artist">${escapeHTML(song.artist)}</div>
          </div>
          <span class="arrow">→</span>
        </a>
        <button type="button" class="btn-favorite-card ${fav ? 'is-favorite' : ''}" 
          data-song-id="${escapeHTML(String(song.id))}" 
          data-song-title="${escapeHTML(song.title)}" 
          data-song-artist="${escapeHTML(song.artist)}"
          aria-label="${fav ? 'Hapus dari favorit' : 'Tambah ke favorit'}"
          aria-pressed="${fav}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
    `;
  }).join('');

  // Pasang listener pada tombol favorite di card
  songListContainer.querySelectorAll('.btn-favorite-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const songId = btn.dataset.songId;
      const songTitle = btn.dataset.songTitle;
      const songArtist = btn.dataset.songArtist;
      toggleFavorite(songId, songTitle, songArtist);
    });
  });
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

  let baseList = allSongs;
  if (searchFilter === 'favorite') {
    baseList = allSongs.filter(song => isFavorite(song.id));
  }

  const result = baseList.filter(song => {
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

  handleSearch();
}

// ─── FILTER CHIPS (Semua/Judul/Artis/Favorit) ───────────────────
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

  // Log diagnostik — bantu kita lihat apakah fungsi ini benar-benar jalan
  if (DEBUG_LOGGING) {
    console.log('[loadSongDetail] dipanggil. Elemen ditemukan:', {
      title: Boolean(title),
      artist: Boolean(artist),
      lyrics: Boolean(lyrics)
    });
  }

  if (!title || !artist || !lyrics) {
    console.warn('[loadSongDetail] Berhenti: elemen DOM tidak ditemukan (bukan halaman detail?)');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (DEBUG_LOGGING) console.log('[loadSongDetail] id dari URL:', id);

  if (!id) {
    title.textContent = "-";
    artist.textContent = "-";
    lyrics.textContent = "Pilih lagu dari halaman utama.";
    return;
  }

  // Timeout pengaman — kalau fetch macet lebih dari 10 detik,
  // paksa berhenti dan tampilkan pesan error, jangan biarkan stuck selamanya
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    lyrics.innerHTML = renderLyricsSkeleton();

    // Endpoint detail menggunakan query parameter: /api/song-detail?id=...
    const fetchUrl = `/api/song-detail?id=${encodeURIComponent(id)}`;
    if (DEBUG_LOGGING) console.log('[loadSongDetail] Fetching:', fetchUrl);

    const response = await fetch(fetchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (DEBUG_LOGGING) console.log('[loadSongDetail] Response status:', response.status);

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
    if (DEBUG_LOGGING) console.log('[loadSongDetail] Data diterima:', result);

    const song = (result && result.data) ? result.data : result;

    if (!song || (!song.title && !song.chord)) {
      throw new Error('Response tidak berisi data lagu yang valid');
    }

    title.textContent = song.title;
    artist.textContent = song.artist;

    // Inisialisasi tombol favorite di detail page
    const detailFavBtn = document.getElementById('btnToggleFavoriteDetail');
    if (detailFavBtn) {
      const fav = isFavorite(song.id);
      detailFavBtn.classList.toggle('is-favorite', fav);
      detailFavBtn.setAttribute('aria-pressed', String(fav));
      detailFavBtn.onclick = () => {
        toggleFavorite(song.id, song.title, song.artist);
      };
    }

    currentChord = song.chord;
    transposeValue = 0;
    closeChordPopup();
    lyrics.innerHTML = renderLyrics(currentChord);
    scheduleActiveChordUpdate();

    updateTransposeDisplay();
    updateCapoRecommendation();
    restoreScrollPosition(id);

    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
    const btn = document.getElementById('btnAutoScroll');
    if (btn) btn.textContent = '▶ Auto Scroll';

    if (DEBUG_LOGGING) console.log('[loadSongDetail] Selesai, lagu berhasil ditampilkan.');

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[loadSongDetail] Error:', error);

    const isTimeout = error.name === 'AbortError';
    lyrics.innerHTML = `
      <div class="error-state">
        <p>⚠️ ${isTimeout ? 'Waktu memuat lagu habis.' : 'Gagal memuat lagu.'}</p>
        <span class="empty-hint">Periksa koneksi internet kamu, lalu refresh halaman</span>
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

function transposeNote(note, step) {
  const normalizedNote = flatToSharp[note] || note;
  const index = chordList.indexOf(normalizedNote);
  if (index === -1) return note;
  const transposedIndex = (index + step) % chordList.length;
  return chordList[(transposedIndex + chordList.length) % chordList.length];
}

function transposeChord(chord, step) {
  // Regex ini sekarang berbagi sumber (CHORD_PATTERN_SOURCE) dengan
  // chordTokenPattern, jadi apa yang di-highlight dan apa yang
  // di-transpose selalu sinkron. Instance baru dibuat tiap panggilan
  // supaya lastIndex regex global tidak nyangkut antar pemanggilan.
  const chordPattern = new RegExp('\\b' + CHORD_PATTERN_SOURCE, 'g');

  return chord.replace(chordPattern, (match, root, quality = '', bass) => {
    const transposedRoot = transposeNote(root, step);
    const transposedBass = bass ? `/${transposeNote(bass, step)}` : '';
    return `${transposedRoot}${quality}${transposedBass}`;
  });
}

// ─── UPDATE TAMPILAN CHORD ─────────────────────────────────────
function updateChordDisplay() {
  const lyrics = document.getElementById("lyricsArea");
  if (!lyrics) return;

  // Fade out sebentar, ganti teks, fade in — perubahan transpose
  // terasa halus, bukan "kedip" instan
  lyrics.classList.add('text-transition');
  closeChordPopup();

  setTimeout(() => {
    lyrics.innerHTML = renderLyrics(transposeChord(currentChord, transposeValue));
    lyrics.classList.remove('text-transition');
    scheduleActiveChordUpdate();
  }, 120);
}

function transposeUp() {
  transposeValue++;
  updateChordDisplay();
  updateTransposeDisplay();
  updateCapoRecommendation();
}

function transposeDown() {
  transposeValue--;
  updateChordDisplay();
  updateTransposeDisplay();
  updateCapoRecommendation();
}

function resetTranspose() {
  if (transposeValue === 0) return;
  transposeValue = 0;
  updateChordDisplay();
  updateTransposeDisplay();
  updateCapoRecommendation();
}

// ─── AUTO SCROLL ───────────────────────────────────────────────
function startAutoScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
  }

  scrollInterval = setInterval(() => {
    window.scrollBy({ top: autoScrollSpeed, behavior: 'auto' });
  }, 100);

  const btn = document.getElementById('btnAutoScroll');
  if (btn) btn.textContent = '⏸ Stop Scroll';
}

function autoScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
    const btn = document.getElementById('btnAutoScroll');
    if (btn) btn.textContent = '▶ Auto Scroll';
    return;
  }

  startAutoScroll();
}

function updateAutoScrollSpeed(event) {
  const selectedSpeed = Number(event.target.value);
  if (!Number.isFinite(selectedSpeed) || selectedSpeed <= 0) return;

  autoScrollSpeed = selectedSpeed;
  localStorage.setItem(AUTO_SCROLL_SPEED_KEY, String(autoScrollSpeed));

  // Feedback visual singkat
  const label = event.target.closest('.scroll-speed-control');
  if (label) {
    label.style.borderColor = 'var(--green-accent)';
    setTimeout(() => {
      label.style.borderColor = '';
    }, 800);
  }

  if (scrollInterval) {
    startAutoScroll(); // Restart dengan kecepatan baru
  }
}

function initAutoScrollSpeed() {
  const select = document.getElementById('scrollSpeed');
  if (!select) return;

  const availableSpeed = Array.from(select.options).some(
    option => Number(option.value) === autoScrollSpeed
  );
  if (!availableSpeed) autoScrollSpeed = 1;
  select.value = String(autoScrollSpeed);
  select.addEventListener('change', updateAutoScrollSpeed);
}

// ─── COPY CHORD ────────────────────────────────────────────────
async function copyChord() {
  const btn = document.getElementById('btnCopyChord');
  const lyrics = document.getElementById('lyricsArea');
  if (!lyrics || !btn) return;

  const textToCopy = transposeChord(currentChord, transposeValue);

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

// ─── FULLSCREEN MODE ────────────────────────────────────────────
function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement;
}

function updateFullscreenUI() {
  const btn = document.getElementById('btnFullscreen');
  const isFullscreen = Boolean(getFullscreenElement());
  document.body.classList.toggle('is-fullscreen', isFullscreen);

  if (!btn) return;
  btn.setAttribute('aria-pressed', String(isFullscreen));
  btn.textContent = isFullscreen ? '⛶ Keluar Fullscreen' : '⛶ Fullscreen';
  btn.setAttribute('aria-label', isFullscreen ? 'Keluar dari mode fullscreen' : 'Masuk ke mode fullscreen');
}

async function toggleFullscreen() {
  const fullscreenElement = getFullscreenElement();

  // Tambahkan kelas transisi sementara
  document.body.classList.add('fullscreen-transition');
  setTimeout(() => document.body.classList.remove('fullscreen-transition'), 300);

  try {
    if (fullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }

    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else {
      // Fallback: CSS fullscreen saja tanpa browser API
      document.body.classList.toggle('is-fullscreen');
      updateFullscreenUI();
      showToast(
        document.body.classList.contains('is-fullscreen')
          ? 'Mode fokus aktif'
          : 'Mode fokus dinonaktifkan',
        'default'
      );
    }
  } catch (error) {
    console.error('Gagal mengubah mode fullscreen:', error);
    showToast('Fullscreen tidak dapat diaktifkan di browser ini', 'error');
  }
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
  const btnReset = document.getElementById('btnResetTranspose');
  const btnScroll = document.getElementById('btnAutoScroll');
  const btnCopy = document.getElementById('btnCopyChord');
  const btnShare = document.getElementById('btnShareSong');
  const btnPrint = document.getElementById('btnPrintChord');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnBack = document.getElementById('btnBack');

  if (btnUp) {
    btnUp.addEventListener('click', transposeUp);
  }

  if (btnDown) {
    btnDown.addEventListener('click', transposeDown);
  }

  if (btnReset) {
    btnReset.addEventListener('click', resetTranspose);
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

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleFullscreen);
  }

  if (btnBack) {
      btnBack.addEventListener('click', handleBackClick);
    }

  setupMoreActionsMenu(); // ✅ tambahan baru
}

// ─── MENU AKSI SEKUNDER (dropdown "Lainnya") ─────────────────
function setupMoreActionsMenu() {
  const btn = document.getElementById('btnMoreActions');
  const menu = document.getElementById('moreActionsMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Tutup menu kalau klik di luar
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && event.target !== btn) {
      menu.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Tutup menu dengan Esc
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      menu.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ─── METRONOME ENGINE (Web Audio API) ─────────────────────────
let metroAudioCtx = null;
let metroBpm = 100;
let metroTimeSignature = 4;
let metroIsPlaying = false;
let metroCurrentBeat = 0;
let metroTimerId = null;
let tapTimestamps = [];

const TEMPO_NAMES = [
  { maxBpm: 60, name: 'Largo (Sangat Lambat)' },
  { maxBpm: 76, name: 'Adagio (Lambat & Tenang)' },
  { maxBpm: 108, name: 'Andante (Santai / Sedang)' },
  { maxBpm: 120, name: 'Moderato (Sedang)' },
  { maxBpm: 168, name: 'Allegro (Cepat & Ceria)' },
  { maxBpm: 200, name: 'Presto (Sangat Cepat)' },
  { maxBpm: 240, name: 'Prestissimo (Maksimal)' }
];

function getTempoName(bpm) {
  const match = TEMPO_NAMES.find(t => bpm <= t.maxBpm);
  return match ? match.name : 'Allegro';
}

function getAudioContext() {
  if (!metroAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      metroAudioCtx = new AudioContextClass();
    }
  }
  if (metroAudioCtx && metroAudioCtx.state === 'suspended') {
    metroAudioCtx.resume();
  }
  return metroAudioCtx;
}

function playSynthesizedClick(isAccent = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Pitch tinggi untuk ketukan 1 (accent), pitch standar untuk ketukan lainnya
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isAccent ? 880 : 440, ctx.currentTime);

  gain.gain.setValueAtTime(isAccent ? 0.9 : 0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isAccent ? 0.08 : 0.05));

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + (isAccent ? 0.08 : 0.05));
}

function updateVisualBeatDots(activeBeat) {
  const dots = document.querySelectorAll('.beat-dot');
  dots.forEach((dot, index) => {
    dot.classList.remove('flash-accent', 'flash-normal');
    if (index + 1 === activeBeat) {
      dot.classList.add(activeBeat === 1 ? 'flash-accent' : 'flash-normal');
    }
  });
}

function rebuildVisualizerDots(timeSig) {
  const visualizer = document.getElementById('metroVisualizer');
  if (!visualizer) return;
  visualizer.innerHTML = Array.from({ length: timeSig }, (_, i) => `
    <span class="beat-dot ${i === 0 ? 'active' : ''}" data-beat="${i + 1}">${i + 1}</span>
  `).join('');
}

function tickMetronome() {
  metroCurrentBeat = (metroCurrentBeat % metroTimeSignature) + 1;
  const isAccent = metroCurrentBeat === 1;

  playSynthesizedClick(isAccent);
  updateVisualBeatDots(metroCurrentBeat);
}

function startMetronome() {
  if (metroIsPlaying) return;
  getAudioContext();
  metroIsPlaying = true;
  metroCurrentBeat = 0;

  const intervalMs = (60 / metroBpm) * 1000;
  tickMetronome();
  metroTimerId = setInterval(tickMetronome, intervalMs);

  updateMetronomeUI();
}

function stopMetronome() {
  if (!metroIsPlaying) return;
  metroIsPlaying = false;
  if (metroTimerId) {
    clearInterval(metroTimerId);
    metroTimerId = null;
  }
  const dots = document.querySelectorAll('.beat-dot');
  dots.forEach(dot => dot.classList.remove('flash-accent', 'flash-normal'));
  updateMetronomeUI();
}

function toggleMetronome() {
  if (metroIsPlaying) {
    stopMetronome();
  } else {
    startMetronome();
  }
}

function setMetroBpm(newBpm) {
  metroBpm = Math.max(40, Math.min(240, Math.round(newBpm)));
  const bpmVal = document.getElementById('metroBpmVal');
  const slider = document.getElementById('metroBpmSlider');
  const tempoName = document.getElementById('metroTempoName');

  if (bpmVal) bpmVal.textContent = metroBpm;
  if (slider) slider.value = metroBpm;
  if (tempoName) tempoName.textContent = getTempoName(metroBpm);

  if (metroIsPlaying) {
    stopMetronome();
    startMetronome();
  }
}

function updateMetronomeUI() {
  const playBtn = document.getElementById('btnToggleMetronome');
  const playText = document.getElementById('metroPlayText');
  const playIcon = document.getElementById('metroPlayIcon');

  if (!playBtn) return;

  if (metroIsPlaying) {
    playBtn.classList.add('is-playing');
    if (playText) playText.textContent = 'Berhenti';
    if (playIcon) {
      playIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
    }
  } else {
    playBtn.classList.remove('is-playing');
    if (playText) playText.textContent = 'Mulai';
    if (playIcon) {
      playIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    }
  }
}

function handleTapTempo() {
  const now = Date.now();
  // Reset jika tap terakhir lebih dari 2 detik yang lalu
  if (tapTimestamps.length > 0 && now - tapTimestamps[tapTimestamps.length - 1] > 2000) {
    tapTimestamps = [];
  }

  tapTimestamps.push(now);
  if (tapTimestamps.length > 4) {
    tapTimestamps.shift();
  }

  if (tapTimestamps.length >= 2) {
    const intervals = [];
    for (let i = 1; i < tapTimestamps.length; i++) {
      intervals.push(tapTimestamps[i] - tapTimestamps[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const computedBpm = Math.round(60000 / avgInterval);
    setMetroBpm(computedBpm);
    showToast(`Tempo terdeteksi: ${computedBpm} BPM`, 'default');
  }
}

function openMetronomeModal() {
  const dialog = document.getElementById('metronomeDialog');
  if (!dialog) return;

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

function closeMetronomeModal() {
  const dialog = document.getElementById('metronomeDialog');
  if (!dialog) return;

  stopMetronome();
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function setupMetronomeHandlers() {
  const dialog = document.getElementById('metronomeDialog');
  const btnClose = document.getElementById('btnCloseMetronome');
  const btnToggle = document.getElementById('btnToggleMetronome');
  const slider = document.getElementById('metroBpmSlider');
  const btnPlus = document.getElementById('btnBpmPlus');
  const btnMinus = document.getElementById('btnBpmMinus');
  const timeSigSelect = document.getElementById('metroTimeSig');
  const btnTap = document.getElementById('btnTapTempo');

  if (slider) {
    slider.addEventListener('input', (e) => setMetroBpm(Number(e.target.value)));
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', () => setMetroBpm(metroBpm + 1));
  }

  if (btnMinus) {
    btnMinus.addEventListener('click', () => setMetroBpm(metroBpm - 1));
  }

  if (btnToggle) {
    btnToggle.addEventListener('click', toggleMetronome);
  }

  if (btnClose) {
    btnClose.addEventListener('click', closeMetronomeModal);
  }

  if (timeSigSelect) {
    timeSigSelect.addEventListener('change', (e) => {
      metroTimeSignature = Number(e.target.value);
      rebuildVisualizerDots(metroTimeSignature);
      if (metroIsPlaying) {
        stopMetronome();
        startMetronome();
      }
    });
  }

  if (btnTap) {
    btnTap.addEventListener('click', handleTapTempo);
  }

  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        closeMetronomeModal();
      }
    });
    dialog.addEventListener('cancel', () => {
      stopMetronome();
    });
  }

  // Hook up external triggers to open metronome
  document.querySelectorAll('#btnOpenMetronomeTop, #btnOpenMetronome, #bnavMetronome').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openMetronomeModal();
    });
  });

  // Hook up bottom navigation Favorite button
  const bnavFav = document.getElementById('bnavFavorites');
  if (bnavFav && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
    bnavFav.addEventListener('click', (e) => {
      e.preventDefault();
      const chipFav = document.getElementById('chipFavorite');
      if (chipFav) {
        chipFav.click();
        const section = document.getElementById('daftar-lagu');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }
    });
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

  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleSearch();
    });
  }

  const btnClearSearch = document.getElementById('btnClearSearch');
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', clearSearch);
  }

  setupFilterChips();
  initAutoScrollSpeed();

  loadSongs();
  loadSongDetail();
  setupDetailControls();
  setupChordPopup();
  setupMetronomeHandlers();

  // Handle URL param ?filter=favorite
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('filter') === 'favorite') {
    const chipFav = document.getElementById('chipFavorite');
    if (chipFav) {
      setTimeout(() => chipFav.click(), 100);
    }
  }

  document.addEventListener('fullscreenchange', updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
  updateFullscreenUI();

  // Setup penyimpanan posisi scroll (hanya relevan di halaman detail)
  const params = new URLSearchParams(window.location.search);
  const currentSongId = params.get('id');
  if (currentSongId) {
    window.addEventListener('scroll', () => {
      debouncedSaveScroll(currentSongId);
      scheduleActiveChordUpdate();
      if (activeChordPopup) {
        positionChordPopup(activeChordPopup, document.getElementById('chordPopup'));
      }
    }, { passive: true });
    window.addEventListener('resize', scheduleActiveChordUpdate);
  }
});