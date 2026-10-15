let bubbles = [];
let bubbleBackdrop = [];

let bubblePopIn = 0;

function getBubbleColorHues(){
  const settings=getEffectSettings("bubbles");
  return [
    hexToHue(settings.color),
    hexToHue(settings.secondaryColor)
  ];
}

function randomBubbleHue(){
  const colors=getBubbleColorHues();
  return colors[Math.floor(rand(0,colors.length))];
}

function buildBubbles(){

  bubbles=[];
  bubbleBackdrop=Array.from({length:17},()=>({
    x:rand(0,W()),
    y:rand(0,H()),
    r:rand(24,76),
    vy:rand(.12,.34),
    drift:rand(-.08,.08),
    hue:rand(185,285),
    alpha:rand(.035,.095)
  }));
  const settings=getEffectSettings("bubbles");
  const initialSizeScale=settings.amount;
  const colors=getBubbleColorHues();

  for(let i=0;i<40;i++){

    let bubble;

    for(let attempt=0;attempt<24;attempt++){

      const r=rand(21,48)*initialSizeScale;
      bubble={
        x:rand(35,W()-35),
        y:rand(-H(),H()),
        r,
        vx:rand(-.28,.28),
        vy:rand(.25,.75)*(30/r),
        rot:rand(0,Math.PI*2),
        spin:rand(-.006,.006),
        hue:colors[i%colors.length],
        wobble:rand(0,Math.PI*2),
        phase:rand(0,6)
      };

      if(
        bubbles.every(other=>
          Math.hypot(
            bubble.x-other.x,
            bubble.y-other.y
          )>bubble.r+other.r+10
        )
      ){
        break;
      }
    }

    bubbles.push(bubble);
  }

  for(let i=0;i<10;i++){
    const r=rand(7,13);
    bubbles.push(spawnBubble(
      rand(r,W()-r),
      rand(-H(),H()),
      r,
      colors[i%colors.length]
    ));
  }
  bubblePopIn=rand(4,8)/settings.popRate;
}

