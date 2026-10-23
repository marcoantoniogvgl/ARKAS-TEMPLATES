let sakuraFalling = [];
let sakuraBlooms = [];
let sakuraTreeLimbs = [];
let sakuraTreeBounds = null;
let sakuraSpawnClock = 0;
let sakuraPetalSprites = [];
let sakuraTreeCache = null;
let sakuraBloomCache = null;
let sakuraTreeCacheDirty = true;
let sakuraBloomCacheDirty = true;
let sakuraTreeCacheScale = 1;
let sakuraCameraZoom = 1;
let sakuraCloudSprites = new Map();
let sakuraSkyCache = null;
let sakuraLandscapeCache = null;
let sakuraMountainOcclusion = null;
let sakuraClouds = [];
let sakuraTreeHitGrid = null;
const sakuraBackdropRise = .07;
const sakuraCameraZoomMax = 2.1;
const sakuraCloudImage = new Image();
const sakuraRedCloudImage = new Image();
sakuraCloudImage.addEventListener("load", refreshSakuraCloudSprites);
sakuraRedCloudImage.addEventListener("load", refreshSakuraCloudSprites);
sakuraCloudImage.addEventListener("error", () => {
  console.error("No se pudo cargar la nube blanca de Sakura: img/cloud-white.png");
});
sakuraRedCloudImage.addEventListener("error", () => {
  console.error("No se pudo cargar la nube roja de Sakura: img/cloud-red.png");
});
sakuraCloudImage.src = "img/cloud-white.png";
sakuraRedCloudImage.src = "img/cloud-red.png";

function refreshSakuraCloudSprites() {
  const images = [sakuraCloudImage, sakuraRedCloudImage];
  sakuraCloudSprites = new Map(
    images.flatMap((cloudImage, imageIndex) =>
      [0, 1, 2].flatMap(layer =>
        [0, 1, 2].map(variant => [
          imageIndex * 9 + layer * 3 + variant,
          createSakuraCloudSprite(variant, layer, cloudImage)
        ])
      )
    )
  );
}

function buildSakura() {
  const settings = getEffectSettings("sakura");
  const base = Math.min(W(), H());
  sakuraTreeLimbs = [];
  sakuraBlooms = [];
  sakuraFalling = [];
  sakuraSpawnClock = 0;
  sakuraTreeCache = null;
  sakuraBloomCache = null;
  sakuraTreeCacheDirty = true;
  sakuraBloomCacheDirty = true;
  sakuraCameraZoom = clamp(settings.zoom ?? .8, .65, sakuraCameraZoomMax);
  sakuraSkyCache = document.createElement("canvas");
  sakuraSkyCache.width = Math.ceil(W() * dpr);
  sakuraSkyCache.height = Math.ceil(H() * dpr);
  const skyContext = sakuraSkyCache.getContext("2d");
  skyContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawSakuraSky(skyContext);
  sakuraLandscapeCache = document.createElement("canvas");
  sakuraLandscapeCache.width = Math.ceil(W() * dpr);
  sakuraLandscapeCache.height = Math.ceil(H() * dpr);
  const landscapeContext = sakuraLandscapeCache.getContext("2d");
  landscapeContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  landscapeContext.save();
  landscapeContext.translate(0, -H() * sakuraBackdropRise);
  drawSakuraDistantLandscape(landscapeContext);
  landscapeContext.restore();
  refreshSakuraCloudSprites();
  sakuraClouds = [];
  const cloudLayers = [
    { layer: 0, count: 10, minScale: .38, maxScale: .62, minY: .1, maxY: .77, speed: .35 },
    { layer: 1, count: 9, minScale: .55, maxScale: .88, minY: .2, maxY: .85, speed: .65 },
    { layer: 2, count: 7, minScale: .78, maxScale: 1.18, minY: .38, maxY: .92, speed: 1 }
  ];
  cloudLayers.forEach(({ layer, count, minScale, maxScale, minY, maxY, speed }) => {
    const cloudSpacing = W() * 2 / count;
    for (let index = 0; index < count; index++) {
      sakuraClouds.push({
        layer,
        scale: rand(minScale, maxScale),
        variant: Math.floor(rand(0, 3)),
        x: -W() * .5 + (index + .5) * cloudSpacing + rand(-cloudSpacing * .12, cloudSpacing * .12),
        y: Math.max(H() * .04, rand(H() * minY, H() * maxY) - H() * .11),
        speed: rand(.7, 1.3) * speed,
        direction: layer % 2 ? -1 : 1,
        red: Math.random() < .24,
        phase: rand(0, Math.PI * 2),
        oscillation: H() * rand(.004, .012),
        opacity: 1,
        dissolving: false,
        dissolveProgress: 0
      });
    }
  });
  sakuraPetalSprites = [settings.color, settings.secondaryColor].map(createSakuraPetalSprite);

  const rootX = W() * .5;
  const rootY = H() * .236;
  growSakuraLimb(rootX, rootY, H() * .205, -Math.PI / 2, base * .022, 5, 1, true);
  sakuraTreeBounds = measureSakuraTree();
  buildSakuraTreeHitGrid(base);
  drawSakuraMountain(landscapeContext);
  const landscapePixels = landscapeContext.getImageData(0, 0, sakuraLandscapeCache.width, sakuraLandscapeCache.height).data;
  const occlusionData = new Uint8Array(sakuraLandscapeCache.width * sakuraLandscapeCache.height);
  for (let pixel = 0; pixel < occlusionData.length; pixel++)
    occlusionData[pixel] = landscapePixels[pixel * 4 + 3];
  sakuraMountainOcclusion = {
    width: sakuraLandscapeCache.width,
    height: sakuraLandscapeCache.height,
    data: occlusionData
  };
  refreshSakuraTreeCache(hexToRgb(settings.color), hexToRgb(settings.secondaryColor));

  for (let index = 0; index < Math.min(2, settings.amount); index++)
    spawnSakuraPetalFromTree(base);
}

function growSakuraLimb(x, y, length, angle, width, depth, seed, isMainTrunk = false, parentId = null) {
  const sway = Math.sin(seed * 8.1) * length * .055;
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  const controlX = (x + endX) * .5 + sway + Math.sin(seed * 3.1) * length * .018;
  const controlY = (y + endY) * .5 - length * .014;
  const limb = { id: sakuraTreeLimbs.length, parentId, x, y, controlX, controlY, endX, endY, width, depth, seed, isMainTrunk };
  sakuraTreeLimbs.push(limb);

  // Blossom clusters attach to lateral twigs; the main trunk stays bare.
  if (!isMainTrunk && depth <= 2) {
    addSakuraBloom(limb, depth === 0 ? .76 : .82);
  }

  if (depth <= 0) {
    if (!isMainTrunk) {
      addSakuraBloom(limb, .96, -.62);
      addSakuraBloom(limb, 1, .32);
      addSakuraBloom(limb, .88, .68);
    }
    return;
  }

  const splitT = depth >= 4 ? .62 : .68;
  const inverse = 1 - splitT;
  const splitX = inverse * inverse * x + 2 * inverse * splitT * controlX + splitT * splitT * endX;
  const splitY = inverse * inverse * y + 2 * inverse * splitT * controlY + splitT * splitT * endY;
  const spread = depth >= 3 ? .58 : .68;
  const childLength = length * (depth >= 4 ? .7 : .72);
  const childWidth = width * .66;

  const branchBias = Math.sin(seed * 5.3) * .1;
  const leftAngle = clamp(angle - spread + branchBias, -Math.PI + .08, -.08);
  const rightAngle = clamp(angle + spread + branchBias * .45, -Math.PI + .08, -.08);
  growSakuraLimb(splitX, splitY, childLength * .96, leftAngle, childWidth, depth - 1, seed * 1.73 + .41, false, limb.id);
  growSakuraLimb(splitX, splitY, childLength * .88, rightAngle, childWidth, depth - 1, seed * 2.13 + .83, false, limb.id);

  if (depth >= 3) {
    const upperT = .84;
    const upperInverse = 1 - upperT;
    const upperX = upperInverse * upperInverse * x + 2 * upperInverse * upperT * controlX + upperT * upperT * endX;
    const upperY = upperInverse * upperInverse * y + 2 * upperInverse * upperT * controlY + upperT * upperT * endY;
    growSakuraLimb(upperX, upperY, length * .42, angle + Math.sin(seed * 3.7) * .14, width * .5, depth - 1, seed * 2.67 + .19, isMainTrunk, limb.id);
  }
}

