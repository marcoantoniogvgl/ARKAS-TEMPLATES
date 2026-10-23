// Breakout: controla la pala, rompe los bloques y supera ocho niveles con una vida.
const blockBreakerMaxLevel=8;
const blockBreakerInitialVelocity={x:0,y:-540};
let blockBreakerBall={x:0,y:0,vx:blockBreakerInitialVelocity.x,vy:blockBreakerInitialVelocity.y,radius:8};
let blockBreakerPaddleX=0;
let blockBreakerPaddleVelocity=0;
let blockBreakerPaddleDirection=0;
let blockBreakerBricks=[];
let blockBreakerScore=0;
let blockBreakerLives=1;
let blockBreakerLevel=1;
let blockBreakerLaunched=false;
let blockBreakerOver=false;
let blockBreakerWon=false;
let blockBreakerConfetti=[];
const blockBreakerRecordKey="background-lab.block-breaker.best-score.v1";
let blockBreakerBestScore=loadBlockBreakerBestScore();

function loadBlockBreakerBestScore(){
  try{
    const score=Number(localStorage.getItem(blockBreakerRecordKey));
    return Number.isInteger(score)&&score>=0?score:0;
  }catch(error){
    console.error("No se pudo leer el récord de Block Breaker.",error);
    return 0;
  }
}

function saveBlockBreakerBestScore(){
  if(blockBreakerScore<=blockBreakerBestScore)
    return;
  blockBreakerBestScore=blockBreakerScore;
  try{
    localStorage.setItem(blockBreakerRecordKey,String(blockBreakerBestScore));
  }catch(error){
    console.error("No se pudo guardar el récord de Block Breaker.",error);
  }
}

function buildBlockBreakerBricks(){
  const columns=Math.max(5,Math.min(10,Math.floor(W()/76)));
  const rows=Math.min(blockBreakerLevel,blockBreakerMaxLevel);
  const gap=8;
  const sideMargin=24;
  const brickWidth=(W()-sideMargin*2-gap*(columns-1))/columns;
  const rowSpacing=29;
  const bottomY=90+(blockBreakerMaxLevel-1)*rowSpacing;
  blockBreakerBricks=[];
  for(let rowFromBottom=0;rowFromBottom<rows;rowFromBottom++){
    for(let column=0;column<columns;column++){
      blockBreakerBricks.push({
        x:sideMargin+column*(brickWidth+gap),
        y:bottomY-rowFromBottom*rowSpacing,
        width:brickWidth,
        height:20,
        hits:rowFromBottom+1,
        maxHits:rowFromBottom+1,
        alive:true
      });
    }
  }
}

function resetBlockBreaker(){
  blockBreakerScore=0;
  blockBreakerLives=1;
  blockBreakerLevel=1;
  blockBreakerLaunched=false;
  blockBreakerOver=false;
  blockBreakerWon=false;
  blockBreakerConfetti=[];
  blockBreakerPaddleX=W()*.5;
  blockBreakerPaddleVelocity=0;
  blockBreakerPaddleDirection=0;
  blockBreakerBall={
    x:blockBreakerPaddleX,
    y:H()-70,
    vx:blockBreakerInitialVelocity.x,
    vy:blockBreakerInitialVelocity.y,
    radius:8
  };
  buildBlockBreakerBricks();
}

function resizeBlockBreaker(){
  blockBreakerPaddleX=clamp(blockBreakerPaddleX||W()*.5,58,Math.max(58,W()-58));
  blockBreakerBall.x=clamp(blockBreakerBall.x||W()*.5,blockBreakerBall.radius,W()-blockBreakerBall.radius);
  blockBreakerBall.y=clamp(blockBreakerBall.y||H()-70,blockBreakerBall.radius,H()-blockBreakerBall.radius);
  if(!blockBreakerLaunched)
    blockBreakerBall.x=blockBreakerPaddleX;
  buildBlockBreakerBricks();
}

function launchBlockBreaker(){
  if(blockBreakerOver)
    return;
  blockBreakerLaunched=true;
}

function loseBlockBreakerLife(){
  blockBreakerLives--;
  if(blockBreakerLives<=0){
    blockBreakerOver=true;
    return;
  }
  blockBreakerLaunched=false;
  blockBreakerBall.x=blockBreakerPaddleX;
  blockBreakerBall.y=H()-70;
  blockBreakerBall.vx=blockBreakerInitialVelocity.x*(Math.random()<.5?-1:1);
  blockBreakerBall.vy=blockBreakerInitialVelocity.y;
}

