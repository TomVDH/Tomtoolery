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
    // Bright blue spark flash — big visible cyan pop
    FD.particles.push({
      x: droneX, y: droneY + 4,
      vx: 0, vy: 0.3,
      life: 8, maxLife: 8,
      r: 30,
      hue: 200, sat: 100, lum: 95,
      glow: true
    });
    // Inner white-blue core
    FD.particles.push({
      x: droneX, y: droneY + 4,
      vx: 0, vy: 0.2,
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

  // --- Draw particles ---
  FD.drawParticles = function () {
    const ctx = FD.ctx;
    FD.particles.forEach(p => {
      const t = p.life / p.maxLife;
      if (p.glow) {
        // Radial glow burst — bright centre, fast falloff
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * t);
        grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.lum}%, ${t * 0.8})`);
        grad.addColorStop(0.25, `hsla(${p.hue}, ${p.sat}%, ${p.lum - 10}%, ${t * 0.4})`);
        grad.addColorStop(0.6, `hsla(${p.hue}, ${p.sat}%, ${p.lum - 25}%, ${t * 0.1})`);
        grad.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.lum - 30}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2); ctx.fill();
      } else if (p.streak) {
        // Streak particle — motion trail line + head dot
        ctx.globalAlpha = t * 0.7;
        ctx.strokeStyle = `hsl(${p.hue}, ${p.sat || 100}%, ${(p.lum || 55) + (1 - t) * 20}%)`;
        ctx.lineWidth = p.r * t * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = `hsl(${p.hue}, ${p.sat || 100}%, ${(p.lum || 55) + (1 - t) * 25}%)`;
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

  // --- Update particles ---
  FD.updateParticles = function () {
    FD.particles.forEach(p => {
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

  // --- Nuke mushroom cloud (11s timeline) ---
  // Drawn behind city layer. Rim light on buildings is handled by buildings.js.
  FD.drawNukeCloud = function () {
    if (!FD.nukeActive) return;
    const ctx = FD.ctx;
    const W = FD.W, H = FD.H;
    const elapsed = performance.now() - FD.nukeStart;
    const totalMs = 11000;
    const gx = FD.nukeGx, gy = FD.nukeGy;

    // Shockwave ring
    if (elapsed > 200 && elapsed < 2000) {
      const st = (elapsed - 200) / 1800;
      const radius = st * Math.max(W, H) * 0.8;
      ctx.globalAlpha = (1 - st) * 0.3;
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
      ctx.lineWidth = 3 + (1 - st) * 8;
      ctx.beginPath(); ctx.arc(gx, gy, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Mushroom cloud
    if (elapsed > 100) {
      const cloudT = Math.min(1, (elapsed - 100) / 3000);
      const fadeT = elapsed > 9000 ? Math.min(1, (elapsed - 9000) / 2000) : 0;
      const darkT = elapsed > 3000 ? Math.min(1, (elapsed - 3000) / 3500) : 0;
      const alpha = (1 - fadeT) * 0.85;

      if (alpha > 0.01) {
        ctx.globalAlpha = alpha;
        const riseEase = 1 - Math.pow(1 - Math.min(1, cloudT * 1.5), 3);
        const slowDrift = Math.min(1, elapsed / totalMs) * H * 0.07;
        const cloudCenterY = gy - riseEase * (H * 0.45) - slowDrift;
        const stemBaseY = gy;
        const capGrow = Math.min(1, cloudT * 2);
        const capR = 40 + capGrow * 55;
        const capRx = capR * 1.4;
        const stemTopW = 18 + capGrow * 12;
        const stemBaseW = 30 + capGrow * 25;

        // Color darkening over time
        const hShift = darkT * 15;
        const lDrop = darkT * 30;

        // Intense base glow
        const baseGlowR = capRx * 1.8;
        const baseGlowAlpha = alpha * Math.max(0, 1 - darkT * 0.7);
        const baseGlow = ctx.createRadialGradient(gx, stemBaseY, 0, gx, stemBaseY, baseGlowR);
        baseGlow.addColorStop(0, `hsla(35, 100%, 70%, ${baseGlowAlpha * 0.7})`);
        baseGlow.addColorStop(0.15, `hsla(28, 100%, 50%, ${baseGlowAlpha * 0.35})`);
        baseGlow.addColorStop(0.4, `hsla(20, 100%, 30%, ${baseGlowAlpha * 0.08})`);
        baseGlow.addColorStop(1, 'hsla(15, 100%, 20%, 0)');
        ctx.fillStyle = baseGlow;
        ctx.beginPath();
        ctx.arc(gx, stemBaseY, baseGlowR, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        const stemGrad = ctx.createLinearGradient(gx, cloudCenterY + capR * 0.3, gx, stemBaseY);
        stemGrad.addColorStop(0, `hsla(${25 - hShift}, 90%, ${Math.max(10, 45 - lDrop)}%, ${alpha})`);
        stemGrad.addColorStop(0.4, `hsla(${20 - hShift}, 85%, ${Math.max(8, 35 - lDrop)}%, ${alpha})`);
        stemGrad.addColorStop(1, `hsla(${15 - hShift}, 70%, ${Math.max(5, 25 - lDrop)}%, ${alpha})`);
        ctx.fillStyle = stemGrad;
        ctx.beginPath();
        ctx.moveTo(gx - stemTopW / 2, cloudCenterY + capR * 0.3);
        ctx.quadraticCurveTo(gx - stemTopW * 0.6, (cloudCenterY + stemBaseY) / 2, gx - stemBaseW / 2, stemBaseY);
        ctx.lineTo(gx + stemBaseW / 2, stemBaseY);
        ctx.quadraticCurveTo(gx + stemTopW * 0.6, (cloudCenterY + stemBaseY) / 2, gx + stemTopW / 2, cloudCenterY + capR * 0.3);
        ctx.closePath(); ctx.fill();

        // Glow (soft radial)
        const glowRadius = capRx * 2.5;
        const glowGrad = ctx.createRadialGradient(gx, cloudCenterY, capR * 0.2, gx, cloudCenterY, glowRadius);
        glowGrad.addColorStop(0, `hsla(30, 100%, ${Math.max(15, 60 - lDrop * 2)}%, ${alpha * 0.35})`);
        glowGrad.addColorStop(0.4, `hsla(25, 100%, ${Math.max(10, 45 - lDrop * 2)}%, ${alpha * 0.15})`);
        glowGrad.addColorStop(1, 'hsla(15, 100%, 30%, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(gx, cloudCenterY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Cap layers (darken over time)
        ctx.fillStyle = `hsla(${12 - hShift}, 60%, ${Math.max(5, 22 - lDrop)}%, ${alpha})`;
        ctx.beginPath(); ctx.ellipse(gx, cloudCenterY, capRx * 1.1, capR * 0.95, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `hsla(${18 - hShift}, 80%, ${Math.max(8, 32 - lDrop)}%, ${alpha})`;
        ctx.beginPath(); ctx.ellipse(gx, cloudCenterY - capR * 0.05, capRx * 0.9, capR * 0.8, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `hsla(${25 - hShift}, 90%, ${Math.max(10, 42 - lDrop)}%, ${alpha})`;
        ctx.beginPath(); ctx.ellipse(gx, cloudCenterY - capR * 0.08, capRx * 0.65, capR * 0.6, 0, 0, Math.PI * 2); ctx.fill();

        // Hot core -- last to darken, lingers bright
        const coreDarkDelay = elapsed > 5500 ? Math.min(1, (elapsed - 5500) / 2500) : 0;
        const coreAlpha = alpha * Math.max(0.1, 1 - coreDarkDelay);
        ctx.fillStyle = `hsla(40, 100%, ${Math.max(20, 70 - lDrop * 2)}%, ${coreAlpha})`;
        ctx.beginPath(); ctx.ellipse(gx, cloudCenterY - capR * 0.1, capRx * 0.35, capR * 0.35, 0, 0, Math.PI * 2); ctx.fill();

        // White-hot center
        if (cloudT < 0.4) {
          const wa = (1 - cloudT / 0.4) * alpha;
          ctx.fillStyle = `rgba(255, 255, 220, ${wa})`;
          ctx.beginPath(); ctx.ellipse(gx, cloudCenterY, capRx * 0.2, capR * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        }

        // Base ring
        ctx.fillStyle = `hsla(${15 - hShift}, 70%, ${Math.max(5, 28 - lDrop)}%, ${alpha * 0.7})`;
        ctx.beginPath(); ctx.ellipse(gx, cloudCenterY + capR * 0.5, capRx * 1.15, capR * 0.25, 0, 0, Math.PI * 2); ctx.fill();

        // Concentric cloud bands
        {
          const now = elapsed / 1000;
          for (let i = 0; i < 3; i++) {
            const entryT = 0.15 + i * 0.15;
            if (cloudT < entryT) continue;
            const bandAge = Math.min(1, (cloudT - entryT) / 0.35);
            const t01 = i / 2;
            const finalY = cloudCenterY - capR * (0.55 - t01 * 1.0) - 35;
            const startY = cloudCenterY + capR * 0.5;
            const bandY = startY + (finalY - startY) * bandAge
              + Math.sin(now * (0.4 + i * 0.25) + i * 2.3) * capR * 0.03;
            const widthAtY = capRx * (0.6 + t01 * 0.8) * bandAge;
            const fade = (0.7 + t01 * 0.3) * bandAge;
            const pulse = 0.3 + 0.1 * Math.sin(now * (1.2 + i * 0.4) + i * 1.7);
            const bandAlpha = alpha * pulse * fade;
            const bandL = Math.max(10, (44 - i * 4) - lDrop);
            const bandH = 24 - hShift + i * 3;
            const sag1 = capR * 0.05 * Math.sin(now * (0.6 + i * 0.3) + i);
            const sag2 = capR * 0.04 * Math.sin(now * (0.5 + i * 0.2) + i + 1.5);
            ctx.strokeStyle = `hsla(${bandH}, 75%, ${bandL}%, ${bandAlpha})`;
            ctx.lineWidth = (4 + t01 * 2) * bandAge;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(gx - widthAtY, bandY);
            ctx.quadraticCurveTo(gx - widthAtY * 0.35, bandY + sag1, gx, bandY + sag2);
            ctx.quadraticCurveTo(gx + widthAtY * 0.35, bandY - sag1, gx + widthAtY, bandY);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;
      }
    }

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
})();