function drawBubbles(time,dt){

  clear();
  drawBubbleBackdrop(dt);

  const settings=getEffectSettings("bubbles");
  bubblePopIn-=dt/60*settings.popRate;
  if(bubblePopIn<=0){
    const candidates=bubbles.filter(b=>b.r>17&&!b.mergeState&&!b.mergeConsumed);
    if(candidates.length){
      const bubble=candidates[Math.floor(rand(0,candidates.length))];
      explodeBubble(bubble);
      bubbles=bubbles.filter(item=>item!==bubble);
    }
    bubblePopIn=rand(4,8)/settings.popRate;
  }

  if(
    bubbles.filter(b=>b.r>15&&!b.mergeConsumed).length<32 &&
    Math.random()<.025*dt
  ){
    const r=rand(17,32);

    bubbles.push(
      spawnBubble(
        rand(24,W()-24),
        -r-rand(10,90),
        r,
        randomBubbleHue()
      )
    );
  }

  bubbles.forEach(b=>{

    if(b.mergeConsumed)
      return;

    if(b.mergeState){
      const merge=b.mergeState;

      if(b===merge.a){
        merge.progress=Math.min(1,merge.progress+dt/24);
        const t=merge.progress*merge.progress*(3-2*merge.progress);

        merge.a.x=merge.startAX+(merge.finalX-merge.startAX)*t;
        merge.a.y=merge.startAY+(merge.finalY-merge.startAY)*t;
        merge.b.x=merge.startBX+(merge.targetBX-merge.startBX)*t;
        merge.b.y=merge.startBY+(merge.targetBY-merge.startBY)*t;
        merge.a.r=merge.startAR+(merge.finalR-merge.startAR)*t;
        merge.b.r=Math.max(.1,merge.startBR*(1-t));

        if(merge.progress>=1){
          merge.a.x=merge.finalX;
          merge.a.y=merge.finalY;
          merge.a.r=merge.finalR;
          merge.a.vx=merge.finalVx;
          merge.a.vy=merge.finalVy;
          merge.a.spin=merge.finalSpin;
          merge.a.mergeState=null;
          merge.b.mergeConsumed=true;
          pulses.push({
            x:merge.finalX,
            y:merge.finalY,
            r:4,
            speed:4,
            a:.7,
            hue:merge.a.hue
          });
        }
      }

      return;
    }

    b.wobble += dt*.0018;

    b.rot += b.spin*dt;

    b.vx +=
      Math.sin(time*.0007+b.phase)
      *.0014*dt;

    b.vy += .0042*(30/b.r)*dt;

    b.vx *= Math.pow(.994,dt);
    b.vy *= Math.pow(.999,dt);

    b.x += b.vx*dt;
    b.y += b.vy*dt;

    if(b.y > H()+b.r+20){

      b.y=-b.r-rand(20,100);
      b.x=rand(0,W());
      b.vy=rand(.25,.75)*(30/b.r);
    }

    if(b.x<-b.r)b.x=W()+b.r;
    if(b.x>W()+b.r)b.x=-b.r;

  });

  for(let i=0;i<bubbles.length;i++){

    const a=bubbles[i];
    if(a.mergeState||a.mergeConsumed)
      continue;

    for(let j=i+1;j<bubbles.length;j++){

      const b=bubbles[j];
      if(b.mergeState||b.mergeConsumed)
        continue;

      const dx=b.x-a.x;
      const dy=b.y-a.y;
      const distance=Math.hypot(dx,dy);

      if(distance<a.r+b.r){

      const survivor=a.r>=b.r ? a : b;
      const absorbed=survivor===a ? b : a;
      const areaA=survivor.r*survivor.r;
      const areaB=absorbed.r*absorbed.r;
      const totalArea=areaA+areaB;
      const survivingHue=survivor.hue;
      const mergeDX=absorbed.x-survivor.x;
      const mergeDY=absorbed.y-survivor.y;
      const mergeDistance=Math.hypot(mergeDX,mergeDY)||1;
      const finalX=(survivor.x*areaA+absorbed.x*areaB)/totalArea;
      const finalY=(survivor.y*areaA+absorbed.y*areaB)/totalArea;
      const finalR=Math.sqrt(totalArea);
      const merge={
        a:survivor,
        b:absorbed,
        progress:0,
        startAX:survivor.x,
        startAY:survivor.y,
        startBX:absorbed.x,
        startBY:absorbed.y,
        startAR:survivor.r,
        startBR:absorbed.r,
        finalX,
        finalY,
        finalR,
        targetBX:finalX+(mergeDX/mergeDistance)*finalR*.72,
        targetBY:finalY+(mergeDY/mergeDistance)*finalR*.72,
        finalVx:(survivor.vx*areaA+absorbed.vx*areaB)/totalArea,
        finalVy:(survivor.vy*areaA+absorbed.vy*areaB)/totalArea,
        finalSpin:(survivor.spin*areaA+absorbed.spin*areaB)/totalArea
      };
      survivor.mergeState=merge;
      absorbed.mergeState=merge;
      survivor.hue=survivingHue;
      break;
      }
    }
  }

  bubbles=bubbles.filter(b=>!b.mergeConsumed);

  bubbles.forEach(b=>{

    const bubbleHue=b.hue;
    const lightX=mouse.active?mouse.x-b.x:-1;
    const lightY=mouse.active?mouse.y-b.y:-1;
    const lightAngle=Math.atan2(lightY,lightX);
    const localLightAngle=lightAngle-b.rot;
    const highlightX=b.x+Math.cos(lightAngle)*b.r*.34;
    const highlightY=b.y+Math.sin(lightAngle)*b.r*.34;
    const grad =
      ctx.createRadialGradient(
        highlightX,
        highlightY,
        b.r*.015,
        b.x,
        b.y,
        b.r*1.05
      );

    grad.addColorStop(0,"rgba(255,255,255,.66)");
    grad.addColorStop(.075,"rgba(255,255,255,.28)");
    grad.addColorStop(.3,`hsla(${bubbleHue},92%,78%,.13)`);
    grad.addColorStop(.68,`hsla(${bubbleHue+16},80%,62%,.075)`);
    grad.addColorStop(.9,"rgba(227,250,255,.19)");
    grad.addColorStop(1,"rgba(255,255,255,0)");

    ctx.beginPath();

    ctx.arc(
      b.x,
      b.y,
      b.r,
      0,
      Math.PI*2
    );

    ctx.fillStyle=grad;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.r*.99,0,Math.PI*2);
    ctx.clip();
    const shade=ctx.createLinearGradient(
      highlightX,highlightY,
      b.x-Math.cos(lightAngle)*b.r*.92,
      b.y-Math.sin(lightAngle)*b.r*.92
    );
    shade.addColorStop(0,"rgba(255,255,255,0)");
    shade.addColorStop(.56,`hsla(${bubbleHue},54%,30%,.035)`);
    shade.addColorStop(1,"rgba(4,15,34,.2)");
    ctx.fillStyle=shade;
    ctx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2);
    const fresnel=ctx.createRadialGradient(b.x,b.y,b.r*.68,b.x,b.y,b.r);
    fresnel.addColorStop(0,"rgba(255,255,255,0)");
    fresnel.addColorStop(.58,`hsla(${bubbleHue+18},88%,79%,.035)`);
    fresnel.addColorStop(.86,"rgba(232,250,255,.14)");
    fresnel.addColorStop(1,`hsla(${bubbleHue},100%,82%,.24)`);
    ctx.fillStyle=fresnel;
    ctx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2);
    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      b.x,
      b.y,
      b.r*.99,
      0,
      Math.PI*2
    );

    ctx.strokeStyle=`hsla(${bubbleHue+8},95%,84%,.34)`;
    ctx.lineWidth=Math.max(.8,b.r*.022);
    ctx.stroke();

    ctx.save();

    ctx.translate(b.x,b.y);
    ctx.rotate(b.rot);

    const specularX=Math.cos(localLightAngle);
    const specularY=Math.sin(localLightAngle);

    ctx.beginPath();

    ctx.ellipse(
      specularX*b.r*.34,
      specularY*b.r*.34,
      b.r*.17,
      b.r*.055,
      localLightAngle-.45,
      0,
      Math.PI*2
    );

    ctx.fillStyle="rgba(255,255,255,.86)";
    ctx.fill();

    ctx.beginPath();

    ctx.ellipse(
      specularX*b.r*.48,
      specularY*b.r*.48,
      b.r*.065,
      b.r*.035,
      localLightAngle-.45,
      0,
      Math.PI*2
    );

    ctx.fillStyle="rgba(255,255,255,.42)";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(
      b.r*.23,
      b.r*.22,
      b.r*.12,
      0,
      Math.PI*2
    );

    ctx.fillStyle="rgba(255,255,255,.09)";
    ctx.fill();

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      b.x,
      b.y,
      b.r*.97,
      0,
      Math.PI*2
    );

    ctx.strokeStyle="rgba(220,245,255,.25)";
    ctx.lineWidth=Math.max(.8,b.r*.018);
    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      b.x,
      b.y,
      b.r*.78,
      lightAngle-.42,
      lightAngle+.2
    );

    ctx.strokeStyle="rgba(255,255,255,.24)";
    ctx.lineWidth=Math.max(.9,b.r*.023);
    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      b.x,
      b.y,
      b.r*.89,
      lightAngle+.55,
      lightAngle+1.05
    );

    ctx.strokeStyle=`hsla(${bubbleHue+35},92%,83%,.24)`;
    ctx.lineWidth=Math.max(.8,b.r*.02);
    ctx.stroke();

  });

  drawSparks(dt);
}

