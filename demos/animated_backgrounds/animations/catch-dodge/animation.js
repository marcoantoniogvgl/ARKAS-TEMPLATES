// Laberinto circular v3
// - 20 niveles con dos modos: "out" (la bola sale del centro hacia fuera) e "in"
//   (la bola empieza arriba, fuera, y hay que subirla con las tablas para que caiga al centro).
// - Anillos y tablas de madera giran juntos; física por impulsos con colisión de cápsulas,
//   fricción de Coulomb con rotación de la bola, rebote dependiente de la velocidad y sub-pasos adaptativos.
// - Pantalla de título, pausa, estrellas por tiempo, estadísticas guardadas, sonido, sacudida y partículas.

const catchDodgeMaximumLevel=20;
const catchDodgeRecordKey="background-lab.circular-maze.best-level.v1";
const catchDodgeStatsKey="background-lab.circular-maze.stats.v2";
const catchDodgeMuteKey="background-lab.circular-maze.muted.v1";
const catchDodgeBaseGravity=900;
const catchDodgeMaximumSpeed=720;
const catchDodgeRestitution=.3;
const catchDodgeFriction=.55;
const catchDodgeMaximumRotationSpeed=5;
const catchDodgeKeyboardSpeed=1.5;
const catchDodgeAttractSpeed=.55;
const catchDodgeTrailLength=18;
const catchDodgeSkipAfter=150;
const catchDodgeVariedFactors=[1,-.7,1.2,-.9,.6,-1.15,.8,-.55,1.05,-.85];

const catchDodgeLevels=[
  {name:"Primer giro",          rings:4, gap:4.6, doubleGap:.85,spin:"same",     paddles:0,mode:"out"},
  {name:"Descenso",             rings:4, gap:4.4, doubleGap:.7, spin:"same",     paddles:1,mode:"in"},
  {name:"Tablas de madera",     rings:5, gap:4.0, doubleGap:.5, spin:"same",     paddles:1,mode:"out"},
  {name:"Contramarcha",         rings:5, gap:3.8, doubleGap:.4, spin:"alternate",paddles:1,mode:"in"},
  {name:"Doble sentido",        rings:5, gap:3.6, doubleGap:.3, spin:"alternate",paddles:2,mode:"out"},
  {name:"Cuesta arriba",        rings:5, gap:3.5, doubleGap:.25,spin:"alternate",paddles:1,mode:"in"},
  {name:"Engranajes",           rings:6, gap:3.4, doubleGap:.15,spin:"varied",   paddles:2,mode:"out"},
  {name:"Caída libre",          rings:6, gap:3.3, doubleGap:.15,spin:"varied",   paddles:2,mode:"in"},
  {name:"Laberinto vivo",       rings:7, gap:3.2, doubleGap:.1, spin:"varied",   paddles:2,mode:"out"},
  {name:"Torre de relojería",   rings:6, gap:3.1, doubleGap:.1, spin:"varied",   paddles:2,mode:"in"},
  {name:"Marea de madera",      rings:7, gap:3.0, doubleGap:0,  spin:"varied",   paddles:3,mode:"out"},
  {name:"Pozo profundo",        rings:6, gap:3.0, doubleGap:0,  spin:"varied",   paddles:2,mode:"in"},
  {name:"Remolino",             rings:8, gap:2.9, doubleGap:0,  spin:"varied",   paddles:3,mode:"out"},
  {name:"Vértigo",              rings:6, gap:2.85,doubleGap:0,  spin:"varied",   paddles:3,mode:"in"},
  {name:"Ojo del huracán",      rings:9, gap:2.8, doubleGap:0,  spin:"varied",   paddles:3,mode:"out"},
  {name:"Sin red",              rings:7, gap:2.75,doubleGap:0,  spin:"varied",   paddles:3,mode:"in"},
  {name:"Cronómetro roto",      rings:9, gap:2.7, doubleGap:0,  spin:"varied",   paddles:4,mode:"out"},
  {name:"Abismo",               rings:7,gap:2.65,doubleGap:0,  spin:"varied",   paddles:3,mode:"in"},
  {name:"Pulso de acero",       rings:10,gap:2.6, doubleGap:0,  spin:"varied",   paddles:4,mode:"out"},
  {name:"Maestro del laberinto",rings:8,gap:2.55,doubleGap:0,  spin:"varied",   paddles:4,mode:"in"}
];

// Pantallas: "title" | "playing" | "paused" | "transition" | "won"
let catchDodgeScreen="title";
let catchDodgeLevel=1;
let catchDodgeBestLevel=loadCatchDodgeBestLevel();
let catchDodgeStats=loadCatchDodgeStats();
let catchDodgeMuted=loadCatchDodgeMuted();
let catchDodgeAudioContext=null;
let catchDodgeLastKnock=0;
let catchDodgeRunSeed=Math.floor(Math.random()*1e9);
let catchDodgeRingCount=0;
let catchDodgeRings=[];
let catchDodgePaddles=[];
let catchDodgeMaxFactor=1;
let catchDodgeBallX=0;
let catchDodgeBallY=0;
let catchDodgeBallVelocityX=0;
let catchDodgeBallVelocityY=0;
let catchDodgeBallRadius=6;
let catchDodgeBallSpin=0;
let catchDodgeBallRotation=0;
let catchDodgeMazeRotation=0;
let catchDodgeRotationVelocity=0;
let catchDodgeRotationDirection=0;
let catchDodgeDragDelta=0;
let catchDodgePassedRings=0;
let catchDodgeLevelTransition=0;
let catchDodgeOver=false;
let catchDodgeDraggingPointer=null;
let catchDodgeLastPointerAngle=0;
let catchDodgeRunTime=0;
let catchDodgeLevelTime=0;
let catchDodgeAttempt=1;
let catchDodgeBannerTime=0;
let catchDodgeFlash=0;
let catchDodgeShake=0;
let catchDodgeImpact=0;
let catchDodgeClock=0;
let catchDodgeLastStars=0;
let catchDodgeLastTime=0;
let catchDodgeTrail=[];
let catchDodgeParticles=[];

/* ---------- Almacenamiento ---------- */

function loadCatchDodgeBestLevel(){
  try{
    const saved=Number(localStorage.getItem(catchDodgeRecordKey));
    return Number.isInteger(saved)&&saved>=0&&saved<=catchDodgeMaximumLevel?saved:0;
  }catch(error){
    console.error("No se pudo leer el récord del Laberinto circular.",error);
    return 0;
  }
}

function saveCatchDodgeBestLevel(level){
  if(level<=catchDodgeBestLevel)
    return;
  catchDodgeBestLevel=level;
  try{
    localStorage.setItem(catchDodgeRecordKey,String(level));
  }catch(error){
    console.error("No se pudo guardar el récord del Laberinto circular.",error);
    const status=document.getElementById("catchGameStatus");
    if(status)
      status.textContent="No se pudo guardar el récord en este navegador.";
  }
}

function catchDodgeEmptyStats(){
  return {
    stars:new Array(catchDodgeMaximumLevel).fill(0),
    times:new Array(catchDodgeMaximumLevel).fill(0)
  };
}

