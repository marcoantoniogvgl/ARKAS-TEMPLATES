let waves = [];

let rain = [];

let lightning = [];

let rainClouds = [];

let waterGlints = [];

let gulls = [];

let gullSpawnIn = 0;

function buildRain(){

  rain = Array.from(
    {length:getEffectSettings("waves").amount},
    () => ({

      x:rand(0,W()),

      y:rand(-H()*.14,H()*.72),

      vy:rand(1.1,2.2),

      len:rand(3,8),

      alpha:rand(.1,.26),

      depth:rand(.45,1)
    })
  );

  waterGlints=Array.from(
    {length:18},
    () => ({
      x:rand(0,W()),
      y:rand(H()*.55,H()*.91),
      size:rand(.7,2),
      alpha:rand(.12,.38),
      phase:rand(0,Math.PI*2),
      drift:rand(-.12,.12)
    })
  );

  rainClouds=Array.from(
    {length:26},
    () => ({
      x:rand(-.12,1.12),
      y:rand(.12,.76),
      width:rand(.075,.2),
      height:rand(.025,.065),
      speed:rand(.00012,.00035),
      alpha:rand(.28,.5)
    })
  );

  waves = [];
  lightning = [];
  gulls=[];
  gullSpawnIn=rand(4,9);
}

function drawWaves(time,dt){

  clear();
  const settings=getEffectSettings("waves");
  const secondary=hexToRgb(settings.secondaryColor);

  const horizon=H()*.50;
  const floor=H()*.99;

  const colorWash=ctx.createLinearGradient(0,0,0,H());
  colorWash.addColorStop(0,`rgba(${secondary.join(",")},.025)`);
  colorWash.addColorStop(.5,`rgba(${secondary.join(",")},.035)`);
  colorWash.addColorStop(1,`rgba(${secondary.join(",")},.045)`);
  ctx.fillStyle=colorWash;
  ctx.fillRect(0,0,W(),H());

  // Floor plane.
  const water=
    ctx.createLinearGradient(
      0,
      horizon,
      0,
      H()
    );

  water.addColorStop(0,`rgba(${secondary.join(",")},.075)`);

  water.addColorStop(
    .45,
    `rgba(${secondary.join(",")},.105)`
  );

  water.addColorStop(
    1,
    `rgba(${secondary.join(",")},.14)`
  );

  ctx.fillStyle=water;

  ctx.fillRect(
    0,
    horizon,
    W(),
    H()-horizon
  );

  ctx.strokeStyle=
    "rgba(102,219,255,.045)";

  ctx.lineWidth=1;

  ctx.beginPath();

  ctx.moveTo(
    0,
    horizon
  );

  ctx.lineTo(
    W(),
    horizon
  );

  ctx.stroke();

  const horizonGlow=ctx.createLinearGradient(
    0,
    horizon,
    0,
    H()*.7
  );

  horizonGlow.addColorStop(0,"rgba(108,211,242,.09)");
  horizonGlow.addColorStop(1,"rgba(108,211,242,0)");
  ctx.fillStyle=horizonGlow;
  ctx.fillRect(0,horizon,W(),H()*.2);

  drawRainClouds(time,horizon,dt);
  drawGulls(time,dt);

  rain.forEach(drop=>{

    const perspective=
      clamp(
        (drop.y-horizon)/(floor-horizon),
        0,
        1
      );

    drop.x+=settings.wind*perspective*.7*dt;
    drop.y+=drop.vy*(.7+perspective*1.5)*dt;

    if(drop.y>floor){

      if(Math.random()<.42){
        const impactY=horizon+rand(.1,.85)*(floor-horizon);
        createWave(
          drop.x,
          impactY,
          rand(.035,.075),
          true,
          perspective
        );
      }

      drop.y=rand(-H()*.18,-drop.len);
      drop.x=rand(0,W());
      drop.depth=rand(.35,1);
    }

    const distanceScale=.16+perspective*.84;
    const len=drop.len*distanceScale*(.5+perspective*1.1)*settings.dropSize;
    const alpha=drop.alpha*(.25+perspective*.75);
    const lean=settings.wind*len*(.1+perspective*.34);

    ctx.beginPath();
    ctx.moveTo(drop.x,drop.y);
    ctx.lineTo(drop.x-lean,drop.y-len);
    ctx.strokeStyle=`rgba(151,221,255,${alpha})`;
    ctx.lineWidth=.2+perspective*.65;
    ctx.stroke();
  });

  waterGlints.forEach(glint=>{

    glint.x+=glint.drift*dt;

    if(glint.x<0)glint.x=W();
    if(glint.x>W())glint.x=0;

    const shimmer=
      glint.alpha*
      (.55+.45*Math.sin(time*.0018+glint.phase));

    ctx.beginPath();
    ctx.ellipse(
      glint.x,
      glint.y,
      glint.size*(1.2+.5*Math.sin(time*.001+glint.phase)),
      glint.size*.42,
      0,
      0,
      Math.PI*2
    );
    ctx.fillStyle=`rgba(177,237,255,${shimmer})`;
    ctx.shadowBlur=8;
    ctx.shadowColor="rgba(93,208,255,.55)";
    ctx.fill();
    ctx.shadowBlur=0;
  });

  ctx.save();
  ctx.beginPath();
  ctx.rect(0,horizon,W(),H()-horizon);
  ctx.clip();

  waves=waves.filter(w=>{

    w.r +=
      w.speed*
      dt*.42*
      (.75+w.depth*.65);

    w.energy *=
      Math.pow(.9992,dt);

    let interference=0;

    for(const other of waves){

      if(other===w)
        continue;

      const d=
        Math.hypot(
          w.x-other.x,
          w.y-other.y
        );

      if(d<72){

        interference +=
          Math.cos(d*.08)*
          other.energy*
          (1-d/72)*
          .12;
      }
    }

    const a=
      clamp(
        w.energy*
        (.72+interference),
        0,
        .42
      );

    const ry=
      w.r*
      (.08+.12*w.depth);

    ctx.beginPath();
    const points=72;
    for(let i=0;i<=points;i++){
      const angle=i/points*Math.PI*2;
      const uneven=1+
        .009*Math.sin(angle*3+w.phase+time*.00045)+
        .004*Math.sin(angle*7-w.phase*.7+time*.00025);
      const px=w.x+Math.cos(angle)*w.r*uneven;
      const py=w.y+Math.sin(angle)*ry*uneven;
      if(i===0)ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    }
    ctx.closePath();

    ctx.strokeStyle=
      `rgba(112,225,255,${a})`;

    ctx.lineWidth=
      .7+
      Math.max(0,interference)*.8;

    ctx.stroke();

    ctx.beginPath();
    for(let i=0;i<=points;i++){
      const angle=i/points*Math.PI*2;
      const uneven=1+
        .007*Math.sin(angle*4+w.phase+time*.00045);
      const px=w.x+Math.cos(angle)*w.r*.69*uneven;
      const py=w.y+Math.sin(angle)*ry*.5*uneven;
      if(i===0)ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    }
    ctx.closePath();

    ctx.strokeStyle=
      `rgba(182,210,255,${a*.16})`;

    ctx.stroke();

    return (
      w.r<
      (w.maxRadius||Math.max(W(),H())*1.05)
      &&
      w.energy>.018
    );
  });
  ctx.restore();

  lightning=lightning.filter(l=>{

    l.life-=.035*dt;

    ctx.save();

    ctx.globalAlpha=
      Math.max(0,l.life);

    ctx.strokeStyle=
      "rgba(210,245,255,.95)";

    ctx.shadowBlur=25;
    ctx.shadowColor="#8be9ff";

    ctx.lineWidth=
      .8+
      Math.random()*.7;

    ctx.beginPath();

    ctx.moveTo(
      l.x,
      l.y
    );

    l.points.forEach(
      p=>ctx.lineTo(p.x,p.y)
    );

    ctx.stroke();

    ctx.restore();

    return l.life>0;
  });

  drawRainBoat(time,horizon);
}

