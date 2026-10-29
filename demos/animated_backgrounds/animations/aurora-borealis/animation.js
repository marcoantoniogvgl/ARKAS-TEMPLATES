let auroraBlobs = [];

let auroraParticles = [];
let auroraFlashes = [];

let auroraCurtainCanvas = document.createElement("canvas");
let auroraCurtainContext = auroraCurtainCanvas.getContext("2d");
let auroraCurtainLastDraw = 0;

function buildAurora(){

  const colors = [
    [65,255,167],
    [54,211,153],
    [34,211,238],
    [139,92,246],
    [236,72,153]
  ];

  auroraBlobs = colors.map((c,i)=>({

    x:W() * (.12 + i*.19),

    y:H() * (
      .2 + ((i*1.37)%1)*.58
    ),

    vx:rand(-.16,.16),
    vy:rand(-.09,.09),

    r:rand(120,230),

    phase:rand(0,6.28),

    c
  }));

  auroraParticles = Array.from(
    {length:getEffectSettings("aurora").amount},
    () => ({
      x:rand(0,W()),
      y:rand(0,H()),
      vx:rand(-.16,.16),
      vy:rand(-.12,.12),
      r:rand(.7,2.2),
      phase:rand(0,Math.PI*2),
      hue:rand(0,360)
    })
  );
  auroraFlashes=[];
}

function auroraHueAt(x,time=performance.now()){
  const hues=[146,157,174,258,322];
  const phase=(((x/Math.max(1,W())+time*.000035)%1+1)%1)*hues.length;
  const index=Math.floor(phase);
  const next=(index+1)%hues.length;
  return hues[index]+(hues[next]-hues[index])*(phase-index);
}

function createAuroraFlash(x,y){
  auroraFlashes.push({x,y,hue:auroraHueAt(x),age:0});
}

function drawAuroraFlashes(dt){
  auroraFlashes=auroraFlashes.filter(flash=>{
    flash.age+=dt;
    const progress=flash.age/240;
    if(progress>=1)return false;
    const pulsePosition=progress*3;
    const pulseIndex=Math.floor(pulsePosition);
    const pulsePhase=pulsePosition-pulseIndex;
    const pulse=(1-Math.cos((pulsePhase+.08)*Math.PI*2))*.5;
    const pulseFade=Math.pow(.7,pulseIndex);
    const radius=74*pulse*pulseFade;
    const alpha=Math.pow(1-progress,1.15)*(.2+.8*pulse)*pulseFade;
    const color=`hsla(${flash.hue},100%,72%,`;
    const glow=ctx.createRadialGradient(flash.x,flash.y,0,flash.x,flash.y,radius);
    glow.addColorStop(0,color+`${alpha*.26})`);
    glow.addColorStop(.42,color+`${alpha*.13})`);
    glow.addColorStop(1,"transparent");
    ctx.fillStyle=glow;
    ctx.fillRect(flash.x-radius,flash.y-radius,radius*2,radius*2);
    return true;
  });
}

function drawAurora(time,dt){

  clear();

  const x = mouse.active ? mouse.x : W()*.5;
  const y = mouse.active ? mouse.y : H()*.5;
  const pointerHue=auroraHueAt(x,time);
  cursorRing.style.setProperty("--aurora-cursor-color",`hsl(${pointerHue},100%,72%)`);

  auroraBlobs.forEach((b,i)=>{

    const dx=x-b.x;
    const dy=y-b.y;
    const d=Math.hypot(dx,dy);

    if(mouse.active && d<Math.max(W(),H())*.48){

      const force =
        (1-d/(Math.max(W(),H())*.48))*.0065;

      b.vx += dx/(d||1)*force*dt;
      b.vy += dy/(d||1)*force*dt;
    }

    b.vx *= Math.pow(.994,dt);
    b.vy *= Math.pow(.994,dt);

    b.vx +=
      Math.sin(time*.00035+b.phase)*.0015*dt;

    b.vy +=
      Math.cos(time*.00042+b.phase)*.0012*dt;

    b.x += b.vx*dt;
    b.y += b.vy*dt;

    if(b.x<-b.r)b.x=W()+b.r;
    if(b.x>W()+b.r)b.x=-b.r;

    if(b.y<-b.r)b.y=H()+b.r;
    if(b.y>H()+b.r)b.y=-b.r;

    const g =
      ctx.createRadialGradient(
        b.x,
        b.y,
        0,
        b.x,
        b.y,
        b.r
      );

    const [r,gc,bc]=b.c;

    g.addColorStop(
      0,
      `rgba(${r},${gc},${bc},.24)`
    );

    g.addColorStop(
      .35,
      `rgba(${r},${gc},${bc},.11)`
    );

    g.addColorStop(
      1,
      "transparent"
    );

    ctx.fillStyle=g;

    ctx.fillRect(
      b.x-b.r,
      b.y-b.r,
      b.r*2,
      b.r*2
    );
  });

  drawAuroraCurtains(time);

  auroraParticles.forEach(p=>{
    p.x+=p.vx*dt;
    p.y+=p.vy*dt+
      Math.sin(time*.001+p.phase)*.08*dt;

    if(p.x<0)p.x=W();
    if(p.x>W())p.x=0;
    if(p.y<0)p.y=H();
    if(p.y>H())p.y=0;

    const alpha=.35+.45*Math.sin(time*.0018+p.phase);
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`hsla(${p.hue},100%,78%,${alpha})`;
    ctx.shadowBlur=8;
    ctx.shadowColor=`hsla(${p.hue},100%,65%,.8)`;
    ctx.fill();
    ctx.shadowBlur=0;
  });

  if(mouse.active){

    const g =
      ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        130
      );

    g.addColorStop(
      0,
      `hsla(${pointerHue},100%,72%,.34)`
    );

    g.addColorStop(
      .22,
      `hsla(${pointerHue},100%,68%,.17)`
    );

    g.addColorStop(
      1,
      "transparent"
    );

    ctx.fillStyle=g;

    ctx.fillRect(
      mouse.x-140,
      mouse.y-140,
      280,
      280
    );
  }

  drawAuroraFlashes(dt);
}

