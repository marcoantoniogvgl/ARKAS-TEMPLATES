function buildNetwork(){

  particles = Array.from(
    {length:getEffectSettings("network").amount},
    () => ({
      x:rand(0,W()),
      y:rand(0,H()),

      vx:rand(-.45,.45),
      vy:rand(-.45,.45),

      r:rand(.7,1.8),

      phase:rand(0,Math.PI*2),

      flash:0,
      colorMix:0
    })
  );

}

function mixNetworkColors(first,second,amount){
  const parse=color=>{
    const value=color.replace("#","");
    const full=value.length===3
      ? value.split("").map(channel=>channel+channel).join("")
      : value;
    return [0,2,4].map(offset=>parseInt(full.slice(offset,offset+2),16)||0);
  };
  const a=parse(first);
  const b=parse(second);
  const t=clamp(amount,0,1);
  return `#${a.map((channel,index)=>Math.round(channel+(b[index]-channel)*t).toString(16).padStart(2,"0")).join("")}`;
}

function drawNetwork(time,dt){

  clear();
  const settings=getEffectSettings("network");

  particles.forEach(p=>{

    const dx=
      mouse.x-p.x;

    const dy=
      mouse.y-p.y;

    const d=
      Math.hypot(dx,dy);

    if(
      mouse.active &&
      d<210
    ){

      const f=
        (1-d/210)*.009;

      p.vx +=
        dx/(d||1)*
        f*dt;

      p.vy +=
        dy/(d||1)*
        f*dt;
    }

    p.vx *=
      Math.pow(.993,dt);

    p.vy *=
      Math.pow(.993,dt);

    p.x += p.vx*dt;
    p.y += p.vy*dt;

    if(
      p.x<0 ||
      p.x>W()
    )
      p.vx*=-1;

    if(
      p.y<0 ||
      p.y>H()
    )
      p.vy*=-1;
  });

  const crowdedParticles=new Set();
  const crowdRadiusSquared=settings.crowdRadius*settings.crowdRadius;
  for(let i=0;i<particles.length;i++){
    let nearby=1;
    for(let j=0;j<particles.length;j++){
      if(i===j)
        continue;
      const dx=particles[i].x-particles[j].x;
      const dy=particles[i].y-particles[j].y;
      if(dx*dx+dy*dy<crowdRadiusSquared)
        nearby++;
    }
    if(nearby>3)
      crowdedParticles.add(i);
  }

  const colorResponse=1-Math.exp(-dt*.12);
  particles.forEach((p,index)=>{
    const target=crowdedParticles.has(index)?1:0;
    p.colorMix+=(target-p.colorMix)*colorResponse;
  });

  const connectionDistance=settings.connectionDistance;
  const cellSize=connectionDistance;
  const buckets=new Map();
  const bucketKey=(x,y)=>`${x},${y}`;

  for(let i=0;i<particles.length;i++){
    const p=particles[i];
    const cellX=Math.floor(p.x/cellSize);
    const cellY=Math.floor(p.y/cellSize);
    const key=bucketKey(cellX,cellY);
    const bucket=buckets.get(key);
    if(bucket)
      bucket.push(i);
    else
      buckets.set(key,[i]);
  }

  for(let i=0;i<particles.length;i++){
    const a=particles[i];
    const cellX=Math.floor(a.x/cellSize);
    const cellY=Math.floor(a.y/cellSize);
    const candidates=[];

    for(let offsetY=-1;offsetY<=1;offsetY++){
      for(let offsetX=-1;offsetX<=1;offsetX++){
        const bucket=buckets.get(bucketKey(cellX+offsetX,cellY+offsetY));
        if(bucket)
          for(const j of bucket)
            if(j>i)
              candidates.push(j);
      }
    }

    candidates.sort((left,right)=>left-right);
    for(const j of candidates){
      const b=particles[j];
      const dx=a.x-b.x;
      const dy=a.y-b.y;
      const distanceSquared=dx*dx+dy*dy;

      if(distanceSquared<connectionDistance*connectionDistance){
        const distance=Math.sqrt(distanceSquared);
        let alpha=.16*(1-distance/connectionDistance);
        const midpointX=(a.x+b.x)/2-mouse.x;
        const midpointY=(a.y+b.y)/2-mouse.y;

        if(mouse.active&&midpointX*midpointX+midpointY*midpointY<150*150)
          alpha*=2.6;

        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        const connectionColor=mixNetworkColors(
          settings.color,
          settings.secondaryColor,
          (a.colorMix+b.colorMix)*.5
        );
        ctx.strokeStyle=hexToRgba(connectionColor,alpha);
        ctx.stroke();
      }
    }
  }

  particles.forEach((p,index)=>{
    const color=mixNetworkColors(settings.color,settings.secondaryColor,p.colorMix);

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.r*1.2,
      0,
      Math.PI*2
    );

    ctx.fillStyle=hexToRgba(color,.78);

    ctx.shadowBlur=9;
    ctx.shadowColor=color;

    ctx.fill();

    ctx.shadowBlur=0;
  });
}