function drawRainClouds(time,horizon,dt){

  rainClouds.forEach((cloud,index)=>{
    cloud.x+=cloud.speed*dt;
    if(cloud.x>1.18)cloud.x=-.18;

    const x=W()*(
      cloud.x+
      .008*Math.sin(time*.00012+index)
    );
    const y=horizon*cloud.y;
    const width=W()*cloud.width;
    const height=H()*cloud.height;
    const shade=ctx.createLinearGradient(0,y-height,0,y+height*.35);
    shade.addColorStop(0,`rgba(105,132,154,${cloud.alpha*.85})`);
    shade.addColorStop(.62,`rgba(37,58,79,${cloud.alpha+ .12})`);
    shade.addColorStop(1,"rgba(13,29,46,0)");

    ctx.beginPath();
    ctx.ellipse(x-width*.34,y+height*.08,width*.25,height*.34,0,0,Math.PI*2);
    ctx.ellipse(x-width*.17,y-height*.03,width*.27,height*.5,0,0,Math.PI*2);
    ctx.ellipse(x+width*.04,y-height*.14,width*.31,height*.65,0,0,Math.PI*2);
    ctx.ellipse(x+width*.28,y-height*.02,width*.29,height*.48,0,0,Math.PI*2);
    ctx.ellipse(x+width*.43,y+height*.1,width*.2,height*.3,0,0,Math.PI*2);
    ctx.fillStyle=shade;
    ctx.fill();
  });
}

