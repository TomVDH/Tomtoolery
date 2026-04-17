# Flappy Drone — Unify Design

**Date:** 2026-04-16
**Branch:** `claude/romantic-lamport`
**Scope:** Three sub-projects, shipped in sequence as three PRs.

## 0. Purpose

Bring the main game, the tester, and the labs into one aesthetic and one canonical code path for three things that have drifted apart:

1. **Nova Nuke** — the lab at `previews/33-nuke-vfx.html` source-patches the in-game `FD.drawNukeCloud` at boot to add toggles and new layers. Tester and game never receive those patches. Promote the patched behavior + new layers into `effects.js` behind `FD.NUKE_FX`; lab becomes a tuning UI.
2. **Widescreen for the main game** — tester already supports 1138×640 via `body.vp-wide`. Game is fixed at 620×640. Mirror the tester pattern in the game.
3. **Menu refresh** — the current menu uses the pre-tester visual language. Align it with `tester.css` / `previews/index.html` token set without rewriting the title signature.

## 1. Sequence

Confirmed by user on 2026-04-16: **Nuke → Widescreen → Menu**. Each sub-project ships as its own PR. Independent, no cross-dependency inside a single PR. Menu PR depends on Widescreen PR landing first (menu needs `body.vp-wide` to exist).

## 2. Shared tokens (land in PR 3, cited in all three)

All three sub-projects read from these tokens. PR 1 (Nuke) doesn't touch CSS; PR 2 (Widescreen) adds `body.vp-wide`; PR 3 (Menu) promotes these to `:root` in `css/game.css`.

```
--body        #060610   body backdrop
--panel       #0a0a16   control surface
--panel-hi    #14142a   hairline
--shell       #1a1a3a   #wrap border
--lab-line    #1f2a46   lab-card border
--cropmark    #2a4060   corner flourish

--ink         #e8ecf0   HUD white
--ink-dim     #c8d4e0   title stroke
--slogan      #99a4b0   body italic
--label       #8892a0   menu label
--arrow       #7a8494   picker arrow
--copy        #6a7585   copyright
--mute        #556      tester summary
--desc        #7988a0   lab-card desc

--cyan-1      #00d4ff   primary accent
--cyan-2      #00c8f0   drone label
--cyan-3      #00c0e8   button active
--cyan-hi     #0ee      tester active
--cyan-max    #0ff      hover
--cyan-soft   #8ac      labs link
--cyan-bg     rgba(0,200,240,0.08)

--red         #ff6b6b   BETA
--red-2       #ff4466   glitch right
--orange      #ff8844   tester badge
--green       #9e6      LIVE tag
```

Fonts: `'SF Mono','Menlo','Courier New',monospace` for all UI. `Impact,'Arial Black',system-ui,sans-serif` for the wordmark. `'Segoe UI',system-ui,-apple-system,sans-serif` for body/slogan italic. No webfonts fetched.

Motion: all transitions `cubic-bezier(0.22, 1, 0.36, 1)` at 0.2–0.7 s.

---

## 3. Sub-project 1 — Nova Nuke unification

### 3.1 What lives where today