function addSakuraBloom(limb, t, lateral = 0) {
  const inverse = 1 - t;
  const tangentX = 2 * inverse * (limb.controlX - limb.x) + 2 * t * (limb.endX - limb.controlX);
  const tangentY = 2 * inverse * (limb.controlY - limb.y) + 2 * t * (limb.endY - limb.controlY);
  const tangentLength = Math.hypot(tangentX, tangentY) || 1;
  const radius = rand(Math.min(W(), H()) * .0052, Math.min(W(), H()) * .008);
  const normalX = -tangentY / tangentLength;
  const normalY = tangentX / tangentLength;
  sakuraBlooms.push({
    limbId: limb.id,
    x: inverse * inverse * limb.x + 2 * inverse * t * limb.controlX + t * t * limb.endX + normalX * radius * lateral,
    y: inverse * inverse * limb.y + 2 * inverse * t * limb.controlY + t * t * limb.endY + normalY * radius * lateral,
    radius,
    shade: Math.random() < .52 ? 0 : 1,
    attached: true, regrowIn: 0, phase: rand(0, Math.PI * 2)
  });
}

function measureSakuraTree() {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const include = (x, y, padding = 0) => {
    bounds.minX = Math.min(bounds.minX, x - padding);
    bounds.maxX = Math.max(bounds.maxX, x + padding);
    bounds.minY = Math.min(bounds.minY, y - padding);
    bounds.maxY = Math.max(bounds.maxY, y + padding);
  };
  sakuraTreeLimbs.forEach(limb => {
    const padding = limb.width * .58;
    include(limb.x, limb.y, padding);
    include(limb.controlX, limb.controlY, padding);
    include(limb.endX, limb.endY, padding);
  });
  sakuraBlooms.forEach(bloom => include(bloom.x, bloom.y, bloom.radius * 1.25));
  return bounds;
}

function sakuraFitZoom() {
  const bounds = sakuraTreeBounds || { minX: W() * .4, maxX: W() * .6, minY: 0, maxY: H() * .3 };
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const margin = Math.min(W(), H()) * .075;
  return Math.min(1, (W() - margin * 2) / width, (H() - margin * 2) / height);
}

function sakuraViewTransform() {
  const bounds = sakuraTreeBounds || { minX: W() * .4, maxX: W() * .6, minY: 0, maxY: H() * .3 };
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const scale = sakuraFitZoom() * sakuraCameraZoom;
  const focusX = (bounds.minX + bounds.maxX) * .5;
  const focusY = bounds.minY + height * .62;
  const cameraLift = H() * .075;
  return {
    scale,
    offsetX: W() * .5 - focusX * scale,
    offsetY: H() * .49 - focusY * scale + cameraLift * scale
  };
}

function drawSakura(time, dt) {
  clear();
  const settings = getEffectSettings("sakura");
  const primary = hexToRgb(settings.color);
  const secondary = hexToRgb(settings.secondaryColor);
  const zoomTarget = clamp(settings.zoom ?? .8, .65, sakuraCameraZoomMax);
  sakuraCameraZoom += (zoomTarget - sakuraCameraZoom) * (1 - Math.pow(.86, dt));
  if (sakuraTreeCacheDirty)
    refreshSakuraTreeCache(primary, secondary);
  else if (sakuraBloomCacheDirty)
    refreshSakuraBloomCache(primary, secondary);

  if (sakuraSkyCache)
    ctx.drawImage(sakuraSkyCache, 0, 0, W(), H());

  const view = sakuraViewTransform();
  ctx.save();
  ctx.translate(view.offsetX, view.offsetY);
  ctx.scale(view.scale, view.scale);
  drawSakuraCloudLayer(0, dt);
  drawSakuraCloudLayer(1, dt);
  if (sakuraLandscapeCache)
    ctx.drawImage(sakuraLandscapeCache, 0, 0, W(), H());

  if (sakuraTreeCache)
    ctx.drawImage(
      sakuraTreeCache,
      sakuraTreeCache.left,
      sakuraTreeCache.top,
      sakuraTreeCache.worldWidth,
      sakuraTreeCache.worldHeight
    );
  if (sakuraBloomCache)
    ctx.drawImage(
      sakuraBloomCache,
      sakuraBloomCache.left,
      sakuraBloomCache.top,
      sakuraBloomCache.worldWidth,
      sakuraBloomCache.worldHeight
    );
  drawSakuraCloudLayer(2, dt);

  sakuraBlooms.forEach(bloom => {
    if (!bloom.attached) {
      bloom.regrowIn -= dt / 60;
      if (bloom.regrowIn <= 0) {
        bloom.attached = true;
        sakuraBloomCacheDirty = true;
      }
    }
  });

  sakuraSpawnClock += dt;
  if (sakuraFalling.length < settings.amount && sakuraSpawnClock >= 5 * 60) {
    sakuraSpawnClock = 0;
    spawnSakuraPetalFromTree(Math.min(W(), H()));
  }

  const gust = Math.sin(time * .00042) * .18;
  const survivingPetals = [];
  sakuraFalling.forEach(petal => {
    petal.vx += (Math.sin(time * .0007 + petal.phase) * .018 + gust * .012) * dt;
    petal.vy += .004 * dt;
    petal.vx *= Math.pow(.996, dt);
    petal.x += petal.vx * dt;
    petal.y += petal.vy * dt;
    petal.rotation += petal.spin * dt;
    petal.life -= .00115 * dt;
    if (petal.life <= 0 || petal.y >= H() + petal.size * 2 || petal.x <= -30 || petal.x >= W() + 30)
      return;
    survivingPetals.push(petal);
    ctx.save();
    ctx.globalAlpha = petal.life;
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    const size = petal.size;
    ctx.drawImage(sakuraPetalSprites[petal.shade ? 1 : 0], -size, -size * .62, size * 2, size * 1.24);
    ctx.restore();
  });
  sakuraFalling = survivingPetals;
  ctx.restore();
}

function createSakuraPetalSprite(color) {
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 48;
  const spriteCtx = sprite.getContext("2d");
  const fill = spriteCtx.createLinearGradient(7, 5, 57, 43);
  fill.addColorStop(0, "rgba(255,248,246,.58)");
  fill.addColorStop(.45, `${color}f2`);
  fill.addColorStop(1, "rgba(196,91,128,.78)");
  spriteCtx.fillStyle = fill;
  spriteCtx.beginPath();
  spriteCtx.ellipse(32, 24, 28, 17, 0, 0, Math.PI * 2);
  spriteCtx.fill();
  return sprite;
}

function drawSakuraSky(skyCtx = ctx) {
  const sky = skyCtx.createLinearGradient(0, 0, 0, H());
  sky.addColorStop(0, "#f4dce8");
  sky.addColorStop(.46, "#e7c9d6");
  sky.addColorStop(.76, "#bdacbd");
  sky.addColorStop(1, "#817f91");
  skyCtx.fillStyle = sky;
  skyCtx.fillRect(0, 0, W(), H());

  const sun = skyCtx.createRadialGradient(W() * .72, H() * .22, 1, W() * .72, H() * .22, Math.max(W(), H()) * .5);
  sun.addColorStop(0, "rgba(255,246,226,.64)");
  sun.addColorStop(.28, "rgba(255,227,215,.2)");
  sun.addColorStop(1, "rgba(255,227,215,0)");
  skyCtx.fillStyle = sun;
  skyCtx.fillRect(0, 0, W(), H());

}