function loadCatchDodgeStats(){
  const empty=catchDodgeEmptyStats();
  try{
    const parsed=JSON.parse(localStorage.getItem(catchDodgeStatsKey)||"null");
    if(!parsed||!Array.isArray(parsed.stars)||!Array.isArray(parsed.times))
      return empty;
    for(let index=0;index<catchDodgeMaximumLevel;index++){
      const stars=Number(parsed.stars[index]);
      const time=Number(parsed.times[index]);
      if(Number.isInteger(stars)&&stars>=0&&stars<=3)
        empty.stars[index]=stars;
      if(Number.isFinite(time)&&time>0)
        empty.times[index]=time;
    }
    return empty;
  }catch(error){
    console.error("No se pudieron leer las estadísticas del Laberinto circular.",error);
    return empty;
  }
}

function saveCatchDodgeStats(){
  try{
    localStorage.setItem(catchDodgeStatsKey,JSON.stringify(catchDodgeStats));
  }catch(error){
    console.error("No se pudieron guardar las estadísticas del Laberinto circular.",error);
  }
}

function loadCatchDodgeMuted(){
  try{
    return localStorage.getItem(catchDodgeMuteKey)==="1";
  }catch(error){
    return false;
  }
}

function catchDodgeTotalStars(){
  return catchDodgeStats.stars.reduce((sum,value)=>sum+value,0);
}

/* ---------- Sonido ---------- */

function catchDodgeEnsureAudio(){
  if(catchDodgeMuted)
    return null;
  try{
    if(!catchDodgeAudioContext){
      const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)
        return null;
      catchDodgeAudioContext=new AudioContextClass();
    }
    if(catchDodgeAudioContext.state==="suspended")
      catchDodgeAudioContext.resume();
    return catchDodgeAudioContext;
  }catch(error){
    return null;
  }
}

function catchDodgeTone(frequency,duration,type,volume,slideTo,delay=0){
  const audio=catchDodgeAudioContext;
  if(!audio||catchDodgeMuted||audio.state!=="running")
    return;
  try{
    const start=audio.currentTime+delay;
    const oscillator=audio.createOscillator();
    const gain=audio.createGain();
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(frequency,start);
    if(slideTo)
      oscillator.frequency.exponentialRampToValueAtTime(slideTo,start+duration);
    gain.gain.setValueAtTime(volume,start);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start+duration+.03);
  }catch(error){
    console.error("No se pudo reproducir el sonido del Laberinto circular.",error);
  }
}

function catchDodgeKnock(impulse){
  if(impulse<70||catchDodgeClock-catchDodgeLastKnock<.05)
    return;
  catchDodgeLastKnock=catchDodgeClock;
  const strength=Math.min(1,impulse/520);
  catchDodgeTone(
    120+Math.random()*50+strength*60,
    .05+strength*.08,
    "triangle",
    .02+strength*.07,
    60
  );
}

function catchDodgeToggleMute(){
  catchDodgeMuted=!catchDodgeMuted;
  try{
    localStorage.setItem(catchDodgeMuteKey,catchDodgeMuted?"1":"0");
  }catch(error){
    console.error("No se pudo guardar la preferencia de sonido.",error);
  }
  if(!catchDodgeMuted)
    catchDodgeEnsureAudio();
}

/* ---------- Utilidades ---------- */

function catchDodgeNormalizeAngle(angle){
  const fullTurn=Math.PI*2;
  return ((angle%fullTurn)+fullTurn)%fullTurn;
}

function catchDodgeAngleDifference(first,second){
  return Math.atan2(Math.sin(first-second),Math.cos(first-second));
}

function catchDodgeCreateRandom(seed){
  let state=seed|0;
  return function(){
    state=state+0x6D2B79F5|0;
    let value=Math.imul(state^state>>>15,1|state);
    value=value+Math.imul(value^value>>>7,61|value)^value;
    return ((value^value>>>14)>>>0)/4294967296;
  };
}

function catchDodgeFormatTime(totalSeconds){
  const safe=Math.max(0,totalSeconds);
  const minutes=Math.floor(safe/60);
  const seconds=Math.floor(safe%60);
  return `${minutes}:${String(seconds).padStart(2,"0")}`;
}

function catchDodgeParTime(level){
  return 18+level*6;
}

function catchDodgeStarText(count){
  return "★".repeat(count)+"☆".repeat(3-count);
}

function catchDodgeConfig(){
  return catchDodgeLevels[catchDodgeLevel-1];
}

function catchDodgeIsInward(){
  return catchDodgeConfig().mode==="in";
}

// Anillos que hay que cruzar para ganar.
function catchDodgeGoalRings(){
  return catchDodgeIsInward()?catchDodgeRingCount-1:catchDodgeRingCount;
}

function catchDodgeUi(){
  return Math.min(1,Math.max(.72,Math.min(W(),H())/560));
}

function catchDodgeFont(weight,size){
  return `${weight} ${Math.round(size*catchDodgeUi())}px Inter,system-ui,sans-serif`;
}

/* ---------- Geometría ---------- */

function catchDodgeOuterRadius(){
  return Math.max(70,Math.min(W(),H())*.36);
}

function catchDodgeInnerRadius(){
  return Math.min(42,catchDodgeOuterRadius()*.24);
}

function catchDodgeRingSpacing(){
  return (catchDodgeOuterRadius()-catchDodgeInnerRadius())/
    Math.max(1,catchDodgeRingCount);
}

function catchDodgeRingRadius(index){
  return catchDodgeInnerRadius()+catchDodgeRingSpacing()*(index+1);
}

function catchDodgeWallWidth(){
  return Math.max(1.6,Math.min(13,catchDodgeRingSpacing()*.3));
}

function catchDodgePaddleThickness(){
  return catchDodgeWallWidth()*.8;
}

function catchDodgeComputeBallRadius(){
  return Math.max(1.6,Math.min(7,catchDodgeRingSpacing()*.24));
}

function catchDodgeDistance(){
  return Math.hypot(catchDodgeBallX,catchDodgeBallY);
}

function catchDodgeBallReach(){
  return catchDodgeBallRadius+catchDodgeWallWidth()*.5;
}

function catchDodgeRingRotation(index){
  return catchDodgeMazeRotation*catchDodgeRings[index].factor;
}

function catchDodgeRingAngularVelocity(index){
  return catchDodgeRotationVelocity*catchDodgeRings[index].factor;
}

// Calcula la anchura angular de cada hueco y los tramos sólidos entre ellos.
function catchDodgeLayoutRings(){
  for(let index=0;index<catchDodgeRingCount;index++){
    const ring=catchDodgeRings[index];
    const radius=catchDodgeRingRadius(index);
    for(const gap of ring.gaps){
      gap.width=Math.min(
        2.4,
        (catchDodgeBallRadius*2*gap.factor+catchDodgeWallWidth())/radius
      );
    }
    ring.segments=[];
    const count=ring.gaps.length;
    for(let gapIndex=0;gapIndex<count;gapIndex++){
      const current=ring.gaps[gapIndex];
      const next=ring.gaps[(gapIndex+1)%count];
      const start=catchDodgeNormalizeAngle(current.center+current.width*.5);
      const end=catchDodgeNormalizeAngle(next.center-next.width*.5);
      const span=count===1?Math.PI*2-current.width:catchDodgeNormalizeAngle(end-start);
      if(span>.02)
        ring.segments.push({start,span});
    }
  }
}

