// ConfiguraciÃ³n de las experiencias, controles de personalizaciÃ³n y selecciÃ³n de escenas.
const buttons = [...document.querySelectorAll(".effect")];
const customizeButton = document.getElementById("customizeButton");
const customizationPanel = document.getElementById("customizationPanel");
const customizationTitle = document.getElementById("customizationTitle");
const customizationControls = document.getElementById("customizationControls");
const customizationStatus = document.getElementById("customizationStatus");
const resetCustomizationsButton = document.getElementById("resetCustomizations");
const resetDefaultsButton = document.getElementById("resetDefaultsButton");
const settingsResetStatus = document.getElementById("settingsResetStatus");
const closeCustomizationsButton = document.getElementById("closeCustomizations");
const customColorOverlay = document.getElementById("customColorOverlay");
const stageShell = document.querySelector(".stage-shell");
const fullscreenButton = document.getElementById("toggleStageFullscreen");
const fullscreenStatus = document.getElementById("fullscreenStatus");
const customizationStorageKey = "background-lab.customizations.v1";

const effectNames = {
  aurora:"Aurora boreal",
  bubbles:"Burbujas",
  particles:"Luciérnagas",
  waves:"Lluvia marítima nocturna",
  grid:"Muro cúbico",
  orbits:"Cubo en 4D",
  ink:"Tinta líquida",
  sunset:"Día de alta montaña",
  network:"Red neuronal",
  cyber:"Guerra cibernética",
  ocean:"Jardín abisal",
  sakura:"Flores de cerezo",
  prism:"Prisma",
  merge:"Fusión de bolas",
  catch:"Atrapa y esquiva",
  breaker:"Rompebloques",
};

const customizationDefaults = {
  aurora:{color:"#32d583",secondaryColor:"#8b5cf6",speed:1,intensity:1,amount:110,width:1},
  bubbles:{color:"#38bdf8",secondaryColor:"#a78bfa",speed:1,intensity:1,amount:1,popRate:1},
  particles:{color:"#facc15",secondaryColor:"#fb7185",speed:1,intensity:1,amount:170,multicolor:true,glowSize:1,attraction:1},
  waves:{color:"#67b8ff",secondaryColor:"#b8e6ff",speed:1,intensity:1,amount:46,wind:0,dropSize:1},
  grid:{color:"#ffd600",secondaryColor:"#fff18a",speed:1,intensity:1,amount:38,maxCubes:3},
  orbits:{color:"#55e7ff",secondaryColor:"#b28cff",speed:1,intensity:1,scale:1},
  ink:{color:"#f05bcb",secondaryColor:"#42d7ff",mouseColor:"#ffd166",speed:1,intensity:1,amount:16},
  sunset:{color:"#f59e0b",secondaryColor:"#22c55e",speed:1,intensity:1,amount:4,daySpeed:1,wildlife:3},
  network:{color:"#5bcfff",secondaryColor:"#a78bfa",speed:1,intensity:1,amount:105,connectionDistance:118,crowdRadius:48},
  cyber:{color:"#ff7837",secondaryColor:"#ff3d70",speed:1,intensity:1,amount:7,spawnRate:1},
  ocean:{color:"#21e6c1",secondaryColor:"#80f7ff",speed:1,intensity:1,amount:150,fish:18},
  sakura:{color:"#ff8fab",secondaryColor:"#ffd6a5",speed:1,intensity:1,amount:3,gustStrength:1,bloomInterval:8,zoom:.8},
  prism:{color:"#5fe0ed",secondaryColor:"#ad8cff",speed:1,intensity:1,amount:7},
  merge:{color:"#5fe0ed",secondaryColor:"#ad8cff",speed:1,intensity:1},
  catch:{color:"#ffd166",secondaryColor:"#5bcfff",speed:1,intensity:1,constantSpeed:false},
  breaker:{color:"#68d7ff",secondaryColor:"#9b7bff",speed:1,intensity:1},
};