- **Canonical NOVA MK-V timing + geometry** lives in `js/effects.js:281` (`FD.drawNukeCloud`, 14 s total, cloudT / 5800, cubic-out ease, 0.05 slowDrift).
- **Lab patches** at `previews/33-nuke-vfx.html:551` take `FD.drawNukeCloud.toString()`, run ~12 regex replaces to wrap each effect block with `&& window.FX_LIVE.<key>`, bump cap-edge density (1200 → 100 ms, 0.2 → 0.42), fix stem ejecta dead-zone (25% go straight-up), fatten particles (r 1→2 / r 8→15, sat 80→100, lum 60→75), replace core glow rod with a wobble-tracking bezier ribbon, and rebuild the function via `new Function`.
- **Lab patches `drawNukeOverlay`** to (a) gate by `FX_LIVE.whiteFlash`, (b) brighten the 0–300 ms flash to 0–650 ms peak 1.6 (clamped at 1).
- **Lab wraps `FD.drawParticles`** to honor `p._fadeInMs` + `p._bornAt` for gentle fade-in on tagged particles.
- **Lab wraps `FD.updateParticles`** to (a) tag ~12% of mid-stem streaks as camera-bound zoom particles (growing r over life, promoted to fg), (b) emit a bright end-of-life flash from ~55% of streaks as a 3-particle burst (hot white-yellow core + warm halo + pinpoint snap + spark shower).
- **Lab adds four new systems outside NOVA**:
  - `FALLOUT` — slow, sparse, paired streak+glow pairs that fall from the cap (1.8–12.5 s, r/2 → 80 cap, sizeScale 0.22, fadeCurve 0.10, fadeKey 'fadeInFalloutMs' default 2200).
  - `CAP_ARCS` — paired particles arcing off the cap edge (0.7–6.5 s, tiered velocities: 30% slow drift / 50% medium / 20% quick, fadeKey 'fadeInArcsMs' default 400).
  - `drawCapAfterglow` — lingering warm radial glow behind the cap, screen-blended, with breathing modulator.
  - `drawCapTrailingHaze` — wide soft warm fog band behind/around the rising cap (1.5–13 s, intensity ramps 1.5–5 s → flat 5–9 s → fades 9–13 s).
- **Lab adds a custom shockwave system** (`drawShockwave`) with 5 styles (`nova | harmonic | pulse | refraction | combo | off`). The `combo` default is a two-phase refraction snap (~750 ms) → soft bloom pulse (~3 s).

### 3.2 Target shape

All of the above lives in `js/effects.js`. A single `FD.NUKE_FX` config drives the toggles. The lab reads/writes `FD.NUKE_FX` directly — no more source-patching.

**New in `effects.js`:**

```js
FD.NUKE_FX = {
  // Stage
  whiteFlash: true,  godRays: false, haze: true, trailHaze: true,
  // Shockwave — mutually exclusive with novaShock
  shockStyle: 'combo',  // 'nova' | 'harmonic' | 'pulse' | 'refraction' | 'combo' | 'off'
  novaShock: false,     // auto-managed: true iff shockStyle === 'nova'
  // Stem
  midStem: true, wideStem: true, stemCore: true,
  // Cap
  capEdge: true, hotspots: true, cloudBands: true,
  // Ground
  baseFire: true, groundFires: true, baseGlow: true, baseRing: true,
  // Extra layers
  capArcs: true, afterglow: true, fallout: true,
  // Fade-in durations (ms)
  fadeInArcsMs:    400,
  fadeInFalloutMs: 2200,
};

FD.pairedSpawn    = function (arr, p) { /* lifted from lab */ };
FD.updatePaired   = function (arr)    { /* lifted */ };
FD.drawPaired     = function (arr)    { /* lifted, reads FD.NUKE_FX */ };

FD.FALLOUT  = [];  FD.CAP_ARCS = [];
FD.spawnFallout  = function () { /* gated by FD.NUKE_FX.fallout */ };
FD.spawnCapArcs  = function () { /* gated by FD.NUKE_FX.capArcs */ };
FD.drawCapAfterglow     = function () { /* gated by FD.NUKE_FX.afterglow */ };
FD.drawCapTrailingHaze  = function () { /* gated by FD.NUKE_FX.trailHaze */ };
FD.drawShockwave        = function () { /* reads FD.NUKE_FX.shockStyle */ };
```

**Modified in `effects.js`:**

- `FD.drawNukeCloud` rewritten in-file with the lab's patched values baked in. Each effect block guarded by `FD.NUKE_FX.<key>`. Stem ejecta dead-zone fix applied. Cap-edge timing bumped. Particles fattened. Bezier core ribbon replaces the fillRect rod. Cap-edge particles tagged with `_fadeInMs` + `_bornAt`.
- `FD.drawNukeOverlay` gated by `FD.NUKE_FX.whiteFlash`. Flash window 0–300 ms → 0–650 ms peak 1.6. Rise math still matches NOVA MK-V baseline (no change).
- `FD.drawParticles` honors `p._fadeInMs` + `p._bornAt` (scaling `p.life` in a save/restore around the call, lifted from lab).
- `FD.updateParticles` tags mid-stem streaks (~12% zoom-bound, 25% camera-zoom-fg), emits end-of-life flash bursts (~55%).

