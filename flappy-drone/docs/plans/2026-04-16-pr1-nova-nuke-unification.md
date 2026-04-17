# Nova Nuke Unification (PR 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the lab's patched `drawNukeCloud` + 4 new layers (fallout, capArcs, afterglow, trailHaze) + `combo` shockwave + paired particles + fade-in + end-of-life flash + camera-zoom + bezier core ribbon + brighter flash from `previews/33-nuke-vfx.html` into `js/effects.js`, gated by a single `FD.NUKE_FX` config. Retire the lab's source-patching; wire tester / game / city-lab through the new `FD.tickNuke()` + `FD.drawNukeLayers()` orchestrators.

**Architecture:** Config-object gating (`FD.NUKE_FX`) replaces runtime source-patching. Two orchestrator functions (`FD.tickNuke`, `FD.drawNukeLayers`) coordinate spawn + update + draw across the new layers. Callers keep calling `FD.drawNukeCloud()` and `FD.drawNukeOverlay()` exactly as before — the orchestrators are additive.

**Tech Stack:** Vanilla JS (no framework), Canvas 2D. No test runner — verification is visual across four screens (game, tester, lab 33, lab 36).

**Source of truth for ported behaviour:** [`previews/33-nuke-vfx.html`](../../previews/33-nuke-vfx.html) lines 505–1330 + the spec at [`docs/specs/2026-04-16-unify-design.md`](../specs/2026-04-16-unify-design.md) §3.

---

## File Structure

| File | Nature |
|------|--------|
| `js/effects.js` | Primary target — add `FD.NUKE_FX` config + 10 new `FD.*` functions + rewrite `drawNukeCloud` + `drawNukeOverlay` + `drawParticles` + `updateParticles` |
| `js/tester.js` | Add `FD.tickNuke()` + `FD.drawNukeLayers()` calls in `render()` |
| `js/game.js` | Add `FD.tickNuke()` + `FD.drawNukeLayers()` calls in `render()` |
| `previews/33-nuke-vfx.html` | Delete 4 source-patch IIFEs + local layer definitions; point `FX_LIVE` at `FD.NUKE_FX`; wire orchestrators |
| `previews/36-city-lab.html` | Add `FD.tickNuke()` + `FD.drawNukeLayers()` calls in the frame loop |

---

## Task 1: Add `FD.NUKE_FX` config + empty layer arrays

**Files:**
- Modify: `js/effects.js` — insert after line 8 (`const FD = window.FD || (window.FD = {});`)

- [ ] **Step 1: Add the config block**

Insert this block immediately after line 8 of `js/effects.js`:

```js
  // --- Nuke VFX config (shared with previews/33-nuke-vfx.html lab) ---
  // Defaults ship the full NOVA baseline: all layers ON except godRays
  // (stylistic, left OFF in lab) and novaShock (mutually exclusive with
  // the 'combo' shockwave default — auto-managed when shockStyle changes).
  FD.NUKE_FX = {
    // Stage
    whiteFlash: true, godRays: false, haze: true, trailHaze: true,
    // Shockwave — mutually exclusive with novaShock
    shockStyle: 'combo', // 'nova' | 'harmonic' | 'pulse' | 'refraction' | 'combo' | 'off'
    novaShock: false,    // auto-managed: true iff shockStyle === 'nova'
    // Stem
    midStem: true, wideStem: true, stemCore: true,
    // Cap
    capEdge: true, hotspots: true, cloudBands: true,
    // Ground
    baseFire: true, groundFires: true, baseGlow: true, baseRing: true,
    // Extra paired-particle layers (lifted from lab 33)
    capArcs: true, afterglow: true, fallout: true,
    // Per-system fade-in durations (ms)
    fadeInArcsMs:    400,
    fadeInFalloutMs: 2200
  };

  // --- Paired-particle arrays (used by spawnFallout / spawnCapArcs) ---
  FD.FALLOUT  = [];
  FD.CAP_ARCS = [];
```

- [ ] **Step 2: Verify syntax**

```bash
cd "/Users/tomlinson/Library/Mobile Documents/com~apple~CloudDocs/Projects/VIBE CODING/tomtoolery/.claude/worktrees/romantic-lamport/flappy-drone"
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`. Any parse error means a stray character in the paste.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): seed FD.NUKE_FX config + paired-particle arrays

