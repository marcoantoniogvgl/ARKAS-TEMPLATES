// Entidades y partículas que componen el ecosistema submarino.
let oceanLife = [];
let oceanFish = [];
let oceanRays = [];
let oceanPulses = [];
let oceanCreatures = [];
let oceanLargeVisitors = [];
let oceanLargeSpawnIn = 0;
let oceanBubbles=[];

function buildDeepOcean(){
  const settings=getEffectSettings("ocean");
  oceanLife=Array.from({length:settings.amount},()=>({
    x:rand(0,W()),
    y:rand(0,H()),
    radius:rand(.6,2.4),
    drift:rand(-.16,.16),
    rise:rand(.12,.55),
    phase:rand(0,Math.PI*2)
  }));
  oceanFish=Array.from({length:settings.fish},(_,index)=>({
    x:rand(-W()*.2,W()*1.2),
    y:H()*(.16+(index%7)*.085+Math.floor(index/7)*.04),
    homeY:H()*(.16+(index%7)*.085+Math.floor(index/7)*.04),
    speed:rand(.25,.72),
    size:index%8===4?rand(.9,1.15):rand(.58,1.16),
    direction:Math.random()<.5?-1:1,
    phase:rand(0,Math.PI*2),
    school:index%4,
    hue:(hexToHue(settings.color)+(index*53)+(index%3)*17)%360,
    species:["angelfish","striped","reef","clownfish","butterfly","lionfish","parrotfish","tang","moorish","nautilus","pufferfish","triggerfish"][index%12],
    tailPhase:rand(0,Math.PI*2),
    swimPhase:rand(0,Math.PI*2),
    fleeTimer:0,
    fleeY:0
  }));
  oceanCreatures=Array.from({length:14},(_,index)=>{
    const type=["crab","lobster","starfish","crab","urchin","turtle","shrimp","crab","lobster","eel","eel","urchin","moray","moray"][index];
    const groundDweller=["crab","lobster","starfish","urchin","shrimp"].includes(type);
    const x=rand(W()*.08,W()*.92);
    return {
    type,
    x,
    y:groundDweller?oceanFloorY(x)
      :type==="eel"||type==="moray"?H()*rand(.48,.76)
      :type==="turtle"?H()*rand(.46,.68)
      :H()*(.38+index*.05),
    speed:type==="starfish"?rand(.008,.02)
      :groundDweller?rand(.08,.18)
      :type==="eel"?rand(.16,.27)
      :type==="moray"?rand(.12,.21)
      :type==="starfish"||type==="urchin"?rand(.015,.035)
      :rand(.12,.3),
    direction:Math.random()<.5?-1:1,
    size:type==="turtle"?rand(1.35,1.65):rand(.82,1.16),
    phase:rand(0,Math.PI*2),
    rotationSpeed:type==="urchin"?rand(.00035,.00065):0,
    hue:index%2?hexToHue(settings.color):hexToHue(settings.secondaryColor),
    groundDweller,
    fleeTimer:0
  };});
  oceanLargeVisitors=[];
  oceanLargeSpawnIn=rand(220,380);
  oceanRays=Array.from({length:8},(_,index)=>({
    x:W()*(.04+index*.13),
    width:rand(22,76),
    phase:rand(0,Math.PI*2)
  }));
  oceanPulses=[];
  oceanBubbles=Array.from({length:42},()=>({
    x:rand(0,W()),
    y:rand(0,H()),
    radius:rand(1,5),
    rise:rand(.18,.7),
    drift:rand(-.12,.12),
    phase:rand(0,Math.PI*2)
  }));
}

function oceanFloorY(x){
  x=clamp(x,0,W());
  const split=W()*.42;
  const t=x<=split?x/split:(x-split)/(W()-split);
  const start=x<=split?H()*.89:H()*.90;
  const control=x<=split?H()*.81:H()*.98;
  const end=x<=split?H()*.90:H()*.855;
  return (1-t)*(1-t)*start+2*(1-t)*t*control+t*t*end;
}