function drawSakuraDistantLandscape(landscapeCtx = ctx) {
  drawSakuraDistantPeak(W() * .3, H() * 1.12, W() * .42, H() * .48, "#a49cac", .48, landscapeCtx);
  drawSakuraDistantPeak(W() * .72, H() * 1.1, W() * .38, H() * .44, "#aaa1ad", .42, landscapeCtx);
  drawSakuraDistantPeak(W() * .07, H() * 1.04, W() * .2, H() * .79, "#938c9d", 1, landscapeCtx);
  drawSakuraDistantPeak(W() * .94, H() * 1.06, W() * .19, H() * .84, "#777d8d", 1, landscapeCtx);
  const templePeakX = W() * .79;
  const templePeakBaseY = H() * 1.16;
  const templePeakWidth = W() * .16;
  const templePeakHeight = H() * .72;
  const templeSummitX = templePeakX + templePeakWidth * .025;
  const templeSummitY = templePeakBaseY - templePeakHeight;
  const templeSize = Math.min(W(), H()) * .042;
  const templePlatformY = templeSummitY + templePeakHeight * .045;
  drawSakuraDistantPeak(templePeakX, templePeakBaseY, templePeakWidth, templePeakHeight, "#8a8799", 1, landscapeCtx);
  drawSakuraMountainSteps(
    templeSummitX,
    templePlatformY,
    templeSize * 1.15,
    landscapeCtx
  );
  drawSakuraDistantTemple(
    templeSummitX,
    templePlatformY + templeSize * .04,
    templeSize,
    landscapeCtx
  );
}

function drawSakuraDistantPeak(x, baseY, width, height, color, alpha, skyCtx = ctx) {
  skyCtx.save();
  skyCtx.globalAlpha = alpha;
  const summitX = x + width * .025;
  const summitY = baseY - height;
  const peakPath = () => {
    skyCtx.beginPath();
    skyCtx.moveTo(x - width * .48, H());
    skyCtx.bezierCurveTo(
      x - width * .37, baseY - height * .16,
      summitX - width * .29, summitY + height * .42,
      summitX - width * .15, summitY + height * .21
    );
    skyCtx.lineTo(summitX - width * .1, summitY + height * .105);
    skyCtx.quadraticCurveTo(
      summitX - width * .055, summitY + height * .025,
      summitX + width * .005, summitY + height * .025
    );
    skyCtx.quadraticCurveTo(
      summitX + width * .075, summitY + height * .025,
      summitX + width * .12, summitY + height * .11
    );
    skyCtx.lineTo(summitX + width * .14, summitY + height * .14);
    skyCtx.bezierCurveTo(
      summitX + width * .24, summitY + height * .31,
      x + width * .34, baseY - height * .24,
      x + width * .48, H()
    );
    skyCtx.closePath();
  };
  const stone = skyCtx.createLinearGradient(x - width * .48, summitY, x + width * .48, H());
  stone.addColorStop(0, "rgb(235,221,222)");
  stone.addColorStop(.35, color);
  stone.addColorStop(1, "rgb(52,57,72)");
  peakPath();
  skyCtx.fillStyle = stone;
  skyCtx.fill();

  skyCtx.save();
  peakPath();
  skyCtx.clip();
  const lightFace = skyCtx.createLinearGradient(
    summitX - width * .08,
    summitY,
    x + width * .12,
    H()
  );
  lightFace.addColorStop(0, "rgba(255,238,222,.32)");
  lightFace.addColorStop(.42, "rgba(228,216,216,.12)");
  lightFace.addColorStop(1, "rgba(29,36,48,.2)");
  skyCtx.fillStyle = lightFace;
  skyCtx.fillRect(x - width, summitY, width * 2, H() - summitY);

  const shade = skyCtx.createLinearGradient(summitX, summitY, x + width * .42, H());
  shade.addColorStop(0, "rgba(28,34,47,.02)");
  shade.addColorStop(.48, "rgba(24,31,44,.18)");
  shade.addColorStop(1, "rgba(19,27,39,.46)");
  skyCtx.fillStyle = shade;
  skyCtx.fillRect(x - width, summitY, width * 2, H() - summitY);

  skyCtx.beginPath();
  skyCtx.moveTo(summitX - width * .15, summitY + height * .22);
  skyCtx.quadraticCurveTo(summitX - width * .095, summitY + height * .12, summitX - width * .1, summitY + height * .105);
  skyCtx.quadraticCurveTo(summitX - width * .055, summitY + height * .035, summitX + width * .005, summitY + height * .035);
  skyCtx.quadraticCurveTo(summitX + width * .075, summitY + height * .035, summitX + width * .12, summitY + height * .11);
  skyCtx.lineTo(summitX + width * .2, summitY + height * .23);
  skyCtx.lineTo(summitX + width * .115, summitY + height * .19);
  skyCtx.lineTo(summitX + width * .04, summitY + height * .235);
  skyCtx.closePath();
  skyCtx.fillStyle = "rgba(255,240,234,.38)";
  skyCtx.fill();

  for (let ridge = 0; ridge < 7; ridge++) {
    const progress = .14 + ridge * .085;
    const y = summitY + height * progress;
    const halfWidth = width * (.08 + progress * .22);
    const drift = Math.sin((ridge + 1) * 1.9) * width * .025;
    skyCtx.beginPath();
    skyCtx.moveTo(summitX - halfWidth + drift, y);
    skyCtx.bezierCurveTo(
      summitX - halfWidth * .38 + drift, y + height * .018,
      summitX + halfWidth * .16 + drift, y - height * .012,
      summitX + halfWidth, y + height * .025
    );
    skyCtx.strokeStyle = ridge % 3 ? "rgba(30,37,51,.14)" : "rgba(255,238,229,.2)";
    skyCtx.lineWidth = Math.max(1, Math.min(width, height) * (ridge % 3 ? .006 : .009));
    skyCtx.stroke();
  }
  skyCtx.restore();
  skyCtx.restore();
}

function drawSakuraMountainSteps(x, startY, width, skyCtx = ctx) {
  const stepHeight = Math.max(5, width * .13);
  const halfWidth = width * .5;
  skyCtx.save();
  skyCtx.beginPath();
  skyCtx.moveTo(x - halfWidth, startY);
  skyCtx.lineTo(x + halfWidth, startY);
  skyCtx.lineTo(x + halfWidth, H());
  skyCtx.lineTo(x - halfWidth, H());
  skyCtx.closePath();
  skyCtx.fillStyle = "rgba(46,43,53,.12)";
  skyCtx.fill();

  for (let y = startY + stepHeight; y < H(); y += stepHeight) {
    skyCtx.beginPath();
    skyCtx.moveTo(x - halfWidth, y);
    skyCtx.lineTo(x + halfWidth, y);
    skyCtx.strokeStyle = "rgba(62,55,67,.3)";
    skyCtx.lineWidth = Math.max(.8, width * .05);
    skyCtx.stroke();
    skyCtx.beginPath();
    skyCtx.moveTo(x - halfWidth * .82, y - stepHeight * .16);
    skyCtx.lineTo(x + halfWidth * .82, y - stepHeight * .16);
    skyCtx.strokeStyle = "rgba(255,238,222,.16)";
    skyCtx.lineWidth = Math.max(.6, width * .025);
    skyCtx.stroke();
  }
  skyCtx.restore();
}