function drawAuroraCurtains(time){
  const colors=[
    [72,255,168],
    [74,226,221],
    [112,147,255],
    [203,99,255]
  ];
  const width=canvas.width;
  const height=canvas.height;
  const renderScale=.65;
  const now=performance.now();
  const needsResize=
    auroraCurtainCanvas.width!==Math.round(width*renderScale)||
    auroraCurtainCanvas.height!==Math.round(height*renderScale);

  if(needsResize){
    auroraCurtainCanvas.width=Math.round(width*renderScale);
    auroraCurtainCanvas.height=Math.round(height*renderScale);
    auroraCurtainContext.setTransform(dpr*renderScale,0,0,dpr*renderScale,0,0);
    auroraCurtainLastDraw=0;
  }

  if(now-auroraCurtainLastDraw>=1000/30||auroraCurtainLastDraw===0){
    auroraCurtainContext.clearRect(0,0,W(),H());
    auroraCurtainContext.save();
    auroraCurtainContext.globalCompositeOperation="screen";
    auroraCurtainContext.lineCap="round";

    auroraCurtainContext.filter=`blur(${Math.max(10,H()*.02)}px)`;
    for(let i=0;i<9;i++){
      const phase=time*.00018+i*1.71;
      const center=W()*(.04+i*.115)+Math.sin(phase)*W()*.035;
      const top=H()*(.015+(i%3)*.025);
      const bottom=H()*(.68+.29*(.5+.5*Math.sin(i*1.43+phase)));
      const width=W()*(.07+.065*(.5+.5*Math.sin(i*1.9)))*
        getEffectSettings("aurora").width;
      const color=colors[i%colors.length];
      const fade=.12+.88*(.5+.5*Math.sin(time*.00031+i*2.37));
      const alpha=(.13+.1*(.5+.5*Math.sin(phase*1.7)))*fade;
      const gradient=auroraCurtainContext.createLinearGradient(center,top,center,bottom);
      gradient.addColorStop(0,`rgba(${color[0]},${color[1]},${color[2]},0)`);
      gradient.addColorStop(.18,`rgba(${color[0]},${color[1]},${color[2]},${alpha})`);
      gradient.addColorStop(.76,`rgba(${color[0]},${color[1]},${color[2]},${alpha*.82})`);
      gradient.addColorStop(1,`rgba(${color[0]},${color[1]},${color[2]},0)`);

      const ribbonCenter=t=>
        center+
        Math.sin(t*6+phase)*width*.52+
        Math.sin(t*11+phase*1.4)*width*.18;
      const ribbonHalfWidth=t=>
        width*.42*(1+.22*Math.sin(t*14+phase));
      const segments=32;

      auroraCurtainContext.beginPath();
      for(let segment=0;segment<=segments;segment++){
        const t=segment/segments;
        const x=ribbonCenter(t)-ribbonHalfWidth(t);
        const y=top+(bottom-top)*t;
        if(segment===0)auroraCurtainContext.moveTo(x,y);
        else auroraCurtainContext.lineTo(x,y);
      }
      for(let segment=segments;segment>=0;segment--){
        const t=segment/segments;
        auroraCurtainContext.lineTo(
          ribbonCenter(t)+ribbonHalfWidth(t),
          top+(bottom-top)*t
        );
      }
      auroraCurtainContext.closePath();
      auroraCurtainContext.fillStyle=gradient;
      auroraCurtainContext.shadowBlur=42;
      auroraCurtainContext.shadowColor=`rgba(${color[0]},${color[1]},${color[2]},.32)`;
      auroraCurtainContext.fill();

      auroraCurtainContext.beginPath();
      for(let segment=0;segment<=segments;segment++){
        const t=segment/segments;
        const x=ribbonCenter(t);
        const y=top+(bottom-top)*t;
        if(segment===0)auroraCurtainContext.moveTo(x,y);
        else auroraCurtainContext.lineTo(x,y);
      }
      auroraCurtainContext.strokeStyle=`rgba(${color[0]},${color[1]},${color[2]},.12)`;
      auroraCurtainContext.lineWidth=width*.12;
      auroraCurtainContext.shadowBlur=24;
      auroraCurtainContext.stroke();
    }
    auroraCurtainContext.restore();
    auroraCurtainLastDraw=now;
  }

  ctx.save();
  ctx.globalCompositeOperation="screen";
  ctx.drawImage(
    auroraCurtainCanvas,
    0,0,auroraCurtainCanvas.width,auroraCurtainCanvas.height,
    0,0,W(),H()
  );
  ctx.restore();
}
