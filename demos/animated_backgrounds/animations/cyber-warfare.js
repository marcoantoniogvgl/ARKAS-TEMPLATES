let cyberShips = [];

let cyberShots = [];

let cyberHostileShots = [];

let cyberSpawnIn = 0;

let cyberBoss = null;

let cyberShipId = 0;

let cyberKills = 0;

let cyberWeapons = [3,3];

let cyberWeaponRepair = [0,0];

function buildCyberStars(){

  stars = Array.from(
    {length:95},
    () => ({

      x:rand(0,W()),
      y:rand(0,H()),

      r:rand(.4,1.7),

      a:rand(.2,.8),

      tw:rand(0,6.28)
    })
  );

  cyberShips=[];
  cyberShots=[];
  cyberHostileShots=[];
  cyberSpawnIn=rand(1.8,3.2);
}

function drawCyber(time,dt){

  clear();

  const glow=ctx.createRadialGradient(
    W()*.5,
    H()*.52,
    0,
    W()*.5,
    H()*.52,
    Math.max(W(),H())*.72
  );
  glow.addColorStop(0,"rgba(255,114,35,.2)");
  glow.addColorStop(.38,"rgba(247,43,112,.12)");
  glow.addColorStop(1,"rgba(255,169,45,0)");
  ctx.fillStyle=glow;
  ctx.fillRect(0,0,W(),H());
  drawCyberWeapons(dt);

  for(let i=0;i<7;i++){
    const x=W()*(.08+((i*.173+time*.000008)% .84));
    const y=H()*(.16+((i*.271)% .68));
    const radius=22+10*Math.sin(time*.0014+i*1.9);
    const ember=ctx.createRadialGradient(x,y,0,x,y,radius);
    ember.addColorStop(0,"rgba(255,225,132,.44)");
    ember.addColorStop(.22,"rgba(255,108,48,.2)");
    ember.addColorStop(1,"rgba(255,75,48,0)");
    ctx.fillStyle=ember;
    ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }

  stars.forEach(s=>{

    const a=
      s.a*
      (
        .5+
        .5*
        Math.sin(
          time*.002+s.tw
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
      `rgba(255,204,135,${a})`;

    ctx.fill();
  });

  pulses=pulses.filter(p=>{

    p.r +=
      p.speed*dt;

    p.a *=
      Math.pow(.982,dt);

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.strokeStyle=`hsla(${p.hue},100%,72%,${p.a*.48})`;
    ctx.lineWidth=1.5;
    ctx.shadowBlur=17;
    ctx.shadowColor=`hsla(${p.hue},100%,65%,.72)`;
    ctx.stroke();
    ctx.shadowBlur=0;

    return (
      p.r<
      Math.max(W(),H())*.9 &&
      p.a>.025
    );
  });

  // Holographic crystal surface.
  drawCrystalSurface(time);
  drawCyberShips(dt);
  drawCyberBoss(dt);

  shards=shards.filter(s=>{

    s.x+=s.vx*dt;
    s.y+=s.vy*dt;

    s.rot+=s.rv*dt;

    s.vx*=
      Math.pow(.985,dt);

    s.vy*=
      Math.pow(.985,dt);

    s.life-=.018*dt;

    ctx.save();

    ctx.translate(
      s.x,
      s.y
    );

    ctx.rotate(
      s.rot
    );

    ctx.strokeStyle=
      `hsla(${s.hue},100%,70%,${s.life})`;

    ctx.fillStyle=
      `hsla(${s.hue},100%,60%,${s.life*.12})`;

    ctx.beginPath();

    ctx.moveTo(
      -s.size,
      0
    );

    ctx.lineTo(
      0,
      -s.size*.55
    );

    ctx.lineTo(
      s.size,
      0
    );

    ctx.lineTo(
      0,
      s.size*.55
    );

    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();

    return s.life>0;
  });

  glitches=glitches.filter(g=>{

    g.life-=.05*dt;

    ctx.save();

    ctx.globalAlpha=g.life;

    ctx.fillStyle=
      g.hue===24
        ? "#ffb72e"
        : "#ff3d83";

    ctx.fillRect(
      g.x,
      g.y,
      g.w,
      g.h
    );

    ctx.restore();

    return g.life>0;
  });

  sparks=sparks.filter(s=>{

    s.x+=s.vx*dt;
    s.y+=s.vy*dt;

    s.vx*=
      Math.pow(.97,dt);

    s.vy*=
      Math.pow(.97,dt);

    s.life-=.018*dt;

    ctx.beginPath();

    ctx.moveTo(
      s.x,
      s.y
    );

    ctx.lineTo(
      s.x-s.vx*5,
      s.y-s.vy*5
    );

    ctx.strokeStyle=
      `hsla(${s.hue},100%,72%,${s.life})`;

    ctx.lineWidth=s.width;

    ctx.stroke();

    return s.life>0;
  });

  if(Math.random()<.025){

    glitches.push({

      x:rand(0,W()),

      y:rand(0,H()),

      w:rand(8,80),

      h:rand(1,5),

      life:1,

      hue:
        Math.random()>.5
          ? 24
          : 346
    });
  }

}

function drawCyberShips(dt){
  const settings=getEffectSettings("cyber");
  cyberSpawnIn-=dt/60;
  if(cyberSpawnIn<=0&&cyberShips.length<settings.amount){
    const direction=Math.random()<.5?1:-1;
    const isShip=Math.random()<.62;
    cyberShips.push({
      id:cyberShipId++,
      x:direction>0?-45:W()+45,
      y:rand(H()*.12,H()*.83),
      vx:direction*rand(2.5,4.1),
      vy:rand(-.24,.24),
      flightPhase:rand(0,Math.PI*2),
      direction,
      type:Math.floor(rand(0,5)),
      kind:isShip?"ship":["crate","wheel","debris","satellite"][Math.floor(rand(0,4))],
      size:isShip?rand(18,29):rand(17,32),
      fireIn:rand(.2,.8),
      phase:rand(0,Math.PI*2),
      hue:[28,345,185,48,275,195,65,310][Math.floor(rand(0,8))]
    });
    cyberSpawnIn=rand(1.8,3.2)/settings.spawnRate;
  }

  cyberShips=cyberShips.filter(ship=>{
    ship.vy=Math.sin(ambientClock*.028+ship.flightPhase)*.8;
    ship.x+=ship.vx*dt;
    ship.y+=ship.vy*dt;
    if(ship.y<ship.size*.7||ship.y>H()-ship.size*.7)
      ship.vy*=-1;
    ship.fireIn-=dt/60;

    if(ship.kind==="ship"&&ship.fireIn<=0){
      const speed=rand(4.5,7);
      const heading=Math.atan2(ship.vy,ship.vx);
      cyberHostileShots.push({
        x:ship.x+Math.cos(heading)*ship.size*.8,
        y:ship.y+Math.sin(heading)*ship.size*.8,
        vx:Math.cos(heading)*speed,
        vy:Math.sin(heading)*speed,
        life:1,
        hue:ship.hue,
        target:null,
        sourceId:ship.id
      });
      ship.fireIn=rand(.35,.8);
    }

    drawCyberShip(ship);
    return ship.direction>0?ship.x<W()+55:ship.x>-55;
  });

  const collidedShips=new Set();
  for(let i=0;i<cyberShips.length;i++){
    const a=cyberShips[i];
    if(a.kind!=="ship")
      continue;
    for(let j=i+1;j<cyberShips.length;j++){
      const b=cyberShips[j];
      if(b.kind!=="ship")
        continue;
      if(
        !collidedShips.has(a.id)&&
        !collidedShips.has(b.id)&&
        Math.hypot(a.x-b.x,a.y-b.y)<(a.size+b.size)*.42
      ){
        collidedShips.add(a.id);
        collidedShips.add(b.id);
        explodeCyberShip(a);
        explodeCyberShip(b);
      }
    }
  }
  if(collidedShips.size){
    cyberShips=cyberShips.filter(ship=>!collidedShips.has(ship.id));
  }

  cyberShots=cyberShots.filter(shot=>{
    const previousX=shot.x;
    const previousY=shot.y;
    shot.x+=shot.vx*dt;
    shot.y+=shot.vy*dt;

    const hitIndex=cyberShips.findIndex(ship=>
      pointToSegmentDistance(
        ship.x,
        ship.y,
        previousX,
        previousY,
        shot.x,
        shot.y
      )<ship.size*.72
    );

    if(hitIndex>=0){
      const [ship]=cyberShips.splice(hitIndex,1);
      explodeCyberShip(ship,true);
      return false;
    }

    shot.life-=.012*dt;
    ctx.beginPath();
    ctx.moveTo(shot.x,shot.y);
    ctx.lineTo(shot.x-shot.vx*5,shot.y-shot.vy*5);
    ctx.strokeStyle=`hsla(${shot.hue},100%,72%,${shot.life})`;
    ctx.lineWidth=2;
    ctx.shadowBlur=12;
    ctx.shadowColor=`hsla(${shot.hue},100%,65%,.9)`;
    ctx.stroke();
    ctx.shadowBlur=0;
    return shot.life>0&&
      shot.x>-30&&
      shot.x<W()+30&&
      shot.y>-30&&
      shot.y<H()+30;
  });

  cyberHostileShots=cyberHostileShots.filter(shot=>{
    const previousX=shot.x;
    const previousY=shot.y;
    shot.x+=shot.vx*dt;
    shot.y+=shot.vy*dt;
    shot.life-=.009*dt;

    if(shot.target===null){
      const hitIndex=cyberShips.findIndex(object=>
        object.id!==shot.sourceId&&
        pointToSegmentDistance(
          object.x,
          object.y,
          previousX,
          previousY,
          shot.x,
          shot.y
        )<object.size*.72
      );
      if(hitIndex>=0){
        const [target]=cyberShips.splice(hitIndex,1);
        explodeCyberShip(target);
        return false;
      }

      if(cyberBoss&&pointToSegmentDistance(
        cyberBoss.x,
        cyberBoss.y,
        previousX,
        previousY,
        shot.x,
        shot.y
      )<cyberBoss.size*.72){
        damageCyberBoss(cyberBoss);
        return false;
      }
    }

    if(shot.target!==null&&cyberWeapons[shot.target]>0){
      const weaponX=shot.target===0?18:W()-18;
      if(Math.hypot(shot.x-weaponX,shot.y-18)<14){
        cyberWeapons[shot.target]=Math.max(0,cyberWeapons[shot.target]-1);
        for(let i=0;i<12;i++){
          const angle=rand(0,Math.PI*2);
          const speed=rand(.8,3);
          sparks.push({
            x:weaponX,y:18,
            vx:Math.cos(angle)*speed,
            vy:Math.sin(angle)*speed,
            life:rand(.35,.8),
            width:rand(.8,2),
            hue:35
          });
        }
        return false;
      }
    }

    ctx.beginPath();
    ctx.moveTo(shot.x,shot.y);
    ctx.lineTo(shot.x-shot.vx*4,shot.y-shot.vy*4);
    ctx.strokeStyle=`hsla(${shot.hue},100%,72%,${shot.life})`;
    ctx.lineWidth=shot.target===null?1.3:3;
    ctx.shadowBlur=shot.target===null?7:15;
    ctx.shadowColor=`hsla(${shot.hue},100%,65%,.9)`;
    ctx.stroke();
    ctx.shadowBlur=0;
    return shot.life>0&&shot.x>-30&&shot.x<W()+30&&shot.y>-30&&shot.y<H()+30;
  });
}

function pointToSegmentDistance(px,py,x1,y1,x2,y2){
  const dx=x2-x1;
  const dy=y2-y1;
  const lengthSquared=dx*dx+dy*dy;
  const t=lengthSquared
    ? clamp(((px-x1)*dx+(py-y1)*dy)/lengthSquared,0,1)
    : 0;

  return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));
}

