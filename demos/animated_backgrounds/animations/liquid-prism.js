
let prismLight = { x: 0, y: 0 };
let prismBursts = [];
let prismCrystals = [];

// Paleta espectral adicional.
const PRISM_SPECTRUM = [
  [255, 104, 177], // Magenta
  [153, 119, 255], // Violeta
  [89, 218, 255],  // Cian
  [132, 255, 216], // Turquesa
  [255, 221, 151]  // Dorado
];

function buildLiquidPrism() {
  const settings = getEffectSettings("prism");
  const amount = Math.max(1, settings.amount);

  prismBands = Array.from({ length: amount }, (_, i) => ({
    phase: rand(0, Math.PI * 2),
    height: 0.10 + (i / amount) * 0.80,
    amplitude: rand(0.025, 0.085),
    speed: rand(0.00012, 0.00030),
    direction: Math.random() < 0.5 ? -1 : 1,
    frequency: rand(0.65, 1.55),
    spread: rand(0.045, 0.105),
    bend: rand(0.55, 1.45),
    opacity: rand(0.65, 1),
    phase2: rand(0, Math.PI * 2),
    depth: rand(0.45, 1.2)
  }));

  prismShards = Array.from(
    { length: Math.min(amount * 12, 260) },
    () => ({
      x: rand(0, W()),
      y: rand(0, H()),
      size: rand(5, 27),
      phase: rand(0, Math.PI * 2),
      drift: rand(0.018, 0.11),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.00035, 0.00035),
      depth: rand(0.35, 1),
      colorIndex: Math.floor(rand(0, PRISM_SPECTRUM.length)),
      elongation: rand(0.7, 1.8)
    })
  );

  prismLight.x = W() * 0.52;
  prismLight.y = H() * 0.5;
  prismBursts = [];
  prismCrystals = [];
}

function createPrismBurst(x, y) {
  prismBursts.push({
    x,
    y,
    age: 0,
    hue: rand(0, 360),
    strength: rand(0.9, 1.2),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: rand(-3.2, 3.2)
  });
  if (prismBursts.length > 12)
    prismBursts.shift();

  const count = Math.floor(rand(11, 17));
  for (let i = 0; i < count; i++) {
    const angle = Math.PI * 2 * i / count + rand(-0.16, 0.16);
    const speed = rand(65, 185);
    prismCrystals.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      lifetime: rand(0.48, 0.82),
      size: rand(3, 8),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-5, 5),
      colorIndex: Math.floor(rand(0, PRISM_SPECTRUM.length))
    });
  }
  if (prismCrystals.length > 180)
    prismCrystals.splice(0, prismCrystals.length - 180);
}

// Utilidades de dibujo.

function prismRGBA(color, alpha) {
  return `rgba(${color.join(",")},${Math.max(0, alpha)})`;
}

function tracePrismBand(y, spread, bend, phase, frequency) {
  const w = W();

  const wave1 = Math.sin(phase * frequency) * spread * bend;
  const wave2 = Math.cos(phase * 0.73 + 1.7) * spread * bend;
  const wave3 = Math.sin(phase * 1.31 + 2.1) * spread * 0.65;

  ctx.beginPath();
  ctx.moveTo(0, y + wave1 * 0.35);

  ctx.bezierCurveTo(
    w * 0.20, y - spread + wave2,
    w * 0.37, y + spread + wave3,
    w * 0.54, y + wave1
  );

  ctx.bezierCurveTo(
    w * 0.73, y - spread * 0.80 - wave3,
    w * 0.86, y + spread * 0.75 + wave2,
    w, y - spread * 0.20 + wave1 * 0.4
  );

  ctx.lineTo(w, y + spread * 1.65);

  ctx.bezierCurveTo(
    w * 0.78, y + spread * 0.65 + wave2,
    w * 0.61, y + spread * 1.8 - wave1,
    w * 0.40, y + spread * 0.95 + wave3
  );

  ctx.bezierCurveTo(
    w * 0.22, y + spread * 1.8 - wave2,
    w * 0.12, y + spread * 0.6 + wave1,
    0, y + spread
  );

  ctx.closePath();
}

