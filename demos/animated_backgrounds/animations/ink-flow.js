let inkFlowDrops=[];
let inkEmitterTimers=[0,.2];
let inkFlowPointer={x:null,y:null};

function buildInkFlow(){
  const settings=getEffectSettings("ink");
  inkFlowDrops=[];
  inkEmitterTimers=[0,.2];
  inkFlowPointer={x:null,y:null};
  const initialCount=Math.min(settings.amount*2,36);
  for(let index=0;index<initialCount;index++){
    const colorIndex=index%2;
    const x=inkStreamX(colorIndex);
    spawnInkDrop(
      colorIndex,
      x+rand(-W()*.08,W()*.08),
      rand(-H()*.25,H()*.72),
      rand(10,22)
    );
  }
}

function drawInkFlow(time,dt){
  clear();
  const settings=getEffectSettings("ink");
  const maxDrops=settings.amount*2;
  const elapsed=dt/60;

  for(let colorIndex=0;colorIndex<2;colorIndex++){
    inkEmitterTimers[colorIndex]-=elapsed;
    if(inkEmitterTimers[colorIndex]<=0&&inkFlowDrops.length<maxDrops){
      const radius=rand(10,22);
      spawnInkDrop(
        colorIndex,
        inkStreamX(colorIndex)+rand(-W()*.08,W()*.08),
        -radius*1.8,
        radius
      );
      inkEmitterTimers[colorIndex]=rand(.34,.53);
    }
  }

  const colors=[
    inkRgb(settings.color),
    inkRgb(settings.secondaryColor),
    inkRgb(settings.mouseColor)
  ];
  inkFlowDrops=inkFlowDrops.filter(drop=>{
    drop.phase+=dt*.0015;
    drop.vy=Math.min(drop.vy+drop.gravity*dt,5.5);
    drop.vx+=Math.sin(drop.phase)*.004*dt;
    drop.x+=drop.vx*dt;
    drop.y+=drop.vy*dt;
    drop.vx*=Math.pow(.997,dt);
    if(drop.x<drop.radius){
      drop.x=drop.radius;
      drop.vx=Math.abs(drop.vx)*.55;
    }else if(drop.x>W()-drop.radius){
      drop.x=W()-drop.radius;
      drop.vx=-Math.abs(drop.vx)*.55;
    }
    if(drop.y>H()+drop.radius*1.8)
      return false;
    if(drop.colorIndex>=0)
      drop.color=colors[drop.colorIndex].slice();
    return true;
  });

  mixFallingInkDrops();
  inkFlowDrops.forEach(drawFallingInkDrop);
}

function inkStreamX(colorIndex){
  const center=colorIndex===0?W()*.34:W()*.66;
  return clamp(center,24,Math.max(24,W()-24));
}

function spawnInkDrop(colorIndex,x,y,radius,mouseDrop=false){
  const settings=getEffectSettings("ink");
  const sourceHex=colorIndex===0
    ?settings.color
    :colorIndex===1
      ?settings.secondaryColor
      :settings.mouseColor;
  inkFlowDrops.push({
    x,y,
    radius,
    vx:mouseDrop?rand(-.24,.24):rand(-.18,.18),
    vy:mouseDrop?rand(.25,.75):rand(.55,1.25),
    gravity:mouseDrop ? .02 : rand(.004,.009),
    phase:rand(0,Math.PI*2),
    color:inkRgb(sourceHex),
    colorIndex,
    opacity:mouseDrop ? .96 : .88
  });
}

function mixFallingInkDrops(){
  for(let first=0;first<inkFlowDrops.length;first++){
    const a=inkFlowDrops[first];
    for(let second=first+1;second<inkFlowDrops.length;second++){
      const b=inkFlowDrops[second];
      const dx=b.x-a.x;
      const dy=b.y-a.y;
      const distance=Math.hypot(dx,dy);
      if(distance>(a.radius+b.radius)*.82)
        continue;

      const areaA=a.radius*a.radius;
      const areaB=b.radius*b.radius;
      const totalArea=areaA+areaB;
      const mix=areaB/totalArea;
      a.x=(a.x*areaA+b.x*areaB)/totalArea;
      a.y=(a.y*areaA+b.y*areaB)/totalArea;
      a.vx=(a.vx*areaA+b.vx*areaB)/totalArea;
      a.vy=(a.vy*areaA+b.vy*areaB)/totalArea;
      a.radius=Math.min(48,Math.sqrt(totalArea));
      a.color=a.color.map((channel,index)=>channel*(1-mix)+b.color[index]*mix);
      a.colorIndex=-1;
      a.opacity=Math.min(1,Math.max(a.opacity,b.opacity)+.04);
      inkFlowDrops.splice(second,1);
      second--;
    }
  }
}