function drawGulls(time,dt){
  gullSpawnIn-=dt/60;
  if(gullSpawnIn<=0){
    const count=Math.floor(rand(1,4));
    for(let i=0;i<count;i++){
      gulls.push({
        x:-25-i*rand(8,20),
        y:H()*rand(.14,.4),
        originY:0,
        vx:rand(1.15,1.8),
        vy:rand(-.12,.12),
        scale:rand(.65,1.35),
        phase:rand(0,Math.PI*2),
        turn:rand(.75,1.4)
      });
      gulls[gulls.length-1].originY=gulls[gulls.length-1].y;
    }
    gullSpawnIn=rand(8,17);
  }

  gulls=gulls.filter(gull=>{
    const targetY=gull.originY+Math.sin(time*.00055+gull.phase)*H()*.018;
    gull.x+=gull.vx*dt;
    gull.vy+=(targetY-gull.y)*.0018*dt-gull.vy*.045*dt;
    gull.y+=gull.vy*dt;
    const y=gull.y+Math.sin(time*.001+gull.phase)*3;
    const bank=clamp(gull.vy*.65,-.25,.25);
    const wingCycle=time*.006*gull.turn+gull.phase;
    const flap=Math.sin(wingCycle)*3.2+Math.sin(wingCycle*2.1)*.55;
    ctx.save();
    ctx.translate(gull.x,y);
    ctx.rotate(bank);
    ctx.scale(gull.scale,gull.scale);
    drawBirdShape(1,flap,"rgba(12,25,39,.78)");
    ctx.restore();
    return gull.x<W()+30;
  });
}

