import {loadModelBlob} from './model-loader.js';

const $ = id => document.getElementById(id);
const viewer = $('cat');
const animation = $('animation');
const seek = $('seek');
const labels = {Cat_idle_breathe:'Idle / breathe',Cat_wake:'Wake up',Cat_walk:'Walk',Cat_run:'Run',Cat_jump_anticipation:'Jump · prepare',Cat_jump_air:'Jump · airborne',Cat_jump_land:'Jump · land',Cat_claw_left:'Claw · left',Cat_claw_right:'Claw · right',Cat_bite:'Bite',Cat_self_lick:'Paw grooming',Cat_sit_down:'Sit down',Cat_seated_idle:'Seated idle',Cat_stand_up:'Stand up',Cat_idle_look_around:'Look around',Cat_idle_ear_twitch:'Ear twitch',Cat_tail_flick:'Tail flick',Cat_sniff_ground:'Sniff the ground',Cat_stretch:'Stretch',Cat_knead:'Knead',Cat_face_wash:'Wash face',Cat_seated_look_around:'Seated · look around',Cat_seated_head_tilt:'Seated · head tilt',Cat_seated_slow_blink:'Seated · slow blink'};
let loaded = false;
let selection = 0;
let seeking = false;
let modelObjectURL = null;
function releaseDownload(){if(modelObjectURL){URL.revokeObjectURL(modelObjectURL);modelObjectURL=null;}}
const status = (text, error=false) => {$('status').textContent=text;$('status').classList.toggle('error',error);};
const enable = () => {for(const element of document.querySelectorAll('button,select,input'))element.disabled=!loaded;};
function play(){if(loaded)viewer.play({repetitions:$('auto-cycle').checked?1:$('loop').checked?Infinity:1});}
function seekTo(time){const speed=viewer.timeScale;seeking=true;try{viewer.timeScale=1;viewer.currentTime=time;}finally{viewer.timeScale=speed;seeking=false;}}
async function choose(name, playing=true){
  if(!loaded)return;
  const current=++selection;
  viewer.pause();animation.value=name;viewer.animationName=name;
  await viewer.updateComplete;
  if(current!==selection)return;
  seekTo(0);
  if(playing)play();
  $('count').textContent=`${animation.selectedIndex+1} / ${animation.options.length}`;
}
function step(direction, playing=true){const index=(animation.selectedIndex+direction+animation.options.length)%animation.options.length;choose(animation.options[index].value,playing);}
function resetCamera(){viewer.cameraOrbit='145deg 70deg 120%';viewer.cameraTarget='auto auto auto';viewer.fieldOfView='auto';viewer.jumpCameraToGoal();}
function zoom(factor){if(!loaded)return;const orbit=viewer.getCameraOrbit();viewer.cameraOrbit=`${orbit.theta}rad ${orbit.phi}rad ${Math.max(.05,orbit.radius*factor)}m`;}
function camera(name){
  resetCamera();
  const angles={front:'180deg 85deg 120%',back:'0deg 85deg 120%',left:'90deg 85deg 120%',right:'270deg 85deg 120%',top:'180deg 3deg 120%',below:'180deg 170deg 120%'};
  if(name==='head'){viewer.cameraOrbit='145deg 78deg .30m';viewer.cameraTarget='0m .30m -.23m';viewer.fieldOfView='30deg';}else viewer.cameraOrbit=angles[name];
  viewer.jumpCameraToGoal();
}

viewer.addEventListener('progress',event=>{const progress=event.detail?.totalProgress;if(!loaded&&Number.isFinite(progress))status(`Loading furry 3D model… ${Math.round(progress*100)}%`);});
viewer.addEventListener('error',()=>{releaseDownload();loaded=false;enable();status('The 3D model could not load. Please reload the page and try again.',true);});
viewer.addEventListener('load',async()=>{
  releaseDownload();
  const names=[...viewer.availableAnimations];
  loaded=true;animation.replaceChildren();$('clips').replaceChildren();
  for(const name of names){animation.add(new Option(labels[name]||name.replace(/^Cat_/, '').replaceAll('_',' '),name));const li=document.createElement('li');li.textContent=labels[name]||name.replace(/^Cat_/, '').replaceAll('_',' ');$('clips').append(li);}
  enable();
  resetCamera();
  await choose(names.includes('Cat_idle_breathe')?'Cat_idle_breathe':names[0],!matchMedia('(prefers-reduced-motion: reduce)').matches);
  status('Ready · Drag to rotate, pinch to zoom.');
});
viewer.addEventListener('finished',()=>{if(!seeking&&$('auto-cycle').checked)step(1);});
animation.addEventListener('change',()=>choose(animation.value,true));
$('previous').addEventListener('click',()=>step(-1));$('next').addEventListener('click',()=>step(1));
$('play').addEventListener('click',play);$('pause').addEventListener('click',()=>viewer.pause());$('restart').addEventListener('click',()=>{seekTo(0);play();});
seek.addEventListener('input',()=>{if(loaded){viewer.pause();seekTo(Number(seek.value));}});
$('speed').addEventListener('input',()=>{viewer.timeScale=Number($('speed').value);$('speed-label').value=viewer.timeScale.toFixed(2)+'×';});
for(const id of ['loop','auto-cycle'])$(id).addEventListener('change',()=>{if(!viewer.paused){const time=viewer.currentTime;viewer.pause();play();seekTo(time);}});
$('reset-camera').addEventListener('click',resetCamera);$('zoom-in').addEventListener('click',()=>zoom(.8));$('zoom-out').addEventListener('click',()=>zoom(1.25));
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>camera(button.dataset.view));
function frame(){if(loaded){const duration=Number.isFinite(viewer.duration)?viewer.duration:0,time=Number.isFinite(viewer.currentTime)?viewer.currentTime:0;seek.max=String(Math.max(.01,duration));if(document.activeElement!==seek)seek.value=String(time);$('clock').textContent=`${time.toFixed(2)} / ${duration.toFixed(2)} s · ${viewer.paused?'Paused':'Playing'}`;}requestAnimationFrame(frame);}
async function initialize(){
  await import('./vendor/model-viewer-4.2.0.min.js');
  await customElements.whenDefined('model-viewer');
  customElements.get('model-viewer').meshoptDecoderLocation=new URL('./vendor/meshopt_decoder.js',import.meta.url).href;
  frame();
  const metadata=await fetch('./model.json?v=safari-1');
  if(!metadata.ok)throw new Error('Model manifest unavailable');
  const model=await metadata.json();
  status(`Downloading furry 3D model (${(model.bytes/1048576).toFixed(1)} MiB)…`);
  const blob=await loadModelBlob(new URL(model.url,location.href),model,(received,total)=>status(`Downloading furry 3D model… ${Math.min(100,Math.round(received/total*100))}%`));
  status('Preparing the furry model and animations…');
  modelObjectURL=URL.createObjectURL(blob);
  viewer.src=modelObjectURL;
}
initialize().catch(error=>{releaseDownload();status('The model files could not load. Please reload the page and try again.',true);console.error(error);});
