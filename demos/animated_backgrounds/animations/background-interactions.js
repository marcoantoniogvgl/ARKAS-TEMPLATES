// Conecta los movimientos y clics del usuario con las respuestas de cada experiencia.
let mergeDropRepeatTimer=null;
let mergeDropPointerId=null;
let mergeDropPointerX=0;
const mergeDropRepeatDelay=150;

function stopMergeDropRepeat(pointerId){
  if(mergeDropPointerId!==pointerId)
    return;
  clearInterval(mergeDropRepeatTimer);
  mergeDropRepeatTimer=null;
  mergeDropPointerId=null;
}

stage.addEventListener(
  "pointermove",
  e=>{
    if(current==="orbits"){
      cursorRing.style.opacity="0";
      return;
    }

    const r=
      stage.getBoundingClientRect();

    const nextX=e.clientX-r.left;
    const nextY=e.clientY-r.top;
    if(current==="merge"&&mergeDropPointerId===e.pointerId)
      mergeDropPointerX=nextX;
    if(current==="grid"&&!gridMouseTracked){
      mouse.x=nextX;
      mouse.y=nextY;
      mouse.px=nextX;
      mouse.py=nextY;
      gridMouseTracked=true;
    }else{
      mouse.px=mouse.x;
      mouse.py=mouse.y;
      mouse.x=nextX;
      mouse.y=nextY;
    }

    mouse.vx=
      mouse.x-mouse.px;

    mouse.vy=
      mouse.y-mouse.py;

    mouse.active=true;
    if(current==="sakura"){
      const view=sakuraViewTransform();
      const treeHit=isSakuraTreeHit(nextX,nextY,view);
      const cloudHit=isSakuraCloudHit(nextX,nextY,view,treeHit);
      canvas.style.cursor=cloudHit||treeHit?"pointer":"none";
    }

    if(current==="grid"){
      const cell=gridCellFromPointer(mouse.x,mouse.y);
      traceGridCells(gridTrailCell,cell);
      gridTrailCell=cell;
    }

    if(current==="ink"&&(e.buttons&1))
      paintInkFlow(mouse.x,mouse.y,mouse.vx,mouse.vy);

    cursorRing.style.left=mouse.x+"px";
    cursorRing.style.top=mouse.y+"px";
    cursorRing.style.opacity="1";

    stage.style.setProperty(
      "--mx",
      `${mouse.x}px`
    );

    stage.style.setProperty(
      "--my",
      `${mouse.y}px`
    );
  }
);

stage.addEventListener(
  "pointerleave",
  ()=>{
    mouse.active=false;
    if(current==="grid")
      gridMouseTracked=false;
    if(current==="grid")
      gridTrailCell=null;
    cursorRing.style.opacity="0";
    if(current==="sakura")
      canvas.style.cursor="none";
  }
);