function drawSakuraDistantTemple(x, baseY, size, skyCtx = ctx) {
  skyCtx.save();
  skyCtx.translate(x, baseY);
  skyCtx.globalAlpha = .78;
  skyCtx.fillStyle = "rgba(38,34,45,.52)";
  skyCtx.beginPath();
  skyCtx.ellipse(0, -size * .015, size * .58, size * .12, 0, 0, Math.PI * 2);
  skyCtx.fill();
  skyCtx.fillStyle = "#4d414b";
  skyCtx.fillRect(-size * .44, -size * .16, size * .88, size * .12);
  skyCtx.fillStyle = "#e4c8bb";
  skyCtx.fillRect(-size * .34, -size * .62, size * .68, size * .48);
  skyCtx.fillStyle = "#65505a";
  skyCtx.fillRect(-size * .27, -size * .59, size * .055, size * .43);
  skyCtx.fillRect(size * .215, -size * .59, size * .055, size * .43);
  skyCtx.fillStyle = "rgba(81,63,72,.72)";
  skyCtx.fillRect(-size * .08, -size * .43, size * .16, size * .2);
  skyCtx.fillStyle = "#514958";
  for (let level = 0; level < 2; level++) {
    const roofY = -size * (.76 - level * .33);
    const halfWidth = size * (.76 - level * .12);
    skyCtx.beginPath();
    skyCtx.moveTo(-halfWidth, roofY + size * .11);
    skyCtx.lineTo(-halfWidth * .72, roofY);
    skyCtx.lineTo(0, roofY - size * .12);
    skyCtx.lineTo(halfWidth * .72, roofY);
    skyCtx.lineTo(halfWidth, roofY + size * .11);
    skyCtx.lineTo(0, roofY + size * .04);
    skyCtx.closePath();
    skyCtx.fill();
  }
  skyCtx.fillStyle = "#695a62";
  skyCtx.fillRect(-size * .06, -size * .36, size * .12, size * .32);
  skyCtx.restore();
}

function drawSakuraMountain(mountainCtx) {
  const center = W() * .5;
  const topY = H() * .236;
  const baseY = H() * 1.16;
  const mountainHeight = baseY - topY;
  const mountainPath = () => {
    mountainCtx.beginPath();
    mountainCtx.moveTo(W() * .34, baseY);
    mountainCtx.bezierCurveTo(W() * .365, H() * .86, W() * .395, H() * .58, W() * .445, H() * .33);
    mountainCtx.bezierCurveTo(W() * .48, H() * .205, W() * .52, H() * .205, W() * .555, H() * .33);
    mountainCtx.bezierCurveTo(W() * .605, H() * .58, W() * .635, H() * .86, W() * .66, baseY);
    mountainCtx.closePath();
  };

  const stone = mountainCtx.createLinearGradient(W() * .28, H() * .35, W() * .74, H() * .95);
  stone.addColorStop(0, "#827d83");
  stone.addColorStop(.2, "#68666f");
  stone.addColorStop(.48, "#555865");
  stone.addColorStop(.76, "#414754");
  stone.addColorStop(1, "#303742");
  mountainPath();
  mountainCtx.fillStyle = stone;
  mountainCtx.fill();

  mountainCtx.save();
  mountainPath();
  mountainCtx.clip();

  const lightFace = mountainCtx.createLinearGradient(W() * .33, H() * .28, W() * .61, H() * .9);
  lightFace.addColorStop(0, "rgba(255,238,222,.52)");
  lightFace.addColorStop(.32, "rgba(228,216,216,.2)");
  lightFace.addColorStop(.72, "rgba(122,125,139,.05)");
  lightFace.addColorStop(1, "rgba(29,36,48,.32)");
  mountainCtx.fillStyle = lightFace;
  mountainCtx.fillRect(W() * .29, H() * .22, W() * .43, baseY - H() * .22);

  const shadowFace = mountainCtx.createLinearGradient(W() * .49, H() * .25, W() * .68, H() * .77);
  shadowFace.addColorStop(0, "rgba(28,34,47,.02)");
  shadowFace.addColorStop(.42, "rgba(24,31,44,.16)");
  shadowFace.addColorStop(1, "rgba(19,27,39,.48)");
  mountainCtx.fillStyle = shadowFace;
  mountainCtx.beginPath();
  mountainCtx.moveTo(center + W() * .012, topY + H() * .012);
  mountainCtx.bezierCurveTo(center + W() * .055, H() * .34, center + W() * .08, H() * .52, center + W() * .106, H() * .72);
  mountainCtx.bezierCurveTo(center + W() * .13, H() * .86, center + W() * .145, H() * 1.02, center + W() * .16, baseY);
  mountainCtx.lineTo(W() * .72, baseY);
  mountainCtx.lineTo(W() * .72, H() * .22);
  mountainCtx.closePath();
  mountainCtx.fill();

  for (let ridge = 0; ridge < 15; ridge++) {
    const u = (ridge + 1) / 17;
    const y = topY + mountainHeight * u;
    const halfWidth = W() * (.046 + .112 * Math.pow(u, .85));
    const curve = Math.sin(ridge * 1.71) * W() * .009;
    mountainCtx.beginPath();
    mountainCtx.moveTo(center - halfWidth + curve, y);
    mountainCtx.bezierCurveTo(center - halfWidth * .58, y - H() * .012, center - halfWidth * .24, y + H() * .027, center + halfWidth * .08, y + H() * .018);
    mountainCtx.bezierCurveTo(center + halfWidth * .46, y + H() * .007, center + halfWidth * .7, y + H() * .036, center + halfWidth - curve, y + H() * .019);
    mountainCtx.strokeStyle = ridge % 4 === 0 ? "rgba(250,231,222,.14)" : "rgba(22,30,42,.12)";
    mountainCtx.lineWidth = Math.max(1, Math.min(W(), H()) * (ridge % 4 === 0 ? .0024 : .0014));
    mountainCtx.stroke();
  }

  for (let seam = 0; seam < 11; seam++) {
    const u = .2 + seam * .07;
    const side = seam % 2 ? -1 : 1;
    const x = center + side * W() * (.025 + u * .11) + Math.sin(seam * 2.4) * W() * .012;
    const y = topY + mountainHeight * u;
    mountainCtx.beginPath();
    mountainCtx.moveTo(x, y);
    mountainCtx.bezierCurveTo(x - side * W() * .018, y + mountainHeight * .07, x + side * W() * .016, y + mountainHeight * .15, x - side * W() * .008, y + mountainHeight * .23);
    mountainCtx.strokeStyle = seam % 2 ? "rgba(239,219,211,.09)" : "rgba(25,31,41,.15)";
    mountainCtx.lineWidth = Math.max(1, Math.min(W(), H()) * .0017);
    mountainCtx.stroke();
  }
  mountainCtx.restore();
}

function refreshSakuraTreeCache(primary, secondary) {
  const trunk = sakuraTreeLimbs.find(limb => limb.parentId === null);
  const margin = Math.max(Math.min(W(), H()) * .018, trunk ? trunk.width * 2.2 : 0);
  const left = sakuraTreeBounds.minX - margin;
  const top = sakuraTreeBounds.minY - margin;
  const right = sakuraTreeBounds.maxX + margin;
  const bottom = sakuraTreeBounds.maxY + margin;
  sakuraTreeCache = document.createElement("canvas");
  sakuraTreeCacheScale = dpr * Math.max(1, sakuraFitZoom() * sakuraCameraZoomMax);
  sakuraTreeCache.width = Math.ceil((right - left) * sakuraTreeCacheScale);
  sakuraTreeCache.height = Math.ceil((bottom - top) * sakuraTreeCacheScale);
  const treeContext = sakuraTreeCache.getContext("2d");
  treeContext.imageSmoothingEnabled=true;
  treeContext.imageSmoothingQuality="high";
  treeContext.setTransform(sakuraTreeCacheScale, 0, 0, sakuraTreeCacheScale, -left * sakuraTreeCacheScale, -top * sakuraTreeCacheScale);
  drawSakuraTree(primary, secondary, treeContext);
  sakuraTreeCache.left = left;
  sakuraTreeCache.top = top;
  sakuraTreeCache.worldWidth = right - left;
  sakuraTreeCache.worldHeight = bottom - top;
  refreshSakuraBloomCache(primary, secondary);
  sakuraTreeCacheDirty = false;
}

