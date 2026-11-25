const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const starter=path.join(__dirname,'../assets/starter');
// The controller runs normally. Only platform/renderer boundaries are fakes;
// this is a Node unit test, not a browser or WebGL acceptance test.
function boot(search='',{webgl=true,reduced=false,width=856,height=626,viewportWidth=1280,viewportHeight=800}={}){
 const nodes=new Map(),frames=new Map(),painted=[],thumbs=[],resizers=[],scripts=[],urls=[];let clock=1000,serial=0,fitCalls=0;
 class Element{
  constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.attrs={};this.value='';this.disabled=false;this.hidden=true;this.clientWidth=800;this.clientHeight=600;this.parentElement={};this.classList={toggle(){}};}
  addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
  emit(k,event={}){if(!this.disabled)for(const fn of this.listeners[k]??[])fn(event);}
  setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}
  append(...v){this.children.push(...v);}replaceChildren(...v){this.children=v;}
  getContext(type){return type==='webgl'?(webgl?{}:null):{canvas:this};}
  getBoundingClientRect(){return {left:0,top:0,width:800,height:600};}
  setPointerCapture(){}releasePointerCapture(){}hasPointerCapture(){return true;}
 }
 const $=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
 $('axis').value='y';$('layer').value='1';$('world').clientWidth=width;$('world').clientHeight=height;
 const context=vm.createContext({console,URL,URLSearchParams,structuredClone,Math,Map,Set,location:{search,href:"https://example.test/cube/"+search},history:{replaceState(a,b,url){urls.push(String(url));context.location.href=String(url);context.location.search=new URL(url).search;}},devicePixelRatio:1,innerWidth:viewportWidth,innerHeight:viewportHeight,
  document:{baseURI:"https://example.test/cube/index.html",head:{appendChild:s=>scripts.push(s)},getElementById:$,createElement:tag=>new Element(tag),body:new Element(),documentElement:{style:{setProperty(){}}}},
  performance:{now:()=>clock},matchMedia:()=>({matches:reduced}),ResizeObserver:class{constructor(callback){resizers.push(callback);}observe(){}},
  requestAnimationFrame:fn=>{const id=++serial;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)
 });context.window=context;
 for(const f of ['cube-state','ground-camera','ground-water','ground-valley','ground-night','ground-natural','suite-catalog','cube-habitats','habitat-renderer',...(fs.existsSync(path.join(starter,'habitat-framing.js'))?['habitat-framing']:[]),...(fs.existsSync(path.join(starter,'frame-sampler.js'))?['frame-sampler']:[])])vm.runInContext(fs.readFileSync(path.join(starter,f+'.js'),'utf8'),context);
 const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(o,k)=>k in o?o[k]:()=>({})});
 const realCamera=context.HabitatRenderer(gl,context.CubeHabitats,{}).getCamera;
 if(context.HabitatFraming){const original=context.HabitatFraming;context.HabitatFraming={...original,fit(...args){fitCalls++;return original.fit(...args);}};}
 context.CubeHabitats.thumbnail=(ctx,id)=>thumbs.push(id);
 context.HabitatRenderer=(gl,art,atlas)=>({
  getCamera:realCamera,
  paint:(cubies,move,angle,view,t)=>{painted.push({atlas:{...atlas},move,angle,view:Array.from(view),t});return {camera:{project:p=>p},picks:[]};}
 });
 vm.runInContext(fs.readFileSync(path.join(starter,'cube.js'),'utf8'),context);
 const tick=ms=>{clock+=ms;const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(clock);};
 const resize=(w,h)=>{$('world').clientWidth=w;$('world').clientHeight=h;for(const fn of resizers)fn();};
 const flushScripts=async()=>{for(let i=0;i<12;i++){await new Promise(r=>setImmediate(r));while(scripts.length){const script=scripts.shift(),name=new URL(script.src).pathname.split('/').at(-1);vm.runInContext(fs.readFileSync(path.join(starter,name),'utf8'),context);script.onload();}}};
 return {$,context,tick,resize,scripts,urls,flushScripts,fitCalls:()=>fitCalls,painted,thumbs,inspect:()=>JSON.parse(JSON.stringify(context.sceneCube.inspect()))};
}

module.exports={boot};
