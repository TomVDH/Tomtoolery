/* config.js — Foundation module for Flappy Drone
 * Creates the FD namespace and populates all constants + shared mutable state.
 */
window.FD = {};

// --- Canvas dimensions ---
FD.W = 620;
FD.H = 640;

// --- Physics / gameplay ---
FD.GRAVITY       = 0.26;     // px/frame² downward acceleration
FD.FLAP_FORCE    = -5.4;     // px/frame upward impulse on tap
FD.PIPE_SPEED    = 2.4;      // px/frame base scroll speed (Classic)
FD.PIPE_INTERVAL = 75;       // frames between pipe spawns (Classic base, ramps to 50)
FD.GAP_SIZE      = 175;      // px vertical opening between pipes (base, shrinks per mode)
FD.PIPE_WIDTH    = 56;       // px standard pipe/building width
FD.GROUND_H      = 48;       // px ground strip height
FD.CEILING_Y     = 10;       // px top boundary for drone

// --- Death sequence timing (frames) ---
FD.DEATH_FLASH_DUR = 15;       // red flash
FD.DIED_FADE_IN    = 120;      // "YOU DIED" fades in slowly over ~2s
FD.DIED_HOLD       = 190;      // holds for ~3.2s
FD.DIED_FADE_OUT   = 60;       // fades out over ~1s
FD.DIED_TOTAL      = FD.DEATH_FLASH_DUR + FD.DIED_FADE_IN + FD.DIED_HOLD + FD.DIED_FADE_OUT;
FD.SCORE_DELAY     = 20;       // pause before score screen

// --- Ready countdown ---
FD.READY_MS = 4000; // 4 seconds, refresh-rate independent

// --- Far-city tile width (must exceed viewport width so Z-Tower appears once) ---
FD.FAR_TILE_W = 640;

