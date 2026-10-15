let gridCells = [];

let gridCellSize = 38;

let gridCols = 0;

let gridRows = 0;

let gridOffsetX = 0;

let gridOffsetY = 0;

let gridTrailCell = null;

let gridSpawnTimer = 0;

let gridMouseTracked = false;

function buildGridCells(){

  gridCellSize=getEffectSettings("grid").amount;
  gridCols=Math.max(1,Math.floor(W()/gridCellSize));
  gridRows=Math.max(1,Math.floor(H()/gridCellSize));
  gridOffsetX=(W()-gridCols*gridCellSize)/2;
  gridOffsetY=(H()-gridRows*gridCellSize)/2;
  gridSpawnTimer=rand(.5,1.5);

  gridCells=Array.from(
    {length:gridCols*gridRows},
    (_,index)=>({
      x:gridOffsetX+(index%gridCols)*gridCellSize,
      y:gridOffsetY+Math.floor(index/gridCols)*gridCellSize,
      col:index%gridCols,
      row:Math.floor(index/gridCols),
      depth:0,
      phase:"waiting",
      timer:rand(.2,2.4),
      elapsed:0,
      duration:0
    })
  );
}

function drawGrid(time,dt){

  clear();
  const settings=getEffectSettings("grid");
  ctx.fillStyle=settings.color;
  ctx.fillRect(0,0,W(),H());

  for(let i=0;i<gridCells.length;i++){
    const cell=gridCells[i];
    if(cell.phase==="waiting"){
      cell.timer-=dt/60;
    }else if(cell.phase==="rising"){
      cell.elapsed+=dt/60;
      cell.depth=clamp(cell.elapsed/cell.duration,0,1);
      if(cell.depth>=1){
        cell.phase="holding";
        cell.holdTimer=rand(.1,2);
      }
    }else if(cell.phase==="holding"){
      cell.holdTimer-=dt/60;
      if(cell.holdTimer<=0){
        cell.phase="falling";
        cell.elapsed=0;
        cell.duration=rand(.3,.48);
      }
    }else if(cell.phase==="falling"){
      cell.elapsed+=dt/60;
      const progress=clamp(cell.elapsed/cell.duration,0,1);
      cell.depth=1-progress*progress*(3-2*progress);
      if(progress>=1){
        cell.depth=0;
        cell.phase="waiting";
        cell.timer=rand(.6,3.4);
      }
    }

  }

  const visibleCells=gridCells
    .filter(cell=>cell.depth>0)
    .sort((a,b)=>(b.row-a.row)||(a.col-b.col));
  visibleCells.forEach(cell=>
    drawGridCube(cell.x,cell.y,gridCellSize*.9,cell.depth)
  );

  const active=gridCells.filter(cell=>cell.phase!=="waiting");
  const maxRaisedGridCubes=getEffectSettings("grid").maxCubes;
  gridSpawnTimer-=dt/60;
  if(gridSpawnTimer>0||active.length>=maxRaisedGridCubes)
    return;

  const candidates=gridCells.filter(
    cell=>cell.phase==="waiting"&&cell.timer<=0
  );

  for(let i=candidates.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [candidates[i],candidates[j]]=[candidates[j],candidates[i]];
  }

  for(const cell of candidates){
    const hasActiveNeighbour=active.some(other=>
      Math.abs(other.col-cell.col)<=1&&
      Math.abs(other.row-cell.row)<=1
    );

    if(!hasActiveNeighbour){
      cell.phase="rising";
      cell.elapsed=0;
      cell.duration=rand(.3,.5);
      active.push(cell);
      gridSpawnTimer=rand(.65,1.3);
      break;
    }
  }

  if(gridSpawnTimer<=0)
    gridSpawnTimer=rand(.12,.35);
}

function drawGridCube(x,y,size,depth){
  const settings=getEffectSettings("grid");
  const offset=(gridCellSize-size)/2;
  const baseX=x+offset;
  const baseY=y+offset;
  const travel=depth*size*.48;
  const drop=depth*size*.4;
  const raisedX=baseX-travel;
  const raisedY=baseY+drop;
  const rightX=raisedX+size;
  const bottomY=raisedY+size;
  const backX=rightX+travel;
  const backY=raisedY-drop;

  ctx.save();
  ctx.shadowColor=hexToRgba(settings.color,.3*depth);
  ctx.shadowBlur=5+depth*9;
  ctx.shadowOffsetX=travel*.65;
  ctx.shadowOffsetY=drop+travel*.65;
  ctx.fillStyle=hexToRgba(settings.color,.3*depth);
  ctx.fillRect(raisedX,raisedY,size,size);
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(raisedX,raisedY);
  ctx.lineTo(rightX,raisedY);
  ctx.lineTo(backX,backY);
  ctx.lineTo(raisedX+travel,backY);
  ctx.closePath();
  ctx.fillStyle=settings.secondaryColor;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(rightX,raisedY);
  ctx.lineTo(backX,backY);
  ctx.lineTo(backX,bottomY-drop);
  ctx.lineTo(rightX,bottomY);
  ctx.closePath();
  ctx.fillStyle=hexToRgba(settings.secondaryColor,.72);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(raisedX,raisedY);
  ctx.lineTo(rightX,raisedY);
  ctx.lineTo(rightX,bottomY);
  ctx.lineTo(raisedX,bottomY);
  ctx.closePath();
  ctx.fillStyle=settings.color;
  ctx.fill();
}

function gridCellFromPointer(x,y){
  if(!gridCells.length)
    return null;
  const col=clamp(
    Math.round((x-gridOffsetX-gridCellSize*.5)/gridCellSize),
    0,
    gridCols-1
  );
  const row=clamp(
    Math.round((y-gridOffsetY-gridCellSize*.5)/gridCellSize),
    0,
    gridRows-1
  );
  return {col,row};
}

function raiseGridCell(col,row){
  if(col<0||col>=gridCols||row<0||row>=gridRows)
    return;
  const cell=gridCells[row*gridCols+col];
  if(cell.phase!=="rising"&&cell.phase!=="holding"){
    cell.phase="rising";
    cell.depth=0;
    cell.elapsed=0;
    cell.duration=.34;
  }
}

function traceGridCells(from,to){
  if(!to)
    return;
  if(!from){
    raiseGridCell(to.col,to.row);
    return;
  }

  let x=from.col;
  let y=from.row;
  const dx=Math.abs(to.col-from.col);
  const sx=from.col<to.col?1:-1;
  const dy=-Math.abs(to.row-from.row);
  const sy=from.row<to.row?1:-1;
  let error=dx+dy;

  while(true){
    raiseGridCell(x,y);
    if(x===to.col&&y===to.row)
      break;
    const doubled=2*error;
    if(doubled>=dy){
      error+=dy;
      x+=sx;
    }
    if(doubled<=dx){
      error+=dx;
      y+=sy;
    }
  }
}
