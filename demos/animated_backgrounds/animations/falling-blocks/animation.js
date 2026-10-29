// Juego de bloques: completa filas y evita que las piezas lleguen al borde.
const tetrisColumns=10;
const tetrisRows=20;
const tetrisPieceShapes={
  I:[[1,1,1,1]],
  J:[[1,0,0],[1,1,1]],
  L:[[0,0,1],[1,1,1]],
  O:[[1,1],[1,1]],
  S:[[0,1,1],[1,1,0]],
  T:[[0,1,0],[1,1,1]],
  Z:[[1,1,0],[0,1,1]]
};
const tetrisPieceColors={
  I:"#55e7ff",
  J:"#6685ff",
  L:"#ff9c55",
  O:"#ffdf65",
  S:"#74e696",
  T:"#bd85ff",
  Z:"#ff718c"
};
let tetrisBoard=[];
let tetrisPieceBag=[];
let tetrisCurrentPiece=null;
let tetrisNextPiece=null;
let tetrisGravityElapsed=0;
let tetrisLockElapsed=0;
let tetrisScore=0;
let tetrisLines=0;
let tetrisPaused=false;
let tetrisGameOver=false;
let tetrisHorizontalDirection=0;
let tetrisHorizontalRepeatDelay=0;
let tetrisHorizontalRepeatInterval=0;
const tetrisRecordKey="background-lab.falling-blocks.best-score.v1";
let tetrisBestScore=loadTetrisBestScore();
const tetrisNextCanvas=document.getElementById("tetrisNextCanvas");
const tetrisNextContext=tetrisNextCanvas.getContext("2d");
const tetrisGameOverElement=document.getElementById("tetrisGameOver");
const tetrisDismissButton=document.getElementById("dismissTetrisAlert");
const tetrisPauseButton=document.getElementById("toggleTetrisGame");
const tetrisRestartButton=document.getElementById("restartTetrisGame");
const tetrisGameStatus=document.getElementById("tetrisGameStatus");

function loadTetrisBestScore(){
  try{
    const saved=Number(localStorage.getItem(tetrisRecordKey));
    return Number.isInteger(saved)&&saved>=0?saved:0;
  }catch(error){
    console.error("No se pudo leer el récord de Caída de bloques.",error);
    return 0;
  }
}

function saveTetrisBestScore(){
  if(tetrisScore<=tetrisBestScore)
    return;
  tetrisBestScore=tetrisScore;
  try{
    localStorage.setItem(tetrisRecordKey,String(tetrisBestScore));
  }catch(error){
    console.error("No se pudo guardar el récord de Caída de bloques.",error);
    tetrisGameStatus.textContent="No se pudo guardar el récord en este navegador.";
  }
}

function refillTetrisPieceBag(){
  tetrisPieceBag=Object.keys(tetrisPieceShapes);
  for(let index=tetrisPieceBag.length-1;index>0;index--){
    const swapIndex=Math.floor(Math.random()*(index+1));
    [tetrisPieceBag[index],tetrisPieceBag[swapIndex]]=
      [tetrisPieceBag[swapIndex],tetrisPieceBag[index]];
  }
}

function randomTetrisPiece(){
  if(!tetrisPieceBag.length)
    refillTetrisPieceBag();
  return tetrisPieceBag.pop();
}

function createTetrisPiece(type){
  const shape=tetrisPieceShapes[type].map(row=>row.slice());
  return {
    type,
    shape,
    x:Math.floor((tetrisColumns-shape[0].length)/2),
    y:0
  };
}

function resetTetrisGame(){
  stopTetrisHorizontalRepeat();
  tetrisBoard=Array.from({length:tetrisRows},()=>Array(tetrisColumns).fill(null));
  tetrisPieceBag=[];
  tetrisScore=0;
  tetrisLines=0;
  tetrisGravityElapsed=0;
  tetrisLockElapsed=0;
  tetrisPaused=false;
  tetrisGameOver=false;
  tetrisCurrentPiece=createTetrisPiece(randomTetrisPiece());
  tetrisNextPiece=randomTetrisPiece();
  tetrisGameOverElement.hidden=true;
  tetrisPauseButton.disabled=false;
  tetrisRestartButton.hidden=true;
  tetrisPauseButton.textContent="Pausa";
  tetrisPauseButton.setAttribute("aria-label","Pausar la partida");
  tetrisPauseButton.setAttribute("aria-pressed","false");
  tetrisGameStatus.textContent="Partida iniciada. Usa las flechas para mover las piezas.";
  drawTetrisNextPiece();
}

