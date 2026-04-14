/* drone-stats.js — Per-drone gameplay parameters
 *
 * Pure data table. Stats live on FD.DRONE_STATS keyed by drone id.
 * No behaviour wiring yet — read by the lab/tester for display, and
 * later by gameplay code when balancing kicks in.
 *
 * Each stat is 1–10:
 *   boost      — thrust ceiling on tap (higher = stronger flap)
 *   weight     — mass / how hard gravity pulls (higher = falls faster)
 *   sloggines  — input lag / response delay (higher = floatier feel)
 *   agility    — turn-rate / lateral responsiveness (higher = nimbler)
 *   lift       — passive hover bias (higher = stays aloft easier)
 *   drag       — air resistance (higher = decelerates faster mid-air)
 *
 * Balancing target: each drone should sum to roughly 30 across the six
 * stats so trade-offs are real (good at one thing, bad at another).
 */

(function () {
  const FD = window.FD || (window.FD = {});

  FD.DRONE_STATS = {
    // ─── Original 15 ─────────────────────────────────────────
    quad:       { boost: 5, weight: 4, sloggines: 3, agility: 7, lift: 5, drag: 4 }, // 28 — balanced default
    stealth:    { boost: 6, weight: 3, sloggines: 2, agility: 8, lift: 4, drag: 3 }, // 26 — sleek, twitchy
    heavy:      { boost: 9, weight: 9, sloggines: 7, agility: 2, lift: 3, drag: 6 }, // 36 — tank
    racer:      { boost: 8, weight: 2, sloggines: 1, agility: 9, lift: 3, drag: 2 }, // 25 — glass cannon
    osprey:     { boost: 7, weight: 6, sloggines: 5, agility: 4, lift: 7, drag: 5 }, // 34 — utility
    dragonfly:  { boost: 4, weight: 2, sloggines: 2, agility: 9, lift: 6, drag: 3 }, // 26 — flicker
    disc:       { boost: 6, weight: 5, sloggines: 6, agility: 5, lift: 8, drag: 4 }, // 34 — UFO float
    spider:     { boost: 5, weight: 6, sloggines: 4, agility: 6, lift: 4, drag: 5 }, // 30 — generalist
    jetwing:    { boost: 9, weight: 4, sloggines: 2, agility: 7, lift: 4, drag: 2 }, // 28 — afterburner
    balloon:    { boost: 2, weight: 1, sloggines: 8, agility: 2, lift: 10, drag: 7 }, // 30 — drifter
    paperplane: { boost: 3, weight: 1, sloggines: 6, agility: 5, lift: 8, drag: 4 }, // 27 — glides
    chopper:    { boost: 6, weight: 6, sloggines: 4, agility: 5, lift: 7, drag: 4 }, // 32 — workhorse
    gyro:       { boost: 4, weight: 4, sloggines: 5, agility: 6, lift: 8, drag: 4 }, // 31 — gentle
    blimp:      { boost: 1, weight: 2, sloggines: 9, agility: 1, lift: 10, drag: 8 }, // 31 — slowcoach
    tandem:     { boost: 8, weight: 8, sloggines: 6, agility: 3, lift: 5, drag: 5 }, // 35 — bruiser

    // ─── Wave 5 — silly + cool ──────────────────────────────
    pizzabox:   { boost: 1, weight: 8, sloggines: 9, agility: 1, lift: 2, drag: 9 }, // 30 — joke build, barely flies
    toaster:    { boost: 4, weight: 7, sloggines: 5, agility: 3, lift: 4, drag: 6 }, // 29 — chunky appliance
    bumblebee:  { boost: 5, weight: 3, sloggines: 2, agility: 9, lift: 7, drag: 3 }, // 29 — buzzes everywhere
    crane:      { boost: 2, weight: 1, sloggines: 4, agility: 6, lift: 9, drag: 5 }, // 27 — paper drift
    broom:      { boost: 7, weight: 4, sloggines: 3, agility: 8, lift: 6, drag: 3 }  // 31 — magic, fast turns
  };

  // Stat metadata (label, unit, hint) — used by lab UI for tooltips.
  FD.DRONE_STAT_META = {
    boost:     { label: 'Boost',     hint: 'Thrust ceiling on tap' },
    weight:    { label: 'Weight',    hint: 'How hard gravity pulls' },
    sloggines: { label: 'Sloggines', hint: 'Input lag / floatiness' },
    agility:   { label: 'Agility',   hint: 'Turn-rate / lateral response' },
    lift:      { label: 'Lift',      hint: 'Passive hover bias' },
    drag:      { label: 'Drag',      hint: 'Air resistance' }
  };

  // Pretty display names — used by lab UI for cards.
  FD.DRONE_DISPLAY_NAMES = {
    quad: 'Pixel Quad', stealth: 'Stealth', heavy: 'Heavy Lift',
    racer: 'Racer', osprey: 'Osprey', dragonfly: 'Dragonfly',
    disc: 'Disc UFO', spider: 'Spider Hex', jetwing: 'Jetwing',
    balloon: 'Balloon', paperplane: 'Paper Plane', chopper: 'Chopper',
    gyro: 'Whirlybird', blimp: 'Zephyr', tandem: 'Warhorse',
    pizzabox: 'Pizza Box', toaster: 'Toaster',
    bumblebee: 'Bumblebee', crane: 'Origami Crane', broom: 'Witch Broom'
  };
})();