function drawFallingInkDrop(drop){
  const radius=drop.radius;
  const color=drop.color;
  const rotation=Math.atan2(drop.vx,Math.max(.15,drop.vy))*.45;
  const stretch=clamp(1+drop.vy*.035,1,1.25);
  ctx.save();
  ctx.globalAlpha=drop.opacity;
  ctx.translate(drop.x,drop.y);
  ctx.rotate(rotation);
  ctx.scale(1,stretch);

  const glow=ctx.createRadialGradient(0,0,radius*.1,0,0,radius*2.4);
  glow.addColorStop(0,inkRgba(inkMixColor(color,[255,255,255],.22),.2));
  glow.addColorStop(1,"transparent");
  ctx.fillStyle=glow;
  ctx.beginPath();
  ctx.arc(0,0,radius*2.4,0,Math.PI*2);
  ctx.fill();

  const liquid=ctx.createLinearGradient(-radius,-radius*1.2,radius,radius*1.25);
  liquid.addColorStop(0,inkRgba(inkMixColor(color,[255,255,255],.38),.98));
  liquid.addColorStop(.28,inkRgba(inkMixColor(color,[255,255,255],.12),.96));
  liquid.addColorStop(.72,inkRgba(color,.94));
  liquid.addColorStop(1,inkRgba(inkMixColor(color,[0,0,0],.3),.92));
  traceFallingInkDrop(radius);
  ctx.fillStyle=liquid;
  ctx.fill();
  ctx.lineWidth=Math.max(.8,radius*.06);
  ctx.strokeStyle=inkRgba(inkMixColor(color,[255,255,255],.45),.38);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-radius*.28,-radius*.48,radius*.22,radius*.09,-.28,0,Math.PI*2);
  ctx.fillStyle="rgba(255,255,255,.48)";
  ctx.fill();
  ctx.restore();
}

function traceFallingInkDrop(radius){
  ctx.beginPath();
  ctx.moveTo(0,-radius*1.35);
  ctx.bezierCurveTo(radius*.18,-radius*.75,radius*1.1,-radius*.1,radius*.98,radius*.55);
  ctx.bezierCurveTo(radius*.86,radius*1.25,-radius*.86,radius*1.25,-radius*.98,radius*.55);
  ctx.bezierCurveTo(-radius*1.1,-radius*.1,-radius*.18,-radius*.75,0,-radius*1.35);
  ctx.closePath();
}

function paintInkFlow(x,y,vx,vy){
  if(inkFlowPointer.x===null){
    stirInkFlow(x,y,vx,vy,true);
    return;
  }
  const startX=inkFlowPointer.x;
  const startY=inkFlowPointer.y;
  const dx=x-startX;
  const dy=y-startY;
  const distance=Math.hypot(dx,dy);
  if(distance<10)
    return;

  const steps=Math.ceil(distance/10);
  for(let step=1;step<=steps;step++){
    const progress=step/steps;
    stirInkFlow(startX+dx*progress,startY+dy*progress,vx,vy);
  }
}

function stirInkFlow(x,y,vx,vy,force=false){
  const dx=inkFlowPointer.x===null?Infinity:x-inkFlowPointer.x;
  const dy=inkFlowPointer.y===null?Infinity:y-inkFlowPointer.y;
  if(!force&&Math.hypot(dx,dy)<8)
    return;
  inkFlowPointer.x=x;
  inkFlowPointer.y=y;
  const settings=getEffectSettings("ink");
  const radius=force?rand(15,22):rand(9,14);
  spawnInkDrop(2,x,y,radius,true);
  const drop=inkFlowDrops[inkFlowDrops.length-1];
  drop.vx=clamp(vx*.004,-.2,.2)+rand(-.04,.04);
  drop.vy=rand(.25,.65);
  drop.color=inkRgb(settings.mouseColor);
  if(inkFlowDrops.length>128)
    inkFlowDrops.splice(0,inkFlowDrops.length-128);
}

function inkRgb(hex){
  return [
    parseInt(hex.slice(1,3),16),
    parseInt(hex.slice(3,5),16),
    parseInt(hex.slice(5,7),16)
  ];
}

function inkMixColor(first,second,weight){
  return first.map((channel,index)=>channel*(1-weight)+second[index]*weight);
}

function inkRgba(color,alpha){
  return `rgba(${color.map(channel=>Math.round(channel)).join(",")},${alpha})`;
}

function resetInkPointer(){
  inkFlowPointer.x=null;
  inkFlowPointer.y=null;
}