/* ---------- Generación de niveles ---------- */

function catchDodgeBuildLevel(){
  const config=catchDodgeConfig();
  const inward=config.mode==="in";
  const random=catchDodgeCreateRandom(catchDodgeRunSeed+catchDodgeLevel*7919);
  const flip=random()<.5?-1:1;
  catchDodgeRings=[];
  catchDodgePaddles=[];
  catchDodgeMaxFactor=1;

  for(let index=0;index<catchDodgeRingCount;index++){
    let factor=1;
    if(config.spin==="alternate")
      factor=(index%2?-1:1)*flip;
    else if(config.spin==="varied")
      factor=catchDodgeVariedFactors[index%catchDodgeVariedFactors.length]*flip;
    else
      factor=flip;
    catchDodgeMaxFactor=Math.max(catchDodgeMaxFactor,Math.abs(factor));

    // En modo "in" el anillo exterior es una carcasa cerrada.
    if(inward&&index===catchDodgeRingCount-1){
      catchDodgeRings.push({factor,gaps:[],segments:[]});
      continue;
    }

    let center=random()*Math.PI*2;
    const previous=catchDodgeRings[index-1];
    if(previous&&previous.gaps.length){
      for(let attempt=0;attempt<12;attempt++){
        if(Math.abs(catchDodgeAngleDifference(center,previous.gaps[0].center))>=1.3)
          break;
        center=random()*Math.PI*2;
      }
    }
    const gapFactor=config.gap+(inward?.8:0);
    const gaps=[{center:catchDodgeNormalizeAngle(center),factor:gapFactor,width:0}];
    if(random()<config.doubleGap){
      gaps.push({
        center:catchDodgeNormalizeAngle(center+Math.PI+(random()-.5)*1.1),
        factor:gapFactor,
        width:0
      });
    }
    gaps.sort((first,second)=>first.center-second.center);
    catchDodgeRings.push({factor,gaps,segments:[]});
  }

  // Tablas de madera: radiales, fijadas al anillo exterior de cada pasillo.
  for(let corridor=1;corridor<catchDodgeRingCount;corridor++){
    let count=0;
    if(inward)
      count=1+Math.floor(random()*Math.max(1,Math.min(2,config.paddles)));
    else if(config.paddles>0&&random()<.65)
      count=1+Math.floor(random()*Math.min(2,config.paddles));
    const placed=[];
    const ring=catchDodgeRings[corridor];
    for(let paddle=0;paddle<count;paddle++){
      for(let attempt=0;attempt<24;attempt++){
        const angle=random()*Math.PI*2;
        const farFromPaddles=placed.every(other=>
          Math.abs(catchDodgeAngleDifference(other,angle))>.9
        );
        const farFromGaps=ring.gaps.every(gap=>
          Math.abs(catchDodgeAngleDifference(gap.center,angle))>.75
        );
        if(farFromPaddles&&farFromGaps){
          placed.push(angle);
          catchDodgePaddles.push({corridor,angle});
          break;
        }
      }
    }
  }
}

function catchDodgeSpawnBall(){
  catchDodgeBallVelocityX=0;
  catchDodgeBallVelocityY=0;
  catchDodgeBallSpin=0;
  catchDodgeBallRotation=0;
  if(catchDodgeIsInward()){
    const middle=(
      catchDodgeRingRadius(catchDodgeRingCount-2)+
      catchDodgeRingRadius(catchDodgeRingCount-1)
    )*.5;
    catchDodgeBallX=0;
    catchDodgeBallY=-middle;
  }else{
    catchDodgeBallX=0;
    catchDodgeBallY=0;
  }
  catchDodgeTrail=[];
}

/* ---------- Física ---------- */

// Impulso de contacto: rebote que depende de la velocidad + fricción de Coulomb con giro de la bola.
function catchDodgeContact(normalX,normalY,wallVelocityX,wallVelocityY){
  const radius=catchDodgeBallRadius;
  const relativeNormal=
    (catchDodgeBallVelocityX-wallVelocityX)*normalX+
    (catchDodgeBallVelocityY-wallVelocityY)*normalY;
  if(relativeNormal>=0)
    return 0;
  const speed=-relativeNormal;
  const bounce=speed>150
    ? catchDodgeRestitution
    : speed>55
      ? catchDodgeRestitution*(speed-55)/95
      : 0;
  const normalImpulse=-(1+bounce)*relativeNormal;
  catchDodgeBallVelocityX+=normalX*normalImpulse;
  catchDodgeBallVelocityY+=normalY*normalImpulse;

  const tangentX=-normalY;
  const tangentY=normalX;
  const slip=
    (catchDodgeBallVelocityX-wallVelocityX)*tangentX+
    (catchDodgeBallVelocityY-wallVelocityY)*tangentY-
    catchDodgeBallSpin*radius;
  const limit=catchDodgeFriction*normalImpulse;
  const tangentImpulse=clamp(-slip/3,-limit,limit);
  catchDodgeBallVelocityX+=tangentX*tangentImpulse;
  catchDodgeBallVelocityY+=tangentY*tangentImpulse;
  catchDodgeBallSpin-=2*tangentImpulse/radius;

  if(normalImpulse>catchDodgeImpact)
    catchDodgeImpact=normalImpulse;
  catchDodgeKnock(normalImpulse);
  return normalImpulse;
}

// Resuelve la colisión contra una cápsula cuyo punto más cercano ya se conoce.
function catchDodgeResolveAgainst(
  closestX,
  closestY,
  reach,
  angularVelocity,
  fallbackX,
  fallbackY
){
  const differenceX=catchDodgeBallX-closestX;
  const differenceY=catchDodgeBallY-closestY;
  const distance=Math.hypot(differenceX,differenceY);
  if(distance>=reach)
    return;
  let normalX;
  let normalY;
  if(distance>1e-6){
    normalX=differenceX/distance;
    normalY=differenceY/distance;
  }else{
    normalX=fallbackX;
    normalY=fallbackY;
  }
  const push=reach-distance+.02;
  catchDodgeBallX+=normalX*push;
  catchDodgeBallY+=normalY*push;
  catchDodgeContact(
    normalX,
    normalY,
    -angularVelocity*closestY,
    angularVelocity*closestX
  );
}