// --- Pixel bitmap font (5x5 per character) ---
FD.PX = {
  A:[0b01110,0b10001,0b11111,0b10001,0b10001],
  B:[0b11110,0b10001,0b11110,0b10001,0b11110],
  C:[0b01111,0b10000,0b10000,0b10000,0b01111],
  D:[0b11110,0b10001,0b10001,0b10001,0b11110],
  E:[0b11111,0b10000,0b11110,0b10000,0b11111],
  F:[0b11111,0b10000,0b11110,0b10000,0b10000],
  G:[0b01111,0b10000,0b10011,0b10001,0b01111],
  H:[0b10001,0b10001,0b11111,0b10001,0b10001],
  I:[0b11111,0b00100,0b00100,0b00100,0b11111],
  J:[0b00111,0b00010,0b00010,0b10010,0b01100],
  K:[0b10001,0b10010,0b11100,0b10010,0b10001],
  L:[0b10000,0b10000,0b10000,0b10000,0b11111],
  M:[0b10001,0b11011,0b10101,0b10001,0b10001],
  N:[0b10001,0b11001,0b10101,0b10011,0b10001],
  O:[0b01110,0b10001,0b10001,0b10001,0b01110],
  P:[0b11110,0b10001,0b11110,0b10000,0b10000],
  Q:[0b01110,0b10001,0b10101,0b10010,0b01101],
  R:[0b11110,0b10001,0b11110,0b10010,0b10001],
  S:[0b01111,0b10000,0b01110,0b00001,0b11110],
  T:[0b11111,0b00100,0b00100,0b00100,0b00100],
  U:[0b10001,0b10001,0b10001,0b10001,0b01110],
  V:[0b10001,0b10001,0b10001,0b01010,0b00100],
  W:[0b10001,0b10001,0b10101,0b11011,0b10001],
  X:[0b10001,0b01010,0b00100,0b01010,0b10001],
  Y:[0b10001,0b01010,0b00100,0b00100,0b00100],
  Z:[0b11111,0b00010,0b00100,0b01000,0b11111],
  // lowercase
  a:[0b00000,0b01110,0b00001,0b01111,0b01111],
  b:[0b10000,0b10000,0b11110,0b10001,0b11110],
  c:[0b00000,0b01110,0b10000,0b10000,0b01110],
  d:[0b00001,0b00001,0b01111,0b10001,0b01111],
  e:[0b00000,0b01110,0b11111,0b10000,0b01110],
  f:[0b00110,0b01000,0b11100,0b01000,0b01000],
  g:[0b00000,0b01111,0b10001,0b01111,0b11110],
  h:[0b10000,0b10000,0b10110,0b11001,0b10001],
  i:[0b00100,0b00000,0b00100,0b00100,0b00100],
  k:[0b10000,0b10010,0b11100,0b10010,0b10001],
  l:[0b01100,0b00100,0b00100,0b00100,0b01110],
  m:[0b00000,0b11010,0b10101,0b10101,0b10001],
  n:[0b00000,0b10110,0b11001,0b10001,0b10001],
  o:[0b00000,0b01110,0b10001,0b10001,0b01110],
  p:[0b00000,0b11110,0b10001,0b11110,0b10000],
  r:[0b00000,0b10110,0b11000,0b10000,0b10000],
  s:[0b00000,0b01111,0b01000,0b00110,0b11110],
  t:[0b01000,0b11100,0b01000,0b01000,0b00110],
  u:[0b00000,0b10001,0b10001,0b10011,0b01101],
  v:[0b00000,0b10001,0b10001,0b01010,0b00100],
  w:[0b00000,0b10001,0b10101,0b10101,0b01010],
  x:[0b00000,0b10001,0b01010,0b01010,0b10001],
  y:[0b00000,0b10001,0b01111,0b00001,0b01110],
  z:[0b00000,0b11111,0b00010,0b01000,0b11111],
  // digits + symbols
  '0':[0b01110,0b10011,0b10101,0b11001,0b01110],
  '1':[0b00110,0b10100,0b00100,0b00100,0b11111],
  '2':[0b01110,0b10001,0b00110,0b01000,0b11111],
  '3':[0b11110,0b00001,0b01110,0b00001,0b11110],
  '4':[0b10010,0b10010,0b11111,0b00010,0b00010],
  '5':[0b11111,0b10000,0b11110,0b00001,0b11110],
  '6':[0b01110,0b10000,0b11110,0b10001,0b01110],
  '7':[0b11111,0b00001,0b00010,0b00100,0b00100],
  '8':[0b01110,0b10001,0b01110,0b10001,0b01110],
  '9':[0b01110,0b10001,0b01111,0b00001,0b01110],
  '-':[0b00000,0b00000,0b11111,0b00000,0b00000],
  '.':[0b00000,0b00000,0b00000,0b00000,0b00100],
  '!':[0b00100,0b00100,0b00100,0b00000,0b00100],
  ' ':[0b00000,0b00000,0b00000,0b00000,0b00000],
};

// --- Background stars (generated once, deterministic-ish) ---
FD.bgStars = Array.from({ length: 55 }, () => ({
  x: Math.random() * FD.W,
  y: Math.random() * (FD.H * 0.6),
  r: Math.random() * 1.1 + 0.3,
  phase: Math.random() * Math.PI * 2
}));

// --- Pseudo-random hash for window lighting (shared) ---
FD.windowHash = function (seed, c, row) {
  var h = seed * 2654435761 + c * 340573321 + Math.floor(row) * 196314165;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h);
  return (h & 0xFF) / 255;
};

// --- Far-city buildings (upgraded 2-layer format) ---
FD.farBuildings = [
  // Back layer -- dense skyline across 640px tile, one Z-tower
  ...Array.from({ length: 22 }, (_, i) => ({
    x: i * 28 + 3,
    h: i === 8 ? 155 : (45 + Math.sin(i * 2.1 + 0.5) * 35 + Math.cos(i * 3.7) * 22),
    w: 13 + ((i * 5 + 2) % 4) * 3,
    layer: 'back',
    zTower: i === 8
  })),
  // Front layer -- shorter, denser (spread across 640px tile)
  ...Array.from({ length: 28 }, (_, i) => ({
    x: i * 22 + ((i * 3) % 5),
    h: 22 + Math.sin(i * 2.9 + 1.1) * 16 + Math.cos(i * 4.3) * 12,
    w: 14 + ((i * 7 + 1) % 6) * 2,
    layer: 'front'
  }))
];

