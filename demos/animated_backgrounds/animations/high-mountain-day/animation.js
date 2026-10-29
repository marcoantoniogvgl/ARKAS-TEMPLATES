// Cielo, relieve y fauna de la escena de montaña durante su ciclo día/noche.
let meteors = [];

let skyClouds = [];

let sunsetBirds = [];

let sunsetBirdSpawnIn = 0;

let mountainWildlife = [];

let mountainWildlifeSpawnIn = 0;

function buildSky(){
  dayClock=.73;

  stars = Array.from(
    {length:115},
    () => ({

      x:rand(0,W()),

      y:rand(18,H()*.55),

      r:rand(.35,1.5),

      a:rand(.25,.9),

      tw:rand(0,6.28)
    })
  );

  skyClouds = Array.from(
    {length:10},
    () => ({
      x:rand(-.12,1.12),
      y:rand(.22,.5),
      width:rand(.14,.3),
      height:rand(.03,.06),
      speed:rand(.55,1.25),
      alpha:rand(.34,.52)
    })
  );

  meteors = [];
  sunsetBirds=[];
  sunsetBirdSpawnIn=rand(.5,1.2);
  mountainWildlife=[];
  mountainWildlifeSpawnIn=rand(1,3);
}

function drawSunset(time,dt){

  clear();
  const settings=getEffectSettings("sunset");
  const primaryColor=hexToRgb(settings.color);
  const secondaryColor=hexToRgb(settings.secondaryColor);

  dayClock=
    (dayClock+dt*.00016*settings.daySpeed)%1;

  const smoothstep=(a,b,value)=>{
    const t=clamp((value-a)/(b-a),0,1);
    return t*t*(3-2*t);
  };

  const mixColor=(a,b,amount)=>
    a.map((channel,i)=>
      Math.round(channel+(b[i]-channel)*amount)
    );

  const rgba=(color,alpha)=>
    `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;

  // Sunrise is at .25, noon at .5, sunset at .75.
  const solarPhase=(dayClock-.25+1)%1;
  const sunAltitude=Math.sin(solarPhase*Math.PI*2);
  const sunrise=solarPhase<.25||solarPhase>=.75;
  const sunriseProgress=solarPhase<.25
    ? (solarPhase+.25)/.5
    : (solarPhase-.75)/.5;
  const sunriseLight=Math.pow(
    smoothstep(0,1,sunriseProgress),
    2.4
  );
  const daylight=sunrise
    ? sunriseLight
    : smoothstep(-.16,.36,sunAltitude);
  const twilight=
    Math.pow(
      clamp(1-Math.abs(sunAltitude)/.48,0,1),
      1.35
    );
  const warmth=twilight*(.72+.28*(1-daylight));

  const topColor=mixColor(
    [5,10,27],
    [71,145,199],
    daylight
  );
  const middleColor=mixColor(
    [13,22,48],
    [137,190,222],
    daylight
  );
  const horizonDay=mixColor(
    [18,31,59],
    [193,218,230],
    daylight
  );
  const horizonColor=mixColor(
    horizonDay,
    primaryColor,
    warmth
  );
  const lowerColor=mixColor(
    [8,15,34],
    [103,145,180],
    daylight*.72
  );
  const sunX=
    W()*(.5+.465*Math.sin((solarPhase-.25)*Math.PI*2));
  const sunY=
    H()*(.625-sunAltitude*.47);

  const sky=
    ctx.createLinearGradient(
      0,
      0,
      0,
      H()
    );

  sky.addColorStop(
    0,
    rgba(topColor,1)
  );

  sky.addColorStop(
    .42,
    rgba(middleColor,1)
  );

  sky.addColorStop(
    .64,
    rgba(horizonColor,1)
  );

  sky.addColorStop(
    1,
    rgba(lowerColor,1)
  );

  ctx.fillStyle=sky;

  ctx.fillRect(
    0,
    0,
    W(),
    H()
  );

  const horizonGlow=
    ctx.createRadialGradient(
      sunX,
      H()*.64,
      0,
      sunX,
      H()*.64,
      Math.max(W(),H())*.64
    );

  horizonGlow.addColorStop(
    0,
    `rgba(${primaryColor.join(",")},${.14+warmth*.31})`
  );
  horizonGlow.addColorStop(
    .3,
    `rgba(${primaryColor.join(",")},${warmth*.16})`
  );
  horizonGlow.addColorStop(1,`rgba(${primaryColor.join(",")},0)`);

  ctx.fillStyle=horizonGlow;
  ctx.fillRect(0,0,W(),H()*.78);

  drawMountainClouds(time,daylight,warmth,mixColor,rgba);

  const sunOpacity=sunrise
    ? smoothstep(0,1,sunriseProgress)
    : smoothstep(-.1,.035,sunAltitude);
  const sunRadius=Math.min(W(),H())*.047;

  if(sunOpacity>0){
    drawCelestial(
      sunX,
      sunY,
      sunRadius,
      true,
      sunOpacity
    );
  }

  const moonPhase=(dayClock-.75+1)%1;
  const moonAltitude=Math.sin(moonPhase*Math.PI*2);
  const moonOpacity=
    (1-daylight)*
    smoothstep(-.16,.05,moonAltitude);

  if(moonOpacity>.01){
    drawCelestial(
      W()*(.035+clamp(moonPhase/.5,0,1)*.93),
      H()*(.625-Math.max(0,moonAltitude)*.47),
      Math.min(W(),H())*.032,
      false,
      moonOpacity
    );
  }

  stars.forEach(s=>{

    const a=
      s.a*
      Math.pow(1-daylight,2)*.82*
      (
        .7+
        .3*
        Math.sin(
          time*.0015+s.tw
        )
      );

    ctx.beginPath();

    ctx.arc(
      s.x,
      s.y,
      s.r,
      0,
      Math.PI*2
    );

    ctx.fillStyle=
      `rgba(255,242,214,${a})`;

    ctx.fill();
  });

  drawMountainMeteors(dt);

  const distantMountain=mixColor(
    [24,34,61],
    [112,121,143],
    daylight*.65+warmth*.25
  );
  const middleMountain=mixColor(
    [12,20,39],
    [55,69,91],
    daylight*.45+warmth*.18
  );
  const foregroundMountain=mixColor(
    [4,8,19],
    secondaryColor,
    daylight*.26+warmth*.12
  );

  mountainLayer(
    H()*.66,
    rgba(distantMountain,1),
    .1,
    8,
    .96,
    .28
  );

  mountainLayer(
    H()*.74,
    rgba(middleMountain,1),
    .075,
    11,
    .88,
    .5
  );

  mountainLayer(
    H()*.82,
    rgba(foregroundMountain,1),
    .06,
    14,
    .76,
    .75
  );

  ctx.beginPath();
  ctx.moveTo(W()*.76,H()*.82);
  ctx.lineTo(W()*.84,H()*.76);
  ctx.lineTo(W()*.89,H()*.69);
  ctx.lineTo(W()*.93,H()*.57);
  ctx.lineTo(W()*.965,H()*.47);
  ctx.lineTo(W()*1.01,H()*.66);
  ctx.lineTo(W(),H()*.72);
  ctx.lineTo(W(),H());
  ctx.lineTo(W()*.76,H());
  ctx.closePath();
  ctx.fillStyle=rgba(foregroundMountain,1);
  ctx.fill();

  for(
    let row=0;
    row<5;
    row++
  ){
    const spacing=28+row*4;
    const rowBase=H()*(.815+row*.044);
    const treeHeight=H()*(.05+row*.018);
    const rowOffset=(row%2)*spacing*.5;
    for(let x=-spacing+rowOffset,i=0;x<W()+spacing;x+=spacing,i++){
      const height=treeHeight*(.52+.48*(.5+.5*Math.sin(i*2.31+row*1.7)));
      const base=rowBase+H()*.003*Math.sin(i*1.91+row);
      const treeType=(i+row*2)%5;
      if(treeType===0||treeType===3)
        drawBroadleaf(x,base,height,treeType===0);
      else if(treeType===4)
        drawCypress(x,base,height);
      else
        drawPine(x,base,height);
    }
  }

  for(let i=0;i<42;i++){
    const x=W()*(i/41);
    const base=H()*(.813+.002*Math.sin(i*2.1));
    const height=H()*(.009+.006*(.5+.5*Math.sin(i*1.73)));
    drawPine(x,base,height);
  }

  drawSunsetBirds(time,daylight,dt);
  drawMountainWildlife(time,daylight,dt);

}

function drawMountainMeteors(dt){
  ctx.save();
  ctx.beginPath();
  ctx.rect(0,0,W(),H());
  ctx.clip();
  meteors=meteors.filter(m=>{
    m.x+=m.vx*dt;
    m.y+=m.vy*dt;
    m.life-=.007*dt;
    const len=m.len;
    const trail=ctx.createLinearGradient(m.x,m.y,m.x-m.vx*len,m.y-m.vy*len);
    trail.addColorStop(0,`rgba(255,255,255,${m.life})`);
    trail.addColorStop(.2,`hsla(${m.hue},100%,78%,${m.life*.9})`);
    trail.addColorStop(1,"transparent");
    ctx.beginPath();
    ctx.moveTo(m.x,m.y);
    ctx.lineTo(m.x-m.vx*len,m.y-m.vy*len);
    ctx.strokeStyle=trail;
    ctx.lineWidth=m.width;
    ctx.stroke();
    return m.life>0&&m.x>-80&&m.x<W()+80&&m.y<H()+m.len;
  });
  ctx.restore();
}

function drawMountainClouds(time,daylight,warmth,mixColor,rgba){
  skyClouds.forEach(cloud=>{
    const cloudX=
      ((cloud.x+time*cloud.speed*.0000015+1.3)%1.3-.15)*W();
    const cloudY=H()*cloud.y;
    const cloudWidth=W()*cloud.width;
    const cloudHeight=H()*cloud.height;
    const cloudColor=mixColor(
      [151,181,210],
      [255,165,125],
      warmth
    );
    const cloudLight=mixColor(
      [205,221,231],
      [255,228,189],
      warmth
    );
    const cloudShadow=mixColor(
      [48,65,98],
      [146,75,76],
      warmth
    );
    const cloudGradient=ctx.createLinearGradient(
      0,
      cloudY-cloudHeight,
      0,
      cloudY+cloudHeight
    );

    cloudGradient.addColorStop(
      0,
      rgba(cloudLight,cloud.alpha*(.2+daylight*.25+warmth*.3))
    );
    cloudGradient.addColorStop(
      .62,
      rgba(cloudColor,cloud.alpha*(.2+daylight*.35+warmth*.42))
    );
    cloudGradient.addColorStop(
      .86,
      rgba(cloudShadow,cloud.alpha*(.22+warmth*.2))
    );
    cloudGradient.addColorStop(1,"rgba(84,83,112,0)");

    ctx.beginPath();
    ctx.moveTo(cloudX-cloudWidth*.5,cloudY+cloudHeight*.12);
    ctx.bezierCurveTo(
      cloudX-cloudWidth*.38,cloudY-cloudHeight*.1,
      cloudX-cloudWidth*.3,cloudY-cloudHeight*.58,
      cloudX-cloudWidth*.13,cloudY-cloudHeight*.45
    );
    ctx.bezierCurveTo(
      cloudX-cloudWidth*.02,cloudY-cloudHeight*.96,
      cloudX+cloudWidth*.21,cloudY-cloudHeight*.78,
      cloudX+cloudWidth*.24,cloudY-cloudHeight*.35
    );
    ctx.bezierCurveTo(
      cloudX+cloudWidth*.46,cloudY-cloudHeight*.44,
      cloudX+cloudWidth*.49,cloudY-cloudHeight*.02,
      cloudX+cloudWidth*.5,cloudY+cloudHeight*.14
    );
    ctx.closePath();
    ctx.save();
    ctx.filter=`blur(${Math.max(2,H()*.006)}px)`;
    ctx.fillStyle=cloudGradient;
    ctx.fill();
    ctx.restore();
  });
}

function drawCelestial(
  x,
  y,
  r,
  sun,
  intensity
){

  ctx.save();
  ctx.globalAlpha=clamp(intensity,0,1);

  const glowRadius=r*(sun?18:3.4);
  const g=
    ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      glowRadius
    );

  g.addColorStop(
    0,
    sun
      ? "rgba(255,255,246,1)"
      : "rgba(210,225,255,.55)"
  );

  g.addColorStop(
    sun ? .24 : .18,
    sun
      ? "rgba(255,253,238,.62)"
      : "rgba(160,190,255,.18)"
  );

  if(sun){
    g.addColorStop(.52,"rgba(255,250,232,.2)");
    g.addColorStop(.76,"rgba(255,247,230,.055)");
  }

  g.addColorStop(
    1,
    "transparent"
  );

  ctx.fillStyle=g;

  ctx.fillRect(
    x-glowRadius,
    y-glowRadius,
    glowRadius*2,
    glowRadius*2
  );

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    r,
    0,
    Math.PI*2
  );

  if(sun){
    ctx.fillStyle="#fffef5";
  }else{
    const moonGradient=ctx.createRadialGradient(
      x-r*.32,
      y-r*.36,
      r*.04,
      x,
      y,
      r*1.35
    );
    moonGradient.addColorStop(0,"#f4f7ff");
    moonGradient.addColorStop(.7,"#dfe9ff");
    moonGradient.addColorStop(1,"#b9c9e8");
    ctx.fillStyle=moonGradient;
  }

  ctx.fill();

  if(!sun){
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.clip();

    const craters=[
      {x:-.32,y:-.2,r:.18},
      {x:.26,y:-.34,r:.12},
      {x:.38,y:.18,r:.2},
      {x:-.12,y:.38,r:.1},
      {x:-.48,y:.25,r:.075}
    ];

    craters.forEach(crater=>{
      const cx=x+crater.x*r;
      const cy=y+crater.y*r;
      const craterRadius=crater.r*r;
      const craterShade=ctx.createRadialGradient(
        cx-craterRadius*.3,
        cy-craterRadius*.38,
        craterRadius*.04,
        cx,
        cy,
        craterRadius
      );
      craterShade.addColorStop(0,"rgba(120,143,181,.2)");
      craterShade.addColorStop(.72,"rgba(139,157,188,.13)");
      craterShade.addColorStop(1,"rgba(255,255,255,.12)");

      ctx.beginPath();
      ctx.arc(cx,cy,craterRadius,0,Math.PI*2);
      ctx.fillStyle=craterShade;
      ctx.fill();
    });

    ctx.restore();
  }

  ctx.restore();
}

function mountainLayer(
  base,
  color,
  roughness,
  peaks,
  peakScale=1,
  curve=0
){

  ctx.beginPath();

  ctx.moveTo(
    0,
    H()
  );

  ctx.lineTo(
    0,
    base
  );
  const step=
    W()/peaks;

  for(
    let x=0;
    x<=W()+step;
    x+=step
  ){

    const n=x/step;

    const width=
      step*
      (
        .78+
        .22*
        Math.sin(
          n*2.17+
          roughness*10
        )
      );

    const rawPeak=
      base-
      H()*
      (
        .09+
        roughness*.78
      )*
      (
        .48+
        .52*
        Math.abs(
          Math.sin(
            n*1.73+
            roughness*8
          )
        )
      );
    const peak=base-(base-rawPeak)*peakScale;

    const shoulder=
      base+
      H()*.012*
      Math.sin(
        n*2.91+1.4
      );

    const peakX=x+width*.48;
    const rounding=H()*.006+H()*.035*curve;
    ctx.quadraticCurveTo(
      peakX-width*(.08+.18*curve),
      peak-rounding,
      peakX+width*(.08+.18*curve),
      peak+rounding*.4
    );
    ctx.quadraticCurveTo(
      peakX+width*(.22+.13*curve),
      shoulder-H()*(.004+.012*curve),
      x+width,
      shoulder
    );
  }

  ctx.lineTo(
    W(),
    H()
  );

  ctx.closePath();

  ctx.fillStyle=color;

  ctx.fill();
}

function drawPine(
  x,
  base,
  h
){
  const variation=.92+.08*Math.sin(x*1.37);
  const color="rgba(3,7,16,.96)";

  ctx.fillStyle=color;
  ctx.fillRect(x-h*.018,base-h*.12,h*.036,h*.12);

  const silhouette=[
    [0,-1],
    [-.15,-.7],
    [-.06,-.73],
    [-.29,-.43],
    [-.16,-.47],
    [-.46,0],
    [.46,0],
    [.16,-.47],
    [.29,-.43],
    [.06,-.73],
    [.15,-.7]
  ];

  ctx.beginPath();
  silhouette.forEach(([offsetX,offsetY],index)=>{
    const px=x+offsetX*h*variation;
    const py=base+offsetY*h;
    if(index===0)ctx.moveTo(px,py);
    else ctx.lineTo(px,py);
  });
  ctx.closePath();
  ctx.fillStyle=color;
  ctx.fill();
}

function drawSunsetBirds(time,daylight,dt){
  sunsetBirdSpawnIn-=dt/60;
  const night=daylight<=.28;
  const birdLimit=getEffectSettings("sunset").amount;
  if(sunsetBirds.length>birdLimit)
    sunsetBirds.length=birdLimit;
  const hasLargeBird=sunsetBirds.some(bird=>bird.kind==="large");
  if(sunsetBirdSpawnIn<=0){
    if(night){
      if(!hasLargeBird&&sunsetBirds.length<birdLimit){
        sunsetBirds.push({
          kind:"large",
          x:-35,
          y:H()*rand(.64,.78),
          vx:rand(1.05,1.55),
          scale:rand(1.25,1.65),
          phase:rand(0,Math.PI*2),
          direction:1
        });
      }
      sunsetBirdSpawnIn=rand(9,15);
    }else{
      if(!hasLargeBird&&sunsetBirds.length<birdLimit){
        sunsetBirds.push({
          kind:"large",
          x:-35,
          y:H()*rand(.18,.38),
          vx:rand(1.1,1.65),
          scale:rand(.9,1.2),
          phase:rand(0,Math.PI*2),
          direction:1
        });
      }
      const perches=getSunsetBirdPerches();
      if(perches.length){
        const availableSlots=Math.max(0,birdLimit-sunsetBirds.length);
        const count=Math.min(Math.floor(rand(1,3)),availableSlots);
        for(let i=0;i<count;i++){
          const perch=perches[Math.floor(rand(0,perches.length))];
          sunsetBirds.push({
            kind:"small",
            x:perch.x,
            y:perch.y,
            targetX:perch.x,
            targetY:perch.y,
            perchTimer:rand(.5,2.2),
            speed:rand(1.5,2.4),
            scale:rand(.5,.7),
            phase:rand(0,Math.PI*2),
            direction:1,
            exiting:false
          });
        }
      }
      sunsetBirdSpawnIn=rand(2.5,5);
    }
  }

  sunsetBirds=sunsetBirds.filter(bird=>{
    if(bird.kind==="large"){
      bird.x+=bird.vx*dt;
      bird.y+=Math.sin(time*.0011+bird.phase)*.12*dt;
      const wingCycle=time*.006+bird.phase;
      const flap=Math.sin(wingCycle)*4.5+Math.sin(wingCycle*2.15)*.7;
      ctx.save();
      ctx.translate(bird.x,bird.y);
      ctx.scale(bird.direction*bird.scale,bird.scale);
      drawBirdShape(1,flap,"rgba(3,7,16,.96)");
      ctx.restore();
      return bird.x<W()+45;
    }

    bird.perchTimer-=dt/60;
    if(bird.perchTimer<=0&&bird.targetX===bird.x&&bird.targetY===bird.y){
      const perches=getSunsetBirdPerches();
      const options=perches.filter(perch=>Math.abs(perch.x-bird.x)>W()*.035);
      if(Math.random()<.16){
        bird.exiting=true;
        bird.targetX=bird.x<W()*.5?-25:W()+25;
        bird.targetY=bird.y-H()*.04;
      }else if(options.length){
        const perch=options[Math.floor(rand(0,options.length))];
        bird.targetX=perch.x;
        bird.targetY=perch.y;
      }
    }

    const dx=bird.targetX-bird.x;
    const dy=bird.targetY-bird.y;
    const distance=Math.hypot(dx,dy);
    if(distance>1){
      const step=Math.min(distance,bird.speed*dt);
      bird.x+=dx/distance*step;
      bird.y+=dy/distance*step;
      bird.direction=dx<0?-1:1;
    }else if(bird.exiting){
      return false;
    }else{
      bird.x=bird.targetX;
      bird.y=bird.targetY;
      bird.perchTimer=rand(.7,2.4);
    }

    const flying=distance>2;
    const wingCycle=time*(flying ? .009 : .002)+bird.phase;
    const flap=flying
      ? Math.sin(wingCycle)*3.1+Math.sin(wingCycle*2.1)*.5
      : Math.sin(wingCycle)*.4;
    ctx.save();
    ctx.translate(bird.x,bird.y+(flying?Math.sin(time*.002+bird.phase):0));
    ctx.scale(bird.direction*bird.scale,bird.scale);
    drawBirdShape(1,flap,daylight>.28?"rgba(17,23,34,.9)":"rgba(3,7,16,.96)");
    ctx.restore();
    return true;
  });
}

function drawMountainWildlife(time,daylight,dt){
  if(daylight<=.28){
    mountainWildlife=[];
    return;
  }

  mountainWildlifeSpawnIn-=dt/60;
  const wildlifeLimit=getEffectSettings("sunset").wildlife;
  if(mountainWildlife.length>wildlifeLimit)
    mountainWildlife.length=wildlifeLimit;
  if(mountainWildlifeSpawnIn<=0){
    if(mountainWildlife.length<wildlifeLimit){
      const kinds=["deer","fox","rabbit"];
      mountainWildlife.push({
        kind:kinds[Math.floor(rand(0,kinds.length))],
        x:rand(30,Math.max(31,W()-30)),
        y:H()*.945,
        direction:Math.random()<.5?-1:1,
        speed:rand(.12,.32),
        scale:rand(.65,1.05),
        phase:rand(0,Math.PI*2)
      });
    }
    mountainWildlifeSpawnIn=rand(7,13);
  }

  const color="rgba(8,15,24,.96)";
  mountainWildlife=mountainWildlife.filter(animal=>{
    animal.x+=animal.direction*animal.speed*dt;
    const bob=Math.sin(time*.004+animal.phase)*.7;
    const y=animal.y+bob;
    const size=animal.scale;

    ctx.save();
    ctx.translate(animal.x,y);
    ctx.scale(animal.direction*size,size);
    ctx.fillStyle=color;
    ctx.strokeStyle=color;
    ctx.lineWidth=2;
    ctx.lineCap="round";
    ctx.beginPath();
    ctx.ellipse(0,-7,13,6,0,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(11,-12,4.5,0,Math.PI*2);
    ctx.fill();

    if(animal.kind==="deer"){
      ctx.beginPath();
      ctx.moveTo(13,-15);
      ctx.lineTo(15,-23);
      ctx.lineTo(18,-27);
      ctx.moveTo(15,-23);
      ctx.lineTo(12,-27);
      ctx.moveTo(15,-23);
      ctx.lineTo(20,-23);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8,-3);
      ctx.lineTo(-9,0);
      ctx.moveTo(1,-3);
      ctx.lineTo(2,0);
      ctx.moveTo(8,-4);
      ctx.lineTo(9,0);
      ctx.moveTo(12,-9);
      ctx.lineTo(17,-7);
      ctx.stroke();
    }else if(animal.kind==="fox"){
      ctx.beginPath();
      ctx.moveTo(-10,-8);
      ctx.quadraticCurveTo(-21,-18,-24,-7);
      ctx.quadraticCurveTo(-20,-2,-11,-5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(14,-12);
      ctx.lineTo(20,-10);
      ctx.lineTo(14,-8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-7,-3);
      ctx.lineTo(-8,0);
      ctx.moveTo(4,-3);
      ctx.lineTo(5,0);
      ctx.stroke();
    }else{
      ctx.beginPath();
      ctx.ellipse(9,-21,2,6,-.12,0,Math.PI*2);
      ctx.ellipse(13,-20,2,5,.1,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-12,-8,2.5,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();

    return animal.x>-35&&animal.x<W()+35;
  });
}

function getSunsetBirdPerches(){
  const perches=[];
  const spacing=32;
  for(let x=spacing*.5;x<W();x+=spacing){
    const i=Math.round(x/spacing);
    const base=H()*.815+H()*.003*Math.sin(i*1.91);
    const height=H()*.05*(.52+.48*(.5+.5*Math.sin(i*2.31)));
    perches.push({x,y:base-height*.78});
  }
  return perches;
}

function drawBroadleaf(x,base,h,wide){
  const width=h*(wide ? .42 : .34);
  ctx.fillStyle="rgba(3,7,16,.96)";
  ctx.fillRect(x-h*.025,base-h*.3,h*.05,h*.3);
  ctx.beginPath();
  ctx.moveTo(x-width*.13,base-h*.22);
  ctx.bezierCurveTo(
    x-width*.72,base-h*.28,
    x-width*.68,base-h*.84,
    x-width*.2,base-h*.79
  );
  ctx.bezierCurveTo(
    x-width*.05,base-h*1.12,
    x+width*.48,base-h*1.02,
    x+width*.36,base-h*.72
  );
  ctx.bezierCurveTo(
    x+width*.92,base-h*.62,
    x+width*.64,base-h*.25,
    x+width*.13,base-h*.22
  );
  ctx.closePath();
  ctx.fill();
}

function drawCypress(x,base,h){
  ctx.fillStyle="rgba(3,7,16,.96)";
  ctx.beginPath();
  ctx.moveTo(x,base-h);
  ctx.quadraticCurveTo(x-h*.08,base-h*.68,x-h*.12,base-h*.38);
  ctx.quadraticCurveTo(x-h*.16,base-h*.16,x-h*.07,base);
  ctx.lineTo(x+h*.07,base);
  ctx.quadraticCurveTo(x+h*.16,base-h*.16,x+h*.12,base-h*.38);
  ctx.quadraticCurveTo(x+h*.08,base-h*.68,x,base-h);
  ctx.closePath();
  ctx.fill();
}

function launchMeteor(x,y){

  const colors=[
    190,
    270,
    315,
    38,
    155
  ];

  const hue=
    colors[
      Math.floor(
        Math.random()*
        colors.length
      )
    ];

  meteors.push({

    x,
    y:clamp(y,0,H()),

    vx:(Math.random()<.5?-1:1)*rand(2.2,4.2),

    vy:rand(.55,1.15),

    life:1,

    len:rand(34,70),

    width:rand(1,2.3),

    hue
  });
}