function drawDeepOcean(time,dt){
  clear();
  const settings=getEffectSettings("ocean");
  const primary=hexToRgb(settings.color);
  const secondary=hexToRgb(settings.secondaryColor);
  const background=ctx.createLinearGradient(0,0,0,H());
  background.addColorStop(0,"#082a48");
  background.addColorStop(.35,"#061b37");
  background.addColorStop(1,"#020711");
  ctx.fillStyle=background;
  ctx.fillRect(0,0,W(),H());

  drawOceanAtmosphere(time,primary,secondary);

  oceanRays.forEach((ray,index)=>{
    const x=ray.x+Math.sin(time*.00016+ray.phase)*W()*.025;
    const rayGradient=ctx.createLinearGradient(x,0,x+ray.width,H()*.79);
    rayGradient.addColorStop(0,`rgba(${secondary.join(",")},${.07*settings.intensity})`);
    rayGradient.addColorStop(1,`rgba(${primary.join(",")},0)`);
    ctx.beginPath();
    ctx.moveTo(x-ray.width*.15,0);
    ctx.lineTo(x+ray.width*.15,0);
    ctx.lineTo(x+ray.width*1.25,H()*.8);
    ctx.lineTo(x-ray.width*.65,H()*.8);
    ctx.closePath();
    ctx.fillStyle=rayGradient;
    ctx.fill();
  });

  drawOceanAnchor(time);
  drawOceanShipwreck(time);

  const floorY=H()*.89;
  const floor=ctx.createLinearGradient(0,floorY,0,H());
  floor.addColorStop(0,"#102c38");
  floor.addColorStop(1,"#061018");
  ctx.fillStyle=floor;
  ctx.beginPath();
  ctx.moveTo(0,floorY);
  ctx.quadraticCurveTo(W()*.21,floorY-H()*.08,W()*.42,floorY+H()*.01);
  ctx.quadraticCurveTo(W()*.72,floorY+H()*.09,W(),floorY-H()*.035);
  ctx.lineTo(W(),H());
  ctx.lineTo(0,H());
  ctx.closePath();
  ctx.fill();

  for(let coral=0;coral<13;coral++){
    const x=W()*(.025+coral*.079);
    const base=H()*(.97-.025*Math.sin(coral*2));
    const height=H()*(.085+.09*(.5+.5*Math.sin(coral*3.1)));
    drawOceanCoral(time,x,base,height,coral,primary,secondary);
  }
  drawOceanKelp(time);
  drawOceanReefAccents(time);

  // El desplazamiento de cola y las aletas dan impulso sin convertir el fondo en un torbellino.
  oceanFish.forEach((fish,index)=>{
    if(fish.fleeTimer>0){
      fish.fleeTimer=Math.max(0,fish.fleeTimer-dt);
      fish.y=clamp(fish.y+fish.fleeY*dt*.72,H()*.12,H()*.8);
    }else{
      fish.y+=(fish.homeY-fish.y)*.025;
    }
    fish.x+=fish.speed*fish.direction*(fish.fleeTimer>0?2.35:1)*dt;
    if(fish.direction>0&&fish.x>W()+65)fish.x=-65;
    if(fish.direction<0&&fish.x<-65)fish.x=W()+65;
    fish.swimPhase+=dt*(.035+fish.speed*.018);
    const y=fish.y+Math.sin(time*.0014+fish.phase)*H()*.009;
    const size=fish.size;
    const color=`hsla(${fish.hue},82%,${fish.school%2?65:71}%,.94)`;
    const tail=Math.sin(fish.swimPhase+fish.tailPhase)*5;
    ctx.save();
    ctx.translate(fish.x,y);
    const swimDirection=fish.species==="nautilus"?-fish.direction:fish.direction;
    ctx.scale(swimDirection*size,size);
    ctx.rotate(Math.sin(fish.swimPhase+fish.phase)*.035);
    ctx.fillStyle=color;
    ctx.shadowBlur=0;
    ctx.shadowColor="transparent";
    if(fish.species==="shark"){
      ctx.beginPath();
      ctx.moveTo(20,0);
      ctx.quadraticCurveTo(11,-8,-7,-7);
      ctx.quadraticCurveTo(-15,-6,-19,-2);
      ctx.lineTo(-20,tail-7);
      ctx.lineTo(-17,0);
      ctx.lineTo(-20,tail+7);
      ctx.quadraticCurveTo(-9,8,3,5);
      ctx.lineTo(13,3);
      ctx.quadraticCurveTo(18,2,20,0);
      ctx.fill();
      ctx.fillStyle="#607e91";
      ctx.beginPath();
      ctx.moveTo(-6,-6);
      ctx.quadraticCurveTo(-4,-15,1,-20);
      ctx.quadraticCurveTo(7,-17,8,-5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-13,5);
      ctx.quadraticCurveTo(-16,11,-21,13);
      ctx.quadraticCurveTo(-16,13,-9,7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1,4);
      ctx.quadraticCurveTo(-3,10,-10,12);
      ctx.quadraticCurveTo(-2,11,5,6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(31,51,66,.8)";
      ctx.lineWidth=.9;
      for(let gill=0;gill<3;gill++){
        ctx.beginPath();
        ctx.moveTo(9-gill*3,-3);
        ctx.quadraticCurveTo(8-gill*3,0,9-gill*3,3);
        ctx.stroke();
      }
      ctx.fillStyle="#e1e8df";
      ctx.beginPath();
      ctx.moveTo(16,2);
      ctx.lineTo(12,6);
      ctx.lineTo(20,3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle="#07121b";
      ctx.beginPath();
      ctx.arc(15,-3,1,0,Math.PI*2);
      ctx.fill();
    }else if(fish.species==="angelfish"){
      ctx.beginPath();
      ctx.moveTo(17,0);
      ctx.quadraticCurveTo(7,-9,-9,-5);
      ctx.lineTo(-18,tail-7);
      ctx.lineTo(-15,0);
      ctx.lineTo(-18,tail+7);
      ctx.lineTo(-9,5);
      ctx.quadraticCurveTo(7,9,17,0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5,-4);
      ctx.lineTo(-9,-14);
      ctx.lineTo(2,-6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3,4);
      ctx.lineTo(2,12);
      ctx.lineTo(7,5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.6)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(1,-5);
      ctx.lineTo(2,5);
      ctx.moveTo(7,-5);
      ctx.lineTo(8,5);
      ctx.stroke();
    }else if(fish.species==="lionfish"){
      ctx.beginPath();
      ctx.ellipse(0,0,13,8,0,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9,-5);
      ctx.lineTo(-15,-16);
      ctx.lineTo(-6,-9);
      ctx.lineTo(-5,-19);
      ctx.lineTo(0,-8);
      ctx.lineTo(5,-17);
      ctx.lineTo(7,-7);
      ctx.quadraticCurveTo(2,0,-9,-5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9,5);
      ctx.lineTo(-15,15);
      ctx.lineTo(-5,9);
      ctx.lineTo(1,17);
      ctx.lineTo(4,7);
      ctx.quadraticCurveTo(0,2,-9,5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,231,196,.86)";
      ctx.lineWidth=1.5;
      for(let stripe=-6;stripe<=6;stripe+=4){
        ctx.beginPath();
        ctx.moveTo(stripe,-7);
        ctx.quadraticCurveTo(stripe+2,0,stripe,7);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-12,0);
      ctx.lineTo(-21,tail-5);
      ctx.lineTo(-18,0);
      ctx.lineTo(-21,tail+5);
      ctx.closePath();
      ctx.fill();
    }else if(fish.species==="parrotfish"){
      ctx.beginPath();
      ctx.moveTo(19,0);
      ctx.quadraticCurveTo(10,-10,-7,-7);
      ctx.quadraticCurveTo(-14,-6,-16,0);
      ctx.quadraticCurveTo(-12,7,-4,8);
      ctx.quadraticCurveTo(11,8,19,0);
      ctx.fill();
      ctx.fillStyle="rgba(249,205,111,.95)";
      ctx.beginPath();
      ctx.moveTo(16,-1);
      ctx.quadraticCurveTo(20,-3,22,-1);
      ctx.quadraticCurveTo(20,2,16,1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle="rgba(74,217,176,.9)";
      ctx.beginPath();
      ctx.moveTo(-5,-6);
      ctx.quadraticCurveTo(-1,-12,6,-8);
      ctx.lineTo(1,-4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,220,131,.86)";
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(-8,-6);
      ctx.quadraticCurveTo(-3,0,-8,6);
      ctx.moveTo(0,-7);
      ctx.quadraticCurveTo(5,0,0,7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14,0);
      ctx.lineTo(-21,tail-5);
      ctx.lineTo(-19,0);
      ctx.lineTo(-21,tail+5);
      ctx.closePath();
      ctx.fill();
    }else if(fish.species==="tang"){
      ctx.beginPath();
      ctx.moveTo(18,0);
      ctx.quadraticCurveTo(9,-8,-8,-6);
      ctx.quadraticCurveTo(-16,-4,-16,0);
      ctx.quadraticCurveTo(-14,5,-6,6);
      ctx.quadraticCurveTo(10,8,18,0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0,-5);
      ctx.quadraticCurveTo(-2,-12,5,-11);
      ctx.lineTo(8,-6);
      ctx.quadraticCurveTo(2,-3,0,-5);
      ctx.moveTo(-2,5);
      ctx.quadraticCurveTo(2,11,8,8);
      ctx.lineTo(5,4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,239,170,.92)";
      ctx.lineWidth=1.8;
      ctx.beginPath();
      ctx.moveTo(-5,-5);
      ctx.lineTo(-4,5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-15,0);
      ctx.lineTo(-22,tail-5);
      ctx.lineTo(-19,0);
      ctx.lineTo(-22,tail+5);
      ctx.closePath();
      ctx.fill();
    }else if(fish.species==="moorish"){
      ctx.beginPath();
      ctx.ellipse(0,0,11,8,0,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2,-6);
      ctx.quadraticCurveTo(-1,-17,3,-22);
      ctx.quadraticCurveTo(7,-15,6,-6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-1,6);
      ctx.quadraticCurveTo(-5,14,-9,12);
      ctx.lineTo(-6,4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,247,226,.9)";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(2,-7);
      ctx.lineTo(4,7);
      ctx.moveTo(-5,-6);
      ctx.lineTo(-4,6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10,0);
      ctx.lineTo(-18,tail-5);
      ctx.lineTo(-16,0);
      ctx.lineTo(-18,tail+5);
      ctx.closePath();
      ctx.fill();
    }else if(fish.species==="nautilus"){
      ctx.fillStyle="#d8b88c";
      ctx.beginPath();
      ctx.ellipse(-4,0,14,13,0,0,Math.PI*2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-4,0,14,13,0,0,Math.PI*2);
      ctx.clip();
      ctx.strokeStyle="#9a6047";
      ctx.lineWidth=1.7;
      ctx.beginPath();
      for(let step=0;step<=48;step++){
        const progress=step/48;
        const angle=progress*Math.PI*3;
        const radius=12-progress*10.5;
        const x=-4+Math.cos(angle)*radius;
        const y=Math.sin(angle)*radius;
        if(step===0)ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle=color;
      ctx.lineWidth=1.8;
      for(let tentacle=0;tentacle<5;tentacle++){
        const y=4+(tentacle-2)*3.4;
        const wave=Math.sin(time*.002+tentacle)*1.1;
        ctx.beginPath();
        ctx.moveTo(15,y*.8);
        ctx.quadraticCurveTo(24,y+wave,35,y+wave*.6);
        ctx.stroke();
      }
      ctx.fillStyle="#a7c3c2";
      ctx.beginPath();
      ctx.moveTo(7,-3);
      ctx.quadraticCurveTo(14,-5,17,-1);
      ctx.quadraticCurveTo(20,2,17,6);
      ctx.quadraticCurveTo(14,10,10,8);
      ctx.quadraticCurveTo(8,7,7,4);
      ctx.closePath();
      ctx.fill();
    }else if(fish.species==="pufferfish"){
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.arc(0,0,11,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle=color;
      ctx.lineWidth=1.6;
      for(let spine=0;spine<12;spine++){
        const angle=spine*Math.PI/6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle)*10,Math.sin(angle)*10);
        ctx.lineTo(Math.cos(angle)*14,Math.sin(angle)*14);
        ctx.stroke();
      }
      ctx.fillStyle="rgba(245,224,155,.8)";
      for(let spot=0;spot<5;spot++){
        ctx.beginPath();
        ctx.arc(-5+(spot%3)*4,-4+Math.floor(spot/3)*6,1,0,Math.PI*2);
        ctx.fill();
      }
    }else if(fish.species==="triggerfish"){
      ctx.beginPath();
      ctx.moveTo(18,0);
      ctx.quadraticCurveTo(9,-10,-8,-8);
      ctx.lineTo(-15,-3);
      ctx.lineTo(-19,0);
      ctx.lineTo(-14,6);
      ctx.quadraticCurveTo(5,10,18,0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-7,-7);
      ctx.lineTo(-4,-15);
      ctx.lineTo(1,-9);
      ctx.lineTo(9,-10);
      ctx.lineTo(11,-5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,229,157,.9)";
      ctx.lineWidth=1;
      for(let stripe=0;stripe<3;stripe++){
        ctx.beginPath();
        ctx.moveTo(-8+stripe*5,-7);
        ctx.quadraticCurveTo(-5+stripe*5,0,-8+stripe*5,7);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-15,0);
      ctx.lineTo(-22,tail-4);
      ctx.lineTo(-20,0);
      ctx.lineTo(-22,tail+4);
      ctx.closePath();
      ctx.fill();
    }else if(fish.species==="clownfish"){
      ctx.beginPath();
      ctx.moveTo(18,0);
      ctx.quadraticCurveTo(8,-9,-9,-5);
      ctx.lineTo(-18,tail-6);
      ctx.lineTo(-15,0);
      ctx.lineTo(-18,tail+6);
      ctx.lineTo(-9,5);
      ctx.quadraticCurveTo(8,9,18,0);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(18,0);
      ctx.quadraticCurveTo(8,-9,-9,-5);
      ctx.lineTo(-18,tail-6);
      ctx.lineTo(-15,0);
      ctx.lineTo(-18,tail+6);
      ctx.lineTo(-9,5);
      ctx.quadraticCurveTo(8,9,18,0);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle="rgba(255,248,221,.92)";
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(1,-6);
      ctx.lineTo(2,6);
      ctx.moveTo(-6,-5);
      ctx.lineTo(-5,5);
      ctx.stroke();
      ctx.restore();
    }else if(fish.species==="butterfly"){
      ctx.beginPath();
      ctx.ellipse(0,0,12,7,0,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2,-2);
      ctx.quadraticCurveTo(-8,-15,-15,-10);
      ctx.quadraticCurveTo(-17,-3,-2,1);
      ctx.moveTo(-2,2);
      ctx.quadraticCurveTo(-9,14,-15,9);
      ctx.quadraticCurveTo(-17,3,-2,-1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-11,0);
      ctx.lineTo(-19,tail);
      ctx.lineTo(-15,0);
      ctx.closePath();
      ctx.fill();
    }else{
      ctx.beginPath();
      ctx.moveTo(18,0);
      ctx.quadraticCurveTo(8,-8,-9,-5);
      ctx.lineTo(-18,tail-7);
      ctx.lineTo(-15,0);
      ctx.lineTo(-18,tail+7);
      ctx.lineTo(-9,5);
      ctx.quadraticCurveTo(8,8,18,0);
      ctx.fill();
      if(fish.species==="striped"){
        ctx.strokeStyle="rgba(255,255,255,.56)";
        ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.moveTo(-4,-5);
        ctx.lineTo(-3,5);
        ctx.moveTo(3,-6);
        ctx.lineTo(4,6);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-3,-4);
      ctx.lineTo(-7,-11);
      ctx.lineTo(4,-5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2,4);
      ctx.lineTo(3,10);
      ctx.lineTo(7,4);
      ctx.closePath();
      ctx.fill();
    }
    if(fish.species!=="nautilus"){
      // Aletas pectorales y branquias comunes completan la silueta de cada especie.
      ctx.save();
      ctx.globalAlpha=.55;
      ctx.beginPath();
      ctx.moveTo(1,1);
      ctx.quadraticCurveTo(-1,5+Math.sin(fish.swimPhase)*2,5,7);
      ctx.quadraticCurveTo(4,3,7,1);
      ctx.closePath();
      ctx.fillStyle="rgba(226,250,255,.78)";
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle="rgba(8,32,48,.45)";
      ctx.lineWidth=.8;
      ctx.beginPath();
      ctx.moveTo(5,-4);
      ctx.quadraticCurveTo(3,0,5,4);
      ctx.stroke();
      ctx.fillStyle="rgba(235,252,255,.95)";
      ctx.beginPath();
      ctx.arc(10,-1.6,1.15,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#07121b";
      ctx.beginPath();
      ctx.arc(10.3,-1.6,.48,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  });

  drawOceanLargeVisitors(time,dt);

  oceanCreatures.forEach(creature=>{
    if(creature.fleeTimer>0){
      creature.fleeTimer=Math.max(0,creature.fleeTimer-dt);
      creature.x+=creature.speed*creature.direction*2.2*dt;
    }else{
      creature.x+=creature.speed*creature.direction*dt;
    }
    if(creature.x<-70)creature.x=W()+70;
    if(creature.x>W()+70)creature.x=-70;
    if(creature.groundDweller){
      const floorOffset=creature.type==="starfish"?-7:11;
      creature.y=oceanFloorY(creature.x)-floorOffset*creature.size;
    }
    const y=creature.groundDweller
      ?creature.y
      :creature.type==="turtle"
        ?creature.y+Math.sin(time*.0008+creature.phase)*H()*.004
        :creature.y+Math.sin(time*.001+creature.phase)*H()*.008;
    ctx.save();
    ctx.translate(creature.x,y);
    ctx.scale(creature.direction*creature.size,creature.size);
    if(creature.type==="turtle")
      ctx.rotate(Math.sin(time*.0008+creature.phase)*.012);
    if(creature.type==="urchin")
      ctx.rotate(time*creature.rotationSpeed+creature.phase);
    const color=`hsla(${creature.hue},78%,67%,.94)`;
    ctx.fillStyle=color;
    ctx.strokeStyle=color;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    const isEel=creature.type==="eel"||creature.type==="moray";
    ctx.shadowBlur=isEel?11:0;
    ctx.shadowColor=isEel?color:"transparent";
    if(creature.type==="starfish"){
      ctx.rotate(.12+Math.sin(time*.0007+creature.phase)*.035);
      ctx.scale(1,.64);
    }
    if(creature.type==="crab"){
      const crabColor="rgba(115,52,48,.98)";
      ctx.fillStyle=crabColor;
      ctx.beginPath();
      ctx.ellipse(0,-1,14,9,0,Math.PI,Math.PI*2);
      ctx.lineTo(14,2);
      ctx.quadraticCurveTo(0,13,-14,2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(245,146,111,.8)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.ellipse(0,-1,10,6,0,Math.PI,Math.PI*2);
      ctx.stroke();
      ctx.strokeStyle=crabColor;
      ctx.lineWidth=2;
      ctx.beginPath();
      for(let leg=0;leg<3;leg++){
        const offset=leg*7-7;
        const twitch=Math.sin(time*.012+creature.phase+leg*Math.PI)*2;
        ctx.moveTo(offset-6,-1);
        ctx.lineTo(offset-9,5+twitch);
        ctx.lineTo(offset-12,10+twitch);
        ctx.moveTo(offset+6,-1);
        ctx.lineTo(offset+9,5-twitch);
        ctx.lineTo(offset+12,10-twitch);
      }
      ctx.stroke();
      for(let clawSide of [-1,1]){
        ctx.save();
        ctx.translate(clawSide*12,-4);
        ctx.rotate(clawSide*(.12+Math.sin(time*.006+creature.phase+clawSide)*.12));
        ctx.strokeStyle=crabColor;
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.quadraticCurveTo(clawSide*7,-7,clawSide*12,-5);
        ctx.stroke();
        ctx.fillStyle=crabColor;
        ctx.beginPath();
        ctx.moveTo(clawSide*9,-8);
        ctx.quadraticCurveTo(clawSide*16,-14,clawSide*19,-9);
        ctx.quadraticCurveTo(clawSide*20,-5,clawSide*15,-4);
        ctx.lineTo(clawSide*11,-6);
        ctx.quadraticCurveTo(clawSide*16,0,clawSide*12,1);
        ctx.quadraticCurveTo(clawSide*8,-1,clawSide*9,-8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle=crabColor;
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(clawSide*12,-7);
        ctx.quadraticCurveTo(clawSide*15,-9,clawSide*17,-8);
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle="rgba(235,242,224,.96)";
      ctx.beginPath();
      ctx.arc(-5,-6,2.3,0,Math.PI*2);
      ctx.arc(5,-6,2.3,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#f6fbff";
      ctx.beginPath();
      ctx.arc(-5,-6,1.35,0,Math.PI*2);
      ctx.arc(5,-6,1.35,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#18232a";
      ctx.beginPath();
      ctx.arc(-4.7,-6, .65,0,Math.PI*2);
      ctx.arc(5.3,-6, .65,0,Math.PI*2);
      ctx.fill();
    }else if(creature.type==="lobster"){
      const legWave=Math.sin(time*.007+creature.phase)*2;
      ctx.fillStyle="#b9574f";
      ctx.beginPath();
      ctx.ellipse(-1,0,12,6,0,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle="rgba(255,188,150,.82)";
      ctx.lineWidth=1;
      for(let segment=0;segment<4;segment++){
        const x=-8+segment*4;
        ctx.beginPath();
        ctx.moveTo(x,-5);
        ctx.quadraticCurveTo(x-1,-1,x,4);
        ctx.stroke();
      }
      ctx.strokeStyle="#d66c5b";
      ctx.lineWidth=1.8;
      ctx.lineCap="round";
      ctx.beginPath();
      for(let leg=0;leg<3;leg++){
        const x=-6+leg*5;
        ctx.moveTo(x,3);
        ctx.lineTo(x-3,7+legWave);
        ctx.lineTo(x-5,10+legWave);
        ctx.moveTo(x,3);
        ctx.lineTo(x+3,7-legWave);
        ctx.lineTo(x+5,10-legWave);
      }
      ctx.stroke();
      for(const side of [-1,1]){
        ctx.beginPath();
        ctx.moveTo(side*8,-2);
        ctx.quadraticCurveTo(side*13,-8,side*17,-8);
        ctx.stroke();
        ctx.fillStyle="#c95e52";
        ctx.beginPath();
        ctx.moveTo(side*15,-8);
        ctx.quadraticCurveTo(side*20,-14,side*23,-11);
        ctx.quadraticCurveTo(side*22,-8,side*19,-7);
        ctx.quadraticCurveTo(side*22,-5,side*20,-3);
        ctx.quadraticCurveTo(side*17,-4,side*15,-8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle="rgba(255,196,151,.82)";
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(side*14,-7);
        ctx.quadraticCurveTo(side*21,-15,side*25,-12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(side*14,-6);
        ctx.quadraticCurveTo(side*23,-8,side*28,-10);
        ctx.stroke();
      }
      ctx.fillStyle="#f8f2da";
      ctx.beginPath();
      ctx.arc(8,-3,1.8,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#1b2a31";
      ctx.beginPath();
      ctx.arc(8.5,-3, .8,0,Math.PI*2);
      ctx.fill();
    }else if(creature.type==="urchin"){
      const pulse=.5+.5*Math.sin(time*.002+creature.phase);
      ctx.strokeStyle="rgba(213,139,123,.86)";
      ctx.lineWidth=1.8;
      ctx.lineCap="round";
      for(let spine=0;spine<14;spine++){
        const angle=spine*Math.PI*2/14;
        const inner=5;
        const outer=10+Math.sin(time*.003+spine)*pulse*1.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner);
        ctx.lineTo(Math.cos(angle)*outer,Math.sin(angle)*outer);
        ctx.stroke();
      }
      ctx.fillStyle="rgba(103,66,84,.98)";
      ctx.beginPath();
      ctx.arc(0,0,6,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="rgba(255,220,176,.86)";
      for(let spot=0;spot<5;spot++){
        const angle=spot*Math.PI*2/5;
        ctx.beginPath();
        ctx.arc(Math.cos(angle)*3,Math.sin(angle)*3,1,0,Math.PI*2);
        ctx.fill();
      }
    }else if(creature.type==="starfish"){
      ctx.fillStyle=`hsla(${creature.hue+18},76%,58%,.96)`;
      ctx.beginPath();
      for(let arm=0;arm<10;arm++){
        const angle=-Math.PI/2+arm*Math.PI/5;
        const radius=arm%2?5:13;
        const pointX=Math.cos(angle)*radius;
        const pointY=Math.sin(angle)*radius;
        if(arm===0)ctx.moveTo(pointX,pointY);
        else ctx.lineTo(pointX,pointY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,211,153,.78)";
      ctx.lineWidth=.85;
      ctx.stroke();
      ctx.fillStyle="rgba(255,224,174,.82)";
      for(let dot=0;dot<7;dot++){
        const angle=dot*Math.PI*2/7;
        ctx.beginPath();
        ctx.arc(Math.cos(angle)*6,Math.sin(angle)*6,1,0,Math.PI*2);
        ctx.fill();
      }
    }else if(creature.type==="shrimp"){
      const flicker=Math.sin(time*.006+creature.phase);
      const abdomen=ctx.createLinearGradient(0,-7,0,8);
      abdomen.addColorStop(0,"#ffd0a0");
      abdomen.addColorStop(.48,"#ed9479");
      abdomen.addColorStop(1,"#b95658");
      ctx.fillStyle=abdomen;
      ctx.beginPath();
      ctx.moveTo(13,-2);
      ctx.quadraticCurveTo(7,-7,0,-5);
      ctx.quadraticCurveTo(-6,-7,-10,-2);
      ctx.quadraticCurveTo(-15,2,-9,7);
      ctx.quadraticCurveTo(-3,10,2,6);
      ctx.quadraticCurveTo(8,5,13,2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(255,222,185,.8)";
      ctx.lineWidth=.8;
      for(let segment=0;segment<4;segment++){
        const x=7-segment*4;
        ctx.beginPath();
        ctx.moveTo(x,-5+Math.abs(segment-1)*.5);
        ctx.quadraticCurveTo(x-3,0,x-1,6-Math.abs(segment-1)*.4);
        ctx.stroke();
      }
      ctx.fillStyle="#c46863";
      ctx.beginPath();
      ctx.moveTo(-9,3);
      ctx.quadraticCurveTo(-14,7,-17,11+flicker);
      ctx.quadraticCurveTo(-12,10,-7,8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8,4);
      ctx.quadraticCurveTo(-11,10,-12,14-flicker);
      ctx.quadraticCurveTo(-7,11,-4,7);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle="#db806e";
      ctx.beginPath();
      ctx.moveTo(9,-3);
      ctx.quadraticCurveTo(14,-8,19,-5);
      ctx.lineTo(16,1);
      ctx.quadraticCurveTo(13,4,8,2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle="#fff0d1";
      ctx.beginPath();
      ctx.arc(15,-4,1.35,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#25333a";
      ctx.beginPath();
      ctx.arc(15.4,-4, .65,0,Math.PI*2);
      ctx.fill();

      ctx.strokeStyle="rgba(255,204,165,.9)";
      ctx.lineWidth=.9;
      ctx.beginPath();
      ctx.moveTo(17,-5);
      ctx.quadraticCurveTo(23,-13,29,-12+flicker);
      ctx.moveTo(18,-3);
      ctx.quadraticCurveTo(25,-8,31,-7-flicker);
      ctx.stroke();
      ctx.strokeStyle="#b85c5b";
      ctx.lineWidth=1.2;
      ctx.beginPath();
      for(let leg=0;leg<5;leg++){
        const x=7-leg*3.2;
        ctx.moveTo(x,5);
        ctx.quadraticCurveTo(x-1,8+flicker,x-3,11+flicker);
      }
      ctx.stroke();

    }else if(creature.type==="moray"){
      const wave=Math.sin(time*.0035+creature.phase)*6;
      const bodyPath=()=>{
        ctx.beginPath();
        ctx.moveTo(22,0);
        ctx.bezierCurveTo(14,-7+wave*.2,8,6-wave*.25,0,2-wave*.4);
        ctx.bezierCurveTo(-9,-3-wave*.2,-14,7+wave*.3,-22,2+wave*.4);
        ctx.bezierCurveTo(-29,-2-wave*.25,-34,6+wave*.15,-42,1+wave*.2);
      };
      ctx.lineCap="round";
      bodyPath();
      ctx.strokeStyle="#152f34";
      ctx.lineWidth=13;
      ctx.stroke();
      bodyPath();
      ctx.strokeStyle="#496d59";
      ctx.lineWidth=9;
      ctx.stroke();
      bodyPath();
      ctx.strokeStyle="#82966b";
      ctx.lineWidth=5.5;
      ctx.stroke();
      ctx.strokeStyle="rgba(30,53,48,.8)";
      ctx.lineWidth=1.2;
      for(let band=0;band<5;band++){
        const x=band*7-12;
        const offset=Math.sin(time*.0035+creature.phase+band*.75)*3;
        ctx.beginPath();
        ctx.moveTo(x,offset-3);
        ctx.lineTo(x-1,offset+3);
        ctx.stroke();
      }
      ctx.fillStyle="#82966b";
      ctx.beginPath();
      ctx.ellipse(20,0,7,4.5,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#c7c59d";
      ctx.beginPath();
      ctx.moveTo(17,1);
      ctx.quadraticCurveTo(21,4,25,1);
      ctx.quadraticCurveTo(21,2,17,1);
      ctx.fill();
      ctx.strokeStyle="#e1d5ad";
      ctx.lineWidth=.7;
      for(let tooth=0;tooth<3;tooth++){
        const x=19+tooth*1.5;
        ctx.beginPath();
        ctx.moveTo(x,1.2);
        ctx.lineTo(x+.4,2.4);
        ctx.stroke();
      }
      ctx.fillStyle="#f4e6c8";
      ctx.beginPath();
      ctx.arc(21,-2.5,1.6,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#18282a";
      ctx.beginPath();
      ctx.arc(21.4,-2.5,.8,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle="#243d3c";
      ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.moveTo(15,-3);
      ctx.lineTo(17,-5);
      ctx.stroke();
    }else if(creature.type==="eel"){
      const wave=Math.sin(time*.004+creature.phase)*5;
      const bodyPath=()=>{
        ctx.beginPath();
        ctx.moveTo(22,0);
        ctx.bezierCurveTo(13,-5+wave*.15,8,5-wave*.35,0,2-wave*.45);
        ctx.bezierCurveTo(-9,-2-wave*.15,-12,5+wave*.25,-20,2+wave*.3);
        ctx.bezierCurveTo(-27,0-wave*.2,-30,4+wave*.1,-35,2+wave*.1);
      };
      ctx.lineCap="round";
      bodyPath();
      ctx.strokeStyle="rgba(13,43,48,.9)";
      ctx.lineWidth=8;
      ctx.stroke();
      bodyPath();
      ctx.strokeStyle=color;
      ctx.lineWidth=5.2;
      ctx.stroke();
      ctx.strokeStyle="rgba(220,246,213,.68)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(16,-1);
      ctx.bezierCurveTo(8,-3+wave*.15,4,1-wave*.25,-3,1-wave*.35);
      ctx.stroke();
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.ellipse(20,0,5,3.2,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#f1fff1";
      ctx.beginPath();
      ctx.arc(20,-2,1.3,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#10252a";
      ctx.beginPath();
      ctx.arc(20.4,-2,.65,0,Math.PI*2);
      ctx.fill();
    }else{
      // Aletas inferiores, caparazón, cabeza y cola mantienen una silueta clara.
      const paddle=Math.sin(time*.006+creature.phase);
      const shell=ctx.createLinearGradient(0,-16,0,12);
      shell.addColorStop(0,"#76a878");
      shell.addColorStop(.42,"#477e66");
      shell.addColorStop(1,"#294f50");

      const drawTurtleFlipper=side=>{
        const finWave=paddle*3.2;
        ctx.fillStyle="rgba(76,148,115,.98)";
        ctx.beginPath();
        ctx.moveTo(side*9,4);
        ctx.quadraticCurveTo(side*13,6,side*14,9+finWave);
        ctx.quadraticCurveTo(side*18,13+finWave,side*22,11+finWave);
        ctx.quadraticCurveTo(side*21,4,side*16,3);
        ctx.quadraticCurveTo(side*12,1,side*9,4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle="rgba(196,221,166,.56)";
        ctx.lineWidth=.85;
        ctx.beginPath();
        ctx.moveTo(side*13,7);
        ctx.quadraticCurveTo(side*17,8+finWave*.5,side*19,11+finWave);
        ctx.stroke();
      };
      drawTurtleFlipper(-1);

      ctx.fillStyle="rgba(47,103,86,.98)";
      ctx.beginPath();
      ctx.moveTo(-17,-2);
      ctx.lineTo(-28,0);
      ctx.lineTo(-17,2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle="rgba(47,112,91,.98)";
      ctx.beginPath();
      ctx.ellipse(0,0,19,12,-.04,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle=shell;
      ctx.beginPath();
      ctx.moveTo(-18,4);
      ctx.quadraticCurveTo(-20,-8,-10,-16);
      ctx.quadraticCurveTo(1,-21,13,-14);
      ctx.quadraticCurveTo(19,-6,17,5);
      ctx.quadraticCurveTo(0,12,-16,7);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-18,4);
      ctx.quadraticCurveTo(-20,-8,-10,-16);
      ctx.quadraticCurveTo(1,-21,13,-14);
      ctx.quadraticCurveTo(19,-6,17,5);
      ctx.quadraticCurveTo(0,12,-16,7);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle="rgba(211,219,160,.82)";
      ctx.lineWidth=1.1;
      ctx.beginPath();
      ctx.moveTo(-18,-2);
      ctx.quadraticCurveTo(0,-5,18,-2);
      ctx.moveTo(-11,-14);
      ctx.quadraticCurveTo(-6,-9,-8,-3);
      ctx.moveTo(2,-19);
      ctx.quadraticCurveTo(0,-11,2,-4);
      ctx.moveTo(12,-13);
      ctx.quadraticCurveTo(7,-9,9,-3);
      ctx.stroke();
      ctx.restore();
      drawTurtleFlipper(1);
      ctx.fillStyle="rgba(74,142,109,.98)";
      ctx.beginPath();
      ctx.ellipse(21,-1,7,5.5,-.12,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="rgba(238,224,177,.96)";
      ctx.beginPath();
      ctx.arc(23,-3,1.7,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="rgba(17,35,35,.96)";
      ctx.beginPath();
      ctx.arc(23.5,-3,.8,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  });

  oceanLife.forEach(life=>{
    life.x+=life.drift*dt+Math.sin(time*.0007+life.phase)*.12;
    life.y-=life.rise*dt;
    if(life.y<-5){life.y=H()+5;life.x=rand(0,W());}
    if(life.x<0)life.x=W();
    if(life.x>W())life.x=0;
    const glow=.4+.35*Math.sin(time*.002+life.phase);
    ctx.beginPath();
    ctx.arc(life.x,life.y,life.radius,0,Math.PI*2);
    ctx.fillStyle=`rgba(${secondary.join(",")},${.48+glow*.42})`;
    ctx.shadowBlur=0;
    ctx.fill();
  });

  drawOceanBubbles(time,dt);

  oceanPulses=oceanPulses.filter(pulse=>{
    pulse.radius+=2.8*dt;
    pulse.life-=.012*dt;
    ctx.beginPath();
    ctx.arc(pulse.x,pulse.y,pulse.radius,0,Math.PI*2);
    ctx.strokeStyle=`rgba(${secondary.join(",")},${pulse.life})`;
    ctx.lineWidth=2;
    ctx.shadowBlur=18;
    ctx.shadowColor=`rgba(${primary.join(",")},.8)`;
    ctx.stroke();
    ctx.shadowBlur=0;
    return pulse.life>0;
  });
}

function drawOceanAtmosphere(time,primary,secondary){
  const surface=ctx.createLinearGradient(0,0,0,H()*.58);
  surface.addColorStop(0,`rgba(${secondary.join(",")},.11)`);
  surface.addColorStop(.45,"rgba(101,196,226,.035)");
  surface.addColorStop(1,"rgba(3,18,36,0)");
  ctx.fillStyle=surface;
  ctx.fillRect(0,0,W(),H()*.62);

  for(let layer=0;layer<3;layer++){
    const x=W()*(.18+layer*.32)+Math.sin(time*.00009+layer*2.1)*W()*.04;
    const y=H()*(.27+layer*.19);
    const radius=Math.max(W(),H())*(.24+layer*.035);
    const haze=ctx.createRadialGradient(x,y,0,x,y,radius);
    haze.addColorStop(0,layer%2
      ? `rgba(${primary.join(",")},.055)`
      : "rgba(125,207,226,.06)");
    haze.addColorStop(.42,"rgba(69,156,195,.018)");
    haze.addColorStop(1,"rgba(24,98,147,0)");
    ctx.fillStyle=haze;
    ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
}

function drawOceanCoral(time,x,base,height,index,primary,secondary){
  const sway=Math.sin(time*.0012+index*1.7)*Math.min(W(),H())*.008;
  const palette=index%3===0?secondary:primary;
  const branches=3+index%4;
  const stemWidth=Math.max(1.5,height*.075);
  const glow=`rgba(${palette.join(",")},.72)`;
  ctx.save();
  ctx.lineCap="round";
  ctx.lineJoin="round";
  ctx.shadowBlur=Math.min(7,height*.07);
  ctx.shadowColor=`rgba(${palette.join(",")},.32)`;

  if(index%4===0){
    for(let blade=0;blade<5;blade++){
      const offset=(blade-2)*height*.12;
      const curl=Math.sin(time*.0015+index+blade)*height*.06;
      ctx.beginPath();
      ctx.moveTo(x+offset,base);
      ctx.bezierCurveTo(
        x+offset+curl,base-height*.38,
        x+offset-curl*.7,base-height*.72,
        x+offset+curl,base-height*(.74+.12*(blade%2))
      );
      ctx.strokeStyle=blade%2?"rgba(68,192,161,.58)":"rgba(99,222,183,.74)";
      ctx.lineWidth=Math.max(2,height*.045);
      ctx.stroke();
    }
  }else{
    for(let branch=0;branch<branches;branch++){
      const side=branch%2?1:-1;
      const level=.18+Math.floor(branch/2)*.2;
      const reach=height*(.13+((branch*7+index)%5)*.025);
      const endX=x+side*reach+sway*.45;
      const endY=base-height*level;
      const bend=sway+side*reach*.45;
      ctx.beginPath();
      ctx.moveTo(x,base);
      ctx.quadraticCurveTo(x+bend,base-height*level*.58,endX,endY);
      ctx.strokeStyle=glow;
      ctx.lineWidth=Math.max(1,stemWidth*(1-level*.6));
      ctx.stroke();

      for(let tip=0;tip<3;tip++){
        const tipX=endX+side*(tip-1)*height*.045;
        const tipY=endY-height*(.025+tip*.012);
        ctx.beginPath();
        ctx.arc(tipX,tipY,Math.max(1,height*.024),0,Math.PI*2);
        ctx.fillStyle=tip===1
          ? "rgba(192,255,225,.9)"
          : `rgba(${palette.join(",")},.86)`;
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.moveTo(x,base);
    ctx.quadraticCurveTo(x+sway*.5,base-height*.48,x+sway,base-height);
    ctx.strokeStyle=glow;
    ctx.lineWidth=stemWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function drawOceanKelp(time){
  const kelpBeds=[
    {x:.075,height:.39,phase:.2,blades:5},
    {x:.19,height:.28,phase:1.8,blades:4},
    {x:.84,height:.34,phase:2.7,blades:5},
    {x:.94,height:.24,phase:4.1,blades:4}
  ];
  kelpBeds.forEach((bed,bedIndex)=>{
    const base=H()*(.94-.02*Math.sin(bedIndex*2));
    const height=H()*bed.height;
    for(let blade=0;blade<bed.blades;blade++){
      const offset=(blade-(bed.blades-1)*.5)*Math.min(W(),H())*.012;
      const reach=height*(.72+((blade*7+bedIndex)%4)*.09);
      const sway=Math.sin(time*.001+bed.phase+blade*.72)*Math.min(W(),H())*.025;
      ctx.beginPath();
      ctx.moveTo(bed.x*W()+offset,base);
      ctx.bezierCurveTo(
        bed.x*W()+offset-sway*.35,base-reach*.35,
        bed.x*W()+offset+sway,base-reach*.77,
        bed.x*W()+offset+sway*.72,base-reach
      );
      ctx.strokeStyle=blade%2?"rgba(48,151,139,.42)":"rgba(91,190,155,.55)";
      ctx.lineWidth=Math.max(2,Math.min(W(),H())*.011);
      ctx.lineCap="round";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bed.x*W()+offset,base);
      ctx.bezierCurveTo(
        bed.x*W()+offset-sway*.35,base-reach*.35,
        bed.x*W()+offset+sway,base-reach*.77,
        bed.x*W()+offset+sway*.72,base-reach
      );
      ctx.strokeStyle="rgba(202,236,194,.18)";
      ctx.lineWidth=Math.max(1,Math.min(W(),H())*.002);
      ctx.stroke();
    }
  });
}

function drawOceanReefAccents(time){
  const fans=[
    {x:.27,height:.13,phase:.3,color:"rgba(236,117,147,.62)"},
    {x:.73,height:.16,phase:1.8,color:"rgba(231,157,104,.63)"},
    {x:.42,height:.1,phase:3.1,color:"rgba(133,137,238,.58)"},
    {x:.59,height:.12,phase:4.5,color:"rgba(87,190,185,.62)"}
  ];
  fans.forEach((fan,index)=>{
    const base=H()*(.965-.018*Math.sin(index*2));
    const height=H()*fan.height;
    const sway=Math.sin(time*.001+fan.phase)*Math.min(W(),H())*.012;
    const branches=7+index%3;
    ctx.save();
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.shadowBlur=Math.min(6,height*.055);
    ctx.shadowColor=fan.color;
    for(let branch=0;branch<branches;branch++){
      const spread=(branch/(branches-1)-.5)*height*.7;
      const top=base-height*(.58+.22*Math.sin(branch*1.2+index));
      const curve=sway+Math.sin(time*.0016+branch*.7+fan.phase)*height*.07;
      ctx.beginPath();
      ctx.moveTo(fan.x*W(),base);
      ctx.bezierCurveTo(
        fan.x*W()+spread*.15,base-height*.36,
        fan.x*W()+spread+curve*.5,top+height*.18,
        fan.x*W()+spread+curve,top
      );
      ctx.strokeStyle=fan.color;
      ctx.lineWidth=Math.max(1.5,Math.min(W(),H())*.004);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(fan.x*W()+spread+curve,top,Math.max(1.5,height*.023),0,Math.PI*2);
      ctx.fillStyle=fan.color;
      ctx.fill();
    }
    ctx.restore();
  });

  for(let anemone=0;anemone<7;anemone++){
    const x=W()*(.12+anemone*.127);
    const base=H()*(.965-.012*Math.sin(anemone*2));
    const hue=anemone%2?25:315;
    ctx.save();
    ctx.lineCap="round";
    for(let tentacle=0;tentacle<7;tentacle++){
      const offset=(tentacle-3)*Math.min(W(),H())*.005;
      const wave=Math.sin(time*.002+anemone+tentacle*.8)*Math.min(W(),H())*.008;
      ctx.beginPath();
      ctx.moveTo(x,base);
      ctx.quadraticCurveTo(x+offset+wave,base-H()*.045,x+offset*1.8+wave,base-H()*(.075+.012*(tentacle%3)));
      ctx.strokeStyle=`hsla(${hue+tentacle*5},78%,66%,.7)`;
      ctx.lineWidth=Math.max(1.5,Math.min(W(),H())*.004);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x+offset*1.8+wave,base-H()*(.075+.012*(tentacle%3)),Math.max(1.2,Math.min(W(),H())*.004),0,Math.PI*2);
      ctx.fillStyle=`hsla(${hue+tentacle*5},90%,79%,.8)`;
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawOceanAnchor(time){
  const scale=Math.min(W(),H())*.0042;
  const x=W()*.14;
  const y=H()*.83;
  ctx.save();
  ctx.shadowBlur=0;
  ctx.shadowColor="transparent";
  ctx.translate(x+Math.sin(time*.00045)*scale*.7,y);
  ctx.rotate(-.14+Math.sin(time*.00035)*.014);

  const chainTop=-H()*.38/scale;
  const chainBottom=-scale*25;
  const chainSway=link=>Math.sin(time*.0011-link*.72)*scale*2.8;
  ctx.strokeStyle="rgba(42,51,51,.78)";
  ctx.lineWidth=scale*1.6;
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(0,chainTop);
  ctx.bezierCurveTo(
    chainSway(2),chainTop+(chainBottom-chainTop)*.35,
    chainSway(5),chainTop+(chainBottom-chainTop)*.72,
    0,chainBottom
  );
  ctx.stroke();
  for(let link=0;link<5;link++){
    const progress=(link+.5)/5;
    const linkY=chainTop+(chainBottom-chainTop)*progress;
    const linkX=chainSway(link);
    ctx.beginPath();
    ctx.ellipse(linkX,linkY,scale*2.2,scale*4.1,link%2?.16:-.16,0,Math.PI*2);
    ctx.strokeStyle="rgba(42,51,51,.78)";
    ctx.lineWidth=scale*.9;
    ctx.stroke();
  }

  ctx.lineCap="round";
  ctx.lineJoin="round";
  ctx.strokeStyle="rgba(48,57,56,.9)";
  ctx.lineWidth=scale*5.5;
  ctx.beginPath();
  ctx.moveTo(0,-scale*22);
  ctx.lineTo(0,scale*22);
  ctx.moveTo(-scale*12,-scale*13);
  ctx.quadraticCurveTo(0,-scale*15,scale*12,-scale*13);
  ctx.stroke();
  ctx.strokeStyle="rgba(48,57,56,.9)";
  ctx.lineWidth=scale*2.8;
  ctx.beginPath();
  ctx.arc(0,-scale*22,scale*5.2,Math.PI,Math.PI*2);
  ctx.stroke();

  ctx.fillStyle="rgba(48,57,56,.94)";
  ctx.beginPath();
  ctx.moveTo(-scale*2.2,scale*17);
  ctx.bezierCurveTo(-scale*8,scale*22,-scale*14,scale*28,-scale*25,scale*26);
  ctx.quadraticCurveTo(-scale*23,scale*20,-scale*18,scale*15);
  ctx.quadraticCurveTo(-scale*11,scale*19,-scale*4,scale*13);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(scale*2.2,scale*17);
  ctx.bezierCurveTo(scale*8,scale*22,scale*14,scale*28,scale*25,scale*26);
  ctx.quadraticCurveTo(scale*23,scale*20,scale*18,scale*15);
  ctx.quadraticCurveTo(scale*11,scale*19,scale*4,scale*13);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawOceanShipwreck(time){
  const unit=Math.min(W(),H());
  const x=W()*.79+Math.sin(time*.00018)*unit*.003;
  const y=H()*.94;
  const sway=Math.sin(time*.00045)*unit*.002;
  const timber="#554a39";
  const timberLight="rgba(151,126,86,.72)";
  const timberDark="rgba(27,35,34,.94)";
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(.58,.58);
  ctx.rotate(-.035+Math.sin(time*.0003)*.008);
  ctx.lineCap="round";
  ctx.lineJoin="round";
  ctx.shadowBlur=unit*.01;
  ctx.shadowColor="rgba(67,91,83,.2)";

  ctx.fillStyle=timberDark;
  ctx.beginPath();
  ctx.moveTo(-unit*.23,-unit*.12);
  ctx.lineTo(unit*.18,-unit*.14);
  ctx.quadraticCurveTo(unit*.22,-unit*.11,unit*.235,-unit*.07);
  ctx.lineTo(unit*.18,-unit*.015);
  ctx.quadraticCurveTo(unit*.13,unit*.015,unit*.02,unit*.02);
  ctx.lineTo(-unit*.17,unit*.005);
  ctx.quadraticCurveTo(-unit*.21,-unit*.035,-unit*.23,-unit*.12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle=timber;
  ctx.strokeStyle=timberLight;
  ctx.lineWidth=unit*.005;
  ctx.beginPath();
  ctx.moveTo(-unit*.22,-unit*.115);
  ctx.lineTo(unit*.17,-unit*.135);
  ctx.quadraticCurveTo(unit*.205,-unit*.105,unit*.22,-unit*.075);
  ctx.lineTo(unit*.17,-unit*.025);
  ctx.quadraticCurveTo(unit*.03,unit*.012,-unit*.17,-unit*.012);
  ctx.stroke();

  ctx.strokeStyle=timberLight;
  ctx.lineWidth=unit*.006;
  ctx.beginPath();
  for(let plank=0;plank<5;plank++){
    const plankY=-unit*(.105-plank*.021);
    ctx.moveTo(-unit*.19,plankY);
    ctx.quadraticCurveTo(-unit*.02,plankY+unit*.014,unit*.195,plankY-unit*.01);
  }
  ctx.stroke();

  ctx.strokeStyle="rgba(34,37,33,.92)";
  ctx.lineWidth=unit*.014;
  ctx.beginPath();
  ctx.moveTo(-unit*.055,-unit*.13);
  ctx.lineTo(-unit*.06,-unit*.61);
  ctx.lineTo(-unit*.075,-unit*.68);
  ctx.moveTo(unit*.065,-unit*.14);
  ctx.lineTo(unit*.075,-unit*.49);
  ctx.lineTo(unit*.095,-unit*.55);
  ctx.stroke();

  ctx.fillStyle="rgba(115,100,72,.62)";
  ctx.beginPath();
  ctx.moveTo(-unit*.055,-unit*.57);
  ctx.lineTo(-unit*.17,-unit*.47);
  ctx.lineTo(-unit*.11,-unit*.46);
  ctx.lineTo(-unit*.065,-unit*.5);
  ctx.lineTo(-unit*.1,-unit*.43);
  ctx.lineTo(-unit*.035,-unit*.46);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(unit*.075,-unit*.45);
  ctx.lineTo(unit*.15,-unit*.4);
  ctx.lineTo(unit*.1,-unit*.4);
  ctx.lineTo(unit*.135,-unit*.34);
  ctx.lineTo(unit*.065,-unit*.38);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle="#736348";
  ctx.lineWidth=unit*.009;
  ctx.beginPath();
  ctx.moveTo(-unit*.18,-unit*.42);
  ctx.lineTo(unit*.085,-unit*.45);
  ctx.moveTo(-unit*.16,-unit*.3);
  ctx.lineTo(unit*.09,-unit*.32);
  ctx.moveTo(-unit*.055,-unit*.61);
  ctx.lineTo(-unit*.17,-unit*.43);
  ctx.moveTo(-unit*.055,-unit*.61);
  ctx.lineTo(unit*.1,-unit*.46);
  ctx.moveTo(unit*.075,-unit*.49);
  ctx.lineTo(-unit*.16,-unit*.31);
  ctx.stroke();

  ctx.fillStyle="rgba(93,79,56,.72)";
  ctx.beginPath();
  ctx.moveTo(-unit*.15,-unit*.4);
  ctx.lineTo(-unit*.18,-unit*.32);
  ctx.lineTo(-unit*.09,-unit*.35);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(unit*.075,-unit*.43);
  ctx.lineTo(unit*.14,-unit*.37);
  ctx.lineTo(unit*.08,-unit*.37);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-unit*.06,-unit*.61);
  ctx.lineTo(-unit*.16,-unit*.55);
  ctx.lineTo(-unit*.095,-unit*.52);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle="rgba(154,131,91,.66)";
  ctx.lineWidth=unit*.006;
  ctx.beginPath();
  ctx.moveTo(-unit*.2,-unit*.14);
  ctx.lineTo(-unit*.18,-unit*.19);
  ctx.lineTo(unit*.12,-unit*.2);
  ctx.lineTo(unit*.2,-unit*.15);
  ctx.moveTo(-unit*.16,-unit*.19);
  ctx.lineTo(-unit*.16,-unit*.23);
  ctx.lineTo(unit*.13,-unit*.24);
  ctx.lineTo(unit*.18,-unit*.2);
  ctx.stroke();

  ctx.strokeStyle="rgba(29,34,32,.92)";
  ctx.lineWidth=unit*.009;
  ctx.beginPath();
  ctx.moveTo(-unit*.055,-unit*.45);
  ctx.lineTo(-unit*.21,-unit*.46);
  ctx.lineTo(-unit*.23,-unit*.42);
  ctx.moveTo(-unit*.06,-unit*.32);
  ctx.lineTo(unit*.13,-unit*.34);
  ctx.lineTo(unit*.17,-unit*.31);
  ctx.stroke();

  ctx.fillStyle="rgba(29,35,34,.92)";
  for(let porthole=0;porthole<4;porthole++){
    ctx.beginPath();
    ctx.ellipse(-unit*.14+porthole*unit*.075,-unit*.12,unit*.012,unit*.016,-.08,0,Math.PI*2);
    ctx.fill();
  }

  ctx.fillStyle="rgba(38,46,40,.82)";
  ctx.beginPath();
  ctx.moveTo(-unit*.19,-unit*.23);
  ctx.lineTo(-unit*.1,-unit*.235);
  ctx.lineTo(-unit*.105,-unit*.33);
  ctx.lineTo(-unit*.16,-unit*.37);
  ctx.lineTo(-unit*.2,-unit*.34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle="rgba(157,131,88,.62)";
  ctx.beginPath();
  ctx.moveTo(-unit*.205,-unit*.23);
  ctx.lineTo(-unit*.085,-unit*.235);
  ctx.lineTo(-unit*.085,-unit*.25);
  ctx.lineTo(-unit*.205,-unit*.245);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle="rgba(111,124,101,.62)";
  ctx.lineWidth=unit*.005;
  ctx.beginPath();
  ctx.moveTo(-unit*.22,-unit*.13);
  ctx.lineTo(-unit*.24,-unit*.31);
  ctx.moveTo(unit*.18,-unit*.15);
  ctx.lineTo(unit*.22,-unit*.25);
  ctx.stroke();

  ctx.fillStyle="rgba(100,123,99,.5)";
  ctx.beginPath();
  ctx.ellipse(-unit*.11,-unit*.16,unit*.018,unit*.009,-.3,0,Math.PI*2);
  ctx.ellipse(unit*.02,-unit*.18,unit*.022,unit*.01,.2,0,Math.PI*2);
  ctx.ellipse(unit*.14,-unit*.15,unit*.016,unit*.008,-.2,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawOceanBubbles(time,dt){
  oceanBubbles.forEach(bubble=>{
    bubble.y-=bubble.rise*dt;
    bubble.x+=bubble.drift*dt+Math.sin(time*.001+ bubble.phase)*.16;
    if(bubble.y<-bubble.radius*2){
      bubble.y=H()+bubble.radius;
      bubble.x=rand(0,W());
    }
    if(bubble.x<-bubble.radius)bubble.x=W()+bubble.radius;
    if(bubble.x>W()+bubble.radius)bubble.x=-bubble.radius;
    const shimmer=.25+.18*(.5+.5*Math.sin(time*.002+bubble.phase));
    ctx.beginPath();
    ctx.arc(bubble.x,bubble.y,bubble.radius,0,Math.PI*2);
    ctx.fillStyle=`rgba(135,225,244,${shimmer*.22})`;
    ctx.fill();
    ctx.strokeStyle=`rgba(193,246,255,${shimmer})`;
    ctx.lineWidth=Math.max(.7,bubble.radius*.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bubble.x-bubble.radius*.28,bubble.y-bubble.radius*.3,Math.max(.45,bubble.radius*.17),0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${shimmer*.8})`;
    ctx.fill();
  });
}

function drawOceanWhale(x,y,scale,color,tail){
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);
  const body=ctx.createLinearGradient(0,-22,0,20);
  body.addColorStop(0,"#8eb1bb");
  body.addColorStop(.32,color);
  body.addColorStop(.7,"#577d8c");
  body.addColorStop(1,"#395968");
  ctx.fillStyle=body;
  ctx.beginPath();
  ctx.moveTo(47,-1);
  ctx.bezierCurveTo(43,-15,31,-21,12,-22);
  ctx.bezierCurveTo(-10,-24,-33,-16,-43,-5);
  ctx.quadraticCurveTo(-49,1,-41,9);
  ctx.bezierCurveTo(-27,20,-4,22,16,17);
  ctx.bezierCurveTo(31,14,42,7,47,-1);
  ctx.fill();

  ctx.fillStyle="rgba(194,218,218,.9)";
  ctx.beginPath();
  ctx.moveTo(45,1);
  ctx.bezierCurveTo(31,7,12,7,-7,5);
  ctx.quadraticCurveTo(-25,5,-40,1);
  ctx.quadraticCurveTo(-29,16,-5,18);
  ctx.bezierCurveTo(17,19,36,13,45,1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle="#456b7a";
  ctx.beginPath();
  ctx.moveTo(-39,-1);
  ctx.quadraticCurveTo(-49,-4,-58,-14-tail);
  ctx.quadraticCurveTo(-66,-19-tail,-71,-15-tail);
  ctx.quadraticCurveTo(-68,-7-tail,-57,-1);
  ctx.quadraticCurveTo(-68,5+tail,-71,15+tail);
  ctx.quadraticCurveTo(-65,19+tail,-58,14+tail);
  ctx.quadraticCurveTo(-49,4,-39,2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle="#3d6373";
  ctx.beginPath();
  ctx.moveTo(1,-20);
  ctx.quadraticCurveTo(5,-30,15,-31);
  ctx.quadraticCurveTo(20,-29,20,-20);
  ctx.closePath();
  ctx.fill();

  const pectoral=ctx.createLinearGradient(-3,7,4,24);
  pectoral.addColorStop(0,"#668b98");
  pectoral.addColorStop(1,"#345766");
  ctx.fillStyle=pectoral;
  ctx.beginPath();
  ctx.moveTo(20,11);
  ctx.quadraticCurveTo(13,18,5,23);
  ctx.quadraticCurveTo(-1,25,-5,22);
  ctx.quadraticCurveTo(3,14,9,11);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle="rgba(226,243,237,.52)";
  ctx.lineWidth=1;
  for(let groove=0;groove<5;groove++){
    const x=19-groove*2.5;
    ctx.beginPath();
    ctx.moveTo(x,-8);
    ctx.bezierCurveTo(x-2,-6,x+1,-3,x-1,0);
    ctx.stroke();
  }
  ctx.strokeStyle="rgba(40,68,80,.68)";
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(45,2);
  ctx.quadraticCurveTo(40,8,29,9);
  ctx.stroke();

  ctx.fillStyle="rgba(235,248,244,.96)";
  ctx.beginPath();
  ctx.arc(34,-7,2.1,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle="#142a35";
  ctx.beginPath();
  ctx.arc(34.6,-7,1,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle="rgba(236,247,243,.8)";
  ctx.beginPath();
  ctx.ellipse(45,-2,3.6,1.5,-.15,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="rgba(61,82,91,.9)";
  ctx.beginPath();
  ctx.ellipse(-1,-19,2.1,.85,-.12,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawOceanLargeVisitors(time,dt){
  if(oceanLargeVisitors.length===0){
    oceanLargeSpawnIn-=dt;
    if(oceanLargeSpawnIn<=0){
      const species=["shark","whale","sunfish","lanternfish","swordfish"][Math.floor(rand(0,5))];
      const direction=Math.random()<.5?1:-1;
      const size=species==="whale"?2.15:species==="sunfish"?1.8:species==="lanternfish"?1.65:species==="swordfish"?1.85:1.55;
      oceanLargeVisitors.push({
        species,
        x:direction>0?-90:W()+90,
        y:H()*(species==="sunfish"||species==="lanternfish"?rand(.28,.54):rand(.2,.42)),
        direction,
        speed:species==="whale"?rand(.32,.48):species==="sunfish"?rand(.36,.54):species==="lanternfish"?rand(.3,.48):species==="swordfish"?rand(.5,.7):rand(.58,.82),
        size,
        phase:rand(0,Math.PI*2),
        withCalf:species==="whale"&&Math.random()<.48
      });
      oceanLargeSpawnIn=rand(900,1400);
    }
  }

  oceanLargeVisitors=oceanLargeVisitors.filter(visitor=>{
    visitor.x+=visitor.direction*visitor.speed*dt;
    const bob=Math.sin(time*.001+visitor.phase)*H()*.004;
    const tail=Math.sin(time*.008+visitor.phase)*4;
    const color=visitor.species==="whale"?"#729baa":visitor.species==="sunfish"?"#718b91":"#829ba8";
    ctx.save();
    ctx.translate(visitor.x,visitor.y+bob);
    if(visitor.species==="swordfish")
      ctx.rotate(Math.sin(time*.0018+visitor.phase)*.025);
    ctx.scale(visitor.direction*visitor.size,visitor.size);
    ctx.fillStyle=color;
    ctx.strokeStyle=color;
    ctx.lineJoin="round";
    ctx.shadowBlur=0;
    ctx.shadowColor="transparent";
    if(visitor.species==="whale"){
      drawOceanWhale(0,0,1,color,tail);
      if(visitor.withCalf)
        drawOceanWhale(-39,16,.55,"#91b5bd",tail*.58);
    }else if(visitor.species==="sunfish"){
      const fin=Math.sin(time*.0022+visitor.phase)*7;
      const body=ctx.createRadialGradient(8,-8,2,0,0,30);
      body.addColorStop(0,"#d3d5c8");
      body.addColorStop(.5,"#9ba9a3");
      body.addColorStop(1,"#5a7077");
      ctx.fillStyle=body;
      ctx.save();
      ctx.scale(1.08,1.06);
      ctx.beginPath();
      ctx.moveTo(20,-3);
      ctx.quadraticCurveTo(18,-19,5,-25);
      ctx.quadraticCurveTo(-12,-31,-24,-17);
      ctx.quadraticCurveTo(-31,-7,-29,5);
      ctx.quadraticCurveTo(-27,21,-11,27);
      ctx.quadraticCurveTo(7,31,19,14);
      ctx.quadraticCurveTo(24,6,20,-3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(214,224,213,.62)";
      ctx.lineWidth=1;
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle="rgba(224,239,230,.48)";
      ctx.fillStyle="#586f7a";
      const dorsalFin=()=>{
        ctx.save();
        ctx.translate(8,-23);
        ctx.rotate(.34);
        ctx.translate(-8,23);
        ctx.beginPath();
        ctx.moveTo(-21,-17);
        ctx.bezierCurveTo(-23,-29+fin,-17,-43+fin,-6,-49+fin);
        ctx.quadraticCurveTo(3,-41+fin,8,-23);
        ctx.quadraticCurveTo(-4,-20,-21,-17);
        ctx.closePath();
        ctx.restore();
      };
      const analFin=()=>{
        ctx.save();
        ctx.translate(8,23);
        ctx.rotate(-.34);
        ctx.translate(-8,-23);
        ctx.beginPath();
        ctx.moveTo(-19,19);
        ctx.bezierCurveTo(-21,30-fin,-15,43-fin,-5,49-fin);
        ctx.quadraticCurveTo(3,41-fin,8,23);
        ctx.quadraticCurveTo(-4,21,-19,19);
        ctx.closePath();
        ctx.restore();
      };
      dorsalFin();
      ctx.fill();
      analFin();
      ctx.fill();

      ctx.save();
      dorsalFin();
      ctx.clip();
      ctx.strokeStyle="rgba(214,229,219,.88)";
      ctx.lineWidth=1;
      for(let ray=0;ray<7;ray++){
        const x=-17+ray*5;
        ctx.beginPath();
        ctx.moveTo(x,-22);
        ctx.quadraticCurveTo(x-1,-32+fin*.4,x+3,-42+fin);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      analFin();
      ctx.clip();
      ctx.strokeStyle="rgba(214,229,219,.78)";
      for(let ray=0;ray<7;ray++){
        const x=-17+ray*5;
        ctx.beginPath();
        ctx.moveTo(x,23);
        ctx.quadraticCurveTo(x-1,32-fin*.4,x+3,42-fin);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle="rgba(224,233,217,.95)";
      ctx.beginPath();
      ctx.arc(15,-7,3.2,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#263940";
      ctx.beginPath();
      ctx.arc(16,-7,1.65,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle="rgba(49,65,68,.8)";
      ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.moveTo(18,1);
      ctx.quadraticCurveTo(22,3,18,5);
      ctx.stroke();

      ctx.fillStyle="rgba(223,230,216,.78)";
      for(let spot=0;spot<35;spot++){
        const row=Math.floor(spot/7);
        if(row===0)continue;
        const x=-24+(spot%7)*6.2+(row%2)*2.4;
        const y=-12+(row-1)*7.2;
        if(x>11&&y<-2)continue;
        const radius=.55+((spot*7)%5)*.16;
        ctx.beginPath();
        ctx.ellipse(x,y,radius,radius*1.3,spot*.3,0,Math.PI*2);
        ctx.fill();
      }
      ctx.fillStyle="#566d77";
      ctx.save();
      ctx.translate(-8,0);
      ctx.rotate(Math.sin(time*.003+visitor.phase)*.14);
      ctx.beginPath();
      ctx.moveTo(3,-2);
      ctx.quadraticCurveTo(-5,-10,-12,-8);
      ctx.quadraticCurveTo(-13,0,-5,6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle="rgba(195,213,205,.55)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(-6,-4);
      ctx.quadraticCurveTo(-11,0,-6,4);
      ctx.stroke();
      ctx.restore();
    }else if(visitor.species==="lanternfish"){
      const lanternBody=ctx.createLinearGradient(0,-12,0,12);
      lanternBody.addColorStop(0,"#8ba6ad");
      lanternBody.addColorStop(.38,"#466575");
      lanternBody.addColorStop(1,"#1b3442");
      ctx.fillStyle=lanternBody;
      ctx.beginPath();
      ctx.ellipse(-2,0,28,11,-.04,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#182b35";
      ctx.beginPath();
      ctx.moveTo(-26,-3);
      ctx.lineTo(-39,tail*.55);
      ctx.lineTo(-27,4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-13,-9);
      ctx.lineTo(-10,-17);
      ctx.lineTo(-5,-10);
      ctx.lineTo(1,-13);
      ctx.lineTo(5,-9);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-10,9);
      ctx.lineTo(-13,16);
      ctx.lineTo(-3,10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-23,-5);
      ctx.quadraticCurveTo(-27,-14,-17,-12);
      ctx.quadraticCurveTo(-13,-10,-18,-7);
      ctx.closePath();
      ctx.fillStyle="#334d58";
      ctx.fill();
      ctx.fillStyle="#dce9df";
      ctx.beginPath();
      ctx.arc(18,-3,3.1,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#142a34";
      ctx.beginPath();
      ctx.arc(18.8,-3,1.8,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle="rgba(195,217,211,.62)";
      ctx.lineWidth=.9;
      ctx.beginPath();
      ctx.moveTo(12,-1);
      ctx.quadraticCurveTo(-2,-5,-20,-1);
      ctx.stroke();
      for(let photophore=0;photophore<6;photophore++){
        const px=-19+photophore*6;
        for(const row of [-1,1]){
          ctx.beginPath();
          ctx.arc(px,6*row,1.55,0,Math.PI*2);
          ctx.fillStyle=row<0?"#d1ede0":"#9fe5d3";
          ctx.fill();
        }
      }
    }else if(visitor.species==="swordfish"){
      const swordfishBody=ctx.createLinearGradient(0,-38,0,17);
      swordfishBody.addColorStop(0,"#8ba4a8");
      swordfishBody.addColorStop(.42,"#587783");
      swordfishBody.addColorStop(1,"#344f5b");
      ctx.fillStyle=swordfishBody;
      ctx.beginPath();
      ctx.moveTo(78,-2);
      ctx.lineTo(28,-1);
      ctx.quadraticCurveTo(27,-12,15,-15);
      ctx.lineTo(9,-34);
      ctx.quadraticCurveTo(3,-42,-4,-35);
      ctx.lineTo(-8,-14);
      ctx.quadraticCurveTo(-25,-12,-32,-3);
      ctx.lineTo(-44,tail-15);
      ctx.lineTo(-40,0);
      ctx.lineTo(-44,tail+15);
      ctx.lineTo(-31,5);
      ctx.quadraticCurveTo(-11,14,10,11);
      ctx.quadraticCurveTo(25,9,30,2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle="rgba(207,224,218,.55)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(26,3);
      ctx.quadraticCurveTo(6,9,-16,6);
      ctx.stroke();

      ctx.fillStyle="#78939b";
      ctx.beginPath();
      ctx.moveTo(4,1);
      ctx.quadraticCurveTo(-3,5,-10,13);
      ctx.quadraticCurveTo(-2,11,8,5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle="rgba(34,55,63,.82)";
      ctx.lineWidth=1.2;
      for(let gill=0;gill<3;gill++){
        ctx.beginPath();
        ctx.moveTo(19-gill*4,-6);
        ctx.quadraticCurveTo(17-gill*4,0,19-gill*4,6);
        ctx.stroke();
      }
      ctx.fillStyle="#d6e3da";
      ctx.beginPath();
      ctx.arc(23,-6,2.2,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#172a34";
      ctx.beginPath();
      ctx.arc(23.5,-6,1,0,Math.PI*2);
      ctx.fill();

      ctx.strokeStyle="rgba(33,49,53,.8)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(27,3);
      ctx.quadraticCurveTo(23,6,18,5);
      ctx.stroke();
    }else{
      if(visitor.species==="shark"){
        ctx.fillStyle="#587782";
        ctx.beginPath();
        ctx.moveTo(-29,-2);
        ctx.quadraticCurveTo(-39,-8,-43,-19+tail);
        ctx.quadraticCurveTo(-42,-10+tail*.5,-39,-1);
        ctx.quadraticCurveTo(-45,0,-39,2);
        ctx.quadraticCurveTo(-41,9+tail*.5,-42,15+tail);
        ctx.quadraticCurveTo(-37,10+tail*.6,-29,5);
        ctx.closePath();
        ctx.fill();
        const sharkBody=ctx.createLinearGradient(0,-10,0,10);
        sharkBody.addColorStop(0,"#9bafb3");
        sharkBody.addColorStop(.46,"#728f99");
        sharkBody.addColorStop(1,"#526f7a");
        ctx.fillStyle=sharkBody;
      }
      ctx.beginPath();
      if(visitor.species==="shark"){
        ctx.moveTo(35,-1);
        ctx.quadraticCurveTo(29,-5,20,-7);
        ctx.quadraticCurveTo(6,-10,-9,-8);
        ctx.quadraticCurveTo(-21,-7,-28,-3);
        ctx.quadraticCurveTo(-31,-1,-32,0);
        ctx.quadraticCurveTo(-28,3,-21,5);
        ctx.quadraticCurveTo(-8,9,7,8);
        ctx.quadraticCurveTo(20,6,29,2);
        ctx.quadraticCurveTo(33,1,35,-1);
      }else{
        ctx.moveTo(33,0);
        ctx.quadraticCurveTo(18,-7,3,-7);
        ctx.lineTo(-19,-4);
        ctx.lineTo(-34,tail-8);
        ctx.lineTo(-29,0);
        ctx.lineTo(-34,tail+8);
        ctx.lineTo(-19,4);
        ctx.quadraticCurveTo(18,7,33,0);
      }
      ctx.closePath();
      ctx.fill();
      if(visitor.species==="shark"){
        ctx.fillStyle="rgba(205,218,214,.92)";
        ctx.beginPath();
        ctx.moveTo(32,1);
        ctx.quadraticCurveTo(16,4,1,5);
        ctx.quadraticCurveTo(-14,6,-28,2);
        ctx.quadraticCurveTo(-16,10,-2,9);
        ctx.quadraticCurveTo(15,8,28,3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#607e91";
        ctx.beginPath();
        ctx.moveTo(-12,-7);
        ctx.quadraticCurveTo(-10,-20,-2,-26);
        ctx.quadraticCurveTo(4,-25,9,-8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(3,6);
        ctx.quadraticCurveTo(-2,13,-12,16);
        ctx.quadraticCurveTo(-4,15,7,8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-18,-5);
        ctx.quadraticCurveTo(-20,-11,-25,-12);
        ctx.quadraticCurveTo(-23,-7,-22,-3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-19,5);
        ctx.quadraticCurveTo(-21,9,-26,10);
        ctx.quadraticCurveTo(-23,6,-20,4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle="rgba(31,51,66,.82)";
        ctx.lineWidth=1;
        for(let gill=0;gill<4;gill++){
          ctx.beginPath();
          ctx.moveTo(17-gill*3,-4);
          ctx.quadraticCurveTo(15-gill*3,0,17-gill*3,4);
          ctx.stroke();
        }
        ctx.strokeStyle="rgba(38,53,58,.88)";
        ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(34,1);
        ctx.quadraticCurveTo(27,5,19,4);
        ctx.stroke();
        ctx.fillStyle="#e5eee5";
        ctx.beginPath();
        ctx.moveTo(34,0);
        ctx.lineTo(28,2);
        ctx.lineTo(34,2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#142a34";
        ctx.beginPath();
        ctx.arc(27,-4,1.6,0,Math.PI*2);
        ctx.fill();
      }
      if(visitor.species!=="shark"){
        ctx.beginPath();
        ctx.moveTo(-3,-5);
        ctx.lineTo(2,-16);
        ctx.lineTo(8,-5);
        ctx.moveTo(-3,4);
        ctx.lineTo(6,11);
        ctx.lineTo(12,4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-3,-4);
        ctx.lineTo(3,-12);
        ctx.lineTo(7,-4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#07121b";
        ctx.beginPath();
        ctx.arc(24,-2,1.5,0,Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();
    return visitor.direction>0
      ? visitor.x<W()+100
      : visitor.x>-100;
  });
}

function createOceanPulse(x,y){
  oceanPulses.push({x,y,radius:4,life:1});
  const scareRadius=Math.min(W(),H())*.2;
  oceanFish.forEach(fish=>{
    if(Math.hypot(fish.x-x,fish.y-y)>scareRadius)
      return;
    fish.direction=fish.x<x?-1:1;
    fish.fleeY=fish.y<y?-1:1;
    fish.fleeTimer=rand(75,125);
  });
  oceanCreatures.forEach(creature=>{
    if(creature.groundDweller||Math.hypot(creature.x-x,creature.y-y)>scareRadius)
      return;
    creature.direction=creature.x<x?-1:1;
    creature.fleeTimer=rand(75,125);
  });
}