**Loop wire-up** — all three entry points (`game.js`, `tester.js`, every lab) stay unchanged on the caller side. They still call `FD.drawNukeCloud()` + `FD.drawNukeOverlay()`. But effects.js's own "tick" must also call the new spawners and the new draw layers each frame while `FD.nukeActive` is true. A single new helper, `FD.tickNuke()`, handles this:

```js
FD.tickNuke = function () {
  // Spawn new particles only while the nuke is active.
  if (FD.nukeActive) {
    FD.spawnFallout();
    FD.spawnCapArcs();
  }
  // Always update paired particle arrays so existing particles finish their
  // lifetime visually even after FD.nukeActive flips false (matches the lab's
  // observed behaviour — fallout/arcs decay through to alpha 0 post-nuke).
  FD.updatePaired(FD.FALLOUT);
  FD.updatePaired(FD.CAP_ARCS);
};

FD.drawNukeLayers = function () {
  if (!FD.nukeActive) return;
  FD.drawCapTrailingHaze();    // behind cap
  // drawNukeCloud called by caller
  FD.drawCapAfterglow();       // in front of cap, screen-blended
  FD.drawPaired(FD.CAP_ARCS);
  FD.drawPaired(FD.FALLOUT);
  FD.drawShockwave();          // on top, additive
};
```

Callers add `FD.tickNuke()` to their update loops and `FD.drawNukeLayers()` to their draw loops. Existing `FD.drawNukeCloud()` + `FD.drawNukeOverlay()` calls stay where they are.

### 3.3 Lab retirement of source-patching

`previews/33-nuke-vfx.html`:

- Delete the `patchOnce` IIFE (lines ~551–738).
- Delete the `patchOverlay` IIFE (lines ~744–757).
- Delete the `patchDrawParticlesFadeIn` IIFE (lines ~765–782).
- Delete the `patchStreakEndFlash` IIFE (lines ~792–863).
- Delete the lab-local `FALLOUT`, `CAP_ARCS`, `pairedSpawn`, `updatePaired`, `drawPaired`, `spawnFallout`, `spawnCapArcs`, `drawCapAfterglow`, `drawCapTrailingHaze`, `drawShockwave` definitions.
- Replace `window.FX_LIVE = { ... }` with `window.FX_LIVE = FD.NUKE_FX` (same reference). Lab UI still reads/writes `FX_LIVE.<key>`; writes land on `FD.NUKE_FX` because it's the same object.
- Lab `detonate()` clears `FD.particles`, `FD.FALLOUT`, `FD.CAP_ARCS` — stays as-is, all three now live on `FD`.
- Lab's own frame() loop adds `FD.tickNuke()` + `FD.drawNukeLayers()` calls in the right order.

### 3.4 Tester / game / city-lab wire-up

- **`js/tester.js`** — existing `frame()` already calls `FD.drawNukeCloud()` and `FD.drawNukeOverlay()`. Insert `FD.tickNuke()` before `FD.updateParticles()` and `FD.drawNukeLayers()` right before `FD.drawNukeOverlay()`. Zero other changes; tester inherits all new VFX.
- **`js/game.js`** — same pattern. Insert at the same relative spots.
- **`previews/36-city-lab.html`** — same pattern in its own frame loop.
- No `nukeActive` / `nukeStart` / `nukeGx` / `nukeGy` changes anywhere. Those remain the entry-point contract.

### 3.5 Defaults shipped (confirmed 2026-04-16)

- All layers ON by default.
- `godRays`: OFF (stylistically intentional — user left off in lab).
- `shockStyle`: `'combo'` (most recent tune). `novaShock`: false (combo replaces it).
- `capArcs`: ON, `fallout`: ON (user: "all layers ON").
- The in-game nuke will look visibly bigger/brighter next trigger. Expected and desired.

### 3.6 Acceptance

