// ---------------------------------------------------------------------------
// Island terrain
//
// The original map was a flat grid of grass. This replaces that ground layer
// with a rounded island: a sandy beach, a clipped lawn, meadow flowers, and
// animated water just outside the walkable bounds.
// ---------------------------------------------------------------------------

let islandDecor = null;

function islandRandFactory(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function islandRoundRectPath(x, y, w, h, r) {
  const ctx = drawingContext;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function buildIslandDecor(P, Q, beach, margin) {
  const rand = islandRandFactory(20261111);
  const decor = {
    patches: [],
    flowers: [],
    tufts: [],
    bushes: [],
    shells: [],
    glints: [],
    sandSpecks: [],
    driftwood: [],
  };
  const origin = (typeof bdOrigin !== 'undefined' && bdOrigin)
    ? bdOrigin
    : { x: P / 2, y: Q / 2 };
  const edgeX = P - beach - 30;
  const edgeY = Q - beach - 30;

  // Broad, translucent grass patches give the lawn some depth.
  for (let i = 0; i < 40; i++) {
    decor.patches.push({
      x: (rand() * 2 - 1) * edgeX,
      y: (rand() * 2 - 1) * edgeY,
      w: 120 + rand() * 300,
      h: 70 + rand() * 160,
      light: rand() > 0.45,
    });
  }

  // Small flower clusters, kept out of the central quest clearing.
  const flowerColors = [
    [255, 255, 255],
    [255, 187, 202],
    [255, 225, 126],
    [246, 166, 196],
  ];
  for (let i = 0; i < 120; i++) {
    const x = (rand() * 2 - 1) * edgeX;
    const y = (rand() * 2 - 1) * edgeY;
    const inClearing = Math.abs(x - origin.x) < width * 0.28
      && Math.abs(y - origin.y) < height * 0.27;
    if (inClearing) continue;
    const color = flowerColors[Math.floor(rand() * flowerColors.length)];
    decor.flowers.push({
      x,
      y,
      size: 4 + rand() * 3,
      color,
      phase: rand() * Math.PI * 2,
      twin: rand() > 0.4,
    });
  }

  // A ring of small flower beds frames the central quest clearing.
  const clusterColors = [
    [255, 255, 255],
    [255, 187, 202],
    [246, 166, 196],
  ];
  const clusterCount = 11;
  for (let i = 0; i < clusterCount; i++) {
    const angle = (Math.PI * 2 * i) / clusterCount + 0.22;
    const cx = origin.x + Math.cos(angle) * width * 0.40 * (0.92 + rand() * 0.16);
    const cy = origin.y + Math.sin(angle) * height * 0.34 * (0.92 + rand() * 0.16);
    if (Math.abs(cx) > edgeX || Math.abs(cy) > edgeY) continue;
    const color = clusterColors[Math.floor(rand() * clusterColors.length)];
    const blooms = 4 + Math.floor(rand() * 3);
    for (let b = 0; b < blooms; b++) {
      decor.flowers.push({
        x: cx + (rand() * 2 - 1) * 22,
        y: cy + (rand() * 2 - 1) * 14,
        size: 4.6 + rand() * 2.6,
        color,
        phase: rand() * Math.PI * 2,
        twin: rand() > 0.55,
      });
    }
  }

  // Low bushes break up the lawn without blocking the quest clearing.
  for (let i = 0; i < 26; i++) {
    const x = (rand() * 2 - 1) * edgeX;
    const y = (rand() * 2 - 1) * edgeY;
    const inClearing = Math.abs(x - origin.x) < width * 0.28
      && Math.abs(y - origin.y) < height * 0.27;
    if (inClearing) continue;
    decor.bushes.push({
      x,
      y,
      size: 18 + rand() * 14,
      phase: rand() * Math.PI * 2,
      bloom: rand() > 0.55,
    });
  }

  // Grass blades add texture without making the lawn noisy.
  for (let i = 0; i < 190; i++) {
    const x = (rand() * 2 - 1) * edgeX;
    const y = (rand() * 2 - 1) * edgeY;
    const inClearing = Math.abs(x - origin.x) < width * 0.24
      && Math.abs(y - origin.y) < height * 0.22;
    if (inClearing) continue;
    decor.tufts.push({ x, y, size: 4 + rand() * 5, lean: rand() * 2 - 1 });
  }

  // Shells and starfish sit in the sand band, safely inside the walkable area.
  const shellColors = [
    [255, 241, 208],
    [244, 155, 135],
    [250, 196, 172],
    [255, 226, 150],
  ];
  for (let i = 0; i < 58; i++) {
    const side = i % 4;
    const t = rand() * 2 - 1;
    const inset = 28 + rand() * 46;
    let x, y;
    if (side === 0) {
      x = t * (P - 250);
      y = -Q + inset;
    } else if (side === 1) {
      x = t * (P - 250);
      y = Q - inset;
    } else if (side === 2) {
      x = -P + inset;
      y = t * (Q - 220);
    } else {
      x = P - inset;
      y = t * (Q - 220);
    }
    decor.shells.push({
      x,
      y,
      size: 9 + rand() * 7,
      rot: rand() * Math.PI * 2,
      color: shellColors[Math.floor(rand() * shellColors.length)],
      star: rand() < 0.30,
    });
  }

  // Fine sand speckles and a little driftwood make the beach less empty.
  for (let i = 0; i < 150; i++) {
    const side = i % 4;
    const t = rand() * 2 - 1;
    const inset = 8 - beach + rand() * (beach + margin - 16);
    let x, y;
    if (side === 0 || side === 1) {
      x = t * (P - 210);
      y = (side === 0 ? -Q : Q) + (side === 0 ? inset : -inset);
    } else {
      y = t * (Q - 190);
      x = (side === 2 ? -P : P) + (side === 2 ? inset : -inset);
    }
    decor.sandSpecks.push({ x, y, size: 1.2 + rand() * 2.2 });
  }

  for (let i = 0; i < 12; i++) {
    const side = i % 4;
    const t = (rand() * 2 - 1) * 0.55;
    const inset = 34 + rand() * 32;
    let x, y;
    if (side === 0 || side === 1) {
      x = t * (P - 260);
      y = (side === 0 ? -Q : Q) + (side === 0 ? inset : -inset);
    } else {
      y = t * (Q - 260);
      x = (side === 2 ? -P : P) + (side === 2 ? inset : -inset);
    }
    decor.driftwood.push({
      x,
      y,
      length: 50 + rand() * 55,
      width: 9 + rand() * 5,
      rot: (side === 0 || side === 1) ? (rand() * 0.4 - 0.2) : Math.PI / 2 + (rand() * 0.4 - 0.2),
      shade: rand() > 0.5,
    });
  }

  // Little white glints in the shallow water.
  for (let i = 0; i < 68; i++) {
    const side = i % 4;
    const t = rand() * 2 - 1;
    let x, y;
    if (side === 0 || side === 1) {
      x = t * (P - 150);
      y = (side === 0 ? -1 : 1) * (Q + 120 + rand() * 280);
    } else {
      y = t * (Q - 110);
      x = (side === 2 ? -1 : 1) * (P + 120 + rand() * 280);
    }
    decor.glints.push({ x, y, size: 8 + rand() * 12, phase: rand() * Math.PI * 2 });
  }

  return decor;
}

function drawIslandPatches(decor) {
  noStroke();
  for (let i = 0; i < decor.patches.length; i++) {
    const patch = decor.patches[i];
    if (patch.light) {
      fill(182, 224, 112, 17);
    } else {
      fill(27, 103, 58, 22);
    }
    ellipse(patch.x, patch.y, patch.w, patch.h);
  }
}

function drawIslandTufts(decor) {
  push();
  stroke(55, 131, 67, 150);
  strokeWeight(1.4);
  for (let i = 0; i < decor.tufts.length; i++) {
    const t = decor.tufts[i];
    for (let blade = 0; blade < 3; blade++) {
      const dx = (blade - 1) * 3 + t.lean;
      line(t.x + dx, t.y + 2, t.x + dx * 1.7, t.y - t.size - blade);
    }
  }
  pop();
}

function drawIslandFlowers(decor) {
  push();
  noStroke();
  for (let i = 0; i < decor.flowers.length; i++) {
    const f = decor.flowers[i];
    const sway = Math.sin(frameCount * 0.022 + f.phase) * 1.2;
    const blossoms = f.twin
      ? [{ x: f.x + sway, y: f.y, s: f.size }, { x: f.x + 6 + sway, y: f.y + 3, s: f.size * 0.72 }]
      : [{ x: f.x + sway, y: f.y, s: f.size }];

    for (let b = 0; b < blossoms.length; b++) {
      const bloom = blossoms[b];
      stroke(74, 147, 79, 160);
      strokeWeight(1.2);
      line(bloom.x, bloom.y + 4, bloom.x - sway * 0.4, bloom.y + 1);
      noStroke();
      fill(f.color[0], f.color[1], f.color[2], 235);
      for (let petal = 0; petal < 5; petal++) {
        const angle = (Math.PI * 2 * petal) / 5 + f.phase;
        ellipse(
          bloom.x + Math.cos(angle) * bloom.s,
          bloom.y + Math.sin(angle) * bloom.s,
          bloom.s * 1.5,
          bloom.s * 1.5
        );
      }
      fill(255, 214, 95);
      ellipse(bloom.x, bloom.y, bloom.s * 0.95, bloom.s * 0.95);
    }
  }
  pop();
}

function drawIslandBushes(decor) {
  push();
  noStroke();
  for (let i = 0; i < decor.bushes.length; i++) {
    const bush = decor.bushes[i];
    const sway = Math.sin(frameCount * 0.016 + bush.phase) * 0.8;
    const s = bush.size;

    // Ground shadow.
    fill(30, 96, 53, 50);
    ellipse(bush.x, bush.y + s * 0.42, s * 2.8, s * 0.75);

    // Three soft lobes make a rounded, hand-drawn shrub.
    fill(38, 112, 61, 240);
    ellipse(bush.x - s * 0.62 + sway, bush.y - s * 0.20, s * 1.55, s * 1.30);
    fill(46, 127, 70, 240);
    ellipse(bush.x + s * 0.58 + sway, bush.y - s * 0.26, s * 1.45, s * 1.20);
    fill(58, 145, 79, 245);
    ellipse(bush.x + sway, bush.y - s * 0.62, s * 1.70, s * 1.35);

    // Sunlit caps.
    fill(120, 192, 108, 110);
    ellipse(bush.x - s * 0.38 + sway, bush.y - s * 0.82, s * 0.70, s * 0.40);
    ellipse(bush.x + s * 0.34 + sway, bush.y - s * 0.70, s * 0.55, s * 0.32);

    if (bush.bloom) {
      const bloomX = bush.x + s * 0.25 + sway;
      const bloomY = bush.y - s * 0.98;
      fill(255, 240, 245, 235);
      ellipse(bloomX, bloomY, 4.2, 4.2);
      fill(255, 205, 220, 220);
      ellipse(bloomX + 5.5, bloomY + 2, 3.6, 3.6);
      fill(255, 222, 120);
      ellipse(bloomX + 1, bloomY + 1.5, 2.4, 2.4);
    }
  }
  pop();
}

function drawIslandShells(decor) {
  push();
  for (let i = 0; i < decor.shells.length; i++) {
    const shell = decor.shells[i];
    push();
    translate(shell.x, shell.y);
    rotate(shell.rot);
    noStroke();
    fill(173, 143, 87, 60);
    ellipse(1.5, shell.size * 0.28, shell.size * 1.9, shell.size * 0.8);
    fill(shell.color[0], shell.color[1], shell.color[2], 235);
    if (shell.star) {
      beginShape();
      for (let point = 0; point < 10; point++) {
        const angle = -Math.PI / 2 + (Math.PI * point) / 5;
        const radius = point % 2 === 0 ? shell.size : shell.size * 0.42;
        vertex(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      endShape(CLOSE);
      fill(255, 255, 255, 90);
      ellipse(0, 0, shell.size * 0.38, shell.size * 0.38);
    } else {
      arc(0, 0, shell.size * 1.7, shell.size * 1.3, Math.PI, Math.PI * 2, PIE);
      stroke(190, 137, 116, 150);
      strokeWeight(1);
      for (let ridge = -1; ridge <= 1; ridge++) {
        line(0, 0, ridge * shell.size * 0.45, -shell.size * 0.62);
      }
    }
    pop();
  }
  pop();
}

function drawIslandSandSpecks(decor) {
  push();
  noStroke();
  for (let i = 0; i < decor.sandSpecks.length; i++) {
    const speck = decor.sandSpecks[i];
    const size = speck.size * (i % 9 === 0 ? 2.1 : 1);
    if (i % 3 === 0) {
      fill(184, 148, 92, 115);
    } else {
      fill(252, 240, 202, 145);
    }
    ellipse(speck.x, speck.y, size, size * 0.82);
  }
  pop();
}

function drawIslandDriftwood(decor) {
  push();
  for (let i = 0; i < decor.driftwood.length; i++) {
    const wood = decor.driftwood[i];
    push();
    translate(wood.x, wood.y);
    rotate(wood.rot);
    rectMode(CENTER);
    noStroke();

    fill(wood.shade ? 156 : 176, wood.shade ? 126 : 146, wood.shade ? 88 : 103, 225);
    rect(0, 0, wood.length, wood.width, wood.width / 2);

    // A pale grain line and a little broken branch.
    fill(208, 184, 143, 150);
    rect(-wood.length * 0.06, -wood.width * 0.18, wood.length * 0.62, wood.width * 0.22, wood.width * 0.12);
    stroke(134, 106, 72, 210);
    strokeWeight(2);
    line(wood.length * 0.16, 0, wood.length * 0.30, -wood.width * 0.95);
    pop();
  }
  pop();
}

function drawIslandFoam(P, Q, margin, radius) {
  const ctx = drawingContext;
  const rings = [
    { pad: 8, alpha: 0.62, weight: 2.6, dash: [26, 20], speed: 0.035 },
    { pad: 27, alpha: 0.34, weight: 2.0, dash: [12, 28], speed: 0.022 },
    { pad: 72, alpha: 0.20, weight: 1.6, dash: [38, 52], speed: 0.014 },
  ];

  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i];
    islandRoundRectPath(
      -(P + margin + ring.pad),
      -(Q + margin + ring.pad),
      (P + margin + ring.pad) * 2,
      (Q + margin + ring.pad) * 2,
      radius + ring.pad
    );
    ctx.setLineDash(ring.dash);
    ctx.lineDashOffset = (millis() * ring.speed) % (ring.dash[0] + ring.dash[1]);
    ctx.strokeStyle = `rgba(255, 255, 255, ${ring.alpha})`;
    ctx.lineWidth = ring.weight;
    ctx.stroke();
  }
  ctx.restore();
}

function drawIslandGlints(decor) {
  push();
  noStroke();
  for (let i = 0; i < decor.glints.length; i++) {
    const glint = decor.glints[i];
    const bob = Math.sin(frameCount * 0.035 + glint.phase) * 2.2;
    fill(255, 255, 255, 70 + Math.sin(frameCount * 0.05 + glint.phase) * 28);
    ellipse(glint.x, glint.y + bob, glint.size, 2.4);
  }
  pop();
}

function drawIslandWater(P, Q, margin) {
  const ctx = drawingContext;
  const rx = P + margin;
  const ry = Q + margin;
  const outer = rx * 1.45;

  // One smooth elliptical gradient replaces the old hard-edged colour bands.
  ctx.save();
  ctx.scale(1, ry / rx);
  const water = ctx.createRadialGradient(0, 0, rx * 0.90, 0, 0, outer);
  water.addColorStop(0.00, 'rgb(150, 236, 230)');
  water.addColorStop(0.12, 'rgb(126, 222, 222)');
  water.addColorStop(0.30, 'rgb(72, 181, 199)');
  water.addColorStop(0.58, 'rgb(41, 139, 172)');
  water.addColorStop(1.00, 'rgb(24, 100, 145)');
  ctx.fillStyle = water;
  ctx.fillRect(-outer * 2, -outer * 2, outer * 4, outer * 4);
  ctx.restore();
}

function drawIslandTerrain() {
  const P = SCENE_W;
  const Q = SCENE_H;
  const margin = 80;
  const radius = 210;
  const beach = 70;

  islandDecor = islandDecor || buildIslandDecor(P, Q, beach, margin);

  push();
  noStroke();

  drawIslandWater(P, Q, margin);
  noStroke();

  // A soft shadow in the water makes the island sit on the surface.
  fill(14, 76, 108, 65);
  rect(
    -(P + margin + 16),
    -(Q + margin + 16),
    (P + margin + 16) * 2,
    (Q + margin + 16) * 2,
    radius + 16
  );

  // Sand island.
  fill(239, 220, 166);
  rect(
    -(P + margin),
    -(Q + margin),
    (P + margin) * 2,
    (Q + margin) * 2,
    radius
  );
  // Damp sand darkens toward the waterline.
  noFill();
  stroke(207, 181, 125, 115);
  strokeWeight(30);
  rect(
    -(P + margin - 15),
    -(Q + margin - 15),
    (P + margin - 15) * 2,
    (Q + margin - 15) * 2,
    radius - 15
  );
  stroke(189, 158, 100, 150);
  strokeWeight(3);
  rect(
    -(P + margin - 2),
    -(Q + margin - 2),
    (P + margin - 2) * 2,
    (Q + margin - 2) * 2,
    radius - 2
  );
  noStroke();

  // Grass is clipped to a rounded lawn so the beach reads all the way around.
  const gw = P - beach;
  const gh = Q - beach;
  const gr = Math.max(40, radius - beach);
  push();
  drawingContext.save();
  islandRoundRectPath(-gw, -gh, gw * 2, gh * 2, gr);
  drawingContext.clip();

  fill(61, 143, 80);
  rect(-P, -Q, P * 2, Q * 2);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      image(grass, x * cellWidth - P, y * cellHeight - Q, cellWidth, cellHeight);
    }
  }

  drawIslandPatches(islandDecor);
  drawIslandTufts(islandDecor);
  drawIslandBushes(islandDecor);
  drawIslandFlowers(islandDecor);

  drawingContext.restore();
  pop();

  // A slim edge between lawn and beach.
  noFill();
  stroke(48, 119, 66, 140);
  strokeWeight(3);
  rect(-gw, -gh, gw * 2, gh * 2, gr);
  noStroke();

  drawIslandSandSpecks(islandDecor);
  drawIslandDriftwood(islandDecor);
  drawIslandShells(islandDecor);
  drawIslandFoam(P, Q, margin, radius);
  drawIslandGlints(islandDecor);

  pop();
}
