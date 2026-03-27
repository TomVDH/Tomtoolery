# Flappy Drone -- Product Requirements Document

## Overview

Flappy Drone is a casual browser game built with modular JS files. It reimagines the classic Flappy Bird mechanic with a selectable pixel drone flying through a nighttime cyberpunk cityscape of skyscrapers.

## Purpose

A fun, shareable mini-game for ZenaTech -- suitable for internal team entertainment, event demos, or embedding on landing pages. Zero dependencies means it works anywhere a browser exists.

## Target Audience

- Internal team members
- Event attendees at ZenaTech demos
- Anyone with a browser and a few minutes to kill

## Live URL

https://tomvdh.github.io/Tomtoolery/flappy-drone/index.html

## Gameplay Specifications

| Parameter        | Value   |
|------------------|---------|
| Canvas size      | 620x640 |
| Gravity          | 0.22    |
| Flap force       | -5.2    |
| Pipe speed       | 2.1 px/frame |
| Pipe interval    | 160 frames |
| Gap size         | 170 px  |
| Pipe width       | 56 px   |
| Terminal velocity| 8 px/frame |
| Ready countdown  | 4 seconds (real-time) |
| Fireworks trigger| Score >= 5 |
| Fixed timestep   | 60fps (frame-rate independent) |

## Controls

| Input           | Action |
|-----------------|--------|
| Space / Arrow Up| Flap   |
| Click / Tap     | Flap   |
| Left/Right arrows | Browse drones (menu) |
| Click drone name | Cycle drone (menu) |

## Architecture

The game has been modularised from a single HTML file into:

| File | Purpose |
|------|---------|
| `index.html` | Shell, screens, script loading |
| `css/game.css` | All styling |
| `js/config.js` | Constants, namespace (`FD`), shared state |
| `js/background.js` | Sky, stars, moon, clouds, parallax far city |
| `js/buildings.js` | Pipe buildings, neon signs, windows, street |
| `js/drones.js` | All 13 drone renderers + silhouettes |
| `js/effects.js` | Nuke, explosion, fireworks, thrust, particles |
| `js/ui.js` | Screens, countdown, death sequence |
| `js/game.js` | Game loop, state machine, drone picker |
| `tester.html` | Effect tester with isolated triggers |

## Drone Fleet (13 selectable)

| ID | Name | Style |
|----|------|-------|
| quad | PIXEL QUAD | Classic quadcopter (default) |
| stealth | SHADOW BLADE | Angular stealth wing |
| heavy | IRON MULE | Industrial heavy-lift with coaxial rotors |
| racer | PINK STREAK | Compact racing drone |
| osprey | SKY OSPREY | Tiltrotor VTOL |
| dragonfly | NEON BUG | Insect-like, long tail |
| disc | FLYING SAUCER | UFO disc shape |
| spider | ARACHNID HEX | Hexagonal spider drone |
| jetwing | SKYKNIFE | Swept delta wing jet with VTOL |
| balloon | FLOATER | Balloon with gondola, bobbing |
| paperplane | ORIGAMI | Paper plane with trailing sparkles |
| chopper | CHOPPER | Traditional helicopter |
| gyro | WHIRLYBIRD | Autogyro with overhead rotor |

All drones have:
- Animated propellers/rotors
- Blinking nav lights
- Nuke silhouette shapes for backlight effect
- Consistent hitbox regardless of visual

## Visual Design

- **Theme**: Neon noir cyberpunk cityscape at night
- **Drone**: 13 selectable designs, all with animated props and blinkers
- **Obstacles**: Skyscrapers with procedural window lighting (max 3 vertically stacked lit windows per column), neon rooftop signs
- **Background**: Gradient sky, twinkling stars, crescent moon with glow, wispy clouds, seamless parallax far city with layered depth
- **Street**: Road with kerb lights, dashed lane markings, parallax-synced to pipe speed
- **Neon signs**: Pixel-font brands (ZENATECH, SKYNET, DRONE CO, APEX, VOLT, NIMBUS, HOVER, NEXUS, ORBITAL, PULSE, HELIX, SPECTRA) with random neon colours and glow
- **Fireworks**: Willow cascade style -- rocket trails, burst with drooping tails, golden/amber palette, bright flash on burst
- **Effects**: Thrust particles with blue-white glow pulse, shrapnel spray explosion, screen shake on death
- **UI**: Clean HTML overlays with fade transitions, random title/slogan rotation

## Title Variants (random on load)

