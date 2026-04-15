// tester.js — Tester-specific module for Flappy Drone effect tester
// Uses shared FD namespace for drawing/effects; exposes trigger functions on window
// for button onclick handlers in tester.html.

(function () {
  const FD = window.FD;
  // ---- Viewport mode (mobile vs widescreen) ----
  // Persisted across reloads. Widescreen widens the canvas while keeping
  // game-native height — supremely tuned NOVA values stay intact.
  const VP = (function () {
    const stored = localStorage.getItem('flappy-vp') || 'mobile';
    const dims = stored === 'wide'
      ? { W: 1138, H: 640 }
      : { W: 620,  H: 640 };
    FD.W = dims.W;
    FD.H = dims.H;
    const c = document.getElementById('game');
    if (c) { c.width = dims.W; c.height = dims.H; }
    document.body.classList.toggle('vp-wide', stored === 'wide');
    return stored;
  })();
  window.setViewport = function (mode) {
    localStorage.setItem('flappy-vp', mode);
    location.reload();
  };
  // Mark the active viewport button on load (after DOM is ready)
  setTimeout(() => {
    const m = document.getElementById('vpMobile');
    const w = document.getElementById('vpWide');
    if (m) m.classList.toggle('mode-active', VP === 'mobile');
    if (w) w.classList.toggle('mode-active', VP === 'wide');
  }, 0);
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

  let youDiedActive = false;
  let youDiedTimer = 0;

  let flashAlpha = 0;

  let testBuildings = [];

  const drone = { x: W / 2, y: H / 2 - 40, vx: 0, vy: 0, angle: 0, propPhase: 0 };

  // --- WASD / Arrow key tracking ---
  var keysDown = {};
  var wasdEnabled = false;
  document.addEventListener('keydown', function (e) {
    if (!wasdEnabled) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    var k = e.key.toLowerCase();
    if (k === 'w' || k === 'a' || k === 's' || k === 'd' ||
        k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright') {
      keysDown[k] = true;
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', function (e) {
    keysDown[e.key.toLowerCase()] = false;
  });

  function toggleWASD(on) {
    wasdEnabled = on;
    keysDown = {};
    var hint = document.getElementById('wasdHint');
    if (hint) hint.textContent = on ? 'Use WASD or Arrow keys to fly' : 'Drone idles automatically';
  }

  // --- Parallax speed multipliers + layer visibility ---
  var parSpeedBack = 0.6, parSpeedFront = 1.0, parSpeedGround = 1.0, parSpeedMtn = 0.2;
  var layerVisible = { mountains: true, backCity: true, frontCity: true, ground: true };
  var parScale = 1.0;

  function setParallaxSpeed(layer, val) {
    var v = parseInt(val, 10) / 100;
    if (layer === 'back') { parSpeedBack = v; document.getElementById('parBackLabel').textContent = v.toFixed(1); }
    else if (layer === 'front') { parSpeedFront = v; document.getElementById('parFrontLabel').textContent = v.toFixed(1); }
    else if (layer === 'ground') { parSpeedGround = v; document.getElementById('parGroundLabel').textContent = v.toFixed(1); }
    else if (layer === 'mountains') { parSpeedMtn = v; document.getElementById('parMtnLabel').textContent = v.toFixed(1); }
  }

  function toggleLayer(layer, on) {
    layerVisible[layer] = on;
  }

  function setParallaxScale(val) {
    parScale = parseInt(val, 10) / 100;
    document.getElementById('parScaleLabel').textContent = parScale.toFixed(1);
  }

  // --- Aurora intensity ---
  function setAuroraIntensity(val) {
    var v = parseInt(val, 10);
    FD.auroraTargetIntensity = v / 100;
    FD.auroraIntensity = v / 100; // immediate for tester
    document.getElementById('auroraLabel').textContent = v;
  }

  // --- Drone selection ---
  function selectDrone(id) {
    activeDrone = id;
    var sel = document.getElementById('droneSelect');
    if (sel) sel.value = id;
  }

  // --- Effect triggers ---
  function triggerDeath() {
    FD.screenShake = 8;
    FD.spawnExplosion(drone.x, drone.y);
    youDiedActive = true;
    youDiedTimer = 0;
    FD.deathText = 'YOU DIED';
  }

  function triggerFlash() {
    flashAlpha = 0.6;
    FD.screenShake = 6;
  }

  function triggerYouDied() {
    youDiedActive = true;
    youDiedTimer = FD.DEATH_FLASH_DUR; // skip flash, go straight to text
    FD.deathText = 'YOU DIED';
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

  var forcedCountdownStyle = -1; // -1 = random

  function setCountdownStyle(val) {
    forcedCountdownStyle = val === 'random' ? -1 : parseInt(val, 10);
  }

  function triggerCountdown() {
    countdownActive = true;
    countdownStart = performance.now();
    FD._droneAnimTriggered = false;
    if (forcedCountdownStyle >= 0) {
      FD._forcedDroneAnim = forcedCountdownStyle;
    } else {
      delete FD._forcedDroneAnim;
    }
  }

  function triggerCountdownSegment(phase) {
    countdownActive = true;
    FD._droneAnimTriggered = false;
    if (forcedCountdownStyle >= 0) FD._forcedDroneAnim = forcedCountdownStyle;
    else delete FD._forcedDroneAnim;
    // Map phase to a start time within the 4s countdown
    if (phase === 'ready') countdownStart = performance.now();
    else if (phase === 'set') countdownStart = performance.now() - FD.READY_MS * 0.38;
    else if (phase === 'drone') countdownStart = performance.now() - FD.READY_MS * 0.75;
  }

  function triggerVictory() {
    youDiedActive = true;
    youDiedTimer = 0;
    FD.deathText = 'ZENAVLLE IS SAVED';
  }

  function triggerNuke() {
    FD.nukeActive = true; FD.nukeDustTriggered = false;
    FD.nukeStart = performance.now();
    FD.screenShake = 50;
    FD.nukeGx = W / 2 + (Math.random() - 0.5) * 80;
    FD.nukeGy = H - GROUND_H;

    // Canvas nuke glow (matches game's #wrap.nuke-glow)
    canvas.classList.add('nuke-glow');
    canvas.classList.remove('nuke-glow-fade');
    setTimeout(function () {
      canvas.classList.remove('nuke-glow');
      canvas.classList.add('nuke-glow-fade');
      setTimeout(function () { canvas.classList.remove('nuke-glow-fade'); }, 3000);
    }, 4000);

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

  var SIGN_TEXTS = ['ZENATECH','IQ NANO','ZD1000','SKYNET','APEX','VOLT','NIMBUS','HOVER','DRONE CO'];
  var SIGN_TYPES = ['roof','side','stacked'];

  function spawnSignBuilding(text, color) {
    var bw = 50 + Math.random() * 30;
    var bx = 60 + Math.random() * (W - 180);
    var bh = 120 + Math.random() * 120;
    var topY = H - GROUND_H - bh;
    testBuildings.push({
      x: bx, w: bw, topY: topY, height: bh, fromTop: false,
      signText: text, signColor: color,
      signType: 'roof',
      seed: ((testBuildings.length * 2654435761 + performance.now()) >>> 0),
      _isSign: true
    });
    if (testBuildings.length > 12) testBuildings.shift();
  }

  // Sign spawner using dropdown values
  function spawnSign() {
    var textSel = document.getElementById('signSelect');
    var typeSel = document.getElementById('signType');
    var text = textSel ? textSel.value : 'ZENATECH';
    var sType = typeSel ? typeSel.value : 'random';
    if (sType === 'random') sType = SIGN_TYPES[Math.floor(Math.random() * SIGN_TYPES.length)];
    // Random hue color
    var hue = Math.floor(Math.random() * 360);
    var color = 'hsl(' + hue + ',100%,65%)';
    var bw = 50 + Math.random() * 30;
    var bx = 60 + Math.random() * (W - 180);
    var bh = 120 + Math.random() * 120;
    var topY = H - GROUND_H - bh;
    testBuildings.push({
      x: bx, w: bw, topY: topY, height: bh, fromTop: false,
      signText: text, signColor: color, signType: sType,
      seed: ((testBuildings.length * 2654435761 + performance.now()) >>> 0),
      _isSign: true
    });
    if (testBuildings.length > 12) testBuildings.shift();
  }

  // Building spawner
  function spawnTestBuilding() {
    var styleSel = document.getElementById('buildingStyle');
    var style = styleSel ? styleSel.value : 'random';
    var seed = ((testBuildings.length * 2654435761 + performance.now()) >>> 0);
    var bx = 60 + Math.random() * (W - 180);
    var bh = 100 + Math.random() * 180;
    var topY = H - GROUND_H - bh;
    var bw, ledges, antenna, signText, signColor, signType;

    switch (style) {
      case 'narrow': bw = 40 + Math.random() * 16; break;
      case 'wide': bw = 76 + Math.random() * 25; break;
      default: bw = 44 + Math.random() * 45; break;
    }

    ledges = (style === 'ledges' || style === 'full' || (style === 'random' && Math.random() < 0.3));
    antenna = (style === 'antenna' || style === 'full' || (style === 'random' && Math.random() < 0.15));

    if (style === 'sign' || style === 'full' || (style === 'random' && Math.random() < 0.3)) {
      signText = SIGN_TEXTS[Math.floor(Math.random() * SIGN_TEXTS.length)];
      signColor = 'hsl(' + Math.floor(Math.random() * 360) + ',100%,65%)';
      signType = SIGN_TYPES[Math.floor(Math.random() * SIGN_TYPES.length)];
    }

    testBuildings.push({
      x: bx, w: bw, topY: topY, height: bh, fromTop: false,
      seed: seed, ledges: ledges, antenna: antenna,
      signText: signText, signColor: signColor, signType: signType,
      _isSign: false
    });
    if (testBuildings.length > 12) testBuildings.shift();
  }

  function clearTestBuildings() {
    testBuildings = testBuildings.filter(function (b) { return b._isSign; });
  }

  function clearTestSigns() {
    testBuildings = testBuildings.filter(function (b) { return !b._isSign; });
  }

  function spawnPickup(typeId) {
    FD.spawnPickup(typeId);
  }

  function toggleMotion() {
    motionEnabled = !motionEnabled;
    document.getElementById('motionBtn').textContent = 'Motion: ' + (motionEnabled ? 'ON' : 'OFF');
  }

  // ── Score Milestones ──────────────────────────────────────
  let milestoneState = 'off';
  let milestoneTimer = 0;
  let milestoneText = '';
  let milestoneColor = '#00d4ff';
  let milestoneY = 0;

  function triggerMilestone(text, color) {
    milestoneText = text;
    milestoneColor = color;
    milestoneState = 'appear';
    milestoneTimer = 0;
    milestoneY = H / 2 - 60;

    // Use shared particle burst
    FD.spawnMilestoneParticles(W / 2, milestoneY, color);
    // Subtle flash
    flashAlpha = 0.15;
  }

  // Milestone update/draw now use shared FD.drawMilestoneText
  function updateMilestone() {
    if (milestoneState === 'off') return;
    milestoneTimer++;
    if (milestoneTimer >= 105) { milestoneState = 'off'; }
  }

  function drawMilestone() {
    if (milestoneState === 'off') return;
    var phase = Math.min(1, milestoneTimer / 105);
    FD.drawMilestoneText(milestoneText, milestoneColor, phase, W / 2, milestoneY);
  }

  // Near-miss — uses shared FD.triggerNearMiss / FD.drawNearMiss
  function triggerNearMiss() {
    var clearance = parseInt(document.getElementById('nearMissGap').value, 10);
    FD.triggerNearMiss(drone.x, drone.y, clearance);
  }

  // Speed indicator — uses shared FD.drawSpeedIndicator
  let speedFxEnabled = false;
  let speedFxValue = 2.8;

  function toggleSpeedFx() {
    speedFxEnabled = !speedFxEnabled;
    document.getElementById('speedFxBtn').textContent = 'Speed FX: ' + (speedFxEnabled ? 'ON' : 'OFF');
  }

  function onSpeedFxChange(val) {
    speedFxValue = parseInt(val, 10) / 10;
    document.getElementById('speedFxLabel').textContent = speedFxValue.toFixed(1);
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
    youDiedActive = false;
    youDiedTimer = 0;
    countdownActive = false;
    FD.nukeActive = false;
    FD.pickups = [];
    FD.screenShake = 0;
    milestoneState = 'off'; milestoneTimer = 0;
    FD.nearMissAlpha = 0;
    speedFxEnabled = false;
    document.getElementById('speedFxBtn').textContent = 'Speed FX: OFF';
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
    // Max divergence clamp — prevent adjacent gaps from being unreachable
    var maxShift = curGap * 0.7;
    var shift = newGapCenter - pipeLastGapY;
    if (Math.abs(shift) > maxShift) {
      newGapCenter = pipeLastGapY + (shift > 0 ? maxShift : -maxShift);
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

  // ── Tester draw wrappers — all use shared FD.* components ──

  function drawFlash() {
    if (flashAlpha > 0.01) {
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = '#cc1100';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  function drawCountdown() {
    // Uses the exact same FD.drawReadySequence as the game
    if (!countdownActive) return;
    var elapsed = performance.now() - countdownStart;
    var t = Math.min(1, elapsed / FD.READY_MS);

    // Wire up FD state so drawReadySequence works
    FD.readyStartTime = countdownStart;
    FD.drone = drone;
    FD.activeDroneType = activeDrone;

    FD.drawReadySequence(t, 'ready');

    if (t >= 1) { countdownActive = false; FD._droneAnimTriggered = false; }
  }

  // --- Update ---
  function update() {
    drone.propPhase += 0.5;

    if (wasdEnabled) {
      // WASD / arrow key movement
      var accel = 0.6;
      var friction = 0.88;
      if (keysDown['w'] || keysDown['arrowup']) drone.vy -= accel;
      if (keysDown['s'] || keysDown['arrowdown']) drone.vy += accel;
      if (keysDown['a'] || keysDown['arrowleft']) drone.vx -= accel;
      if (keysDown['d'] || keysDown['arrowright']) drone.vx += accel;
      drone.vx *= friction;
      drone.vy *= friction;
      drone.x += drone.vx;
      drone.y += drone.vy;

      // Idle drift when no keys pressed
      var anyKey = keysDown['w'] || keysDown['s'] || keysDown['a'] || keysDown['d'] ||
                   keysDown['arrowup'] || keysDown['arrowdown'] || keysDown['arrowleft'] || keysDown['arrowright'];
      if (!anyKey && Math.abs(drone.vx) < 0.1 && Math.abs(drone.vy) < 0.1) {
        drone.y += Math.sin(FD.globalTick * 0.025) * 0.3;
      }

      // Clamp to canvas bounds
      drone.x = Math.max(30, Math.min(W - 30, drone.x));
      drone.y = Math.max(30, Math.min(H - GROUND_H - 15, drone.y));

      // Tilt toward movement direction
      drone.angle = drone.vx * -0.04 + Math.sin(FD.globalTick * 0.018) * 0.02;
    } else {
      // Idle bob — default when WASD is off
      drone.x = W / 2;
      drone.y = H / 2 - 40 + Math.sin(FD.globalTick * 0.025) * 14;
      drone.angle = Math.sin(FD.globalTick * 0.018) * 0.04;
      drone.vx = 0;
      drone.vy = 0;
    }

    flashAlpha *= 0.92;
    if (FD.screenShake > 0.3) FD.screenShake *= 0.85;

    // YOU DIED — uses game's FD.drawDeathSequence via deathTimer
    if (youDiedActive) {
      youDiedTimer++;
      if (youDiedTimer > FD.DIED_TOTAL + FD.SCORE_DELAY) {
        youDiedActive = false;
        youDiedTimer = 0;
      }
    }

    updatePipeScroll();
    updateMilestone();
    FD.updateNearMiss();
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
    FD.drawAurora();

    // Far city with tester-specific scroll
    const scrollX = motionEnabled ? (FD.globalTick * 0.12 * parSpeedFront) : 0;

    // Mountain silhouettes behind city
    if (layerVisible.mountains) FD.drawMountains(scrollX * (parSpeedMtn / parSpeedFront || 1));

    // City layers with uniform scale transform (anchored at ground)
    if (parScale !== 1.0) {
      ctx.save();
      var scaleOriginY = H - FD.GROUND_H;
      ctx.translate(W / 2, scaleOriginY);
      ctx.scale(parScale, parScale);
      ctx.translate(-W / 2, -scaleOriginY);
    }
    if (layerVisible.backCity) FD.drawFarCity(scrollX, 'back');
    FD.drawNukeCloud();
    if (layerVisible.frontCity) FD.drawFarCity(scrollX, 'front');
    if (parScale !== 1.0) ctx.restore();

    // Ground
    if (layerVisible.ground) {
      const scrollOffset = motionEnabled ? (FD.globalTick * 1.6 * parSpeedGround) % 24 : 0;
      FD.drawGround(scrollOffset);
    }

    FD.drawParticles(false); // Background debris

    // Test buildings
    testBuildings.forEach(b => FD.drawBuilding(b));

    // Test pipes (pipe generation preview) — include building features at high scores
    testPipes.forEach(function (p) {
      var seed = ((p.id * 2654435761) >>> 0);
      var hash = ((p.id * 13 + 7) * 37) % 100;
      var bldg = {
        x: p.x, w: p.w, topY: p.y, height: p.h,
        fromTop: p.fromTop, seed: seed
      };
      // Add building features matching game.js logic
      if (p.h > 50) {
        if (hash % 10 < 3) bldg.ledges = true;
        if (!p.fromTop && hash % 20 < 3) bldg.antenna = true;
        if (!p.fromTop && hash < 30) {
          var signHue = (p.id * 137 + 43) % 360;
          bldg.signText = SIGN_TEXTS[p.id % SIGN_TEXTS.length];
          bldg.signColor = 'hsl(' + signHue + ',100%,65%)';
          var sTypeRoll = hash % 10;
          bldg.signType = sTypeRoll < 5 ? 'roof' : sTypeRoll < 8 ? 'side' : 'stacked';
        }
      }
      FD.drawBuilding(bldg);
    });

    FD.drawPickups();
    FD.drawFireworks();
    FD.drawParticles(true); // Foreground debris

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
    FD.drawDeathSequence(youDiedActive ? 'dying' : 'menu', youDiedTimer);
    FD.drawNukeOverlay();
    if (speedFxEnabled) FD.drawSpeedIndicator(speedFxValue);
    drawMilestone();
    FD.drawNearMiss();
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

  // --- Nuke resilience: when tab becomes visible again, re-anchor
  // nukeStart IF a nuke is still flagged active. Without this, the
  // browser's rAF-throttling in background tabs combined with NOVA's
  // wall-clock elapsed math causes the mushroom to never render
  // (elapsed already past the 14s total by the time frames resume).
  // This also clears nukeActive if the nuke was long dead so particles
  // can drain normally.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    if (!FD.nukeActive) return;
    var elapsed = performance.now() - FD.nukeStart;
    if (elapsed > 14500) {
      FD.nukeActive = false;    // stale — let it finish cleanup
    } else if (elapsed > 1500) {
      // Mid-anim and we probably missed the cap bloom — rewind to 0
      // so the user sees the full sequence.
      FD.nukeStart = performance.now();
    }
  });

  // --- Expose all trigger functions on window ---
  window.selectDrone = selectDrone;
  window.toggleWASD = toggleWASD;
  window.triggerDeath = triggerDeath;
  window.triggerFlash = triggerFlash;
  window.triggerYouDied = triggerYouDied;
  window.triggerVictory = triggerVictory;
  window.triggerExplosion = triggerExplosion;
  window.triggerThrust = triggerThrust;
  window.triggerFirework = triggerFirework;
  window.triggerCountdown = triggerCountdown;
  window.triggerCountdownSegment = triggerCountdownSegment;
  window.setCountdownStyle = setCountdownStyle;
  window.triggerNuke = triggerNuke;
  window.spawnSignBuilding = spawnSignBuilding;
  window.spawnSign = spawnSign;
  window.spawnTestBuilding = spawnTestBuilding;
  window.clearTestBuildings = clearTestBuildings;
  window.clearTestSigns = clearTestSigns;
  window.spawnPickup = spawnPickup;
  window.setAuroraIntensity = setAuroraIntensity;
  window.setParallaxSpeed = setParallaxSpeed;
  window.toggleLayer = toggleLayer;
  window.setParallaxScale = setParallaxScale;
  window.toggleMotion = toggleMotion;
  window.resetScene = resetScene;
  window.triggerMilestone = triggerMilestone;
  window.triggerNearMiss = triggerNearMiss;
  window.toggleSpeedFx = toggleSpeedFx;
  window.onSpeedFxChange = onSpeedFxChange;
  window.setPipeMode = setPipeMode;
  window.onPipeScoreChange = onPipeScoreChange;
  window.generatePipePreview = generatePipePreview;
  window.clearPipePreview = clearPipePreview;
  window.togglePipeScroll = togglePipeScroll;
  window.toggleHitboxes = toggleHitboxes;

  // Init mode toggle default
  setPipeMode('classic');
})();