- Game nuke on 5-click easter egg: shows combo shockwave, cap arcs, fallout, afterglow, trail haze, bezier stem core, brighter 650 ms flash, end-of-life stem flashes, camera-zoom particles.
- Tester `triggerNuke()`: same visual result.
- Lab `33-nuke-vfx`: same visual result; every `FX_LIVE` toggle in the UI still flips behavior live.
- Lab `36-city-lab`: nuke scrubber still works; new layers scrub cleanly.
- No `drawPaired crash` or stale `FD.nukeStart` regressions (these were fixed in prior commits; keep the fixes).

---

## 4. Sub-project 2 — Widescreen for main game

### 4.1 Target

- Mobile: 620×640 (current).
- Widescreen: 1138×640 (matches tester).
- Default: auto by viewport (`≥ 900 px` → widescreen, narrower → mobile).
- Toggle persisted in `localStorage.flappy-vp` (same key as tester; shared state).
- Pipe physics **unchanged** — same 220 spacing / 155 gap / 56 width. More horizontal lookahead only.

### 4.2 Implementation

**`js/config.js`**:

- Replace the `W: 620` constant usage with a viewport-derived read. Add `FD.VP = { mobile: {W: 620, H: 640}, wide: {W: 1138, H: 640} }`. Add `FD.currentVp()` returning `'wide'` if `localStorage.flappy-vp === 'wide'` OR `localStorage.flappy-vp == null && window.innerWidth >= 900`, else `'mobile'`.
- On boot, set `FD.W` and `FD.H` from the chosen viewport. Set `document.body.classList.toggle('vp-wide', FD.currentVp() === 'wide')`.

**`css/game.css`**:

- Existing `#wrap { width: 620px; height: 640px; ... }` → move into `body:not(.vp-wide) #wrap`.
- Add `body.vp-wide #wrap { width: 1138px; height: 640px; }`.
- `canvas { display: block; width: 100%; height: 100%; }` stays as-is; pixel dimensions set on `<canvas>` via `width`/`height` attributes (which change on viewport swap).

**`index.html`**:

- `<canvas id="game" width="620" height="640">` → removed static width/height; set via config.js boot. (Canvas element must exist before script runs; script sets `canvas.width`/`canvas.height` from `FD.W`/`FD.H`.)
- Pre-boot inline script (like tester.html:357-361) sets body class from localStorage before main CSS loads → prevents flash of wrong size.

**`js/config.js`** (finish):

- Line 207 `x: Math.random() * 620` → `Math.random() * FD.W`.
- `FD.FAR_TILE_W = 640` is a parallax tile width, **not** a viewport dimension — leave untouched.

**`js/game.js`**:

- `grep -n "620\|640" js/game.js` returns zero hits (confirmed 2026-04-16). No changes.
- Pipe spawn x-coord already uses `FD.W`. Scroll / parallax already delta-based.

**Menu layout adapts** (lands in PR 3): wordmark + controls stay centered in mobile; split into wordmark-left + fleet-panel-right on widescreen.

### 4.3 Acceptance

- Fresh load on 1280-wide desktop: widescreen frame, 1138×640, cityscape fills the wider canvas, pipes still 220 apart.
- Fresh load on 720-wide mobile: mobile frame, 620×640.
- Toggle in menu (or via tester): swaps viewport, persists, next reload respects the choice.
- Best-score localStorage keys stay as-is; scores comparable across viewports (physics identical).

---

## 5. Sub-project 3 — Menu refresh

### 5.1 Layout (locked 2026-04-16 via `menu-stripped.html`)

**Mobile (620×640):**

- Top padding ~66 px
- Wordmark (Impact + stroke + chromatic split, kept as signature) — centered
- Slogan (italic, rotates with wordmark) — centered, ~8 px below
- Bottom padding ~48 px
- Single control row just above bottom: MODE cluster · DRONE picker · LAUNCH — centered, gap 14 px, wraps on narrow
- Bottom-right corner: LABS pill (`LABS · 5 LIVE`)

**Widescreen (1138×640):**

- 1.15 / 0.85 two-column grid, 44 px inter-column gap, 56 px side padding
- Left column: wordmark (96 px, left-aligned) + slogan + control row (left-aligned) stacked top-to-bottom
- Right column: fleet panel — Impact-stroke name (32 px), one description line, 20-cell drone grid
- Bottom bar spans both columns: LABS pill flush right

