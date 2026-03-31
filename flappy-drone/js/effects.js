// effects.js — Flappy Drone particles, fireworks, nuke, pickups, vignette
// All functions attach to window.FD namespace.
// Uses: FD.ctx, FD.globalTick, FD.W, FD.H, FD.GROUND_H,
//       FD.particles, FD.fireworks, FD.pickups,
//       FD.nukeActive, FD.nukeStart, FD.nukeGx, FD.nukeGy, FD.screenShake

(function () {
  const FD = window.FD || (window.FD = {});

  // --- Thrust particles ---
  FD.spawnThrust = function (droneX, droneY) {
    // Hot exhaust particles
    for (let i = 0; i < 8; i++) {
      FD.particles.push({
        x: droneX + (Math.random() - 0.5) * 8,
        y: droneY + 8 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 3 + 1,
        life: 10 + Math.random() * 8, maxLife: 18,
        r: Math.random() * 2 + 0.6,
        hue: 15 + Math.random() * 25, sat: 100, lum: 55 + Math.random() * 20
      });
    }
    // Bright blue spark flash — beneath the drone at thruster position
    FD.particles.push({
      x: droneX, y: droneY + 14,
      vx: 0, vy: 0.5,
      life: 8, maxLife: 8,
      r: 30,
      hue: 200, sat: 100, lum: 95,
      glow: true
    });
    // Inner white-blue core
    FD.particles.push({
      x: droneX, y: droneY + 14,
      vx: 0, vy: 0.3,
      life: 5, maxLife: 5,
      r: 12,
      hue: 210, sat: 80, lum: 98,
      glow: true
    });
    // Tiny white-hot glow
    FD.particles.push({
      x: droneX, y: droneY + 10,
      vx: 0, vy: 1,
      life: 4, maxLife: 4,
      r: 10,
      hue: 40, sat: 100, lum: 95,
      glow: true
    });
    // Larger warm glow
    FD.particles.push({
      x: droneX, y: droneY + 10,
      vx: 0, vy: 0.5,
      life: 8, maxLife: 8,
      r: 18,
      hue: 20, sat: 100, lum: 75,
      glow: true
    });
  };

  // --- Explosion ---
  FD.spawnExplosion = function (x, y) {
    // Shrapnel spray — 24 fast streak particles
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 7 + Math.random() * 3;
      FD.particles.push({
        x: x + (Math.random() - 0.5) * 4, y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        life: 18 + Math.random() * 12, maxLife: 30,
        r: 1 + Math.random() * 2,
        hue: 15 + Math.random() * 30, sat: 100, lum: 55,
        damping: 0.96,
        streak: true
      });
    }
    // Bright glow flash
    FD.particles.push({
      x, y,
      vx: 0, vy: 0,
      life: 5, maxLife: 5,
      r: 35,
      hue: 30, sat: 100, lum: 97,
      glow: true
    });

    // 2-3 scattered offshoots — smaller secondary explosions nearby
    const offshootCount = 2 + Math.round(Math.random());
    for (let o = 0; o < offshootCount; o++) {
      const ox = x + (Math.random() - 0.5) * 60;
      const oy = y + (Math.random() - 0.5) * 40;
      const delay = 4 + Math.round(Math.random() * 8); // stagger slightly

      // Mini shrapnel burst (8 streaks each)
      for (let j = 0; j < 8; j++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 4 + Math.random() * 2;
        FD.particles.push({
          x: ox + (Math.random() - 0.5) * 3, y: oy + (Math.random() - 0.5) * 3,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          life: delay + 10 + Math.random() * 8, maxLife: delay + 18,
          r: 0.8 + Math.random() * 1.5,
          hue: 20 + Math.random() * 25, sat: 100, lum: 60,
          damping: 0.95,
          streak: true
        });
      }
      // Mini glow flash
      FD.particles.push({
        x: ox, y: oy,
        vx: 0, vy: 0,
        life: delay + 4, maxLife: delay + 4,
        r: 18,
        hue: 35, sat: 100, lum: 95,
        glow: true
      });
    }
  };

  // --- Draw particles (enhanced: trails, colour-cooling, additive blending) ---
  FD.drawParticles = function () {
    const ctx = FD.ctx;
    FD.particles.forEach(p => {
      const t = p.life / p.maxLife;

      // Trail rendering (if particle has trail history)
      if (p.hasTrail && p.trailList && p.trailList.length > 1) {
        const age = p.maxLife - p.life;
        const trailAlpha = age < 90 ? (age / 90) * 0.5 : t * 0.5;
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
        // Additive blending for hot glow particles (lum > 70)
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
        // Colour-cooling: bright → deep red → dark grey as particle ages
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
  };

  // --- Update particles (enhanced: trail tracking, ground clamp) ---
  FD.updateParticles = function () {
    var groundY = FD.H - FD.GROUND_H;
    FD.particles.forEach(p => {
      // Trail history
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
  };

  // --- Fireworks update (does NOT auto-spawn; callers handle that) ---
  FD.updateFireworks = function () {
    FD.fireworks.forEach(fw => {
      if (!fw.exploded) {
        fw.y += fw.vy;
        fw.trail.push({ x: fw.x + (Math.random() - 0.5) * 2, y: fw.y });
        if (fw.trail.length > 12) fw.trail.shift();
        if (fw.y <= fw.targetY) {
          fw.exploded = true;
          // Willow cascade — particles droop with heavier gravity, streak trails
          const burstHues = [fw.hue, (fw.hue + 30) % 360, (fw.hue + 60) % 360];
          const count = [24, 40, 65][fw.size || 0];
          const spdMul = [0.9, 1.2, 1.8][fw.size || 0];
          const rMul = [1, 1.3, 2.0][fw.size || 0];
          const lifeMul = [1.5, 2.0, 2.8][fw.size || 0];
          for (let i = 0; i < count; i++) {
            const a = (Math.PI * 2 / count) * i + Math.random() * 0.35;
            const spd = (Math.random() * 2.5 + 1) * spdMul;
            FD.particles.push({
              x: fw.x, y: fw.y,
              vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 0.3,
              life: (35 + Math.random() * 30) * lifeMul, maxLife: 65 * lifeMul,
              r: (Math.random() * 2 + 1) * rMul,
              hue: burstHues[i % burstHues.length], sat: 100, lum: 55,
              damping: 0.97, gravity: 0.04,
              streak: true
            });
          }
          // Soft warm glow flash
          FD.particles.push({
            x: fw.x, y: fw.y,
            vx: 0, vy: 0,
            life: 10, maxLife: 10,
            r: 40 + (fw.size || 0) * 20,
            hue: fw.hue, sat: 80, lum: 85,
            glow: true
          });
        }
      }
    });
    FD.fireworks = FD.fireworks.filter(fw => !fw.exploded);
  };

  // --- Draw fireworks ---
  FD.drawFireworks = function () {
    const ctx = FD.ctx;
    FD.fireworks.forEach(fw => {
      if (fw.exploded) return;
      // Trail
      fw.trail.forEach((pt, i) => {
        ctx.globalAlpha = (i / fw.trail.length) * 0.6;
        ctx.fillStyle = `hsl(${fw.hue}, 80%, 70%)`;
        ctx.fillRect(pt.x, pt.y, 2, 2);
      });
      // Head
      ctx.globalAlpha = 1;
      ctx.fillStyle = `hsl(${fw.hue}, 90%, 85%)`;
      ctx.fillRect(fw.x - 1, fw.y - 1, 3, 3);
      ctx.globalAlpha = 1;
    });
  };

  // --- Nuke mushroom cloud: NOVA MK-V (11s timeline) ---
  // Turbulent noisy cap, hourglass stem, blue-white core, differential darkening,
  // outward-arcing debris with trails, building dust kick-up, ground fires,
  // atmospheric haze, additive blending. Drawn behind city layer.
  FD.drawNukeCloud = function () {
    if (!FD.nukeActive) return;
    const ctx = FD.ctx;
    const W = FD.W, H = FD.H;
    const elapsed = performance.now() - FD.nukeStart;
    const totalMs = 11000;
    const gx = FD.nukeGx, gy = FD.nukeGy;
    const t = elapsed / 1000;

    if (elapsed < 100) { if (elapsed > totalMs) FD.nukeActive = false; return; }

    const cloudT = Math.min(1, (elapsed - 100) / 5800);
    const fadeT  = elapsed > 9500 ? Math.min(1, (elapsed - 9500) / 1500) : 0;
    const darkT  = elapsed > 3500 ? Math.min(1, (elapsed - 3500) / 4000) : 0;
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

    // Noisy ellipse helper — turbulent organic cap boundary
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

    // Thermal god rays (0-2.5s)
    if (elapsed < 2500) {
      const rayAlpha = (1 - (elapsed / 2500) ** 2) * 0.05;
      ctx.save();
      ctx.globalAlpha = rayAlpha;
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI + Math.PI;
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

    // Shockwave + ground dust band
    if (elapsed > 200 && elapsed < 2800) {
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

    // Stem core glow line
    const coreGlowA = alpha * Math.max(0, 0.5 - darkT * 0.4);
    if (coreGlowA > 0.01) {
      const cg = ctx.createLinearGradient(gx, cY + capR * 0.3, gx, gy);
      cg.addColorStop(0, `hsla(40,100%,${Math.max(20, 65 - lDrop)}%,${coreGlowA})`);
      cg.addColorStop(1, `hsla(25,100%,${Math.max(10, 40 - lDrop)}%,${coreGlowA * 0.2})`);
      ctx.fillStyle = cg;
      ctx.fillRect(gx - stemTopW * 0.075, cY + capR * 0.3, stemTopW * 0.15, gy - cY - capR * 0.3);
    }

    // Base glow
    const bgR = capRx * 2.2;
    const bgA = alpha * Math.max(0, 1 - (elapsed / 2000));
    const bg = ctx.createRadialGradient(gx, gy, 0, gx, gy, bgR);
    bg.addColorStop(0, `hsla(40,100%,80%,${bgA})`);
    bg.addColorStop(0.15, `hsla(30,100%,60%,${bgA * 0.5})`);
    bg.addColorStop(0.4, `hsla(20,100%,40%,${bgA * 0.1})`);
    bg.addColorStop(1, 'hsla(15,100%,20%,0)');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(gx, gy, bgR, 0, Math.PI * 2); ctx.fill();

    // Sub-cloud at stem-cap intersection
    ctx.fillStyle = `hsla(${18 - hShift},85%,${Math.max(8, 35 - lDrop)}%,${alpha})`;
    drawNoisyEllipse(gx, cY + capR * 0.25, capRx * 0.75, capR * 0.4, 10, false);

    // Differential darkening — outer layers darken faster
    const outerDark = Math.min(1, darkT * 1.4);
    const midDark   = darkT;
    const innerDark = Math.min(1, darkT * 0.6);
    const coreDark  = Math.min(1, darkT * 0.35);
    const outerHShift = outerDark * 22;
    const outerLDrop  = outerDark * 40;

    // 4 plasma cap layers with noisy edges
    ctx.fillStyle = `hsla(${8 - outerHShift},${90 - outerDark * 30}%,${Math.max(4, 22 - outerLDrop)}%,${alpha})`;
    drawNoisyEllipse(gx, cY, capRx * 1.0, capR * 0.95, 0, true);
    ctx.fillStyle = `hsla(${14 - midDark * 20},${92 - midDark * 20}%,${Math.max(6, 30 - midDark * 32)}%,${alpha})`;
    drawNoisyEllipse(gx, cY - capR * 0.03, capRx * 0.85, capR * 0.82, 1, true);
    ctx.fillStyle = `hsla(${25 - innerDark * 18},${95 - innerDark * 15}%,${Math.max(10, 42 - innerDark * 28)}%,${alpha})`;
    drawNoisyEllipse(gx, cY - capR * 0.06, capRx * 0.65, capR * 0.65, 2, true);
    ctx.fillStyle = `hsla(${40 - coreDark * 15},100%,${Math.max(15, 58 - coreDark * 25)}%,${alpha})`;
    drawNoisyEllipse(gx, cY - capR * 0.08, capRx * 0.45, capR * 0.45, 3, false);

    // Blue-white hot core (hue 210 → 45 as it cools)
    const coreExtDk = elapsed > 6500 ? Math.min(1, (elapsed - 6500) / 2000) : 0;
    const coreA = alpha * Math.max(0.1, 1 - coreExtDk);
    const coreHue = 210 - coreExtDk * 165;
    ctx.fillStyle = `hsla(${coreHue},100%,${Math.max(25, 90 - coreExtDk * 55)}%,${coreA})`;
    drawNoisyEllipse(gx, cY - capR * 0.1, capRx * 0.25, capR * 0.25, 20, false);
    if (cloudT < 0.35) {
      ctx.fillStyle = `rgba(220,230,255,${(1 - cloudT / 0.35) * alpha})`;
      drawNoisyEllipse(gx, cY, capRx * 0.12, capR * 0.12, 30, false);
    }

    // Rolling hotspots on cap face
    for (let hs = 0; hs < 4; hs++) {
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

    // Base ring / skirt
    ctx.fillStyle = `hsla(${15 - hShift},70%,${Math.max(5, 28 - lDrop)}%,${alpha * 0.8})`;
    drawNoisyEllipse(gx, cY + capR * 0.4, capRx * 1.15, capR * 0.22, 12, false);

    // 3 cloud bands
    for (let i = 0; i < 3; i++) {
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

    // Outward-arcing debris from mid-stem (paired streak + glow with trails)
    if (elapsed > 200 && elapsed < 2000) {
      for (let i = 0; i < 2; i++) {
        if (FD.particles.length >= 300) break;
        const dir = Math.random() < 0.5 ? -1 : 1;
        const px = gx + (Math.random() - 0.5) * 15;
        const py = highStemY + (Math.random() - 0.5) * 30;
        const pvx = dir * (0.15 + Math.random() * 0.35);
        const pvy = -0.5 - Math.random() * 0.5;
        const plife = 800 + Math.random() * 800;
        FD.particles.push({
          x: px, y: py, vx: pvx, vy: pvy,
          life: plife, maxLife: 1600, r: 2 + Math.random() * 1.5,
          hue: 25 + Math.random() * 10, sat: 100, lum: 65,
          damping: 0.9992, gravity: 0.0018, streak: true, hasTrail: true
        });
        FD.particles.push({
          x: px, y: py, vx: pvx, vy: pvy,
          life: plife, maxLife: 1600, r: 10 + Math.random() * 12,
          hue: 15 + Math.random() * 10, sat: 100, lum: 50,
          damping: 0.9992, gravity: 0.0018, glow: true
        });
      }
    }

    // Cap-edge debris
    if (elapsed > 1200 && elapsed < 4000 && Math.random() < 0.2 && FD.particles.length < 300) {
      for (let ci = 0; ci < 2; ci++) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const px = gx + dir * capRx * (0.5 + Math.random() * 0.4);
        const py = cY - capR * 0.1 + (Math.random() - 0.5) * capR * 0.3;
        const pvx = dir * (0.25 + Math.random() * 0.4);
        const pvy = -0.05 - Math.random() * 0.15;
        const plife = 600 + Math.random() * 500;
        FD.particles.push({ x: px, y: py, vx: pvx, vy: pvy, life: plife, maxLife: 1100, r: 1 + Math.random() * 1.5, hue: 25 + Math.random() * 10, sat: 80, lum: 60, damping: 0.9993, gravity: 0.0014, streak: true, hasTrail: true });
        FD.particles.push({ x: px, y: py, vx: pvx, vy: pvy, life: plife, maxLife: 1100, r: 8 + Math.random() * 10, hue: 18 + Math.random() * 10, sat: 85, lum: 50, damping: 0.9993, gravity: 0.0014, glow: true });
      }
    }

    // Base fire
    if (elapsed > 800 && elapsed < 4000 && Math.random() < 0.3 && FD.particles.length < 300) {
      const bdir = Math.random() < 0.5 ? -1 : 1;
      FD.particles.push({
        x: gx + (Math.random() - 0.5) * stemBaseW * 1.5, y: gy - Math.random() * 10,
        vx: bdir * (0.05 + Math.random() * 0.15), vy: -0.05 - Math.random() * 0.15,
        life: 150 + Math.random() * 100, maxLife: 250, r: 20 + Math.random() * 30,
        hue: 20 + Math.random() * 15, sat: 60, lum: 35, damping: 0.9998, gravity: -0.0003, glow: true
      });
    }

    // Ash fallout
    if (elapsed > 6500 && Math.random() < 0.3 && FD.particles.length < 500) {
      FD.particles.push({
        x: Math.random() * W, y: Math.random() * (H * 0.6),
        vx: (Math.random() - 0.5) * 0.5, vy: 0.1 + Math.random() * 0.2,
        life: 1500 + Math.random() * 1000, maxLife: 2500, r: 1 + Math.random() * 2,
        hue: 25, sat: 100, lum: 45 + Math.random() * 25, damping: 0.99, gravity: 0.0005, streak: true
      });
    }

    // Building dust kick-up (once at 2s)
    if (elapsed > 2000 && !FD.nukeDustTriggered) {
      FD.nukeDustTriggered = true;
      var frontBldgs = FD.farBuildings.filter(function (b) { return b.layer === 'front' || !b.layer; });
      frontBldgs.forEach(function (b) {
        var roofY = H - FD.GROUND_H - b.h;
        var numDust = Math.floor(b.w / 15) + 1;
        for (var di = 0; di < numDust; di++) {
          FD.particles.push({
            x: b.x + Math.random() * b.w, y: roofY,
            vx: (Math.random() - 0.5) * 1.5, vy: -0.5 - Math.random() * 1.5,
            life: 200 + Math.random() * 300, maxLife: 500, r: 2 + Math.random() * 3,
            hue: 30, sat: 20, lum: 30, damping: 0.93, gravity: 0.02, streak: true
          });
        }
      });
    }

    // Ground fires (after 4s)
    if (elapsed > 4000 && elapsed < 9000 && Math.random() < 0.08 && FD.particles.length < 500) {
      FD.particles.push({
        x: gx + (Math.random() - 0.5) * W * 0.7, y: gy - 2 - Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.05, vy: -0.02 - Math.random() * 0.04,
        life: 60 + Math.random() * 80, maxLife: 140, r: 3 + Math.random() * 5,
        hue: 25 + Math.random() * 15, sat: 100, lum: 55 + Math.random() * 20,
        damping: 0.999, gravity: -0.0002, glow: true
      });
    }

    // Atmospheric haze band at horizon
    if (elapsed > 400 && elapsed < 9000) {
      const hazeT = elapsed < 1500 ? (elapsed - 400) / 1100 : elapsed < 6000 ? 1 : 1 - (elapsed - 6000) / 3000;
      const hazeH = 40 + hazeT * 50;
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
          hue: 20, sat: 30, lum: 25, damping: 0.9998, gravity: -0.0003, glow: true
        });
      }
    });

    ctx.globalAlpha = 1;

    // Shake
    if (elapsed < 1200) FD.screenShake = Math.max(FD.screenShake, 50 * (1 - elapsed / 1200));
    else if (elapsed < 4000) FD.screenShake = Math.max(FD.screenShake * 0.94, 0);

    if (elapsed > totalMs) FD.nukeActive = false;
  };

  // --- Nuke overlay: white flash + radial warm glow ---
  FD.drawNukeOverlay = function () {
    if (!FD.nukeActive) return;
    const ctx = FD.ctx;
    const W = FD.W, H = FD.H;
    const elapsed = performance.now() - FD.nukeStart;
    const cloudT = Math.min(1, Math.max(0, elapsed - 100) / 3000);
    const riseEase = 1 - Math.pow(1 - Math.min(1, cloudT * 1.5), 3);
    const slowDriftOv = Math.min(1, elapsed / 11000) * H * 0.07;
    const cloudCenterY = FD.nukeGy - riseEase * (H * 0.45) - slowDriftOv;

    // Blinding white flash (0-300ms)
    if (elapsed < 300) {
      const ft = elapsed / 300;
      ctx.globalAlpha = (1 - ft * ft) * 0.95;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // Warm radial glow from mushroom position (0-7s)
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

  // --- Vignette ---
  FD.drawVignette = function () {
    const ctx = FD.ctx;
    const W = FD.W, H = FD.H;
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };

  // --- Pickup type definitions ---
  FD.PICKUP_TYPES = [
    {
      id: 'nuke',
      label: 'NUKE',
      draw(x, y, r, tick) {
        const ctx = FD.ctx;
        const pulse = 1 + Math.sin(tick * 0.08) * 0.1;
        const pr = r * pulse;
        ctx.save();
        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, pr * 2.5);
        glow.addColorStop(0, 'rgba(255, 220, 0, 0.2)');
        glow.addColorStop(0.5, 'rgba(255, 160, 0, 0.08)');
        glow.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, pr * 2.5, 0, Math.PI * 2); ctx.fill();
        // Outer ring
        ctx.strokeStyle = `rgba(255, 200, 0, ${0.7 + Math.sin(tick * 0.1) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, pr, 0, Math.PI * 2); ctx.stroke();
        // Hazard trefoil
        ctx.fillStyle = '#ffcc00';
        const spin = tick * 0.02;
        for (let i = 0; i < 3; i++) {
          const a = spin + i * Math.PI * 2 / 3;
          const bx = x + Math.cos(a) * pr * 0.4;
          const by = y + Math.sin(a) * pr * 0.4;
          ctx.beginPath(); ctx.arc(bx, by, pr * 0.32, 0, Math.PI * 2); ctx.fill();
        }
        // Center dot
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(x, y, pr * 0.18, 0, Math.PI * 2); ctx.fill();
        // Mask gaps between trefoil lobes
        ctx.fillStyle = '#111';
        for (let i = 0; i < 3; i++) {
          const a = spin + i * Math.PI * 2 / 3 + Math.PI / 3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.arc(x, y, pr * 0.7, a - 0.25, a + 0.25);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
    },
    {
      id: 'shield',
      label: 'SHIELD',
      draw(x, y, r, tick) {
        const ctx = FD.ctx;
        const pulse = 1 + Math.sin(tick * 0.06) * 0.08;
        const pr = r * pulse;
        ctx.save();
        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, pr * 2.5);
        glow.addColorStop(0, 'rgba(0, 180, 255, 0.2)');
        glow.addColorStop(0.5, 'rgba(0, 120, 255, 0.08)');
        glow.addColorStop(1, 'rgba(0, 80, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, pr * 2.5, 0, Math.PI * 2); ctx.fill();
        // Outer shell
        ctx.strokeStyle = `rgba(80, 200, 255, ${0.6 + Math.sin(tick * 0.12) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, pr, 0, Math.PI * 2); ctx.stroke();
        // Inner hexagon
        ctx.strokeStyle = 'rgba(150, 230, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = tick * 0.015 + i * Math.PI / 3;
          const px = x + Math.cos(a) * pr * 0.55;
          const py = y + Math.sin(a) * pr * 0.55;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
        // Core
        ctx.fillStyle = `rgba(180, 240, 255, ${0.5 + Math.sin(tick * 0.08) * 0.2})`;
        ctx.beginPath(); ctx.arc(x, y, pr * 0.2, 0, Math.PI * 2); ctx.fill();
        // Orbiting sparks
        for (let i = 0; i < 3; i++) {
          const a = tick * 0.04 + i * Math.PI * 2 / 3;
          const sx = x + Math.cos(a) * pr * 0.75;
          const sy = y + Math.sin(a) * pr * 0.75;
          ctx.fillStyle = 'rgba(200, 240, 255, 0.7)';
          ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    },
    {
      id: 'magnet',
      label: 'MAGNET',
      draw(x, y, r, tick) {
        const ctx = FD.ctx;
        const pulse = 1 + Math.sin(tick * 0.07) * 0.06;
        const pr = r * pulse;
        ctx.save();
        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, pr * 2.2);
        glow.addColorStop(0, 'rgba(255, 50, 80, 0.18)');
        glow.addColorStop(1, 'rgba(255, 50, 80, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, pr * 2.2, 0, Math.PI * 2); ctx.fill();
        // Horseshoe body
        ctx.strokeStyle = '#cc2233';
        ctx.lineWidth = pr * 0.35;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y - pr * 0.1, pr * 0.55, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        // Silver tips
        ctx.fillStyle = '#ccc';
        const la = Math.PI * 0.15, ra = Math.PI * 0.85;
        ctx.beginPath(); ctx.arc(x + Math.cos(la) * pr * 0.55, y - pr * 0.1 + Math.sin(la) * pr * 0.55, pr * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + Math.cos(ra) * pr * 0.55, y - pr * 0.1 + Math.sin(ra) * pr * 0.55, pr * 0.15, 0, Math.PI * 2); ctx.fill();
        // Field lines
        ctx.strokeStyle = `rgba(255, 100, 130, ${0.3 + Math.sin(tick * 0.1) * 0.15})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const fieldR = pr * (0.8 + i * 0.25) + Math.sin(tick * 0.06 + i) * 3;
          ctx.beginPath();
          ctx.arc(x, y - pr * 0.1, fieldR, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  ];

  // --- Spawn pickup ---
  FD.spawnPickup = function (typeId) {
    const W = FD.W, H = FD.H;
    const type = FD.PICKUP_TYPES.find(t => t.id === typeId) || FD.PICKUP_TYPES[0];
    const px = W * 0.3 + Math.random() * W * 0.4;
    const py = H * 0.2 + Math.random() * H * 0.35;
    FD.pickups.push({ type, x: px, y: py, r: 14, born: FD.globalTick });
    if (FD.pickups.length > 4) FD.pickups.shift();
  };

  // --- Draw pickups ---
  FD.drawPickups = function () {
    FD.pickups.forEach(p => {
      const age = FD.globalTick - p.born;
      const bobY = p.y + Math.sin(age * 0.03) * 6;
      p.type.draw(p.x, bobY, p.r, FD.globalTick);
    });
  };
  // ── Near-Miss Effect ────────────────────────────────────────
  // Shared component: call FD.triggerNearMiss(droneX, droneY, clearance)
  // then FD.updateNearMiss() each frame and FD.drawNearMiss() in render.
  FD.nearMissAlpha = 0;
  FD.nearMissText = '';
  FD.nearMissTimer = 0;
  FD.nearMissX = 0;
  FD.nearMissY = 0;

  FD.triggerNearMiss = function (droneX, droneY, clearance) {
    FD.nearMissText = clearance <= 10 ? 'RAZOR!' : 'CLOSE!';
    FD.nearMissAlpha = 1;
    FD.nearMissTimer = 0;
    FD.nearMissX = droneX;
    FD.nearMissY = droneY;

    var intensity = 1 - Math.max(0, (clearance - 5) / 35);
    var count = Math.round(4 + intensity * 4);
    for (var i = 0; i < count; i++) {
      FD.particles.push({
        x: droneX - 10 - i * 6,
        y: droneY + (Math.random() - 0.5) * 8,
        vx: -(1.5 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 0.5,
        life: 15 + Math.random() * 15, maxLife: 30,
        r: 1 + Math.random() * 1.5,
        hue: 190, sat: 100, lum: 70,
        streak: true
      });
    }
    for (var j = 0; j < 6; j++) {
      var a = Math.random() * Math.PI * 2;
      FD.particles.push({
        x: droneX + Math.cos(a) * 8,
        y: droneY + Math.sin(a) * 6,
        vx: Math.cos(a) * (1 + Math.random()),
        vy: Math.sin(a) * (1 + Math.random()),
        life: 12 + Math.random() * 10, maxLife: 22,
        r: 1 + Math.random(), hue: 180, sat: 80, lum: 80,
        glow: true
      });
    }
  };

  FD.updateNearMiss = function () {
    if (FD.nearMissAlpha <= 0) return;
    FD.nearMissTimer++;
    FD.nearMissAlpha = Math.max(0, 1 - FD.nearMissTimer / 30);
  };

  FD.drawNearMiss = function () {
    if (FD.nearMissAlpha <= 0.01) return;
    var ctx = FD.ctx, W = FD.W, H = FD.H;

    ctx.save();
    ctx.globalAlpha = FD.nearMissAlpha * 0.9;
    ctx.font = '700 16px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 8;
    ctx.fillText(FD.nearMissText, FD.nearMissX, FD.nearMissY - 25 - (FD.nearMissTimer * 0.5));
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

    var pulseAlpha = FD.nearMissAlpha * 0.12;
    var edgeGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.55);
    edgeGrad.addColorStop(0, 'rgba(0,212,255,0)');
    edgeGrad.addColorStop(1, 'rgba(0,212,255,' + pulseAlpha + ')');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 1;
    ctx.restore();
  };

  // ── Speed Indicator ─────────────────────────────────────────
  // Shared component: call FD.drawSpeedIndicator(speed) in render.
  // Pre-generated stable streak data.
  FD.speedStreaks = [];
  for (var si = 0; si < 80; si++) {
    FD.speedStreaks.push({
      y: Math.random() * FD.H,
      baseLen: 3 + Math.random() * 7,       // short dashes: 3-10px
      alpha: 0.06 + Math.random() * 0.12,
      lineW: 0.5 + Math.random() * 0.8,
      oscSpeed: 1.5 + Math.random() * 3,
      oscPhase: Math.random() * Math.PI * 2
    });
  }

  FD.drawSpeedIndicator = function (speed) {
    if (speed < 4.0) return;
    var ctx = FD.ctx, W = FD.W, H = FD.H;

    var intensity = Math.min(1, (speed - 4.0) / 8.0);
    var bandW = 20 + intensity * 12;         // narrow band: 20-32px
    var visibleCount = Math.round(6 + intensity * 24);

    // Always cyan-tinted — gets warmer orange only at extreme (12+)
    var cr, cg, cb;
    if (speed < 10) {
      cr = 0; cg = Math.round(200 + intensity * 55); cb = 255; // pure cyan
    } else {
      var warm = Math.min(1, (speed - 10) / 5);
      cr = Math.round(warm * 180); cg = Math.round(200 - warm * 60); cb = Math.round(255 - warm * 100);
    }

    ctx.save();
    var tick = FD.globalTick;
    // Left side only — dynamic speed lines streaming from the left edge
    for (var i = 0; i < visibleCount && i < 80; i++) {
        var s = FD.speedStreaks[i];
        var oscX = Math.sin(tick * s.oscSpeed * 0.02 + s.oscPhase) * bandW * 0.35;
        var len = s.baseLen * (0.5 + intensity * 0.5);
        var x1 = oscX + bandW * 0.15;

        ctx.strokeStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (s.alpha * intensity) + ')';
        ctx.lineWidth = s.lineW;
        ctx.beginPath();
        ctx.moveTo(x1, s.y);
        ctx.lineTo(x1 + len, s.y);
        ctx.stroke();
    }
    ctx.restore();
  };
})();
