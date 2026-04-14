// drones.js — Flappy Drone multi-drone system
// All functions attach to window.FD namespace.
// Uses: FD.ctx, FD.globalTick

(function () {
  const FD = window.FD || (window.FD = {});

  // --- Pixel Quad (default) ---
  FD.drawDroneQuad = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-10, 13, 20, 3);
    // Body
    ctx.fillStyle = '#3a3a4a'; ctx.fillRect(-14, -3, 28, 7);
    ctx.fillStyle = '#4a4a5a'; ctx.fillRect(-12, -2, 24, 5);
    // Cabin
    ctx.fillStyle = '#00c8f0'; ctx.fillRect(-4, -5, 8, 11);
    ctx.fillStyle = '#009abb'; ctx.fillRect(-3, -4, 6, 9);
    // Blinker
    ctx.fillStyle = FD.globalTick % 40 < 20 ? '#ff2255' : '#551122'; ctx.fillRect(-1, -7, 2, 2);
    // Motor mounts
    ctx.fillStyle = '#505060'; ctx.fillRect(-18, -1, 7, 3); ctx.fillRect(11, -1, 7, 3);
    // Props (centred on mount centres)
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 12;
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#bbc';
    ctx.fillRect(-14.5 - propW / 2, -4, propW, 2);
    ctx.fillRect(14.5 - propW / 2, -4, propW, 2);
    ctx.globalAlpha = 1;
    // Landing gear
    ctx.fillStyle = '#555565';
    ctx.fillRect(-10, 5, 2, 4); ctx.fillRect(8, 5, 2, 4);
    ctx.fillRect(-12, 8, 8, 2); ctx.fillRect(4, 8, 8, 2);
  };

  // --- Stealth drone ---
  FD.drawDroneStealth = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-12, 11, 24, 2);
    // Angular body
    ctx.fillStyle = '#2a2a35';
    ctx.beginPath();
    ctx.moveTo(-16, 0); ctx.lineTo(-8, -4); ctx.lineTo(8, -4);
    ctx.lineTo(16, 0); ctx.lineTo(8, 3); ctx.lineTo(-8, 3);
    ctx.closePath(); ctx.fill();
    // Upper surface highlight
    ctx.fillStyle = '#35354a';
    ctx.beginPath();
    ctx.moveTo(-7, -3); ctx.lineTo(7, -3); ctx.lineTo(12, 0); ctx.lineTo(-12, 0);
    ctx.closePath(); ctx.fill();
    // Green sensor
    const glow = 0.6 + Math.sin(FD.globalTick * 0.08) * 0.3;
    ctx.fillStyle = `rgba(0, 255, 120, ${glow})`; ctx.fillRect(-2, -2, 4, 2);
    ctx.fillStyle = `rgba(0, 255, 120, ${glow * 0.3})`; ctx.fillRect(-4, -2, 8, 2);
    // Motor pods
    ctx.fillStyle = '#222230'; ctx.fillRect(-20, -2, 6, 4); ctx.fillRect(14, -2, 6, 4);
    // Pod lights
    ctx.fillStyle = `rgba(0, 200, 255, ${0.3 + Math.sin(FD.globalTick * 0.12) * 0.15})`;
    ctx.fillRect(-19, 1, 4, 1); ctx.fillRect(15, 1, 4, 1);
    // Props
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 10;
    ctx.globalAlpha = 0.6; ctx.fillStyle = '#aac';
    ctx.fillRect(-17 - propW / 2, -3, propW, 1);
    ctx.fillRect(17 - propW / 2, -3, propW, 1);
    ctx.globalAlpha = 1;
    // Antenna
    ctx.fillStyle = '#444'; ctx.fillRect(0, -6, 1, 3);
    ctx.fillStyle = '#ff3344'; ctx.fillRect(0, -7, 1, 1);
  };

  // --- Heavy Lift drone ---
  FD.drawDroneHeavy = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-14, 14, 28, 3);
    // Body
    ctx.fillStyle = '#3d3530'; ctx.fillRect(-10, -4, 20, 10);
    ctx.fillStyle = '#4a4238'; ctx.fillRect(-9, -3, 18, 8);
    // Warning stripes
    ctx.fillStyle = '#cc8800'; ctx.fillRect(-9, 2, 18, 2);
    ctx.fillStyle = '#3d3530';
    for (let i = 0; i < 6; i++) ctx.fillRect(-9 + i * 6, 2, 3, 2);
    // Cockpit window
    ctx.fillStyle = '#335577'; ctx.fillRect(-3, -3, 6, 4);
    ctx.fillStyle = '#4477aa'; ctx.fillRect(-2, -2, 4, 2);
    // Motor arms
    ctx.fillStyle = '#332e28'; ctx.fillRect(-20, -2, 12, 4); ctx.fillRect(8, -2, 12, 4);
    // Motor housings (coaxial — tall)
    ctx.fillStyle = '#444038'; ctx.fillRect(-22, -5, 5, 10); ctx.fillRect(17, -5, 5, 10);
    ctx.fillStyle = '#3a3630'; ctx.fillRect(-20.5, -4, 2, 8); ctx.fillRect(18.5, -4, 2, 8);
    // Top rotors
    const spin = Math.abs(Math.sin(propPhase));
    const spinB = Math.abs(Math.sin(propPhase + 1.2));
    const propW = spin * 14;
    const propWB = spinB * 12;
    ctx.globalAlpha = 0.65; ctx.fillStyle = '#bbaa88';
    ctx.fillRect(-19.5 - propW / 2, -6, propW, 2);
    ctx.fillRect(19.5 - propW / 2, -6, propW, 2);
    // Bottom rotors
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#aa9977';
    ctx.fillRect(-19.5 - propWB / 2, 4, propWB, 2);
    ctx.fillRect(19.5 - propWB / 2, 4, propWB, 2);
    ctx.globalAlpha = 1;
    // Landing gear
    ctx.fillStyle = '#555045';
    ctx.fillRect(-12, 6, 3, 6); ctx.fillRect(9, 6, 3, 6);
    ctx.fillRect(-14, 11, 7, 2); ctx.fillRect(7, 11, 7, 2);
    // Cargo hook
    ctx.fillStyle = '#666'; ctx.fillRect(-1, 6, 2, 3);
    ctx.fillStyle = '#888'; ctx.fillRect(-2, 8, 4, 2);
    // Warning blinkers
    ctx.fillStyle = FD.globalTick % 30 < 15 ? '#ff8800' : '#553300';
    ctx.fillRect(-9, -4, 2, 1); ctx.fillRect(7, -4, 2, 1);
  };

  // --- FPV Racer drone ---
  FD.drawDroneRacer = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(-10, 10, 20, 2);
    // Body
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(-8, -2, 16, 6);
    ctx.fillStyle = '#252535'; ctx.fillRect(-7, -2, 14, 2);
    // Pink accent stripe
    ctx.fillStyle = '#ff0066'; ctx.fillRect(-7, 0, 14, 1);
    // Camera pod
    ctx.fillStyle = '#333'; ctx.fillRect(5, -4, 4, 3);
    ctx.fillStyle = `rgba(255, 0, 80, ${0.4 + Math.sin(FD.globalTick * 0.1) * 0.2})`;
    ctx.fillRect(6, -3, 2, 1);
    // Motor arms
    ctx.fillStyle = '#222233'; ctx.fillRect(-20, -1, 11, 2); ctx.fillRect(9, -1, 11, 2);
    // Motor housings
    ctx.fillStyle = '#2a2a3a'; ctx.fillRect(-20, -3, 4, 6); ctx.fillRect(16, -3, 4, 6);
    // Pink motor caps
    ctx.fillStyle = '#ff0066'; ctx.fillRect(-20, -3, 4, 1); ctx.fillRect(16, -3, 4, 1);
    // Props
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 12;
    ctx.globalAlpha = 0.65; ctx.fillStyle = '#ccd';
    ctx.fillRect(-18 - propW / 2, -4, propW, 1);
    ctx.fillRect(18 - propW / 2, -4, propW, 1);
    ctx.globalAlpha = 1;
    // Rear LED bar
    ctx.fillStyle = '#ff0066'; ctx.fillRect(-3, 4, 6, 2);
    ctx.fillStyle = '#cc0055'; ctx.fillRect(-2, 4, 4, 2);
    // Landing gear
    ctx.fillStyle = '#444';
    ctx.fillRect(-6, 4, 1, 4); ctx.fillRect(5, 4, 1, 4);
    ctx.fillRect(-8, 7, 5, 1); ctx.fillRect(3, 7, 5, 1);
  };

  // --- Osprey (Tiltrotor) ---
  FD.drawDroneOsprey = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(-12, 10, 24, 2);
    // Fuselage
    ctx.fillStyle = '#3a3a44'; ctx.fillRect(-10, -2, 20, 5);
    ctx.fillStyle = '#4a4a54'; ctx.fillRect(-8, -1, 16, 3);
    // Nacelles (tilted)
    ctx.fillStyle = '#2e2e38'; ctx.fillRect(-14, -3, 5, 6); ctx.fillRect(9, -3, 5, 6);
    // Large props centred on nacelles
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 16;
    ctx.globalAlpha = 0.65; ctx.fillStyle = '#bbc';
    ctx.fillRect(-11.5 - propW / 2, -4, propW, 2);
    ctx.fillRect(11.5 - propW / 2, -4, propW, 2);
    ctx.globalAlpha = 1;
    // Tail
    ctx.fillStyle = '#3a3a44'; ctx.fillRect(-3, 2, 6, 1);
    // Cockpit
    ctx.fillStyle = '#446688'; ctx.fillRect(6, -1, 3, 2);
    // Antenna + red blinker
    ctx.fillStyle = '#444'; ctx.fillRect(0, -5, 1, 3);
    ctx.fillStyle = FD.globalTick % 40 < 20 ? '#ff2255' : '#551122'; ctx.fillRect(0, -5, 1, 1);
    // Landing skids
    ctx.fillStyle = '#555565';
    ctx.fillRect(-9, 3, 1, 4); ctx.fillRect(8, 3, 1, 4);
    ctx.fillRect(-11, 6, 6, 1); ctx.fillRect(5, 6, 6, 1);
  };

  // --- Dragonfly (Insect tandem wings) ---
  FD.drawDroneDragonfly = function (propPhase) {
    const ctx = FD.ctx;
    // Slim body
    ctx.fillStyle = '#2a3040'; ctx.fillRect(-6, -1, 12, 3);
    ctx.fillStyle = '#3a4a5a'; ctx.fillRect(-5, 0, 10, 1);
    // Head
    ctx.fillStyle = '#3a4a5a'; ctx.fillRect(5, -2, 4, 4);
    // Green eye (pulsing glow)
    const eyeGlow = 0.6 + Math.sin(FD.globalTick * 0.1) * 0.3;
    ctx.fillStyle = `rgba(100,255,200,${eyeGlow})`; ctx.fillRect(7, -1, 2, 2);
    // 4 tandem wings with iridescent shimmer
    const wingPhases = [0, 0.8, 0.4, 1.2];
    const wingPositions = [[-4, -1], [-1, -1], [2, -1], [5, -1]];
    for (let i = 0; i < 4; i++) {
      const phase = propPhase + wingPhases[i];
      const flap = Math.sin(phase) * 0.6;
      const hue = 180 + Math.sin(FD.globalTick * 0.04 + i * 1.2) * 20;
      const alpha = 0.25 + Math.abs(Math.sin(phase)) * 0.15;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(wingPositions[i][0], wingPositions[i][1] - 3 + flap * 2, 4, 2 + Math.abs(flap) * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Tail segment with green blinker
    ctx.fillStyle = '#2a3040'; ctx.fillRect(-8, 0, 3, 1);
    ctx.fillStyle = FD.globalTick % 36 < 18 ? 'rgba(100,255,200,0.8)' : 'rgba(100,255,200,0.15)';
    ctx.fillRect(-8, 0, 1, 1);
  };

  // --- Disc (UFO disc) ---
  FD.drawDroneDisc = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 10, 12, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Disc body
    ctx.fillStyle = '#2a2a3e';
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Upper dome
    ctx.fillStyle = '#353550';
    ctx.beginPath(); ctx.ellipse(0, -2, 10, 4, 0, Math.PI, Math.PI * 2); ctx.fill();
    // Top highlight
    ctx.fillStyle = '#404060'; ctx.fillRect(-3, -5, 6, 2);
    // Ring of 8 lights underneath
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 / 8) * i + FD.globalTick * 0.03;
      const lx = Math.cos(a) * 12;
      const ly = Math.sin(a) * 3 + 2;
      const bright = (Math.floor(FD.globalTick * 0.08 + i) % 3 === 0);
      ctx.fillStyle = bright ? 'rgba(0,200,255,0.6)' : 'rgba(0,200,255,0.1)';
      ctx.beginPath(); ctx.arc(lx, ly, 1.2, 0, Math.PI * 2); ctx.fill();
    }
    // Centre bottom glow (pulsing cyan)
    const glowPulse = 0.3 + Math.sin(FD.globalTick * 0.08) * 0.2;
    const bottomGlow = ctx.createRadialGradient(0, 3, 0, 0, 3, 3);
    bottomGlow.addColorStop(0, `rgba(0,200,255,${glowPulse})`);
    bottomGlow.addColorStop(1, 'rgba(0,200,255,0)');
    ctx.fillStyle = bottomGlow;
    ctx.beginPath(); ctx.arc(0, 3, 3, 0, Math.PI * 2); ctx.fill();
    // Cockpit window
    ctx.fillStyle = '#446688';
    ctx.beginPath(); ctx.ellipse(0, -2, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  };

  // --- Spider (6-arm hexacopter) ---
  FD.drawDroneSpider = function (propPhase) {
    const ctx = FD.ctx;
    // Central pod
    ctx.fillStyle = '#3a3a4e';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2e2e3e';
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
    // Red sensor eye (pulsing)
    const eyePulse = 0.5 + Math.sin(FD.globalTick * 0.1) * 0.4;
    ctx.fillStyle = `rgba(255,50,50,${eyePulse})`;
    ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI * 2); ctx.fill();
    // 6 arms at 60-degree intervals
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i;
      const tipX = Math.cos(a) * 13;
      const tipY = Math.sin(a) * 13;
      // Arm stroke
      ctx.strokeStyle = '#444458'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(tipX, tipY); ctx.stroke();
      // Motor housing at tip
      ctx.fillStyle = '#333345';
      ctx.beginPath(); ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2); ctx.fill();
      // Prop on each tip
      const spin = Math.abs(Math.sin(propPhase + i * 0.5));
      const pW = spin * 8;
      ctx.globalAlpha = 0.55; ctx.fillStyle = '#bbc';
      ctx.fillRect(tipX - pW / 2, tipY - 1, pW, 1);
      ctx.globalAlpha = 1;
    }
    // Two landing legs
    ctx.fillStyle = '#555565';
    ctx.fillRect(-4, 5, 1, 5); ctx.fillRect(3, 5, 1, 5);
    ctx.fillRect(-6, 9, 5, 1); ctx.fillRect(2, 9, 5, 1);
  };

  // --- Jetwing (swept delta) ---
  FD.drawDroneJetwing = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 10, 14, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Fuselage
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.moveTo(12, 0); ctx.lineTo(-4, -2); ctx.lineTo(-8, 0); ctx.lineTo(-4, 2);
    ctx.closePath(); ctx.fill();
    // Inner fuselage highlight
    ctx.fillStyle = '#353548';
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.lineTo(-3, -1.5); ctx.lineTo(-6, 0); ctx.lineTo(-3, 1.5);
    ctx.closePath(); ctx.fill();
    // Swept delta wings — top
    ctx.fillStyle = '#222235';
    ctx.beginPath();
    ctx.moveTo(2, -1); ctx.lineTo(-6, -8); ctx.lineTo(-10, -7); ctx.lineTo(-3, 0);
    ctx.closePath(); ctx.fill();
    // Swept delta wings — bottom (mirror)
    ctx.beginPath();
    ctx.moveTo(2, 1); ctx.lineTo(-6, 8); ctx.lineTo(-10, 7); ctx.lineTo(-3, 0);
    ctx.closePath(); ctx.fill();
    // Jet nacelles on wingtips
    ctx.fillStyle = '#333348';
    ctx.fillRect(-10, -8, 3, 2);
    ctx.fillRect(-10, 6, 3, 2);
    // Jet glow (pulsing blue at nacelle rears)
    const jetGlow = 0.4 + Math.sin(FD.globalTick * 0.12) * 0.2;
    ctx.fillStyle = `rgba(80,160,255,${jetGlow})`;
    ctx.fillRect(-10, -7.5, 1, 1);
    ctx.fillRect(-10, 6.5, 1, 1);
    // Canopy
    ctx.fillStyle = '#446688';
    ctx.fillRect(4, -1, 3, 2);
    // VTOL props on wing roots
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 8;
    ctx.globalAlpha = 0.4; ctx.fillStyle = '#bbc';
    ctx.fillRect(-2 - propW / 2, -4.5, propW, 1);
    ctx.fillRect(-2 - propW / 2, 3, propW, 1);
    ctx.globalAlpha = 1;
    // Red blinker
    ctx.fillStyle = FD.globalTick % 40 < 20 ? '#ff2255' : '#551122';
    ctx.fillRect(-8.5, -0.5, 1, 1);
  };

  // --- Balloon (Floater) ---
  FD.drawDroneBalloon = function (propPhase) {
    const ctx = FD.ctx;
    const bob = Math.sin(FD.globalTick * 0.03) * 2;
    // Balloon body
    ctx.fillStyle = '#3a2a4a';
    ctx.beginPath(); ctx.arc(0, bob, 7, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = '#4a3a5a';
    ctx.beginPath(); ctx.arc(-2, -2 + bob, 4, 0, Math.PI * 2); ctx.fill();
    // Shine
    ctx.fillStyle = 'rgba(200,180,240,0.15)';
    ctx.beginPath(); ctx.arc(-3, -3 + bob, 2, 0, Math.PI * 2); ctx.fill();
    // Eyes on balloon
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-2.5, -1 + bob, 1.5, 1.5);
    ctx.fillRect(1, -1 + bob, 1.5, 1.5);
    // Tether
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 7 + bob);
    ctx.quadraticCurveTo(1, 9 + bob, 0, 11 + bob);
    ctx.stroke();
    // Gondola
    ctx.fillStyle = '#333345';
    ctx.fillRect(-3, 11 + bob, 6, 3);
    // Tiny prop below gondola
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 6;
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#bbc';
    ctx.fillRect(0 - propW / 2, 14 + bob, propW, 1);
    ctx.globalAlpha = 1;
    // Orange blinker on gondola
    ctx.fillStyle = FD.globalTick % 36 < 18 ? '#ff8800' : '#553300';
    ctx.fillRect(-1, 11.5 + bob, 2, 1);
  };

  // --- Paper Plane (Origami) ---
  FD.drawDronePaperplane = function (propPhase) {
    const ctx = FD.ctx;
    const glide = Math.sin(FD.globalTick * 0.025) * 2;
    // Shadow
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 12, 10, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Top fold
    ctx.fillStyle = '#c8c8d8';
    ctx.beginPath();
    ctx.moveTo(14, glide); ctx.lineTo(-8, -5 + glide); ctx.lineTo(-6, glide);
    ctx.closePath(); ctx.fill();
    // Bottom fold
    ctx.fillStyle = '#a8a8b8';
    ctx.beginPath();
    ctx.moveTo(14, glide); ctx.lineTo(-8, 5 + glide); ctx.lineTo(-6, glide);
    ctx.closePath(); ctx.fill();
    // Crease line
    ctx.strokeStyle = '#9898a8';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(14, glide); ctx.lineTo(-6, glide);
    ctx.stroke();
    // 3 trailing sparkle dots behind the plane, fading
    for (let i = 0; i < 3; i++) {
      const sx = -10 - i * 5;
      const sy = glide + Math.sin(FD.globalTick * 0.05 + i * 1.5) * 1.5;
      const alpha = 0.4 - i * 0.12;
      ctx.fillStyle = `rgba(200,200,220,${alpha})`;
      ctx.beginPath(); ctx.arc(sx, sy, 1.2 - i * 0.2, 0, Math.PI * 2); ctx.fill();
    }
  };

  // --- Chopper (Helicopter) ---
  FD.drawDroneChopper = function (propPhase) {
    const ctx = FD.ctx;
    // Body
    ctx.fillStyle = '#2e3038';
    ctx.beginPath(); ctx.ellipse(0, 2, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Inner lighter ellipse
    ctx.fillStyle = '#3a3c48';
    ctx.beginPath(); ctx.ellipse(0, 2, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    // Cockpit
    ctx.fillStyle = '#446688';
    ctx.beginPath(); ctx.ellipse(4, 1, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    // Rotor mast
    ctx.fillStyle = '#444';
    ctx.fillRect(-0.5, -7, 1, 3);
    // Main rotor
    const spin = Math.abs(Math.sin(propPhase));
    const mainW = spin * 20;
    ctx.globalAlpha = 0.55; ctx.fillStyle = '#bbc';
    ctx.fillRect(0 - mainW / 2, -7.5, mainW, 1.5);
    // Counter-rotating rotor (offset phase)
    const spin2 = Math.abs(Math.sin(propPhase + 1.0));
    const secW = spin2 * 18;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0 - secW / 2, -6, secW, 1);
    ctx.globalAlpha = 1;
    // Tail boom
    ctx.fillStyle = '#2e3038';
    ctx.fillRect(-12, -1, 5, 2);
    // Tail stabiliser (vertical)
    ctx.fillStyle = '#2e3038';
    ctx.fillRect(-13, -4, 1.5, 5);
    // Tail rotor (vertical spin)
    const tailSpin = Math.abs(Math.sin(propPhase * 1.5));
    const tailH = tailSpin * 6;
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#bbc';
    ctx.fillRect(-14, -4 - tailH / 2 + 2.5, 1, tailH);
    ctx.globalAlpha = 1;
    // Skids — legs
    ctx.fillStyle = '#555565';
    ctx.fillRect(-4, 6, 1, 4);
    ctx.fillRect(3, 6, 1, 4);
    // Skids — horizontal bars
    ctx.fillRect(-6, 9, 5, 1);
    ctx.fillRect(2, 9, 5, 1);
    // Red blinker at rotor mast top
    ctx.fillStyle = FD.globalTick % 40 < 20 ? '#ff2255' : '#551122';
    ctx.fillRect(-0.5, -8, 1, 1);
  };

  // --- Gyro (Autogyro / Whirlybird) ---
  FD.drawDroneGyro = function (propPhase) {
    const ctx = FD.ctx;
    // Tail boom
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(-14, -0.5, 11, 1.2);
    // Vertical stabilizer at tail
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.moveTo(-14, -0.5); ctx.lineTo(-15, -4); ctx.lineTo(-12.5, -0.5);
    ctx.closePath(); ctx.fill();
    // Horizontal stabilizer
    ctx.beginPath();
    ctx.moveTo(-14.5, 0.3); ctx.lineTo(-16, 2); ctx.lineTo(-12, 0.3);
    ctx.closePath(); ctx.fill();
    // Fuselage pod
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.quadraticCurveTo(6, -4, 6, 0);
    ctx.quadraticCurveTo(6, 4, -3, 3.5);
    ctx.lineTo(-3, -3);
    ctx.closePath(); ctx.fill();
    // Body highlight
    ctx.fillStyle = '#4a4a5a';
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.quadraticCurveTo(5, -3, 5, 0);
    ctx.quadraticCurveTo(5, 3, -2, 2.5);
    ctx.lineTo(-2, -2);
    ctx.closePath(); ctx.fill();
    // Blue canopy
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#3366aa';
    ctx.beginPath();
    ctx.moveTo(1, -2.5);
    ctx.quadraticCurveTo(5.5, -3, 5.5, -0.5);
    ctx.lineTo(1, -0.5);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    // Canopy glint
    ctx.fillStyle = 'rgba(100,180,255,0.3)';
    ctx.fillRect(3, -2.2, 1, 0.5);
    // Rotor mast
    ctx.fillStyle = '#555';
    ctx.fillRect(0.5, -9, 0.8, 6);
    // Overhead rotor — 3 blades, slow spin
    const spin = Math.abs(Math.sin(propPhase * 0.6));
    const mainW = spin * 22;
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#bbc';
    ctx.fillRect(1 - mainW / 2, -9.5, mainW, 1.2);
    ctx.globalAlpha = 1;
    // Rotor hub
    ctx.fillStyle = '#777';
    ctx.beginPath(); ctx.arc(1, -9, 0.8, 0, Math.PI * 2); ctx.fill();
    // Pusher prop at rear
    const pushSpin = Math.abs(Math.sin(propPhase * 2));
    const pushH = pushSpin * 5;
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#999';
    ctx.fillRect(-3.8, -pushH / 2, 0.6, pushH);
    ctx.globalAlpha = 1;
    // Wheel landing gear
    ctx.strokeStyle = '#444'; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(1, 3); ctx.lineTo(-1, 7);
    ctx.moveTo(1, 3); ctx.lineTo(4, 7);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(-1, 7.5, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, 7.5, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(-1, 7.5, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, 7.5, 0.4, 0, Math.PI * 2); ctx.fill();
    // Nav blinker
    ctx.fillStyle = FD.globalTick % 45 < 22 ? '#ff3355' : '#661122';
    ctx.beginPath(); ctx.arc(-14.5, -3, 0.5, 0, Math.PI * 2); ctx.fill();
  };

  // --- Blimp (Zephyr) ---
  FD.drawDroneBlimp = function (propPhase) {
    const ctx = FD.ctx;
    const bob = Math.sin(FD.globalTick * 0.03) * 2;
    // Ambient glow underneath
    ctx.save();
    ctx.globalAlpha = 0.08;
    const glow = ctx.createRadialGradient(0, 6 + bob, 0, 0, 6 + bob, 12);
    glow.addColorStop(0, '#ffdc64'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-14, -6 + bob, 28, 24);
    ctx.restore();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath(); ctx.ellipse(0, 14, 10, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    // Main envelope
    ctx.fillStyle = '#3a3048';
    ctx.beginPath(); ctx.ellipse(0, bob, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = '#4a4060';
    ctx.beginPath(); ctx.ellipse(0, -1.5 + bob, 13, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    // Tail fins
    ctx.fillStyle = '#2a2038';
    ctx.beginPath(); ctx.moveTo(-14, -1 + bob); ctx.lineTo(-18, -5 + bob); ctx.lineTo(-16, -0.5 + bob); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, 1 + bob); ctx.lineTo(-18, 5 + bob); ctx.lineTo(-16, 0.5 + bob); ctx.closePath(); ctx.fill();
    // Windows
    ctx.fillStyle = '#aaccff';
    for (var i = 0; i < 4; i++) {
      ctx.globalAlpha = 0.7 + Math.sin(FD.globalTick * 0.05 + i) * 0.15;
      ctx.fillRect(-4 + i * 3, 2.5 + bob, 1.5, 1);
    }
    ctx.globalAlpha = 1;
    // Tethers
    ctx.strokeStyle = '#555'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-2, 5.8 + bob); ctx.lineTo(-2, 9 + bob); ctx.moveTo(3, 5.8 + bob); ctx.lineTo(3, 9 + bob); ctx.stroke();
    // Gondola
    ctx.fillStyle = '#2a2038';
    ctx.fillRect(-3.5, 9 + bob, 8, 2.5);
    ctx.fillStyle = '#353050';
    ctx.fillRect(-3, 9.2 + bob, 7, 1.8);
    // Pusher prop
    var spin = Math.abs(Math.sin(propPhase * 1.5));
    var pH = spin * 4;
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#888';
    ctx.fillRect(-16.8, -pH / 2 + bob, 0.6, pH);
    ctx.globalAlpha = 1;
    // Nav light
    ctx.fillStyle = FD.globalTick % 50 < 25 ? '#ff3355' : '#661122';
    ctx.beginPath(); ctx.arc(15.5, bob, 0.7, 0, Math.PI * 2); ctx.fill();
  };

  // --- Tandem (Warhorse / Chinook-style) ---
  FD.drawDroneTandem = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath(); ctx.ellipse(0, 14, 12, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Skid rails
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(-11, 8.5, 22, 1);
    // Skid legs
    ctx.strokeStyle = '#3a3a2a'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, 6); ctx.lineTo(-9, 8.5);
    ctx.moveTo(8, 6); ctx.lineTo(9, 8.5);
    ctx.moveTo(-4, 6); ctx.lineTo(-5, 8.5);
    ctx.moveTo(4, 6); ctx.lineTo(5, 8.5);
    ctx.stroke();
    // Body
    ctx.fillStyle = '#3a3a2a';
    ctx.beginPath();
    ctx.moveTo(-11, -1); ctx.lineTo(11, -1);
    ctx.quadraticCurveTo(13, 2.5, 11, 6);
    ctx.lineTo(-11, 6);
    ctx.quadraticCurveTo(-13, 2.5, -11, -1);
    ctx.closePath(); ctx.fill();
    // Body highlight
    ctx.fillStyle = '#4a4a3a';
    ctx.fillRect(-10, 0, 20, 3);
    // Cargo door
    ctx.strokeStyle = '#555'; ctx.lineWidth = 0.6;
    ctx.strokeRect(-11, 1, 3, 4);
    // Windows
    ctx.fillStyle = '#556655';
    ctx.fillRect(-3, 0.2, 1.5, 1.2);
    ctx.fillRect(1, 0.2, 1.5, 1.2);
    ctx.fillRect(5, 0.2, 1.5, 1.2);
    // Rotor masts
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(7, -4, 1.5, 3.5);
    ctx.fillRect(-8.5, -4, 1.5, 3.5);
    // Front rotor
    var spin1 = Math.abs(Math.sin(propPhase));
    var w1 = spin1 * 18;
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#aab';
    ctx.fillRect(8 - w1 / 2, -4.5, w1, 1.2);
    // Rear rotor (offset phase)
    var spin2 = Math.abs(Math.sin(propPhase + 0.8));
    var w2 = spin2 * 18;
    ctx.fillRect(-8 - w2 / 2, -4.5, w2, 1.2);
    ctx.globalAlpha = 1;
    // Rotor hubs
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(8, -4, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-8, -4, 1, 0, Math.PI * 2); ctx.fill();
    // Red blinker
    var blink = FD.globalTick % 40 < 20;
    ctx.fillStyle = blink ? '#ff2233' : '#551111';
    ctx.beginPath(); ctx.arc(0, -1.5, 0.8, 0, Math.PI * 2); ctx.fill();
    if (blink) {
      ctx.fillStyle = 'rgba(255,34,51,0.15)';
      ctx.beginPath(); ctx.arc(0, -1.5, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  };

  // --- Silhouette parts (for nuke backlight) ---
  // ============================================================
  // === FLEET WAVE 5 — silly + cool additions =================
  // Pizza Box · Toaster · Bumblebee · Origami Crane · Witch Broom
  // ============================================================

  // --- Pizza Box ---
  FD.drawDronePizzabox = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(-13, 12, 26, 3);
    // Cardboard box body
    ctx.fillStyle = '#c8a070'; ctx.fillRect(-15, -5, 30, 11);
    ctx.fillStyle = '#a07c4c'; ctx.fillRect(-15, 4, 30, 2); // shadow under lid
    ctx.fillStyle = '#dab48a'; ctx.fillRect(-14, -4, 28, 2); // top highlight
    // Lid edge
    ctx.fillStyle = '#8c6840'; ctx.fillRect(-15, -5, 30, 1);
    // Greasy spots
    ctx.fillStyle = 'rgba(80,40,10,0.35)';
    ctx.beginPath(); ctx.arc(-7, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 1, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -2, 1.5, 0, Math.PI*2); ctx.fill();
    // Logo (red triangle "slice" mark)
    ctx.fillStyle = '#cc2a2a';
    ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(2, -2); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill();
    // Rotors poking out the four corners
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 11;
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#999';
    ctx.fillRect(-19 - propW/2, -6, propW, 1.5); ctx.fillRect(19 - propW/2, -6, propW, 1.5);
    ctx.fillRect(-19 - propW/2,  6, propW, 1.5); ctx.fillRect(19 - propW/2,  6, propW, 1.5);
    ctx.globalAlpha = 1;
    // Motor pegs
    ctx.fillStyle = '#444'; ctx.fillRect(-17, -7, 2, 2); ctx.fillRect(15, -7, 2, 2);
    ctx.fillRect(-17,  6, 2, 2); ctx.fillRect(15,  6, 2, 2);
  };

  // --- Toaster Drone ---
  FD.drawDroneToaster = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(-10, 11, 20, 3);
    // Chrome body
    ctx.fillStyle = '#d8dce0'; ctx.fillRect(-11, -6, 22, 13);
    ctx.fillStyle = '#f4f6f8'; ctx.fillRect(-10, -6, 20, 3); // top highlight
    ctx.fillStyle = '#9aa0a6'; ctx.fillRect(-11, 5, 22, 2);  // bottom shadow
    // Two slots on top
    ctx.fillStyle = '#1a1a22'; ctx.fillRect(-8, -5, 6, 2); ctx.fillRect(2, -5, 6, 2);
    // Toast popping out (shifts up/down slightly)
    const toastY = -8 + Math.sin(FD.globalTick * 0.05) * 1.2;
    ctx.fillStyle = '#d4a060'; ctx.fillRect(-7, toastY, 4, 4);
    ctx.fillStyle = '#a87838'; ctx.fillRect(-7, toastY + 3, 4, 1); // crust
    // Lever
    ctx.fillStyle = '#888'; ctx.fillRect(8, -2, 2, 4);
    ctx.fillStyle = '#cc4422'; ctx.fillRect(8, -2, 2, 1.5); // red knob
    // Crumb shower (exhaust)
    ctx.fillStyle = '#a87038';
    for (let i=0; i<5; i++) {
      const cx = -6 + i*3 + (FD.globalTick*0.3 + i*7)%4 - 2;
      const cy = 8 + (FD.globalTick*0.4 + i*11)%5;
      ctx.fillRect(cx, cy, 1, 1);
    }
    // Indicator dial
    ctx.fillStyle = '#ffaa22'; ctx.fillRect(-3, 0, 4, 3);
    ctx.fillStyle = '#1a1a22'; ctx.fillRect(-1, 1, 2, 1);
    // Rotors (small, hidden behind chrome)
    const spin = Math.abs(Math.sin(propPhase));
    const propW = spin * 9;
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#bbb';
    ctx.fillRect(-15 - propW/2, -3, propW, 1.5); ctx.fillRect(15 - propW/2, -3, propW, 1.5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#666'; ctx.fillRect(-14, -4, 3, 2); ctx.fillRect(11, -4, 3, 2);
  };

  // --- Bumblebee ---
  FD.drawDroneBumblebee = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(-9, 9, 18, 3);
    // Plump body — yellow/black stripes
    ctx.fillStyle = '#1a1a14';
    ctx.beginPath(); ctx.ellipse(0, 1, 11, 7, 0, 0, Math.PI*2); ctx.fill();
    // Yellow stripes
    ctx.fillStyle = '#ffcc22';
    ctx.fillRect(-8, -2, 5, 4);
    ctx.fillRect(2, -2, 5, 4);
    // Top fuzz highlight
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(-7, -4, 4, 2); ctx.fillRect(3, -4, 4, 2);
    // Big eyes
    ctx.fillStyle = '#2a1a08'; ctx.fillRect(-9, -3, 3, 3); ctx.fillRect(6, -3, 3, 3);
    ctx.fillStyle = '#fff'; ctx.fillRect(-8, -2, 1, 1); ctx.fillRect(7, -2, 1, 1);
    // Tiny antennae with bobble
    ctx.fillStyle = '#222';
    ctx.fillRect(-5, -7, 1, 3); ctx.fillRect(4, -7, 1, 3);
    ctx.beginPath(); ctx.arc(-4.5, -8, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.5, -8, 1, 0, Math.PI*2); ctx.fill();
    // Stinger
    ctx.fillStyle = '#444'; ctx.beginPath();
    ctx.moveTo(11, 0); ctx.lineTo(15, 1); ctx.lineTo(11, 2); ctx.closePath(); ctx.fill();
    // Buzzing wing blur (translucent)
    const buzz = Math.sin(propPhase * 4) * 1.5;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ddeeff';
    ctx.beginPath(); ctx.ellipse(-3, -5 + buzz*0.3, 7, 3, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, -5 - buzz*0.3, 7, 3, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  };

  // --- Origami Crane ---
  FD.drawDroneCrane = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(-9, 10, 18, 2);
    // Wings flap with propPhase (no rotors)
    const flap = Math.sin(propPhase * 2) * 0.4;
    // Left wing
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.lineTo(-14, -4 + flap*4);
    ctx.lineTo(-12, 1 + flap*2); ctx.lineTo(-2, 3);
    ctx.closePath(); ctx.fill();
    // Wing crease shadow
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.lineTo(-10, -2 + flap*3); ctx.lineTo(-2, 2);
    ctx.closePath(); ctx.fill();
    // Right wing
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.lineTo(14, -4 - flap*4);
    ctx.lineTo(12, 1 - flap*2); ctx.lineTo(2, 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.lineTo(10, -2 - flap*3); ctx.lineTo(2, 2);
    ctx.closePath(); ctx.fill();
    // Body — folded rhombus
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -3); ctx.lineTo(5, 1); ctx.lineTo(0, 5); ctx.lineTo(-5, 1);
    ctx.closePath(); ctx.fill();
    // Centre fold line
    ctx.fillStyle = '#cccccc'; ctx.fillRect(-0.5, -3, 1, 8);
    // Long neck + head
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -3); ctx.lineTo(8, -8); ctx.lineTo(9, -7); ctx.lineTo(2, -2);
    ctx.closePath(); ctx.fill();
    // Beak
    ctx.fillStyle = '#ffaa22';
    ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(11, -8); ctx.lineTo(8, -7); ctx.closePath(); ctx.fill();
    // Tail
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-5, 1); ctx.lineTo(-9, -2); ctx.lineTo(-7, 2); ctx.closePath(); ctx.fill();
    // Eye dot
    ctx.fillStyle = '#222'; ctx.fillRect(7, -7, 1, 1);
  };

  // --- Witch Broom ---
  FD.drawDroneBroom = function (propPhase) {
    const ctx = FD.ctx;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-12, 11, 24, 2);
    // Broom-stick body (long horizontal)
    ctx.fillStyle = '#5a3a18'; ctx.fillRect(-10, -1, 18, 3);
    // Wood grain highlight
    ctx.fillStyle = '#7a5028'; ctx.fillRect(-10, -1, 18, 1);
    // Brush bristles trailing left (bands of straw)
    ctx.fillStyle = '#c8a050';
    ctx.beginPath();
    ctx.moveTo(-10, -2); ctx.lineTo(-18, -4); ctx.lineTo(-18, 4); ctx.lineTo(-10, 3);
    ctx.closePath(); ctx.fill();
    // Bristle strands
    ctx.fillStyle = '#a07830';
    for (let i=0; i<6; i++) {
      const y = -3 + i*1.2;
      ctx.fillRect(-17, y, 7, 0.6);
    }
    // Binding twine
    ctx.fillStyle = '#3a2a18'; ctx.fillRect(-11, -2, 1.5, 5);
    ctx.fillStyle = '#1a1208'; ctx.fillRect(-11, 0, 1.5, 1);
    // Witch hat on the right end
    ctx.fillStyle = '#1a1228';
    ctx.beginPath();
    ctx.moveTo(2, -1); ctx.lineTo(11, -10); ctx.lineTo(13, -1);
    ctx.closePath(); ctx.fill();
    // Hat brim
    ctx.fillStyle = '#0a0612'; ctx.fillRect(0, -1, 14, 2);
    // Hat band — moon
    ctx.fillStyle = '#ffcc44';
    ctx.beginPath(); ctx.arc(7, -3, 1.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1228';
    ctx.beginPath(); ctx.arc(8, -3.5, 1, 0, Math.PI*2); ctx.fill();
    // Spark trail (purple magic flicker)
    const flick = (FD.globalTick * 0.3) % 4;
    ctx.fillStyle = `rgba(180,80,255,${0.6 - flick*0.13})`;
    ctx.fillRect(-19 - flick, -1, 2, 1); ctx.fillRect(-21 - flick, 1, 1, 1);
    ctx.fillStyle = `rgba(220,140,255,${0.5})`;
    ctx.fillRect(-15, -2, 1, 1);
  };

  FD.silhouetteParts = {
    quad() {
      const ctx = FD.ctx;
      ctx.fillRect(-14, -3, 28, 7); ctx.fillRect(-4, -5, 8, 11);
      ctx.fillRect(-1, -7, 2, 2); ctx.fillRect(-18, -1, 7, 3); ctx.fillRect(11, -1, 7, 3);
      ctx.fillRect(-10, 5, 2, 4); ctx.fillRect(8, 5, 2, 4);
      ctx.fillRect(-12, 8, 8, 2); ctx.fillRect(4, 8, 8, 2);
    },
    stealth() {
      const ctx = FD.ctx;
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.lineTo(-8, -4); ctx.lineTo(8, -4);
      ctx.lineTo(16, 0); ctx.lineTo(8, 3); ctx.lineTo(-8, 3);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(-20, -2, 6, 4); ctx.fillRect(14, -2, 6, 4);
      ctx.fillRect(0, -7, 1, 4);
    },
    heavy() {
      const ctx = FD.ctx;
      ctx.fillRect(-10, -4, 20, 10); ctx.fillRect(-20, -2, 12, 4); ctx.fillRect(8, -2, 12, 4);
      ctx.fillRect(-22, -5, 5, 10); ctx.fillRect(17, -5, 5, 10);
      ctx.fillRect(-12, 6, 3, 6); ctx.fillRect(9, 6, 3, 6);
      ctx.fillRect(-14, 11, 7, 2); ctx.fillRect(7, 11, 7, 2);
      ctx.fillRect(-2, 6, 4, 4);
    },
    racer() {
      const ctx = FD.ctx;
      ctx.fillRect(-8, -2, 16, 6); ctx.fillRect(5, -4, 4, 3);
      ctx.fillRect(-20, -1, 11, 2); ctx.fillRect(9, -1, 11, 2);
      ctx.fillRect(-20, -3, 4, 6); ctx.fillRect(16, -3, 4, 6);
      ctx.fillRect(-3, 4, 6, 2);
      ctx.fillRect(-6, 4, 1, 4); ctx.fillRect(5, 4, 1, 4);
      ctx.fillRect(-8, 7, 5, 1); ctx.fillRect(3, 7, 5, 1);
    },
    osprey() {
      const ctx = FD.ctx;
      ctx.fillRect(-10, -2, 20, 5);
      ctx.fillRect(-14, -3, 5, 6); ctx.fillRect(9, -3, 5, 6);
      ctx.fillRect(-9, 3, 1, 4); ctx.fillRect(8, 3, 1, 4);
      ctx.fillRect(-11, 6, 6, 1); ctx.fillRect(5, 6, 6, 1);
    },
    dragonfly() {
      const ctx = FD.ctx;
      ctx.fillRect(-6, -1, 12, 3);
      ctx.fillRect(5, -2, 4, 4);
      ctx.fillRect(-8, 0, 3, 1);
    },
    disc() {
      const ctx = FD.ctx;
      ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    },
    spider() {
      const ctx = FD.ctx;
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 13, Math.sin(a) * 13, 2.5, 0, Math.PI * 2); ctx.fill();
      }
    },
    jetwing() {
      const ctx = FD.ctx;
      // Fuselage shape
      ctx.beginPath();
      ctx.moveTo(12, 0); ctx.lineTo(-4, -2); ctx.lineTo(-8, 0); ctx.lineTo(-4, 2);
      ctx.closePath(); ctx.fill();
      // Wing triangles
      ctx.beginPath();
      ctx.moveTo(2, -1); ctx.lineTo(-6, -8); ctx.lineTo(-10, -7); ctx.lineTo(-3, 0);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, 1); ctx.lineTo(-6, 8); ctx.lineTo(-10, 7); ctx.lineTo(-3, 0);
      ctx.closePath(); ctx.fill();
    },
    balloon() {
      const ctx = FD.ctx;
      // Main circle
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      // Gondola rect
      ctx.fillRect(-3, 11, 6, 3);
    },
    paperplane() {
      const ctx = FD.ctx;
      // Top fold triangle
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(-8, -5); ctx.lineTo(-6, 0);
      ctx.closePath(); ctx.fill();
      // Bottom fold triangle
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(-8, 5); ctx.lineTo(-6, 0);
      ctx.closePath(); ctx.fill();
    },
    chopper() {
      const ctx = FD.ctx;
      // Body ellipse
      ctx.beginPath(); ctx.ellipse(0, 2, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
      // Tail boom
      ctx.fillRect(-12, -1, 5, 2);
    },
    gyro() {
      const ctx = FD.ctx;
      ctx.beginPath();
      ctx.moveTo(-3, -3); ctx.quadraticCurveTo(6, -4, 6, 0);
      ctx.quadraticCurveTo(6, 4, -3, 3.5); ctx.lineTo(-3, -3);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(-14, -0.5, 11, 1.2);
      ctx.beginPath(); ctx.moveTo(-14, -0.5); ctx.lineTo(-15, -4); ctx.lineTo(-12.5, -0.5); ctx.closePath(); ctx.fill();
    },
    blimp() {
      const ctx = FD.ctx;
      ctx.beginPath(); ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-3.5, 9, 8, 2.5);
    },
    tandem() {
      const ctx = FD.ctx;
      ctx.beginPath();
      ctx.moveTo(-11, -1); ctx.lineTo(11, -1);
      ctx.quadraticCurveTo(13, 2.5, 11, 6);
      ctx.lineTo(-11, 6);
      ctx.quadraticCurveTo(-13, 2.5, -11, -1);
      ctx.closePath(); ctx.fill();
    },
    pizzabox() {
      const ctx = FD.ctx;
      ctx.fillRect(-15, -5, 30, 11);
      ctx.fillRect(-17, -7, 2, 2); ctx.fillRect(15, -7, 2, 2);
      ctx.fillRect(-17,  6, 2, 2); ctx.fillRect(15,  6, 2, 2);
    },
    toaster() {
      const ctx = FD.ctx;
      ctx.fillRect(-11, -6, 22, 13);
      ctx.fillRect(-7, -8, 4, 4);    // toast
      ctx.fillRect(8, -2, 2, 4);     // lever
      ctx.fillRect(-14, -4, 3, 2); ctx.fillRect(11, -4, 3, 2);
    },
    bumblebee() {
      const ctx = FD.ctx;
      ctx.beginPath(); ctx.ellipse(0, 1, 11, 7, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(-5, -7, 1, 3); ctx.fillRect(4, -7, 1, 3);
      ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(15, 1); ctx.lineTo(11, 2); ctx.closePath(); ctx.fill();
    },
    crane() {
      const ctx = FD.ctx;
      ctx.beginPath();
      ctx.moveTo(0, -3); ctx.lineTo(5, 1); ctx.lineTo(0, 5); ctx.lineTo(-5, 1);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2, 0); ctx.lineTo(-14, -4); ctx.lineTo(-12, 1); ctx.lineTo(-2, 3);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, 0); ctx.lineTo(14, -4); ctx.lineTo(12, 1); ctx.lineTo(2, 3);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -3); ctx.lineTo(11, -8); ctx.lineTo(2, -2);
      ctx.closePath(); ctx.fill();
    },
    broom() {
      const ctx = FD.ctx;
      ctx.fillRect(-10, -1, 18, 3);
      ctx.beginPath();
      ctx.moveTo(-10, -2); ctx.lineTo(-18, -4); ctx.lineTo(-18, 4); ctx.lineTo(-10, 3);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, -1); ctx.lineTo(11, -10); ctx.lineTo(13, -1);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(0, -1, 14, 2);
    }
  };

  // --- Dispatcher ---
  // silhouette (0-1) controls how black the drone appears.
  // Callers compute and pass the silhouette value (e.g. from nuke timing).
  FD.drawDrone = function (x, y, angle, propPhase, droneType, silhouette) {
    const ctx = FD.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Per-drone scale for visual parity (all ~same screen footprint)
    var droneScale = {
      quad: 1.15, stealth: 1.15, heavy: 1.0, racer: 1.2,
      osprey: 1.15, dragonfly: 1.25, disc: 1.1, spider: 1.0,
      jetwing: 1.15, balloon: 1.1, paperplane: 1.15, chopper: 1.1,
      gyro: 1.1, blimp: 0.85, tandem: 0.9,
      // Wave 5
      pizzabox: 1.0, toaster: 1.1, bumblebee: 1.2, crane: 1.15, broom: 1.0
    };
    var s = droneScale[droneType] || 1.15;
    ctx.scale(s, s);

    if (droneType === 'quad') FD.drawDroneQuad(propPhase);
    else if (droneType === 'stealth') FD.drawDroneStealth(propPhase);
    else if (droneType === 'heavy') FD.drawDroneHeavy(propPhase);
    else if (droneType === 'racer') FD.drawDroneRacer(propPhase);
    else if (droneType === 'osprey') FD.drawDroneOsprey(propPhase);
    else if (droneType === 'dragonfly') FD.drawDroneDragonfly(propPhase);
    else if (droneType === 'disc') FD.drawDroneDisc(propPhase);
    else if (droneType === 'spider') FD.drawDroneSpider(propPhase);
    else if (droneType === 'jetwing') FD.drawDroneJetwing(propPhase);
    else if (droneType === 'balloon') FD.drawDroneBalloon(propPhase);
    else if (droneType === 'paperplane') FD.drawDronePaperplane(propPhase);
    else if (droneType === 'chopper') FD.drawDroneChopper(propPhase);
    else if (droneType === 'gyro') FD.drawDroneGyro(propPhase);
    else if (droneType === 'blimp') FD.drawDroneBlimp(propPhase);
    else if (droneType === 'tandem') FD.drawDroneTandem(propPhase);
    // Wave 5
    else if (droneType === 'pizzabox')  FD.drawDronePizzabox(propPhase);
    else if (droneType === 'toaster')   FD.drawDroneToaster(propPhase);
    else if (droneType === 'bumblebee') FD.drawDroneBumblebee(propPhase);
    else if (droneType === 'crane')     FD.drawDroneCrane(propPhase);
    else if (droneType === 'broom')     FD.drawDroneBroom(propPhase);
    else FD.drawDroneQuad(propPhase); // fallback

    // Silhouette overlay
    if (silhouette > 0.01) {
      ctx.globalAlpha = Math.min(1, silhouette);
      ctx.fillStyle = '#000';
      if (FD.silhouetteParts[droneType]) {
        FD.silhouetteParts[droneType]();
      } else {
        FD.silhouetteParts.quad();
      }
      // Props silhouette
      const pSpin = Math.abs(Math.sin(propPhase));
      const pW = pSpin * 12;
      ctx.fillRect(-18 - pW / 2, -4, pW, 2);
      ctx.fillRect(18 - pW / 2, -4, pW, 2);
    }

    ctx.restore();
  };
})();
