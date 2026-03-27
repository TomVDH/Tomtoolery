// game.js -- Flappy Drone game-specific module
// Uses the FD namespace for all shared drawing, effects, and config.
// Game-specific state (score, pipes, state machine) lives here, NOT on FD.

(function () {
  'use strict';
  const FD = window.FD;
  const W = FD.W, H = FD.H;

  // --- DOM refs ---
  const canvas   = document.getElementById('game');
  const ctx      = canvas.getContext('2d');
  const hudEl    = document.getElementById('hud');
  const menuScreen   = document.getElementById('menuScreen');
  const scoreScreen  = document.getElementById('scoreScreen');
  const scoreValueEl = document.getElementById('scoreValue');
  const scoreBestEl  = document.getElementById('scoreBest');

  // --- Local game state (not on FD) ---
  let state = 'menu'; // menu | ready | play | dying | dead | fading | nuking | nukeFall
  let score = 0, best = 0;
  let drone = { x: 100, y: H / 2, vy: 0, angle: 0, propPhase: 0 };
  let pipes = [];
  let frame = 0;
  let deathTimer = 0;
  let readyStartTime = 0;
  let readyT = 0;
  let versionClicks = 0;
  let versionClickTimer = 0;
  let activeDroneType = 'quad';
  let fadeStartTime = 0;
  const droneTypes = ['quad', 'stealth', 'heavy', 'racer', 'osprey', 'dragonfly', 'disc', 'spider', 'jetwing', 'balloon', 'paperplane', 'chopper', 'gyro', 'blimp', 'tandem'];
  const droneNames = {
    quad: 'PIXEL QUAD', stealth: 'SHADOW BLADE', heavy: 'IRON MULE',
    racer: 'PINK STREAK', osprey: 'SKY OSPREY', dragonfly: 'NEON BUG',
    disc: 'FLYING SAUCER', spider: 'ARACHNID HEX',
    jetwing: 'SKYKNIFE', balloon: 'FLOATER', paperplane: 'ORIGAMI', chopper: 'CHOPPER',
    gyro: 'WHIRLYBIRD', blimp: 'ZEPHYR', tandem: 'WARHORSE'
  };
  let droneIndex = 0;
  const FRAME_MS = 1000 / 60; // fixed 60fps timestep
  let lastFrameTime = performance.now();
  let updateAccum = 0;

  // --- Game modes ---
  const gameModes = ['classic', 'rush'];
  const modeNames = { classic: 'CLASSIC', rush: 'ZENA RUSH' };
  const modeDescs = { classic: 'Endless flight', rush: 'Beat the clock — 5 gaps = bonus time' };
  let modeIndex = 0;
  let activeMode = 'classic';

  // --- Zena Rush timer ---
  const RUSH_START_TIME = 20;    // seconds to start
  const RUSH_BONUS_TIME = 5;     // seconds added per 3 gaps
  const RUSH_BONUS_EVERY = 3;    // gates per bonus
  let rushTimer = 0;             // seconds remaining
  let rushLastBonus = 0;         // last score that triggered bonus
  let rushBonusFlash = 0;        // flash timer for bonus UI feedback
  const hudTimerEl = document.getElementById('hudTimer');

  // --- Secret win ---
  const WIN_SCORE = 65;

  // --- Neon sign data for pipe buildings ---
  const roofTexts  = ['IQ NANO', 'ZD1000', 'PP-1', 'IQ SQUARE', 'ZenaGames', 'ZENATECH', 'DRONE CO', 'SKYNET', 'HOVER', 'APEX', 'VOLT', 'NIMBUS'];

  // ---------------------------------------------------------------
  // init — reset all game state, wire FD.ctx / FD.canvas / FD.drone
  // ---------------------------------------------------------------
  function init() {
    drone = { x: 100, y: H / 2, vy: 0, angle: 0, propPhase: 0 };
    pipes = [];
    score = 0;
    frame = 0;
    deathTimer = 0;
    hudEl.textContent = '0';

    // Zena Rush timer
    rushTimer = RUSH_START_TIME;
    rushLastBonus = 0;
    rushBonusFlash = 0;
    if (activeMode === 'rush') {
      hudTimerEl.style.display = 'block';
      hudTimerEl.textContent = rushTimer.toFixed(1);
      hudTimerEl.classList.remove('critical');
    } else {
      hudTimerEl.style.display = 'none';
    }

    // Expose canvas + ctx to shared modules
    FD.ctx    = ctx;
    FD.canvas = canvas;

    // Expose drone reference and type for ui.js
    FD.drone  = drone;
    FD.activeDroneType = activeDroneType;
  }

  // ---------------------------------------------------------------
  // flap — unified input handler
  // ---------------------------------------------------------------
  function flap() {
    if (state === 'menu') {
      FD.hideScreen(menuScreen);
      init();
      trackEvent('game_start', { drone: activeDroneType, mode: activeMode });
      // Delay ready state until menu fade completes
      state = 'fading';
      fadeStartTime = performance.now();
      setTimeout(function () {
        state = 'ready';
        readyStartTime = performance.now();
        FD.readyStartTime = readyStartTime;
        readyT = 0;
      }, 650);
      return;
    }

    if (state === 'ready') return;

    if (state === 'play') {
      drone.vy = FD.FLAP_FORCE;
      FD.spawnThrust(drone.x, drone.y);
      return;
    }

    // Can retry once score screen is visible and settled
    if (state === 'dead' && deathTimer > 30) {
      state = 'menu';
      FD.hideScreen(scoreScreen);
      FD.showScreen(menuScreen);
      hudEl.classList.remove('show');
      init();
    }
  }

  // ---------------------------------------------------------------
  // Input handlers
  // ---------------------------------------------------------------
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); }
  });
  canvas.addEventListener('click', flap);
  canvas.addEventListener('touchstart', function (e) { e.preventDefault(); flap(); }, { passive: false });

  // --- Drone cycle (left/right arrow keys or click the label) ---
  function cycleDrone(dir) {
    droneIndex = (droneIndex + dir + droneTypes.length) % droneTypes.length;
    activeDroneType = droneTypes[droneIndex];
    FD.activeDroneType = activeDroneType;
    var label = document.getElementById('droneLabel');
    if (label) label.textContent = droneNames[activeDroneType] || activeDroneType;
  }
  document.addEventListener('keydown', function (e) {
    if (state !== 'menu') return;
    if (e.code === 'ArrowLeft') { e.preventDefault(); cycleDrone(-1); }
    if (e.code === 'ArrowRight') { e.preventDefault(); cycleDrone(1); }
  });
  var droneLabel = document.getElementById('droneLabel');
  if (droneLabel) droneLabel.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'menu') cycleDrone(1);
  });
  var leftArrow = document.getElementById('droneLeft');
  var rightArrow = document.getElementById('droneRight');
  if (leftArrow) leftArrow.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'menu') cycleDrone(-1);
  });
  if (rightArrow) rightArrow.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'menu') cycleDrone(1);
  });

  // --- Mode cycle ---
  function cycleMode(dir) {
    modeIndex = (modeIndex + dir + gameModes.length) % gameModes.length;
    activeMode = gameModes[modeIndex];
    var label = document.getElementById('modeLabel');
    var desc = document.getElementById('modeDesc');
    if (label) label.textContent = modeNames[activeMode];
    if (desc) desc.textContent = modeDescs[activeMode];
  }
  var modeLabel = document.getElementById('modeLabel');
  if (modeLabel) modeLabel.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'menu') cycleMode(1);
  });
  var modeLeft = document.getElementById('modeLeft');
  var modeRight = document.getElementById('modeRight');
  if (modeLeft) modeLeft.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'menu') cycleMode(-1);
  });
  if (modeRight) modeRight.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'menu') cycleMode(1);
  });
  // Up/Down arrows cycle mode on menu (won't conflict since flap only uses Space on menu)
  document.addEventListener('keydown', function (e) {
    if (state !== 'menu') return;
    if (e.code === 'ArrowDown') { e.preventDefault(); cycleMode(1); }
  });

  // --- Version hash click -> nuke easter egg (5 rapid clicks on menu) ---
  document.querySelector('.version').addEventListener('click', function (e) {
    e.stopPropagation();
    if (state !== 'menu') return;
    var now = Date.now();
    if (now - versionClickTimer > 1500) versionClicks = 0; // reset if too slow
    versionClickTimer = now;
    versionClicks++;
    if (versionClicks >= 5) {
      versionClicks = 0;
      triggerNukeEasterEgg();
    }
  });

  // ---------------------------------------------------------------
  // triggerNukeEasterEgg
  // ---------------------------------------------------------------
  function triggerNukeEasterEgg() {
    FD.hideScreen(menuScreen);
    state = 'nuking';

    // After 1.5s, nuke goes off
    setTimeout(function () {
      FD.nukeActive = true;
      FD.nukeStart  = performance.now();
      FD.nukeGx     = W / 2 + (Math.random() - 0.5) * 80;
      FD.nukeGy     = H - FD.GROUND_H;
      FD.screenShake = 50;

      // Viewport glow — soft orange spreading outside the game canvas
      var wrap = document.getElementById('wrap');
      wrap.classList.add('nuke-glow');
      setTimeout(function () {
        wrap.classList.remove('nuke-glow');
        wrap.classList.add('nuke-glow-fade');
      }, 1200);
      setTimeout(function () {
        wrap.classList.remove('nuke-glow-fade');
      }, 6000);

      // Debris flies all over the screen
      for (var i = 0; i < 60; i++) {
        var a = Math.random() * Math.PI * 2;
        var spd = Math.random() * 6 + 2;
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
      setTimeout(function () {
        for (var i = 0; i < 40; i++) {
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

      // After 8s, drone crashes down
      setTimeout(function () {
        if (state === 'nuking') {
          drone.vy = 8; // slam down
          state = 'nukeFall';
        }
      }, 8000);
    }, 1500);
  }

  // ---------------------------------------------------------------
  // die — transition to dying state
  // ---------------------------------------------------------------
  function die() {
    state = 'dying';
    best = Math.max(best, score);
    deathTimer = 0;
    FD.deathText = 'YOU DIED';
    FD.screenShake = 8;
    FD.spawnExplosion(drone.x, drone.y);
    hudEl.classList.remove('show');
    hudTimerEl.style.display = 'none';
    trackEvent('game_over', { score: score, best: best, drone: activeDroneType, mode: activeMode });
  }

  // --- Nuke death (Zena Rush timeout) ---
  function nukeAndDie() {
    state = 'nuking';
    best = Math.max(best, score);
    FD.nukeActive = true;
    FD.nukeStart = performance.now();
    FD.screenShake = 12;
    hudEl.classList.remove('show');
    hudTimerEl.style.display = 'none';
    trackEvent('rush_timeout', { score: score, drone: activeDroneType });
    // After 8s nuke plays, drone crashes
    setTimeout(function () {
      if (state === 'nuking') {
        drone.vy = 8;
        state = 'nukeFall';
      }
    }, 8000);
  }

  // --- Secret win ---
  function win() {
    state = 'dying';
    best = Math.max(best, score);
    deathTimer = 0;
    FD.deathText = 'YOU WIN';
    FD.screenShake = 0;
    hudEl.classList.remove('show');
    hudTimerEl.style.display = 'none';
    trackEvent('game_win', { score: score, drone: activeDroneType, mode: activeMode });
  }

  // ---------------------------------------------------------------
  // update — full game state machine
  // ---------------------------------------------------------------
  function update() {
    // --- dying ---
    if (state === 'dying') {
      deathTimer++;
      if (FD.screenShake > 0.3) FD.screenShake *= 0.82;
      FD.updateParticles();
      // Transition to score screen after full sequence
      if (deathTimer > FD.DIED_TOTAL + FD.SCORE_DELAY) {
        state = 'dead';
        deathTimer = 0;
        scoreValueEl.textContent = score;
        scoreBestEl.textContent = 'Best: ' + best;
        FD.showScreen(scoreScreen);
      }
      return;
    }

    // --- dead ---
    if (state === 'dead') {
      deathTimer++;
      FD.updateParticles();
      return;
    }

    // --- nuking (idle drone, particles only) ---
    if (state === 'nuking') {
      FD.updateParticles();
      return;
    }

    // --- nukeFall: drone drops and crashes ---
    if (state === 'nukeFall') {
      drone.vy += FD.GRAVITY * 1.5;
      drone.y  += drone.vy;
      drone.angle += 0.05;     // tumble
      drone.propPhase += 0.1;  // slow props
      FD.updateParticles();
      if (drone.y > H - FD.GROUND_H - 8) {
        drone.y = H - FD.GROUND_H - 8;
        // Transition to death sequence — nuke version
        state = 'dying';
        best = Math.max(best, score);
        deathTimer = 0;
        FD.deathText = 'YOU ENDED THE WORLD';
        FD.spawnExplosion(drone.x, drone.y);
      }
      return;
    }

    // --- ready countdown ---
    if (state === 'ready') {
      readyT = Math.min(1, (performance.now() - readyStartTime) / FD.READY_MS);
      drone.propPhase += 0.5;
      drone.y = H / 2 + Math.sin(FD.globalTick * 0.025) * 8;
      drone.angle = Math.sin(FD.globalTick * 0.018) * 0.03;
      if (readyT >= 1) {
        state = 'play';
        hudEl.classList.add('show');
      }
      return;
    }

    // --- play ---
    if (state !== 'play') return;

    frame++;

    // Drone physics
    drone.vy += FD.GRAVITY;
    drone.vy = Math.min(drone.vy, 8);
    drone.y  += drone.vy;

    if (drone.y < FD.CEILING_Y) {
      drone.y  = FD.CEILING_Y;
      drone.vy = Math.max(drone.vy, 0);
    }

    var targetAngle = Math.max(-0.4, Math.min(0.5, drone.vy * 0.055));
    drone.angle += (targetAngle - drone.angle) * 0.12;
    drone.propPhase += 0.5;

    // --- Difficulty ramp ---
    var curSpeed, curGap, curInterval;

    if (activeMode === 'rush') {
      // ZENA RUSH: starts fast, ramps brutally
      var rushBuildT = Math.min(1, score / 20);
      curGap = FD.GAP_SIZE - rushBuildT * 55;             // 170 → 115
      curInterval = Math.round(FD.PIPE_INTERVAL - rushBuildT * 50); // 160 → 110
      // Speed: starts at 9.45 (450% of Classic 2.1), ramps to 12
      var rushSpeedT = Math.min(1, score / 30);
      curSpeed = 9.45 + rushSpeedT * 2.55;                // 9.45 → 12
    } else {
      // CLASSIC: phased ramp
      // Phase 1 (score 0-7): easy cruising
      // Phase 2 (score 8+): buildings widen, gaps shrink, interval tightens
      // Phase 3 (score 15+): speed ramps aggressively
      var buildT = Math.max(0, Math.min(1, (score - 8) / 27));
      curGap = FD.GAP_SIZE - buildT * 60;                 // 170 → 110
      curInterval = Math.round(FD.PIPE_INTERVAL - buildT * 60); // 160 → 100
      var speedT = Math.max(0, Math.min(1, (score - 15) / 30));
      speedT = speedT * speedT;
      curSpeed = FD.PIPE_SPEED + speedT * 2.0;            // 2.1 → 4.1
    }

    // Spawn pipes — buildings get wider as difficulty increases
    if (frame % curInterval === 0) {
      var minTop = 70;
      var maxTop = H - curGap - FD.GROUND_H - 70;
      var topH   = minTop + Math.random() * (maxTop - minTop);
      var id     = Math.floor(frame / curInterval);
      // Width: before score 15 = standard only; after = increasingly wide
      var widthRoll = ((id * 31 + 17) * 53) % 100;
      var pipeW;
      if (score < 15) {
        pipeW = FD.PIPE_WIDTH; // all standard before 15
      } else {
        // More wide buildings as score climbs: wide chance 20% → 50%
        var wideChance = 20 + buildT * 30;
        pipeW = widthRoll < (100 - wideChance) ? FD.PIPE_WIDTH : FD.PIPE_WIDTH + 20 + Math.floor(buildT * 16);
      }
      pipes.push(
        { x: W + 10, w: pipeW, y: 0,             h: topH,                                   fromTop: true,  scored: false, id: id },
        { x: W + 10, w: pipeW, y: topH + curGap, h: H - FD.GROUND_H - topH - curGap, fromTop: false, scored: false, id: id }
      );
    }

    // Move pipes
    pipes.forEach(function (p) { p.x -= curSpeed; });
    pipes = pipes.filter(function (p) { return p.x + p.w > -20; });

    // Score
    for (var i = 0; i < pipes.length; i += 2) {
      if (pipes[i] && !pipes[i].scored && pipes[i].x + pipes[i].w < drone.x - 12) {
        pipes[i].scored = true;
        score++;
        hudEl.textContent = score;

        // Zena Rush: bonus time every 5 gates
        if (activeMode === 'rush' && score > 0 && score % RUSH_BONUS_EVERY === 0) {
          rushTimer += RUSH_BONUS_TIME;
          rushBonusFlash = 60; // 1 second of flash
        }

        // Secret win at score 65
        if (score >= WIN_SCORE) {
          win();
          return;
        }
      }
    }

    // Zena Rush: tick timer down
    if (activeMode === 'rush' && state === 'play') {
      rushTimer -= FRAME_MS / 1000;
      if (rushBonusFlash > 0) rushBonusFlash--;
      // Update timer HUD
      hudTimerEl.textContent = (rushBonusFlash > 0 ? '+' + RUSH_BONUS_TIME + 's  ' : '') + Math.max(0, rushTimer).toFixed(1);
      hudTimerEl.classList.toggle('critical', rushTimer < 5);
      // Time's up — nuke death
      if (rushTimer <= 0) {
        rushTimer = 0;
        nukeAndDie();
        return;
      }
    }

    // Collision detection
    var hb = { x: drone.x - 10, y: drone.y - 4, w: 20, h: 12 };
    for (var j = 0; j < pipes.length; j++) {
      var p = pipes[j];
      var px = p.x - 2, pw = p.w + 4;
      if (hb.x + hb.w > px && hb.x < px + pw &&
          hb.y + hb.h > p.y && hb.y < p.y + p.h) {
        die(); return;
      }
    }

    // Ground collision
    if (drone.y > H - FD.GROUND_H - 8) { drone.y = H - FD.GROUND_H - 8; die(); return; }

    // Firework spawning (after 5 gates cleared)
    if (score >= 5) {
      FD.fwTimer--;
      if (FD.fwTimer <= 0) {
        FD.fwTimer = 180 + Math.random() * 220;
        var fx = 40 + Math.random() * (W - 80);
        var sizeRoll = Math.random();
        var size = sizeRoll < 0.1 ? 2 : sizeRoll < 0.4 ? 1 : 0;
        FD.fireworks.push({
          x: fx, y: H - FD.GROUND_H,
          vy: -(2.5 + Math.random() * 2.5),
          hue: Math.random() * 360,
          targetY: 40 + Math.random() * 250,
          trail: [], exploded: false, size: size
        });
      }
    }

    FD.updateParticles();
    FD.updateFireworks();
  }

  // ---------------------------------------------------------------
  // render — full render loop
  // ---------------------------------------------------------------
  function render() {
    // Screen shake offset
    var shaking = (state === 'dying' || state === 'nuking' || state === 'nukeFall') && FD.screenShake > 0.3;
    var sx = shaking ? (Math.random() - 0.5) * FD.screenShake : 0;
    var sy = shaking ? (Math.random() - 0.5) * FD.screenShake : 0;

    ctx.save();
    ctx.translate(sx, sy);

    // Background layers
    FD.drawSky();
    FD.drawMoon();
    FD.drawStars();
    FD.drawClouds();
    FD.drawNukeCloud();

    // Far city parallax
    var scrollX = (FD.globalTick * 0.12) % FD.FAR_TILE_W;
    FD.drawFarCity(scrollX);

    // Ground
    var scrollOffset = (FD.globalTick * FD.PIPE_SPEED) % 24;
    FD.drawGround(scrollOffset);

    // Pipes as buildings
    pipes.forEach(function (p) {
      var seed = ((p.id * 2654435761) >>> 0);
      var bldg = {
        x: p.x,
        w: p.w,
        topY: p.y,
        height: p.h,
        fromTop: p.fromTop,
        seed: seed
      };

      // Building features based on pipeId hash
      var hash = ((p.id * 13 + 7) * 37) % 100;

      // Ledge dividers on ~30% of buildings
      if (hash % 10 < 3) bldg.ledges = true;

      // Antenna on ~15% of bottom buildings
      if (!p.fromTop && hash % 20 < 3) bldg.antenna = true;

      // Neon signs: 30% of bottom buildings, varied types
      if (!p.fromTop && hash < 30) {
        var idx = ((p.id * 11 + 5) * 23) % roofTexts.length;
        bldg.signText  = roofTexts[idx];
        bldg.signColor = 'hsl(' + ((p.id * 137 + 43) % 360) + ', 100%, 65%)';
        // Vary sign type: 50% roof, 30% side, 20% stacked
        var signHash = ((p.id * 31 + 17) * 53) % 100;
        if (signHash < 50) bldg.signType = 'roof';
        else if (signHash < 80) bldg.signType = 'side';
        else bldg.signType = 'stacked';
      }

      FD.drawBuilding(bldg);
    });

    // Pickups, fireworks, particles
    FD.drawPickups();
    FD.drawFireworks();
    FD.drawParticles();

    // Drone during play
    if (state === 'play') {
      FD.drawDrone(drone.x, drone.y, drone.angle, drone.propPhase, activeDroneType);
    }

    // Drone during nuke states (silhouette during bright flash)
    if (state === 'nuking' || state === 'nukeFall') {
      var sil = 0;
      if (FD.nukeActive) {
        var ne = performance.now() - FD.nukeStart;
        if (ne < 500) sil = 1;
        else if (ne < 4000) sil = 1 - (ne - 500) / 3500;
      }
      FD.drawDrone(drone.x, drone.y, drone.angle, drone.propPhase, activeDroneType, sil);
    }

    // Overlays
    FD.drawVignette();
    FD.drawReadySequence(readyT, state);
    FD.drawDeathSequence(state, deathTimer);
    FD.drawNukeOverlay();

    ctx.restore();

    // Menu: large tilted hero drone, animates to play position on tap
    if (state === 'menu') {
      drone.propPhase += 0.5;
      var heroX = W / 2;
      var heroY = 420 + Math.sin(FD.globalTick * 0.02) * 8;
      var heroAngle = -0.2 + Math.sin(FD.globalTick * 0.015) * 0.05;
      ctx.save();
      ctx.translate(heroX, heroY);
      ctx.rotate(heroAngle);
      ctx.scale(2.8, 2.8); // big hero drone
      // Draw the active drone type directly (bypass dispatcher to avoid double translate)
      var heroDrawFn = FD['drawDrone' + activeDroneType.charAt(0).toUpperCase() + activeDroneType.slice(1)];
      if (heroDrawFn) heroDrawFn(drone.propPhase); else FD.drawDroneQuad(drone.propPhase);
      ctx.restore();
    }

    // Fading: drone shrinks and snaps to play position
    if (state === 'fading') {
      drone.propPhase += 0.5;
      var fadeElapsed = performance.now() - fadeStartTime;
      var fadeProgress = Math.min(1, fadeElapsed / 600);
      var ep = 1 - Math.pow(1 - fadeProgress, 3);
      var fromX = W / 2, fromY = 420, fromAngle = -0.2, fromScale = 2.8;
      var toX = 100, toY = H / 2, toAngle = 0, toScale = 1.15;
      var cx = fromX + (toX - fromX) * ep;
      var cy = fromY + (toY - fromY) * ep;
      var ca = fromAngle + (toAngle - fromAngle) * ep;
      var cs = fromScale + (toScale - fromScale) * ep;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ca);
      ctx.scale(cs, cs);
      var fadeDrawFn = FD['drawDrone' + activeDroneType.charAt(0).toUpperCase() + activeDroneType.slice(1)];
      if (fadeDrawFn) fadeDrawFn(drone.propPhase); else FD.drawDroneQuad(drone.propPhase);
      ctx.restore();
    }

    // Nuking idle drone
    if (state === 'nuking') {
      drone.propPhase += 0.5;
      drone.y = H / 2 + Math.sin(FD.globalTick * 0.025) * 14;
      drone.angle = Math.sin(FD.globalTick * 0.018) * 0.04;
      FD.drawDrone(drone.x, drone.y, drone.angle, drone.propPhase, activeDroneType);
    }

    // Fixed timestep: update logic at 60fps regardless of display refresh rate
    var now = performance.now();
    updateAccum += now - lastFrameTime;
    lastFrameTime = now;
    // Cap accumulator to prevent spiral of death on tab-switch
    if (updateAccum > FRAME_MS * 4) updateAccum = FRAME_MS * 4;
    while (updateAccum >= FRAME_MS) {
      FD.globalTick++;
      FD.updateFireworks();
      update();
      updateAccum -= FRAME_MS;
    }

    requestAnimationFrame(render);
  }

  // ---------------------------------------------------------------
  // Self-executing init
  // ---------------------------------------------------------------
  init();
  FD.showScreen(menuScreen);
  render();
})();