function resizeTetrisGame(){
  const bounds=tetrisNextCanvas.getBoundingClientRect();
  const pixelRatio=Math.min(window.devicePixelRatio||1,2);
  if(bounds.width&&bounds.height){
    tetrisNextCanvas.width=Math.round(bounds.width*pixelRatio);
    tetrisNextCanvas.height=Math.round(bounds.height*pixelRatio);
    tetrisNextContext.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  }
  drawTetrisNextPiece();
}

function tetrisPieceFits(piece,x=piece.x,y=piece.y,shape=piece.shape){
  for(let row=0;row<shape.length;row++){
    for(let column=0;column<shape[row].length;column++){
      if(!shape[row][column])
        continue;
      const boardX=x+column;
      const boardY=y+row;
      if(boardX<0||boardX>=tetrisColumns||boardY>=tetrisRows)
        return false;
      if(boardY>=0&&tetrisBoard[boardY][boardX])
        return false;
    }
  }
  return true;
}

function rotateTetrisShape(shape){
  return shape[0].map((_,column)=>
    shape.map(row=>row[column]).reverse()
  );
}

function moveTetrisPiece(dx,dy){
  if(!tetrisCurrentPiece||tetrisGameOver||tetrisPaused)
    return false;
  const nextX=tetrisCurrentPiece.x+dx;
  const nextY=tetrisCurrentPiece.y+dy;
  if(!tetrisPieceFits(tetrisCurrentPiece,nextX,nextY))
    return false;
  tetrisCurrentPiece.x=nextX;
  tetrisCurrentPiece.y=nextY;
  return true;
}

function rotateTetrisPiece(){
  if(!tetrisCurrentPiece||tetrisGameOver||tetrisPaused)
    return;
  const rotated=rotateTetrisShape(tetrisCurrentPiece.shape);
  for(const offset of [0,-1,1,-2,2]){
    if(tetrisPieceFits(tetrisCurrentPiece,tetrisCurrentPiece.x+offset,tetrisCurrentPiece.y,rotated)){
      tetrisCurrentPiece.shape=rotated;
      tetrisCurrentPiece.x+=offset;
      return;
    }
  }
}

function dropTetrisPiece(){
  moveTetrisPiece(0,1);
}

function hardDropTetrisPiece(){
  if(!tetrisCurrentPiece||tetrisGameOver||tetrisPaused)
    return;
  let distance=0;
  while(moveTetrisPiece(0,1))
    distance++;
  tetrisScore+=distance*2;
  saveTetrisBestScore();
  lockTetrisPiece();
}

function lockTetrisPiece(){
  tetrisLockElapsed=0;
  const {type,shape,x,y}=tetrisCurrentPiece;
  for(let row=0;row<shape.length;row++){
    for(let column=0;column<shape[row].length;column++){
      if(!shape[row][column])
        continue;
      const boardY=y+row;
      if(boardY<0){
        finishTetrisGame();
        return;
      }
      tetrisBoard[boardY][x+column]=type;
    }
  }

  const remainingRows=tetrisBoard.filter(row=>row.some(cell=>cell===null));
  const cleared=tetrisRows-remainingRows.length;
  if(cleared){
    tetrisLines+=cleared;
    tetrisScore+=[0,100,300,500,800][cleared]*Math.floor(tetrisLines/10+1);
    saveTetrisBestScore();
    tetrisBoard=[
      ...Array.from({length:cleared},()=>Array(tetrisColumns).fill(null)),
      ...remainingRows
    ];
    tetrisGameStatus.textContent=`Fila${cleared===1?"":"s"} completada${cleared===1?"":"s"}: ${cleared}. Puntuación: ${tetrisScore}.`;
  }

  tetrisCurrentPiece=createTetrisPiece(tetrisNextPiece);
  tetrisNextPiece=randomTetrisPiece();
  tetrisGravityElapsed=0;
  tetrisLockElapsed=0;
  drawTetrisNextPiece();
  if(!tetrisPieceFits(tetrisCurrentPiece))
    finishTetrisGame();
}

function finishTetrisGame(){
  saveTetrisBestScore();
  stopTetrisHorizontalRepeat();
  tetrisGameOver=true;
  tetrisPaused=true;
  tetrisPauseButton.disabled=true;
  tetrisGameStatus.textContent=`Fin de la partida. Puntuación: ${tetrisScore}. Filas: ${tetrisLines}.`;
  tetrisGameOverElement.hidden=false;
  tetrisDismissButton.focus();
}