const customizationOptions = {
  orbits:{scale:{label:"Zoom del cubo 4D",min:.65,max:1.5,step:.05,unit:"×"}},
  ink:{amount:{label:"Densidad de líquidos",min:8,max:28,step:2}},
  merge:{},
  catch:{},
  breaker:{},
  prism:{amount:{label:"Capas de prisma",min:3,max:12,step:1}},
  aurora:{amount:{label:"PartÃ­culas de luz",min:40,max:220,step:5},width:{label:"Anchura de las cortinas",min:.5,max:1.8,step:.05,unit:"Ã—"}},
  bubbles:{amount:{label:"TamaÃ±o de las burbujas",min:.65,max:1.6,step:.05,unit:"Ã—"},popRate:{label:"Frecuencia de explosiÃ³n",min:.5,max:2.5,step:.1,unit:"Ã—"}},
  particles:{amount:{label:"Cantidad de luciÃ©rnagas",min:50,max:320,step:10},glowSize:{label:"TamaÃ±o del resplandor",min:.5,max:2,step:.05,unit:"Ã—"},attraction:{label:"Respuesta al cursor",min:0,max:2,step:.1,unit:"Ã—"}},
  waves:{amount:{label:"Densidad de lluvia",min:15,max:100,step:1,unit:" gotas"},wind:{label:"Viento",min:-1,max:1,step:.05,unit:"Ã—"},dropSize:{label:"TamaÃ±o de las gotas",min:.5,max:2,step:.05,unit:"Ã—"}},
  grid:{amount:{label:"TamaÃ±o de los cubos",min:24,max:70,step:2,unit:" px"},maxCubes:{label:"Cubos elevados a la vez",min:1,max:8,step:1}},
  sunset:{amount:{label:"Cantidad de pÃ¡jaros",min:0,max:20,step:1},daySpeed:{label:"Velocidad del ciclo dÃ­a/noche",min:.4,max:3,step:.1,unit:"Ã—"},wildlife:{label:"Animales visibles",min:0,max:10,step:1}},
  network:{amount:{label:"Nodos de la red",min:35,max:170,step:5},connectionDistance:{label:"Distancia de conexiÃ³n",min:60,max:190,step:2,unit:" px"},crowdRadius:{label:"Radio para cambiar al color secundario",min:24,max:90,step:2,unit:" px"}},
  cyber:{amount:{label:"Naves simultÃ¡neas",min:2,max:12,step:1},spawnRate:{label:"Frecuencia de apariciÃ³n",min:.4,max:2.5,step:.1,unit:"Ã—"}},
  ocean:{amount:{label:"Plancton luminoso",min:40,max:320,step:10},fish:{label:"Peces en el cardumen",min:8,max:36,step:1}},
  sakura:{amount:{label:"Pétalos cayendo al mismo tiempo",min:0,max:12,step:1},zoom:{label:"Acercamiento de cámara",min:.65,max:2.1,step:.05,unit:"\u00d7"},bloomInterval:{label:"Segundos para que reaparezcan flores",min:2,max:30,step:1,unit:" s"}},
};

