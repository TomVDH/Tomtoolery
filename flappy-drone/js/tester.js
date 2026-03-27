// tester.js — Tester-specific module for Flappy Drone effect tester
// Uses shared FD namespace for drawing/effects; exposes trigger functions on window
// for button onclick handlers in tester.html.

(function () {
  const FD = window.FD;
  const W = FD.W, H = FD.H, GROUND_H = FD.GROUND_H;
  const TESTER_FRAME_MS = 1000 / 60;
  var testerLastFrame = performance.now();
  var testerAccum = 0;

  // --- DOM refs ---
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // --- Local state ---
  let motionEnabled = true;
  let activeDrone = 'quad';

  let countdownActive = false;
  let countdownStart = 0;

  let youDiedState = 'off'; // off, wait, fadein, hold, fadeout
  let youDiedTimer = 0;
  let youDiedAlpha = 0;

  let flashAlpha = 0;

  let testBuildings = [];

  const drone = { x: W / 2, y: H / 2 - 40, vy: 0, angle: 0, propPhase: 0 };

  // --- Drone selection ---
  function selectDrone(id) {
    activeDrone = id;
    document.querySelectorAll('[id^="drone-"]').forEach(function(b) { b.classList.remove('drone-active'); });
    var el = document.getElementById('drone-' + id);
    if (el) el.classList.add('drone-active');
  }

  // --- Effect triggers ---
  function triggerDeath() {
    flashAlpha = 0.5;
    FD.screenShake = 8;
    FD.spawnExplosion(drone.x, drone.y);
    youDiedState = 'wait';
    youDiedTimer = 0;
  }

  function triggerFlash() {
    flashAlpha = 0.6;
    FD.screenShake = 6;
  }

  function triggerYouDied() {
    youDiedState = 'fadein';
    youDiedTimer = 0;
    youDiedAlpha = 0;
  }

  function triggerExplosion() {
    FD.spawnExplosion(drone.x, drone.y);
    FD.screenShake = 4;
  }

  function triggerThrust() {
    FD.spawnThrust(drone.x, drone.y);
  }

  function triggerFirework() {
    const fx = 100 + Math.random() * (W - 200);
    const sizeRoll = Math.random();
    const size = sizeRoll < 0.25 ? 2 : sizeRoll < 0.55 ? 1 : 0; // more large in tester
    FD.fireworks.push({
      x: fx, y: H - GROUND_H,
      vy: -(2.5 + Math.random() * 2.5),
      hue: Math.random() * 360,
      targetY: 40 + Math.random() * 250,
      trail: [], exploded: false, size
    });
  }

  function triggerCountdown() {
    countdownActive = true;
    countdownStart = performance.now();
  }

  function triggerNuke() {
    FD.nukeActive = true;
    FD.nukeStart = performance.now();
    FD.screenShake = 50;
    FD.nukeGx = W / 2 + (Math.random() - 0.5) * 80;
    FD.nukeGy = H - GROUND_H;

    // Debris flies all over screen
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = Math.random() * 6 + 2;
      FD.particles.push({
        x: FD.nukeGx + (Math.random() - 0.5) * 40,
        y: FD.nukeGy - Math.random() * 40,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 50 + Math.random() * 40, maxLife: 90,
        r: Math.random() * 4 + 2,
        hue: 15 + Math.random() * 35, sat: 100, lum: 50
      });
    }
    // Delayed ember shower
    setTimeout(() => {
      for (let i = 0; i < 40; i++) {
        FD.particles.push({
          x: FD.nukeGx + (Math.random() - 0.5) * 120,
          y: FD.nukeGy - 100 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 2, vy: Math.random() * 2 + 0.5,
          life: 50 + Math.random() * 40, maxLife: 90,
          r: Math.random() * 3 + 1,
          hue: 10 + Math.random() * 30, sat: 100, lum: 55
        });
      }
      FD.screenShake = 8;
    }, 600);
  }

  function spawnSignBuilding(text, color) {
    const bw = 56;
    const bx = W / 2 - bw / 2 + (Math.random() - 0.5) * 200;
    const bh = 120 + Math.random() * 100;
    const topY = H - GROUND_H - bh;
    testBuildings.push({
      x: bx, w: bw, topY, height: bh, fromTop: false,
      signText: text, signColor: color,
      signType: 'roof',
      seed: ((testBuildings.length * 2654435761) >>> 0)
    });
    // Keep max 6 buildings
    if (testBuildings.length > 6) testBuildings.shift();
  }

  function spawnPickup(typeId) {
    FD.spawnPickup(typeId);
  }

  function toggleMotion() {
    motionEnabled = !motionEnabled;
    document.getElementById('motionBtn').textContent = 'Motion: ' + (motionEnabled ? 'ON' : 'OFF');
  }

  function resetScene() {
    testBuildings = [];
    testPipes = [];
    pipeScrollActive = false;
    pipeSpawnAccum = 0;
    document.getElementById('scrollBtn').textContent = 'Scroll: OFF';
    FD.particles = [];
    FD.fireworks = [];
    flashAlpha = 0;
    youDiedAlpha = 0;
    youDiedState = 'off';
    countdownActive = false;
    FD.nukeActive = false;
    FD.pickups = [];
    FD.screenShake = 0;
  }

  // ── Pipe Generation Preview ──────────────────────────────────
  let testPipes = [];
  let pipeMode = 'classic';
  let pipeScore = 0;
  let pipeScrollActive = false;
  let pipeSpawnAccum = 0;
  let pipeLastGapY = H / 2;
  let pipeIdCounter = 0;
  let showHitboxes = false;

  // Difficulty ramp — mirrors game.js exactly
  function getPipeParams(mode, score) {
    var curGap, curSpeed, curSpacing, maxDrift, biasAmt, tier;

    if (mode === 'rush') {
      var rushBuildT = Math.min(1, score / 20);
      var rushGapT = score < 8 ? 0 : Math.min(1, (score - 8) / 20);
      curGap    = FD.GAP_SIZE - rushGapT * 65;            // 175 → 110
      curSpeed  = 9.45 + Math.min(1, score / 30) * 2.55;  // 9.45 → 12.0
      curSpacing = Math.round(60 - rushBuildT * 20) * curSpeed; // frame-interval × speed
      var rushOscT = Math.min(1, score / 15);
      maxDrift  = 200 + rushOscT * 100;                    // 200 → 300
      biasAmt   = 0.50 + rushOscT * 0.15;                  // 0.50 → 0.65
      tier      = 'Rush';
    } else {
      curGap    = 155;
      curSpeed  = 2.8;
      curSpacing = 220;
      if (score < 8) {
        maxDrift = 120; biasAmt = 0.25; tier = 'T1 (0-7)';
      } else if (score < 18) {
        maxDrift = 200; biasAmt = 0.45; tier = 'T2 (8-17)';
      } else if (score < 30) {
        maxDrift = 250; biasAmt = 0.55; tier = 'T3 (18-29)';
      } else {
        maxDrift = 280;
        biasAmt = (Math.random() < 0.25) ? 0.05 : 0.60;
        tier = 'T4 (30+)';
      }
    }
    return { curGap, curSpeed, curSpacing, maxDrift, biasAmt, tier };
  }

  // Spawn a single pipe pair using exact game logic
  function spawnOnePipe(params) {
    var curGap = params.curGap;
    var maxDrift = params.maxDrift;
    var biasAmt = params.biasAmt;
    var score = pipeScore;
    var minTop = 70;
    var maxTop = H - curGap - FD.GROUND_H - 70;

    var midY = (minTop + maxTop + curGap) / 2;
    var biasDir = (pipeLastGapY > midY) ? -1 : 1;
    var biasedY = pipeLastGapY + biasDir * maxDrift * biasAmt;

    var driftMin = Math.max(minTop, biasedY - curGap / 2 - maxDrift);
    var driftMax = Math.min(maxTop, biasedY - curGap / 2 + maxDrift);
    if (driftMin > driftMax) driftMin = driftMax;
    var topH = driftMin + Math.random() * (driftMax - driftMin);
    var newGapCenter = topH + curGap / 2;

    // Minimum vertical jump — force active repositioning
    var minJump;
    if (pipeMode === 'rush') {
      minJump = 60 + Math.min(1, score / 15) * 60;
    } else if (score < 8) {
      minJump = 30;
    } else if (score < 18) {
      minJump = 50;
    } else {
      minJump = 70;
    }
    var actualDelta = Math.abs(newGapCenter - pipeLastGapY);
    if (actualDelta < minJump) {
      var pushDir = (newGapCenter >= pipeLastGapY) ? 1 : -1;
      newGapCenter = pipeLastGapY + pushDir * minJump;
      newGapCenter = Math.max(minTop + curGap / 2, Math.min(maxTop + curGap / 2, newGapCenter));
      topH = newGapCenter - curGap / 2;
    }
    pipeLastGapY = newGapCenter;

    // Pipe width
    var id = pipeIdCounter++;
    var pipeW = FD.PIPE_WIDTH;
    if (score >= 15 && pipeMode === 'classic') {
      var widthRoll = Math.random() * 100;
      var wideChance = Math.min(50, 20 + (score - 15) * 3);
      if (widthRoll < wideChance) {
        pipeW = FD.PIPE_WIDTH + 20 + Math.floor(Math.random() * 25);
      }
    } else if (score >= 10 && pipeMode === 'rush') {
      var widthRoll = Math.random() * 100;
      var wt = Math.min(1, score / 40);
      var wideChance = 15 + wt * 35;
      if (widthRoll < wideChance) {
        pipeW = FD.PIPE_WIDTH + 20 + Math.floor(wt * 20);
      }
    }

    var botY = topH + curGap;
    return [
      { x: 0, w: pipeW, y: 0,    h: topH,                   fromTop: true,  scored: false, id: id },
      { x: 0, w: pipeW, y: botY, h: H - FD.GROUND_H - botY, fromTop: false, scored: false, id: id }
    ];
  }

  function setPipeMode(mode) {
    pipeMode = mode;
    document.getElementById('pipeMode-classic').classList.toggle('mode-active', mode === 'classic');
    document.getElementById('pipeMode-rush').classList.toggle('mode-active', mode === 'rush');
  }

  function onPipeScoreChange(val) {
    pipeScore = parseInt(val, 10);
    document.getElementById('pipeScoreLabel').textContent = val;
  }

  function generatePipePreview() {
    testPipes = [];
    testBuildings = [];
    pipeLastGapY = H / 2;
    pipeIdCounter = 0;
    var params = getPipeParams(pipeMode, pipeScore);

    // Fill screen with pipes, spaced by curSpacing
    var x = 120; // first pipe offset from left
    while (x < W + params.curSpacing) {
      var pair = spawnOnePipe(params);
      pair[0].x = x; pair[1].x = x;
      testPipes.push(pair[0], pair[1]);
      x += params.curSpacing;
    }
  }

  function clearPipePreview() {
    testPipes = [];
    pipeScrollActive = false;
    pipeSpawnAccum = 0;
    document.getElementById('scrollBtn').textContent = 'Scroll: OFF';
  }

  function togglePipeScroll() {
    pipeScrollActive = !pipeScrollActive;
    document.getElementById('scrollBtn').textContent = 'Scroll: ' + (pipeScrollActive ? 'ON' : 'OFF');
    if (pipeScrollActive && testPipes.length === 0) {
      generatePipePreview();
    }
  }

  function toggleHitboxes() {
    showHitboxes = !showHitboxes;
    document.getElementById('hitboxBtn').textContent = 'Hitboxes: ' + (showHitboxes ? 'ON' : 'OFF');
  }

  // Update scrolling pipes
  function updatePipeScroll() {
    if (!pipeScrollActive) return;
    var params = getPipeParams(pipeMode, pipeScore);

    // Move pipes
    for (var i = 0; i < testPipes.length; i++) {
      testPipes[i].x -= params.curSpeed;
    }
    // Remove off-screen pipes
    testPipes = testPipes.filter(function (p) { return p.x + p.w > -20; });

    // Spawn new pipes at right edge using pixel-based spacing
    pipeSpawnAccum += params.curSpeed;
    if (pipeSpawnAccum >= params.curSpacing || testPipes.length === 0) {
      pipeSpawnAccum = 0;
      var pair = spawnOnePipe(params);
      pair[0].x = W + 10; pair[1].x = W + 10;
      testPipes.push(pair[0], pair[1]);
    }
  }

  // Draw pipe preview HUD
  function drawPipeHUD() {
    if (testPipes.length === 0) return;
    var params = getPipeParams(pipeMode, pipeScore);
    ctx.save();
    ctx.font = '10px "SF Mono", "Menlo", "Courier New", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,212,255,0.7)';
    var lines = [
      pipeMode.toUpperCase() + '  Score: ' + pipeScore,
      'Speed: ' + params.curSpeed.toFixed(1) + '  Gap: ' + params.curGap + 'px  Spacing: ' + Math.round(params.curSpacing) + 'px',
      'Drift: ' + params.maxDrift + '  Bias: ' + params.biasAmt.toFixed(2) + '  Tier: ' + params.tier
    ];
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 8, 8 + i * 14);
    }
    ctx.restore();
  }

  // Draw hitbox overlays
  function drawHitboxes() {
    if (!showHitboxes) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,50,50,0.6)';
    ctx.lineWidth = 1;
    // Drone hitbox
    ctx.strokeRect(drone.x - 10, drone.y - 4, 20, 12);
    // Pipe hitboxes
    for (var i = 0; i < testPipes.length; i++) {
      var p = testPipes[i];
      ctx.strokeRect(p.x - 2, p.y, p.w + 4, p.h);
    }
    ctx.restore();
  }

  // --- Tester-specific drawing ---

  function drawFlash() {
    if (flashAlpha > 0.01) {
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = '#cc1100';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  function drawYouDied() {
    if (youDiedAlpha < 0.01) return;

    // Shadow band
    const bandH = 80, bandY = H / 2 - bandH / 2;
    const g = ctx.createLinearGradient(0, bandY - 20, 0, bandY + bandH + 20);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.15, `rgba(0,0,0,${youDiedAlpha * 0.6})`);
    g.addColorStop(0.5, `rgba(0,0,0,${youDiedAlpha * 0.75})`);
    g.addColorStop(0.85, `rgba(0,0,0,${youDiedAlpha * 0.6})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, bandY - 20, W, bandH + 40);

    ctx.globalAlpha = youDiedAlpha;
    ctx.font = '700 48px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = '#cc220088'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#bb2200'; ctx.fillText('YOU DIED', W / 2, H / 2);
    ctx.shadowBlur = 20; ctx.fillStyle = '#cc2200'; ctx.fillText('YOU DIED', W / 2, H / 2);
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.globalAlpha = 1;
  }

  function drawCountdown() {
    if (!countdownActive) return;
    const elapsed = performance.now() - countdownStart;
    const t = Math.min(1, elapsed / 4000);
    const textY = H / 2 - 70;

    // Drone outline blink
    const blinkHz = 15 - t * t * t * 13;
    const blinkOn = Math.sin(elapsed * blinkHz * 0.00628) > 0;
    if (blinkOn || t > 0.9) {
      ctx.save(); ctx.translate(drone.x, drone.y); ctx.rotate(drone.angle);
      const a = t > 0.9 ? Math.max(0, 1 - (t - 0.9) / 0.1) : 0.85;
      ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1; ctx.globalAlpha = a;
      ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-15, -5); ctx.lineTo(-4, -5); ctx.lineTo(-4, -8);
      ctx.lineTo(4, -8); ctx.lineTo(4, -5); ctx.lineTo(15, -5);
      ctx.lineTo(19, -2); ctx.lineTo(19, 3); ctx.lineTo(15, 3);
      ctx.lineTo(10, 5); ctx.lineTo(10, 9); ctx.lineTo(-10, 9);
      ctx.lineTo(-10, 5); ctx.lineTo(-15, 3); ctx.lineTo(-19, 3);
      ctx.lineTo(-19, -2); ctx.closePath(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1; ctx.restore();
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (t < 0.38) {
      const phase = t / 0.38;
      let alpha, ox;
      if (phase < 0.15) { const p = phase / 0.15; alpha = p * 0.8; ox = (1 - p) * -40; }
      else if (phase > 0.85) { const p = (phase - 0.85) / 0.15; alpha = (1 - p) * 0.8; ox = p * 40; }
      else { alpha = 0.8; ox = 0; }
      ctx.globalAlpha = alpha; ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#667'; ctx.fillText('Ready?', W / 2 + ox, textY);
    } else if (t < 0.75) {
      const phase = (t - 0.38) / 0.37;
      let alpha, ox;
      if (phase < 0.12) { const p = phase / 0.12; alpha = p * 0.85; ox = (1 - p) * -35; }
      else if (phase > 0.88) { const p = (phase - 0.88) / 0.12; alpha = (1 - p) * 0.85; ox = p * 35; }
      else { alpha = 0.85; ox = 0; }
      ctx.globalAlpha = alpha; ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#778'; ctx.fillText('Set.', W / 2 + ox, textY);
    } else {
      const phase = (t - 0.75) / 0.25;
      const smackT = Math.min(1, phase / 0.15);
      const scaleOvershoot = smackT < 1 ? 1 + (1 - smackT) * 0.2 : 1;
      ctx.save(); ctx.translate(W / 2, textY); ctx.scale(scaleOvershoot, scaleOvershoot);
      ctx.globalAlpha = Math.min(1, smackT * 1.5);
      ctx.font = '700 36px "Courier New", monospace'; ctx.fillStyle = '#00d4ff';
      ctx.shadowColor = '#00d4ffaa'; ctx.shadowBlur = 30;
      ctx.fillText('DRONE!', 0, 0); ctx.shadowBlur = 12; ctx.fillText('DRONE!', 0, 0);
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (t >= 1) countdownActive = false;
  }

  // --- Update ---
  function update() {
    drone.propPhase += 0.5;
    drone.y = H / 2 - 40 + Math.sin(FD.globalTick * 0.025) * 14;
    drone.angle = Math.sin(FD.globalTick * 0.018) * 0.04;

    flashAlpha *= 0.92;
    if (FD.screenShake > 0.3) FD.screenShake *= 0.85;

    // YOU DIED state machine
    if (youDiedState === 'wait') {
      youDiedTimer++;
      if (youDiedTimer > 18) { youDiedState = 'fadein'; youDiedTimer = 0; }
    } else if (youDiedState === 'fadein') {
      youDiedTimer++;
      youDiedAlpha = Math.pow(youDiedTimer / 120, 2);
      if (youDiedTimer >= 120) { youDiedState = 'hold'; youDiedTimer = 0; youDiedAlpha = 1; }
    } else if (youDiedState === 'hold') {
      youDiedTimer++;
      if (youDiedTimer >= 70) { youDiedState = 'fadeout'; youDiedTimer = 0; }
    } else if (youDiedState === 'fadeout') {
      youDiedTimer++;
      youDiedAlpha = 1 - youDiedTimer / 60;
      if (youDiedTimer >= 60) { youDiedState = 'off'; youDiedAlpha = 0; }
    }

    updatePipeScroll();
    FD.updateParticles();
    FD.updateFireworks();
  }

  // --- Render ---
  function render() {
    const shaking = FD.screenShake > 0.3;
    const sx = shaking ? (Math.random() - 0.5) * FD.screenShake : 0;
    const sy = shaking ? (Math.random() - 0.5) * FD.screenShake : 0;

    ctx.save(); ctx.translate(sx, sy);

    FD.drawSky();
    FD.drawMoon();
    FD.drawStars();
    FD.drawClouds();
    FD.drawNukeCloud();

    // Far city with tester-specific scroll
    const scrollX = motionEnabled ? (FD.globalTick * 0.12) % FD.FAR_TILE_W : 0;
    FD.drawFarCity(scrollX);

    // Ground with tester-specific scroll
    const scrollOffset = motionEnabled ? (FD.globalTick * 1.6) % 24 : 0;
    FD.drawGround(scrollOffset);

    // Test buildings
    testBuildings.forEach(b => FD.drawBuilding(b));

    // Test pipes (pipe generation preview)
    testPipes.forEach(function (p) {
      var seed = ((p.id * 2654435761) >>> 0);
      FD.drawBuilding({
        x: p.x, w: p.w, topY: p.y, height: p.h,
        fromTop: p.fromTop, seed: seed
      });
    });

    FD.drawPickups();
    FD.drawFireworks();
    FD.drawParticles();

    // Drone — compute nuke silhouette
    const bobY = drone.y;
    let nukeSilhouette = 0;
    if (FD.nukeActive) {
      const ne = performance.now() - FD.nukeStart;
      if (ne < 500) nukeSilhouette = 1;
      else if (ne < 4000) nukeSilhouette = 1 - (ne - 500) / 3500;
    }
    FD.drawDrone(drone.x, bobY, drone.angle, drone.propPhase, activeDrone, nukeSilhouette);

    FD.drawVignette();
    drawCountdown();
    drawFlash();
    drawYouDied();
    FD.drawNukeOverlay();
    drawPipeHUD();
    drawHitboxes();

    ctx.restore();

    // Fixed 60fps timestep
    var now = performance.now();
    testerAccum += now - testerLastFrame;
    testerLastFrame = now;
    if (testerAccum > TESTER_FRAME_MS * 4) testerAccum = TESTER_FRAME_MS * 4;
    while (testerAccum >= TESTER_FRAME_MS) {
      FD.globalTick++;
      update();
      testerAccum -= TESTER_FRAME_MS;
    }
    requestAnimationFrame(render);
  }

  // --- Init: wire up shared ctx and start ---
  FD.ctx = ctx;
  FD.canvas = canvas;
  render();

  // --- Expose trigger functions on window for button onclick ---
  window.selectDrone = selectDrone;
  window.triggerDeath = triggerDeath;
  window.triggerFlash = triggerFlash;
  window.triggerYouDied = triggerYouDied;
  window.triggerExplosion = triggerExplosion;
  window.triggerThrust = triggerThrust;
  window.triggerFirework = triggerFirework;
  window.triggerCountdown = triggerCountdown;
  window.triggerNuke = triggerNuke;
  window.spawnSignBuilding = spawnSignBuilding;
  window.spawnPickup = spawnPickup;
  window.toggleMotion = toggleMotion;
  window.resetScene = resetScene;
  window.setPipeMode = setPipeMode;
  window.onPipeScoreChange = onPipeScoreChange;
  window.generatePipePreview = generatePipePreview;
  window.clearPipePreview = clearPipePreview;
  window.togglePipeScroll = togglePipeScroll;
  window.toggleHitboxes = toggleHitboxes;

  // Init mode toggle default
  setPipeMode('classic');
})();