function catchDodgeCollideRing(index){
  const ring=catchDodgeRings[index];
  const radius=catchDodgeRingRadius(index);
  const reach=catchDodgeBallReach();
  const distance=catchDodgeDistance();
  if(Math.abs(distance-radius)>reach)
    return;
  const angle=Math.atan2(catchDodgeBallY,catchDodgeBallX);
  const rotation=catchDodgeRingRotation(index);
  let solid=ring.segments.length===0;
  let capAngle=0;
  let capGap=Infinity;
  if(!solid){
    const local=catchDodgeNormalizeAngle(angle-rotation);
    for(const segment of ring.segments){
      const offset=catchDodgeNormalizeAngle(local-segment.start);
      if(offset<=segment.span){
        solid=true;
        break;
      }
      const beyondEnd=offset-segment.span;
      const beforeStart=Math.PI*2-offset;
      if(beyondEnd<capGap){
        capGap=beyondEnd;
        capAngle=segment.start+segment.span;
      }
      if(beforeStart<capGap){
        capGap=beforeStart;
        capAngle=segment.start;
      }
    }
  }
  const pointAngle=solid?angle:capAngle+rotation;
  const radialSign=distance>=radius?1:-1;
  catchDodgeResolveAgainst(
    Math.cos(pointAngle)*radius,
    Math.sin(pointAngle)*radius,
    reach,
    catchDodgeRingAngularVelocity(index),
    Math.cos(angle)*radialSign,
    Math.sin(angle)*radialSign
  );
}

function catchDodgeCollidePaddles(){
  const half=catchDodgeWallWidth()*.5;
  const paddleHalf=catchDodgePaddleThickness()*.5;
  const reach=catchDodgeBallRadius+paddleHalf;
  for(const paddle of catchDodgePaddles){
    const inner=catchDodgeRingRadius(paddle.corridor-1)+half+paddleHalf;
    const outer=catchDodgeRingRadius(paddle.corridor)-half-paddleHalf;
    if(outer<=inner)
      continue;
    const angle=paddle.angle+catchDodgeRingRotation(paddle.corridor);
    const directionX=Math.cos(angle);
    const directionY=Math.sin(angle);
    const along=clamp(
      catchDodgeBallX*directionX+catchDodgeBallY*directionY,
      inner,
      outer
    );
    catchDodgeResolveAgainst(
      directionX*along,
      directionY*along,
      reach,
      catchDodgeRingAngularVelocity(paddle.corridor),
      -directionY,
      directionX
    );
  }
}

function catchDodgeComputePassed(){
  const distance=catchDodgeDistance();
  const reach=catchDodgeBallReach();
  let passed=0;
  if(catchDodgeIsInward()){
    for(
      let index=catchDodgeRingCount-2;
      index>=0&&distance<catchDodgeRingRadius(index)-reach;
      index--
    )
      passed++;
  }else{
    while(
      passed<catchDodgeRingCount&&
      distance>catchDodgeRingRadius(passed)+reach
    )
      passed++;
  }
  return passed;
}

function catchDodgeBurst(x,y,count,speed,color){
  for(let index=0;index<count;index++){
    const angle=Math.random()*Math.PI*2;
    const magnitude=speed*(.35+Math.random()*.65);
    catchDodgeParticles.push({
      x,
      y,
      velocityX:Math.cos(angle)*magnitude,
      velocityY:Math.sin(angle)*magnitude-speed*.25,
      life:.5+Math.random()*.4,
      maxLife:.9,
      size:1+Math.random()*2,
      color
    });
  }
  if(catchDodgeParticles.length>180)
    catchDodgeParticles.splice(0,catchDodgeParticles.length-180);
}

function catchDodgeBallBurst(count,speed){
  const settings=getEffectSettings("catch");
  catchDodgeBurst(
    W()*.5+catchDodgeBallX,
    H()*.5+catchDodgeBallY,
    count,
    speed,
    settings.color
  );
}

/* ---------- Ciclo de vida ---------- */

function startCatchDodgeLevel(){
  const config=catchDodgeConfig();
  catchDodgeRingCount=config.rings;
  catchDodgeBallRadius=catchDodgeComputeBallRadius();
  catchDodgeBuildLevel();
  catchDodgeLayoutRings();
  catchDodgeRestartState();
  catchDodgeAttempt=1;
  catchDodgeBannerTime=4;
}

// Reinicia bola y laberinto sin regenerar el nivel.
function catchDodgeRestartState(){
  catchDodgeSpawnBall();
  catchDodgeMazeRotation=0;
  catchDodgeRotationVelocity=0;
  catchDodgeRotationDirection=0;
  catchDodgeDragDelta=0;
  catchDodgeDraggingPointer=null;
  catchDodgePassedRings=0;
  catchDodgeLevelTime=0;
  catchDodgeImpact=0;
  catchDodgeParticles=[];
}

function restartCatchDodgeLevel(){
  if(catchDodgeScreen!=="playing"&&catchDodgeScreen!=="paused")
    return;
  catchDodgeAttempt++;
  catchDodgeRestartState();
  catchDodgeScreen="playing";
}

function catchDodgeShowTitle(){
  catchDodgeScreen="title";
  catchDodgeOver=false;
  catchDodgeLevelTransition=0;
  catchDodgeLevel=1;
  catchDodgeRunSeed=Math.floor(Math.random()*1e9);
  startCatchDodgeLevel();
}

function catchDodgeBeginRun(startLevel){
  catchDodgeEnsureAudio();
  catchDodgeRunSeed=Math.floor(Math.random()*1e9);
  catchDodgeLevel=Math.max(1,Math.min(catchDodgeMaximumLevel,startLevel));
  catchDodgeOver=false;
  catchDodgeLevelTransition=0;
  catchDodgeRunTime=0;
  catchDodgeScreen="playing";
  startCatchDodgeLevel();
  const status=document.getElementById("catchGameStatus");
  if(status)
    status.textContent="";
}

function resetCatchDodgeGame(){
  catchDodgeShowTitle();
}

function resizeCatchDodgeGame(){
  if(!catchDodgeRings.length)
    return;
  catchDodgeBallRadius=catchDodgeComputeBallRadius();
  catchDodgeLayoutRings();
  const distance=catchDodgeDistance();
  const maximumDistance=catchDodgeOuterRadius()+catchDodgeBallRadius;
  if(distance>maximumDistance){
    const scale=maximumDistance/distance;
    catchDodgeBallX*=scale;
    catchDodgeBallY*=scale;
  }
}

function catchDodgeTogglePause(){
  if(catchDodgeScreen==="playing"){
    catchDodgeScreen="paused";
    catchDodgeDraggingPointer=null;
    catchDodgeRotationDirection=0;
  }else if(catchDodgeScreen==="paused"){
    catchDodgeScreen="playing";
  }
}

function startCatchDodgeMazeDrag(x,y,pointerId){
  catchDodgeEnsureAudio();
  if(catchDodgeScreen==="title"){
    catchDodgeBeginRun(1);
    return;
  }
  if(catchDodgeScreen==="won"){
    catchDodgeShowTitle();
    return;
  }
  if(catchDodgeScreen==="paused"){
    catchDodgeScreen="playing";
    return;
  }
  if(catchDodgeScreen!=="playing")
    return;
  catchDodgeDraggingPointer=pointerId;
  catchDodgeDragDelta=0;
  catchDodgeLastPointerAngle=Math.atan2(y-H()*.5,x-W()*.5);
  stage.setPointerCapture(pointerId);
}