function updateBlockBreaker(dt){
  if(blockBreakerOver)
    return;
  const seconds=dt/60;
  const paddleWidth=Math.min(128,W()*.32);
  const halfPaddle=paddleWidth*.5;
  const target=mouse.active
    ? mouse.x
    : blockBreakerPaddleX+blockBreakerPaddleDirection*520*seconds;
  const previousPaddleX=blockBreakerPaddleX;
  blockBreakerPaddleX+=
    (clamp(target,halfPaddle,W()-halfPaddle)-blockBreakerPaddleX)*
    Math.min(1,seconds*14);
  const paddleVelocity=seconds>0
    ? (blockBreakerPaddleX-previousPaddleX)/seconds
    : 0;
  const velocityBlend=1-Math.exp(-seconds*14);
  blockBreakerPaddleVelocity+=
    (paddleVelocity-blockBreakerPaddleVelocity)*velocityBlend;

  if(blockBreakerBricks.some(brick=>brick.alive&&brick.y+brick.height>=H()-64)){
    blockBreakerOver=true;
    return;
  }

  if(!blockBreakerLaunched){
    blockBreakerBall.x=blockBreakerPaddleX;
    blockBreakerBall.y=H()-70;
    return;
  }

  const ball=blockBreakerBall;
  const oldX=ball.x;
  const oldY=ball.y;
  ball.x+=ball.vx*seconds;
  ball.y+=ball.vy*seconds;

  if(ball.x-ball.radius<0){
    ball.x=ball.radius;
    ball.vx=Math.abs(ball.vx);
  }else if(ball.x+ball.radius>W()){
    ball.x=W()-ball.radius;
    ball.vx=-Math.abs(ball.vx);
  }
  if(ball.y-ball.radius<0){
    ball.y=ball.radius;
    ball.vy=Math.abs(ball.vy);
  }

  const paddleY=H()-50;
  if(
    ball.vy>0&&
    ball.y+ball.radius>=paddleY&&
    oldY+ball.radius<=paddleY+12&&
    Math.abs(ball.x-blockBreakerPaddleX)<=halfPaddle+ball.radius
  ){
    const hitOffset=clamp((ball.x-blockBreakerPaddleX)/halfPaddle,-1,1);
    const speed=Math.max(540,Math.hypot(ball.vx,ball.vy));
    const paddleInfluence=clamp(blockBreakerPaddleVelocity/600,-.38,.38);
    const angle=clamp(hitOffset*1.08+paddleInfluence,-1.25,1.25);
    ball.vx=Math.sin(angle)*speed;
    ball.vy=-Math.cos(angle)*speed;
    ball.y=paddleY-ball.radius;
  }

  for(const brick of blockBreakerBricks){
    if(
      !brick.alive||
      ball.x+ball.radius<brick.x||
      ball.x-ball.radius>brick.x+brick.width||
      ball.y+ball.radius<brick.y||
      ball.y-ball.radius>brick.y+brick.height
    )
      continue;
    brick.hits--;
    if(brick.hits<=0){
      brick.alive=false;
      blockBreakerScore+=10;
      saveBlockBreakerBestScore();
    }
    if(oldY+ball.radius<=brick.y){
      ball.y=brick.y-ball.radius;
      ball.vy=-Math.abs(ball.vy);
    }else if(oldY-ball.radius>=brick.y+brick.height){
      ball.y=brick.y+brick.height+ball.radius;
      ball.vy=Math.abs(ball.vy);
    }else if(oldX+ball.radius<=brick.x){
      ball.x=brick.x-ball.radius;
      ball.vx=-Math.abs(ball.vx);
    }else if(oldX-ball.radius>=brick.x+brick.width){
      ball.x=brick.x+brick.width+ball.radius;
      ball.vx=Math.abs(ball.vx);
    }else{
      ball.vx=-ball.vx;
    }
    break;
  }

  if(blockBreakerBricks.every(brick=>!brick.alive)){
    if(blockBreakerLevel>=blockBreakerMaxLevel){
      blockBreakerWon=true;
      blockBreakerOver=true;
      blockBreakerConfetti=Array.from({length:160},()=>({
        x:W()*.5+(Math.random()-.5)*W()*.65,
        y:H()*.42+(Math.random()-.5)*H()*.2,
        vx:(Math.random()-.5)*420,
        vy:-180-Math.random()*440,
        size:4+Math.random()*6,
        rotation:Math.random()*Math.PI*2,
        spin:(Math.random()-.5)*9,
        color:["#ff7885","#ffdc7a","#73dcbd","#72b9ff","#c6a0ff"][Math.floor(Math.random()*5)]
      }));
    }else{
      blockBreakerLevel++;
      buildBlockBreakerBricks();
      const speed=Math.hypot(ball.vx,ball.vy)*1.08;
      const angle=Math.atan2(ball.vy,ball.vx);
      ball.vx=Math.cos(angle)*speed;
      ball.vy=Math.sin(angle)*speed;
    }
  }

  if(ball.y-ball.radius>H())
    loseBlockBreakerLife();
}

