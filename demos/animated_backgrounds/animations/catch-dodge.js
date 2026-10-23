// Juego de reflejos: recoge comida, evita bombas y mueve la plataforma.
let catchDodgeObjects=[];
let catchDodgeScore=0;
let catchDodgeMisses=0;
let catchDodgeOver=false;
let catchDodgeSpawnTimer=0;
let catchDodgeElapsed=0;
let catchDodgePaddleX=0;
let catchDodgeKeyDirection=0;
const catchDodgeRecordKey="background-lab.catch-dodge.best-score.v1";
let catchDodgeBestScore=loadCatchDodgeBestScore();

function loadCatchDodgeBestScore(){
  try{
    const score=Number(localStorage.getItem(catchDodgeRecordKey));
    return Number.isInteger(score)&&score>=0?score:0;
  }catch(error){
    console.error("No se pudo leer el récord de Atrapa y esquiva.",error);
    return 0;
  }
}

function saveCatchDodgeBestScore(){
  if(catchDodgeScore<=catchDodgeBestScore)
    return;
  catchDodgeBestScore=catchDodgeScore;
  try{
    localStorage.setItem(catchDodgeRecordKey,String(catchDodgeBestScore));
  }catch(error){
    console.error("No se pudo guardar el récord de Atrapa y esquiva.",error);
  }
}

function resetCatchDodgeGame(){
  catchDodgeObjects=[];
  catchDodgeScore=0;
  catchDodgeMisses=0;
  catchDodgeOver=false;
  catchDodgeSpawnTimer=0;
  catchDodgeElapsed=0;
  catchDodgePaddleX=W()*.5;
  catchDodgeKeyDirection=0;
}

function resizeCatchDodgeGame(){
  catchDodgePaddleX=clamp(catchDodgePaddleX||W()*.5,48,Math.max(48,W()-48));
  for(const object of catchDodgeObjects)
    object.x=clamp(object.x,object.radius,Math.max(object.radius,W()-object.radius));
}

function catchDodgePaddleWidth(){
  const base=Math.min(142,W()*.34);
  const minimum=Math.min(58,base);
  const shrinkSteps=Math.floor(catchDodgeScore/500);
  return Math.max(minimum,base-shrinkSteps*8);
}

function spawnCatchDodgeObject(){
  const radius=rand(13,20);
  const hazard=Math.random()<.32;
  catchDodgeObjects.push({
    x:rand(radius,Math.max(radius,W()-radius)),
    y:-radius,
    vx:rand(-32,32),
    baseSpeed:rand(145,205),
    radius,
    rotation:rand(0,Math.PI*2),
    spin:rand(-1.8,1.8),
    hue:hazard?rand(0,15):rand(25,55),
    kind:hazard?"hazard":"food",
    blinkPhase:rand(0,Math.PI*2),
    variant:Math.floor(Math.random()*3)
  });
}

