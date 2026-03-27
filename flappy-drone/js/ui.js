// ui.js — UI overlays: screen show/hide, death sequence, ready countdown
(function () {
  const FD = window.FD;

  // --- Screen show/hide ---
  FD.showScreen = function (el) {
    el.classList.add('show');
  };

  FD.hideScreen = function (el) {
    el.classList.remove('show');
  };

  // --- Dark Souls "YOU DIED" (canvas-rendered) ---
  FD.drawDeathSequence = function (state, deathTimer) {
    if (state !== 'dying') return;

    const ctx = FD.ctx;
    const W = FD.W;
    const H = FD.H;
    const t = deathTimer;

    // Phase 1: Red flash (first few frames)
    if (t < FD.DEATH_FLASH_DUR) {
      const flashT = 1 - (t / FD.DEATH_FLASH_DUR);
      ctx.globalAlpha = flashT * 0.4;
      ctx.fillStyle = '#cc1100';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // Phase 2+3+4: "YOU DIED" text with horizontal shadow band
    const textStart = FD.DEATH_FLASH_DUR;
    const textT = t - textStart;

    if (textT >= 0) {
      // Calculate text opacity: fade in -> hold -> fade out
      let textAlpha = 0;
      if (textT < FD.DIED_FADE_IN) {
        // Slow fade in
        textAlpha = textT / FD.DIED_FADE_IN;
        textAlpha = textAlpha * textAlpha; // ease-in curve
      } else if (textT < FD.DIED_FADE_IN + FD.DIED_HOLD) {
        textAlpha = 1;
      } else if (textT < FD.DIED_FADE_IN + FD.DIED_HOLD + FD.DIED_FADE_OUT) {
        const fadeT = (textT - FD.DIED_FADE_IN - FD.DIED_HOLD) / FD.DIED_FADE_OUT;
        textAlpha = 1 - fadeT;
      }

      if (textAlpha > 0.01) {
        // Horizontal shadow band (blurred dark bar across screen center)
        const bandH = 80;
        const bandY = H / 2 - bandH / 2;
        const bandGrad = ctx.createLinearGradient(0, bandY - 20, 0, bandY + bandH + 20);
        bandGrad.addColorStop(0, 'rgba(0,0,0,0)');
        bandGrad.addColorStop(0.15, `rgba(0,0,0,${textAlpha * 0.6})`);
        bandGrad.addColorStop(0.5, `rgba(0,0,0,${textAlpha * 0.75})`);
        bandGrad.addColorStop(0.85, `rgba(0,0,0,${textAlpha * 0.6})`);
        bandGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bandGrad;
        ctx.fillRect(0, bandY - 20, W, bandH + 40);

        // Death text (dynamic — "YOU DIED" or "YOU ENDED THE WORLD" etc)
        const deathMsg = FD.deathText || 'YOU DIED';
        const fontSize = deathMsg.length > 12 ? 32 : 48;
        ctx.globalAlpha = textAlpha;
        ctx.font = `700 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Red glow layers
        ctx.shadowColor = '#cc220088';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#bb2200';
        ctx.fillText(deathMsg, W / 2, H / 2);

        ctx.shadowBlur = 20;
        ctx.fillStyle = '#cc2200';
        ctx.fillText(deathMsg, W / 2, H / 2);

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.globalAlpha = 1;
      }
    }
  };

  // --- Ready countdown overlay ---
  FD.drawReadySequence = function (readyT, state) {
    if (state !== 'ready') return;

    const ctx = FD.ctx;
    const W = FD.W;
    const H = FD.H;
    const t = readyT; // 0 -> 1 over exactly 4 seconds
    const elapsed = performance.now() - FD.readyStartTime;

    // Draw drone (uses active type)
    const droneType = FD.activeDroneType || 'quad';
    FD.drawDrone(FD.drone.x, FD.drone.y, FD.drone.angle, FD.drone.propPhase, droneType);

    // Blinking glow pulse around drone
    // Blink frequency: starts fast (~15Hz), tapers to slow (~2Hz), then fades out
    const blinkHz = 15 - t * t * 13;
    const blinkPhase = Math.sin(elapsed * blinkHz * 0.00628);
    const blinkOn = blinkPhase > 0;

    if (blinkOn || t > 0.9) {
      ctx.save();
      ctx.translate(FD.drone.x, FD.drone.y);
      ctx.rotate(FD.drone.angle);
      ctx.scale(1.15, 1.15); // match drone scale

      const outlineAlpha = t > 0.9 ? Math.max(0, 1 - (t - 0.9) / 0.1) : 0.85;

      // Glow halo — works for any drone shape
      const glowGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 28);
      glowGrad.addColorStop(0, `rgba(0, 212, 255, ${outlineAlpha * 0.15})`);
      glowGrad.addColorStop(0.6, `rgba(0, 212, 255, ${outlineAlpha * 0.05})`);
      glowGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();

      // Draw a cyan wireframe outline around the drone (path-based so stroke works)
      // Uses a generic drone silhouette shape that works for all types.
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = outlineAlpha;
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-15, -5); ctx.lineTo(-4, -5); ctx.lineTo(-4, -8);
      ctx.lineTo(4, -8); ctx.lineTo(4, -5); ctx.lineTo(15, -5);
      ctx.lineTo(19, -2); ctx.lineTo(19, 3); ctx.lineTo(15, 3);
      ctx.lineTo(10, 5); ctx.lineTo(10, 9); ctx.lineTo(-10, 9);
      ctx.lineTo(-10, 5); ctx.lineTo(-15, 3); ctx.lineTo(-19, 3);
      ctx.lineTo(-19, -2); ctx.closePath();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Text: Ready? (0-38%) -> Set. (38-75%) -> DRONE! (75-100%)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textY = H / 2 - 70;

    if (t < 0.38) {
      // "Ready?" -- swoosh in from left, hold, swoosh out right
      const phase = t / 0.38;
      let alpha, offsetX;
      if (phase < 0.15) {
        const p = phase / 0.15;
        alpha = p * 0.8; offsetX = (1 - p) * -40;
      } else if (phase > 0.85) {
        const p = (phase - 0.85) / 0.15;
        alpha = (1 - p) * 0.8; offsetX = p * 40;
      } else {
        alpha = 0.8; offsetX = 0;
      }
      ctx.globalAlpha = alpha;
      ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#667';
      ctx.fillText('Ready?', W / 2 + offsetX, textY);

    } else if (t < 0.75) {
      // "Set." -- swoosh in, hold, swoosh out
      const phase = (t - 0.38) / 0.37;
      let alpha, offsetX;
      if (phase < 0.12) {
        const p = phase / 0.12;
        alpha = p * 0.85; offsetX = (1 - p) * -35;
      } else if (phase > 0.88) {
        const p = (phase - 0.88) / 0.12;
        alpha = (1 - p) * 0.85; offsetX = p * 35;
      } else {
        alpha = 0.85; offsetX = 0;
      }
      ctx.globalAlpha = alpha;
      ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#778';
      ctx.fillText('Set.', W / 2 + offsetX, textY);

    } else {
      // "DRONE!" — milestone-style slam in, hold with breathe, scale-revert out
      const phase = (t - 0.75) / 0.25;

      let droneScale, droneAlpha;

      if (phase < 0.15) {
        // Slam in: scale 2.0→1.0 with overshoot (like milestone)
        const p = phase / 0.15;
        const ease = p < 0.7 ? p / 0.7 : 1 + (1 - (p - 0.7) / 0.3) * 0.15;
        droneScale = 2.0 - ease * 1.0;
        droneAlpha = Math.min(1, p * 2);

        // Particle burst on first frame
        if (phase < 0.02) {
          for (let pi = 0; pi < 14; pi++) {
            const a = (pi / 14) * Math.PI * 2 + Math.random() * 0.3;
            const spd = 1.5 + Math.random() * 2.5;
            FD.particles.push({
              x: W / 2 + Math.cos(a) * 25,
              y: textY + Math.sin(a) * 18,
              vx: Math.cos(a) * spd,
              vy: Math.sin(a) * spd - 0.5,
              life: 25 + Math.random() * 20, maxLife: 45,
              r: 1.5 + Math.random() * 2,
              hue: 190 + Math.random() * 20, sat: 100, lum: 70,
              glow: true
            });
          }
        }
      } else if (phase < 0.7) {
        // Hold with gentle breathe
        droneScale = 1.0 + Math.sin((phase - 0.15) * 12) * 0.02;
        droneAlpha = 1;
      } else {
        // Revert out: scale back up to 2.0, fade to 0
        const revertT = (phase - 0.7) / 0.3;
        const easeOut = revertT * revertT; // ease-in for snappy exit
        droneScale = 1.0 + easeOut * 1.2;
        droneAlpha = Math.max(0, 1 - easeOut * 1.5);
      }

      ctx.save();
      ctx.translate(W / 2, textY);
      ctx.scale(droneScale, droneScale);
      ctx.globalAlpha = droneAlpha;
      ctx.font = '700 42px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#00d4ff';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 30;
      ctx.fillText('DRONE!', 0, 0);
      ctx.shadowBlur = 12;
      ctx.fillText('DRONE!', 0, 0);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };
})();