function refreshSakuraBloomCache(primary, secondary) {
  const left = sakuraTreeCache ? sakuraTreeCache.left : Math.min(0, sakuraTreeBounds.minX);
  const top = sakuraTreeCache ? sakuraTreeCache.top : Math.min(0, sakuraTreeBounds.minY);
  const right = sakuraTreeCache ? left + sakuraTreeCache.worldWidth : Math.max(W(), sakuraTreeBounds.maxX);
  const bottom = sakuraTreeCache ? top + sakuraTreeCache.worldHeight : Math.max(H(), sakuraTreeBounds.maxY);
  sakuraBloomCache = document.createElement("canvas");
  sakuraBloomCache.width = Math.ceil((right - left) * sakuraTreeCacheScale);
  sakuraBloomCache.height = Math.ceil((bottom - top) * sakuraTreeCacheScale);
  const bloomContext = sakuraBloomCache.getContext("2d");
  bloomContext.imageSmoothingEnabled=true;
  bloomContext.imageSmoothingQuality="high";
  bloomContext.setTransform(sakuraTreeCacheScale, 0, 0, sakuraTreeCacheScale, -left * sakuraTreeCacheScale, -top * sakuraTreeCacheScale);
  drawSakuraBlooms(0, primary, secondary, bloomContext);
  sakuraBloomCache.left = left;
  sakuraBloomCache.top = top;
  sakuraBloomCache.worldWidth = right - left;
  sakuraBloomCache.worldHeight = bottom - top;
  sakuraBloomCacheDirty = false;
}

function drawSakuraTree(primary, secondary, treeCtx = ctx) {
  const trunk = sakuraTreeLimbs.find(limb => limb.parentId === null);
  if (trunk)
    drawSakuraRootFlare(trunk, treeCtx);
  sakuraTreeLimbs.forEach(limb => {
    drawSakuraWoodLimb(limb, treeCtx);
    drawSakuraBranchKnot(limb, limb.id, treeCtx);
  });

  sakuraBlooms.forEach(bloom => {
    if (!bloom.attached)
      return;
    const color = bloom.shade ? secondary : primary;
    drawSakuraBloom(bloom.x, bloom.y, bloom.radius, color, .97, treeCtx);
  });
}

function drawSakuraRootFlare(trunk, treeCtx = ctx) {
  const { x, y, width } = trunk;
  const rootWood = treeCtx.createLinearGradient(x - width * 2, y, x + width * 2, y + width);
  rootWood.addColorStop(0, "#3b2a30");
  rootWood.addColorStop(.5, "#815941");
  rootWood.addColorStop(1, "#382930");
  treeCtx.save();
  treeCtx.fillStyle = rootWood;
  treeCtx.strokeStyle = "rgba(35,27,31,.72)";
  treeCtx.lineWidth = Math.max(.5, width * .07);
  for (const side of [-1, 1]) {
    treeCtx.beginPath();
    treeCtx.moveTo(x + side * width * .12, y - width * .08);
    treeCtx.quadraticCurveTo(x + side * width * .62, y + width * .18, x + side * width * 1.9, y + width * .62);
    treeCtx.quadraticCurveTo(x + side * width * 1.15, y + width * .5, x + side * width * .48, y + width * .36);
    treeCtx.quadraticCurveTo(x + side * width * .2, y + width * .18, x + side * width * .12, y - width * .08);
    treeCtx.closePath();
    treeCtx.fill();
    treeCtx.stroke();

    treeCtx.beginPath();
    treeCtx.moveTo(x + side * width * .28, y + width * .1);
    treeCtx.quadraticCurveTo(x + side * width * .78, y + width * .32, x + side * width * 1.68, y + width * .56);
    treeCtx.strokeStyle = "rgba(40,27,29,.42)";
    treeCtx.lineWidth = Math.max(.45, width * .055);
    treeCtx.lineCap = "round";
    treeCtx.stroke();
    treeCtx.beginPath();
    treeCtx.moveTo(x + side * width * .34, y + width * .12);
    treeCtx.quadraticCurveTo(x + side * width * .88, y + width * .32, x + side * width * 1.48, y + width * .48);
    treeCtx.strokeStyle = "rgba(222,170,126,.32)";
    treeCtx.lineWidth = Math.max(.35, width * .035);
    treeCtx.stroke();
  }
  treeCtx.restore();
}

function drawSakuraBlooms(time, primary, secondary, treeCtx = ctx) {
  sakuraBlooms.forEach(bloom => {
    if (!bloom.attached)
      return;
    const color = bloom.shade ? secondary : primary;
    const pulse = .9 + .1 * Math.sin(time * .0012 + bloom.phase);
    drawSakuraBloom(bloom.x, bloom.y, bloom.radius * pulse, color, .97, treeCtx);
  });
}

function isSakuraBranchWithin(rootId, limb) {
  let branch = limb;
  while (branch) {
    if (branch.id === rootId)
      return true;
    branch = branch.parentId === null ? null : sakuraTreeLimbs[branch.parentId];
  }
  return false;
}

function drawSakuraBranchKnot(limb, index, treeCtx = ctx) {
  if (limb.depth < 3 || limb.parentId === null)
    return;
  const angle = Math.atan2(limb.endY - limb.y, limb.endX - limb.x);
  treeCtx.save();
  treeCtx.translate(limb.x, limb.y);
  treeCtx.rotate(angle);
  const collar = treeCtx.createLinearGradient(0, -limb.width * .42, 0, limb.width * .42);
  collar.addColorStop(0, "rgba(41,29,31,.86)");
  collar.addColorStop(.34, "rgba(146,100,70,.94)");
  collar.addColorStop(.68, "rgba(101,67,54,.96)");
  collar.addColorStop(1, "rgba(39,30,34,.9)");
  treeCtx.beginPath();
  treeCtx.ellipse(-limb.width * .06, 0, limb.width * .48, limb.width * .39, 0, 0, Math.PI * 2);
  treeCtx.fillStyle = collar;
  treeCtx.fill();
  treeCtx.beginPath();
  treeCtx.ellipse(-limb.width * .08, -limb.width * .025, limb.width * .34, limb.width * .25, 0, Math.PI * .12, Math.PI * .9);
  treeCtx.strokeStyle = "rgba(232,185,142,.4)";
  treeCtx.lineWidth = Math.max(.35, limb.width * .07);
  treeCtx.stroke();
  if (index % 5 === 0) {
    treeCtx.beginPath();
    treeCtx.ellipse(limb.width * .13, -limb.width * .04, limb.width * .075, limb.width * .16, -.2, 0, Math.PI * 2);
    treeCtx.fillStyle = "rgba(42,28,29,.48)";
    treeCtx.fill();
    treeCtx.beginPath();
    treeCtx.ellipse(limb.width * .11, -limb.width * .06, limb.width * .025, limb.width * .075, -.2, 0, Math.PI * 2);
    treeCtx.fillStyle = "rgba(224,174,132,.5)";
    treeCtx.fill();
  }
  treeCtx.restore();
}

