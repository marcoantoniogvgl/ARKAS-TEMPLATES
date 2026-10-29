// Motor común: prepara el canvas, administra el ciclo de animación y comparte utilidades.
const stage = document.getElementById("stage");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cursorRing = document.getElementById("cursorRing");

let current = "aurora";

let particles = [];
let pulses = [];
let stars = [];
let sparks = [];

let shards = [];
let glitches = [];

let animation = 0;
let lastTime = performance.now();
let ambientClock = 0;
let dayClock = 0;
let stageVisible = true;
let pageVisible = !document.hidden;

let mouse = {
  x:0,
  y:0,
  active:false,
  px:0,
  py:0,
  vx:0,
  vy:0
};

let dpr = 1;

const rand = (a,b) => a + Math.random() * (b-a);

const clamp = (v,a,b) =>
  Math.max(a, Math.min(b,v));

const W = () => stage.clientWidth;
const H = () => stage.clientHeight;

function resize(){
  if(typeof getEffectSettings!=="function"||typeof buildAurora!=="function")
    return;

  const rect = stage.getBoundingClientRect();

  dpr = Math.min(devicePixelRatio || 1,2);

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality="high";

  if(current === "aurora")
    buildAurora();

  if(current === "network")
    buildNetwork();
  else if(current === "particles")
    buildParticles();

  if(current === "bubbles")
    buildBubbles();

  if(current === "waves")
    buildRain();

  if(current === "grid")
    buildGridCells();

  if(current === "orbits")
    buildGeometricOrbits();

  if(current === "sunset")
    buildSky();

  if(current === "cyber")
    buildCyberStars();

  if(current === "ocean")
    buildDeepOcean();

  if(current === "sakura")
    buildSakura();

  if(current === "prism")
    buildLiquidPrism();

  if(current === "merge")
    resizeMergeGame();

  if(current === "catch")
    resizeCatchDodgeGame();

  if(current === "breaker")
    resizeBlockBreaker();

  if(current === "tetris")
    resizeTetrisGame();
}









function clear(){

  ctx.clearRect(
    0,
    0,
    W(),
    H()
  );
}

function stopAnimation(){
  if(animation){
    cancelAnimationFrame(animation);
    animation=0;
  }
}

function scheduleAnimation(){
  if(typeof getEffectSettings==="function"&&stageVisible&&pageVisible&&!animation)
    animation=requestAnimationFrame(animate);
}

function updateCanvasFilter(){
  const settings=getEffectSettings();
  canvas.style.filter=
    `hue-rotate(${getEffectHueRotation()}deg) saturate(${settings.intensity}) brightness(${settings.intensity})`;
}















function drawWallCube(
  x,
  y,
  size,
  depth,
  index
){

  const half=size*.5;
  const lift=depth*.48;

  // recessed opening
  ctx.fillStyle=
    "rgba(0,0,0,.42)";

  ctx.fillRect(
    x-half-2,
    y-half-2,
    size+4,
    size+4
  );

  if(depth<.20){

    ctx.strokeStyle=
      "rgba(255,213,77,.10)";

    ctx.strokeRect(
      x-half,
      y-half,
      size,
      size
    );

    return;
  }

  const ox=lift;
  const oy=-lift*.62;

  // shadow behind the protruding cube
  ctx.fillStyle=
    `rgba(0,0,0,${.28+.3*depth})`;

  ctx.beginPath();

  ctx.moveTo(
    x-half+ox+10,
    y-half+oy+10
  );

  ctx.lineTo(
    x+half+ox+10,
    y-half+oy+10
  );

  ctx.lineTo(
    x+half+ox+10,
    y+half+oy+10
  );

  ctx.lineTo(
    x-half+ox+10,
    y+half+oy+10
  );

  ctx.closePath();

  ctx.filter="blur(7px)";
  ctx.fill();
  ctx.filter="none";

  // top
  ctx.beginPath();

  ctx.moveTo(
    x-half,
    y-half
  );

  ctx.lineTo(
    x+half,
    y-half
  );

  ctx.lineTo(
    x+half+ox,
    y-half+oy
  );

  ctx.lineTo(
    x-half+ox,
    y-half+oy
  );

  ctx.closePath();

  ctx.fillStyle=
    `rgba(255,231,125,${.16+.32*depth})`;

  ctx.fill();

  ctx.strokeStyle=
    "rgba(255,228,112,.55)";

  ctx.stroke();

  // right face
  ctx.beginPath();

  ctx.moveTo(
    x+half,
    y-half
  );

  ctx.lineTo(
    x+half+ox,
    y-half+oy
  );

  ctx.lineTo(
    x+half+ox,
    y+half+oy
  );

  ctx.lineTo(
    x+half,
    y+half
  );

  ctx.closePath();

  ctx.fillStyle=
    `rgba(187,134,20,${.18+.35*depth})`;

  ctx.fill();

  ctx.stroke();

  // front
  const g=
    ctx.createLinearGradient(
      x-half,
      y-half,
      x+half,
      y+half
    );

  g.addColorStop(
    0,
    "rgba(255,224,82,.18)"
  );

  g.addColorStop(
    .5,
    "rgba(255,193,45,.08)"
  );

  g.addColorStop(
    1,
    "rgba(110,70,0,.16)"
  );

  ctx.beginPath();

  ctx.rect(
    x-half,
    y-half,
    size,
    size
  );

  ctx.fillStyle=g;
  ctx.fill();

  ctx.strokeStyle=
    `rgba(255,223,84,${.42+.35*depth})`;

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(
    x-half+6,
    y-half+6
  );

  ctx.lineTo(
    x+half-6,
    y-half+6
  );

  ctx.strokeStyle=
    "rgba(255,248,190,.15)";

  ctx.stroke();
}






