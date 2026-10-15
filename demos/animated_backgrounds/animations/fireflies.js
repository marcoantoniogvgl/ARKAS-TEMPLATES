function buildParticles(){
  const settings=getEffectSettings("particles");
  const amount=settings.amount;
  const baseHue=hexToHue(settings.color);

  particles = Array.from(
    {length:amount},
    () => ({
      x:rand(0,W()),
      y:rand(0,H()),

      vx:rand(-.35,.35),
      vy:rand(-.35,.35),

      r:rand(.5,1.9),

      phase:rand(0,Math.PI*2),
      hue:settings.multicolor
        ? rand(0,360)
        : baseHue+rand(-8,8)
    })
  );

}

function drawParticles(time,dt){

  clear();
  const settings=getEffectSettings("particles");

  particles.forEach(p=>{

    const dx=mouse.x-p.x;
    const dy=mouse.y-p.y;
    const d=Math.hypot(dx,dy);

    if(mouse.active&&d<175){

      const f=(1-d/175)*.055*settings.attraction;

      p.vx -=
        dx/(d||1)*f*dt;

      p.vy -=
        dy/(d||1)*f*dt;
    }

    p.vx *= Math.pow(.986,dt);
    p.vy *= Math.pow(.986,dt);

    p.vx +=
      Math.sin(time*.001+p.phase)
      *.002*dt;

    p.vy +=
      Math.cos(time*.0012+p.phase)
      *.002*dt;

    p.x += p.vx*dt;
    p.y += p.vy*dt;

    if(p.x<0)p.x=W();
    if(p.x>W())p.x=0;
    if(p.y<0)p.y=H();
    if(p.y>H())p.y=0;

    const a =
      .45+
      Math.sin(time*.0015+p.phase)*.3;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.r*settings.glowSize,
      0,
      Math.PI*2
    );

    ctx.fillStyle=
      `hsla(${p.hue},100%,78%,${a})`;

    ctx.shadowBlur=10*settings.glowSize;
    ctx.shadowColor=
      `hsla(${p.hue},100%,65%,.75)`;

    ctx.fill();

    ctx.shadowBlur=0;
  });

  drawSparks(dt);
}