function drawSakuraWoodLimb(limb, treeCtx = ctx) {
  const samples = 28;
  const left = [];
  const right = [];
  for (let index = 0; index <= samples; index++) {
    const t = index / samples;
    const inverse = 1 - t;
    const x = inverse * inverse * limb.x + 2 * inverse * t * limb.controlX + t * t * limb.endX;
    const y = inverse * inverse * limb.y + 2 * inverse * t * limb.controlY + t * t * limb.endY;
    const tangentX = 2 * inverse * (limb.controlX - limb.x) + 2 * t * (limb.endX - limb.controlX);
    const tangentY = 2 * inverse * (limb.controlY - limb.y) + 2 * t * (limb.endY - limb.controlY);
    const tangentLength = Math.hypot(tangentX, tangentY) || 1;
    const normalX = -tangentY / tangentLength;
    const normalY = tangentX / tangentLength;
    const taper = Math.pow(1 - t, .82);
    const radius = Math.max(.16, limb.width * (.5 * taper + .025));
    left.push([x + normalX * radius, y + normalY * radius]);
    right.push([x - normalX * radius, y - normalY * radius]);
  }

  treeCtx.beginPath();
  left.forEach((point, index) => index ? treeCtx.lineTo(point[0], point[1]) : treeCtx.moveTo(point[0], point[1]));
  for (let index = right.length - 1; index >= 0; index--)
    treeCtx.lineTo(right[index][0], right[index][1]);
  treeCtx.closePath();

  const baseTangentX = limb.controlX - limb.x;
  const baseTangentY = limb.controlY - limb.y;
  const baseTangentLength = Math.hypot(baseTangentX, baseTangentY) || 1;
  const baseNormalX = -baseTangentY / baseTangentLength;
  const baseNormalY = baseTangentX / baseTangentLength;
  const bark = treeCtx.createLinearGradient(
    limb.x - baseNormalX * limb.width * .56,
    limb.y - baseNormalY * limb.width * .56,
    limb.x + baseNormalX * limb.width * .56,
    limb.y + baseNormalY * limb.width * .56
  );
  bark.addColorStop(0, "#33252a");
  bark.addColorStop(.2, "#62443d");
  bark.addColorStop(.48, "#a07152");
  bark.addColorStop(.68, "#704a3e");
  bark.addColorStop(.84, "#8c6049");
  bark.addColorStop(1, "#30272f");
  treeCtx.fillStyle = bark;
  treeCtx.strokeStyle = "rgba(35,27,31,.76)";
  treeCtx.lineWidth = Math.max(.6, limb.width * .08);
  treeCtx.lineJoin = "round";
  treeCtx.lineCap = "round";
  treeCtx.fill();
  treeCtx.stroke();

  treeCtx.save();
  treeCtx.clip();
  treeCtx.beginPath();
  treeCtx.moveTo(limb.x - limb.width * .12, limb.y);
  treeCtx.quadraticCurveTo(limb.controlX - limb.width * .09, limb.controlY, limb.endX, limb.endY);
  treeCtx.strokeStyle = "rgba(223,173,132,.32)";
  treeCtx.lineWidth = Math.max(.45, limb.width * .12);
  treeCtx.lineCap = "round";
  treeCtx.stroke();

  const grooveCount = limb.width > 5 ? 3 : limb.width > 1.8 ? 2 : 1;
  for (let groove = 0; groove < grooveCount; groove++) {
    const lane = grooveCount === 1 ? 0 : groove / (grooveCount - 1) - .5;
    treeCtx.beginPath();
    for (let sample = 0; sample <= 10; sample++) {
      const t = .1 + sample * .08;
      const inverse = 1 - t;
      const x = inverse * inverse * limb.x + 2 * inverse * t * limb.controlX + t * t * limb.endX;
      const y = inverse * inverse * limb.y + 2 * inverse * t * limb.controlY + t * t * limb.endY;
      const tangentX = 2 * inverse * (limb.controlX - limb.x) + 2 * t * (limb.endX - limb.controlX);
      const tangentY = 2 * inverse * (limb.controlY - limb.y) + 2 * t * (limb.endY - limb.controlY);
      const tangentLength = Math.hypot(tangentX, tangentY) || 1;
      const taper = 1 - t * .58;
      const grainX = x - tangentY / tangentLength * lane * limb.width * taper;
      const grainY = y + tangentX / tangentLength * lane * limb.width * taper;
      if (sample)
        treeCtx.lineTo(grainX, grainY);
      else
        treeCtx.moveTo(grainX, grainY);
    }
    treeCtx.strokeStyle = groove % 2 ? "rgba(229,174,133,.22)" : "rgba(37,24,29,.34)";
    treeCtx.lineWidth = Math.max(.35, limb.width * .035);
    treeCtx.stroke();
  }

  if (limb.depth > 2) {
    treeCtx.beginPath();
    treeCtx.moveTo(limb.x + limb.width * .2, limb.y + limb.width * .15);
    treeCtx.quadraticCurveTo(limb.controlX + limb.width * .18, limb.controlY + limb.width * .12, limb.endX, limb.endY);
    treeCtx.strokeStyle = "rgba(30,25,30,.42)";
    treeCtx.lineWidth = Math.max(.45, limb.width * .08);
    treeCtx.stroke();
  }
  treeCtx.restore();
}

function drawSakuraBloom(x, y, radius, color, alpha, treeCtx = ctx) {
  treeCtx.save();
  treeCtx.translate(x, y);
  treeCtx.globalAlpha = alpha;
  for (let petal = 0; petal < 5; petal++) {
    treeCtx.rotate(Math.PI * 2 / 5);
    const gradient = treeCtx.createLinearGradient(-radius * .35, -radius, radius * .3, radius * .2);
    gradient.addColorStop(0, "rgba(255,249,246,.98)");
    gradient.addColorStop(.34, "rgba(" + color.join(",") + ",.98)");
    gradient.addColorStop(1, "rgba(211,107,145,.94)");
    treeCtx.beginPath();
    treeCtx.moveTo(0, 0);
    treeCtx.quadraticCurveTo(-radius * .56, -radius * .42, -radius * .16, -radius * .92);
    treeCtx.quadraticCurveTo(0, -radius * 1.2, radius * .16, -radius * .92);
    treeCtx.quadraticCurveTo(radius * .56, -radius * .42, 0, 0);
    treeCtx.fillStyle = gradient;
    treeCtx.fill();
    treeCtx.strokeStyle = "rgba(255,247,242,.42)";
    treeCtx.lineWidth = Math.max(.45, radius * .055);
    treeCtx.stroke();
  }
  treeCtx.beginPath();
  treeCtx.arc(0, 0, radius * .16, 0, Math.PI * 2);
  treeCtx.fillStyle = "rgba(255,222,159,.98)";
  treeCtx.fill();
  treeCtx.strokeStyle = "rgba(153,100,78,.65)";
  treeCtx.lineWidth = Math.max(.45, radius * .045);
  for (let stamen = 0; stamen < 5; stamen++) {
    const angle = stamen * Math.PI * .4;
    treeCtx.beginPath();
    treeCtx.moveTo(0, 0);
    treeCtx.lineTo(Math.cos(angle) * radius * .31, Math.sin(angle) * radius * .31);
    treeCtx.stroke();
  }
  treeCtx.restore();
}

function drawSakuraCloudLayer(layer, dt) {
  const layerAlpha = [0.78, 0.9, 0.98][layer];
  ctx.save();
  sakuraClouds.filter(cloud => cloud.layer === layer && cloud.opacity > 0).forEach(cloud => {
    const width = W() * .1 * cloud.scale;
    const cloudImage = cloud.red ? sakuraRedCloudImage : sakuraCloudImage;
    const imageIndex = cloud.red ? 1 : 0;
    const sprite = sakuraCloudSprites.get(imageIndex * 9 + layer * 3 + cloud.variant);
    const hasCloudImage = cloudImage.complete && cloudImage.naturalWidth > 0;
    const height = hasCloudImage
      ? width * cloudImage.naturalHeight / cloudImage.naturalWidth
      : H() * .12 * cloud.scale;
    cloud.x += cloud.direction * cloud.speed * dt * .22;
    cloud.phase += dt * .022;
    if (cloud.dissolving) {
      cloud.dissolveProgress = Math.min(1, cloud.dissolveProgress + dt / 108);
      const progress = cloud.dissolveProgress;
      cloud.opacity = 1 - progress * progress * (3 - 2 * progress);
    }
    if (cloud.direction > 0 && cloud.x - width * 1.35 > W())
      cloud.x = -width * 1.35;
    else if (cloud.direction < 0 && cloud.x + width * 1.35 < 0)
      cloud.x = W() + width * 1.35;
    if (sprite) {
      const drawWidth = width * 2.5;
      const drawHeight = height * 2.5;
      ctx.globalAlpha = layerAlpha * cloud.opacity;
      const progress = cloud.dissolveProgress;
      ctx.filter = cloud.dissolving ? `blur(${progress * 30}px)` : "none";
      const y = sakuraCloudDisplayY(cloud) - drawHeight * progress * .08;
      const dissolveScale = 1 + progress * .48;
      ctx.drawImage(
        sprite,
        cloud.x - drawWidth * dissolveScale / 2,
        y - drawHeight * dissolveScale / 2,
        drawWidth * dissolveScale,
        drawHeight * dissolveScale
      );
    }
  });
  ctx.filter = "none";
  ctx.restore();
  sakuraClouds = sakuraClouds.filter(cloud => cloud.opacity > 0);
}