function drawBirdShape(scale,flap,color){
  ctx.save();
  ctx.scale(scale,scale);
  ctx.fillStyle=color;
  ctx.strokeStyle=color;
  ctx.lineCap="round";
  ctx.lineJoin="round";
  ctx.lineWidth=1.3;

  ctx.beginPath();
  ctx.ellipse(0,0,3.3,1.35,0,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2.7,-.8,.95,0,Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(3.45,-.8);
  ctx.lineTo(5.1,-.35);
  ctx.lineTo(3.35,-.18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-2.6,-.25);
  ctx.lineTo(-5.2,-1.2);
  ctx.lineTo(-3.9,.15);
  ctx.closePath();
  ctx.fill();

  const wingTip=-2.2-flap;
  ctx.beginPath();
  ctx.moveTo(-.6,-.35);
  ctx.quadraticCurveTo(-3.2,-2.1-flap*.35,-8,wingTip);
  ctx.quadraticCurveTo(-6,-.3-flap*.35,-2,.55);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(.4,-.35);
  ctx.quadraticCurveTo(3.2,-2.1-flap*.35,8,wingTip);
  ctx.quadraticCurveTo(6,-.3-flap*.35,2,.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
















function drawSparks(dt){

  sparks=sparks.filter(s=>{

    s.x+=s.vx*dt;
    s.y+=s.vy*dt;

    s.vx*=
      Math.pow(.96,dt);

    s.vy*=
      Math.pow(.96,dt);

    s.life-=.025*dt;

    ctx.beginPath();

    ctx.moveTo(
      s.x,
      s.y
    );

    ctx.lineTo(
      s.x-s.vx*4,
      s.y-s.vy*4
    );

    ctx.strokeStyle=
      `hsla(${s.hue||195},100%,75%,${s.life})`;

    ctx.lineWidth=s.width;

    ctx.stroke();

    return s.life>0;
  });
}

// Avanza solo el efecto seleccionado usando un delta de tiempo ajustado a la velocidad configurada.
function animate(
  time=performance.now()
){

  const frameDt=
    clamp(
      (time-lastTime)/16.666,
      .35,
      2
    );

  lastTime=time;

  const settings=getEffectSettings();
  const dt=frameDt*settings.speed;
  effectClock+=frameDt*16.666*settings.speed;
  const animationTime=effectClock;
  ambientClock+=dt;

  if(current==="aurora")
    drawAurora(animationTime,dt);

  if(current==="bubbles")
    drawBubbles(animationTime,dt);

  if(current==="particles")
    drawParticles(animationTime,dt);

  if(current==="waves")
    drawWaves(animationTime,dt);

  if(current==="grid")
    drawGrid(animationTime,dt);

  if(current==="orbits")
    drawGeometricOrbits(animationTime,dt);

  if(current==="sunset")
    drawSunset(animationTime,dt);

  if(current==="network")
    drawNetwork(animationTime,dt);

  if(current==="cyber")
    drawCyber(animationTime,dt);

  if(current==="ocean")
    drawDeepOcean(animationTime,dt);

  if(current==="sakura")
    drawSakura(animationTime,dt);

  if(current==="prism")
    drawLiquidPrism(animationTime,dt);

  if(current==="merge")
    drawMergeGame(dt);

  if(current==="catch")
    drawCatchDodgeGame(dt);

  if(current==="breaker")
    drawBlockBreaker(dt);

  if(current==="tetris")
    drawTetrisGame(dt);

  animation=0;
  scheduleAnimation();
}



window.addEventListener('resize',resize);
document.addEventListener("visibilitychange",()=>{
  pageVisible=!document.hidden;
  if(pageVisible){
    lastTime=performance.now();
    scheduleAnimation();
  }else{
    stopAnimation();
  }
});

const stageVisibilityObserver=new IntersectionObserver(entries=>{
  stageVisible=entries.some(entry=>entry.intersectionRatio>=.1);
  if(stageVisible){
    lastTime=performance.now();
    scheduleAnimation();
  }else{
    stopAnimation();
  }
},{threshold:[0,.1]});
stageVisibilityObserver.observe(stage);
