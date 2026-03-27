// buildings.js — far city parallax, ground, building rendering, neon signs
// All functions on window.FD namespace, using FD.ctx, FD.W, FD.H, FD.globalTick, etc.

(function () {
  const FD = window.FD;

  // --- Pseudo-random hash for window lighting ---
  function windowHash(seed, c, row) {
    var h = seed * 2654435761 + c * 340573321 + Math.floor(row) * 196314165;
    h = ((h >>> 16) ^ h) * 0x45d9f3b;
    h = ((h >>> 16) ^ h);
    return (h & 0xFF) / 255; // 0-1
  }

  // --- Helper: compute nuke rim light parameters ---
  // holdEnd/fadeLen control when the rim fades out
  function nukeRimCalc(holdEnd, fadeLen) {
    if (!FD.nukeActive) return null;
    const ne = performance.now() - FD.nukeStart;
    let rimAlpha = 0;
    if (ne < 500) rimAlpha = Math.min(1, ne / 300);
    else if (ne < holdEnd) rimAlpha = 1;
    else rimAlpha = Math.max(0, 1 - (ne - holdEnd) / fadeLen);
    if (rimAlpha <= 0.01) return null;
    const rimWarmth = Math.min(1, ne / 1500);
    return {
      rimAlpha: rimAlpha,
      rimHue: rimWarmth * 25,
      rimSat: 60 + rimWarmth * 40,
      rimLum: 95 - rimWarmth * 45
    };
  }

  // --- Apply nuke rim light style to ctx ---
  function applyRimStyle(ctx, rim) {
    ctx.strokeStyle = `hsla(${rim.rimHue}, ${rim.rimSat}%, ${rim.rimLum}%, ${rim.rimAlpha * 0.5})`;
    ctx.shadowColor = `hsla(${rim.rimHue}, ${rim.rimSat}%, ${rim.rimLum + 5}%, ${rim.rimAlpha * 0.6})`;
    ctx.shadowBlur = 6 + rim.rimAlpha * 4;
    ctx.lineWidth = 0.75;
  }

  // --- Far city: 2-layer parallax skyline ---
  // scrollX: caller passes current scroll value (e.g. (globalTick * 0.12) % FAR_TILE_W)
  FD.drawFarCity = function (scrollX) {
    var ctx = FD.ctx, W = FD.W, H = FD.H;
    var GROUND_H = FD.GROUND_H, FAR_TILE_W = FD.FAR_TILE_W;
    var farBuildings = FD.farBuildings;

    var backBuildings = farBuildings.filter(function (b) { return b.layer === 'back'; });
    var frontBuildings = farBuildings.filter(function (b) { return b.layer === 'front' || !b.layer; });

    // Back layer — darker, slower parallax (0.6x, modulo applied independently)
    var backScrollX = (scrollX * 0.6) % FAR_TILE_W;
    ctx.fillStyle = '#080818';
    for (var tileOff = -FAR_TILE_W; tileOff < W + FAR_TILE_W; tileOff += FAR_TILE_W) {
      backBuildings.forEach(function (b) {
        var bx = b.x + tileOff - backScrollX;
        if (bx + b.w > -10 && bx < W + 10) ctx.fillRect(bx, H - GROUND_H - b.h, b.w, b.h);
      });
    }

    // Front layer — brighter, full scroll speed
    ctx.fillStyle = '#0c0c20';
    for (var tileOff2 = -FAR_TILE_W; tileOff2 < W + FAR_TILE_W; tileOff2 += FAR_TILE_W) {
      frontBuildings.forEach(function (b) {
        var bx = b.x + tileOff2 - scrollX;
        if (bx + b.w > -10 && bx < W + 10) ctx.fillRect(bx, H - GROUND_H - b.h, b.w, b.h);
      });
    }

    // Nuke rim light on skyline — 5s total (ramp 0.5s, hold 3s, fade 1.5s)
    // Back layer (furthest) gets the full highlight; front layer only a faint edge.
    var rim = nukeRimCalc(3500, 1500);
    if (rim) {
      ctx.save();

      // Back layer rim — full intensity (furthest buildings catch the most light)
      applyRimStyle(ctx, rim);
      ctx.beginPath();
      for (var tileOff3 = -FAR_TILE_W; tileOff3 < W + FAR_TILE_W; tileOff3 += FAR_TILE_W) {
        backBuildings.forEach(function (b) {
          var bx = b.x + tileOff3 - backScrollX;
          if (bx + b.w > -10 && bx < W + 10) {
            var ty = H - GROUND_H - b.h;
            ctx.moveTo(bx, ty);
            ctx.lineTo(bx + b.w, ty);
            ctx.lineTo(bx + b.w, H - GROUND_H);
          }
        });
      }
      ctx.stroke();

      // Front layer rim — faint (closest buildings are silhouetted, only catch a hint)
      ctx.strokeStyle = `hsla(${rim.rimHue}, ${rim.rimSat}%, ${rim.rimLum}%, ${rim.rimAlpha * 0.15})`;
      ctx.shadowColor = `hsla(${rim.rimHue}, ${rim.rimSat}%, ${rim.rimLum + 5}%, ${rim.rimAlpha * 0.12})`;
      ctx.shadowBlur = 3;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (var tileOff4 = -FAR_TILE_W; tileOff4 < W + FAR_TILE_W; tileOff4 += FAR_TILE_W) {
        frontBuildings.forEach(function (b) {
          var bx = b.x + tileOff4 - scrollX;
          if (bx + b.w > -10 && bx < W + 10) {
            var ty = H - GROUND_H - b.h;
            ctx.moveTo(bx, ty);
            ctx.lineTo(bx + b.w, ty);
            ctx.lineTo(bx + b.w, H - GROUND_H);
          }
        });
      }
      ctx.stroke();

      ctx.restore();
    }
  };

  // --- Ground bar with animated stripes ---
  // scrollOffset: caller passes current stripe offset (e.g. (globalTick * PIPE_SPEED) % 24)
  FD.drawGround = function (scrollOffset) {
    var ctx = FD.ctx, W = FD.W, H = FD.H, GROUND_H = FD.GROUND_H;
    var groundY = H - GROUND_H;

    // Road surface
    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(0, groundY, W, GROUND_H);

    // Sidewalk strip — 6px lighter band at top
    ctx.fillStyle = '#121226';
    ctx.fillRect(0, groundY, W, 6);

    // Kerb line — 1px at bottom of sidewalk
    ctx.fillStyle = '#1a1a36';
    ctx.fillRect(0, groundY + 5, W, 1);

    // Top edge line
    ctx.fillStyle = '#181830';
    ctx.fillRect(0, groundY, W, 2);

    // Centre lane stripes
    ctx.fillStyle = '#1a1a35';
    var off = scrollOffset;
    for (var x = -off; x < W; x += 24) {
      ctx.fillRect(x, groundY + GROUND_H / 2, 12, 2);
    }


  };

  // --- Unified building renderer ---
  // b = { x, w, topY, height, fromTop, seed, signText, signColor, signType }
  FD.drawBuilding = function (b) {
    var ctx = FD.ctx;
    var x = b.x, w = b.w, topY = b.topY, height = b.height, fromTop = b.fromTop;
    var seed = b.seed;
    var hue = 228 + (seed % 25);
    var lit = 11 + (seed % 5);

    // Main body
    ctx.fillStyle = 'hsl(' + hue + ', 25%, ' + lit + '%)';
    ctx.fillRect(x, topY, w, height);

    // Left / right edges
    ctx.fillStyle = 'hsl(' + hue + ', 18%, ' + (lit + 4) + '%)';
    ctx.fillRect(x, topY, 2, height);
    ctx.fillStyle = 'hsl(' + hue + ', 30%, ' + (lit - 2) + '%)';
    ctx.fillRect(x + w - 2, topY, 2, height);

    // Cap
    var capY = fromTop ? topY + height - 5 : topY;
    ctx.fillStyle = 'hsl(' + hue + ', 12%, ' + (lit + 7) + '%)';
    ctx.fillRect(x - 4, capY, w + 8, 5);
    ctx.fillStyle = 'hsl(' + hue + ', 12%, ' + (lit + 10) + '%)';
    ctx.fillRect(x - 4, capY, w + 8, 1);

    // Windows — adapt columns to building width
    var winW = 5, winH = 7;
    var cols = w >= 70 ? 5 : (w >= 50 ? 3 : 2);
    var margin = (w - cols * winW) / (cols + 1);
    var startY = fromTop ? topY + 10 : capY + 10;
    var endY = fromTop ? topY + height - 14 : topY + height - 6;

    // Easter egg patterns for ~1 in 30 buildings
    var heartPattern = [
      [1,0,1],
      [1,1,1],
      [0,1,0],
    ];
    var smileyPattern = [
      [1,0,1],
      [0,0,0],
      [1,0,1],
      [0,1,0],
    ];

    // Count window rows to decide if easter egg fits
    var windowRows = 0;
    for (var rr = startY; rr < endY; rr += 16) windowRows++;
    var useEaster = (seed % 30 === 0) && windowRows >= 4 && cols >= 3;
    var easterPattern = useEaster ? ((seed % 60 < 30) ? heartPattern : smileyPattern) : null;
    var easterRowIdx = 0;

    // Track lit streaks per column
    var streaks = [];
    for (var si = 0; si < cols; si++) streaks.push(0);
    for (var row = startY; row < endY; row += 16) {
      for (var c = 0; c < cols; c++) {
        var wx = x + margin + c * (winW + margin);
        var on;
        // Easter egg patterns
        if (easterPattern) {
          var pr = easterPattern[easterRowIdx % easterPattern.length];
          on = (c < pr.length) ? pr[c] : 0;
        } else {
          on = windowHash(seed, c, row) > 0.45;
        }
        // Max 3 consecutive lit windows vertically
        if (on) {
          streaks[c]++;
          if (streaks[c] > 3) on = false;
        }
        if (!on) streaks[c] = 0;
        ctx.fillStyle = on ? 'rgba(255, 200, 60, 0.65)' : 'rgba(255, 200, 60, 0.08)';
        ctx.fillRect(wx, row, winW, winH);
      }
      if (easterPattern) easterRowIdx++;
    }

    // Nuke rim light on game buildings — 7s total (ramp 0.5s, hold to 5.5s, fade 1.5s)
    var rim = nukeRimCalc(5500, 1500);
    if (rim) {
      ctx.save();
      applyRimStyle(ctx, rim);
      ctx.beginPath();
      // Trace cap overhang then right edge
      ctx.moveTo(x - 4, capY);
      ctx.lineTo(x + w + 4, capY);       // cap top edge
      ctx.lineTo(x + w + 4, capY + 5);   // cap right side
      ctx.lineTo(x + w, capY + 5);       // step in to building body
      ctx.lineTo(x + w, topY + height);  // building right edge down
      ctx.stroke();
      ctx.restore();
    }

    // Nuke silhouette — darken building + dim windows during blast
    if (FD.nukeActive) {
      var ne = performance.now() - FD.nukeStart;
      var silAlpha = 0;
      if (ne < 500) silAlpha = 0.7; // strong silhouette during flash
      else if (ne < 3000) silAlpha = 0.7 - (ne - 500) / 2500 * 0.5; // ease back
      else if (ne < 7000) silAlpha = 0.2; // lingering dim
      else silAlpha = Math.max(0, 0.2 * (1 - (ne - 7000) / 2000));
      if (silAlpha > 0.01) {
        ctx.globalAlpha = silAlpha;
        ctx.fillStyle = '#000';
        ctx.fillRect(x, topY, w, height);
        ctx.globalAlpha = 1;
      }
    }

    // Horizontal ledge dividers
    if (b.ledges) {
      var ledgeHue = hue;
      var ledgeLit = lit + 5;
      for (var lr = startY + 28; lr < endY - 10; lr += 42) {
        ctx.fillStyle = 'hsl(' + ledgeHue + ', 10%, ' + ledgeLit + '%)';
        ctx.fillRect(x - 3, lr, w + 6, 2);
      }
    }

    // Antenna cluster on roof
    if (b.antenna && !fromTop) {
      ctx.fillStyle = '#333';
      ctx.fillRect(x + w / 2 - 1, topY - 12, 2, 12);
      ctx.fillRect(x + w / 2 - 6, topY - 8, 1.5, 8);
      ctx.fillRect(x + w / 2 + 5, topY - 10, 1.5, 10);
      ctx.fillStyle = FD.globalTick % 50 < 25 ? '#ff2244' : '#440011';
      ctx.fillRect(x + w / 2 - 1, topY - 13, 2, 2);
      ctx.fillStyle = FD.globalTick % 70 < 35 ? '#00ff66' : '#003311';
      ctx.fillRect(x + w / 2 - 6, topY - 9, 2, 2);
    }

    // Neon signs — multiple attachment styles
    if (b.signText) {
      var flicker = Math.sin(FD.globalTick * 0.06 + seed * 3.7) > -0.85 ? 1 : 0.25;

      if (b.signType === 'roof' && !fromTop) {
        // Rooftop pixel sign (existing)
        var sy = topY - 10;
        FD.drawNeonText(b.signText, x, sy, w, b.signColor, seed);

      } else if (b.signType === 'side') {
        // Vertical sign running down the right wall
        ctx.save();
        ctx.translate(x + w + 5, topY + 10);
        ctx.rotate(Math.PI / 2);
        var scale = 1.2;
        var charW = 5, gap = 1;
        var totalW = b.signText.length * (charW + gap) * scale - gap * scale;
        // Glow backdrop
        ctx.globalAlpha = 0.1 * flicker;
        ctx.fillStyle = b.signColor;
        ctx.fillRect(-2, -8, totalW + 4, 12);
        // Text
        ctx.globalAlpha = 0.8 * flicker;
        ctx.fillStyle = b.signColor;
        var PX = FD.PX;
        for (var ci = 0; ci < b.signText.length; ci++) {
          var rows = PX[b.signText[ci]]; if (!rows) continue;
          var cx = ci * (charW + gap) * scale;
          for (var r = 0; r < 5; r++)
            for (var c = 0; c < charW; c++)
              if ((rows[r] >> (charW - 1 - c)) & 1)
                ctx.fillRect(cx + c * scale, -6 + r * scale, scale, scale);
        }
        ctx.restore();
        ctx.globalAlpha = 1;

      } else if (b.signType === 'stacked' && !fromTop) {
        // Individual letters stacked vertically down the building face
        var sScale = 1.3;
        var charH = 5;
        for (var si = 0; si < b.signText.length; si++) {
          var ly = topY + 10 + si * 15;
          if (ly > topY + height - 20) break;
          var charPxW = 6 * sScale;
          var ssx = x + (w - charPxW) / 2;
          // Glow bar
          ctx.globalAlpha = 0.07 * flicker;
          ctx.fillStyle = b.signColor;
          ctx.fillRect(x + 3, ly - 1, w - 6, 11);
          // Letter
          ctx.globalAlpha = 0.8 * flicker;
          var rows2 = FD.PX[b.signText[si]];
          if (rows2) {
            ctx.fillStyle = b.signColor;
            for (var r2 = 0; r2 < 5; r2++)
              for (var c2 = 0; c2 < 5; c2++)
                if ((rows2[r2] >> (4 - c2)) & 1)
                  ctx.fillRect(ssx + c2 * sScale, ly + r2 * sScale, sScale, sScale);
          }
        }
        ctx.globalAlpha = 1;

      } else {
        // Fallback: rooftop
        FD.drawNeonText(b.signText, x, topY - 10, w, b.signColor, seed);
      }
    }
  };

  // --- Neon pixel-font signs with flicker + glow backdrop ---
  // Uses FD.PX for the 5x5 pixel font bitmaps
  FD.drawNeonText = function (text, bx, sy, bw, color, seed) {
    var ctx = FD.ctx;
    var PX = FD.PX;
    var charW = 5, charH = 5, gap = 1, scale = 1.5;
    var totalW = text.length * (charW + gap) * scale - gap * scale;
    var sx = bx + (bw - totalW) / 2;

    // Glow backdrop
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = color;
    ctx.fillRect(sx - 3, sy - 2, totalW + 6, charH * scale + 4);

    // Flicker (each sign has its own rhythm)
    var flicker = Math.sin(FD.globalTick * 0.06 + seed * 3.7) > -0.85 ? 1 : 0.25;
    ctx.globalAlpha = 0.85 * flicker;
    ctx.fillStyle = color;

    for (var ci = 0; ci < text.length; ci++) {
      var rows = PX[text[ci]];
      if (!rows) continue;
      var cx = sx + ci * (charW + gap) * scale;
      for (var r = 0; r < charH; r++) {
        for (var c = 0; c < charW; c++) {
          if ((rows[r] >> (charW - 1 - c)) & 1) {
            ctx.fillRect(cx + c * scale, sy + r * scale, scale, scale);
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  };
})();