function createSakuraCloudSprite(variant, layer, cloudImage = sakuraCloudImage) {
  const width = W() * .1;
  const imageReady = cloudImage.complete && cloudImage.naturalWidth > 0;
  const height = imageReady
    ? width * cloudImage.naturalHeight / cloudImage.naturalWidth
    : H() * .12;
  const sprite = document.createElement("canvas");
  sprite.width = Math.ceil(width * 2.5 * dpr);
  sprite.height = Math.ceil(height * 2.5 * dpr);
  const spriteCtx = sprite.getContext("2d");
  spriteCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (variant === 1) {
    spriteCtx.translate(0, height * 2.5);
    spriteCtx.scale(1, -1);
  } else if (variant === 2) {
    spriteCtx.translate(width * 2.5, 0);
    spriteCtx.scale(-1, 1);
  }
  if (imageReady)
    spriteCtx.drawImage(cloudImage, 0, 0, width * 2.5, height * 2.5);
  else
    drawSakuraCloudMass(width * 1.25, height * 1.25, width, height, variant, spriteCtx);
  if (cloudImage === sakuraRedCloudImage) {
    spriteCtx.globalCompositeOperation = "source-in";
    spriteCtx.fillStyle = "#fff";
    spriteCtx.fillRect(0, 0, width * 2.5, height * 2.5);
    spriteCtx.globalCompositeOperation = "source-over";
  }
  const tintAlpha = [0.48, 0.24, 0][layer];
  if (tintAlpha) {
    spriteCtx.globalCompositeOperation = "source-atop";
    spriteCtx.fillStyle = `rgba(232, 139, 173, ${tintAlpha})`;
    spriteCtx.fillRect(0, 0, width * 2.5, height * 2.5);
  }
  return sprite;
}

function sakuraCloudDisplayY(cloud) {
  return cloud.y + Math.sin(cloud.phase) * cloud.oscillation;
}

function drawSakuraCloudMass(x, y, width, height, variant, cloudCtx = ctx) {
  cloudCtx.save();
  cloudCtx.globalAlpha = 1;
  cloudCtx.fillStyle = "#fff";
  const traceCloud = () => {
    cloudCtx.beginPath();
    cloudCtx.moveTo(x - width * .98, y + height * .1);
    cloudCtx.bezierCurveTo(x - width * 1.2, y + height * .02, x - width * 1.1, y - height * .28, x - width * .88, y - height * .24);
    cloudCtx.bezierCurveTo(x - width * .68, y - height * .2, x - width * .72, y + height * .02, x - width * .9, y + height * .04);
    cloudCtx.bezierCurveTo(x - width * .73, y - height * .1, x - width * .78, y - height * .43, x - width * .55, y - height * .44);
    cloudCtx.bezierCurveTo(x - width * .32, y - height * .45, x - width * .3, y - height * .15, x - width * .48, y - height * .13);
    cloudCtx.bezierCurveTo(x - width * .31, y - height * .2, x - width * .34, y - height * .56, x - width * .12, y - height * .64);
    cloudCtx.bezierCurveTo(x + width * .12, y - height * .72, x + width * .18, y - height * .4, x + width * .02, y - height * .31);
    cloudCtx.bezierCurveTo(x + width * .22, y - height * .44, x + width * .28, y - height * .71, x + width * .49, y - height * .62);
    cloudCtx.bezierCurveTo(x + width * .7, y - height * .52, x + width * .69, y - height * .26, x + width * .52, y - height * .21);
    cloudCtx.bezierCurveTo(x + width * .75, y - height * .37, x + width * .98, y - height * .37, x + width * 1.09, y - height * .17);
    cloudCtx.bezierCurveTo(x + width * 1.22, y + height * .04, x + width * 1.08, y + height * .24, x + width * .86, y + height * .18);
    cloudCtx.bezierCurveTo(x + width * .65, y + height * .13, x + width * .55, y + height * .32, x + width * .36, y + height * .3);
    cloudCtx.bezierCurveTo(x + width * .17, y + height * .28, x + width * .06, y + height * .2, x - width * .1, y + height * .27);
    cloudCtx.bezierCurveTo(x - width * .32, y + height * .38, x - width * .48, y + height * .22, x - width * .62, y + height * .24);
    cloudCtx.bezierCurveTo(x - width * .78, y + height * .26, x - width * .92, y + height * .22, x - width * .98, y + height * .1);
    cloudCtx.closePath();
  };
  traceCloud();
  cloudCtx.fill();

  cloudCtx.globalAlpha = 1;
  cloudCtx.strokeStyle = "rgba(255,190,211,.96)";
  cloudCtx.lineWidth = Math.max(1, height * .045);
  cloudCtx.lineJoin = "round";
  cloudCtx.lineCap = "round";
  traceCloud();
  cloudCtx.stroke();

  cloudCtx.lineWidth = Math.max(.9, height * .04);
  if (variant === 1) {
    cloudCtx.beginPath();
    cloudCtx.moveTo(x - width * .87, y + height * .02);
    cloudCtx.bezierCurveTo(x - width * .68, y - height * .02, x - width * .66, y - height * .27, x - width * .81, y - height * .29);
    cloudCtx.bezierCurveTo(x - width * .96, y - height * .31, x - width * .98, y - height * .1, x - width * .85, y - height * .08);
    cloudCtx.bezierCurveTo(x - width * .76, y - height * .06, x - width * .77, y - height * .19, x - width * .85, y - height * .2);
    cloudCtx.stroke();
  }

  cloudCtx.save();
  cloudCtx.translate(x * .3, y * .3);
  cloudCtx.scale(.7, .7);
  cloudCtx.beginPath();
  cloudCtx.moveTo(x - width * .27, y - height * .23);
  cloudCtx.bezierCurveTo(x - width * .1, y - height * .05, x + width * .11, y - height * .09, x + width * .12, y - height * .29);
  cloudCtx.bezierCurveTo(x + width * .14, y - height * .49, x - width * .11, y - height * .56, x - width * .21, y - height * .42);
  cloudCtx.bezierCurveTo(x - width * .29, y - height * .3, x - width * .16, y - height * .2, x - width * .08, y - height * .29);
  cloudCtx.bezierCurveTo(x - width * .02, y - height * .36, x - width * .11, y - height * .43, x - width * .16, y - height * .38);
  cloudCtx.stroke();
  cloudCtx.restore();

  if (variant === 2) {
    cloudCtx.beginPath();
    cloudCtx.moveTo(x + width * .55, y - height * .08);
    cloudCtx.bezierCurveTo(x + width * .76, y - height * .14, x + width * .78, y - height * .37, x + width * .6, y - height * .4);
    cloudCtx.bezierCurveTo(x + width * .42, y - height * .43, x + width * .39, y - height * .19, x + width * .55, y - height * .15);
    cloudCtx.bezierCurveTo(x + width * .67, y - height * .12, x + width * .68, y - height * .29, x + width * .57, y - height * .3);
    cloudCtx.stroke();
  }

  if (variant === 2) {
    cloudCtx.beginPath();
    cloudCtx.moveTo(x - width * .07, y + height * .27);
    cloudCtx.bezierCurveTo(x + width * .12, y + height * .15, x + width * .2, y + height * .36, x + width * .37, y + height * .27);
    cloudCtx.stroke();
  }
  cloudCtx.restore();
}

function sakuraWorldPoint(x, y, view = sakuraViewTransform()) {
  return {
    x: (x - view.offsetX) / view.scale,
    y: (y - view.offsetY) / view.scale
  };
}

