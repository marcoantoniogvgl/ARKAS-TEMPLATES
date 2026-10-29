// Mini juego de gravedad: las bolas del mismo nivel se fusionan al tocarse.
let mergeGameBalls=[];
let mergeGameOver=false;
const mergeGameMaximumLevel=20;
const mergeGameRecordKey="background-lab.merge-drop.best-level.v1";
let mergeGameBestLevel=loadMergeGameRecord();

const mergeGameColors=[
  "#45d6f5",
  "#5a8dff",
  "#8b72ff",
  "#c36bff",
  "#f16fc2",
  "#ff7c91",
  "#ff9c64",
  "#ffd166",
  "#d4ed69",
  "#a7f06c",
  "#e7edf5",
  "#ffb347",
  "#b46cff",
  "#62e7d4",
  "#fff2a6"
];

const mergeGamePlanetColors=[
  "#9b8b7a",
  "#e7bd77",
  "#4a9edf",
  "#d85742",
  "#d99a59",
  "#d9b56c",
  "#83d8d4",
  "#547de0"
];

const mergeGameBilliardColors=[
  "#f3d02f",
  "#2462c7",
  "#d94142",
  "#a84ac4",
  "#ef8b35",
  "#38a96b",
  "#923f42",
  "#17171d",
  "#f3d02f",
  "#2462c7",
  "#d94142",
  "#e9ad34",
  "#3753a6",
  "#52a68e",
  "#f4f1e8"
];

function loadMergeGameRecord(){
  try{
    const saved=Number(localStorage.getItem(mergeGameRecordKey));
    return Number.isInteger(saved)&&saved>=0&&saved<=mergeGameMaximumLevel?saved:0;
  }catch(error){
    console.error("No se pudo leer el récord de Merge Drop.",error);
    return 0;
  }
}

function saveMergeGameRecord(level){
  if(level<=mergeGameBestLevel)
    return;
  mergeGameBestLevel=level;
  try{
    localStorage.setItem(mergeGameRecordKey,String(level));
  }catch(error){
    console.error("No se pudo guardar el récord de Merge Drop.",error);
    document.getElementById("mergeGameStatus").textContent="No se pudo guardar el récord en este navegador.";
  }
}

function mergeGameRadius(level){
  const sizeStep=level-1;
  return 20+sizeStep*1.6+sizeStep*sizeStep*.09;
}

function mergeGamePaletteColor(palette,level){
  return palette[(level-1)%palette.length];
}

function mergeGameLossLine(){
  return Math.min(84,Math.max(48,H()*.12));
}

function resizeMergeGame(){
  for(const ball of mergeGameBalls){
    ball.x=clamp(ball.x,ball.radius,Math.max(ball.radius,W()-ball.radius));
    ball.y=clamp(ball.y,ball.radius,Math.max(ball.radius,H()-ball.radius));
  }
}

function resetMergeGame(){
  mergeGameBalls=[];
  mergeGameOver=false;
  document.getElementById("mergeGameStatus").textContent="";
}

function spawnMergeBall(x){
  if(mergeGameOver)
    return;
  const level=1;
  const radius=mergeGameRadius(level);
  const line=mergeGameLossLine();
  mergeGameBalls.push({
    x:clamp(x,radius,Math.max(radius,W()-radius)),
    y:Math.min(H()-radius,line+radius+52),
    vx:0,
    vy:0,
    rotation:0,
    enteredPlay:false,
    level,
    radius
  });
  saveMergeGameRecord(level);
}