stage.addEventListener(
  "pointerdown",
  e=>{
    if(e.target.closest("#toggleStageFullscreen,#clearMergeGame,#resetBlockBreaker"))
      return;
    if(current==="orbits")
      return;

    const r=
      stage.getBoundingClientRect();

    const x=
      e.clientX-r.left;

    const y=
      e.clientY-r.top;

    mouse.px=mouse.x;
    mouse.py=mouse.y;
    mouse.x=x;
    mouse.y=y;
    mouse.active=true;
    cursorRing.style.left=x+"px";
    cursorRing.style.top=y+"px";
    cursorRing.style.opacity="1";

    if(current==="ink"&&e.button===0){
      stage.setPointerCapture(e.pointerId);
      stirInkFlow(x,y,mouse.vx,mouse.vy,true);
    }

    if(current==="catch"&&catchDodgeOver){
      resetCatchDodgeGame();
      return;
    }

    if(current==="aurora")
      createAuroraFlash(x,y);

    if(current==="cyber"){
      const weaponIndex=x<W()*.5?0:1;
      const weaponX=weaponIndex===0?18:W()-18;
      if(
        cyberWeapons[weaponIndex]<=0&&
        cyberWeaponRepair[weaponIndex]===0&&
        Math.hypot(x-weaponX,y-18)<28
      ){
        cyberWeaponRepair[weaponIndex]=5;
        return;
      }
      if(cyberWeaponRepair[weaponIndex]>0)
        return;
    }

    if(current==="bubbles"){

      let hit=-1;

      for(
        let i=bubbles.length-1;
        i>=0;
        i--
      ){

        if(
          Math.hypot(
            bubbles[i].x-x,
            bubbles[i].y-y
          )<
          bubbles[i].r
        ){

          hit=i;
          break;
        }
      }

      if(hit>=0){

        const b=
          bubbles[hit];

        explodeBubble(b);
        if(b.r<=23){
          bubbles.splice(hit,1);
        }else{
          b.r*=.62;
        }
      }
    }

    if(current==="network"){
      particles.forEach(p=>{
        const dx=p.x-x;
        const dy=p.y-y;
        const distance=Math.hypot(dx,dy);

        if(distance<280){
          const angle=distance<1
            ? rand(0,Math.PI*2)
            : Math.atan2(dy,dx);
          const force=(1-distance/280)*8;
          p.vx+=Math.cos(angle)*force;
          p.vy+=Math.sin(angle)*force;
        }
      });
    }

    if(current==="particles"){

      for(
        let i=0;
        i<particles.length;
        i++
      ){

        const p=particles[i];

        const dx=p.x-x;
        const dy=p.y-y;

        const d=
          Math.hypot(dx,dy);

        if(d<210){

          const f=
            (1-d/210)*4.8;

          p.vx +=
            dx/(d||1)*f;

          p.vy +=
            dy/(d||1)*f;
        }
      }

      for(let i=0;i<3;i++){
        const a=rand(0,Math.PI*2);
        const speed=rand(.25,.8);
        particles.push({
          x:x+rand(-12,12),
          y:y+rand(-12,12),
          vx:Math.cos(a)*speed,
          vy:Math.sin(a)*speed,
          r:rand(1.4,2.5),
          phase:rand(0,Math.PI*2),
          hue:rand(0,360)
        });
      }
    }

    if(current==="waves"){

      if(y<H()*.50){

        createLightning(
          x,
          y
        );

        for(let i=0;i<5;i++)

          sparks.push({

            x,
            y,

            vx:rand(-3,3),

            vy:rand(-3,3),

            life:rand(.4,.9),

            width:rand(.5,1.8),

            hue:190
          });

      }else{

        const depth=
          clamp(
            (y-H()*.5)/
            (H()*.43),
            .18,
            1
          );

        createWave(
          x,
          y,
          .24+depth*.12,
          false,
          depth
        );
      }
    }

    if(current==="sunset"){

      launchMeteor(
        x,
        y
      );

    }

    if(current==="cyber"){
      fireCyberWeapons();

    }

    if(current==="ocean")
      createOceanPulse(x,y);

    if(current==="merge"&&e.button===0&&mergeDropPointerId===null){
      mergeDropPointerId=e.pointerId;
      mergeDropPointerX=x;
      stage.setPointerCapture(e.pointerId);
      spawnMergeBall(x);
      mergeDropRepeatTimer=setInterval(()=>{
        if(current!=="merge"){
          stopMergeDropRepeat(mergeDropPointerId);
          return;
        }
        spawnMergeBall(mergeDropPointerX);
      },mergeDropRepeatDelay);
    }

    if(current==="prism")
      createPrismBurst(x,y);

    if(current==="breaker")
      launchBlockBreaker();

  }
);

stage.addEventListener("pointerup",event=>{
  if(current==="ink")
    resetInkPointer();
  stopMergeDropRepeat(event.pointerId);
});

stage.addEventListener("pointercancel",event=>{
  if(current==="ink")
    resetInkPointer();
  stopMergeDropRepeat(event.pointerId);
});

stage.addEventListener("lostpointercapture",event=>{
  stopMergeDropRepeat(event.pointerId);
});

canvas.addEventListener("click",event=>{
  const bounds=canvas.getBoundingClientRect();
  const x=event.clientX-bounds.left;
  const y=event.clientY-bounds.top;

  if(current==="sakura"){
    const view=sakuraViewTransform();
    const limb=findSakuraLimbAt(x,y,view);
    if(dissolveSakuraCloudAt(x,y,view,Boolean(limb)))
      return;
    createSakuraGust(x,y,view,limb);
  }
});