function moveCatchDodgeMazeDrag(x,y,pointerId){
  if(catchDodgeDraggingPointer!==pointerId)
    return;
  const angle=Math.atan2(y-H()*.5,x-W()*.5);
  catchDodgeDragDelta+=catchDodgeAngleDifference(angle,catchDodgeLastPointerAngle);
  catchDodgeLastPointerAngle=angle;
}

function stopCatchDodgeMazeDrag(pointerId){
  if(catchDodgeDraggingPointer===pointerId)
    catchDodgeDraggingPointer=null;
}

function catchDodgeRecordLevel(level,stars,time){
  const index=level-1;
  if(stars>catchDodgeStats.stars[index])
    catchDodgeStats.stars[index]=stars;
  if(!catchDodgeStats.times[index]||time<catchDodgeStats.times[index])
    catchDodgeStats.times[index]=time;
  saveCatchDodgeStats();
}

// Si se omite el nivel no se guardan estrellas, tiempo ni récord.
function skipCatchDodgeLevel(){
  if(catchDodgeScreen!=="playing"||catchDodgeLevelTime<catchDodgeSkipAfter)
    return;
  finishCatchDodgeLevel(true);
}

function finishCatchDodgeLevel(skipped=false){
  if(catchDodgeScreen==="title"){
    startCatchDodgeLevel();
    return;
  }
  const par=catchDodgeParTime(catchDodgeLevel);
  const stars=skipped
    ? 0
    : catchDodgeLevelTime<=par?3:catchDodgeLevelTime<=par*2?2:1;
  catchDodgeLastStars=stars;
  catchDodgeLastTime=catchDodgeLevelTime;
  if(!skipped){
    catchDodgeRecordLevel(catchDodgeLevel,stars,catchDodgeLevelTime);
    saveCatchDodgeBestLevel(catchDodgeLevel);
    catchDodgeBallBurst(40,280);
    catchDodgeFlash=.5;
    catchDodgeTone(523,.14,"sine",.06,0,0);
    catchDodgeTone(659,.14,"sine",.06,0,.1);
    catchDodgeTone(784,.22,"sine",.06,0,.2);
  }
  if(catchDodgeLevel===catchDodgeMaximumLevel){
    catchDodgeScreen="won";
    catchDodgeOver=true;
    return;
  }
  catchDodgeScreen="transition";
  catchDodgeLevelTransition=1.8;
}

function catchDodgeUpdateEffects(seconds){
  for(let index=catchDodgeParticles.length-1;index>=0;index--){
    const particle=catchDodgeParticles[index];
    particle.life-=seconds;
    if(particle.life<=0){
      catchDodgeParticles.splice(index,1);
      continue;
    }
    particle.velocityY+=520*seconds;
    particle.x+=particle.velocityX*seconds;
    particle.y+=particle.velocityY*seconds;
  }
  catchDodgeFlash=Math.max(0,catchDodgeFlash-seconds);
  catchDodgeShake=Math.max(0,catchDodgeShake-seconds*28);
}

function catchDodgeStepPhysics(step,dragVelocity,dragging,attract){
  const progress=(catchDodgeLevel-1)/(catchDodgeMaximumLevel-1);
  const gravity=catchDodgeBaseGravity*(1+progress*.28);

  // Rotación del laberinto: arrastre rígido, teclado con inercia (más pesada en niveles altos).
  let targetVelocity;
  let rate;
  if(dragging){
    targetVelocity=dragVelocity;
    rate=40;
  }else if(attract){
    targetVelocity=catchDodgeAttractSpeed;
    rate=2;
  }else if(catchDodgeRotationDirection!==0){
    targetVelocity=catchDodgeRotationDirection*catchDodgeKeyboardSpeed;
    rate=7*(1-progress*.45);
  }else{
    targetVelocity=0;
    rate=2.6;
  }
  catchDodgeRotationVelocity+=(targetVelocity-catchDodgeRotationVelocity)*
    Math.min(1,step*rate);
  catchDodgeMazeRotation+=catchDodgeRotationVelocity*step;

  // Bola: gravedad, rozamiento del aire y límite de velocidad.
  catchDodgeBallVelocityY+=gravity*step;
  const drag=Math.exp(-.05*step);
  catchDodgeBallVelocityX*=drag;
  catchDodgeBallVelocityY*=drag;
  const speed=Math.hypot(catchDodgeBallVelocityX,catchDodgeBallVelocityY);
  if(speed>catchDodgeMaximumSpeed){
    const scale=catchDodgeMaximumSpeed/speed;
    catchDodgeBallVelocityX*=scale;
    catchDodgeBallVelocityY*=scale;
  }
  catchDodgeBallX+=catchDodgeBallVelocityX*step;
  catchDodgeBallY+=catchDodgeBallVelocityY*step;

  // Varias pasadas para resolver esquinas entre tablas y anillos.
  for(let pass=0;pass<3;pass++){
    catchDodgeCollidePaddles();
    for(let index=0;index<catchDodgeRingCount;index++)
      catchDodgeCollideRing(index);
  }

  catchDodgeBallSpin*=Math.exp(-.5*step);
  catchDodgeBallRotation+=catchDodgeBallSpin*step;

  if(!Number.isFinite(catchDodgeBallX)||!Number.isFinite(catchDodgeBallY)){
    catchDodgeSpawnBall();
    return;
  }
  // Red de seguridad: la carcasa nunca debe perderse.
  if(catchDodgeIsInward()){
    const limit=catchDodgeRingRadius(catchDodgeRingCount-1)+catchDodgeBallReach();
    if(catchDodgeDistance()>limit)
      catchDodgeSpawnBall();
  }
}