function mergeGamePair(first,second){
  const dx=second.x-first.x;
  const dy=second.y-first.y;
  const distance=Math.hypot(dx,dy);
  const minimumDistance=first.radius+second.radius;
  if(distance>=minimumDistance)
    return false;

  const nx=distance>0?dx/distance:1;
  const ny=distance>0?dy/distance:0;
  if(first.level===second.level&&first.level<mergeGameMaximumLevel){
    const nextLevel=first.level+1;
    const totalMass=first.radius*first.radius+second.radius*second.radius;
    const mergedBall={
      x:(first.x*first.radius*first.radius+second.x*second.radius*second.radius)/totalMass,
      y:(first.y*first.radius*first.radius+second.y*second.radius*second.radius)/totalMass,
      vx:(first.vx*first.radius*first.radius+second.vx*second.radius*second.radius)/totalMass,
      vy:(first.vy*first.radius*first.radius+second.vy*second.radius*second.radius)/totalMass,
      rotation:(first.rotation+second.rotation)*.5,
      enteredPlay:first.enteredPlay||second.enteredPlay,
      level:nextLevel,
      radius:mergeGameRadius(nextLevel)
    };
    mergeGameBalls.splice(mergeGameBalls.indexOf(second),1);
    mergeGameBalls.splice(mergeGameBalls.indexOf(first),1);
    mergeGameBalls.push(mergedBall);
    saveMergeGameRecord(nextLevel);
    return true;
  }

  const overlap=minimumDistance-distance;
  first.x-=nx*overlap*.5;
  first.y-=ny*overlap*.5;
  second.x+=nx*overlap*.5;
  second.y+=ny*overlap*.5;
  const relativeVelocity=(second.vx-first.vx)*nx+(second.vy-first.vy)*ny;
  if(relativeVelocity<0){
    const impulse=-(1.08*relativeVelocity)*.5;
    first.vx-=impulse*nx;
    first.vy-=impulse*ny;
    second.vx+=impulse*nx;
    second.vy+=impulse*ny;
  }
  return false;
}

function updateMergeGame(dt){
  if(mergeGameOver)
    return;
  const seconds=dt/60;
  const gravity=1600;
  for(const ball of mergeGameBalls){
    ball.vy=Math.min(ball.vy+gravity*seconds,1200);
    ball.x+=ball.vx*seconds;
    ball.y+=ball.vy*seconds;
    ball.rotation+=(ball.vx+ball.vy*.3)/ball.radius*seconds;

    if(ball.x-ball.radius<0){
      ball.x=ball.radius;
      ball.vx=Math.abs(ball.vx)*.55;
    }else if(ball.x+ball.radius>W()){
      ball.x=W()-ball.radius;
      ball.vx=-Math.abs(ball.vx)*.55;
    }
    if(ball.y+ball.radius>H()){
      ball.y=H()-ball.radius;
      ball.vy=-Math.abs(ball.vy)*.12;
      ball.vx*=.985;
      if(Math.abs(ball.vy)<24)
        ball.vy=0;
    }
    if(ball.y-ball.radius>mergeGameLossLine())
      ball.enteredPlay=true;
  }

  let merged=true;
  let mergeCount=0;
  while(merged&&mergeCount<20){
    merged=false;
    for(let i=0;i<mergeGameBalls.length&&!merged;i++){
      for(let j=i+1;j<mergeGameBalls.length;j++){
        if(mergeGamePair(mergeGameBalls[i],mergeGameBalls[j])){
          merged=true;
          mergeCount++;
          break;
        }
      }
    }
  }

  for(let pass=0;pass<3;pass++){
    for(let i=0;i<mergeGameBalls.length;i++){
      for(let j=i+1;j<mergeGameBalls.length;j++)
        mergeGamePair(mergeGameBalls[i],mergeGameBalls[j]);
    }
  }

  if(mergeGameBalls.some(ball=>ball.enteredPlay&&ball.y-ball.radius<=mergeGameLossLine())){
    mergeGameOver=true;
    document.getElementById("mergeGameStatus").textContent="Fin de la partida. Pulsa Vaciar para volver a jugar.";
  }
}

function drawMergeGlowBall(ball){
  const gradient=ctx.createRadialGradient(
    ball.x-ball.radius*.35,
    ball.y-ball.radius*.4,
    ball.radius*.08,
    ball.x,
    ball.y,
    ball.radius
  );
  gradient.addColorStop(0,"#ffffff");
  gradient.addColorStop(.16,mergeGamePaletteColor(mergeGameColors,ball.level));
  gradient.addColorStop(1,"#171a32");
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
  ctx.fillStyle=gradient;
  ctx.shadowColor=mergeGamePaletteColor(mergeGameColors,ball.level);
  ctx.shadowBlur=14;
  ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle="rgba(255,255,255,.55)";
  ctx.lineWidth=1.5;
  ctx.stroke();
  drawMergeNumber(ball);
}