function updateCatchDodgeGame(dt){
  if(catchDodgeOver)
    return;
  const seconds=dt/60;
  const settings=getEffectSettings("catch");
  if(!settings.constantSpeed)
    catchDodgeElapsed+=seconds;
  const speedMultiplier=settings.constantSpeed
    ? 1
    : Math.min(2.8,1+catchDodgeElapsed*.035);
  const paddleWidth=catchDodgePaddleWidth();
  const halfPaddle=paddleWidth*.5;
  const pointerTarget=mouse.active?mouse.x:catchDodgePaddleX;
  const keyboardTarget=catchDodgePaddleX+catchDodgeKeyDirection*520*seconds;
  const target=catchDodgeKeyDirection?keyboardTarget:pointerTarget;
  catchDodgePaddleX+=
    (clamp(target,halfPaddle,W()-halfPaddle)-catchDodgePaddleX)*
    Math.min(1,seconds*12);

  const spawnInterval=settings.constantSpeed
    ? .82
    : Math.max(.38,.82-catchDodgeElapsed*.004);
  catchDodgeSpawnTimer+=seconds;
  while(catchDodgeSpawnTimer>=spawnInterval){
    catchDodgeSpawnTimer-=spawnInterval;
    spawnCatchDodgeObject();
  }

  const paddleY=H()-50;
  for(let i=catchDodgeObjects.length-1;i>=0;i--){
    const object=catchDodgeObjects[i];
    const previousY=object.y;
    const speed=object.baseSpeed*speedMultiplier;
    object.y+=speed*seconds;
    object.x+=object.vx*seconds;
    object.rotation+=object.spin*seconds*speedMultiplier;
    if(object.x-object.radius<0||object.x+object.radius>W())
      object.vx=-object.vx;

    if(
      object.y+object.radius>=paddleY-8&&
      previousY-object.radius<=paddleY+10&&
      Math.abs(object.x-catchDodgePaddleX)<=halfPaddle+object.radius*.45
    ){
      catchDodgeObjects.splice(i,1);
      if(object.kind==="hazard"){
        catchDodgeMisses++;
      }else{
        catchDodgeScore+=10;
        saveCatchDodgeBestScore();
      }
      if(catchDodgeMisses>=5)
        catchDodgeOver=true;
      continue;
    }
    if(object.y-object.radius>H()){
      catchDodgeObjects.splice(i,1);
      if(object.kind==="food"){
        catchDodgeMisses++;
        if(catchDodgeMisses>=5)
          catchDodgeOver=true;
      }
    }
  }
}

