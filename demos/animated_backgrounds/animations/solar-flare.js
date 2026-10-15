
let solarParticles = [];
let solarMagneticLoops = [];
let solarBackgroundStars = [];

let solarFlareRays = [];
let solarProminences = [];
let solarSurfaceCells = [];
let solarSunspots = [];
let solarDust = [];

function buildSolarFlare() {
  const settings = getEffectSettings("flare");
  const amount = Math.max(40, settings.amount || 70);

  solarFlareRays = Array.from({ length: amount }, (_, i) => ({
    angle: Math.PI * 2 * i / amount + rand(-0.04, 0.04),
    length: rand(0.45, 1.35),
    width: rand(0.5, 4.5),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.5, 1.5),
    curve: rand(-0.2, 0.2)
  }));

  solarProminences = Array.from({ length: 12 }, (_, i) => ({
    angle: Math.PI * 2 * i / 12 + rand(-0.2, 0.2),
    height: rand(0.35, 1.15),
    width: rand(0.12, 0.3),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.6, 1.5),
    direction: i % 2 ? -1 : 1,
    curve: rand(-0.4, 0.4)
  }));

  solarSurfaceCells = Array.from({ length: 220 }, () => ({
    angle: rand(0, Math.PI * 2),
    radius: Math.sqrt(rand(0, 0.94)),
    size: rand(0.009, 0.05),
    phase: rand(0, Math.PI * 2),
    oval: rand(0.4, 1.7),
    speed: rand(0.4, 1.6)
  }));

  solarSunspots = Array.from({ length: 11 }, () => ({
    angle: rand(0, Math.PI * 2),
    radius: rand(0.12, 0.82),
    size: rand(0.02, 0.07),
    phase: rand(0, Math.PI * 2),
    oval: rand(0.6, 1.5)
  }));

  solarParticles = Array.from({ length: 220 }, () => ({
    angle: rand(0, Math.PI * 2),
    distance: rand(1.05, 4.2),
    speed: rand(0.025, 0.15),
    size: rand(0.5, 2),
    phase: rand(0, Math.PI * 2),
    opacity: rand(0.15, 0.8),
    direction: Math.random() < 0.5 ? -1 : 1
  }));

  solarMagneticLoops = Array.from({ length: 12 }, (_, i) => ({
    angle: Math.PI * 2 * i / 12 + rand(-0.3, 0.3),
    radius: rand(1.1, 1.9),
    height: rand(0.35, 1.2),
    phase: rand(0, Math.PI * 2),
    width: rand(0.7, 2.2),
    direction: i % 2 ? -1 : 1
  }));

  solarBackgroundStars = Array.from({ length: 180 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: rand(0.3, 1.5),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.3, 1.5),
    opacity: rand(0.15, 0.7)
  }));

  solarDust = Array.from({ length: 100 }, () => ({
    angle: rand(0, Math.PI * 2),
    distance: rand(1.3, 5),
    speed: rand(0.01, 0.07),
    size: rand(0.3, 1.2),
    phase: rand(0, Math.PI * 2)
  }));
}