function drawPrismGlow(x, y, radius, color, alpha) {
  const glow = ctx.createRadialGradient(
    x, y, 0,
    x, y, radius
  );

  glow.addColorStop(0, prismRGBA(color, alpha));
  glow.addColorStop(0.25, prismRGBA(color, alpha * 0.42));
  glow.addColorStop(0.62, prismRGBA(color, alpha * 0.12));
  glow.addColorStop(1, prismRGBA(color, 0));

  ctx.fillStyle = glow;
  ctx.fillRect(
    x - radius, y - radius,
    radius * 2, radius * 2
  );
}

// ANIMACIÓN PRINCIPAL.

function drawLiquidPrism(time, dt) {
  clear();

  const settings = getEffectSettings("prism");
  const primary = hexToRgb(settings.color);
  const secondary = hexToRgb(settings.secondaryColor);

  const w = W();
  const h = H();
  const intensity = Math.max(0, settings.intensity);

  // Limita dt para evitar saltos después de cambiar de pestaña.
  const delta = Math.min(Math.max(dt || 0, 0), 40);

  const targetX = w * (0.5 + Math.sin(time * 0.00013) * 0.06);
  const targetY = h * (0.48 + Math.cos(time * 0.00017) * 0.045);

  // La luz principal deriva lentamente por el centro, sin seguir al cursor.
  const follow = 1 - Math.exp(-delta * 0.004);

  prismLight.x += (targetX - prismLight.x) * follow;
  prismLight.y += (targetY - prismLight.y) * follow;
  for (const burst of prismBursts)
  {
    burst.age += delta / 1000;
    burst.rotation += burst.rotationSpeed * delta / 1000;
  }
  prismBursts = prismBursts.filter(burst => burst.age < 0.62);

  const lx = prismLight.x;
  const ly = prismLight.y;

  // 1. FONDO: profundidad cromática.

  const background = ctx.createLinearGradient(0, 0, w, h);
  background.addColorStop(0, "#070712");
  background.addColorStop(0.45, "#0d0b20");
  background.addColorStop(1, "#060b17");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);

  const atmosphere = ctx.createRadialGradient(
    lx, ly, 0,
    lx, ly, Math.max(w, h) * 0.82
  );

  atmosphere.addColorStop(
    0,
    prismRGBA(primary, 0.19 * intensity)
  );
  atmosphere.addColorStop(
    0.32,
    prismRGBA(secondary, 0.12 * intensity)
  );
  atmosphere.addColorStop(
    0.68,
    prismRGBA(PRISM_SPECTRUM[1], 0.045 * intensity)
  );
  atmosphere.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = atmosphere;
  ctx.fillRect(0, 0, w, h);

  // Iluminación ambiental independiente.
  const ambientX = w * (0.5 + Math.sin(time * 0.00011) * 0.24);
  const ambientY = h * (0.48 + Math.cos(time * 0.00015) * 0.20);

  drawPrismGlow(
    ambientX, ambientY,
    Math.max(w, h) * 0.48,
    secondary,
    0.085 * intensity
  );

  // 2. BANDAS DE VIDRIO LÍQUIDO.

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  prismBands.forEach((band, index) => {
    const phase =
      band.phase +
      time * band.speed * band.direction;

    const secondaryWave =
      Math.sin(time * 0.00017 + band.phase2) *
      h * band.amplitude * 0.34;

    const y =
      h * band.height +
      Math.sin(phase * band.frequency) *
      h * band.amplitude +
      secondaryWave;

    const spread = h * band.spread;
    const wave = Math.sin(phase * 0.8 + band.phase2);
    const opacity = intensity * band.opacity;

    const colorA = index % 2 === 0 ? primary : secondary;
    const colorB = index % 2 === 0 ? secondary : primary;

    // Halo exterior de la banda.
    ctx.save();
    tracePrismBand(
      y, spread * 1.7, band.bend,
      phase, band.frequency
    );

    ctx.shadowColor = prismRGBA(colorA, 0.8);
    ctx.shadowBlur = h * 0.025;

    const halo = ctx.createLinearGradient(
      0, y - spread,
      w, y + spread
    );

    halo.addColorStop(0, prismRGBA(colorA, 0));
    halo.addColorStop(
      0.3, prismRGBA(colorA, 0.075 * opacity)
    );
    halo.addColorStop(
      0.7, prismRGBA(colorB, 0.095 * opacity)
    );
    halo.addColorStop(1, prismRGBA(colorB, 0));

    ctx.fillStyle = halo;
    ctx.fill();
    ctx.restore();

    // Cuerpo translúcido.
    tracePrismBand(
      y, spread, band.bend,
      phase, band.frequency
    );

    const glass = ctx.createLinearGradient(
      0, y - spread,
      w, y + spread * 1.5
    );

    glass.addColorStop(0, prismRGBA(colorA, 0));
    glass.addColorStop(
      0.16, prismRGBA(colorA, 0.12 * opacity)
    );
    glass.addColorStop(
      0.36, prismRGBA(colorB, 0.21 * opacity)
    );
    glass.addColorStop(
      0.49, prismRGBA([255, 255, 255], 0.14 * opacity)
    );
    glass.addColorStop(
      0.59, prismRGBA(colorA, 0.16 * opacity)
    );
    glass.addColorStop(
      0.79, prismRGBA(colorB, 0.19 * opacity)
    );
    glass.addColorStop(1, prismRGBA(colorA, 0));

    ctx.fillStyle = glass;
    ctx.fill();

    // Recorta los reflejos para que sigan la superficie.
    ctx.save();

    tracePrismBand(
      y, spread, band.bend,
      phase, band.frequency
    );
    ctx.clip();

    // Destello que recorre el vidrio.
    const travel =
      ((time * 0.00012 * band.direction +
        band.phase * 0.17) % 1 + 1) % 1;

    const glintX = travel * (w + spread * 2) - spread;

    const glint = ctx.createLinearGradient(
      glintX - spread * 0.6, y - spread,
      glintX + spread * 0.6, y + spread
    );

    glint.addColorStop(0, "rgba(255,255,255,0)");
    glint.addColorStop(
      0.43,
      prismRGBA([255, 255, 255], 0.03 * intensity)
    );
    glint.addColorStop(
      0.49,
      prismRGBA([255, 255, 255], 0.38 * intensity)
    );
    glint.addColorStop(
      0.54,
      prismRGBA(PRISM_SPECTRUM[index % 5], 0.30 * intensity)
    );
    glint.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = glint;
    ctx.fillRect(
      glintX - spread,
      y - spread * 2,
      spread * 2,
      spread * 4
    );

    // Finas estrías de refracción.
    for (let line = 0; line < 3; line++) {
      const lineY =
        y + (line - 1) * spread * 0.34 +
        Math.sin(phase + line) * spread * 0.13;

      ctx.beginPath();
      ctx.moveTo(0, lineY);

      ctx.bezierCurveTo(
        w * 0.25, lineY - spread * 0.35,
        w * 0.67, lineY + spread * 0.35,
        w, lineY - spread * 0.08
      );

      ctx.strokeStyle = prismRGBA(
        line === 1 ? [255, 255, 255] : colorB,
        (line === 1 ? 0.20 : 0.085) * intensity
      );

      ctx.lineWidth = line === 1 ? 1.2 : 0.7;
      ctx.stroke();
    }

    ctx.restore();

    // Borde superior: reflejo de cristal.
    tracePrismBand(
      y, spread, band.bend,
      phase, band.frequency
    );

    ctx.strokeStyle = prismRGBA(
      [255, 255, 255],
      (0.12 + Math.abs(wave) * 0.12) * opacity
    );

    ctx.lineWidth = Math.max(0.7, h * 0.0013);
    ctx.stroke();

    // Borde inferior cromático.
    ctx.beginPath();
    ctx.moveTo(0, y + spread);

    ctx.bezierCurveTo(
      w * 0.22, y + spread * 1.8,
      w * 0.62, y + spread * 0.55,
      w, y + spread * 1.65
    );

    ctx.strokeStyle = prismRGBA(
      colorB, 0.24 * opacity
    );
    ctx.lineWidth = Math.max(0.8, h * 0.002);
    ctx.stroke();
  });

  ctx.restore();

  // 3. DESTELLOS VOLUMÉTRICOS EN EL PUNTO DE LUZ.

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const lightRadius = Math.min(w, h) * 0.24;

  drawPrismGlow(
    lx, ly, lightRadius,
    [255, 255, 255],
    0.11 * intensity
  );

  drawPrismGlow(
    lx - lightRadius * 0.20,
    ly + lightRadius * 0.12,
    lightRadius * 0.8,
    primary,
    0.14 * intensity
  );

  // 4. FRAGMENTOS DE CRISTAL FLOTANTES.

  prismShards.forEach((shard, index) => {
    shard.y -= shard.drift * delta;
    shard.x +=
      Math.sin(time * 0.00022 + shard.phase) *
      0.10 * delta * shard.depth;

    if (shard.y < -shard.size * 3) {
      shard.y = h + shard.size * 2;
      shard.x = rand(0, w);
    }

    if (shard.x < -shard.size * 3) {
      shard.x = w + shard.size;
    }

    if (shard.x > w + shard.size * 3) {
      shard.x = -shard.size;
    }

    const dx = shard.x - lx;
    const dy = shard.y - ly;
    const distance = Math.hypot(dx, dy) || 1;

    // Los fragmentos reaccionan al paso de las ondas generadas al hacer clic.
    const influence = prismBursts.reduce((highest, burst) => {
      const burstDistance = Math.hypot(shard.x - burst.x, shard.y - burst.y);
      const progress = burst.age / 0.62;
      const reach = progress * Math.max(w, h) * 0.32;
      const pulse = Math.max(0, 1 - Math.abs(burstDistance - reach) / 85);
      return Math.max(highest, pulse * burst.strength * (1 - progress));
    },0);

    shard.x += (dx / distance) * influence * delta * 0.12;
    shard.y += (dy / distance) * influence * delta * 0.12;

    const pulse =
      0.5 + 0.5 *
      Math.sin(time * 0.0011 + shard.phase);

    const alpha =
      (0.09 + pulse * 0.20 + influence * 0.20) *
      intensity * shard.depth;

    const size =
      shard.size * (0.85 + pulse * 0.22);

    const color =
      PRISM_SPECTRUM[shard.colorIndex];

    ctx.save();
    ctx.translate(shard.x, shard.y);
    ctx.rotate(
      shard.rotation +
      time * shard.rotationSpeed
    );

    // Reflejo desplazado.
    ctx.beginPath();
    ctx.moveTo(-size * 0.45, -size * 0.8);
    ctx.lineTo(size * 0.58, -size * 0.18);
    ctx.lineTo(size * 0.16, size * shard.elongation);
    ctx.lineTo(-size * 0.52, size * 0.28);
    ctx.closePath();

    const facet = ctx.createLinearGradient(
      -size, -size,
      size, size
    );

    facet.addColorStop(
      0, prismRGBA([255, 255, 255], alpha * 0.9)
    );
    facet.addColorStop(
      0.45, prismRGBA(color, alpha)
    );
    facet.addColorStop(
      1, prismRGBA(secondary, alpha * 0.12)
    );

    ctx.fillStyle = facet;
    ctx.fill();

    ctx.strokeStyle = prismRGBA(
      [255, 255, 255], alpha * 0.85
    );
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Aristas interiores.
    ctx.beginPath();
    ctx.moveTo(-size * 0.45, -size * 0.8);
    ctx.lineTo(size * 0.04, size * 0.02);
    ctx.lineTo(size * 0.58, -size * 0.18);

    ctx.moveTo(size * 0.04, size * 0.02);
    ctx.lineTo(size * 0.16, size * shard.elongation);

    ctx.strokeStyle = prismRGBA(
      [255, 255, 255], alpha * 0.65
    );
    ctx.stroke();

    // Pequeño punto de luz en fragmentos iluminados.
    if (influence > 0.25) {
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = prismRGBA(
        [255, 255, 255], alpha * influence
      );
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();

  // Las ondas del clic giran y dispersan fragmentos de cristal.
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  prismCrystals = prismCrystals.filter(crystal => {
    crystal.age += delta / 1000;
    if (crystal.age >= crystal.lifetime)
      return false;

    const seconds = delta / 1000;
    crystal.x += crystal.vx * seconds;
    crystal.y += crystal.vy * seconds;
    crystal.vx *= Math.pow(0.16, seconds);
    crystal.vy *= Math.pow(0.16, seconds);
    crystal.rotation += crystal.rotationSpeed * seconds;

    const progress = crystal.age / crystal.lifetime;
    const fade = Math.sin(Math.PI * progress);
    const size = crystal.size * (0.55 + fade * 0.8);
    const color = PRISM_SPECTRUM[crystal.colorIndex];

    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    ctx.rotate(crystal.rotation);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.55, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.55, 0);
    ctx.closePath();
    ctx.fillStyle = prismRGBA(color, fade * 0.82);
    ctx.shadowColor = prismRGBA(color, fade);
    ctx.shadowBlur = size * 2.5;
    ctx.fill();
    ctx.strokeStyle = prismRGBA([255, 255, 255], fade * 0.9);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
    return true;
  });

  for (const burst of prismBursts) {
    const progress = burst.age / 0.62;
    const eased = 1 - Math.pow(1 - progress, 3);
    const radius = eased * Math.min(w, h) * 0.38;
    const fade = Math.pow(1 - progress, 1.7) * burst.strength;
    const color = PRISM_SPECTRUM[Math.floor((((burst.hue % 360) + 360) % 360) / 72)];

    for (let ring = 0; ring < 2; ring++) {
      const ringRadius = radius * (0.76 + ring * 0.24);
      ctx.beginPath();
      ctx.ellipse(
        burst.x,
        burst.y,
        ringRadius,
        ringRadius * (0.58 + ring * 0.08),
        burst.rotation + ring * 0.22,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = prismRGBA(ring === 0 ? color : [255, 255, 255], fade * (0.72 - ring * 0.22));
      ctx.lineWidth = (2.8 - ring) * (1 - progress * 0.45);
      ctx.shadowColor = prismRGBA(color, fade);
      ctx.shadowBlur = 14 * (1 - progress);
      ctx.stroke();
    }

    for (let ray = 0; ray < 8; ray++) {
      const angle = burst.rotation + ray * Math.PI / 4;
      const inner = radius * 0.18;
      const outer = radius * (0.8 + 0.12 * Math.sin(ray * 2.1 + progress * 6));
      ctx.beginPath();
      ctx.moveTo(burst.x + Math.cos(angle) * inner, burst.y + Math.sin(angle) * inner);
      ctx.lineTo(burst.x + Math.cos(angle) * outer, burst.y + Math.sin(angle) * outer);
      ctx.strokeStyle = prismRGBA(PRISM_SPECTRUM[(ray + Math.floor(burst.hue / 72)) % PRISM_SPECTRUM.length], fade * 0.72);
      ctx.lineWidth = 1 + fade;
      ctx.stroke();
    }

    drawPrismGlow(burst.x, burst.y, Math.max(2, 22 * (1 - progress)), color, fade * 0.38);
  }
  ctx.restore();
}