function drawMergeBilliardBall(ball){
  const color=mergeGamePaletteColor(mergeGameBilliardColors,ball.level);
  ctx.save();
  ctx.translate(ball.x,ball.y);
  ctx.rotate(ball.rotation);
  ctx.beginPath();
  ctx.arc(0,0,ball.radius,0,Math.PI*2);
  ctx.clip();
  ctx.fillStyle=color;
  ctx.fillRect(-ball.radius,-ball.radius,ball.radius*2,ball.radius*2);
  if(ball.level>=9){
    ctx.fillStyle="#f8f8f3";
    ctx.fillRect(-ball.radius,-ball.radius*.36,ball.radius*2,ball.radius*.72);
  }
  const patchRadius=Math.max(6,ball.radius*.4);
  ctx.beginPath();
  ctx.arc(0,0,patchRadius,0,Math.PI*2);
  ctx.fillStyle="#fff";
  ctx.fill();
  ctx.strokeStyle="rgba(10,13,24,.3)";
  ctx.lineWidth=1;
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
  ctx.strokeStyle="rgba(255,255,255,.5)";
  ctx.lineWidth=1.5;
  ctx.stroke();
  drawMergeNumber(ball);
}

function drawMergePlanetSurface(ball){
  const level=ball.level;
  const radius=ball.radius;
  ctx.save();
  ctx.translate(ball.x,ball.y);
  ctx.rotate(ball.rotation);
  ctx.beginPath();
  ctx.arc(0,0,radius,0,Math.PI*2);
  ctx.clip();
  if(level<=8){
    const color=mergeGamePlanetColors[level-1];
    ctx.fillStyle=color;
    ctx.fillRect(-radius,-radius,radius*2,radius*2);
    if(level===3){
      ctx.fillStyle="#68ba71";
      ctx.beginPath();
      ctx.ellipse(-radius*.25,-radius*.1,radius*.5,radius*.25,-.55,0,Math.PI*2);
      ctx.ellipse(radius*.36,radius*.31,radius*.35,radius*.19,.3,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.7)";
      ctx.fillRect(-radius,-radius*.72,radius*2,radius*.12);
    }else if(level===5||level===6){
      for(let band=-2;band<=2;band++){
        ctx.fillStyle=`rgba(255,235,190,${.14+Math.abs(band)*.035})`;
        ctx.fillRect(-radius,radius*band*.23,radius*2,radius*.11);
      }
    }else if(level===4){
      ctx.fillStyle="rgba(111,40,36,.6)";
      for(let i=0;i<5;i++){
        ctx.beginPath();
        ctx.ellipse(Math.sin(i*3.1)*radius*.5,-radius*.6+i*radius*.31,radius*.42,radius*.06,-.14,0,Math.PI*2);
        ctx.fill();
      }
    }
    if(level===6||level===7){
      ctx.strokeStyle="rgba(247,222,163,.72)";
      ctx.lineWidth=Math.max(2,radius*.12);
      ctx.beginPath();
      ctx.ellipse(0,0,radius*1.3,radius*.32,-.25,0,Math.PI*2);
      ctx.stroke();
    }
  }else if(level===9){
    ctx.fillStyle="#ff9c30";
    ctx.fillRect(-radius,-radius,radius*2,radius*2);
    const sun=ctx.createRadialGradient(-radius*.2,-radius*.24,2,0,0,radius);
    sun.addColorStop(0,"#fff9bc");
    sun.addColorStop(.48,"#ffd14d");
    sun.addColorStop(1,"#f05c24");
    ctx.fillStyle=sun;
    ctx.fillRect(-radius,-radius,radius*2,radius*2);
    ctx.strokeStyle="rgba(255,235,127,.48)";
    ctx.lineWidth=1;
    for(let i=0;i<4;i++){
      ctx.beginPath();
      ctx.arc(0,0,radius*(.48+i*.14),0,Math.PI*2);
      ctx.stroke();
    }
  }else if(level===10){
    ctx.fillStyle="#12192b";
    ctx.fillRect(-radius,-radius,radius*2,radius*2);
    for(let i=0;i<5;i++){
      const orbit=radius*(.25+i*.12);
      ctx.strokeStyle="rgba(192,210,255,.38)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.ellipse(0,0,orbit,orbit*.44,(i%2)*.65,0,Math.PI*2);
      ctx.stroke();
      const angle=ball.rotation*(i%2?-.55:.55)+i*1.7;
      ctx.beginPath();
      ctx.arc(Math.cos(angle)*orbit,Math.sin(angle)*orbit*.44,Math.max(2,radius*.085),0,Math.PI*2);
      ctx.fillStyle=mergeGamePlanetColors[i%8];
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0,0,radius*.13,0,Math.PI*2);
    ctx.fillStyle="#ffd166";
    ctx.fill();
  }else if(level===11){
    ctx.fillStyle="#070710";
    ctx.fillRect(-radius,-radius,radius*2,radius*2);
    ctx.save();
    ctx.rotate(-.32);
    ctx.strokeStyle="#ff9d52";
    ctx.shadowColor="#ff6d3a";
    ctx.shadowBlur=8;
    ctx.lineWidth=Math.max(2,radius*.18);
    ctx.beginPath();
    ctx.ellipse(0,0,radius*.9,radius*.38,0,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0,0,radius*.35,0,Math.PI*2);
    ctx.fillStyle="#020207";
    ctx.fill();
  }else{
    const cosmicColors={
      12:["#3c175d","#e477ff","#ffc7ff"],
      13:["#102344","#54d8ff","#d1ffff"],
      14:["#29204b","#a38bff","#fff1b8"],
      15:["#681b24","#ffb347","#fff7c2"],
      16:["#183d32","#6ef0b4","#e3fff1"],
      17:["#482133","#ff70a6","#ffe1ef"],
      18:["#322552","#bc8cff","#f2e7ff"],
      19:["#49351c","#ffd166","#fff5d6"],
      20:["#16354a","#58d8ff","#e1fbff"]
    }[level]||[
      "#183d32","#6ef0b4","#e3fff1"
    ];
    const cosmic=ctx.createRadialGradient(-radius*.24,-radius*.3,radius*.04,0,0,radius*1.15);
    cosmic.addColorStop(0,cosmicColors[2]);
    cosmic.addColorStop(.28,cosmicColors[1]);
    cosmic.addColorStop(1,cosmicColors[0]);
    ctx.fillStyle=cosmic;
    ctx.fillRect(-radius,-radius,radius*2,radius*2);
    ctx.save();
    ctx.rotate(ball.rotation*.45);
    ctx.strokeStyle=`${cosmicColors[2]}99`;
    ctx.lineWidth=Math.max(1.5,radius*.025);
    for(let ray=0;ray<12;ray++){
      const angle=ray*Math.PI/6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle)*radius*.22,Math.sin(angle)*radius*.22);
      ctx.lineTo(Math.cos(angle)*radius*.92,Math.sin(angle)*radius*.92);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0,0,radius*(level===15 ? .26 : .17),0,Math.PI*2);
    ctx.fillStyle=cosmicColors[2];
    ctx.shadowColor=cosmicColors[1];
    ctx.shadowBlur=radius*.24;
    ctx.fill();
    ctx.shadowBlur=0;
  }
  const shade=ctx.createRadialGradient(-radius*.35,-radius*.4,radius*.04,0,0,radius*1.15);
  shade.addColorStop(0,"rgba(255,255,255,.22)");
  shade.addColorStop(.56,"rgba(255,255,255,0)");
  shade.addColorStop(1,"rgba(0,0,0,.58)");
  ctx.fillStyle=shade;
  ctx.fillRect(-radius,-radius,radius*2,radius*2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,radius,0,Math.PI*2);
  ctx.strokeStyle="rgba(255,255,255,.58)";
  ctx.lineWidth=1.5;
  ctx.stroke();
  drawMergeNumber(ball);
}