| Title | Slogan |
|-------|--------|
| FLAPPY DRONE | Building the drone as we're flying it |
| ROTORHEAD | fly. crash. repeat. |
| SKY RAT | the city is your obstacle course |
| PROP DROP | don't look down |
| HOVER BOTHER | an irritating flying game |
| BUZZED | a drone thing |

## Screens

1. **Menu**: Random title from pool, slogan, drone picker with arrows, "Tap or press Space", copyright below viewport
2. **Ready countdown**: "Ready?" -> "Set." -> "DRONE!" with swoosh transitions
3. **Gameplay**: Score HUD (top center), scrolling cityscape, fireworks after 5 gates
4. **Death - YOU DIED**: Dark Souls inspired -- slow fade-in red text, holds, fades out
5. **Death - Score**: Final score, best score, "Tap to retry"

## Nuclear Easter Egg

Triggered by clicking the version badge 5 times. Full 11-second cinematic:

| Time | Event |
|------|-------|
| 0ms | Screen shake begins (25px amplitude) |
| 0-300ms | Blinding white flash |
| 100ms | Mushroom cloud rises from behind skyline |
| 200-2000ms | Shockwave ring expands |
| 600ms | Ember particle shower begins |
| 1500-2200ms | Shockwave "hits viewer" -- shake burst |
| 2000-4500ms | Cloud darkens orange → crimson → near-black |
| 0-5000ms | Radiant glow overlay, sky brightens, cloud undersides lit |
| 5000ms | Glow fades |
| 6500-8000ms | Cloud fades to transparent |
| 8000-11000ms | Sky returns to normal |

Features: building rim lighting (game + far city), drone silhouette backlit, concentric cloud bands (3 wavy lines across cap), ground debris cloud, sky colour shift, base glow.

Drone survives longer during nuke to enjoy the spectacle.

## Effect Tester

`tester.html` provides buttons to trigger all game effects in isolation:
- Death sequence / flash / YOU DIED text
- Explosion with shrapnel spray
- Thrust burst with blue glow
- Neon sign spawning (all variants)
- Fireworks (willow cascade)
- Ready? Set. DRONE! countdown
- Nuclear explosion (full 11s sequence)
- All 13 drone previews
- Motion toggle and scene reset

## Visual Previews

19 preview pages in `previews/` with an `index.html` linking them all:

| # | Content |
|---|---------|
| 01-03 | Drone design iterations (waves 1-2) |
| 04-05 | Street, sky, moon, combined showcase |
| 06-07 | Building signs iterations |
| 08-10 | Nuke variations, thermonuclear, fireworks |
| 11 | Combined effects showcase |
| 12 | Logo/title iterations |
| 13-14 | Drone waves 3-4 |
| 15 | Nuke styles static (Tsar Bomba, Tactical, Neutron Star) |
| 16 | Sign designs v3 (12 brands, 4 mount styles) |
| 17 | Effects & particles (explosion, thrust, willow, classic burst) |
| 18 | Nuke variations animated (11s loops) |
| 19 | Tsar Bomba full-fidelity prototype (620x640) |

## Technical Requirements

- Modular JS (7 files), single CSS file
- Runs in all modern browsers (Chrome, Firefox, Safari, Edge)
- Touch-friendly for mobile play
- Fixed 60fps timestep (works correctly on 60Hz, 120Hz, 144Hz+ displays)
- Performance mode compatible
- No cookies, no analytics, no network requests
- GitHub Pages deployment from `master` branch

## Future Considerations / Backlog

- **Difficulty ramping**: Speed, gap size, and pipe interval should scale with score (proposed: tutorial 0-5, ramping 6-50, insane 51+)
- **Tsar Bomba nuke variant**: Full-fidelity prototype built (preview 19), ready to integrate as alternate explosion style
- **Neutron Star nuke variant**: Sci-fi energy burst concept prototyped
- **Floating pickup items**:
  - **Nuke pickup**: Collecting it arms the drone — next building collision triggers nuke, razes buildings, you survive
  - **Shield pickup**: Temporary invulnerability, smash through buildings
- **More drones**: Blimp (ZEPHYR), Mantis, Tandem (WARHORSE), Gyro concepts in preview 14
- **UFOs / enemy drones**: Visual distractions at higher difficulty
- **Sound effects and background music**
- **Leaderboard** (local storage or server-backed)
- **Sign mount variety**: Rooftop, vertical side-mount, window-integrated, hanging bracket (prototyped in preview 16)