function drawBlockBreaker(dt){
  updateBlockBreaker(dt);
  clear();
  const colors=["#72b9ff","#73dcbd","#ffdc7a","#ffae67","#ff7885"];
  for(const brick of blockBreakerBricks){
    if(!brick.alive)
      continue;
    const color=colors[(brick.hits-1)%colors.length];
    ctx.save();
    ctx.fillStyle=color;
    ctx.shadowColor=color;
    ctx.shadowBlur=12;
    ctx.beginPath();
    ctx.roundRect(brick.x,brick.y,brick.width,brick.height,5);
    ctx.fill();
    ctx.restore();
  }

  const paddleWidth=Math.min(128,W()*.32);
  const paddleY=H()-50;
  const gradient=ctx.createLinearGradient(
    blockBreakerPaddleX-paddleWidth*.5,paddleY,
    blockBreakerPaddleX+paddleWidth*.5,paddleY+14
  );
  gradient.addColorStop(0,"#68d7ff");
  gradient.addColorStop(1,"#a38bff");
  ctx.save();
  ctx.fillStyle=gradient;
  ctx.shadowColor="#68d7ff";
  ctx.shadowBlur=18;
  ctx.beginPath();
  ctx.roundRect(blockBreakerPaddleX-paddleWidth*.5,paddleY,paddleWidth,12,6);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(blockBreakerBall.x,blockBreakerBall.y,blockBreakerBall.radius,0,Math.PI*2);
  ctx.fillStyle="#f5f8ff";
  ctx.shadowColor="#c6d9ff";
  ctx.shadowBlur=16;
  ctx.fill();
  ctx.shadowBlur=0;

  ctx.fillStyle="rgba(238,242,255,.9)";
  ctx.font="800 14px Inter,system-ui,sans-serif";
  ctx.textBaseline="middle";
  ctx.textAlign="left";
  ctx.fillText(`PUNTOS  ${blockBreakerScore}`,16,28);
  ctx.textAlign="center";
  ctx.fillText(`NIVEL  ${Math.min(blockBreakerLevel,blockBreakerMaxLevel)}/${blockBreakerMaxLevel}`,W()/2,28);
  ctx.textAlign="right";
  ctx.fillText(`RÉCORD  ${blockBreakerBestScore}     VIDA  ${"●".repeat(blockBreakerLives)}`,W()-16,28);

  if(blockBreakerWon){
    const seconds=dt/60;
    for(const confetti of blockBreakerConfetti){
      confetti.x+=confetti.vx*seconds;
      confetti.y+=confetti.vy*seconds;
      confetti.vy+=520*seconds;
      confetti.rotation+=confetti.spin*seconds;
      if(confetti.y>H()+confetti.size){
        confetti.y=-confetti.size;
        confetti.x=Math.random()*W();
        confetti.vy=80+Math.random()*180;
      }
      ctx.save();
      ctx.translate(confetti.x,confetti.y);
      ctx.rotate(confetti.rotation);
      ctx.fillStyle=confetti.color;
      ctx.fillRect(-confetti.size*.5,-confetti.size*.3,confetti.size,confetti.size*.6);
      ctx.restore();
    }
  }

  if(blockBreakerOver||!blockBreakerLaunched){
    ctx.fillStyle=blockBreakerOver&&!blockBreakerWon?"rgba(5,8,18,.68)":"rgba(5,8,18,.28)";
    ctx.fillRect(0,0,W(),H());
    ctx.textAlign="center";
    ctx.fillStyle="#fff";
    ctx.font=blockBreakerWon?"800 36px Inter,system-ui,sans-serif":"800 30px Inter,system-ui,sans-serif";
    ctx.fillText(
      blockBreakerWon?"¡HAS GANADO!":blockBreakerOver?"Fin de la partida":"Block Breaker",
      W()/2,H()/2-8
    );
    ctx.font="500 15px Inter,system-ui,sans-serif";
    ctx.fillStyle="rgba(238,242,255,.86)";
    ctx.fillText(
      blockBreakerOver?"Pulsa «Reiniciar» para volver a jugar":"Mueve la pala y haz clic para lanzar",
      W()/2,H()/2+23
    );
  }
}

document.getElementById("resetBlockBreaker").addEventListener("click",resetBlockBreaker);

document.addEventListener("keydown",event=>{
  if(current!=="breaker"||customizationPanel.open)
    return;
  if(["ArrowLeft","a","A"].includes(event.key)){
    blockBreakerPaddleDirection=-1;
    event.preventDefault();
  }else if(["ArrowRight","d","D"].includes(event.key)){
    blockBreakerPaddleDirection=1;
    event.preventDefault();
  }else if(event.key===" "){
    launchBlockBreaker();
    event.preventDefault();
  }
});

document.addEventListener("keyup",event=>{
  if(
    current==="breaker"&&
    ["ArrowLeft","ArrowRight","a","A","d","D"].includes(event.key)
  )
    blockBreakerPaddleDirection=0;
});