function updateCatchDodgeGame(dt){
  const seconds=Math.min(dt/60,.05);
  if(!(seconds>0))
    return;
  catchDodgeClock+=seconds;
  catchDodgeUpdateEffects(seconds);

  if(catchDodgeScreen==="paused"||catchDodgeScreen==="won")
    return;
  if(catchDodgeScreen==="transition"){
    catchDodgeLevelTransition-=seconds;
    if(catchDodgeLevelTransition<=0){
      catchDodgeLevel++;
      catchDodgeScreen="playing";
      startCatchDodgeLevel();
    }
    return;
  }

  const attract=catchDodgeScreen==="title";
  if(!attract){
    catchDodgeRunTime+=seconds;
    catchDodgeLevelTime+=seconds;
  }
  catchDodgeBannerTime=Math.max(0,catchDodgeBannerTime-seconds);

  const dragging=!attract&&catchDodgeDraggingPointer!==null;
  const dragVelocity=dragging
    ? clamp(
        catchDodgeDragDelta/seconds,
        -catchDodgeMaximumRotationSpeed,
        catchDodgeMaximumRotationSpeed
      )
    : 0;
  catchDodgeDragDelta=0;

  // Sub-pasos adaptativos: ningún objeto recorre más de ~40% del radio de contacto por paso.
  const reach=Math.min(
    catchDodgeBallReach(),
    catchDodgeBallRadius+catchDodgePaddleThickness()*.5
  );
  const rotationBound=Math.max(
    Math.abs(catchDodgeRotationVelocity),
    Math.abs(dragVelocity),
    catchDodgeKeyboardSpeed
  );
  const wallSpeed=rotationBound*catchDodgeMaxFactor*catchDodgeOuterRadius();
  const ballSpeed=Math.hypot(catchDodgeBallVelocityX,catchDodgeBallVelocityY)+
    catchDodgeBaseGravity*1.3*seconds;
  const travel=(ballSpeed+wallSpeed)*seconds;
  const stepCount=Math.max(2,Math.min(80,Math.ceil(travel/(reach*.4))));
  const step=seconds/stepCount;

  for(let stepIndex=0;stepIndex<stepCount;stepIndex++){
    catchDodgeStepPhysics(step,dragVelocity,dragging,attract);

    const passed=catchDodgeComputePassed();
    if(passed>catchDodgePassedRings&&passed<catchDodgeGoalRings()&&!attract){
      catchDodgeBallBurst(12,150);
      catchDodgeTone(440+passed*45,.12,"sine",.045,660);
    }
    catchDodgePassedRings=passed;
    if(passed>=catchDodgeGoalRings()){
      finishCatchDodgeLevel();
      break;
    }
  }

  if(catchDodgeImpact>200){
    catchDodgeBallBurst(Math.min(8,Math.round(catchDodgeImpact/70)),90);
    catchDodgeShake=Math.min(6,Math.max(catchDodgeShake,catchDodgeImpact/130));
  }
  catchDodgeImpact=0;

  catchDodgeTrail.push({x:catchDodgeBallX,y:catchDodgeBallY});
  if(catchDodgeTrail.length>catchDodgeTrailLength)
    catchDodgeTrail.shift();
}

/* ---------- Dibujo ---------- */

function catchDodgeRingColor(index){
  const tone=index/Math.max(1,catchDodgeRingCount-1);
  return {
    main:`hsl(${28-tone*6} ${54+tone*8}% ${62-tone*22}%)`,
    light:`hsl(${28-tone*6} ${60+tone*8}% ${74-tone*22}%)`,
    dark:`hsl(${24-tone*4} 48% ${30-tone*8}%)`
  };
}