### 5.2 Markup changes (`index.html`)

Remove:

- Outer `<div class="copyright">` below `#wrap` (moves inside frame).
- Analytics script block — unchanged, stays.

Replace the contents of `<div class="screen show" id="menuScreen">` with:

```html
<div class="menuScreen__mark">
  <div class="title" id="gameTitle">FLAPPY DRONE <span class="beta">BETA</span></div>
  <div class="slogan" id="gameSlogan">...</div>
</div>

<div class="menuScreen__controls">
  <div class="mode-cluster" role="group" aria-label="Mode">
    <button class="mode-cluster__btn on" data-mode="classic">Classic</button>
    <button class="mode-cluster__btn"    data-mode="rush">Rush</button>
  </div>

  <div class="drone-picker">
    <button class="drone-picker__nav" id="droneLeft" aria-label="previous drone">
      <svg viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="drone-picker__read" id="droneLabel">PIXEL QUAD</div>
    <button class="drone-picker__nav" id="droneRight" aria-label="next drone">
      <svg viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>

  <button class="launch" id="launchBtn">
    <span>Launch</span>
    <span class="launch__kbd">SPACE</span>
    <svg viewBox="0 0 12 12" fill="none"><path d="M3 9L9 3M9 3H5M9 3V7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
</div>

<aside class="fleet-panel">          <!-- visible only on body.vp-wide -->
  <div class="fleet-panel__name" id="fleetName">PIXEL QUAD</div>
  <div class="fleet-panel__desc" id="fleetDesc">Workhorse quadcopter. ...</div>
  <div class="fleet-panel__grid" id="fleetGrid"><!-- 20 cells inserted by JS --></div>
</aside>

<div class="menuScreen__bar">
  <a class="labs-pill" href="previews/index.html">
    <span>LABS</span>
    <span class="labs-pill__count">5 LIVE</span>
  </a>
</div>
```

### 5.3 CSS changes (`css/game.css`)

- Promote the token block in §2 to `:root`.
- Replace `.screen#menuScreen { ... }` layout with Grid.
- Remove `.menu-section`, `.menu-section-label`, `.mode-picker`, `.mode-label`, `.mode-arrow`, `.mode-desc`, `.drone-picker`, `.drone-label`, `.drone-arrow`, `.prompt`.
- Add `.menuScreen__mark`, `.menuScreen__controls`, `.menuScreen__bar`, `.mode-cluster`, `.mode-cluster__btn`, `.drone-picker` (new rules), `.drone-picker__nav`, `.drone-picker__read`, `.launch`, `.launch__kbd`, `.fleet-panel`, `.fleet-panel__name`, `.fleet-panel__desc`, `.fleet-panel__grid`, `.fleet-panel__cell`, `.labs-pill`, `.labs-pill__count`.
- Keep `.title` treatment intact (Impact stroke + chromatic split), add responsive font-size via `body.vp-wide .title { font-size: 96px; letter-spacing: 7px; }`.
- `.copyright` rule deleted (was outside `#wrap`).

### 5.4 JS changes (`js/game.js`, `js/ui.js`)

- Mode picker: rewire the existing `modeLeft` / `modeRight` handlers onto the two cluster buttons (click → setMode + toggle `.on` class). Keep the existing mode state machine.
- Drone picker: rewire `droneLeft` / `droneRight` (already exist as IDs). Value flows into `#droneLabel` innerText plus the canvas-side render that already exists.
- Fleet panel grid: `ui.js` populates 20 `.fleet-panel__cell` elements on menu enter; click on a cell sets the drone, mirroring tester's fleet-picker logic.
- Viewport toggle: **no in-menu toggle in PR 3 scope.** Auto-detect by `window.innerWidth >= 900` handles 99% of cases; the tester already has a manual toggle for dev use; anyone who wants to force a viewport can set `localStorage.flappy-vp` by hand. Adding a UI toggle inside the menu is deferred — if demand appears, revisit as a follow-up.
- Easter egg: the current `triggerNukeEasterEgg` counts clicks on `.version`. The `.version` div is inside `#wrap` and stays. Keep as-is.