// Pre-compute windows on far buildings
FD.farBuildings.forEach(function (b, idx) {
  b.wins = [];
  // Staggered light-on time per building (0-180 ticks = ~0-3 seconds)
  b.lightOnTick = Math.floor(FD.windowHash(idx * 31, 99, 77) * 180);
  var isBack = b.layer === 'back';
  var winW = isBack ? 2 : 3;
  var winH = isBack ? 3 : 4;
  var spX = isBack ? 5 : 6;
  var spY = isBack ? 7 : 9;
  var seed = idx * 7919;
  for (var wy = 4; wy < b.h - 5; wy += spY) {
    for (var wx = 2; wx < b.w - winW; wx += spX) {
      b.wins.push({
        dx: wx, dy: wy,
        on: FD.windowHash(seed, wx, wy) > 0.42,
        die: 200 + FD.windowHash(seed + 1, wx, wy + 9) * 600,
        relight: 8500 + FD.windowHash(seed + 2, wx, wy + 17) * 2000, // staggered re-light 8.5-10.5s
        w: winW, h: winH
      });
    }
  }
});

// --- Shared mutable state ---
FD.globalTick   = 0;
FD.particles    = [];
FD.fireworks    = [];       // { x, y, vy, hue, fuse, exploded }
FD.fwTimer      = 0;        // frames until next firework
FD.screenShake  = 0;
FD.flashAlpha   = 0;
FD.nukeActive   = false;
FD.nukeStart    = 0;
FD.nukeGx       = FD.W / 2;
FD.nukeGy       = FD.H - FD.GROUND_H;
FD.nukeDustTriggered = false;
FD.pickups      = [];
FD.deathText    = 'YOU DIED';

// --- Mountain range silhouettes (behind back parallax row) ---
// Gentle rolling slopes, wide peaks, very subtle
FD.mountains = [
  { // Far range — jagged ridgeline with peaks and valleys
    color: '#070711', speedMult: 0.15, baseY: 0.73,
    points: Array.from({ length: 80 }, (_, i) => {
      var x = i / 79;
      return Math.sin(x * 2.4 + 0.8) * 0.022
           + Math.sin(x * 5.5 + 1.5) * 0.016
           + Math.sin(x * 11.0 + 3.0) * 0.009
           + Math.sin(x * 17.0 + 0.3) * 0.005
           + Math.cos(x * 8.3 + 2.7) * 0.012;
    })
  },
  { // Mid range — different rhythm, overlapping peaks
    color: '#080813', speedMult: 0.25, baseY: 0.755,
    points: Array.from({ length: 80 }, (_, i) => {
      var x = i / 79;
      return Math.sin(x * 3.1 + 2.3) * 0.018
           + Math.sin(x * 6.8 + 0.5) * 0.013
           + Math.sin(x * 13.5 + 4.1) * 0.008
           + Math.sin(x * 20.0 + 1.9) * 0.004
           + Math.cos(x * 9.7 + 3.4) * 0.01;
    })
  }
];

// --- Clouds (subtle night wisps) ---
FD.clouds = Array.from({ length: 5 }, (_, i) => ({
  x: Math.random() * 620,
  y: 50 + Math.random() * 160,
  w: 80 + Math.random() * 100,
  speed: 0.008 + Math.random() * 0.015,
  opacity: 0.015 + Math.random() * 0.02
}));

// --- Aurora curtains (ambient sky effect) ---
FD.auroraCurtains = [
  { baseY: 40,  amplitude: 20, freq: 1.8, speed: 0.9, hue: 140, phase: 0.0, thickness: 22 },
  { baseY: 82,  amplitude: 30, freq: 2.1, speed: 1.2, hue: 160, phase: 1.5, thickness: 28 },
  { baseY: 124, amplitude: 18, freq: 2.5, speed: 1.0, hue: 280, phase: 3.1, thickness: 20 },
  { baseY: 166, amplitude: 25, freq: 1.7, speed: 1.4, hue: 120, phase: 4.7, thickness: 25 }
];
FD.auroraIntensity = 0;
FD.auroraTargetIntensity = 0;