function findSakuraLimbAt(x, y, view = sakuraViewTransform()) {
  const world = sakuraWorldPoint(x, y, view);
  const tolerance = Math.max(5, Math.min(W(), H()) * .009) / view.scale;
  let bestLimb = null;
  let bestScore = Infinity;
  const nearby = sakuraTreeHitCandidates(sakuraTreeHitGrid.limbs, world.x, world.y, tolerance);
  nearby.forEach(segment => {
    const distance = distanceToSakuraSegment(world.x, world.y, segment.x1, segment.y1, segment.x2, segment.y2);
    const score = distance / (tolerance + segment.limb.width * .55);
    if (score < bestScore || score === bestScore && bestLimb && segment.limb.width < bestLimb.width) {
      bestScore = score;
      bestLimb = segment.limb;
    }
  });

  if (bestLimb && bestScore <= 1)
    return bestLimb;

  let bestBloom = null;
  let bloomDistance = Infinity;
  const nearbyBlooms = sakuraTreeHitCandidates(sakuraTreeHitGrid.blooms, world.x, world.y, tolerance);
  nearbyBlooms.forEach(bloom => {
    if (!bloom.attached)
      return;
    const distance = Math.hypot(world.x - bloom.x, world.y - bloom.y);
    if (distance < bloomDistance) {
      bloomDistance = distance;
      bestBloom = bloom;
    }
  });
  if (bestBloom && bloomDistance <= tolerance + bestBloom.radius)
    return sakuraTreeLimbs[bestBloom.limbId] || null;
  return null;
}

function buildSakuraTreeHitGrid(base) {
  const cellSize = Math.max(12, base * .045);
  const limbs = new Map();
  const blooms = new Map();
  const addToGrid = (grid, item, minX, minY, maxX, maxY) => {
    const firstCellX = Math.floor(minX / cellSize);
    const lastCellX = Math.floor(maxX / cellSize);
    const firstCellY = Math.floor(minY / cellSize);
    const lastCellY = Math.floor(maxY / cellSize);
    for (let cellY = firstCellY; cellY <= lastCellY; cellY++) {
      for (let cellX = firstCellX; cellX <= lastCellX; cellX++) {
        const key = `${cellX},${cellY}`;
        if (!grid.has(key))
          grid.set(key, []);
        grid.get(key).push(item);
      }
    }
  };

  sakuraTreeLimbs.forEach(limb => {
    let previousX = limb.x;
    let previousY = limb.y;
    for (let sample = 1; sample <= 14; sample++) {
      const t = sample / 14;
      const inverse = 1 - t;
      const currentX = inverse * inverse * limb.x + 2 * inverse * t * limb.controlX + t * t * limb.endX;
      const currentY = inverse * inverse * limb.y + 2 * inverse * t * limb.controlY + t * t * limb.endY;
      const segment = { limb, x1: previousX, y1: previousY, x2: currentX, y2: currentY };
      const padding = limb.width * .55;
      addToGrid(
        limbs,
        segment,
        Math.min(previousX, currentX) - padding,
        Math.min(previousY, currentY) - padding,
        Math.max(previousX, currentX) + padding,
        Math.max(previousY, currentY) + padding
      );
      previousX = currentX;
      previousY = currentY;
    }
  });

  sakuraBlooms.forEach(bloom => {
    const padding = bloom.radius;
    addToGrid(blooms, bloom, bloom.x - padding, bloom.y - padding, bloom.x + padding, bloom.y + padding);
  });
  sakuraTreeHitGrid = { cellSize, limbs, blooms };
}

function sakuraTreeHitCandidates(grid, x, y, radius) {
  const { cellSize } = sakuraTreeHitGrid;
  const minX = Math.floor((x - radius) / cellSize);
  const maxX = Math.floor((x + radius) / cellSize);
  const minY = Math.floor((y - radius) / cellSize);
  const maxY = Math.floor((y + radius) / cellSize);
  const candidates = new Set();
  for (let cellY = minY; cellY <= maxY; cellY++) {
    for (let cellX = minX; cellX <= maxX; cellX++) {
      const items = grid.get(`${cellX},${cellY}`);
      if (items)
        items.forEach(item => candidates.add(item));
    }
  }
  return candidates;
}

function distanceToSakuraSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? clamp(((px - ax) * dx + (py - ay) * dy) / lengthSquared, 0, 1) : 0;
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function isSakuraTreeHit(x, y, view = sakuraViewTransform()) {
  return Boolean(findSakuraLimbAt(x, y, view));
}

function isSakuraCloudHit(x, y, view = sakuraViewTransform(), treeHit = null) {
  const world = sakuraWorldPoint(x, y, view);
  for (let index = sakuraClouds.length - 1; index >= 0; index--) {
    const cloud = sakuraClouds[index];
    if (cloud.dissolving || cloud.opacity <= 0)
      continue;
    const cloudImage = cloud.red ? sakuraRedCloudImage : sakuraCloudImage;
    const imageReady = cloudImage.complete && cloudImage.naturalWidth > 0;
    const width = W() * .1 * cloud.scale * 1.25;
    const height = imageReady
      ? width * cloudImage.naturalHeight / cloudImage.naturalWidth
      : H() * .12 * cloud.scale * 1.25;
    const hitHeight = height * (cloud.red ? .38 : 1);
    if (Math.abs(world.x - cloud.x) <= width && Math.abs(world.y - sakuraCloudDisplayY(cloud)) <= hitHeight) {
      if (cloud.layer < 2 && (isSakuraMountainOccludingPoint(world.x, world.y) || (treeHit ?? isSakuraTreeHit(x, y, view))))
        continue;
      return cloud;
    }
  }
  return null;
}

function isSakuraMountainOccludingPoint(x, y) {
  if (!sakuraMountainOcclusion)
    return false;
  const pixelX = Math.floor(x * dpr);
  const pixelY = Math.floor(y * dpr);
  if (pixelX < 0 || pixelX >= sakuraMountainOcclusion.width || pixelY < 0 || pixelY >= sakuraMountainOcclusion.height)
    return false;
  return sakuraMountainOcclusion.data[pixelY * sakuraMountainOcclusion.width + pixelX] > 0;
}

function dissolveSakuraCloudAt(x, y, view = sakuraViewTransform(), treeHit = null) {
  const cloud = isSakuraCloudHit(x, y, view, treeHit);
  if (!cloud)
    return false;
  cloud.dissolving = true;
  cloud.dissolveProgress = 0;
  return true;
}

function createSakuraGust(x, y, view = sakuraViewTransform(), limb = null) {
  limb = limb || findSakuraLimbAt(x, y, view);
  if (!limb)
    return;
  const settings = getEffectSettings("sakura");
  const limbIds = sakuraTreeLimbs
    .filter(candidate => isSakuraBranchWithin(limb.id, candidate))
    .slice(0, 24)
    .map(candidate => candidate.id);
  const limbIdSet = new Set(limbIds);
  const affectedBlooms = [];
  const maxAffectedBlooms = Math.max(2, Math.min(6, Math.round(4 * settings.gustStrength)));
  for (let index = 0; index < sakuraBlooms.length; index++) {
    const bloom = sakuraBlooms[index];
    if (!limbIdSet.has(bloom.limbId))
      continue;
    if (bloom.attached && affectedBlooms.length < maxAffectedBlooms)
      affectedBlooms.push(bloom);
    if (affectedBlooms.length >= maxAffectedBlooms)
      break;
  }
  sakuraBloomCacheDirty = true;

  affectedBlooms.forEach(bloom => {
    bloom.attached = false;
    bloom.regrowIn = settings.bloomInterval;
    for (let index = 0; index < 2; index++) {
      const petal = createFallingSakuraPetal(bloom.x + rand(-2, 2), bloom.y + rand(-2, 2));
      petal.vx = rand(-.85, .85);
      petal.vy = rand(.2, .9);
      sakuraFalling.push(petal);
    }
  });
}

function spawnSakuraPetalFromTree(base) {
  const attachedBlooms = sakuraBlooms.filter(bloom => bloom.attached);
  if (!attachedBlooms.length)
    return;
  const bloom = attachedBlooms[Math.floor(rand(0, attachedBlooms.length))];
  const petal = createFallingSakuraPetal(bloom.x + rand(-2, 2), bloom.y + rand(-2, 2));
  petal.size = rand(base * .003, base * .007);
  sakuraFalling.push(petal);
}

function createFallingSakuraPetal(x, y) {
  return {
    x, y,
    vx: rand(-.65, .65),
    vy: rand(.12, .8),
    size: rand(2.1, 4.2),
    rotation: rand(0, Math.PI * 2),
    spin: rand(-.035, .035),
    life: 1,
    phase: rand(0, Math.PI * 2),
    shade: Math.random() < .5 ? 0 : 1
  };
}
