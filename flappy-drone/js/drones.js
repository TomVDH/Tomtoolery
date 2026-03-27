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

  // --- Silhouette parts (for nuke backlight) ---
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
      // Fuselage pod
      ctx.beginPath();
      ctx.moveTo(-3, -3); ctx.quadraticCurveTo(6, -4, 6, 0);
      ctx.quadraticCurveTo(6, 4, -3, 3.5); ctx.lineTo(-3, -3);
      ctx.closePath(); ctx.fill();
      // Tail boom
      ctx.fillRect(-14, -0.5, 11, 1.2);
      // Stabilizer
      ctx.beginPath(); ctx.moveTo(-14, -0.5); ctx.lineTo(-15, -4); ctx.lineTo(-12.5, -0.5); ctx.closePath(); ctx.fill();
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
    ctx.scale(1.15, 1.15);

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