function drawMergeNumber(ball){
  const style=getEffectSettings("merge").ballStyle;
  const billiards=style==="billiards";
  ctx.save();
  ctx.translate(ball.x,ball.y);
  ctx.rotate(ball.rotation);
  if(billiards){
    ctx.fillStyle="#11131a";
    ctx.beginPath();
    ctx.arc(0,0,Math.max(5,ball.radius*.34),0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#fff";
    ctx.font=`800 ${Math.max(9,ball.radius*.48)}px Inter,system-ui,sans-serif`;
  }else{
    ctx.fillStyle="#fff";
    ctx.font=`800 ${Math.max(12,ball.radius*.78)}px Inter,system-ui,sans-serif`;
  }
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.shadowColor="rgba(0,0,0,.72)";
  ctx.shadowBlur=billiards?0:3;
  ctx.fillText(String(ball.level),0,1);
  ctx.restore();
}

function drawMergeBall(ball){
  const style=getEffectSettings("merge").ballStyle;
  const hasRings=mergeGameHasDecorativeRings(ball.level,style);
  if(hasRings){
    const ringColor=ball.level===11
      ? "#ff9d52"
      : ball.level<=8
        ? mergeGamePaletteColor(mergeGamePlanetColors,ball.level)
        : mergeGamePaletteColor(mergeGameColors,ball.level);
    const orbit=ambientClock*.012+ball.rotation*.35+ball.level*.43;
    ctx.save();
    ctx.translate(ball.x,ball.y);
    ctx.rotate(orbit);
    ctx.beginPath();
    ctx.ellipse(0,0,ball.radius*1.24,ball.radius*.43,0,0,Math.PI*2);
    ctx.strokeStyle=ringColor;
    ctx.globalAlpha=.72;
    ctx.lineWidth=Math.max(1.5,ball.radius*.07);
    ctx.shadowColor=ringColor;
    ctx.shadowBlur=10;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0,0,ball.radius*1.12,ball.radius*.3,0,Math.PI*.08,Math.PI*1.08);
    ctx.strokeStyle="rgba(255,255,255,.72)";
    ctx.globalAlpha=.42;
    ctx.lineWidth=Math.max(1,ball.radius*.035);
    ctx.shadowBlur=4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Math.cos(orbit*1.7)*ball.radius*1.24,Math.sin(orbit*1.7)*ball.radius*.43,Math.max(2,ball.radius*.075),0,Math.PI*2);
    ctx.fillStyle=ringColor;
    ctx.globalAlpha=.95;
    ctx.shadowBlur=8;
    ctx.fill();
    ctx.restore();
  }
  if(style==="billiards")
    drawMergeBilliardBall(ball);
  else if(style==="planets")
    drawMergePlanetSurface(ball);
  else
    drawMergeGlowBall(ball);
}