### 5.5 Acceptance

- Mobile: wordmark + slogan top, single control row near bottom, LABS pill bottom-right. Visual match to `menu-stripped.html` at `data-vp="mobile"`.
- Widescreen: wordmark / slogan / controls left column; fleet panel right; LABS pill bottom-right. Visual match to `menu-stripped.html` at `data-vp="wide"`.
- Title still rotates through the 6 name pool; slogan rotates through matching subset.
- MODE cluster active state `#0ee`, not a `◀ label ▶` pattern.
- LABS pill navigates to `previews/index.html`.
- Easter egg still fires on 5 clicks to `.version`.
- Rush lore dialog unchanged.

---

## 6. Cross-cutting

### 6.1 Files touched (full list)

| PR | File | Nature |
|----|------|--------|
| 1 | `js/effects.js` | rewrite `drawNukeCloud` + `drawNukeOverlay` + `drawParticles` + `updateParticles` + add `pairedSpawn`/`updatePaired`/`drawPaired`/`FALLOUT`/`CAP_ARCS`/`spawnFallout`/`spawnCapArcs`/`drawCapAfterglow`/`drawCapTrailingHaze`/`drawShockwave`/`tickNuke`/`drawNukeLayers`/`NUKE_FX` |
| 1 | `js/tester.js` | add `FD.tickNuke()` + `FD.drawNukeLayers()` to frame loop |
| 1 | `js/game.js` | add `FD.tickNuke()` + `FD.drawNukeLayers()` to frame loop |
| 1 | `previews/33-nuke-vfx.html` | delete 4 `patchOnce` IIFEs + local layer defs; point `FX_LIVE` at `FD.NUKE_FX`; add tick/draw calls |
| 1 | `previews/36-city-lab.html` | add `FD.tickNuke()` + `FD.drawNukeLayers()` to frame loop |
| 2 | `js/config.js` | add `FD.VP` + `FD.currentVp()` + boot viewport selection |
| 2 | `css/game.css` | `#wrap` sizing behind `body.vp-wide` |
| 2 | `index.html` | remove canvas static `width`/`height`; add pre-boot viewport class script |
| 2 | `js/game.js` | audit for `620` literals → `FD.W` |
| 3 | `index.html` | menu markup rewrite |
| 3 | `css/game.css` | token `:root` + menu component rules; remove legacy `.menu-section*` rules |
| 3 | `js/game.js` | mode cluster + drone picker rewire |
| 3 | `js/ui.js` | fleet panel grid populate on menu enter |
| 3 | `PRD.md` | update "Screens / Menu" description to match new layout |

### 6.2 Backwards compatibility

- localStorage keys unchanged (`flappy-vp`, `flappy-best`, etc.).
- Analytics `window.trackEvent` calls unchanged.
- GitHub Pages deployment unchanged.
- No new dependencies.
- No build step.

### 6.3 Risk

- **Nuke (PR 1)**: highest. Regex-patched source gets retired; if we miss a patch's effect, the baked-in version may drift from the lab-approved tune. Mitigation: diff the effective output (lab JS function .toString() result vs. the rewritten effects.js) before shipping, test visually against showcase-blast PNGs at the worktree root.
- **Widescreen (PR 2)**: medium. Canvas re-sizing can desync with pipe queues; audit pipe spawn math for hard-coded widths.
- **Menu (PR 3)**: low. Menu is presentation; game state untouched.

### 6.4 Rollback

- PR 1: revert effects.js; lab's `patchOnce` starts working again against the reverted source.
- PR 2: unset `localStorage.flappy-vp`, remove `body.vp-wide`; game is back to 620×640.
- PR 3: revert index.html + game.css; old menu rules restored.

---

## 7. Out of scope

- New drone designs, new VFX concepts, new game modes.
- Sound design (backlog).
- Rush lore redesign (backlog).
- Leaderboards, daily challenges, ghost drones (backlog).
- Swapping Impact for a pixel bitmap display font — considered; rejected. Impact + chromatic split is the signature. Keep.

---

## 8. Open questions

None at time of writing. Brainstorming flow captured all unknowns as AskUserQuestion answers on 2026-04-16.