function loadCustomizations(){
  const defaults=JSON.parse(JSON.stringify(customizationDefaults));
  try{
    const stored=localStorage.getItem(customizationStorageKey);
    if(!stored)
      return defaults;
    const parsed=JSON.parse(stored);
    for(const [effect,values] of Object.entries(defaults)){
      const saved=parsed[effect];
      if(!saved||typeof saved!=="object")
        continue;
      for(const key of ["color","secondaryColor","mouseColor"]){
        if(typeof saved[key]==="string"&&/^#[\da-f]{6}$/i.test(saved[key])&&key in values)
          values[key]=saved[key];
      }
      const numericOptions={
        ...customizationOptions[effect],
        speed:{min:.4,max:2},
        intensity:{min:.5,max:1.5}
      };
      for(const [key,option] of Object.entries(numericOptions)){
        if(!(key in values))
          continue;
        if(Number.isFinite(saved[key])&&saved[key]>=option.min&&saved[key]<=option.max)
          values[key]=saved[key];
      }
      if(effect==="sakura"&&saved.zoom===1)
        values.zoom=customizationDefaults.sakura.zoom;
      for(const [key,value] of Object.entries(values)){
        if(typeof value==="boolean"&&typeof saved[key]==="boolean")
          values[key]=saved[key];
      }
      if(effect==="merge"&&["glow","billiards","planets"].includes(saved.ballStyle))
        values.ballStyle=saved.ballStyle;
    }
    return defaults;
  }catch(error){
    console.error("No se pudieron leer las personalizaciones guardadas.",error);
    customizationStatus.textContent="No se pudieron leer los ajustes guardados. Se usarÃ¡n los valores predeterminados.";
    return defaults;
  }
}

function hexToRgb(hex){
  return [
    parseInt(hex.slice(1,3),16),
    parseInt(hex.slice(3,5),16),
    parseInt(hex.slice(5,7),16)
  ];
}

function hslToHex(hue,saturation,lightness){
  const chroma=(1-Math.abs(2*lightness-1))*saturation;
  const section=hue/60;
  const secondary=chroma*(1-Math.abs(section%2-1));
  const offset=lightness-chroma/2;
  let rgb;
  if(section<1)rgb=[chroma,secondary,0];
  else if(section<2)rgb=[secondary,chroma,0];
  else if(section<3)rgb=[0,chroma,secondary];
  else if(section<4)rgb=[0,secondary,chroma];
  else if(section<5)rgb=[secondary,0,chroma];
  else rgb=[chroma,0,secondary];
  return `#${rgb.map(channel=>Math.round((channel+offset)*255).toString(16).padStart(2,"0")).join("")}`;
}

let customizationRebuildTimer=0;
let customizationSaveTimer=0;
let customizationColorTimer=0;

function scheduleCustomizationSave(){
  clearTimeout(customizationSaveTimer);
  customizationSaveTimer=setTimeout(saveCustomizations,180);
}

function applyEffectColors(primary,secondary,refreshControls=false){
  const settings=getEffectSettings();
  settings.color=primary;
  settings.secondaryColor=secondary;
  if(current==="particles"&&!settings.multicolor){
    const hue=hexToHue(primary);
    particles.forEach(particle=>particle.hue=hue);
  }
  if(current==="bubbles"){
    const hues=[hexToHue(primary),hexToHue(secondary)];
    bubbles.forEach((bubble,index)=>bubble.hue=hues[index%hues.length]);
    sparks.forEach((spark,index)=>spark.hue=hues[index%hues.length]);
    pulses.forEach((pulse,index)=>pulse.hue=hues[index%hues.length]);
  }
  if(current==="ocean"){
    const primaryHue=hexToHue(primary);
    const secondaryHue=hexToHue(secondary);
    oceanFish.forEach((fish,index)=>fish.hue=(primaryHue+(index*53)+(index%3)*17)%360);
    oceanCreatures.forEach((creature,index)=>creature.hue=index%2?primaryHue:secondaryHue);
  }
  if(current==="sakura"){
    sakuraPetalSprites=[createSakuraPetalSprite(primary),createSakuraPetalSprite(secondary)];
    clearTimeout(customizationColorTimer);
    customizationColorTimer=setTimeout(()=>{
      if(current==="sakura")
        refreshSakuraTreeCache(hexToRgb(settings.color),hexToRgb(settings.secondaryColor));
    },120);
  }
  updateCanvasFilter();
  updateCustomizationOverlay();
  updatePageAtmosphere();
  scheduleCustomizationSave();
  if(refreshControls)
    renderCustomizationControls();
}

let experienceCustomizations=loadCustomizations();
let effectClock=performance.now();

function getEffectSettings(key=current){
  return experienceCustomizations[key]||customizationDefaults.aurora;
}

function saveCustomizations(){
  try{
    localStorage.setItem(customizationStorageKey,JSON.stringify(experienceCustomizations));
    customizationStatus.textContent="Ajustes guardados.";
    return true;
  }catch(error){
    console.error("No se pudieron guardar las personalizaciones.",error);
    customizationStatus.textContent="No se pudieron guardar los ajustes. Revisa el espacio disponible del navegador.";
    return false;
  }
}

function hexToHue(hex){
  const red=parseInt(hex.slice(1,3),16)/255;
  const green=parseInt(hex.slice(3,5),16)/255;
  const blue=parseInt(hex.slice(5,7),16)/255;
  const max=Math.max(red,green,blue);
  const min=Math.min(red,green,blue);
  const delta=max-min;
  if(delta===0)
    return 0;
  let hue;
  if(max===red)
    hue=((green-blue)/delta)%6;
  else if(max===green)
    hue=(blue-red)/delta+2;
  else
    hue=(red-green)/delta+4;
  return (hue*60+360)%360;
}

function hexToRgba(hex,alpha=1){
  const red=parseInt(hex.slice(1,3),16);
  const green=parseInt(hex.slice(3,5),16);
  const blue=parseInt(hex.slice(5,7),16);
  return `rgba(${red},${green},${blue},${alpha})`;
}

function getEffectHueRotation(key=current){
  if(["particles","bubbles","waves","grid","sunset","network","ocean","sakura","prism","orbits","ink","merge","catch"].includes(key))
    return 0;
  const settings=getEffectSettings(key);
  const baseHue=hexToHue(customizationDefaults[key].color);
  let difference=hexToHue(settings.color)-baseHue;
  if(difference>180)
    difference-=360;
  if(difference< -180)
    difference+=360;
  return difference;
}

function getCurrentEffectControl(){
  switch(current){
    case "aurora":return buildAurora;
    case "bubbles":return buildBubbles;
    case "particles":return buildParticles;
    case "waves":return buildRain;
    case "grid":return buildGridCells;
    case "orbits":return buildGeometricOrbits;
    case "ink":return buildInkFlow;
    case "network":return buildNetwork;
    case "ocean":return buildDeepOcean;
    case "sakura":return buildSakura;
    case "sunset":return buildSky;
    case "cyber":return buildCyberStars;
    case "prism":return buildLiquidPrism;
  }
}

function renderCustomizationControls(){
  customizationTitle.textContent=effectNames[current];
  const settings=getEffectSettings();
  const effectOptions=customizationOptions[current];
  const controls=[
    ...("color" in settings&&current!=="merge"?[
      {key:"color",label:"Color principal",type:"color"},
      {key:"secondaryColor",label:"Color secundario",type:"color"}
    ]:[]),
    ...(current==="ink"?[
      {key:"mouseColor",label:"Color del mouse",type:"color"}
    ]:[]),
    ...(current==="particles"?[
      {key:"multicolor",label:"LuciÃ©rnagas de todos los colores",type:"checkbox"}
    ]:[]),
    ...(current==="catch"?[
      {key:"constantSpeed",label:"Velocidad constante",type:"checkbox"}
    ]:[]),
    ...(current==="merge"?[
      {
        key:"ballStyle",
        label:"Aspecto de las bolas",
        type:"select",
        options:[
          {value:"glow",label:"Luminosas (actual)"},
          {value:"billiards",label:"Billar"},
          {value:"planets",label:"Planetas del sistema solar"}
        ]
      }
    ]:[]),
    {key:"speed",label:"Velocidad",type:"range",min:.4,max:2,step:.05,unit:"Ã—"},
    {key:"intensity",label:"Intensidad de luz",type:"range",min:.5,max:1.5,step:.05,unit:"Ã—"},
    ...Object.entries(effectOptions).map(([key,option])=>({
      key,...option,type:"range"
    }))
  ];

  customizationControls.replaceChildren();
  const randomizeButton=document.createElement("button");
  randomizeButton.type="button";
  randomizeButton.className="randomize-customization";
  randomizeButton.textContent="Valores y colores aleatorios";
  randomizeButton.addEventListener("click",randomizeCurrentCustomization);
  customizationControls.append(randomizeButton);

  for(const control of controls){
    const field=document.createElement("label");
    field.className=`customization-field customization-${control.type}`;
    const title=document.createElement("span");
    title.className="customization-label";
    title.textContent=control.label;
    const input=document.createElement(control.type==="select"?"select":"input");
    if(control.type!=="select")
      input.type=control.type;
    input.name=control.key;
    if(control.type==="select"){
      for(const option of control.options){
        const choice=document.createElement("option");
        choice.value=option.value;
        choice.textContent=option.label;
        input.append(choice);
      }
    }
    if(control.type==="range"){
      input.min=control.min;
      input.max=control.max;
      input.step=control.step;
    }
    if(control.type==="checkbox")
      input.checked=settings[control.key];
    else
      input.value=settings[control.key];
    if(control.type==="range"){
      const output=document.createElement("output");
      output.value=`${settings[control.key]}${control.unit||""}`;
      output.textContent=output.value;
      field.append(title,input,output);
    }else if(control.type==="checkbox"){
      input.setAttribute("aria-label",control.label);
      field.classList.add("customization-checkbox");
      field.append(title,input);
    }else{
      input.setAttribute("aria-label",control.label);
      field.append(title,input);
    }
    input.addEventListener("input",()=>{
      const value=control.type==="color"
        ? input.value
        : control.type==="checkbox"
          ? input.checked
          : control.type==="select"
            ? input.value
            : Number(input.value);
      settings[control.key]=value;
      if(control.key==="color"||control.key==="secondaryColor")
        applyEffectColors(settings.color,settings.secondaryColor);
      else if(control.key==="intensity")
        updateCanvasFilter();
      if(control.key==="multicolor"&&current==="particles")
        buildParticles();
      if(control.type==="range"){
        const output=field.querySelector("output");
        output.value=`${value}${control.unit||""}`;
        output.textContent=output.value;
      }
      if(control.key!=="color"&&control.key!=="secondaryColor"){
        scheduleCustomizationSave();
        updateCustomizationOverlay();
      }
      if(control.key==="amount"&&current==="grid")
        gridCellSize=value;
      if((control.key==="amount"||current==="ocean"&&control.key==="fish")&&getCurrentEffectControl()){
        clearTimeout(customizationRebuildTimer);
        customizationRebuildTimer=setTimeout(()=>{
          const rebuild=getCurrentEffectControl();
          if(rebuild)
            rebuild();
        },180);
      }
    });
    customizationControls.append(field);
  }
}

function randomizeCurrentCustomization(){
  const settings=getEffectSettings();
  const hue=Math.floor(Math.random()*360);
  const separation=100+Math.floor(Math.random()*100);
  if("color" in settings&&current!=="merge"){
    settings.color=hslToHex(hue,.8,.58);
    settings.secondaryColor=hslToHex((hue+separation)%360,.78,.66);
    if(current==="ink")
      settings.mouseColor=hslToHex((hue+240)%360,.85,.62);
  }

  const randomRange=(min,max,step)=>{
    const steps=Math.round((max-min)/step);
    const precision=Math.max(0,(String(step).split(".")[1]||"").length);
    return Number((min+Math.floor(Math.random()*(steps+1))*step).toFixed(precision));
  };
  settings.speed=randomRange(.4,2,.05);
  settings.intensity=randomRange(.5,1.5,.05);
  for(const [key,option] of Object.entries(customizationOptions[current]))
    settings[key]=randomRange(option.min,option.max,option.step);
  for(const [key,value] of Object.entries(settings)){
    if(typeof value==="boolean")
      settings[key]=Math.random()>=.5;
  }

  updateCanvasFilter();
  updateCustomizationOverlay();
  updatePageAtmosphere();
  const rebuild=getCurrentEffectControl();
  if(rebuild)
    rebuild();
  renderCustomizationControls();
  saveCustomizations();
}

function updateCustomizationOverlay(){
  const settings=getEffectSettings();
  if("color" in settings){
    stage.style.setProperty("--custom-primary",settings.color);
    stage.style.setProperty("--custom-secondary",settings.secondaryColor);
    stage.style.setProperty("--custom-primary-rgb",hexToRgba(settings.color,.07));
    stage.style.setProperty("--custom-secondary-rgb",hexToRgba(settings.secondaryColor,.07));
  }
  const hasCustomColors=
    "color" in settings&&
    !["particles","bubbles","waves","grid","network","ocean","sakura","orbits","ink"].includes(current);
  customColorOverlay.hidden=!hasCustomColors;
}

function updatePageAtmosphere(){
  const settings=getEffectSettings();
  document.body.style.setProperty("--experience-primary",settings.color);
  document.body.style.setProperty("--experience-secondary",settings.secondaryColor);
}

function setEffect(key){
  if(!Object.hasOwn(customizationDefaults,key))
    return;
  clearTimeout(customizationRebuildTimer);
  current=key;
  document.body.dataset.effect=key;
  buttons.forEach(button=>
    button.classList.toggle("active",button.dataset.effect===key)
  );
  waves=[];
  meteors=[];
  pulses=[];
  sparks=[];
  shards=[];
  glitches=[];
  gridMouseTracked=false;
  gridTrailCell=null;
  if(key==="cyber"){
    cyberKills=0;
    cyberBoss=null;
    cyberWeapons=[3,3];
    cyberWeaponRepair=[0,0];
    cyberHostileShots=[];
  }
  if(key==="grid")
    gridCellSize=getEffectSettings(key).amount;
  if(key==="merge")
    resetMergeGame();
  if(key==="catch")
    resetCatchDodgeGame();
  if(key==="breaker")
    resetBlockBreaker();
  updatePageAtmosphere();
  updateCustomizationOverlay();
  updateCanvasFilter();
  if(customizationPanel.open)
    renderCustomizationControls();
  resize();
}

customizeButton.addEventListener("click",()=>{
  if(customizationPanel.open){
    customizationPanel.close();
    return;
  }
  renderCustomizationControls();
  customizationPanel.showModal();
  customizeButton.setAttribute("aria-expanded","true");
});

let customizationDrag=null;
customizationPanel.querySelector(".customization-heading").addEventListener("pointerdown",event=>{
  if(event.target.closest("button,input,a"))
    return;
  const rect=customizationPanel.getBoundingClientRect();
  customizationDrag={
    pointerId:event.pointerId,
    offsetX:event.clientX-rect.left,
    offsetY:event.clientY-rect.top
  };
  customizationPanel.style.left=`${rect.left}px`;
  customizationPanel.style.top=`${rect.top}px`;
  customizationPanel.style.right="auto";
  customizationPanel.style.bottom="auto";
  customizationPanel.style.transform="none";
  event.currentTarget.setPointerCapture(event.pointerId);
  event.preventDefault();
});
customizationPanel.querySelector(".customization-heading").addEventListener("pointermove",event=>{
  if(!customizationDrag||customizationDrag.pointerId!==event.pointerId)
    return;
  const maxLeft=Math.max(0,window.innerWidth-customizationPanel.offsetWidth);
  const maxTop=Math.max(0,window.innerHeight-customizationPanel.offsetHeight);
  const left=Math.max(0,Math.min(maxLeft,event.clientX-customizationDrag.offsetX));
  const top=Math.max(0,Math.min(maxTop,event.clientY-customizationDrag.offsetY));
  customizationPanel.style.left=`${left}px`;
  customizationPanel.style.top=`${top}px`;
});
const stopCustomizationDrag=event=>{
  if(customizationDrag?.pointerId===event.pointerId)
    customizationDrag=null;
};
customizationPanel.querySelector(".customization-heading").addEventListener("pointerup",stopCustomizationDrag);
customizationPanel.querySelector(".customization-heading").addEventListener("pointercancel",stopCustomizationDrag);

closeCustomizationsButton.addEventListener("click",()=>customizationPanel.close());
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&customizationPanel.open){
    event.preventDefault();
    customizationPanel.close();
  }
});
customizationPanel.addEventListener("close",()=>{
  customizeButton.setAttribute("aria-expanded","false");
  customizeButton.focus();
});
customizationPanel.addEventListener("click",event=>{
  if(event.target===customizationPanel)
    customizationPanel.close();
});

