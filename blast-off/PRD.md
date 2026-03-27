# Blast Off — Powerwash Drone: Product Requirements Document

## Overview

Spinoff #1 from the Flappy Drone game. The company's drones include powerwashing capability — this game turns that into a side-scrolling arcade game where the water jet is both your weapon (cleaning buildings) AND your movement system (recoil thrust).

## Core Concept

**The jet IS your thrust.** There is no flap button. You aim a water jet with your mouse/finger and hold to fire. The recoil pushes the drone in the opposite direction (Newton's third law). Spray down = fly up. Spray left = drift right.

**Every spray is a flight decision.** Cleaning buildings (aiming sideways/up) destabilizes flight. Staying aloft (aiming down) doesn't earn points. Expert players chain spray patterns that clean AND navigate simultaneously.

**The entire game is: Aim. Spray. Don't crash. Chase the high score.**

## Controls

- **Mouse/touch aim**: Jet fires toward cursor position
- **Hold click/touch**: Fires the water jet continuously
- **Release**: Jet stops, drone coasts and falls under gravity
- **Space**: Start game / retry after death

## Physics

- Gravity pulls drone down constantly (0.15 per frame)
- Jet recoil pushes drone opposite to aim direction (0.32 per frame)
- Air damping slows drone (0.985 multiplier)
- Terminal velocity capped at 6 px/frame
- Drone can move in any direction via recoil
- Unlimited water — the fun IS spraying, don't limit it

---

## The Cleaning Loop (Core Gameplay)

### Grime: Neon Slime + Graffiti

Buildings arrive covered in **bright, unmissable grime** — neon-green toxic slime, hot-pink alien graffiti, glowing orange gunk. The colours are deliberately loud against the dark cyberpunk palette. You can't miss what needs cleaning. Each building's grime is a grid of 18x18px cells.

### Instant Cleaning Feedback

The moment a water particle hits a grime cell:
1. Cell vanishes instantly (no fade delay)
2. Sparkle burst at the impact point (gold/white particles floating up)
3. Splash particles spray outward (cyan/blue)
4. The clean building surface is revealed underneath

Each cell cleaned should feel like popping bubble wrap. No delay, no ambiguity.

### Progressive Building Reveal

Grime doesn't just hide the building — it **suppresses** it:
- **0-49% clean**: Building is dark and dull. No lit windows. No neon signs. Dead facade.
- **50-79% clean**: Windows start lighting up. Building begins to glow with life.
- **80-99% clean**: Neon signs flicker on. Full window lighting. Building is coming alive.
- **100% clean (SPOTLESS)**: Building flashes bright. Firework launches. "+10 SPOTLESS!" text pops. The building glows as a beacon of your skill.

You are literally **bringing the city back to life** by cleaning it.

### Per-Building Progress Bar

A thin bar appears above each building showing 0% → 100% clean progress. This appeals to the completionist brain — you'll risk destabilizing your flight to get that last patch.

### Combo System

- Clean patches in rapid succession → multiplier builds (x2, x3, x5...)
- Miss cleaning for ~0.75 seconds → combo resets
- Combo shown in HUD during play
- Best combo tracked in end-of-run stats
- Rewards continuous, skilled spray patterns over cautious bursts

---

## Scoring

- **+1** per grime patch cleaned (base)
- **Combo multiplier** applied to each clean (x2, x3, x5...)
- **+10 bonus** for SPOTLESS building (100% clean)
- **End-of-run stats**: total patches cleaned, spotless count, best combo, buildings encountered
- **Best score** persisted per session (localStorage)

---

## Difficulty Progression

Challenge comes from building layout getting harder, NOT from adding enemies or gimmicks.

| Phase | Score | Scroll Speed | Gap Size | Building Layout | Why It's Harder |
|-------|-------|-------------|----------|-----------------|-----------------|
| **Learning** | 0-15 | 1.5 | 240px | Low, wide buildings from ground only | Easy hover-and-spray. Learn the recoil. |
| **Intermediate** | 15-40 | 2.0 | 200px | Taller buildings, some narrow | Must fly higher (risky). Less drift room. |
| **Advanced** | 40-70 | 2.5 | 175px | Buildings top AND bottom (pipe-style) | Navigate through gaps while spraying both sides. |
| **Expert** | 70+ | 3.0 | 160px | Narrow gaps, dense grime, fast scroll | Pure skill. Every spray is a life-or-death decision. |

### Bonus Buildings

Occasionally a building arrives entirely covered in a single bright colour (gold grime, holographic slime). Worth **3x points** if cleaned to 100%. These are the "treasure" that makes you take risks.

---

## What We Do NOT Add

Simplicity is the design. Actively resist feature creep:

- **No power-ups** — the jet is all you need
- **No enemies** — buildings ARE the challenge
- **No fuel/water limit** — unlimited spray, always
- **No lives system** — one crash, done. Clean tension.
- **No level select** — endless run, score is the only progression
- **No shop/upgrades** — play skill only

---

## Visual Design

### Aesthetic

Cyberpunk noir at night — matching Flappy Drone. Dark blue sky, neon signs, lit windows, parallax city skyline. The grime provides the colour contrast.

### Grime Palette

Grime colours are procedural per building, drawn from a bright neon palette:
- Toxic green: `hsl(120, 80%, 50%)`
- Hot pink: `hsl(330, 80%, 55%)`
- Alien orange: `hsl(30, 90%, 55%)`
- Acid yellow: `hsl(60, 85%, 50%)`
- Electric purple: `hsl(280, 70%, 55%)`

Each building gets a primary grime colour with slight per-cell variation.

### Water Jet

- Cyan/blue streak particles from drone nozzle toward aim point
- Nozzle rotates to track aim direction (visible on drone model)
- Splash particles on surface impact
- Sparkle/shimmer when grime is removed

### Grime Preview

Like Flappy Drone's gap danger markers: a subtle preview at the right screen edge showing the grime pattern on the next incoming building. Lets skilled players plan their approach angle.

### HUD

- **Score**: Top center, large
- **Combo**: Below score, shows "x3" etc., fades when inactive
- **Building progress**: Thin bar above each building (per-building, not HUD)

### Death

- Crash into building, ground, or ceiling = death
- Dark Souls-style "YOU DIED" text with red flash (same as Flappy Drone)
- Score screen: patches cleaned, spotless count, best combo, best score

### Drones

5 drone types ported from Flappy Drone, each with powerwash nozzle:
- Pixel Quad (default)
- Shadow Blade (stealth)
- Iron Mule (heavy lift)
- Pink Streak (racer)
- Sky Osprey (tiltrotor)

---

## Technical Specs

- Canvas: 620x640px
- Engine: Vanilla JS + Canvas 2D API, zero dependencies
- Fixed 60fps timestep (refresh-rate independent)
- Static file deployment (no build step)
- Architecture mirrors Flappy Drone: modular JS files on global `BO` namespace

---

## Implementation Status

### v0.1 (Current) — Proof of Concept

**Working:**
- [x] Menu screen with drone picker and slogans
- [x] Cyberpunk city background (sky, moon, stars, clouds, parallax far-city)
- [x] Drone rendering with powerwash nozzle attachment
- [x] Water jet particle system with recoil physics (the core mechanic)
- [x] Side-scrolling with procedural buildings
- [x] Building collision detection (crash = death)
- [x] Ground/ceiling boundary collision
- [x] Death sequence ("YOU DIED" + score screen)
- [x] Ready countdown (Ready? Set. SPRAY!)
- [x] Crosshair aim indicator
- [x] Full game state loop: menu → fade → ready → play → die → score → retry

**Needs work for v0.2:**
- [ ] Neon grime visuals (bright, unmissable, per-building colour)
- [ ] Water → grime collision tuning (clean on contact)
- [ ] Progressive building reveal (dark → lit → alive)
- [ ] Per-building progress bar
- [ ] SPOTLESS celebration (flash, firework, text pop)
- [ ] Combo system with visual feedback
- [ ] Top-attached buildings (pipe-style layout at higher scores)
- [ ] Bonus buildings (gold/holographic, 3x points)
- [ ] Grime preview at screen edge
- [ ] End-of-run stats on score screen
- [ ] Difficulty tuning pass

**Stretch (v0.3+):**
- [ ] Sound effects (jet, splash, shimmer, crash, SPOTLESS fanfare)
- [ ] Mobile touch UX polish
- [ ] Analytics webhook (same pipeline as Flappy Drone)
- [ ] Additional drone types

---

## File Structure

```
blast-off/
├── index.html          # Entry point
├── PRD.md              # This file
├── README.md           # Quick start guide
├── css/
│   └── game.css        # Styling
└── js/
    ├── config.js       # BO namespace, constants, shared state
    ├── background.js   # Sky, stars, moon, clouds, far city parallax
    ├── buildings.js    # Building renderer + grime system
    ├── drones.js       # 5 drone renderers with powerwash nozzle
    ├── effects.js      # Water particles, splash, shimmer, explosions, fireworks
    ├── ui.js           # Menu, death sequence, ready countdown
    └── game.js         # Game loop, jet physics, grime collision, state machine
```

## Relationship to Flappy Drone

Blast Off shares ~70% of its codebase with Flappy Drone:
- **Direct port**: background.js, building renderer, particle system, death sequence, pixel font
- **Adapted**: drone renderers (added nozzle), effects (added water particles), game loop (jet physics replaces flap)
- **New**: grime system, neon grime visuals, aim/crosshair, combo scoring, recoil physics, progressive reveal