Empty scaffolding; no behaviour change yet. Subsequent tasks port the
lab's layer functions and flip the existing drawNukeCloud to read
FD.NUKE_FX toggles."
```

---

## Task 2: Port `pairedSpawn` / `updatePaired` / `drawPaired` from the lab

**Files:**
- Modify: `js/effects.js` — insert after Task 1's block

- [ ] **Step 1: Add the paired-particle helpers**

Insert this block immediately after the `FD.CAP_ARCS = [];` line from Task 1:

```js
  // --- Paired-particle pattern (from NOVA MK-V Lab) ---
  // Each call pushes a streak + a glow with shared kinematics. Optional
  // p.sizeScale multiplies radii for smaller/larger pairs.
  FD.pairedSpawn = function (arr, p) {
    const bornAt = performance.now();
    const S = p.sizeScale || 1;
    arr.push({
      kind: 'streak',
      x: p.x, y: p.y, vx: p.vx, vy: p.vy,
      life: p.life, maxLife: p.maxLife,
      r: (2 + Math.random() * 1.5) * S,
      hue: 25 + Math.random() * 10, sat: 100, lum: 75,
      damping: p.damping, gravity: p.gravity,
      trail: [], bornAt, fadeKey: p.fadeKey, fadeCurve: p.fadeCurve
    });
    arr.push({
      kind: 'glow',
      x: p.x, y: p.y, vx: p.vx, vy: p.vy,
      life: p.life, maxLife: p.maxLife,
      r: (15 + Math.random() * 20) * S,
      hue: 15 + Math.random() * 10, sat: 100, lum: 65,
      damping: p.damping, gravity: p.gravity,
      bornAt, fadeKey: p.fadeKey, fadeCurve: p.fadeCurve
    });
  };

  FD.updatePaired = function (arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.life--;
      if (p.life <= 0) { arr.splice(i, 1); continue; }
      if (p.kind === 'streak') {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 12) p.trail.shift();
      }
      p.x += p.vx; p.y += p.vy;
      p.vx *= p.damping;
      p.vy = p.vy * p.damping + p.gravity;
    }
  };

  FD.drawPaired = function (arr) {
    const ctx = FD.ctx;
    const now = performance.now();
    for (const p of arr) {
      const t01 = p.life / p.maxLife;           // 1 fresh → 0 dead
      const fadeMs = (p.fadeKey && FD.NUKE_FX[p.fadeKey]) || 0;
      const age = now - (p.bornAt || now);
      const fadeInA = (fadeMs > 0 && age < fadeMs) ? (age / fadeMs) : 1;
      const curve = p.fadeCurve || 0.18;
      const fadeOutA = Math.pow(t01, curve);
      let aMul = fadeInA * fadeOutA;
      if (aMul < 0.02) continue;
      const age01 = 1 - t01;
      if (p.kind === 'glow') {
        ctx.save();
        const useAdd = p.lum > 70;
        if (useAdd) ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * t01);
        grad.addColorStop(0,    `hsla(${p.hue}, ${p.sat}%, ${p.lum}%, ${aMul * 0.8})`);
        grad.addColorStop(0.25, `hsla(${p.hue}, ${p.sat}%, ${p.lum - 10}%, ${aMul * 0.4})`);
        grad.addColorStop(0.6,  `hsla(${p.hue}, ${p.sat}%, ${p.lum - 25}%, ${aMul * 0.1})`);
        grad.addColorStop(1,    `hsla(${p.hue}, ${p.sat}%, ${p.lum - 30}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * t01, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else {
        const sHue = p.hue - age01 * 18;
        const sSat = Math.max(20, p.sat - age01 * 70);
        const sLum = Math.max(12, p.lum + (1 - age01) * 20 - age01 * 30);
        if (p.trail.length > 1) {
          ctx.globalAlpha = aMul * 0.6;
          ctx.strokeStyle = `hsl(${sHue}, ${sSat * 0.7}%, ${sLum * 0.6}%)`;
          ctx.lineWidth = p.r * t01 * 0.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let k = 1; k < p.trail.length; k++) ctx.lineTo(p.trail[k].x, p.trail[k].y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.globalAlpha = aMul * 0.7;
        ctx.fillStyle = `hsl(${sHue}, ${sSat}%, ${Math.min(95, sLum + 15)}%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * t01 * 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): port pairedSpawn / updatePaired / drawPaired

Lifted verbatim from previews/33-nuke-vfx.html lines 966-1057.
Reads FD.NUKE_FX[p.fadeKey] for per-system fade-in durations. Not
called yet — orchestrator wiring lands in later tasks."
```

---

## Task 3: Port `capCenter()` + `spawnFallout` + `spawnCapArcs`

**Files:**
- Modify: `js/effects.js` — insert after Task 2's `FD.drawPaired = function (arr) { ... };`

- [ ] **Step 1: Add the spawn helpers**

```js
  // --- Cap-center math (shared by fallout/capArcs/afterglow/trailHaze) ---
  // Matches the NOVA MK-V baseline: cloudT/5800, cubic-out ease, 0.05 drift.
  FD.capCenter = function () {
    const elapsedMs = performance.now() - FD.nukeStart;
    const H = FD.H;
    const cloudT   = Math.min(1, (elapsedMs - 100) / 5800);
    const riseEase = 1 - Math.pow(1 - Math.min(1, cloudT * 1.5), 3);
    const slowDrift = Math.min(1, elapsedMs / 14000) * H * 0.05;
    const cY      = FD.nukeGy - riseEase * (H * 0.5) - slowDrift;
    const capGrow = Math.min(1, cloudT * 2.5);
    const capR    = 50 + capGrow * 70;
    const capRx   = capR * 1.5;
    return { cY, capR, capRx, elapsedMs };
  };

  // --- Fallout: very sparse, slow, paired, fades in (lab 33 default OFF, ship ON) ---
  FD.spawnFallout = function () {
    if (!FD.NUKE_FX.fallout || !FD.nukeActive) return;
    const { cY, capR, capRx, elapsedMs } = FD.capCenter();
    if (elapsedMs < 1800 || elapsedMs > 12500) return;
    if (FD.FALLOUT.length > 80) return;
    if (Math.random() > 0.04) return;
    const px = FD.nukeGx + (Math.random() - 0.5) * capRx * 1.4;
    const py = cY + capR * (-0.05 + Math.random() * 0.35);
    const vy = 0.05 + Math.random() * 0.18;
    const vx = (Math.random() - 0.5) * 0.04;
    FD.pairedSpawn(FD.FALLOUT, {
      x: px, y: py, vx, vy,
      life: 6000 + Math.random() * 2400, maxLife: 8400,
      damping: 0.9995, gravity: 0.0008,
      fadeKey: 'fadeInFalloutMs',
      sizeScale: 0.22,   // much smaller than stem particles
      fadeCurve: 0.10    // very slow 100→0 fade-out
    });
  };

  // --- Cap-edge arcs: paired, mixed-speed, earlier start, shorter range ---
  FD.spawnCapArcs = function () {
    if (!FD.NUKE_FX.capArcs || !FD.nukeActive) return;
    const { cY, capR, capRx, elapsedMs } = FD.capCenter();
    if (elapsedMs < 700 || elapsedMs > 6500) return;
    if (FD.CAP_ARCS.length > 70) return;
    if (Math.random() > 0.20) return;
    const dir = Math.random() < 0.5 ? -1 : 1;
    const pa = -Math.PI * 0.5 + dir * (0.05 + Math.random() * 0.55) * Math.PI * 0.5;
    const px = FD.nukeGx + Math.cos(pa) * capRx * (0.78 + Math.random() * 0.18);
    const py = cY        + Math.sin(pa) * capR  * (0.68 + Math.random() * 0.22);
    // Mixed velocities — three tiers: slow drift / medium / quick
    const tier = Math.random();
    let vx, vy;
    if (tier < 0.30) {        // slow drifters (~30%)
      vx = dir * (0.10 + Math.random() * 0.12);
      vy = -0.02 - Math.random() * 0.08;
    } else if (tier < 0.80) { // medium (~50%)
      vx = dir * (0.20 + Math.random() * 0.18);
      vy = -0.05 - Math.random() * 0.10;
    } else {                  // quick (~20%)
      vx = dir * (0.40 + Math.random() * 0.25);
      vy = -0.10 - Math.random() * 0.15;
    }
    FD.pairedSpawn(FD.CAP_ARCS, {
      x: px, y: py, vx, vy,
      life: 1600 + Math.random() * 500, maxLife: 2100,
      damping: 0.985, gravity: 0.0035,
      fadeKey: 'fadeInArcsMs'
    });
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): port capCenter + spawnFallout + spawnCapArcs

Lifted from previews/33-nuke-vfx.html lines 951-1115. Gated by
FD.NUKE_FX.fallout / capArcs. Still not called from anywhere."
```

---

## Task 4: Port `drawCapAfterglow` + `drawCapTrailingHaze` + `drawShockwave`

**Files:**
- Modify: `js/effects.js` — insert after Task 3's `FD.spawnCapArcs = function () { ... };`

- [ ] **Step 1: Add the three layer renderers**

```js
  // --- Lingering cap-core afterglow (screen-blended, breathing) ---
  FD.drawCapAfterglow = function () {
    if (!FD.NUKE_FX.afterglow || !FD.nukeActive) return;
    const ctx = FD.ctx;
    const { cY, capRx, elapsedMs } = FD.capCenter();
    if (elapsedMs < 200) return;
    const ramp  = Math.min(1, (elapsedMs - 200) / 1300);
    const fadeT = elapsedMs > 12000 ? Math.min(1, (elapsedMs - 12000) / 2000) : 0;
    const decay = Math.pow(1 - Math.min(1, elapsedMs / 13500), 1.4);
    const baseA = ramp * decay * (1 - fadeT);
    if (baseA < 0.005) return;
    const breath = 0.85 + 0.15 * Math.sin(elapsedMs * 0.0014);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const outerR = capRx * 2.2;
    const og = ctx.createRadialGradient(FD.nukeGx, cY - capRx * 0.05, 0,
                                        FD.nukeGx, cY - capRx * 0.05, outerR);
    og.addColorStop(0,    `hsla(34,100%,70%,${baseA * 0.5  * breath})`);
    og.addColorStop(0.25, `hsla(28,100%,55%,${baseA * 0.28 * breath})`);
    og.addColorStop(0.6,  `hsla(20, 90%,40%,${baseA * 0.10 * breath})`);
    og.addColorStop(1,    `hsla(15, 80%,25%,0)`);
    ctx.fillStyle = og;
    ctx.beginPath(); ctx.arc(FD.nukeGx, cY - capRx * 0.05, outerR, 0, Math.PI * 2); ctx.fill();
    const innerR = capRx * 0.85;
    const ig = ctx.createRadialGradient(FD.nukeGx, cY - capRx * 0.1, 0,
                                        FD.nukeGx, cY - capRx * 0.1, innerR);
    ig.addColorStop(0,   `hsla(45,100%,82%,${baseA * 0.55 * breath})`);
    ig.addColorStop(0.4, `hsla(35,100%,58%,${baseA * 0.28 * breath})`);
    ig.addColorStop(1,   `hsla(25,100%,40%,0)`);
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.arc(FD.nukeGx, cY - capRx * 0.1, innerR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  // --- Cap-trailing sky haze — wide warm fog band behind the rising cap ---
  FD.drawCapTrailingHaze = function () {
    if (!FD.NUKE_FX.trailHaze || !FD.nukeActive) return;
    const ctx = FD.ctx;
    const { cY, capRx, elapsedMs } = FD.capCenter();
    if (elapsedMs < 1500) return;
    const W = FD.W;
    let intensity;
    if (elapsedMs < 5000) intensity = (elapsedMs - 1500) / 3500;
    else if (elapsedMs < 9000) intensity = 1;
    else if (elapsedMs < 13000) intensity = 1 - (elapsedMs - 9000) / 4000;
    else intensity = 0;
    intensity = Math.max(0, Math.min(1, intensity));
    if (intensity < 0.02) return;
    const climb = (FD.nukeGy - cY) / FD.H;
    const bandH = 140 + climb * 200;
    const bandCY = cY + capRx * 0.15;
    const bandTop = bandCY - bandH * 0.55;
    const bandBot = bandCY + bandH * 0.45;
    const hue = 22 + climb * 6;
    const sat = 28 + climb * 12;
    const lum = 28;
    const peakA = 0.34 * intensity;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const grad = ctx.createLinearGradient(0, bandTop, 0, bandBot);
    grad.addColorStop(0,   `hsla(${hue},${sat}%,${lum}%,0)`);
    grad.addColorStop(0.4, `hsla(${hue},${sat}%,${lum + 4}%,${peakA * 0.7})`);
    grad.addColorStop(0.6, `hsla(${hue},${sat}%,${lum + 6}%,${peakA})`);
    grad.addColorStop(1,   `hsla(${hue},${sat - 8}%,${lum - 4}%,0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, bandTop, W, bandBot - bandTop);
    const glowR = capRx * 4.0;
    const glowH = bandH * 0.6;
    const eg = ctx.createRadialGradient(FD.nukeGx, bandCY, 0,
                                        FD.nukeGx, bandCY, glowR);
    eg.addColorStop(0,   `hsla(${hue + 4},${sat + 8}%,${lum + 8}%,${peakA * 0.85})`);
    eg.addColorStop(0.5, `hsla(${hue},${sat}%,${lum + 4}%,${peakA * 0.35})`);
    eg.addColorStop(1,   `hsla(${hue - 4},${sat - 10}%,${lum}%,0)`);
    ctx.fillStyle = eg;
    ctx.save();
    ctx.translate(FD.nukeGx, bandCY);
    ctx.scale(1, glowH / glowR);
    ctx.beginPath(); ctx.arc(0, 0, glowR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  // --- Shockwave variants ('nova' handled inside drawNukeCloud; this draws the rest) ---
  FD.drawShockwave = function () {
    if (!FD.nukeActive) return;
    const style = FD.NUKE_FX.shockStyle;
    if (style === 'nova' || style === 'off') return;
    const ctx = FD.ctx;
    const elapsedMs = performance.now() - FD.nukeStart;
    if (elapsedMs < 80 || elapsedMs > 3500) return;
    const W = FD.W, H = FD.H;
    const gx = FD.nukeGx, gy = FD.nukeGy;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    if (style === 'harmonic') {
      [{ off: 0, peak: 0.55 }, { off: 220, peak: 0.32 }].forEach(r => {
        const local = elapsedMs - r.off;
        if (local < 0 || local > 2800) return;
        const t = local / 2800;
        const radius = t * Math.max(W, H) * 0.95;
        const a = (1 - t) * r.peak;
        ctx.strokeStyle = `rgba(255,210,140,${a})`;
        ctx.lineWidth = 2 + (1 - t) * 18;
        ctx.beginPath(); ctx.arc(gx, gy, radius, Math.PI, 0); ctx.stroke();
      });
    } else if (style === 'pulse') {
      const t = Math.min(1, (elapsedMs - 80) / 2200);
      const radius = t * Math.max(W, H) * 1.0;
      const a = (1 - t * t) * 0.6;
      const g = ctx.createRadialGradient(gx, gy, radius * 0.55, gx, gy, radius);
      g.addColorStop(0, `rgba(255,180,80,0)`);
      g.addColorStop(0.7, `rgba(255,150,60,${a * 0.6})`);
      g.addColorStop(1.0, `rgba(255,120,40,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(gx, gy, radius, Math.PI, 0); ctx.fill();
    } else if (style === 'refraction') {
      const t = Math.min(1, (elapsedMs - 80) / 2400);
      const radius = t * Math.max(W, H) * 0.95;
      const bandW = 26 + (1 - t) * 24;
      const a = (1 - t) * 0.7;
      ctx.strokeStyle = `rgba(255,235,200,${a})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(gx, gy, radius, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = `rgba(180,200,230,${a * 0.35})`;
      ctx.lineWidth = bandW;
      ctx.beginPath(); ctx.arc(gx, gy, Math.max(0, radius - bandW * 0.6), Math.PI, 0); ctx.stroke();
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = `rgba(40,30,20,${a * 0.45})`;
      ctx.lineWidth = bandW * 0.7;
      ctx.beginPath(); ctx.arc(gx, gy, Math.max(0, radius - bandW * 1.3), Math.PI, 0); ctx.stroke();
    } else if (style === 'combo') {
      // Phase 1 — refraction snap (~750 ms, alpha cap 0.50)
      if (elapsedMs >= 80 && elapsedMs <= 900) {
        const t1 = Math.min(1, (elapsedMs - 80) / 750);
        const radius = t1 * Math.max(W, H) * 0.95;
        const bandW = 22 + (1 - t1) * 20;
        const a = (1 - t1 * t1) * 0.50;
        ctx.strokeStyle = `rgba(255,235,200,${a})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(gx, gy, radius, Math.PI, 0); ctx.stroke();
        ctx.strokeStyle = `rgba(180,200,230,${a * 0.35})`;
        ctx.lineWidth = bandW;
        ctx.beginPath(); ctx.arc(gx, gy, Math.max(0, radius - bandW * 0.55), Math.PI, 0); ctx.stroke();
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = `rgba(40,30,20,${a * 0.5})`;
        ctx.lineWidth = bandW * 0.7;
        ctx.beginPath(); ctx.arc(gx, gy, Math.max(0, radius - bandW * 1.25), Math.PI, 0); ctx.stroke();
        ctx.restore();
      }
      // Phase 2 — soft warm pulse bloom (500–3800 ms)
      if (elapsedMs >= 500 && elapsedMs <= 3800) {
        const t2 = Math.min(1, (elapsedMs - 500) / 3200);
        const radius = t2 * Math.max(W, H) * 1.05;
        const a = (1 - t2 * t2) * 0.65;
        const g = ctx.createRadialGradient(gx, gy, radius * 0.55, gx, gy, radius);
        g.addColorStop(0,   `rgba(255,180,80,0)`);
        g.addColorStop(0.6, `rgba(255,150,60,${a * 0.55})`);
        g.addColorStop(1,   `rgba(255,120,40,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(gx, gy, radius, Math.PI, 0); ctx.fill();
        const innerA = a * 0.4;
        const ig = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius * 0.5);
        ig.addColorStop(0, `rgba(255,200,120,${innerA})`);
        ig.addColorStop(1, `rgba(255,140,60,0)`);
        ctx.fillStyle = ig;
        ctx.beginPath(); ctx.arc(gx, gy, radius * 0.5, Math.PI, 0); ctx.fill();
      }
    }

    ctx.restore();
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): port cap afterglow + trail haze + shockwave variants

Lifted from previews/33-nuke-vfx.html lines 1117-1330. All gated by
FD.NUKE_FX toggles. Combo shockwave = refraction snap + soft bloom
(current lab default, shipping as the game default)."
```

---

## Task 5: Add `FD.tickNuke()` + `FD.drawNukeLayers()` orchestrators

**Files:**
- Modify: `js/effects.js` — insert after Task 4's `FD.drawShockwave = function () { ... };`

- [ ] **Step 1: Add the orchestrators**

```js
  // --- Orchestrator: called once per frame by game / tester / city-lab ---
  // Handles spawn + update of paired arrays. Safe to call every frame —
  // internally gated by FD.nukeActive (for spawning) and always runs
  // update so existing particles finish their lifetime post-nuke.
  FD.tickNuke = function () {
    if (FD.nukeActive) {
      FD.spawnFallout();
      FD.spawnCapArcs();
    }
    FD.updatePaired(FD.FALLOUT);
    FD.updatePaired(FD.CAP_ARCS);
  };

  // --- Orchestrator: called by render pipeline to draw all non-cloud layers.
  // Caller still invokes FD.drawNukeCloud() directly — this handles the
  // auxiliary layers (trailHaze behind, afterglow / paired / shockwave in front).
  // Intended order: drawBehindLayers() → drawNukeCloud() → drawInFrontLayers()
  FD.drawBehindNukeCloud = function () {
    if (!FD.nukeActive) return;
    FD.drawCapTrailingHaze();
  };
  FD.drawInFrontNukeCloud = function () {
    if (!FD.nukeActive && FD.FALLOUT.length === 0 && FD.CAP_ARCS.length === 0) return;
    FD.drawCapAfterglow();
    FD.drawPaired(FD.CAP_ARCS);
    FD.drawPaired(FD.FALLOUT);
    FD.drawShockwave();
  };
```

> **Note (naming):** The spec §3.2 originally used a single `FD.drawNukeLayers` for everything. In practice the layers split around `drawNukeCloud` — trail haze must render **behind** the cap, afterglow/paired/shockwave must render **in front**. Two helpers with explicit names make the caller wiring unambiguous. Spec's `FD.drawNukeLayers` is dropped in favour of `FD.drawBehindNukeCloud` + `FD.drawInFrontNukeCloud`.

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): add tickNuke + drawBehindNukeCloud + drawInFrontNukeCloud

Trail haze must render behind the cap; afterglow/paired/shockwave in
front. Split into two draw helpers for unambiguous caller wiring.
Paired arrays keep ticking after FD.nukeActive flips false so particles
can finish their lifetime visually."
```

---

## Task 6: Teach `FD.drawParticles` about `_fadeInMs` / `_bornAt`

**Files:**
- Modify: `js/effects.js` lines 123–179 (existing `FD.drawParticles` function)

- [ ] **Step 1: Replace the drawParticles body**

Find this line in `js/effects.js` (currently line 123):

```js
  FD.drawParticles = function (isFg) {
    const ctx = FD.ctx;
    FD.particles.forEach(p => {
```

Replace the entire function (lines 123–179) with:

```js
  FD.drawParticles = function (isFg) {
    const ctx = FD.ctx;
    const now = performance.now();
    // Temporarily scale p.life down during _fadeInMs window so the existing
    // alpha math (derived from p.life / p.maxLife) emerges as transparent
    // → opaque over the chosen duration. Restored after draw.
    const restore = [];
    for (const p of FD.particles) {
      if (p._fadeInMs && p._bornAt) {
        const age = now - p._bornAt;
        if (age < p._fadeInMs) {
          restore.push({ p, life: p.life });
          p.life = p.life * (age / p._fadeInMs);
        }
      }
    }
    FD.particles.forEach(p => {
      if (!!p.fg !== !!isFg) return;
      const t = p.life / p.maxLife;

      // Trail rendering (if particle has trail history)
      if (p.hasTrail && p.trailList && p.trailList.length > 1) {
        const age = p.maxLife - p.life;
        const trailAlpha = age < 90 ? (age / 90) * 0.6 : t * 0.6;
        ctx.globalAlpha = trailAlpha;
        ctx.strokeStyle = `hsla(${p.hue}, ${(p.sat || 100) * 0.7}%, ${(p.lum || 55) * 0.6}%, ${trailAlpha})`;
        ctx.lineWidth = p.r * t * 0.5;
        ctx.beginPath();
        p.trailList.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (p.glow) {
        var useAdditive = (p.lum || 55) > 70;
        if (useAdditive) ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * t);
        grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.lum}%, ${t * 0.8})`);
        grad.addColorStop(0.25, `hsla(${p.hue}, ${p.sat}%, ${p.lum - 10}%, ${t * 0.4})`);
        grad.addColorStop(0.6, `hsla(${p.hue}, ${p.sat}%, ${p.lum - 25}%, ${t * 0.1})`);
        grad.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.lum - 30}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2); ctx.fill();
        if (useAdditive) ctx.globalCompositeOperation = 'source-over';
      } else if (p.streak) {
        const age01 = 1 - t;
        const sHue = p.hue - age01 * 18;
        const sSat = Math.max(20, (p.sat || 100) - age01 * 70);
        const sLum = Math.max(12, (p.lum || 55) + (1 - age01) * 20 - age01 * 30);
        ctx.globalAlpha = t * 0.7;
        ctx.strokeStyle = `hsl(${sHue}, ${sSat}%, ${sLum}%)`;
        ctx.lineWidth = p.r * t * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = `hsl(${sHue}, ${sSat}%, ${Math.min(95, sLum + 15)}%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * t * 0.6, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.globalAlpha = t * 0.75;
        const sat = p.sat || 90, lum = p.lum || 55;
        ctx.fillStyle = `hsl(${p.hue}, ${sat}%, ${lum + (1 - t) * 20}%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    // Restore any scaled-down lives
    for (const r of restore) r.p.life = r.life;
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): honour _fadeInMs/_bornAt on FD.particles

Particles tagged with _fadeInMs + _bornAt fade in from transparent
over the chosen window. Existing particles (no tags) behave identically.
Lifted from previews/33-nuke-vfx.html patchDrawParticlesFadeIn IIFE."
```

---

## Task 7: End-of-life flash + camera-zoom on mid-stem streaks

**Files:**
- Modify: `js/effects.js` lines 181–213 (existing `FD.updateParticles` function)

- [ ] **Step 1: Replace the updateParticles body**

Replace the entire function (currently lines 181–213) with:

```js
  FD.updateParticles = function () {
    var groundY = FD.H - FD.GROUND_H;
    var flashes = [];
    var toFlash = [];
    // Pre-pass: tag + flash detection (must run before life-- decrements)
    FD.particles.forEach(function (p) {
      // Tag newly-spawned mid-stem streaks once. ~12% become camera-bound:
      // slower lateral motion, forward bias, radius grows with age to
      // simulate approaching the lens. Switched to foreground to render
      // on top of the city.
      if (p.streak && p.hasTrail && !p.fg && !p._tagged) {
        p._tagged = true;
        if (Math.random() < 0.12) {
          p._zoom = true;
          p._baseR = p.r;
          p.vx *= 0.35;
          p.vy *= 0.6;
          p.fg  = true;
        }
      }
      // End-of-life bright flash — ~55% of streaks pop into a burst.
      if (p.streak && p.hasTrail && p.life <= 1 && !p._flashed) {
        p._flashed = true;
        if (Math.random() < 0.55) toFlash.push({ x: p.x, y: p.y, fg: p.fg });
      }
    });
    // Grow camera-bound particles (linear with age, up to ~4×)
    FD.particles.forEach(function (p) {
      if (p._zoom && p._baseR) {
        const age = 1 - (p.life / p.maxLife);
        p.r = p._baseR * (1 + age * 3.0);
      }
    });
    // Main update (preserves existing ground-flash behaviour)
    FD.particles.forEach(p => {
      if (p.switchZ && p.life < p.maxLife * 0.65) p.fg = true;
      if (p.fg && p.y > groundY - 10 && p.life > 15 && Math.random() < 0.02) {
        p.life = 0;
        flashes.push({
          x: p.x, y: p.y, vx: 0, vy: -0.2,
          life: 8, maxLife: 8, r: 25 + Math.random() * 20,
          hue: 35, sat: 100, lum: 90, glow: true, fg: true
        });
      }
      if (p.hasTrail) {
        if (!p.trailList) p.trailList = [];
        p.trailList.push({ x: p.x, y: p.y });
        if (p.trailList.length > 20) p.trailList.shift();
      }
      p.x += p.vx; p.y += p.vy;
      p.vx *= (p.damping || 0.98);
      p.vy *= (p.damping || 0.98);
      p.vy += (p.gravity || 0.02);
      p.life--;
    });
    FD.particles = FD.particles.filter(p => p.life > 0);
    flashes.forEach(function (f) { FD.particles.push(f); });

    // End-of-life burst spawns for flagged streaks
    for (const f of toFlash) {
      // Hot white-yellow core — the initial pop
      FD.particles.push({
        x: f.x, y: f.y, vx: 0, vy: -0.03,
        life: 14, maxLife: 14, r: 20 + Math.random() * 8,
        hue: 46, sat: 100, lum: 98, glow: true, fg: f.fg
      });
      // Secondary warm halo that lingers a beat longer
      FD.particles.push({
        x: f.x, y: f.y, vx: 0, vy: 0,
        life: 22, maxLife: 22, r: 40 + Math.random() * 10,
        hue: 32, sat: 100, lum: 68, glow: true, fg: f.fg
      });
      // Quick bright snap (short-lived pinpoint highlight)
      FD.particles.push({
        x: f.x, y: f.y, vx: 0, vy: 0,
        life: 4, maxLife: 4, r: 8,
        hue: 55, sat: 80, lum: 100, glow: true, fg: f.fg
      });
      // Spark shower
      const sparks = 6 + ((Math.random() * 4) | 0);
      for (let s = 0; s < sparks; s++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 0.45 + Math.random() * 0.75;
        FD.particles.push({
          x: f.x, y: f.y,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          life: 14 + Math.random() * 8, maxLife: 22,
          r: 1.2 + Math.random() * 1.0,
          hue: 42 + Math.random() * 10, sat: 100, lum: 85,
          damping: 0.94, gravity: 0.004,
          streak: true, fg: f.fg
        });
      }
    }
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): end-of-life flash + camera-zoom on mid-stem streaks

~55% of dying stem streaks pop into a 3-particle burst (hot core +
warm halo + pinpoint snap) plus 6-10 sparks. ~12% of stem streaks
become camera-bound: slower lateral, forward bias, radius grows with
age. Lifted from previews/33-nuke-vfx.html patchStreakEndFlash."
```

---

## Task 8: Rewrite `FD.drawNukeCloud` with baked lab values + FX toggles

**This is the biggest task.** The entire existing `FD.drawNukeCloud` function (lines 281–585 of current `js/effects.js`) is replaced wholesale with the version that bakes in every lab patch and reads `FD.NUKE_FX` toggles inline.

**Files:**
- Modify: `js/effects.js` lines 277–585 (the whole block starting `// --- Nuke mushroom cloud: NOVA MK-V (11s timeline) ---` through `};` that closes `FD.drawNukeCloud`)

- [ ] **Step 1: Replace the drawNukeCloud function wholesale**

Delete lines 277–585 of `js/effects.js` and replace with this block:

```js
  // --- Nuke mushroom cloud: NOVA MK-V (14 s timeline, unified) ---
  // All effect blocks gated by FD.NUKE_FX.<key>. Lab patches baked in:
  // brighter cap-edge (earlier start + doubled rate), fattened stem/cap
  // particles, widened stem spawn column, stem ejecta dead-zone fix,
  // bezier-ribbon stem core rod, taller haze band, _fadeInMs tagging
  // on cap-edge. See docs/specs/2026-04-16-unify-design.md § 3 for the
  // full change log.
  FD.drawNukeCloud = function () {
    if (!FD.nukeActive) return;
    const ctx = FD.ctx;
    const W = FD.W, H = FD.H;
    const elapsed = performance.now() - FD.nukeStart;
    const totalMs = 14000;
    const gx = FD.nukeGx, gy = FD.nukeGy;
    const t = elapsed / 1000;

    if (elapsed < 100) { if (elapsed > totalMs) FD.nukeActive = false; return; }

    const cloudT = Math.min(1, (elapsed - 100) / 5800);
    const fadeT  = elapsed > 12000 ? Math.min(1, (elapsed - 12000) / 2000) : 0;
    const darkT  = elapsed > 3500 ? Math.min(1, (elapsed - 3500) / 4500) : 0;
    const alpha  = (1 - fadeT) * 0.95;
    if (alpha < 0.01) { if (elapsed > totalMs) FD.nukeActive = false; return; }
    ctx.globalAlpha = alpha;

    const riseEase = 1 - Math.pow(1 - Math.min(1, cloudT * 1.5), 3);
    const slowDrift = Math.min(1, elapsed / totalMs) * H * 0.05;
    const cY = gy - riseEase * (H * 0.5) - slowDrift;
    const capGrow = Math.min(1, cloudT * 2.5);
    const capR = 50 + capGrow * 70;
    const capRx = capR * 1.5;
    const hShift = darkT * 20;
    const lDrop  = darkT * 35;

    const drawNoisyEllipse = (cx, cy, rx, ry, iOff, flattenBottom) => {
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const angle = (j / 60) * Math.PI * 2;
        const turb = Math.sin(angle * 12 + t * 0.6 + iOff) * 0.03 + Math.cos(angle * 7 - t * 0.5 + iOff * 2) * 0.04;
        const px = cx + Math.cos(angle) * rx * (1 + turb);
        const yDir = Math.sin(angle);
        const ryMult = (flattenBottom && yDir > 0) ? 0.55 : 1.0;
        const py = cy + yDir * ry * (1 + turb) * ryMult;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.fill();
    };

    // Thermal god rays (0-2.5s) — gated + dimmed + count halved
    if (elapsed < 2500 && FD.NUKE_FX.godRays) {
      const rayAlpha = (1 - (elapsed / 2500) ** 2) * 0.012;
      ctx.save();
      ctx.globalAlpha = rayAlpha;
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI + Math.PI;
        const sweep = Math.sin(t * 0.4 + i * 1.7) * 0.08;
        const fa = angle + sweep;
        const len = W * 0.8 + Math.sin(t * 1.2 + i * 3) * 40;
        const grad = ctx.createLinearGradient(gx, gy, gx + Math.cos(fa) * len, gy + Math.sin(fa) * len);
        grad.addColorStop(0, 'rgba(255,200,100,1)');
        grad.addColorStop(1, 'rgba(255,100,50,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + Math.cos(fa - 0.05) * len, gy + Math.sin(fa - 0.05) * len);
        ctx.lineTo(gx + Math.cos(fa + 0.05) * len, gy + Math.sin(fa + 0.05) * len);
        ctx.fill();
      }
      ctx.restore();
    }

    // NOVA shockwave + ground dust band — gated (disabled when combo/pulse/etc is active)
    if (elapsed > 200 && elapsed < 2800 && FD.NUKE_FX.novaShock) {
      const st = (elapsed - 200) / 2600;
      const radius = st * Math.max(W, H) * 0.9;
      ctx.globalAlpha = alpha * Math.max(0, 1 - st) * 0.4;
      ctx.strokeStyle = 'rgba(255,200,100,0.7)';
      ctx.lineWidth = 4 + (1 - st) * 15;
      ctx.beginPath(); ctx.arc(gx, gy, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = alpha;
      const gw = st * W * 1.8, gh = 15 + st * 15;
      const lg = ctx.createLinearGradient(0, gy - gh, 0, gy);
      lg.addColorStop(0, 'rgba(200,160,120,0)');
      lg.addColorStop(1, `rgba(200,160,120,${(1 - st) * 0.6})`);
      ctx.fillStyle = lg;
      ctx.fillRect(gx - gw / 2, gy - gh, gw, gh);
    }

    // Hourglass stem with bezier necking
    const stemTopW = 25 + capGrow * 18;
    const stemBaseW = 45 + capGrow * 40;
    const neckPinch = stemTopW * 0.3;
    const stemGrad = ctx.createLinearGradient(gx, cY + capR * 0.3, gx, gy);
    stemGrad.addColorStop(0, `hsla(${25 - hShift},90%,${Math.max(10, 50 - lDrop)}%,${alpha})`);
    stemGrad.addColorStop(0.4, `hsla(${20 - hShift},85%,${Math.max(8, 40 - lDrop)}%,${alpha})`);
    stemGrad.addColorStop(1, `hsla(${15 - hShift},70%,${Math.max(5, 30 - lDrop)}%,${alpha})`);
    ctx.fillStyle = stemGrad;
    const midY = (cY + gy) / 2;
    const wobble = Math.sin(t * 1.2) * 12;
    ctx.beginPath();
    ctx.moveTo(gx - stemTopW / 2, cY + capR * 0.3);
    ctx.bezierCurveTo(gx - stemTopW * 0.6 + wobble, cY + (midY - cY) * 0.5, gx - stemTopW * 0.3 + wobble - neckPinch * 0.5, midY - 20, gx - stemTopW * 0.4 + wobble, midY);
    ctx.bezierCurveTo(gx - stemTopW * 0.5 + wobble + neckPinch * 0.3, midY + 20, gx - stemBaseW * 0.4, gy - 30, gx - stemBaseW / 2, gy);
    ctx.lineTo(gx + stemBaseW / 2, gy);
    ctx.bezierCurveTo(gx + stemBaseW * 0.4, gy - 30, gx + stemTopW * 0.5 + wobble + neckPinch * 0.3, midY + 20, gx + stemTopW * 0.4 + wobble, midY);
    ctx.bezierCurveTo(gx + stemTopW * 0.3 + wobble - neckPinch * 0.5, midY - 20, gx + stemTopW * 0.6 + wobble, cY + (midY - cY) * 0.5, gx + stemTopW / 2, cY + capR * 0.3);
    ctx.closePath(); ctx.fill();

    // Stem core glow — bezier ribbon that tracks the stem wobble
    const coreGlowA = alpha * Math.max(0, 0.5 - darkT * 0.4);
    if (coreGlowA > 0.01 && FD.NUKE_FX.stemCore) {
      const cg = ctx.createLinearGradient(gx, cY + capR * 0.3, gx, gy);
      cg.addColorStop(0, `hsla(40,100%,${Math.max(20, 65 - lDrop)}%,${coreGlowA})`);
      cg.addColorStop(1, `hsla(25,100%,${Math.max(10, 40 - lDrop)}%,${coreGlowA * 0.2})`);
      ctx.fillStyle = cg;
      // Bezier ribbon — mirrors stem wobble instead of staying pin-straight
      (() => {
        const halfW = stemTopW * 0.075;
        const topY  = cY + capR * 0.3;
        ctx.beginPath();
        ctx.moveTo(gx - halfW, topY);
        ctx.bezierCurveTo(
          gx - halfW + wobble * 0.65, topY + (midY - topY) * 0.5,
          gx - halfW + wobble * 0.55 - neckPinch * 0.3, midY - 18,
          gx - halfW + wobble * 0.45, midY
        );
        ctx.bezierCurveTo(
          gx - halfW + wobble * 0.40 + neckPinch * 0.2, midY + 18,
          gx - halfW * 0.9, gy - 24,
          gx - halfW * 0.85, gy
        );
        ctx.lineTo(gx + halfW * 0.85, gy);
        ctx.bezierCurveTo(
          gx + halfW * 0.9, gy - 24,
          gx + halfW + wobble * 0.40 + neckPinch * 0.2, midY + 18,
          gx + halfW + wobble * 0.45, midY
        );
        ctx.bezierCurveTo(
          gx + halfW + wobble * 0.55 - neckPinch * 0.3, midY - 18,
          gx + halfW + wobble * 0.65, topY + (midY - topY) * 0.5,
          gx + halfW, topY
        );
        ctx.closePath();
        ctx.fill();
      })();
    }

    // Base radial glow — gated
    if (FD.NUKE_FX.baseGlow) {
      const bgR = capRx * 2.2;
      const bgA = alpha * Math.max(0, 1 - (elapsed / 2000));
      const bg = ctx.createRadialGradient(gx, gy, 0, gx, gy, bgR);
      bg.addColorStop(0, `hsla(40,100%,80%,${bgA})`);
      bg.addColorStop(0.15, `hsla(30,100%,60%,${bgA * 0.5})`);
      bg.addColorStop(0.4, `hsla(20,100%,40%,${bgA * 0.1})`);
      bg.addColorStop(1, 'hsla(15,100%,20%,0)');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(gx, gy, bgR, 0, Math.PI * 2); ctx.fill();
    }

    // Sub-cloud at stem-cap intersection
    ctx.fillStyle = `hsla(${18 - hShift},85%,${Math.max(8, 35 - lDrop)}%,${alpha})`;
    drawNoisyEllipse(gx, cY + capR * 0.25, capRx * 0.75, capR * 0.4, 10, false);

    // Differential darkening
    const outerDark = Math.min(1, darkT * 1.4);
    const midDark   = darkT;
    const innerDark = Math.min(1, darkT * 0.6);
    const coreDark  = Math.min(1, darkT * 0.35);
    const outerHShift = outerDark * 22;
    const outerLDrop  = outerDark * 40;

    // 4 plasma cap layers
    ctx.fillStyle = `hsla(${8 - outerHShift},${90 - outerDark * 30}%,${Math.max(4, 22 - outerLDrop)}%,${alpha})`;
    drawNoisyEllipse(gx, cY, capRx * 1.0, capR * 0.95, 0, true);
    ctx.fillStyle = `hsla(${14 - midDark * 20},${92 - midDark * 20}%,${Math.max(6, 30 - midDark * 32)}%,${alpha})`;
    drawNoisyEllipse(gx, cY - capR * 0.03, capRx * 0.85, capR * 0.82, 1, true);
    ctx.fillStyle = `hsla(${25 - innerDark * 18},${95 - innerDark * 15}%,${Math.max(10, 42 - innerDark * 28)}%,${alpha})`;
    drawNoisyEllipse(gx, cY - capR * 0.06, capRx * 0.65, capR * 0.65, 2, true);
    ctx.fillStyle = `hsla(${40 - coreDark * 15},100%,${Math.max(15, 58 - coreDark * 25)}%,${alpha})`;
    drawNoisyEllipse(gx, cY - capR * 0.08, capRx * 0.45, capR * 0.45, 3, false);

    // Hot core
    const coreExtDk = elapsed > 6500 ? Math.min(1, (elapsed - 6500) / 2000) : 0;
    const coreA = alpha * Math.max(0.1, 1 - coreExtDk);
    ctx.fillStyle = `hsla(35,100%,${Math.max(15, 80 - coreExtDk * 60)}%,${coreA})`;
    drawNoisyEllipse(gx, cY - capR * 0.1, capRx * 0.25, capR * 0.25, 20, false);

    // Rolling hotspots — gated
    if (FD.NUKE_FX.hotspots) for (let hs = 0; hs < 4; hs++) {
      if (t < 0.5 + hs * 0.3 || darkT > 0.8) continue;
      const hsX = gx + Math.sin(t * 0.3 + hs * 2.5) * capRx * 0.4;
      const hsY = cY - capR * 0.05 + Math.cos(t * 0.25 + hs * 1.8) * capR * 0.25;
      const hsR = capR * 0.12 * (1 - darkT * 0.7);
      const hsA = alpha * 0.35 * (1 - darkT);
      const hsg = ctx.createRadialGradient(hsX, hsY, 0, hsX, hsY, hsR);
      hsg.addColorStop(0, `hsla(42,100%,72%,${hsA})`);
      hsg.addColorStop(0.5, `hsla(35,100%,55%,${hsA * 0.3})`);
      hsg.addColorStop(1, 'hsla(25,100%,40%,0)');
      ctx.fillStyle = hsg;
      ctx.beginPath(); ctx.arc(hsX, hsY, hsR, 0, Math.PI * 2); ctx.fill();
    }

    // Base ring / skirt — gated
    if (FD.NUKE_FX.baseRing) {
      ctx.fillStyle = `hsla(${15 - hShift},70%,${Math.max(5, 28 - lDrop)}%,${alpha * 0.8})`;
      drawNoisyEllipse(gx, cY + capR * 0.4, capRx * 1.15, capR * 0.22, 12, false);
    }

    // 3 cloud bands — gated
    if (FD.NUKE_FX.cloudBands) for (let i = 0; i < 3; i++) {
      const entryT = 0.15 + i * 0.15;
      if (cloudT < entryT) continue;
      const bandAge = Math.min(1, (cloudT - entryT) / 0.35);
      const t01 = i / 2;
      const finalY2 = cY - capR * (0.55 - t01 * 1.0) - 35;
      const startY = cY + capR * 0.5;
      const bandY = startY + (finalY2 - startY) * bandAge + Math.sin(t * (0.4 + i * 0.25) + i * 2.3) * capR * 0.03;
      const widthAtY = capRx * (0.6 + t01 * 0.8) * bandAge;
      const fade2 = (0.7 + t01 * 0.3) * bandAge;
      const pulse = 0.3 + 0.1 * Math.sin(t * (1.2 + i * 0.4) + i * 1.7);
      const bandAlpha = alpha * pulse * fade2;
      ctx.strokeStyle = `hsla(${24 - hShift + i * 3},75%,${Math.max(10, (44 - i * 4) - lDrop)}%,${bandAlpha})`;
      ctx.lineWidth = (4 + t01 * 2) * bandAge;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gx - widthAtY, bandY);
      const sag1 = capR * 0.05 * Math.sin(t * (0.6 + i * 0.3) + i);
      const sag2 = capR * 0.04 * Math.sin(t * (0.5 + i * 0.2) + i + 1.5);
      ctx.quadraticCurveTo(gx - widthAtY * 0.35, bandY + sag1, gx, bandY + sag2);
      ctx.quadraticCurveTo(gx + widthAtY * 0.35, bandY - sag1, gx + widthAtY, bandY);
      ctx.stroke();
    }

    // === DEBRIS PARTICLES ===
    const highStemY = cY + (gy - cY) * 0.30;

    // Mid-stem outward debris — gated, 4 pairs, dead-zone fix, widened column,
    // bigger pvy kick, damping/gravity tuned for higher apex + longer travel
    if (elapsed > 200 && elapsed < 2000 && FD.NUKE_FX.midStem) {
      for (let i = 0; i < 4; i++) {
        if (FD.particles.length >= 300) break;
        const dir = Math.random() < 0.5 ? -1 : 1;
        const px = gx + (Math.random() - 0.5) * 28;  // widened from 15
        const py = highStemY + (Math.random() - 0.5) * 30;
        // 25% go near-straight-up so the middle of the stem isn't a
        // dead zone between left+right fountains.
        const pvx = (Math.random() < 0.25
          ? (Math.random() - 0.5) * 0.06
          : dir * (0.08 + Math.random() * 0.20)
        ) * (FD.NUKE_FX.wideStem ? 1.8 : 1);
        const pvy = -0.85 - Math.random() * 0.75;  // bumped from -0.5-1.0 to -0.85-1.6
        const shortLived = Math.random() < 0.4;
        const plife = shortLived ? (300 + Math.random() * 400) : (800 + Math.random() * 800);
        const pmaxLife = shortLived ? 700 : 1600;
        const isFg = Math.random() < 0.45;
        FD.particles.push({
          x: px, y: py, vx: pvx, vy: pvy,
          life: plife, maxLife: pmaxLife, r: 2 + Math.random() * 1.5,
          hue: 25 + Math.random() * 10, sat: 100, lum: 75,
          damping: 0.9998, gravity: 0.0007, streak: true, hasTrail: true,
          fg: false, switchZ: isFg
        });
        FD.particles.push({
          x: px, y: py, vx: pvx, vy: pvy,
          life: plife, maxLife: pmaxLife, r: 15 + Math.random() * 20,
          hue: 15 + Math.random() * 10, sat: 100, lum: 65,
          damping: 0.9998, gravity: 0.0007, glow: true,
          fg: false, switchZ: isFg
        });
      }
    }

    // Cap-edge debris — earlier start (1200→100 ms), tail extended
    // (4000→4500 ms), rate doubled (0.2→0.42), inner loop 2→3, particles
    // fattened to match stem, tagged with _fadeInMs for gentle appearance.
    if (elapsed > 100 && elapsed < 4500 && Math.random() < 0.42 && FD.particles.length < 300 && FD.NUKE_FX.capEdge) {
      for (let ci = 0; ci < 3; ci++) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const px = gx + dir * capRx * (0.5 + Math.random() * 0.4);
        const py = cY - capR * 0.1 + (Math.random() - 0.5) * capR * 0.3;
        const pvx = dir * (0.25 + Math.random() * 0.4) * (FD.NUKE_FX.wideStem ? 2.0 : 1);
        const pvy = -0.05 - Math.random() * 0.15;
        const plife = 600 + Math.random() * 500;
        const isFg = Math.random() < 0.45;
        FD.particles.push({
          x: px, y: py, vx: pvx, vy: pvy, life: plife,
          maxLife: 1100, _fadeInMs: 1500, _bornAt: performance.now(),
          r: 2 + Math.random() * 1.5,
          hue: 25 + Math.random() * 10, sat: 100, lum: 75,
          damping: 0.9993, gravity: 0.0014, streak: true, hasTrail: true, fg: true
        });
        FD.particles.push({
          x: px, y: py, vx: pvx, vy: pvy, life: plife,
          maxLife: 1100, _fadeInMs: 1500, _bornAt: performance.now(),
          r: 15 + Math.random() * 20,
          hue: 15 + Math.random() * 10, sat: 100, lum: 65,
          damping: 0.9993, gravity: 0.0014, glow: true, fg: true
        });
      }
    }

    // Base fire — gated
    if (elapsed > 800 && elapsed < 4000 && Math.random() < 0.3 && FD.particles.length < 300 && FD.NUKE_FX.baseFire) {
      const bdir = Math.random() < 0.5 ? -1 : 1;
      FD.particles.push({
        x: gx + (Math.random() - 0.5) * stemBaseW * 1.5, y: gy - Math.random() * 10,
        vx: bdir * (0.05 + Math.random() * 0.15), vy: -0.05 - Math.random() * 0.15,
        life: 150 + Math.random() * 100, maxLife: 250, r: 20 + Math.random() * 30,
        hue: 20 + Math.random() * 15, sat: 60, lum: 35, damping: 0.9998, gravity: -0.0003, glow: true, fg: true
      });
    }

    // Ground fires — gated
    if (elapsed > 4000 && elapsed < 12000 && Math.random() < 0.08 && FD.particles.length < 500 && FD.NUKE_FX.groundFires) {
      FD.particles.push({
        x: gx + (Math.random() - 0.5) * W * 0.7, y: gy - 2 - Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.05, vy: -0.02 - Math.random() * 0.04,
        life: 60 + Math.random() * 80, maxLife: 140, r: 3 + Math.random() * 5,
        hue: 25 + Math.random() * 15, sat: 100, lum: 55 + Math.random() * 20,
        damping: 0.999, gravity: -0.0002, glow: true, fg: true
      });
    }

    // Atmospheric ground haze — gated, height 60+90 (bumped from 40+50)
    if (elapsed > 400 && elapsed < 12500 && FD.NUKE_FX.haze) {
      const hazeT = elapsed < 1500 ? (elapsed - 400) / 1100 : elapsed < 9000 ? 1 : 1 - (elapsed - 9000) / 3500;
      const hazeH = 60 + hazeT * 90;
      const hazeA = hazeT * 0.55;
      ctx.save();
      const hg = ctx.createLinearGradient(0, gy - hazeH, 0, gy + 10);
      hg.addColorStop(0, `rgba(200,130,50,0)`);
      hg.addColorStop(0.3, `rgba(180,100,40,${hazeA * 0.2})`);
      hg.addColorStop(0.6, `rgba(160,80,30,${hazeA * 0.5})`);
      hg.addColorStop(1, `rgba(140,60,20,${hazeA})`);
      ctx.fillStyle = hg;
      ctx.fillRect(0, gy - hazeH, W, hazeH + 10);
      ctx.restore();
    }

    // Smoke trail children from streak particles
    FD.particles.forEach(function (p) {
      if (p.streak && p.hasTrail && p.life > 30 && p.life % 40 === 0 && FD.particles.length < 500) {
        FD.particles.push({
          x: p.x + (Math.random() - 0.5) * 3, y: p.y + (Math.random() - 0.5) * 3,
          vx: (Math.random() - 0.5) * 0.03, vy: -0.01 - Math.random() * 0.02,
          life: 80 + Math.random() * 60, maxLife: 140, r: 5 + Math.random() * 8,
          hue: 20, sat: 30, lum: 25, damping: 0.9998, gravity: -0.0003, glow: true,
          fg: p.fg || false
        });
      }
    });

    ctx.globalAlpha = 1;

    // Shake
    if (elapsed < 1200) FD.screenShake = Math.max(FD.screenShake, 50 * (1 - elapsed / 1200));
    else if (elapsed < 4000) FD.screenShake = Math.max(FD.screenShake * 0.94, 0);

    if (elapsed > totalMs) FD.nukeActive = false;
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): rewrite drawNukeCloud with baked lab values + FX_FX gates

Every effect block gated by FD.NUKE_FX.<key>. Lab patches baked in:
  - Cap-edge: start 1200→100 ms, rate 0.2→0.42, loop 2→3, _fadeInMs 1500
  - Mid-stem: loop 2→4, ejecta dead-zone fix, pvy −0.85 to −1.6, wider
    spawn column (15→28), damping/gravity tuned for higher/longer travel
  - Stem particles fattened: r 1+1.5 → 2+1.5, sat 80→100, lum 60→75
  - Cap-edge particles match stem parity
  - Stem core rod now a bezier ribbon that tracks wobble
  - Ground haze: hazeH 40+50 → 60+90
  - God rays: count 8→4, alpha 0.05→0.012, gated off by default

Retires the source-patching block in previews/33-nuke-vfx.html. Tests
manually via lab + tester + game nuke trigger after Task 13."
```

---

## Task 9: Rewrite `FD.drawNukeOverlay` with brighter white-flash + gate

**Files:**
- Modify: `js/effects.js` lines 587–620 (the existing `FD.drawNukeOverlay` function)

- [ ] **Step 1: Replace the overlay function**

Delete lines 587–620 of `js/effects.js` and replace with:

```js
  // --- Nuke overlay: white flash (brighter + longer) + radial warm glow ---
  // White flash gated by FD.NUKE_FX.whiteFlash. Flash window expanded
  // from 0-300 ms (peak 0.95) to 0-650 ms (peak 1.6 clamped at 1). Radial
  // glow rise math unchanged (matches drawNukeCloud).
  FD.drawNukeOverlay = function () {
    if (!FD.nukeActive) return;
    const ctx = FD.ctx;
    const W = FD.W, H = FD.H;
    const elapsed = performance.now() - FD.nukeStart;
    const cloudT = Math.min(1, Math.max(0, elapsed - 100) / 3000);
    const riseEase = 1 - Math.pow(1 - Math.min(1, cloudT * 1.5), 3);
    const slowDriftOv = Math.min(1, elapsed / 11000) * H * 0.07;
    const cloudCenterY = FD.nukeGy - riseEase * (H * 0.45) - slowDriftOv;

    // Blinding white flash — 0-650ms, peak 1.6, clamped
    if (elapsed < 650 && FD.NUKE_FX.whiteFlash) {
      const ft = elapsed / 650;
      ctx.globalAlpha = Math.min(1, (1 - ft * ft * ft) * 1.6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // Warm radial glow (0-7s)
    if (elapsed < 7000) {
      const lt = elapsed / 7000;
      const intensity = (1 - lt * lt) * 0.45;
      const rad = Math.max(W, H) * 1.2;
      const radGrad = ctx.createRadialGradient(FD.nukeGx, cloudCenterY, 0, FD.nukeGx, cloudCenterY, rad);
      radGrad.addColorStop(0, `hsla(35, 100%, 65%, ${intensity})`);
      radGrad.addColorStop(0.3, `hsla(25, 100%, 45%, ${intensity * 0.5})`);
      radGrad.addColorStop(0.7, `hsla(20, 90%, 25%, ${intensity * 0.15})`);
      radGrad.addColorStop(1, 'hsla(15, 80%, 15%, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);
    }
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "const fs = require('fs'); new Function(fs.readFileSync('js/effects.js', 'utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add js/effects.js
git commit -m "feat(nuke-unify): brighter white flash in drawNukeOverlay

Flash window 0-300ms peak 0.95 → 0-650ms peak 1.6 (clamped at 1).
Gated by FD.NUKE_FX.whiteFlash. Radial glow unchanged. Lifted from
previews/33-nuke-vfx.html patchOverlay IIFE."
```

---

## Task 10: Wire orchestrators into `js/tester.js`

**Files:**
- Modify: `js/tester.js` — around the `render()` function near line 743 (calls `FD.drawNukeCloud()`) and line 800 (calls `FD.drawNukeOverlay()`)

- [ ] **Step 1: Insert `FD.tickNuke()` in the update cycle**

Find the `update()` function in `js/tester.js` (runs inside the fixed-timestep loop at `render()`'s tail). Locate the call to `FD.updateParticles()`. Insert `FD.tickNuke();` immediately before it.

If the tester's update function is inline in render (via `update()` call at the bottom), open `js/tester.js` and search for:

```
FD.updateParticles();
```

Insert immediately above it:

```js
      FD.tickNuke();
```

- [ ] **Step 2: Insert `FD.drawBehindNukeCloud()` before `FD.drawNukeCloud()`**

Find this line in `js/tester.js` (around line 744):

```js
    FD.drawNukeCloud();
```

Replace with:

```js
    FD.drawBehindNukeCloud();
    FD.drawNukeCloud();
```

- [ ] **Step 3: Insert `FD.drawInFrontNukeCloud()` before `FD.drawNukeOverlay()`**

Find this line in `js/tester.js` (around line 800):

```js
    FD.drawNukeOverlay();
```

Replace with:

```js
    FD.drawInFrontNukeCloud();
    FD.drawNukeOverlay();
```

- [ ] **Step 4: Verify in browser**

```bash
cd "/Users/tomlinson/Library/Mobile Documents/com~apple~CloudDocs/Projects/VIBE CODING/tomtoolery/.claude/worktrees/romantic-lamport/flappy-drone"
python3 -m http.server 8765 &
open "http://localhost:8765/tester.html"
```

Click **FIRE NUKE** in the Detonate panel. Expect:

- Brighter, longer initial flash (~650 ms instead of 300 ms).
- Denser cap-edge particles starting earlier (should see orange debris coming off the cap rim almost immediately, not ~1.2 s in).
- Fallout particles — small, slow, paired streak + glow pairs drifting downward from the cap, fading in gently over ~2.2 s each.
- Cap arcs — paired particles arcing off the cap rim in three speed tiers.
- Afterglow — lingering screen-blended warm halo behind the cap.
- Trail haze — wide warm fog band behind/around the cap during 1.5–13 s.
- Combo shockwave — refraction snap ~750 ms, then a soft warm pulse bloom up to ~3 s.
- End-of-life flashes — dying streaks pop into small bursts.

Kill server with `kill %1` or `lsof -ti:8765 | xargs kill` when done.

- [ ] **Step 5: Commit**

```bash
git add js/tester.js
git commit -m "feat(nuke-unify): wire FD.tickNuke + draw helpers in tester.js

Tester now receives all new VFX layers automatically. No other behaviour
changes."
```

---

## Task 11: Wire orchestrators into `js/game.js`

**Files:**
- Modify: `js/game.js` — the `render()` function (around line 774, calls `FD.drawNukeCloud()`) and around line 889 (calls `FD.drawNukeOverlay()`). Also `update()` function for the tick.

- [ ] **Step 1: Find the update function**

Open `js/game.js` and search for `FD.updateParticles()` (there should be one call inside the game's fixed-timestep update block). Insert `FD.tickNuke();` immediately above it.

- [ ] **Step 2: Wrap drawNukeCloud**

Find this line in `js/game.js` (around line 774):

```js
    FD.drawNukeCloud();
```

Replace with:

```js
    FD.drawBehindNukeCloud();
    FD.drawNukeCloud();
```

- [ ] **Step 3: Wrap drawNukeOverlay**

Find this line in `js/game.js` (around line 889):

```js
    FD.drawNukeOverlay();
```

Replace with:

```js
    FD.drawInFrontNukeCloud();
    FD.drawNukeOverlay();
```

- [ ] **Step 4: Verify in browser**

```bash
python3 -m http.server 8765 &
open "http://localhost:8765/index.html"
```

Click the version badge (bottom-right of the frame) five times. Expect a full nuke cinematic with all the new layers (same checklist as Task 10 Step 4). Kill server when done.

- [ ] **Step 5: Commit**

```bash
git add js/game.js
git commit -m "feat(nuke-unify): wire FD.tickNuke + draw helpers in game.js

Main game's 5-click easter egg nuke now shows the full unified VFX
stack: combo shockwave, cap arcs, fallout, afterglow, trail haze,
brighter flash, bezier stem core, end-of-life streak flashes."
```

---

## Task 12: Wire orchestrators into `previews/36-city-lab.html`

**Files:**
- Modify: `previews/36-city-lab.html` — the frame loop around lines 1007–1063 (current `FD.drawNukeCloud()` at 1038, `FD.drawNukeOverlay()` at 1062)

- [ ] **Step 1: Insert tickNuke in the frame loop**

Find this block in `previews/36-city-lab.html` (around line 1015):

```js
  const elapsedMs = FD.nukeActive ? Math.min(12000, now - FD.nukeStart) : 0;
  updatePhaseRail(elapsedMs);
```

Immediately above `const elapsedMs = ...`, insert:

```js
  // Tick nuke orchestrator (spawn + update paired arrays)
  FD.tickNuke();
```

- [ ] **Step 2: Wrap drawNukeCloud**

Find this block (around line 1036):

```js
  if (FD.nukeActive) {
    FD.drawNukeCloud();
  }
```

Replace with:

```js
  if (FD.nukeActive) {
    FD.drawBehindNukeCloud();
    FD.drawNukeCloud();
  }
```

- [ ] **Step 3: Wrap drawNukeOverlay**

Find this block (around line 1061):

```js
  if (FD.nukeActive) {
    FD.drawNukeOverlay();
  }
```

Replace with:

```js
  if (FD.nukeActive) {
    FD.drawInFrontNukeCloud();
    FD.drawNukeOverlay();
  }
```

- [ ] **Step 4: Verify in browser**

```bash
python3 -m http.server 8765 &
open "http://localhost:8765/previews/36-city-lab.html"
```

Trigger nuke (look for the detonate button in the Nuke panel). Expect the new layers to appear. Kill server when done.

- [ ] **Step 5: Commit**

```bash
git add previews/36-city-lab.html
git commit -m "feat(nuke-unify): wire FD.tickNuke + draw helpers in 36-city-lab

City Lab inherits the full unified VFX stack while the nuke
state scrubber still works."
```

---

## Task 13: Retire source-patching in `previews/33-nuke-vfx.html`

**Files:**
- Modify: `previews/33-nuke-vfx.html` — four IIFE blocks to delete, `window.FX_LIVE = { ... }` to rebind, plus lab-local layer definitions to remove.

- [ ] **Step 1: Rebind `FX_LIVE` to the canonical config**

Find this block in `previews/33-nuke-vfx.html` (around lines 505–523):

```js
/* ===== FX_LIVE — global toggle state read by patched NOVA ===== */
window.FX_LIVE = {
  // Stage
  whiteFlash: true, godRays: false, haze: true, trailHaze: true, novaShock: false,
  ...
};
```

Replace the whole object literal with a reference to `FD.NUKE_FX`:

```js
/* ===== FX_LIVE alias — now points at the canonical FD.NUKE_FX =====
   Lab UI still writes to FX_LIVE.<key>; those writes land on FD.NUKE_FX
   because it's the same object. */
window.FX_LIVE = FD.NUKE_FX;
```

- [ ] **Step 2: Delete the four source-patch IIFEs**

Delete lines approximately 547–863 of `previews/33-nuke-vfx.html`. These are four IIFEs in order:

1. `(function patchOnce() { ... })();` — ~line 551–738
2. `(function patchOverlay() { ... })();` — ~line 744–757
3. `(function patchDrawParticlesFadeIn() { ... })();` — ~line 765–782
4. `(function patchStreakEndFlash() { ... })();` — ~line 792–863

All four are now baked into `effects.js`. Delete the whole block cleanly — no leftover comments referencing the patches.

- [ ] **Step 3: Delete lab-local layer definitions**

Delete these blocks from `previews/33-nuke-vfx.html` (they're now in effects.js):

- `const FALLOUT = [];` / `const CAP_ARCS = [];` — if defined inline in lab
- `function pairedSpawn(...) { ... }`
- `function updatePaired(...) { ... }`
- `function drawPaired(...) { ... }`
- `function spawnFallout() { ... }`
- `function spawnCapArcs() { ... }`
- `function drawCapAfterglow() { ... }`
- `function drawCapTrailingHaze() { ... }`
- `function drawShockwave() { ... }`
- `function capCenter() { ... }`

Replace any lab-local `FALLOUT` / `CAP_ARCS` references in the lab's frame loop with `FD.FALLOUT` / `FD.CAP_ARCS`.

- [ ] **Step 4: Rewire the lab's `detonate()`**

Find `function detonate() { ... }` in `previews/33-nuke-vfx.html`. Change any references to local arrays to their `FD.*` counterparts:

```js
FD.particles.length = 0;
FD.FALLOUT.length = 0;    // was: FALLOUT.length = 0
FD.CAP_ARCS.length = 0;   // was: CAP_ARCS.length = 0
```

Same for the `scrubInput` input handler if it touches those arrays.

- [ ] **Step 5: Wire orchestrators in the lab's frame loop**

Find the lab's `frame()` function. Locate its existing calls to `FD.drawNukeCloud()` and `FD.drawNukeOverlay()`. Apply the same wrapping pattern:

Before `FD.drawNukeCloud()`:
```js
FD.tickNuke();
FD.drawBehindNukeCloud();
```

After `FD.drawNukeCloud()` and before `FD.drawNukeOverlay()`:
```js
FD.drawInFrontNukeCloud();
```

If the lab was calling `drawFallout()` / `drawCapArcs()` / `drawShockwave()` / `drawCapAfterglow()` / `drawCapTrailingHaze()` / `updatePaired(FALLOUT)` / `updatePaired(CAP_ARCS)` / `spawnFallout()` / `spawnCapArcs()` directly, **delete those calls** — the orchestrator handles them.

- [ ] **Step 6: Verify in browser**

```bash
python3 -m http.server 8765 &
open "http://localhost:8765/previews/33-nuke-vfx.html"
```

Fire the nuke. Expect:

- Visual output identical to the pre-refactor lab state (lab's source-patching produced the same effective function as the now-baked version).
- Every FX_LIVE toggle in the UI still flips the corresponding behaviour live (godRays, whiteFlash, haze, trailHaze, midStem, wideStem, stemCore, capEdge, hotspots, cloudBands, baseFire, groundFires, baseGlow, baseRing, capArcs, afterglow, fallout).
- shockStyle dropdown still switches between nova / harmonic / pulse / refraction / combo / off.
- Scrubber still scrubs nuke time.
- No console errors.

Kill server when done.

- [ ] **Step 7: Commit**

```bash
git add previews/33-nuke-vfx.html
git commit -m "refactor(33-nuke-vfx): retire source-patching — reads FD.NUKE_FX directly

All four patchOnce / patchOverlay / patchDrawParticlesFadeIn /
patchStreakEndFlash IIFEs deleted. Lab-local FALLOUT / CAP_ARCS /
pairedSpawn / updatePaired / drawPaired / spawnFallout / spawnCapArcs /
drawCapAfterglow / drawCapTrailingHaze / drawShockwave / capCenter
removed — all live on FD.* now. Lab UI still writes to FX_LIVE;
FX_LIVE is now an alias for FD.NUKE_FX so writes land on the canonical
config."
```

---

## Task 14: Cross-screen visual smoke test + PR bookkeeping

**Files:** none — this is a verification step.

- [ ] **Step 1: Full visual regression sweep**

```bash
python3 -m http.server 8765 &
```

Open each URL, fire the nuke, and verify the new VFX stack renders correctly. Note anything off:

- `http://localhost:8765/index.html` → click version badge 5 times
- `http://localhost:8765/tester.html` → FIRE NUKE button in Detonate panel
- `http://localhost:8765/previews/33-nuke-vfx.html` → auto-plays; also toggle FX_LIVE checkboxes to verify gating
- `http://localhost:8765/previews/36-city-lab.html` → detonate button in Nuke panel

Kill server when done.

- [ ] **Step 2: Verify commit log is clean**

```bash
git log --oneline claude/romantic-lamport ^master | head -30
```

Expect 13 commits from this PR. No merge commits, no fixups.

- [ ] **Step 3: Update PRD.md architecture table**

Only if needed — check whether the effect tester line still accurately describes what the game has. If not, patch the relevant row.

```bash
grep -n "nuke" flappy-drone/PRD.md | head
```

Leave as-is unless the file is now misleading. Small diffs only.

- [ ] **Step 4: Hand back to cabinet**

Report: "PR 1 Nova Nuke unification complete. 13 commits, 5 files touched (js/effects.js, js/tester.js, js/game.js, previews/33-nuke-vfx.html, previews/36-city-lab.html). Zero functional regressions observed across 4 screens. Ready for PR 2 Widescreen planning."

---

## Self-Review

**Spec coverage check:** Every section of `docs/specs/2026-04-16-unify-design.md` §3 maps to a task:

- §3.1 (what lives where today) — context, no task needed
- §3.2 (target `FD.NUKE_FX` shape) — Task 1 (config) + Task 5 (orchestrators)
- §3.2 new helpers (`pairedSpawn`, `updatePaired`, `drawPaired`) — Task 2
- §3.2 new spawners (`spawnFallout`, `spawnCapArcs`) — Task 3
- §3.2 new renderers (`drawCapAfterglow`, `drawCapTrailingHaze`, `drawShockwave`) — Task 4
- §3.2 modified `drawNukeCloud` — Task 8
- §3.2 modified `drawNukeOverlay` — Task 9
- §3.2 modified `drawParticles` — Task 6
- §3.2 modified `updateParticles` — Task 7
- §3.3 lab retirement — Task 13
- §3.4 tester / game / city-lab wire-up — Tasks 10, 11, 12
- §3.5 defaults — Task 1 (seed) + Task 13 (confirmation via working lab)
- §3.6 acceptance — Task 14

No gaps.

**Placeholder scan:** No TBDs, TODOs, or "fill in details." All code blocks are complete.

**Type consistency:** All function names used across tasks match:
- `FD.NUKE_FX` (not `FD.NukeFx` or `window.FX_LIVE` in new code)
- `FD.FALLOUT`, `FD.CAP_ARCS` (uppercase, on FD)
- `FD.pairedSpawn`, `FD.updatePaired`, `FD.drawPaired`
- `FD.capCenter` (not `capCenter`)
- `FD.spawnFallout`, `FD.spawnCapArcs`
- `FD.drawCapAfterglow`, `FD.drawCapTrailingHaze`, `FD.drawShockwave`
- `FD.tickNuke`
- `FD.drawBehindNukeCloud`, `FD.drawInFrontNukeCloud` (spec §3.2 `drawNukeLayers` superseded — see Task 5 note)

**Ambiguity check:** Two risk points called out explicitly:

1. Spec §3.2 originally specified a single `FD.drawNukeLayers`. Task 5 supersedes it with two helpers; the spec update is inline in the Task 5 note. PR description should mention.
2. Lab's `detonate()` and scrubber references may use lab-local names — Task 13 Step 4 calls this out and provides the find/replace pattern.

Fixed. Moving on.

---

## Execution Handoff

Plan complete and saved to `flappy-drone/docs/plans/2026-04-16-pr1-nova-nuke-unification.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