function toggleTetrisPause(){
  if(tetrisGameOver)
    return;
  tetrisPaused=!tetrisPaused;
  if(tetrisPaused)
    stopTetrisHorizontalRepeat();
  tetrisPauseButton.textContent=tetrisPaused?"Play":"Pausa";
  tetrisPauseButton.setAttribute("aria-label",tetrisPaused?"Reanudar la partida":"Pausar la partida");
  tetrisPauseButton.setAttribute("aria-pressed",String(tetrisPaused));
  tetrisGameStatus.textContent=tetrisPaused?"Partida en pausa.":"Partida reanudada.";
}

function clearTetrisBoard(){
  resetTetrisGame();
  tetrisGameStatus.textContent="Tablero vaciado. La partida vuelve a empezar.";
}

function stopTetrisHorizontalRepeat(){
  if(tetrisHorizontalRepeatDelay)
    window.clearTimeout(tetrisHorizontalRepeatDelay);
  if(tetrisHorizontalRepeatInterval)
    window.clearInterval(tetrisHorizontalRepeatInterval);
  tetrisHorizontalRepeatDelay=0;
  tetrisHorizontalRepeatInterval=0;
  tetrisHorizontalDirection=0;
}

function startTetrisHorizontalRepeat(direction){
  stopTetrisHorizontalRepeat();
  tetrisHorizontalDirection=direction;
  moveTetrisPiece(direction,0);
  tetrisHorizontalRepeatDelay=window.setTimeout(()=>{
    tetrisHorizontalRepeatDelay=0;
    tetrisHorizontalRepeatInterval=window.setInterval(()=>{
      if(current!=="tetris"||!tetrisHorizontalDirection){
        stopTetrisHorizontalRepeat();
        return;
      }
      moveTetrisPiece(tetrisHorizontalDirection,0);
    },55);
  },120);
}

function drawTetrisCell(x,y,size,type,alpha=1){
  ctx.save();
  ctx.globalAlpha=alpha;
  const color=tetrisPieceColors[type];
  const inset=Math.max(1,size*.055);
  ctx.fillStyle=color;
  ctx.shadowColor=color;
  ctx.shadowBlur=size*.35;
  ctx.fillRect(x+inset,y+inset,size-inset*2,size-inset*2);
  ctx.shadowBlur=0;
  ctx.strokeStyle="rgba(255,255,255,.42)";
  ctx.lineWidth=Math.max(1,size*.055);
  ctx.strokeRect(x+inset*1.5,y+inset*1.5,size-inset*3,size-inset*3);
  ctx.restore();
}

function tetrisLayout(){
  const panelWidth=108;
  const panelGap=14;
  const cellSize=Math.floor(Math.max(12,Math.min(
    44,
    (H()-66)/tetrisRows,
    (W()-panelWidth-panelGap-24)/tetrisColumns
  )));
  const boardWidth=cellSize*tetrisColumns;
  const groupWidth=boardWidth+panelGap+panelWidth;
  const boardX=Math.max(10,(W()-groupWidth)/2);
  const boardHeight=cellSize*tetrisRows;
  const boardY=54+Math.max(0,(H()-54-boardHeight-12)/2);
  return {
    cellSize,
    boardX,
    boardY,
    panelX:boardX+boardWidth+panelGap,
    boardWidth,
    boardHeight
  };
}

function drawTetrisNextPiece(){
  const width=tetrisNextCanvas.clientWidth;
  const height=tetrisNextCanvas.clientHeight;
  if(!width||!height||!tetrisNextPiece)
    return;
  tetrisNextContext.clearRect(0,0,width,height);
  const shape=tetrisPieceShapes[tetrisNextPiece];
  const cellSize=Math.min(18,(width-16)/shape[0].length,(height-12)/shape.length);
  const shapeWidth=shape[0].length*cellSize;
  const shapeHeight=shape.length*cellSize;
  const offsetX=(width-shapeWidth)/2;
  const offsetY=(height-shapeHeight)/2;
  for(let row=0;row<shape.length;row++){
    for(let column=0;column<shape[row].length;column++){
      if(shape[row][column]){
        const color=tetrisPieceColors[tetrisNextPiece];
        tetrisNextContext.fillStyle=color;
        tetrisNextContext.shadowColor=color;
        tetrisNextContext.shadowBlur=cellSize*.35;
        tetrisNextContext.fillRect(
          offsetX+column*cellSize+1,
          offsetY+row*cellSize+1,
          cellSize-2,
          cellSize-2
        );
        tetrisNextContext.shadowBlur=0;
        tetrisNextContext.strokeStyle="rgba(255,255,255,.45)";
        tetrisNextContext.strokeRect(
          offsetX+column*cellSize+1.5,
          offsetY+row*cellSize+1.5,
          cellSize-3,
          cellSize-3
        );
      }
    }
  }
}