function drawBubbleBackdrop(dt){
  if(!bubbleBackdrop.length)return;
  ctx.save();
  ctx.globalCompositeOperation="screen";
  ctx.filter="blur(15px)";
  bubbleBackdrop.forEach(bubble=>{
    bubble.y+=bubble.vy*dt;
    bubble.x+=bubble.drift*dt;
    if(bubble.y-bubble.r>H()){
      bubble.y=-bubble.r-rand(0,80);
      bubble.x=rand(0,W());
    }
    if(bubble.x<-bubble.r)bubble.x=W()+bubble.r;
    if(bubble.x>W()+bubble.r)bubble.x=-bubble.r;
    const glow=ctx.createRadialGradient(
      bubble.x-bubble.r*.28,bubble.y-bubble.r*.32,0,
      bubble.x,bubble.y,bubble.r
    );
    glow.addColorStop(0,`hsla(${bubble.hue},95%,86%,${bubble.alpha*1.7})`);
    glow.addColorStop(.46,`hsla(${bubble.hue},90%,67%,${bubble.alpha})`);
    glow.addColorStop(.82,`hsla(${bubble.hue},95%,68%,${bubble.alpha*.46})`);
    glow.addColorStop(1,"transparent");
    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(bubble.x,bubble.y,bubble.r,0,Math.PI*2);
    ctx.fill();
  });
  ctx.restore();
}

function explodeBubble(b){

  for(
    let i=0;
    i<24+
      Math.floor(b.r*.35);
    i++
  ){

    const a=
      rand(0,Math.PI*2);

    const speed=
      rand(1.2,5.2)*
      (b.r/35);

    sparks.push({

      x:
        b.x+
        Math.cos(a)*b.r*.35,

      y:
        b.y+
        Math.sin(a)*b.r*.35,

      vx:
        Math.cos(a)*speed,

      vy:
        Math.sin(a)*speed,

      life:
        rand(.6,1),

      width:
        rand(.5,2),

      hue:b.hue
    });
  }

  pulses.push({

    x:b.x,
    y:b.y,

    r:4,

    speed:7,

    a:1,

    spin:0,

    spinV:.01,

    hue:b.hue
  });
}

function spawnBubble(
  x,
  y,
  r,
  hue
){

  r*=getEffectSettings("bubbles").amount;

  return {

    x,
    y,

    r,

    vx:rand(-.45,.45),

    vy:rand(.15,.7)*(30/r),

    rot:rand(0,6),

    spin:rand(-.008,.008),

    hue,

    wobble:rand(0,6),

    phase:rand(0,6)
  };
}