function mergeGameHasDecorativeRings(level,style){
  return style==="planets"&&(level>=5&&level<=8||level>=11);
}

function drawMergeGame(dt){
  updateMergeGame(dt);
  clear();
  const line=mergeGameLossLine();
  ctx.save();
  ctx.setLineDash([8,8]);
  ctx.lineWidth=2;
  ctx.strokeStyle=mergeGameOver?"rgba(255,100,118,.9)":"rgba(255,140,157,.78)";
  ctx.shadowColor=ctx.strokeStyle;
  ctx.shadowBlur=10;
  ctx.beginPath();
  ctx.moveTo(0,line);
  ctx.lineTo(W(),line);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle=mergeGameOver?"#ff9ba7":"rgba(242,221,230,.78)";
  ctx.font="700 11px Inter,system-ui,sans-serif";
  ctx.textAlign="left";
  ctx.textBaseline="middle";
  ctx.fillText("LÍNEA DE DERROTA",16,line-14);
  ctx.textAlign="left";
  ctx.fillStyle="rgba(238,242,255,.9)";
  ctx.font="800 14px Inter,system-ui,sans-serif";
  ctx.fillText(`RÉCORD  ${String(mergeGameBestLevel).padStart(2,"0")}`,16,28);

  for(const ball of mergeGameBalls)
    drawMergeBall(ball);

  if(mergeGameOver){
    ctx.fillStyle="rgba(5,8,18,.62)";
    ctx.fillRect(0,0,W(),H());
    ctx.textAlign="center";
    ctx.fillStyle="#fff";
    ctx.font="800 32px Inter,system-ui,sans-serif";
    ctx.fillText("Fin de la partida",W()/2,H()/2-8);
    ctx.font="500 15px Inter,system-ui,sans-serif";
    ctx.fillStyle="rgba(238,242,255,.8)";
    ctx.fillText("Pulsa «Vaciar» para volver a jugar",W()/2,H()/2+24);
  }else{
    ctx.textAlign="left";
    ctx.fillStyle="rgba(238,242,255,.62)";
    ctx.font="600 12px Inter,system-ui,sans-serif";
    ctx.fillText("Pulsa o mantén pulsado para soltar bolas",16,48);
  }
}

document.getElementById("clearMergeGame").addEventListener("click",resetMergeGame);