function drawTetrisGame(dt){
  clear();
  const layout=tetrisLayout();
  const {cellSize,boardX,boardY,panelX,boardWidth,boardHeight}=layout;
  const tetrisLevel=Math.floor(tetrisLines/5)+1;
  const gravityInterval=Math.max(.14,.72*Math.pow(.86,tetrisLevel-1));
  const panelScale=Math.min(1,(boardHeight-140)/225);
  const panelStatsOffset=Math.min(145,Math.max(124,boardHeight-225*panelScale-16));
  const panelTextY=offset=>boardY+panelStatsOffset+(offset-145)*panelScale;
  const piecePanel=document.getElementById("tetrisNextPiece");
  piecePanel.style.left=`${panelX}px`;
  piecePanel.style.top=`${boardY+8}px`;

  ctx.fillStyle="rgba(5,9,22,.82)";
  ctx.fillRect(boardX,boardY,boardWidth,boardHeight);
  ctx.strokeStyle="rgba(133,164,220,.28)";
  ctx.lineWidth=1;
  ctx.strokeRect(boardX+.5,boardY+.5,boardWidth-1,boardHeight-1);
  ctx.strokeStyle="rgba(160,185,230,.1)";
  for(let column=1;column<tetrisColumns;column++){
    const x=boardX+column*cellSize;
    ctx.beginPath();
    ctx.moveTo(x,boardY);
    ctx.lineTo(x,boardY+boardHeight);
    ctx.stroke();
  }
  for(let row=1;row<tetrisRows;row++){
    const y=boardY+row*cellSize;
    ctx.beginPath();
    ctx.moveTo(boardX,y);
    ctx.lineTo(boardX+boardWidth,y);
    ctx.stroke();
  }

  for(let row=0;row<tetrisRows;row++){
    for(let column=0;column<tetrisColumns;column++){
      const type=tetrisBoard[row][column];
      if(type)
        drawTetrisCell(boardX+column*cellSize,boardY+row*cellSize,cellSize,type);
    }
  }

  if(tetrisCurrentPiece&&!tetrisGameOver){
    let ghostY=tetrisCurrentPiece.y;
    while(tetrisPieceFits(tetrisCurrentPiece,tetrisCurrentPiece.x,ghostY+1))
      ghostY++;
    for(let row=0;row<tetrisCurrentPiece.shape.length;row++){
      for(let column=0;column<tetrisCurrentPiece.shape[row].length;column++){
        if(!tetrisCurrentPiece.shape[row][column])
          continue;
        drawTetrisCell(
          boardX+(tetrisCurrentPiece.x+column)*cellSize,
          boardY+(ghostY+row)*cellSize,
          cellSize,
          tetrisCurrentPiece.type,
          .2
        );
      }
    }
    for(let row=0;row<tetrisCurrentPiece.shape.length;row++){
      for(let column=0;column<tetrisCurrentPiece.shape[row].length;column++){
        if(tetrisCurrentPiece.shape[row][column])
          drawTetrisCell(
            boardX+(tetrisCurrentPiece.x+column)*cellSize,
            boardY+(tetrisCurrentPiece.y+row)*cellSize,
            cellSize,
            tetrisCurrentPiece.type
          );
      }
    }
  }

  if(!tetrisPaused&&!tetrisGameOver){
    if(tetrisPieceFits(tetrisCurrentPiece,tetrisCurrentPiece.x,tetrisCurrentPiece.y+1)){
      tetrisLockElapsed=0;
      tetrisGravityElapsed+=dt/60;
      if(tetrisGravityElapsed>=gravityInterval){
        tetrisGravityElapsed=0;
        dropTetrisPiece();
      }
    }else{
      tetrisGravityElapsed=0;
      tetrisLockElapsed+=dt/60;
      if(tetrisLockElapsed>=1)
        lockTetrisPiece();
    }
  }

  ctx.fillStyle="rgba(238,242,255,.8)";
  ctx.font="800 11px Inter,system-ui,sans-serif";
  ctx.textAlign="left";
  ctx.textBaseline="top";
  ctx.fillText(`RÉCORD ${tetrisBestScore}`,panelX,panelTextY(130));
  ctx.fillText("PUNTOS",panelX,panelTextY(145));
  ctx.fillStyle="#f6f8ff";
  ctx.font=`800 ${Math.max(12,20*panelScale)}px Inter,system-ui,sans-serif`;
  ctx.fillText(String(tetrisScore),panelX,panelTextY(164));
  ctx.fillStyle="rgba(238,242,255,.8)";
  ctx.font="800 11px Inter,system-ui,sans-serif";
  ctx.fillText("FILAS",panelX,panelTextY(207));
  ctx.fillStyle="#f6f8ff";
  ctx.font=`800 ${Math.max(12,20*panelScale)}px Inter,system-ui,sans-serif`;
  ctx.fillText(String(tetrisLines),panelX,panelTextY(226));
  ctx.fillStyle="rgba(238,242,255,.8)";
  ctx.font="800 11px Inter,system-ui,sans-serif";
  ctx.fillText("NIVEL",panelX,panelTextY(269));
  ctx.fillStyle="#f6f8ff";
  ctx.font=`800 ${Math.max(12,20*panelScale)}px Inter,system-ui,sans-serif`;
  ctx.fillText(String(tetrisLevel),panelX,panelTextY(288));
  ctx.fillStyle="rgba(238,242,255,.58)";
  ctx.font=`600 ${Math.max(7,9*panelScale)}px Inter,system-ui,sans-serif`;
  ctx.fillText("← → mover",panelX,panelTextY(334));
  ctx.fillText("↑ girar",panelX,panelTextY(352));
  ctx.fillText("Espacio: caída",panelX,panelTextY(370));

  if(tetrisPaused&&!tetrisGameOver){
    ctx.fillStyle="rgba(4,7,17,.68)";
    ctx.fillRect(boardX,boardY,boardWidth,boardHeight);
    ctx.fillStyle="#fff";
    ctx.font="800 22px Inter,system-ui,sans-serif";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText("PAUSA",boardX+boardWidth/2,boardY+boardHeight/2);
  }
}

