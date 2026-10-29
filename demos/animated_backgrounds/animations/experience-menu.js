// Configuracion de las experiencias, controles de personalizacion y seleccion de escenas.
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

const effectNames = experienceSettings.names;

const customizationDefaults = experienceSettings.defaults;

const customizationOptions = experienceSettings.options;

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
    customizationStatus.textContent="No se pudieron leer los ajustes guardados. Se usar\u00e1n los valores predeterminados.";
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
  if(["particles","bubbles","waves","grid","sunset","network","ocean","sakura","prism","orbits","tetris","merge","catch"].includes(key))
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
    ...("color" in settings&&current!=="merge"&&current!=="tetris"?[
      {key:"color",label:"Color principal",type:"color"},
      {key:"secondaryColor",label:"Color secundario",type:"color"}
    ]:[]),
    ...(current==="particles"?[
      {key:"multicolor",label:"Luci\u00e9rnagas de todos los colores",type:"checkbox"}
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
    {key:"speed",label:"Velocidad de animaci\u00f3n",type:"range",min:.4,max:2,step:.05,unit:"\u00d7"},
    {key:"intensity",label:"Intensidad visual",type:"range",min:.5,max:1.5,step:.05,unit:"\u00d7"},
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
  if("color" in settings&&current!=="merge"&&current!=="tetris"){
    settings.color=hslToHex(hue,.8,.58);
    settings.secondaryColor=hslToHex((hue+separation)%360,.78,.66);
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
    !["particles","bubbles","waves","grid","network","ocean","sakura","orbits","tetris"].includes(current);
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
  if(key==="tetris")
    resetTetrisGame();
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

const gameModeNames={
  merge:"Fusión de bolas",
  catch:"Laberinto circular",
  breaker:"Rompebloques",
  tetris:"Caída de bloques"
};
const requestedGame=new URLSearchParams(window.location.search).get("game");
if(Object.hasOwn(gameModeNames,requestedGame)){
  document.body.classList.add("game-mode");
  document.title=`${gameModeNames[requestedGame]} · Arkas Arcade`;
  setEffect(requestedGame);
}else{
  setEffect("aurora");
}
animate();
