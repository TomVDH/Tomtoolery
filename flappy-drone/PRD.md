# Flappy Drone -- Product Requirements Document

## Overview

Flappy Drone is a casual browser game built as a single HTML file. It reimagines the classic Flappy Bird mechanic with a pixel drone flying through a nighttime cityscape of skyscrapers.

## Purpose

A fun, shareable mini-game for ZenaTech -- suitable for internal team entertainment, event demos, or embedding on landing pages. Zero dependencies means it works anywhere a browser exists.

## Target Audience

- Internal team members
- Event attendees at ZenaTech demos
- Anyone with a browser and a few minutes to kill

## Gameplay Specifications

| Parameter        | Value   |
|------------------|---------|
| Canvas size      | 620x640 |
| Gravity          | 0.22    |
| Flap force       | -5.2    |
| Pipe speed       | 1.6 px/frame |
| Pipe interval    | 160 frames |
| Gap size         | 170 px  |
| Pipe width       | 56 px   |
| Terminal velocity| 8 px/frame |
| Ready countdown  | 4 seconds (real-time) |
| Fireworks trigger| Score >= 5 |

## Controls

| Input           | Action |
|-----------------|--------|
| Space / Arrow Up| Flap   |
| Click / Tap     | Flap   |

## Visual Design

- **Theme**: Neon noir cityscape at night
- **Drone**: Pixel-art quadcopter with animated propellers, blinking red LED, landing skids, cyan thrust particles
- **Obstacles**: Skyscrapers with procedural window lighting (warm yellow tones)
- **Background**: Gradient sky, twinkling stars, crescent moon with glow, seamless parallax distant city silhouette
- **Neon signs**: Rooftop pixel-font signs (ZENATECH, IQ NANO, ZD1000, PP-1, IQ SQUARE, ZenaGames) with flicker
- **Fireworks**: Rocket trails from skyline, burst into colored particles. Small/medium/large varieties.
- **Effects**: Thrust particles (cyan), explosion particles (orange/red/yellow), screen shake on death
- **UI**: Clean HTML overlays with fade transitions, outline mono font title

## Screens

1. **Menu**: Outline mono "FLAPPY DRONE" title (jitters on hover), slogan "Building the drone as we're flying it", copyright "ZenaSoft (c) 1984", version hash
2. **Ready countdown**: "Ready?" -> "Set." -> "DRONE!" with swoosh transitions, drone outline blink tapering from fast to slow over 4 seconds
3. **Gameplay**: Score HUD (top center), scrolling skyscrapers with neon signs, fireworks after 5 gates, version hash
4. **Death - YOU DIED**: Dark Souls inspired -- slow fade-in red text with horizontal shadow band, holds, fades out
5. **Death - Score**: Blurred backdrop overlay, final score, best score, "Tap to retry"

## Effect Tester

A separate `tester.html` provides buttons to trigger all game effects in isolation:
- Death sequence / flash / YOU DIED text
- Explosion and thrust burst particles
- Neon sign spawning (all variants)
- Fireworks (varied sizes)
- Ready? Set. DRONE! countdown
- Nuclear explosion (mushroom cloud behind skyline, shockwave, screen flash)
- Motion toggle and scene reset

## Technical Requirements

- Single `index.html` file, no external dependencies
- Runs in all modern browsers (Chrome, Firefox, Safari, Edge)
- Touch-friendly for mobile play
- Refresh-rate independent timing (real-time based, works on 60Hz and 120Hz+)
- No cookies, no analytics, no network requests

## Future Considerations

- Difficulty ramping (speed increases over time)
- Sound effects and background music
- Leaderboard (local storage or server-backed)
- Power-ups (shield, slow-mo)
- Themed skins for the drone
- Nuclear explosion as cinematic death at high scores