function drawCatchDodgeBoard(outerRadius,innerRadius){
  // Asas de madera (giran con el laberinto).
  ctx.save();
  ctx.rotate(catchDodgeMazeRotation);
  for(let handle=0;handle<6;handle++){
    const angle=handle*Math.PI/3;
    const innerX=Math.cos(angle)*(outerRadius-3);
    const innerY=Math.sin(angle)*(outerRadius-3);
    const outerX=Math.cos(angle)*(outerRadius+27);
    const outerY=Math.sin(angle)*(outerRadius+27);
    ctx.beginPath();
    ctx.moveTo(innerX,innerY);
    ctx.lineTo(outerX,outerY);
    ctx.strokeStyle="#61371f";
    ctx.lineWidth=13;
    ctx.lineCap="round";
    ctx.shadowColor="rgba(0,0,0,.38)";
    ctx.shadowBlur=6;
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.beginPath();
    ctx.arc(outerX,outerY,8,0,Math.PI*2);
    ctx.fillStyle="#b9763f";
    ctx.fill();
    ctx.strokeStyle="rgba(255,215,159,.38)";
    ctx.lineWidth=1.5;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor="rgba(0,0,0,.62)";
  ctx.shadowBlur=18;
  ctx.fillStyle="#4a2a1b";
  ctx.beginPath();
  ctx.arc(0,0,outerRadius+8,0,Math.PI*2);
  ctx.fill();
  ctx.restore();

  const boardGradient=ctx.createRadialGradient(0,0,0,0,0,outerRadius);
  boardGradient.addColorStop(0,"#3a2318");
  boardGradient.addColorStop(1,"#1d110c");
  ctx.beginPath();
  ctx.arc(0,0,outerRadius,0,Math.PI*2);
  ctx.fillStyle=boardGradient;
  ctx.fill();

  const spacing=catchDodgeRingSpacing();
  for(let corridor=0;corridor<catchDodgeRingCount;corridor+=2){
    const radius=catchDodgeRingRadius(corridor)-spacing*.5;
    ctx.beginPath();
    ctx.arc(0,0,Math.max(0,radius),0,Math.PI*2);
    ctx.strokeStyle="rgba(255,200,140,.04)";
    ctx.lineWidth=spacing;
    ctx.stroke();
  }

  // Meta del modo "in": el centro late en verde.
  if(catchDodgeIsInward()){
    const pulse=.5+Math.sin(catchDodgeClock*3.2)*.5;
    const goalRadius=catchDodgeRingRadius(0)-catchDodgeWallWidth();
    const glow=ctx.createRadialGradient(0,0,0,0,0,goalRadius);
    glow.addColorStop(0,`rgba(120,255,190,${.28+pulse*.2})`);
    glow.addColorStop(1,"rgba(120,255,190,0)");
    ctx.beginPath();
    ctx.arc(0,0,goalRadius,0,Math.PI*2);
    ctx.fillStyle=glow;
    ctx.fill();
  }
}

function drawCatchDodgePaddle(corridor,angle,color){
  const half=catchDodgeWallWidth()*.5;
  const thickness=catchDodgePaddleThickness();
  const start=catchDodgeRingRadius(corridor-1)+half*.4;
  const end=catchDodgeRingRadius(corridor)-half*.4;
  ctx.save();
  ctx.rotate(angle);
  ctx.shadowColor="rgba(20,10,6,.7)";
  ctx.shadowBlur=5;
  ctx.fillStyle="#59331f";
  ctx.fillRect(start,-thickness*.5-1.5,end-start,thickness+3);
  ctx.shadowBlur=0;
  const wood=ctx.createLinearGradient(0,-thickness*.5,0,thickness*.5);
  wood.addColorStop(0,color.light);
  wood.addColorStop(.5,color.main);
  wood.addColorStop(1,color.dark);
  ctx.fillStyle=wood;
  ctx.fillRect(start,-thickness*.5,end-start,thickness);
  ctx.fillStyle="rgba(255,226,186,.35)";
  ctx.fillRect(start,-thickness*.5,end-start,1);
  ctx.restore();
}

function drawCatchDodgeRings(){
  const wallWidth=catchDodgeWallWidth();
  const hints=catchDodgeLevel<=8&&catchDodgeScreen!=="title";
  const targetRing=catchDodgeIsInward()
    ? catchDodgeRingCount-2-catchDodgePassedRings
    : catchDodgePassedRings;
  for(let index=0;index<catchDodgeRingCount;index++){
    const radius=catchDodgeRingRadius(index);
    const ring=catchDodgeRings[index];
    const color=catchDodgeRingColor(index);
    ctx.save();
    ctx.rotate(catchDodgeRingRotation(index));

    // Tablas fijadas a este anillo (se dibujan debajo del anillo para ocultar la unión).
    for(const paddle of catchDodgePaddles){
      if(paddle.corridor===index)
        drawCatchDodgePaddle(index,paddle.angle,color);
    }

    ctx.lineCap="round";
    const segments=ring.segments.length
      ? ring.segments.map(segment=>[segment.start,segment.start+segment.span])
      : [[0,Math.PI*2]];
    for(const [start,end] of segments){
      ctx.beginPath();
      ctx.arc(0,0,radius,start,end);
      ctx.strokeStyle="#59331f";
      ctx.lineWidth=wallWidth+4;
      ctx.shadowColor="rgba(20,10,6,.7)";
      ctx.shadowBlur=6;
      ctx.stroke();
      ctx.shadowBlur=0;
      ctx.beginPath();
      ctx.arc(0,0,radius,start,end);
      ctx.strokeStyle=color.main;
      ctx.lineWidth=wallWidth;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0,0,radius-wallWidth*.3,start,end);
      ctx.strokeStyle="rgba(255,226,186,.5)";
      ctx.lineWidth=1;
      ctx.stroke();
    }

    if(hints&&index===targetRing){
      for(const gap of ring.gaps){
        for(const edge of [gap.center-gap.width*.5,gap.center+gap.width*.5]){
          ctx.beginPath();
          ctx.arc(
            Math.cos(edge)*radius,
            Math.sin(edge)*radius,
            Math.max(1.2,wallWidth*.26),
            0,
            Math.PI*2
          );
          ctx.fillStyle="rgba(120,255,190,.75)";
          ctx.fill();
        }
      }
    }

    // Salida del modo "out": brillo sobre el hueco del anillo exterior.
    if(!catchDodgeIsInward()&&index===catchDodgeRingCount-1){
      const pulse=.5+Math.sin(catchDodgeClock*3.2)*.5;
      for(const gap of ring.gaps){
        const glowX=Math.cos(gap.center)*(radius+wallWidth);
        const glowY=Math.sin(gap.center)*(radius+wallWidth);
        const glow=ctx.createRadialGradient(glowX,glowY,0,glowX,glowY,wallWidth*3);
        glow.addColorStop(0,`rgba(120,255,190,${.35+pulse*.25})`);
        glow.addColorStop(1,"rgba(120,255,190,0)");
        ctx.beginPath();
        ctx.arc(glowX,glowY,wallWidth*3,0,Math.PI*2);
        ctx.fillStyle=glow;
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

function drawCatchDodgeBall(centerX,centerY,color){
  const radius=catchDodgeBallRadius;
  for(let index=0;index<catchDodgeTrail.length;index++){
    const point=catchDodgeTrail[index];
    const progress=(index+1)/catchDodgeTrail.length;
    ctx.beginPath();
    ctx.arc(centerX+point.x,centerY+point.y,radius*(.25+progress*.45),0,Math.PI*2);
    ctx.fillStyle=color;
    ctx.globalAlpha=progress*.16;
    ctx.fill();
  }
  ctx.globalAlpha=1;

  const ballX=centerX+catchDodgeBallX;
  const ballY=centerY+catchDodgeBallY;
  const gradient=ctx.createRadialGradient(
    ballX-radius*.35,
    ballY-radius*.4,
    1,
    ballX,
    ballY,
    radius*1.6
  );
  gradient.addColorStop(0,"#fff");
  gradient.addColorStop(.4,color);
  gradient.addColorStop(1,color);
  ctx.save();
  ctx.shadowColor=color;
  ctx.shadowBlur=12;
  ctx.beginPath();
  ctx.arc(ballX,ballY,radius,0,Math.PI*2);
  ctx.fillStyle=gradient;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(ballX,ballY);
  ctx.rotate(catchDodgeBallRotation);
  ctx.strokeStyle="rgba(255,255,255,.62)";
  ctx.lineWidth=Math.max(1,radius*.11);
  ctx.beginPath();
  ctx.arc(0,0,radius*.72,-Math.PI*.48,Math.PI*.48);
  ctx.stroke();
  ctx.restore();
}

function drawCatchDodgeHud(centerX){
  const config=catchDodgeConfig();
  const par=catchDodgeParTime(catchDodgeLevel);
  ctx.textBaseline="middle";

  ctx.fillStyle="rgba(238,242,255,.94)";
  ctx.font=catchDodgeFont(800,14);
  ctx.textAlign="left";
  ctx.fillText(`NIVEL ${catchDodgeLevel}/${catchDodgeMaximumLevel}`,16,28);
  ctx.textAlign="right";
  ctx.fillText(`RÉCORD ${catchDodgeBestLevel}/${catchDodgeMaximumLevel}`,W()-16,28);

  ctx.font=catchDodgeFont(600,12);
  ctx.fillStyle="rgba(238,242,255,.72)";
  ctx.textAlign="left";
  ctx.fillText(config.name,16,47);
  ctx.textAlign="right";
  ctx.fillText(`★ ${catchDodgeTotalStars()}/${catchDodgeMaximumLevel*3}`,W()-16,47);

  const overPar=catchDodgeLevelTime>par;
  ctx.textAlign="left";
  ctx.fillStyle=overPar?"rgba(255,190,150,.85)":"rgba(238,242,255,.72)";
  ctx.fillText(
    `⏱ ${catchDodgeFormatTime(catchDodgeLevelTime)} · par ${catchDodgeFormatTime(par)}`,
    16,
    65
  );
  ctx.fillStyle="rgba(238,242,255,.72)";
  ctx.textAlign="right";
  ctx.fillText(
    `Intento ${catchDodgeAttempt} · Total ${catchDodgeFormatTime(catchDodgeRunTime)}`,
    W()-16,
    65
  );

  const goal=catchDodgeGoalRings();
  const dotSpacing=14;
  const startX=centerX-(goal-1)*dotSpacing*.5;
  for(let index=0;index<goal;index++){
    ctx.beginPath();
    ctx.arc(startX+index*dotSpacing,86,4,0,Math.PI*2);
    ctx.fillStyle=index<catchDodgePassedRings
      ? "rgba(120,255,190,.95)"
      : "rgba(238,242,255,.22)";
    ctx.fill();
  }

  if(catchDodgeBannerTime>0&&catchDodgeScreen==="playing"){
    ctx.textAlign="center";
    ctx.globalAlpha=Math.min(1,catchDodgeBannerTime);
    ctx.fillStyle="#fff";
    ctx.font=catchDodgeFont(700,15);
    ctx.fillText(
      catchDodgeIsInward()
        ? "Sube la bola con las tablas y déjala caer al centro"
        : "Haz caer la bola por las salidas hasta el exterior",
      centerX,
      110
    );
    ctx.globalAlpha=1;
  }

  if(catchDodgeScreen==="playing"&&catchDodgeLevelTime>=catchDodgeSkipAfter){
    ctx.textAlign="center";
    ctx.fillStyle="#ffd76a";
    ctx.font=catchDodgeFont(700,13);
    ctx.fillText("¿Atascado? Pulsa N para saltar este nivel (sin estrellas)",centerX,H()-38);
  }

  ctx.textAlign="center";
  ctx.fillStyle="rgba(238,242,255,.7)";
  ctx.font=catchDodgeFont(600,12);
  ctx.fillText(
    `Arrastra para girar · ← → / A D · P pausa · R reinicia · M sonido ${catchDodgeMuted?"(off)":"(on)"}`,
    centerX,
    H()-16
  );
}

function drawCatchDodgeOverlay(centerX,centerY,title,lines,alpha){
  ctx.fillStyle=`rgba(5,8,18,${alpha})`;
  ctx.fillRect(0,0,W(),H());
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  const top=centerY-lines.length*13-6;
  ctx.fillStyle="#fff";
  ctx.font=catchDodgeFont(800,32);
  ctx.fillText(title,centerX,top);
  lines.forEach((line,index)=>{
    ctx.fillStyle=line.color||"rgba(238,242,255,.86)";
    ctx.font=catchDodgeFont(line.weight||500,line.size||15);
    ctx.fillText(line.text,centerX,top+34+index*26);
  });
}

function drawCatchDodgeGame(dt){
  if(!catchDodgeRings.length)
    catchDodgeShowTitle();
  updateCatchDodgeGame(dt);
  clear();

  const centerX=W()*.5;
  const centerY=H()*.5;
  const outerRadius=catchDodgeOuterRadius();
  const innerRadius=catchDodgeInnerRadius();
  const settings=getEffectSettings("catch");

  const shakeX=(Math.random()-.5)*catchDodgeShake;
  const shakeY=(Math.random()-.5)*catchDodgeShake;
  ctx.save();
  ctx.translate(shakeX,shakeY);
  ctx.save();
  ctx.translate(centerX,centerY);
  drawCatchDodgeBoard(outerRadius,innerRadius);
  drawCatchDodgeRings();
  ctx.restore();
  drawCatchDodgeBall(centerX,centerY,settings.color);
  for(const particle of catchDodgeParticles){
    ctx.globalAlpha=Math.max(0,particle.life/particle.maxLife);
    ctx.beginPath();
    ctx.arc(particle.x,particle.y,particle.size,0,Math.PI*2);
    ctx.fillStyle=particle.color;
    ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.restore();

  if(catchDodgeScreen!=="title")
    drawCatchDodgeHud(centerX);

  if(catchDodgeFlash>0){
    ctx.fillStyle=`rgba(255,255,255,${catchDodgeFlash*.35})`;
    ctx.fillRect(0,0,W(),H());
  }

  if(catchDodgeScreen==="title"){
    const lines=[
      {text:"Gira el laberinto, usa las tablas y lleva la bola a la meta",size:14},
      {text:`20 niveles · ★ ${catchDodgeTotalStars()}/${catchDodgeMaximumLevel*3} · Récord ${catchDodgeBestLevel}/${catchDodgeMaximumLevel}`,size:13,color:"rgba(238,242,255,.7)"},
      {text:"Haz clic o pulsa Espacio para empezar",size:16,weight:700,color:"#9bffcf"}
    ];
    if(catchDodgeBestLevel>0&&catchDodgeBestLevel<catchDodgeMaximumLevel){
      lines.push({
        text:`Pulsa C para continuar en el nivel ${catchDodgeBestLevel+1}`,
        size:13,
        color:"rgba(238,242,255,.78)"
      });
    }
    drawCatchDodgeOverlay(centerX,centerY,"LABERINTO CIRCULAR",lines,.58);
  }else if(catchDodgeScreen==="paused"){
    drawCatchDodgeOverlay(centerX,centerY,"PAUSA",[
      {text:"Haz clic o pulsa P para continuar"},
      {text:"R reinicia el nivel · M activa o silencia el sonido",size:13,color:"rgba(238,242,255,.7)"}
    ],.66);
  }else if(catchDodgeScreen==="transition"){
    const par=catchDodgeParTime(catchDodgeLevel);
    const skipped=catchDodgeLastStars===0;
    drawCatchDodgeOverlay(centerX,centerY,skipped?`Nivel ${catchDodgeLevel} omitido`:`¡Nivel ${catchDodgeLevel} superado!`,[
      {text:skipped?"Sin estrellas":catchDodgeStarText(catchDodgeLastStars),size:30,color:"#ffd76a"},
      {text:`Tiempo ${catchDodgeFormatTime(catchDodgeLastTime)} · par ${catchDodgeFormatTime(par)}`},
      {text:`Siguiente: ${catchDodgeLevels[catchDodgeLevel].name}`,size:13,color:"rgba(238,242,255,.7)"}
    ],.62);
  }else if(catchDodgeScreen==="won"){
    drawCatchDodgeOverlay(centerX,centerY,"¡Has escapado!",[
      {text:`Los ${catchDodgeMaximumLevel} niveles en ${catchDodgeFormatTime(catchDodgeRunTime)}`,size:16,weight:600},
      {text:`★ ${catchDodgeTotalStars()}/${catchDodgeMaximumLevel*3} estrellas`,size:20,color:"#ffd76a"},
      {text:"Haz clic para volver al título",size:14}
    ],.72);
  }
}

/* ---------- Teclado y foco ---------- */

document.addEventListener("keydown",event=>{
  const target=event.target;
  if(current!=="catch"||customizationPanel.open||
      target instanceof Element&&
        target.closest("input,select,textarea,[contenteditable=true]"))
    return;
  const key=event.key;
  if(["ArrowLeft","a","A","ArrowRight","d","D"].includes(key)){
    catchDodgeEnsureAudio();
    if(catchDodgeScreen==="title"){
      catchDodgeBeginRun(1);
    }else{
      catchDodgeRotationDirection=["ArrowLeft","a","A"].includes(key)?-1:1;
    }
    event.preventDefault();
  }else if(key==="p"||key==="P"||key==="Escape"){
    catchDodgeTogglePause();
    event.preventDefault();
  }else if(key==="r"||key==="R"){
    restartCatchDodgeLevel();
    event.preventDefault();
  }else if(key==="n"||key==="N"){
    skipCatchDodgeLevel();
    event.preventDefault();
  }else if(key==="m"||key==="M"){
    catchDodgeToggleMute();
    event.preventDefault();
  }else if(key===" "||key==="Enter"){
    if(catchDodgeScreen==="title")
      catchDodgeBeginRun(1);
    else if(catchDodgeScreen==="won")
      catchDodgeShowTitle();
    else if(catchDodgeScreen==="paused")
      catchDodgeTogglePause();
    event.preventDefault();
  }else if(key==="c"||key==="C"){
    if(catchDodgeScreen==="title"&&catchDodgeBestLevel>0&&
        catchDodgeBestLevel<catchDodgeMaximumLevel){
      catchDodgeBeginRun(catchDodgeBestLevel+1);
      event.preventDefault();
    }
  }
});

document.addEventListener("keyup",event=>{
  if(current==="catch"&&
      ["ArrowLeft","a","A","ArrowRight","d","D"].includes(event.key))
    catchDodgeRotationDirection=0;
});

window.addEventListener("blur",()=>{
  catchDodgeRotationDirection=0;
  catchDodgeDraggingPointer=null;
  if(catchDodgeScreen==="playing")
    catchDodgeScreen="paused";
});