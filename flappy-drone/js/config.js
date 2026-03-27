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

// --- Far-city tile width ---
FD.FAR_TILE_W = 320;

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

// --- Far-city buildings (upgraded 2-layer format) ---
FD.farBuildings = [
  // Back layer -- tall towers
  ...Array.from({ length: 8 }, (_, i) => ({
    x: i * 40 + 5,
    h: 70 + Math.sin(i * 2.1 + 0.5) * 40 + Math.cos(i * 3.7) * 20,
    w: 16 + ((i * 5 + 2) % 4) * 3,
    layer: 'back'
  })),
  // Front layer -- shorter, denser
  ...Array.from({ length: 14 }, (_, i) => ({
    x: i * 23 + ((i * 3) % 7),
    h: 20 + Math.sin(i * 2.9 + 1.1) * 15 + Math.cos(i * 4.3) * 10,
    w: 16 + ((i * 7 + 1) % 6) * 2,
    layer: 'front'
  }))
];

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
FD.pickups      = [];
FD.deathText    = 'YOU DIED';

// --- Clouds (subtle night wisps) ---
FD.clouds = Array.from({ length: 5 }, (_, i) => ({
  x: Math.random() * 620,
  y: 50 + Math.random() * 160,
  w: 80 + Math.random() * 100,
  speed: 0.008 + Math.random() * 0.015,
  opacity: 0.015 + Math.random() * 0.02
}));
