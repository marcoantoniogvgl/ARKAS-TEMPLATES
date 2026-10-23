let tesseractVertices=[];
let tesseractEdges=[];
let tesseractFaces=[];

function buildGeometricOrbits(){
  tesseractVertices=Array.from({length:16},(_,index)=>
    Array.from({length:4},(_,axis)=>index&(1<<axis)?1:-1)
  );
  tesseractEdges=[];
  tesseractVertices.forEach((_,index)=>{
    for(let axis=0;axis<4;axis++){
      if(index&(1<<axis))continue;
      tesseractEdges.push({a:index,b:index|(1<<axis),axis});
    }
  });
  tesseractFaces=[];
  for(let axisA=0;axisA<4;axisA++){
    for(let axisB=axisA+1;axisB<4;axisB++){
      for(let sideA=0;sideA<2;sideA++){
        for(let sideB=0;sideB<2;sideB++){
          const vertices=[];
          tesseractVertices.forEach((_,index)=>{
            const fixedA=(index>>axisA)&1;
            const fixedB=(index>>axisB)&1;
            if(fixedA===sideA&&fixedB===sideB)
              vertices.push(index);
          });
          tesseractFaces.push({vertices,hueIndex:(axisA+axisB+sideA+sideB)%2});
        }
      }
    }
  }
}

function drawGeometricOrbits(time,dt){
  clear();
  const settings=getEffectSettings("orbits");
  const hues=[hexToHue(settings.color),hexToHue(settings.secondaryColor)];
  const centerX=W()*.5;
  const centerY=H()*.5;
  const angle=time*.0002;
  const scale=Math.min(W()*.29,H()*.31)*settings.scale;

  const projected=tesseractVertices.map(vertex=>{
    const point=vertex.slice();
    rotateTesseractPlane(point,0,1,angle*.72);
    rotateTesseractPlane(point,0,2,angle*.41);
    rotateTesseractPlane(point,0,3,angle*1.02);
    rotateTesseractPlane(point,1,2,-angle*.57);
    rotateTesseractPlane(point,1,3,angle*.79);
    rotateTesseractPlane(point,2,3,-angle*.66);

    const perspective4D=3/(4.4-point[3]);
    const x3=point[0]*perspective4D;
    const y3=point[1]*perspective4D;
    const z3=point[2]*perspective4D;
    const perspective3D=4/(5.2-z3);
    return {
      x:centerX+x3*scale*perspective3D,
      y:centerY+y3*scale*perspective3D,
      depth:z3+point[3]*.55,
      w:point[3]
    };
  });

  ctx.save();
  ctx.globalCompositeOperation="screen";
  ctx.shadowBlur=13*settings.intensity;
  const edges=tesseractEdges.slice().sort((left,right)=>{
    const leftDepth=(projected[left.a].depth+projected[left.b].depth)*.5;
    const rightDepth=(projected[right.a].depth+projected[right.b].depth)*.5;
    return leftDepth-rightDepth;
  });
  const faces=tesseractFaces.map(face=>{
    const points=face.vertices.map(index=>projected[index]);
    return {
      face,
      points,
      depth:points.reduce((sum,point)=>sum+point.depth,0)/points.length
    };
  }).sort((left,right)=>left.depth-right.depth);
  faces.forEach(({face,points,depth})=>{
    const center=points.reduce((sum,point)=>({x:sum.x+point.x/points.length,y:sum.y+point.y/points.length}),{x:0,y:0});
    points.sort((a,b)=>
      Math.atan2(a.y-center.y,a.x-center.x)-Math.atan2(b.y-center.y,b.x-center.x)
    );
    const hue=hues[face.hueIndex];
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    points.slice(1).forEach(point=>ctx.lineTo(point.x,point.y));
    ctx.closePath();
    ctx.fillStyle=`hsla(${hue},92%,62%,${clamp(.035+(depth+1.5)*.018,.025,.09)})`;
    ctx.fill();
  });
  edges.forEach(edge=>{
    const start=projected[edge.a];
    const end=projected[edge.b];
    const depth=(start.depth+end.depth)*.5;
    const alpha=clamp(.35+(depth+1.7)*.19,.24,.86);
    const hue=edge.axis===3?hues[1]:hues[0];
    ctx.beginPath();
    ctx.moveTo(start.x,start.y);
    ctx.lineTo(end.x,end.y);
    ctx.strokeStyle=`hsla(${hue},96%,${edge.axis===3?78:70}%,${alpha})`;
    ctx.lineWidth=edge.axis===3?1.7:1.05;
    ctx.shadowColor=`hsla(${hue},100%,70%,.8)`;
    ctx.stroke();
  });

  projected.forEach(point=>{
    const hue=point.w>0?hues[1]:hues[0];
    const radius=2.1+clamp((point.depth+1.5)*.55,0,1.8);
    const glow=ctx.createRadialGradient(point.x,point.y,0,point.x,point.y,radius*5.5);
    glow.addColorStop(0,`hsla(${hue},100%,86%,.95)`);
    glow.addColorStop(.2,`hsla(${hue},100%,70%,.34)`);
    glow.addColorStop(1,"transparent");
    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(point.x,point.y,radius*5.5,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(point.x,point.y,radius,0,Math.PI*2);
    ctx.fillStyle=`hsla(${hue},100%,94%,.95)`;
    ctx.fill();
  });

  ctx.restore();
}

function rotateTesseractPlane(point,axisA,axisB,angle){
  const a=point[axisA];
  const b=point[axisB];
  const cosine=Math.cos(angle);
  const sine=Math.sin(angle);
  point[axisA]=a*cosine-b*sine;
  point[axisB]=a*sine+b*cosine;
}