function drawRainBoat(time,horizon){

  const settings=getEffectSettings("waves");
  const x=W()*.82;
  const baseY=horizon+H()*.1;
  const waterline=baseY+Math.sin(time*.0012)*1.5;
  const scale=clamp(W()/1000,.58,1);

  ctx.save();
  ctx.translate(x,waterline);
  ctx.scale(scale,scale);
  ctx.rotate(Math.sin(time*.0011)*.025+settings.wind*.035);
  const primary=hexToRgb(settings.color);
  const secondary=hexToRgb(settings.secondaryColor);

  ctx.save();
  ctx.globalAlpha=.28;
  ctx.strokeStyle=`rgba(${secondary.join(",")},.55)`;
  ctx.lineWidth=1.2;
  for(let i=0;i<3;i++){
    ctx.beginPath();
    ctx.moveTo(-25+i*5,14+i*3);
    ctx.quadraticCurveTo(-8+i*8,16+i*3,25-i*4,14+i*3);
    ctx.stroke();
  }
  ctx.restore();

  const hullGradient=ctx.createLinearGradient(0,0,0,13);
  hullGradient.addColorStop(0,"#b86e4e");
  hullGradient.addColorStop(.3,"#533846");
  hullGradient.addColorStop(1,"#182535");
  ctx.fillStyle=hullGradient;
  ctx.strokeStyle="rgba(255,207,153,.8)";
  ctx.lineWidth=1.25;
  ctx.beginPath();
  ctx.moveTo(-39,-1);
  ctx.quadraticCurveTo(-31,5,-24,8);
  ctx.lineTo(22,8);
  ctx.quadraticCurveTo(31,5,39,-1);
  ctx.quadraticCurveTo(20,3,0,2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle="rgba(255,225,184,.52)";
  ctx.lineWidth=.8;
  ctx.beginPath();
  ctx.moveTo(-26,6);
  ctx.quadraticCurveTo(0,10,27,5);
  ctx.stroke();

  ctx.fillStyle="rgba(12,20,33,.92)";
  ctx.beginPath();
  ctx.moveTo(-12,1);
  ctx.lineTo(13,1);
  ctx.lineTo(10,-7);
  ctx.lineTo(-8,-7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle="rgba(255,190,113,.92)";
  ctx.fillRect(-6,-5,4,3);
  ctx.fillRect(2,-5,4,3);

  ctx.strokeStyle="rgba(230,239,237,.86)";
  ctx.lineWidth=1.7;
  ctx.beginPath();
  ctx.moveTo(-2,-39);
  ctx.lineTo(-2,2);
  ctx.stroke();

  const sailGradient=ctx.createLinearGradient(-23,-30,4,-5);
  sailGradient.addColorStop(0,`rgba(${primary.join(",")},.96)`);
  sailGradient.addColorStop(1,`rgba(${primary.join(",")},.7)`);
  ctx.fillStyle=sailGradient;
  ctx.beginPath();
  ctx.moveTo(-4,-34);
  ctx.quadraticCurveTo(-14,-30,-25,-7);
  ctx.lineTo(-4,-7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle="rgba(29,63,78,.65)";
  ctx.lineWidth=.9;
  ctx.stroke();

  const smallSailGradient=ctx.createLinearGradient(0,-28,20,-8);
  smallSailGradient.addColorStop(0,`rgba(${primary.join(",")},.76)`);
  smallSailGradient.addColorStop(1,`rgba(${primary.join(",")},.96)`);
  ctx.fillStyle=smallSailGradient;
  ctx.beginPath();
  ctx.moveTo(0,-28);
  ctx.quadraticCurveTo(10,-26,20,-8);
  ctx.lineTo(0,-8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle="rgba(29,63,78,.65)";
  ctx.stroke();

  ctx.strokeStyle="rgba(206,222,226,.42)";
  ctx.lineWidth=.7;
  ctx.beginPath();
  ctx.moveTo(-2,-37);
  ctx.lineTo(21,-7);
  ctx.moveTo(-2,-35);
  ctx.lineTo(-25,-7);
  ctx.stroke();

  ctx.fillStyle="#ffe3a4";
  ctx.shadowBlur=10;
  ctx.shadowColor="#ffc76f";
  ctx.beginPath();
  ctx.arc(-14,-2,1.5,0,Math.PI*2);
  ctx.fill();
  ctx.shadowBlur=0;

  ctx.restore();
}

function createWave(
  x,
  y,
  power=.8,
  ambient=false,
  depth=1
){

  waves.push({

    x,
    y,

    r:ambient?1:3,

    speed:
      ambient
      ? rand(.55,.9)
        : rand(.65,.95)*power,

    energy:
      ambient
      ? rand(.07,.14)*(.35+.65*clamp(depth,0,1))
      : power*.42,

    depth:
      clamp(depth,.25,1),
    phase:rand(0,Math.PI*2),
    maxRadius:ambient
      ? rand(8,18)*(.35+.65*clamp(depth,0,1))
      : undefined
  });
}

function createLightning(x,y){
  const targetY=H()*.51;
  const segmentCount=Math.max(6,Math.ceil((targetY-y)/22));
  const pts=[];
  let px=x;

  for(let i=1;i<=segmentCount;i++){
    px+=rand(-21,21);
    pts.push({
      x:px,
      y:y+(targetY-y)*i/segmentCount
    });
  }

  lightning.push({
    x,
    y,
    points:pts,
    life:1
  });
}