function drawCyberWeapons(dt){
  const mountY=18;

  [18,W()-18].forEach((x,index)=>{
    if(cyberWeapons[index]<=0){
      const repair=cyberWeaponRepair[index];
      if(repair<=0){
        drawCyberHammer(x,mountY,1);
        return;
      }

      cyberWeaponRepair[index]=Math.max(0,repair-dt/60);
      if(cyberWeaponRepair[index]===0){
        cyberWeapons[index]=3;
        return;
      }

      drawCyberHammer(x,mountY,1-cyberWeaponRepair[index]/5);
      return;
    }
    const angle=Math.atan2(mouse.y-mountY,mouse.x-x);
    ctx.save();
    ctx.translate(x,mountY+3);
    ctx.fillStyle="rgba(9,15,23,.9)";
    ctx.strokeStyle="rgba(255,185,104,.66)";
    ctx.lineWidth=1.1;
    ctx.beginPath();
    ctx.ellipse(0,0,15,6,0,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle="rgba(91,49,40,.95)";
    ctx.beginPath();
    ctx.moveTo(-8,-1);
    ctx.lineTo(-6,9);
    ctx.lineTo(7,9);
    ctx.lineTo(9,-1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x,mountY);
    ctx.rotate(angle);
    ctx.shadowBlur=14;
    ctx.shadowColor="rgba(255,112,62,.7)";

    const armor=ctx.createLinearGradient(0,-12,0,12);
    armor.addColorStop(0,"#ffe0a1");
    armor.addColorStop(.18,"#b36b4c");
    armor.addColorStop(.52,"#3c3540");
    armor.addColorStop(1,"#171e2b");
    ctx.beginPath();
    ctx.moveTo(-13,-8);
    ctx.lineTo(-9,-12);
    ctx.lineTo(7,-11);
    ctx.lineTo(14,-7);
    ctx.lineTo(15,7);
    ctx.lineTo(7,11);
    ctx.lineTo(-12,9);
    ctx.lineTo(-16,4);
    ctx.closePath();
    ctx.fillStyle=armor;
    ctx.fill();
    ctx.strokeStyle="rgba(255,201,132,.9)";
    ctx.lineWidth=1.15;
    ctx.stroke();

    const barrel=ctx.createLinearGradient(2,-5,2,5);
    barrel.addColorStop(0,"#ffcf83");
    barrel.addColorStop(.34,"#ee754c");
    barrel.addColorStop(.7,"#713d3f");
    barrel.addColorStop(1,"#251f2b");
    ctx.fillStyle=barrel;
    ctx.strokeStyle="rgba(255,205,144,.78)";
    ctx.lineWidth=.9;
    ctx.beginPath();
    ctx.moveTo(3,-5);
    ctx.lineTo(23,-4);
    ctx.lineTo(28,-2.5);
    ctx.lineTo(28,2.5);
    ctx.lineTo(23,4);
    ctx.lineTo(3,5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle="rgba(30,21,25,.9)";
    ctx.fillRect(8,-1.4,18,2.8);
    ctx.fillStyle="rgba(255,236,196,.96)";
    ctx.fillRect(26,-2.2,3,4.4);
    ctx.fillStyle="rgba(255,214,151,.85)";
    ctx.fillRect(-5,-8,8,2);
    ctx.fillRect(-5,6,8,2);
    ctx.fillStyle="rgba(255,196,112,.8)";
    ctx.fillRect(-11,-5,2,2);
    ctx.fillRect(-11,3,2,2);
    ctx.shadowBlur=0;
    ctx.restore();

    ctx.fillStyle="rgba(255,255,255,.18)";
    ctx.fillRect(x-13,35,26,3);
    ctx.fillStyle=cyberWeapons[index]===1?"#ff4c59":"#ffc36b";
    ctx.fillRect(x-13,35,26*cyberWeapons[index]/3,3);
  });
}

function drawCyberHammer(x,y,progress){
  ctx.save();
  ctx.translate(x,y);
  ctx.strokeStyle="rgba(255,224,166,.95)";
  ctx.fillStyle="rgba(255,150,69,.92)";
  ctx.lineWidth=2.4;
  ctx.lineCap="round";
  ctx.shadowBlur=10;
  ctx.shadowColor="#ffad55";
  ctx.beginPath();
  ctx.moveTo(-6,7);
  ctx.lineTo(6,-7);
  ctx.stroke();
  ctx.fillRect(1,-12,12,6);
  ctx.strokeRect(1,-12,12,6);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x,y,19,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);
  ctx.strokeStyle="rgba(255,205,119,.95)";
  ctx.lineWidth=2;
  ctx.shadowBlur=9;
  ctx.shadowColor="#ffad55";
  ctx.stroke();
  ctx.shadowBlur=0;
}

function fireCyberWeapons(){
  [18,W()-18].forEach((x,index)=>{
    if(cyberWeapons[index]<=0)
      return;
    const originY=18;
    const angle=Math.atan2(mouse.y-originY,mouse.x-x);
    const muzzleDistance=29;
    const speed=12;

    cyberShots.push({
      x:x+Math.cos(angle)*muzzleDistance,
      y:originY+Math.sin(angle)*muzzleDistance,
      vx:Math.cos(angle)*speed,
      vy:Math.sin(angle)*speed,
      life:2.4,
      hue:x<W()*.5?28:346
    });
  });
}

function explodeCyberShip(ship,countsTowardBoss=false){
  shatterCrystal(ship.x,ship.y);
  pulses.push({
    x:ship.x,
    y:ship.y,
    r:5,
    speed:8,
    a:1,
    hue:ship.hue
  });
  if(ship.kind==="ship"&&countsTowardBoss){
    cyberKills++;
  }
  if(cyberKills>=10&&!cyberBoss){
    cyberBoss={
      x:W()*rand(.3,.7),
      y:H()+65,
      vx:rand(3.4,4.8)*(Math.random()<.5?-1:1),
      size:68,
      health:10,
      phase:rand(0,Math.PI*2),
      fireIn:.65,
      entered:false
    };
    cyberKills=0;
  }
}

function drawCyberShip(ship){
  if(ship.kind!=="ship"){
    drawCyberObject(ship);
    return;
  }
  const s=ship.size;
  const silhouettes=[
    [[1,0],[.22,-.34],[-.55,-.25],[-.32,0],[-.55,.25],[.22,.34]],
    [[.95,0],[.12,-.2],[-.12,-.58],[-.34,-.22],[-.64,-.18],[-.3,0],[-.64,.18],[-.34,.22],[-.12,.58],[.12,.2]],
    [[1,0],[-.28,-.46],[-.16,-.13],[-.62,-.3],[-.48,0],[-.62,.3],[-.16,.13],[-.28,.46]],
    [[.82,0],[.48,-.18],[.1,-.26],[-.38,-.2],[-.58,0],[-.38,.2],[.1,.26],[.48,.18]],
    [[1,0],[.2,-.16],[-.18,-.52],[-.4,-.17],[-.7,-.28],[-.45,0],[-.7,.28],[-.4,.17],[-.18,.52],[.2,.16]]
  ];

  ctx.save();
  ctx.translate(ship.x,ship.y);
  ctx.rotate(Math.atan2(ship.vy,ship.vx));
  ctx.scale(s,s);

  const flame=.18+.12*Math.sin(ambientClock*.35+ship.phase);
  ctx.beginPath();
  ctx.moveTo(-.5,-.1);
  ctx.lineTo(-.5-flame,0);
  ctx.lineTo(-.5,.1);
  ctx.closePath();
  ctx.fillStyle=`hsla(${ship.hue},100%,66%,.8)`;
  ctx.shadowBlur=12;
  ctx.shadowColor=`hsla(${ship.hue},100%,60%,.9)`;
  ctx.fill();

  ctx.beginPath();
  silhouettes[ship.type].forEach(([x,y],index)=>{
    if(index===0)ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });
  ctx.closePath();
  ctx.fillStyle=`hsla(${ship.hue},75%,58%,.82)`;
  ctx.strokeStyle=`hsla(${ship.hue},100%,84%,.95)`;
  ctx.lineWidth=.045;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(.22,0,.18,.1,0,0,Math.PI*2);
  ctx.fillStyle="rgba(255,255,255,.92)";
  ctx.shadowBlur=10;
  ctx.shadowColor="#fff";
  ctx.fill();
  ctx.restore();
}

function drawCyberObject(object){
  ctx.save();
  ctx.translate(object.x,object.y);
  ctx.rotate(ambientClock*.018+object.phase);
  ctx.strokeStyle=`hsla(${object.hue},100%,78%,.95)`;
  ctx.fillStyle=`hsla(${object.hue},85%,52%,.3)`;
  ctx.lineWidth=1.7;
  ctx.shadowBlur=12;
  ctx.shadowColor=`hsla(${object.hue},100%,60%,.85)`;
  const s=object.size;

  if(object.kind==="crate"){
    ctx.fillRect(-s*.42,-s*.42,s*.84,s*.84);
    ctx.strokeRect(-s*.42,-s*.42,s*.84,s*.84);
    ctx.beginPath();
    ctx.moveTo(-s*.4,-s*.4);
    ctx.lineTo(s*.4,s*.4);
    ctx.moveTo(s*.4,-s*.4);
    ctx.lineTo(-s*.4,s*.4);
    ctx.stroke();
  }else if(object.kind==="wheel"){
    ctx.beginPath();
    ctx.arc(0,0,s*.42,0,Math.PI*2);
    ctx.arc(0,0,s*.2,0,Math.PI*2);
    ctx.stroke();
    for(let i=0;i<8;i++){
      const angle=i*Math.PI/4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle)*s*.2,Math.sin(angle)*s*.2);
      ctx.lineTo(Math.cos(angle)*s*.42,Math.sin(angle)*s*.42);
      ctx.stroke();
    }
  }else if(object.kind==="satellite"){
    ctx.fillRect(-s*.18,-s*.18,s*.36,s*.36);
    ctx.strokeRect(-s*.18,-s*.18,s*.36,s*.36);
    ctx.strokeRect(-s*.62,-s*.12,s*.34,s*.24);
    ctx.strokeRect(s*.28,-s*.12,s*.34,s*.24);
  }else{
    ctx.beginPath();
    ctx.moveTo(0,-s*.55);
    ctx.lineTo(s*.45,-s*.08);
    ctx.lineTo(s*.26,s*.48);
    ctx.lineTo(-s*.4,s*.3);
    ctx.lineTo(-s*.52,-s*.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s*.2,-s*.08);
    ctx.lineTo(s*.2,s*.12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCyberBoss(dt){
  if(!cyberBoss)
    return;
  const boss=cyberBoss;

  if(boss.y>H()*.25){
    boss.y-=5.2*dt;
    if(boss.y<=H()*.25)
      boss.entered=true;
  }else{
    boss.x+=boss.vx*dt;
    if(boss.x<boss.size||boss.x>W()-boss.size)
      boss.vx*=-1;
    boss.y=H()*.25+Math.sin(ambientClock*.04+boss.phase)*H()*.035;
  }

  boss.fireIn-=dt/60;
  if(boss.fireIn<=0){
    const targets=cyberWeapons
      .map((health,index)=>health>0?index:-1)
      .filter(index=>index>=0);
    if(targets.length){
      const target=targets[Math.floor(rand(0,targets.length))];
      const targetX=target===0?18:W()-18;
      const sourceY=boss.y+boss.size*.52;
      const dx=targetX-boss.x;
      const dy=18-sourceY;
      const distance=Math.hypot(dx,dy)||1;
      const speed=7.2;
      cyberHostileShots.push({
        x:boss.x,y:sourceY,
        vx:dx/distance*speed,
        vy:dy/distance*speed,
        life:2.8,
        hue:42,
        target
      });
    }
    boss.fireIn=rand(.45,.75);
  }

  const s=boss.size;
  ctx.save();
  ctx.translate(boss.x,boss.y);
  ctx.fillStyle="rgba(255,93,43,.16)";
  ctx.strokeStyle="rgba(255,185,91,.98)";
  ctx.lineWidth=2;
  ctx.shadowBlur=28;
  ctx.shadowColor="#ff6b39";
  ctx.beginPath();
  ctx.moveTo(-s,-s*.15);
  ctx.lineTo(-s*.68,-s*.48);
  ctx.lineTo(-s*.26,-s*.34);
  ctx.lineTo(0,-s*.62);
  ctx.lineTo(s*.26,-s*.34);
  ctx.lineTo(s*.68,-s*.48);
  ctx.lineTo(s,-s*.15);
  ctx.lineTo(s*.69,s*.3);
  ctx.lineTo(s*.25,s*.39);
  ctx.lineTo(0,s*.57);
  ctx.lineTo(-s*.25,s*.39);
  ctx.lineTo(-s*.69,s*.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle="rgba(36,15,14,.9)";
  ctx.fillRect(-s*.45,-4,s*.9,8);
  ctx.fillStyle="#fff0b2";
  ctx.shadowBlur=18;
  ctx.fillRect(-s*.45,-4,s*.9*(boss.health/10),8);
  ctx.restore();

  const hit=cyberShots.findIndex(shot=>
    pointToSegmentDistance(
      boss.x,boss.y,
      shot.x-shot.vx*2,shot.y-shot.vy*2,
      shot.x,shot.y
    )<s*.75
  );
  if(hit>=0){
    cyberShots.splice(hit,1);
    damageCyberBoss(boss);
  }
}

function damageCyberBoss(boss){
  if(cyberBoss!==boss)
    return;
  boss.health=Math.max(0,boss.health-1);
  sparks.push({
    x:boss.x+rand(-boss.size*.5,boss.size*.5),
    y:boss.y+rand(-boss.size*.4,boss.size*.4),
    vx:rand(-2,2),vy:rand(-2,2),
    life:.65,width:2,hue:35
  });
  if(boss.health===0){
    explodeCyberShip({x:boss.x,y:boss.y,hue:35,kind:"boss"});
    cyberBoss=null;
    cyberKills=0;
  }
}

function drawCrystalSurface(time){

  const x=W()*.5;
  const y=H()*.51;

  const w=
    Math.min(
      W()*.54,
      480
    );

  const h=
    Math.min(
      H()*.48,
      270
    );

  const grad=
    ctx.createLinearGradient(
      x-w/2,
      y-h/2,
      x+w/2,
      y+h/2
    );

  grad.addColorStop(
    0,
    "rgba(255,129,36,.12)"
  );

  grad.addColorStop(
    .45,
    "rgba(255,255,255,.025)"
  );

  grad.addColorStop(
    1,
    "rgba(255,45,115,.13)"
  );

  ctx.fillStyle=grad;

  ctx.strokeStyle=
    "rgba(255,205,123,.48)";

  ctx.lineWidth=1.2;

  ctx.beginPath();

  ctx.moveTo(
    x-w*.45,
    y-h*.5
  );

  ctx.lineTo(
    x+w*.45,
    y-h*.5
  );

  ctx.lineTo(
    x+w*.5,
    y-h*.38
  );

  ctx.lineTo(
    x+w*.5,
    y+h*.38
  );

  ctx.lineTo(
    x+w*.45,
    y+h*.5
  );

  ctx.lineTo(
    x-w*.45,
    y+h*.5
  );

  ctx.lineTo(
    x-w*.5,
    y+h*.38
  );

  ctx.lineTo(
    x-w*.5,
    y-h*.38
  );

  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle=
    `rgba(255,93,62,${.2+.1*Math.sin(time*.006)})`;

  ctx.beginPath();

  ctx.moveTo(
    x-w*.5,
    y
  );

  ctx.lineTo(
    x+w*.5,
    y
  );

  ctx.stroke();
}

function shatterCrystal(x,y){

  for(let i=0;i<16;i++){

    const a=
      rand(0,Math.PI*2);

    const s=
      rand(2,7);

    shards.push({

      x,
      y,

      vx:
        Math.cos(a)*s,

      vy:
        Math.sin(a)*s,

      rot:rand(0,6),

      rv:rand(-.08,.08),

      size:rand(5,18),

      life:1,

      hue:
        i%2
          ? 346
          : 28
    });
  }

  for(let i=0;i<26;i++){

    const a=
      rand(0,Math.PI*2);

    const s=
      rand(2,9);

    sparks.push({

      x,
      y,

      vx:
        Math.cos(a)*s,

      vy:
        Math.sin(a)*s,

      life:
        rand(.55,1),

      width:
        rand(.6,2),

      hue:
        i%2
          ? 346
          : 28
    });
  }

  for(let i=0;i<8;i++)

    glitches.push({

      x:x+rand(-90,90),

      y:y+rand(-70,70),

      w:rand(8,65),

      h:rand(1,6),

      life:1,

      hue:
        i%2
          ? 346
          : 28
    });

  pulses.push({

    x,
    y,

    r:8,

    speed:7,

    a:1,

    spin:0,

    spinV:.02,

    hue:28
  });
}