function updateFullscreenButton(){
  const isFullscreen=
    document.fullscreenElement===stageShell||
    stageShell.classList.contains("stage-fullscreen-mode");
  fullscreenButton.textContent=isFullscreen?"Salir de pantalla completa":"Pantalla completa";
  fullscreenButton.setAttribute("aria-label",isFullscreen
    ?"Salir de pantalla completa"
    :"Ver fondo en pantalla completa"
  );
  fullscreenButton.setAttribute("aria-pressed",String(isFullscreen));
  requestAnimationFrame(resize);
}

function exitFullscreenFallback(){
  stageShell.classList.remove("stage-fullscreen-mode");
  document.body.classList.remove("stage-fullscreen-active");
  fullscreenStatus.textContent="";
}

fullscreenButton.addEventListener("click",async()=>{
  fullscreenStatus.textContent="";
  try{
    if(stageShell.classList.contains("stage-fullscreen-mode")){
      exitFullscreenFallback();
    }else if(document.fullscreenElement===stageShell){
      await document.exitFullscreen();
    }else if(stageShell.requestFullscreen){
      await stageShell.requestFullscreen();
    }else{
      throw new Error("La API de pantalla completa no está disponible.");
    }
    updateFullscreenButton();
  }catch(error){
    console.error("No se pudo cambiar el modo de pantalla completa.",error);
    if(document.fullscreenElement===stageShell){
      fullscreenStatus.textContent="No se pudo salir de la pantalla completa.";
      return;
    }
    stageShell.classList.add("stage-fullscreen-mode");
    document.body.classList.add("stage-fullscreen-active");
    fullscreenStatus.textContent="La pantalla completa del navegador no está disponible; se muestra el escenario ampliado.";
    updateFullscreenButton();
  }
});
document.addEventListener("fullscreenchange",updateFullscreenButton);
document.addEventListener("keydown",event=>{
  if(event.key!=="Escape"||!stageShell.classList.contains("stage-fullscreen-mode"))
    return;
  exitFullscreenFallback();
  updateFullscreenButton();
});

function resetAllCustomizations(){
  experienceCustomizations=JSON.parse(JSON.stringify(customizationDefaults));
  const saved=saveCustomizations();
  renderCustomizationControls();
  updateCustomizationOverlay();
  updatePageAtmosphere();
  updateCanvasFilter();
  resize();
  const message=saved
    ? "Todas las experiencias volvieron a sus valores predeterminados."
    : "No se pudieron guardar los ajustes predeterminados. Revisa el espacio disponible del navegador.";
  customizationStatus.textContent=message;
  settingsResetStatus.textContent=saved?"Ajustes predeterminados restaurados.":"No se pudieron guardar los ajustes.";
}

resetCustomizationsButton.addEventListener("click",resetAllCustomizations);
resetDefaultsButton.addEventListener("click",resetAllCustomizations);

buttons.forEach(button=>
  button.addEventListener("click",()=>setEffect(button.dataset.effect))
);

setEffect("aurora");
animate();
