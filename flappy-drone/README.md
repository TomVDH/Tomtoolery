# Flappy Drone

A Flappy Bird-inspired browser game featuring a pixel drone navigating through a neon cityscape of skyscrapers.

## How to Play

1. Open `index.html` in any modern browser
2. Click, tap, or press **Space** to start
3. Wait for the "Ready? Set. DRONE!" countdown
4. Navigate the drone through gaps between skyscrapers
5. Each gap cleared scores a point
6. Don't crash into buildings or the ground

## Features

- Pixel-art drone with animated propellers, blinking LED, and cyan thrust particles
- Procedurally generated skyscrapers with lit/unlit windows
- Neon rooftop signs (ZENATECH, IQ NANO, ZD1000, PP-1, IQ SQUARE, ZenaGames)
- Night cityscape with crescent moon, twinkling stars, seamless parallax skyline
- Fireworks after 5 gates cleared (small, medium, and large bursts)
- "Ready? Set. DRONE!" countdown with flickering drone outline
- Dark Souls "YOU DIED" death screen with shadow band
- Blurred score screen with best score tracking
- Responsive touch and keyboard controls

## Effect Tester

Open `tester.html` for an interactive tool to trigger all game effects:
death sequence, explosions, fireworks, neon signs, countdown, and a nuclear explosion with mushroom cloud.

## Preview Labs

Open [`previews/index.html`](previews/index.html) for the full index of design iterations and live labs. Quick jumps to the working labs:

- [**33 · Nuke VFX** — NOVA MK-V Lab](previews/33-nuke-vfx.html) — paired particles, fallout, lingering glow, scene tints
- [**34 · Drone Lab** — Fleet V1](previews/34-drone-lab.html) — OG + MK-I/II/III upgrade picker, scene palettes
- [**35 · Fireworks Lab**](previews/35-fireworks.html) — patterns, hue drift, volley/shower/rainbow/heart, click-to-spawn
- [**36 · City Lab** — Environment Tester](previews/36-city-lab.html) — parallax skyline, sky stack, foreground row + nuke state scrubber

The in-game menu and tester both link out to the lab index via a `LABS` button.

## Tech Stack

- Single self-contained HTML file -- no dependencies, no build step
- Vanilla JavaScript with Canvas 2D rendering
- Refresh-rate independent timing (works on 60Hz and 120Hz+)
- CSS overlay UI with transitions

## Running Locally

Just open the file:

```
open flappy-drone/index.html
```

Or serve it:

```
npx serve flappy-drone
```

## Embedding

Host the file and embed via iframe:

```html
<iframe src="https://your-url/index.html" width="640" height="660" style="border:none; border-radius:14px;"></iframe>
```