function drawCatchDodgeObject(object){
  ctx.save();
  ctx.translate(object.x,object.y);
  ctx.rotate(object.rotation);
  if(object.kind==="hazard"){
    const blink=.5+.5*Math.sin(ambientClock*.022+object.blinkPhase);
    ctx.globalAlpha=.28+blink*.72;
    ctx.shadowColor=blink>.5?"#ff263f":"#ff9b35";
    ctx.shadowBlur=5+blink*32;
    ctx.fillStyle="#ba2747";
    ctx.strokeStyle=blink>.5?"#fff1a8":"#ff2849";
    ctx.lineWidth=2+blink*3.5;
    ctx.beginPath();
    ctx.arc(0,2,object.radius*.78,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha=1;
    ctx.strokeStyle=`rgba(255,${Math.round(50+blink*170)},${Math.round(55+blink*40)},${.35+blink*.6})`;
    ctx.lineWidth=1.5+blink*3;
    ctx.beginPath();
    ctx.arc(0,2,object.radius*(.92+blink*.1),0,Math.PI*2);
    ctx.stroke();
    ctx.strokeStyle="#ffd1a1";
    ctx.lineWidth=3+blink*2;
    ctx.beginPath();
    ctx.moveTo(object.radius*.15,-object.radius*.65);
    ctx.quadraticCurveTo(object.radius*.24,-object.radius*1.05,object.radius*.7,-object.radius*.92);
    ctx.stroke();
    ctx.fillStyle=blink>.5?"#fff3a6":"#ff6578";
    ctx.font=`900 ${object.radius*1.1}px Inter,system-ui,sans-serif`;
    ctx.shadowColor="#ff193b";
    ctx.shadowBlur=blink*14;
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText("!",0,3);
    ctx.shadowBlur=0;
  }else{
    const colors=["#ff5964","#ff9f43","#a65cff"];
    const color=colors[object.variant];
    ctx.shadowColor=color;
    ctx.shadowBlur=15;
    ctx.fillStyle=color;
    ctx.strokeStyle="rgba(255,255,255,.88)";
    ctx.lineWidth=1.5;
    if(object.variant===0){
      ctx.beginPath();
      ctx.arc(0,0,object.radius*.76,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle="#4d9b50";
      ctx.beginPath();
      ctx.ellipse(object.radius*.1,-object.radius*.72,object.radius*.22,object.radius*.11,-.4,0,Math.PI*2);
      ctx.fill();
    }else if(object.variant===1){
      ctx.beginPath();
      ctx.ellipse(0,0,object.radius*.6,object.radius*.88,0,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle="rgba(255,239,201,.8)";
      ctx.beginPath();
      ctx.moveTo(-object.radius*.42,-object.radius*.18);
      ctx.lineTo(object.radius*.42,-object.radius*.18);
      ctx.moveTo(-object.radius*.48,object.radius*.18);
      ctx.lineTo(object.radius*.48,object.radius*.18);
      ctx.stroke();
    }else{
      ctx.beginPath();
      ctx.moveTo(0,-object.radius);
      ctx.bezierCurveTo(object.radius*1.4,-object.radius*.25,object.radius*.7,object.radius,0,object.radius);
      ctx.bezierCurveTo(-object.radius*.7,object.radius,-object.radius*1.4,-object.radius*.25,0,-object.radius);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,.6)";
      ctx.beginPath();
      ctx.moveTo(-object.radius*.45,0);
      ctx.lineTo(object.radius*.45,0);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCatchDodgeGame(dt){
  updateCatchDodgeGame(dt);
  clear();
  for(const object of catchDodgeObjects)
    drawCatchDodgeObject(object);

  const paddleWidth=catchDodgePaddleWidth();
  const paddleY=H()-50;
  const paddleGradient=ctx.createLinearGradient(
    catchDodgePaddleX-paddleWidth*.5,paddleY,
    catchDodgePaddleX+paddleWidth*.5,paddleY+18
  );
  paddleGradient.addColorStop(0,"#9ae6ff");
  paddleGradient.addColorStop(.5,"#54b8ff");
  paddleGradient.addColorStop(1,"#777bff");
  ctx.save();
  ctx.shadowColor="#53c9ff";
  ctx.shadowBlur=20;
  ctx.fillStyle=paddleGradient;
  ctx.beginPath();
  ctx.roundRect(catchDodgePaddleX-paddleWidth*.5,paddleY,paddleWidth,14,7);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle="rgba(238,242,255,.9)";
  ctx.font="800 14px Inter,system-ui,sans-serif";
  ctx.textBaseline="middle";
  ctx.textAlign="left";
  ctx.fillText(`PUNTOS  ${catchDodgeScore}`,16,27);
  ctx.textAlign="right";
  ctx.fillText(`RÉCORD  ${catchDodgeBestScore}`,W()-16,27);
  const heartsStartX=W()-16-5*19;
  ctx.font="700 17px Arial,sans-serif";
  ctx.textAlign="right";
  ctx.fillStyle="rgba(238,242,255,.68)";
  ctx.fillText("VIDAS",heartsStartX-7,49);
  for(let heart=0;heart<5;heart++){
    ctx.textAlign="left";
    ctx.fillStyle=heart<5-catchDodgeMisses?"#ff5c82":"rgba(238,242,255,.25)";
    ctx.fillText(heart<5-catchDodgeMisses?"\u2665":"\u2661",heartsStartX+heart*19,49);
  }
  ctx.textAlign="left";
  ctx.fillStyle="rgba(238,242,255,.7)";
  ctx.font="600 12px Inter,system-ui,sans-serif";
  ctx.fillText("Recoge frutas, esquiva bombas · mueve el cursor o usa ← →",16,76);

  if(catchDodgeOver){
    ctx.fillStyle="rgba(5,8,18,.7)";
    ctx.fillRect(0,0,W(),H());
    ctx.textAlign="center";
    ctx.fillStyle="#fff";
    ctx.font="800 32px Inter,system-ui,sans-serif";
    ctx.fillText("Fin de la partida",W()/2,H()/2-8);
    ctx.font="500 15px Inter,system-ui,sans-serif";
    ctx.fillStyle="rgba(238,242,255,.84)";
    ctx.fillText("Haz clic en la pantalla para empezar de nuevo",W()/2,H()/2+24);
  }
}

document.addEventListener("keydown",event=>{
  if(current!=="catch"||customizationPanel.open)
    return;
  if(["ArrowLeft","a","A"].includes(event.key)){
    catchDodgeKeyDirection=-1;
    event.preventDefault();
  }else if(["ArrowRight","d","D"].includes(event.key)){
    catchDodgeKeyDirection=1;
    event.preventDefault();
  }
});

document.addEventListener("keyup",event=>{
  if(
    current==="catch"&&
    ["ArrowLeft","ArrowRight","a","A","d","D"].includes(event.key)
  )
    catchDodgeKeyDirection=0;
});