function drawSolarFlare(time, dt) {
  clear();

  const settings = getEffectSettings("flare");
  const primary = hexToRgb(settings.color);
  const secondary = hexToRgb(settings.secondaryColor);

  const width = W();
  const height = H();
  const minDimension = Math.min(width, height);
  const sceneRadius = Math.max(width, height) * 0.8;
  const coreRadius = minDimension * 0.125;
  const intensity = Math.max(0, settings.intensity ?? 1);
  const t = time * 0.001;

  const centerX = mouse.active
    ? width * 0.5 + (mouse.x - width * 0.5) * 0.12
    : width * 0.5;

  const centerY = mouse.active
    ? height * 0.47 + (mouse.y - height * 0.5) * 0.09
    : height * 0.47;

  // 1. FONDO ESPACIAL

  const background = ctx.createLinearGradient(
    0, 0, width, height
  );

  background.addColorStop(0, "#02030a");
  background.addColorStop(0.5, "#0b0715");
  background.addColorStop(1, "#02020a");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  // Nebulosas ambientales

  for (let i = 0; i < 3; i++) {
    const nx = width * (0.2 + i * 0.3) +
      Math.sin(t * 0.08 + i) * width * 0.04;

    const ny = height * (0.25 + i * 0.25) +
      Math.cos(t * 0.06 + i) * height * 0.04;

    const nebula = ctx.createRadialGradient(
      nx, ny, 0,
      nx, ny, sceneRadius * 0.7
    );

    nebula.addColorStop(
      0,
      `rgba(${primary.join(",")},${0.055 * intensity})`
    );
    nebula.addColorStop(
      0.4,
      `rgba(${secondary.join(",")},${0.025 * intensity})`
    );
    nebula.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);
  }

  // Estrellas parpadeantes

  ctx.save();

  for (const star of solarBackgroundStars) {
    const twinkle = 0.45 + 0.55 * (
      0.5 + 0.5 * Math.sin(t * star.speed + star.phase)
    );

    ctx.globalAlpha = star.opacity * twinkle;
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.arc(
      star.x * width,
      star.y * height,
      star.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();

  // 2. HALO EXTERIOR

  const halo = ctx.createRadialGradient(
    centerX, centerY, coreRadius * 0.2,
    centerX, centerY, sceneRadius
  );

  halo.addColorStop(
    0,
    `rgba(${secondary.join(",")},${0.2 * intensity})`
  );
  halo.addColorStop(
    0.16,
    `rgba(${primary.join(",")},${0.12 * intensity})`
  );
  halo.addColorStop(
    0.42,
    `rgba(${primary.join(",")},${0.035 * intensity})`
  );
  halo.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.globalCompositeOperation = "screen";

  // 3. CORONA MULTICAPA

  const coronaLayers = [
    { radius: 2.1, alpha: 0.025, blur: 38 },
    { radius: 1.7, alpha: 0.045, blur: 28 },
    { radius: 1.35, alpha: 0.065, blur: 18 }
  ];

  for (const layer of coronaLayers) {
    const pulse = 0.85 + 0.15 * Math.sin(
      t * 1.2 + layer.radius
    );

    const gradient = ctx.createRadialGradient(
      0, 0, coreRadius * 0.65,
      0, 0, coreRadius * layer.radius
    );

    gradient.addColorStop(
      0,
      `rgba(${secondary.join(",")},${layer.alpha * intensity * pulse})`
    );
    gradient.addColorStop(
      0.55,
      `rgba(${primary.join(",")},${layer.alpha * 0.6 * intensity})`
    );
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(
      -coreRadius * layer.radius,
      -coreRadius * layer.radius,
      coreRadius * layer.radius * 2,
      coreRadius * layer.radius * 2
    );
  }

  // 4. RAYOS IRREGULARES

  solarFlareRays.forEach((ray, index) => {
    const pulse = 0.68 + 0.32 * (
      0.5 + 0.5 * Math.sin(t * ray.speed + ray.phase)
    );

    const length = sceneRadius * ray.length * pulse;
    const angle = ray.angle +
      Math.sin(t * 0.13 + ray.phase) * 0.015;

    const start = coreRadius * 0.82;
    const end = start + length;
    const thickness = ray.width * (0.65 + pulse * 0.55);

    ctx.save();
    ctx.rotate(angle);

    const gradient = ctx.createLinearGradient(
      start, 0, end, 0
    );

    gradient.addColorStop(
      0,
      `rgba(${secondary.join(",")},${0.48 * intensity})`
    );
    gradient.addColorStop(
      0.15,
      `rgba(${primary.join(",")},${0.26 * intensity})`
    );
    gradient.addColorStop(
      0.5,
      `rgba(${primary.join(",")},${0.06 * intensity})`
    );
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(start, -thickness * 0.2);

    ctx.quadraticCurveTo(
      start + length * 0.25,
      -thickness * (0.9 + Math.abs(ray.curve)),
      start + length * 0.68,
      -thickness * 0.15
    );

    ctx.lineTo(end, 0);

    ctx.quadraticCurveTo(
      start + length * 0.6,
      thickness * 0.65,
      start + length * 0.22,
      thickness * 0.35
    );

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });

  // 5. ARCOS MAGNÉTICOS

  solarMagneticLoops.forEach((loop, index) => {
    const pulse = 0.85 + 0.15 * Math.sin(
      t * 0.9 + loop.phase
    );

    ctx.save();
    ctx.rotate(
      loop.angle + t * 0.025 * loop.direction
    );

    const radius = coreRadius * loop.radius * pulse;
    const arcHeight = coreRadius * loop.height;

    ctx.beginPath();
    ctx.moveTo(-radius * 0.7, 0);

    ctx.bezierCurveTo(
      -radius * 0.6,
      -arcHeight * 1.8,
      radius * 0.6,
      -arcHeight * 1.8,
      radius * 0.7,
      0
    );

    const alpha = 0.1 + 0.1 * (
      0.5 + 0.5 * Math.sin(t + loop.phase)
    );

    ctx.strokeStyle = index % 2
      ? `rgba(${primary.join(",")},${alpha * intensity})`
      : `rgba(${secondary.join(",")},${alpha * intensity})`;

    ctx.lineWidth = loop.width;
    ctx.lineCap = "round";
    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.restore();
  });

  // 6. GRANDES PROTUBERANCIAS

  solarProminences.forEach((flare, index) => {
    const pulse = 0.78 + 0.22 * Math.sin(
      t * flare.speed + flare.phase
    );

    const reach = coreRadius * (
      1 + flare.height * pulse
    );

    ctx.save();
    ctx.rotate(
      flare.angle + t * 0.018 * flare.direction
    );

    ctx.beginPath();
    ctx.moveTo(coreRadius * 0.9, 0);

    ctx.bezierCurveTo(
      reach * 0.55,
      -coreRadius * flare.width,
      reach * (0.9 + flare.curve * 0.2),
      -reach * 0.7,
      reach * 0.62,
      -reach
    );

    ctx.bezierCurveTo(
      reach * 0.22,
      -reach * 0.8,
      coreRadius * 1.05,
      -coreRadius * 0.5,
      coreRadius * 0.9,
      0
    );

    ctx.strokeStyle = index % 2
      ? `rgba(${secondary.join(",")},${0.58 * intensity})`
      : `rgba(255,190,105,${0.65 * intensity})`;

    ctx.lineWidth = Math.max(
      1.2,
      coreRadius * flare.width * 0.075
    );

    ctx.lineCap = "round";
    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 18;
    ctx.stroke();

    ctx.restore();
  });

  // 7. POLVO Y PARTÍCULAS

  solarDust.forEach((particle) => {
    const angle = particle.angle +
      t * particle.speed;

    const distance = coreRadius * (
      particle.distance +
      Math.sin(t * 0.4 + particle.phase) * 0.08
    );

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    ctx.globalAlpha = 0.15 + 0.2 * (
      0.5 + 0.5 * Math.sin(t + particle.phase)
    );

    ctx.fillStyle = "#ffc477";
    ctx.beginPath();
    ctx.arc(
      x, y,
      particle.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  solarParticles.forEach((particle) => {
    const angle = particle.angle +
      t * particle.speed * particle.direction;

    const distance = coreRadius * (
      particle.distance +
      Math.sin(t * 0.6 + particle.phase) * 0.12
    );

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const flicker = 0.5 + 0.5 * Math.sin(
      t * 2 + particle.phase
    );

    ctx.globalAlpha = particle.opacity * flicker;
    ctx.fillStyle = particle.direction > 0
      ? settings.color
      : "#ffe1a0";

    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 7;

    ctx.beginPath();
    ctx.arc(
      x, y,
      particle.size * (0.7 + flicker * 0.5),
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // 8. BORDE INCANDESCENTE

  const rim = ctx.createRadialGradient(
    0, 0, coreRadius * 0.83,
    0, 0, coreRadius * 1.15
  );

  rim.addColorStop(0, "rgba(255,255,255,0)");
  rim.addColorStop(
    0.45,
    `rgba(${secondary.join(",")},${0.85 * intensity})`
  );
  rim.addColorStop(
    0.72,
    `rgba(${primary.join(",")},${0.5 * intensity})`
  );
  rim.addColorStop(1, "rgba(255,80,20,0)");

  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // 9. SUPERFICIE SOLAR

  const core = ctx.createRadialGradient(
    -coreRadius * 0.27,
    -coreRadius * 0.3,
    coreRadius * 0.03,
    0, 0, coreRadius
  );

  core.addColorStop(0, "#fffef2");
  core.addColorStop(
    0.16,
    `rgba(${secondary.join(",")},1)`
  );
  core.addColorStop(
    0.43,
    `rgba(${primary.join(",")},1)`
  );
  core.addColorStop(0.72, "#ff7625");
  core.addColorStop(0.92, "#ed451b");
  core.addColorStop(1, "#a82b18");

  ctx.fillStyle = core;
  ctx.shadowColor = settings.color;
  ctx.shadowBlur = 38 * intensity;

  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // 10. GRANULACIÓN DE PLASMA

  ctx.save();

  ctx.beginPath();
  ctx.arc(0, 0, coreRadius * 0.985, 0, Math.PI * 2);
  ctx.clip();

  solarSurfaceCells.forEach((cell, index) => {
    const angle = cell.angle +
      t * 0.025 * cell.speed * (index % 2 ? 1 : -1) +
      Math.sin(t * 0.5 + cell.phase) * 0.025;

    const distance = cell.radius * coreRadius * 0.91;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const pulse = 0.5 + 0.5 * Math.sin(
      t * 1.8 + cell.phase
    );

    const size = coreRadius * cell.size *
      (0.7 + pulse * 0.55);

    const plasma = ctx.createRadialGradient(
      x, y, 0,
      x, y, size * 2.3
    );

    plasma.addColorStop(
      0,
      `rgba(255,255,225,${0.2 + pulse * 0.24})`
    );
    plasma.addColorStop(
      0.4,
      `rgba(${secondary.join(",")},${0.12 + pulse * 0.12})`
    );
    plasma.addColorStop(1, "rgba(255,90,10,0)");

    ctx.fillStyle = plasma;

    ctx.beginPath();
    ctx.ellipse(
      x, y,
      size * 1.5,
      size * cell.oval,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  // 11. MANCHAS SOLARES

  solarSunspots.forEach((spot) => {
    const angle = spot.angle + t * 0.018;
    const distance = spot.radius * coreRadius;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const size = spot.size * coreRadius * (
      0.95 + 0.05 * Math.sin(t + spot.phase)
    );

    ctx.fillStyle = "rgba(100,35,18,0.28)";

    ctx.beginPath();
    ctx.ellipse(
      x, y,
      size * 1.8,
      size * spot.oval,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "rgba(42,18,16,0.4)";

    ctx.beginPath();
    ctx.ellipse(
      x, y,
      size * 0.78,
      size * 0.55,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.restore();

  // 12. REFLEJO DE ALTA TEMPERATURA

  const reflection = ctx.createRadialGradient(
    -coreRadius * 0.28,
    -coreRadius * 0.32,
    0,
    -coreRadius * 0.2,
    -coreRadius * 0.25,
    coreRadius * 0.65
  );

  reflection.addColorStop(
    0,
    "rgba(255,255,255,0.3)"
  );
  reflection.addColorStop(
    0.35,
    "rgba(255,245,210,0.1)"
  );
  reflection.addColorStop(
    1,
    "rgba(255,255,255,0)"
  );

  ctx.fillStyle = reflection;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 13. VIÑETA CINEMATOGRÁFICA

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    minDimension * 0.15,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75
  );

  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.65, "rgba(0,0,0,0.08)");
  vignette.addColorStop(1, "rgba(0,0,0,0.58)");

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}



function drawSolarFlare(time, dt) {
  clear();

  const settings = getEffectSettings("flare");
  const primary = hexToRgb(settings.color);
  const secondary = hexToRgb(settings.secondaryColor);

  const width = W();
  const height = H();
  const minDimension = Math.min(width, height);
  const sceneRadius = Math.max(width, height) * 0.78;
  const coreRadius = minDimension * 0.125;
  const intensity = Math.max(0, settings.intensity ?? 1);

  // Tiempo normalizado para mantener velocidades estables
  const frameScale = Math.min(Math.max((dt || 16.67) / 16.67, 0), 2);
  const t = time * 0.001;

  // Movimiento suave del núcleo siguiendo ligeramente el ratón
  const targetX = mouse.active
    ? width * 0.5 + (mouse.x - width * 0.5) * 0.12
    : width * 0.5;

  const targetY = mouse.active
    ? height * 0.47 + (mouse.y - height * 0.5) * 0.09
    : height * 0.47;

  const centerX = targetX;
  const centerY = targetY;

  // --------------------------------------------------
  // 1. FONDO ESPACIAL
  // --------------------------------------------------

  const background = ctx.createLinearGradient(
    0, 0, width, height
  );

  background.addColorStop(0, "#03030b");
  background.addColorStop(0.5, "#090512");
  background.addColorStop(1, "#02030a");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  // Nebulosa ambiental
  const nebula = ctx.createRadialGradient(
    centerX, centerY, coreRadius * 0.5,
    centerX, centerY, sceneRadius
  );

  nebula.addColorStop(
    0,
    `rgba(${secondary.join(",")},${0.16 * intensity})`
  );
  nebula.addColorStop(
    0.22,
    `rgba(${primary.join(",")},${0.105 * intensity})`
  );
  nebula.addColorStop(
    0.58,
    `rgba(${primary.join(",")},${0.025 * intensity})`
  );
  nebula.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, width, height);

  // Estrellas de fondo
  ctx.save();

  for (const star of solarBackgroundStars) {
    const twinkle = 0.65 + 0.35 * Math.sin(
      t * star.speed + star.phase
    );

    ctx.globalAlpha = star.opacity * twinkle;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      star.x * width,
      star.y * height,
      star.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();

  // --------------------------------------------------
  // 2. CORONA EXTERIOR DIFUSA
  // --------------------------------------------------

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.globalCompositeOperation = "screen";

  const coronaLayers = [
    { radius: 1.95, alpha: 0.035, blur: 34 },
    { radius: 1.58, alpha: 0.055, blur: 23 },
    { radius: 1.30, alpha: 0.075, blur: 14 }
  ];

  for (const layer of coronaLayers) {
    const pulse = 0.88 + 0.12 * Math.sin(
      t * 1.3 + layer.radius
    );

    const glow = ctx.createRadialGradient(
      0, 0, coreRadius * 0.7,
      0, 0, coreRadius * layer.radius
    );

    glow.addColorStop(
      0,
      `rgba(${secondary.join(",")},${layer.alpha * intensity * pulse})`
    );
    glow.addColorStop(
      0.5,
      `rgba(${primary.join(",")},${layer.alpha * 0.6 * intensity})`
    );
    glow.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = glow;
    ctx.fillRect(
      -coreRadius * layer.radius,
      -coreRadius * layer.radius,
      coreRadius * layer.radius * 2,
      coreRadius * layer.radius * 2
    );
  }

  // --------------------------------------------------
  // 3. RAYOS SOLARES CON MOVIMIENTO ORGÁNICO
  // --------------------------------------------------

  solarFlareRays.forEach((ray, index) => {
    const wave = Math.sin(
      t * ray.speed + ray.phase
    );

    const pulse = 0.72 + wave * 0.22;
    const length = sceneRadius * ray.length * pulse;

    const rotation = ray.angle +
      Math.sin(t * 0.17 + ray.phase) * 0.012;

    ctx.save();
    ctx.rotate(rotation);

    const start = coreRadius * 0.83;
    const end = start + length;
    const thickness = ray.width * (0.8 + pulse * 0.4);

    const gradient = ctx.createLinearGradient(
      start, 0, end, 0
    );

    gradient.addColorStop(
      0,
      `rgba(${secondary.join(",")},${0.42 * intensity})`
    );
    gradient.addColorStop(
      0.12,
      `rgba(${primary.join(",")},${0.25 * intensity})`
    );
    gradient.addColorStop(
      0.42,
      `rgba(${primary.join(",")},${0.07 * intensity})`
    );
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 8 + thickness * 2;

    ctx.beginPath();
    ctx.moveTo(start, -thickness * 0.2);

    ctx.quadraticCurveTo(
      start + length * 0.28,
      -thickness * (1.2 + Math.abs(ray.curve)),
      start + length * 0.62,
      -thickness * 0.12
    );

    ctx.lineTo(end, 0);

    ctx.quadraticCurveTo(
      start + length * 0.55,
      thickness * 0.8,
      start + length * 0.24,
      thickness * 0.38
    );

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // --------------------------------------------------
  // 4. ARCOS MAGNÉTICOS
  // --------------------------------------------------

  solarMagneticLoops.forEach((loop, index) => {
    const pulse = 0.85 + 0.15 * Math.sin(
      t * 0.9 + loop.phase
    );

    const rotation = loop.angle +
      t * 0.035 * loop.direction;

    const radius = coreRadius * loop.radius * pulse;
    const height = coreRadius * loop.height;

    ctx.save();
    ctx.rotate(rotation);

    ctx.beginPath();

    ctx.moveTo(-radius * 0.7, 0);

    ctx.bezierCurveTo(
      -radius * 0.6,
      -height * 1.8,
      radius * 0.6,
      -height * 1.8,
      radius * 0.7,
      0
    );

    const alpha = 0.12 + 0.09 * Math.sin(
      t * 1.5 + loop.phase
    );

    ctx.strokeStyle = index % 2
      ? `rgba(${primary.join(",")},${alpha * intensity})`
      : `rgba(${secondary.join(",")},${alpha * intensity})`;

    ctx.lineWidth = loop.width;
    ctx.lineCap = "round";
    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.restore();
  });

  // --------------------------------------------------
  // 5. PROTUBERANCIAS Y LLAMARADAS
  // --------------------------------------------------

  solarProminences.forEach((flare, index) => {
    const wave = Math.sin(
      t * flare.speed + flare.phase
    );

    const pulse = 0.78 + 0.22 * wave;
    const reach = coreRadius * (
      1 + flare.height * pulse
    );

    const rotation = flare.angle +
      t * 0.018 * flare.direction;

    ctx.save();
    ctx.rotate(rotation);

    ctx.beginPath();

    ctx.moveTo(coreRadius * 0.88, 0);

    ctx.bezierCurveTo(
      reach * 0.55,
      -coreRadius * flare.width,
      reach * (0.9 + flare.curve * 0.2),
      -reach * 0.68,
      reach * 0.62,
      -reach
    );

    ctx.bezierCurveTo(
      reach * 0.22,
      -reach * 0.85,
      coreRadius * 1.08,
      -coreRadius * 0.5,
      coreRadius * 0.88,
      0
    );

    ctx.strokeStyle = index % 2
      ? `rgba(${secondary.join(",")},${0.55 * intensity})`
      : `rgba(255,190,105,${0.62 * intensity})`;

    ctx.lineWidth = Math.max(
      1.2,
      coreRadius * flare.width * 0.075
    );

    ctx.lineCap = "round";
    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 16;
    ctx.stroke();

    // Filamento interior más brillante
    ctx.beginPath();

    ctx.moveTo(coreRadius, 0);

    ctx.quadraticCurveTo(
      reach * 0.6,
      -reach * 0.35,
      reach * 0.62,
      -reach * 0.78
    );

    ctx.strokeStyle =
      `rgba(255,225,172,${0.15 * intensity})`;

    ctx.lineWidth = 1;
    ctx.shadowBlur = 8;
    ctx.stroke();

    ctx.restore();
  });

  // --------------------------------------------------
  // 6. PARTÍCULAS DE PLASMA
  // --------------------------------------------------

  solarParticles.forEach((particle) => {
    const orbit = t * particle.speed * particle.direction;

    const angle = particle.angle + orbit;

    const distance = coreRadius * (
      particle.distance +
      Math.sin(t * 0.7 + particle.phase) * 0.09
    );

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const flicker = 0.55 + 0.45 * Math.sin(
      t * 2 + particle.phase
    );

    const size = particle.size * flicker;

    ctx.globalAlpha = particle.opacity * flicker;
    ctx.fillStyle = particle.direction > 0
      ? settings.color
      : "#ffdca0";

    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 7;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // --------------------------------------------------
  // 7. BORDE INCANDESCENTE
  // --------------------------------------------------

  const rim = ctx.createRadialGradient(
    0, 0, coreRadius * 0.87,
    0, 0, coreRadius * 1.12
  );

  rim.addColorStop(0, "rgba(255,255,255,0)");
  rim.addColorStop(
    0.45,
    `rgba(${secondary.join(",")},${0.8 * intensity})`
  );
  rim.addColorStop(
    0.72,
    `rgba(${primary.join(",")},${0.45 * intensity})`
  );
  rim.addColorStop(1, "rgba(255,100,30,0)");

  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius * 1.12, 0, Math.PI * 2);
  ctx.fill();

  // --------------------------------------------------
  // 8. DISCO SOLAR Y SUPERFICIE
  // --------------------------------------------------

  const core = ctx.createRadialGradient(
    -coreRadius * 0.28,
    -coreRadius * 0.32,
    coreRadius * 0.04,
    0, 0, coreRadius
  );

  core.addColorStop(0, "#fffef0");
  core.addColorStop(
    0.18,
    `rgba(${secondary.join(",")},1)`
  );
  core.addColorStop(
    0.52,
    `rgba(${primary.join(",")},0.98)`
  );
  core.addColorStop(0.82, "#f76b20");
  core.addColorStop(1, "#a52b16");

  ctx.fillStyle = core;
  ctx.shadowColor = settings.color;
  ctx.shadowBlur = 35 * intensity;

  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Recorte circular para que el plasma no salga del disco
  ctx.save();

  ctx.beginPath();
  ctx.arc(0, 0, coreRadius * 0.985, 0, Math.PI * 2);
  ctx.clip();

  // Granulación animada
  solarSurfaceCells.forEach((cell, index) => {
    const angle = cell.angle +
      t * 0.025 * (index % 2 ? 1 : -1) * cell.speed +
      Math.sin(t * 0.5 + cell.phase) * 0.025;

    const distance = cell.radius * coreRadius * 0.91;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const pulse = 0.5 + 0.5 * Math.sin(
      t * 1.7 + cell.phase
    );

    const size = coreRadius * cell.size *
      (0.75 + pulse * 0.5);

    const gradient = ctx.createRadialGradient(
      x, y, 0, x, y, size * 2.2
    );

    gradient.addColorStop(
      0,
      `rgba(255,255,220,${0.15 + pulse * 0.24})`
    );
    gradient.addColorStop(
      0.45,
      `rgba(${secondary.join(",")},${0.12 + pulse * 0.12})`
    );
    gradient.addColorStop(1, "rgba(255,100,20,0)");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.ellipse(
      x, y,
      size * 1.5,
      size * cell.oval,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  // Manchas solares
  solarSunspots.forEach((spot) => {
    const angle = spot.angle +
      t * 0.018;

    const distance = spot.radius * coreRadius;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const size = spot.size * coreRadius *
      (0.95 + 0.05 * Math.sin(t + spot.phase));

    ctx.fillStyle = "rgba(91,35,20,0.28)";

    ctx.beginPath();
    ctx.ellipse(
      x, y,
      size * 1.8,
      size * spot.oval,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "rgba(45,19,16,0.36)";

    ctx.beginPath();
    ctx.ellipse(
      x, y,
      size * 0.78,
      size * 0.54,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.restore();

  // --------------------------------------------------
  // 9. REFLEJO CENTRAL
  // --------------------------------------------------

  const reflection = ctx.createRadialGradient(
    -coreRadius * 0.28,
    -coreRadius * 0.34,
    0,
    -coreRadius * 0.2,
    -coreRadius * 0.25,
    coreRadius * 0.58
  );

  reflection.addColorStop(0, "rgba(255,255,255,0.26)");
  reflection.addColorStop(0.35, "rgba(255,245,210,0.09)");
  reflection.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = reflection;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // --------------------------------------------------
  // 10. VIÑETA CINEMATOGRÁFICA
  // --------------------------------------------------

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    minDimension * 0.15,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.76
  );

  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.65, "rgba(0,0,0,0.08)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