document.getElementById("clearTetrisGame").addEventListener("click",clearTetrisBoard);
tetrisPauseButton.addEventListener("click",toggleTetrisPause);
document.getElementById("restartTetrisGame").addEventListener("click",()=>{
  resetTetrisGame();
  document.getElementById("clearTetrisGame").focus();
});
document.getElementById("restartTetrisFromAlert").addEventListener("click",()=>{
  resetTetrisGame();
  document.getElementById("clearTetrisGame").focus();
});
tetrisDismissButton.addEventListener("click",()=>{
  tetrisGameOverElement.hidden=true;
  tetrisRestartButton.hidden=false;
  tetrisRestartButton.focus();
});

document.addEventListener("keydown",event=>{
  if(
    current!=="tetris"||
    customizationPanel.open||
    event.target.closest("input,select,textarea,[contenteditable=true]")||
    event.key===" "&&event.target.closest("button")
  )
    return;
  if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," ","a","A","d","D","s","S","x","X","z","Z"].includes(event.key))
    event.preventDefault();
  if(event.key==="ArrowLeft"||event.key==="a"||event.key==="A"){
    if(!event.repeat)
      startTetrisHorizontalRepeat(-1);
  }else if(event.key==="ArrowRight"||event.key==="d"||event.key==="D"){
    if(!event.repeat)
      startTetrisHorizontalRepeat(1);
  }
  else if(event.key==="ArrowDown"||event.key==="s"||event.key==="S")
    dropTetrisPiece();
  else if(event.key==="ArrowUp"||event.key==="x"||event.key==="X")
    rotateTetrisPiece();
  else if(event.key==="z"||event.key==="Z")
    hardDropTetrisPiece();
  else if(event.key===" ")
    hardDropTetrisPiece();
});

document.addEventListener("keyup",event=>{
  if(
    event.key==="ArrowLeft"||event.key==="a"||event.key==="A"||
    event.key==="ArrowRight"||event.key==="d"||event.key==="D"
  )
    stopTetrisHorizontalRepeat();
});

window.addEventListener("blur",stopTetrisHorizontalRepeat);
