const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const starter=path.join(__dirname,'../assets/starter');
// The controller runs normally. Only platform/renderer boundaries are fakes;
// this is a Node unit test, not a browser or WebGL acceptance test.
function boot(search='',{webgl=true,reduced=false,width=856,height=626,viewportWidth=1280,viewportHeight=800}={}){
 const nodes=new Map(),frames=new Map(),painted=[],thumbs=[],resizers=[];let clock=1000,serial=0,fitCalls=0;
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
 const context=vm.createContext({console,URLSearchParams,structuredClone,Math,Map,Set,location:{search},devicePixelRatio:1,innerWidth:viewportWidth,innerHeight:viewportHeight,
  document:{getElementById:$,createElement:tag=>new Element(tag),body:new Element(),documentElement:{style:{setProperty(){}}}},
  performance:{now:()=>clock},matchMedia:()=>({matches:reduced}),ResizeObserver:class{constructor(callback){resizers.push(callback);}observe(){}},
  requestAnimationFrame:fn=>{const id=++serial;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)
 });context.window=context;
 for(const f of ['cube-state','ground-camera','ground-water','ground-valley','ground-night','ground-natural','cube-habitats','habitat-renderer',...(fs.existsSync(path.join(starter,'habitat-framing.js'))?['habitat-framing']:[]),...(fs.existsSync(path.join(starter,'frame-sampler.js'))?['frame-sampler']:[])])vm.runInContext(fs.readFileSync(path.join(starter,f+'.js'),'utf8'),context);
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
 return {$,context,tick,resize,fitCalls:()=>fitCalls,painted,thumbs,inspect:()=>JSON.parse(JSON.stringify(context.sceneCube.inspect()))};
}
test('URL selection happens before the first paint, including the export-page suite default',()=>{
 for(const [query,suite]of [['','natural'],['?suite=invalid','natural'],['?suite=natural','natural'],['?suite=original','original'],['?export=1','natural'],['?export=1&suite=original','original']]){
  const app=boot(query);assert.equal(app.inspect().suite,suite,query);assert.equal(app.painted[0].atlas.PY,suite==='natural'?'snow':'autumn');
  assert.equal(app.inspect().time,0);assert.equal(app.inspect().playing,false);
 }
});
test('suite switch cancels a moving turn, camera, undo and close view, resets target atlas and time',()=>{
 const app=boot();const solved=app.inspect().cubies;
 app.$('positive').emit('click');app.tick(700);assert.equal(app.inspect().historyLength,1);
 app.$('close-view').emit('click');assert.equal(app.inspect().closeView,true);
 app.$('positive').emit('click');assert.ok(app.inspect().move);
 app.$('suite-original').emit('click');let out=app.inspect();
 assert.equal(out.suite,'original');assert.equal(out.time,0);assert.equal(out.mode,'manual');assert.equal(out.playing,false);
 assert.equal(out.move,null);assert.equal(out.cameraMoving,false);assert.equal(out.historyLength,0);assert.equal(out.closeView,false);assert.deepEqual(out.cubies,solved);
 assert.equal(app.$('suite-original').getAttribute('aria-pressed'),'true');assert.equal(app.$('suite-natural').getAttribute('aria-pressed'),'false');
 assert.equal(app.$('scene-list').children.length,6);assert.equal(app.$('undo').disabled,true);
 assert.equal(app.painted.at(-1).atlas.PY,'autumn');
 app.context.renderAt(12.5);app.$('suite-natural').emit('click');out=app.inspect();assert.equal(out.time,0);assert.equal(out.picture.aligned,true);assert.equal(app.painted.at(-1).atlas.PY,'snow');
 assert.deepEqual(app.thumbs.slice(-6),['bamboo','oasis','snow','island','volcano','firefly']);
 app.tick(1000);assert.equal(app.inspect().move,null);
});
test('reset preserves suite and same-suite turns undo without contaminating face assignment',()=>{
 const app=boot('?suite=original',{reduced:true});
 const solved=app.inspect().cubies;app.$('positive').emit('click');assert.notDeepEqual(app.inspect().cubies,solved);
 app.$('undo').emit('click');assert.deepEqual(app.inspect().cubies,solved);
 app.$('reset').emit('click');assert.equal(app.inspect().suite,'original');
 app.$('suite-natural').emit('click');app.$('positive').emit('click');
 const allowed=new Set(['snow','oasis','bamboo','firefly','volcano','island']);assert.ok(Object.values(app.painted.at(-1).atlas).every(id=>allowed.has(id)));
 app.$('undo').emit('click');assert.deepEqual(app.inspect().cubies,solved);
 app.$('reset').emit('click');assert.equal(app.inspect().suite,'natural');assert.equal(app.inspect().time,0);
});
test('natural camera covers six faces, four low contact views, wide endpoints and matching physical beats',()=>{
 const natural=boot('?export=1'),original=boot('?export=1&suite=original'),seen=new Set(),low=new Set();
 for(const time of [0,1.8,2.85,3.8,5.4,6.4,7.4,8.5,9.4,10.2,11.1,12.45,13.45,14.8,16.6,17.5,19.2]){
  natural.context.renderAt(time);const a=natural.inspect();original.context.renderAt(time);const b=original.inspect();
  assert.deepEqual(a.move,b.move);assert.deepEqual(a.cubies,b.cubies);if(a.move)assert.doesNotMatch(a.cue,/礁鲨|沉木|虾群|海床/);
  if(time>0&&time<19.2){seen.add(a.face);const v=natural.painted.at(-1).view,eye=natural.context.GroundCamera.axes(v).eye,normal=natural.context.CubeState.faces[a.face].normal;const altitude=Math.asin(eye.reduce((s,n,i)=>s+n*normal[i],0))*180/Math.PI;if(altitude<=32.1)low.add(a.face);}
 }
 assert.equal(seen.size,6);for(const face of ['PY','PZ','NX','NY'])assert.ok(low.has(face),face+' low portrait');
 natural.context.renderAt(0);assert.ok(Math.hypot(...natural.painted.at(-1).view.slice(4,7))<.3);
 natural.context.renderAt(19.2);assert.ok(Math.hypot(...natural.painted.at(-1).view.slice(4,7))<.3);
});
test('fallback disables suite buttons and mobile controls stay outside stage in document flow',()=>{
 const app=boot('',{webgl:false});for(const id of ['suite-natural','suite-original','play','positive','close-view'])assert.equal(app.$(id).disabled,true,id);
 const html=fs.readFileSync(path.join(starter,'index.html'),'utf8');assert.match(html,/<aside[^>]*>[\s\S]*id="suite-natural"[\s\S]*class="intro"/);
 const css=fs.readFileSync(path.join(starter,'styles.css'),'utf8');assert.match(css,/height: min\(110vw,510px\)/);assert.match(css,/repeat\(6,minmax\(0,1fr\)\)/);
});

test('switching during playback or a captured orbit discards outgoing interaction',()=>{
 const app=boot();app.$('play').emit('click');app.tick(2800);assert.equal(app.inspect().playing,true);
 app.$('suite-original').emit('click');assert.equal(app.inspect().playing,false);assert.equal(app.inspect().time,0);
 app.$('world').emit('pointerdown',{button:0,pointerId:7,clientX:10,clientY:10});
 app.$('suite-natural').emit('click');const before=app.inspect().view;
 app.$('world').emit('pointermove',{pointerId:7,clientX:110,clientY:80});assert.deepEqual(app.inspect().view,before);
 app.tick(3000);assert.equal(app.inspect().time,0);assert.equal(app.inspect().move,null);
});

test('normal natural thumbnail selection keeps the whole cube inside 1280x800 and 390x844 layouts',()=>{
 // Stage dimensions follow the existing CSS: 4vw shell gutters + borders,
 // mobile height min(110vw,510px); desktop stage measured in supplied screenshot.
 for(const [viewportWidth,viewportHeight,width,height]of [[1280,800,856,626],[390,844,390-2*(390*.04)-2,390*1.1]]){
  const app=boot('',{reduced:true,width,height,viewportWidth,viewportHeight});
  const corners=[];for(const x of [-1.491,1.491])for(const y of [-1.491,1.491])for(const z of [-1.491,1.491])corners.push([x,y,z]);
  for(const [index,face]of ['PZ','PX','PY','NX','NZ','NY'].entries()){
   app.$('scene-list').children[index].emit('click');const out=app.inspect();assert.equal(out.face,face);assert.equal(out.closeView,false);
   const view=app.painted.at(-1).view,{eye,right,up}=app.context.GroundCamera.axes(view),focus=view.slice(4,7),scale=Math.min(width,height)*.166*view[2];
   // Independent form of renderer projection, with the same unmodified 13-unit lens.
   for(const p of corners){const v=p.map((n,i)=>n-focus[i]),dot=a=>v.reduce((s,n,i)=>s+n*a[i],0),q=1-dot(eye)/13,x=width/2+dot(right)*scale/q,y=height/2-dot(up)*scale/q;
    assert.ok(x>=8&&x<=width-8&&y>=8&&y<=height-24,`${face} cube clipped at ${x},${y} in ${width}x${height}`);
   }
  }
 }
});
test('original thumbnail cameras and close-up controls retain their pre-fit camera contract',()=>{
 const app=boot('?suite=original',{reduced:true});
 for(const [index,face]of ['PZ','PX','PY','NX','NZ','NY'].entries()){
  app.$('scene-list').children[index].emit('click');
  const expected=app.context.GroundCamera.habitat(face,{PY:24,PZ:16,PX:-23,NX:18,NZ:26,NY:-16}[face],40,1.21,1.43);
  assert.deepEqual(app.inspect().view,Array.from(expected));
 }
});

test('natural oasis portrait exposes the camel body/head/feet along its route, rather than behind palms',()=>{
 const app=boot('',{reduced:true});app.$('scene-list').children[1].emit('click');
 const view=app.inspect().view,{eye}=app.context.GroundCamera.axes(view),frame=app.context.CubeState.faces.PX;
 const dot=(a,b)=>a.reduce((s,n,i)=>s+n*b[i],0),sub=(a,b)=>a.map((n,i)=>n-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const camera=view.slice(4,7).map((n,i)=>n+13*eye[i]),localEye=[dot(camera,frame.right),dot(camera,frame.up),dot(camera,frame.normal)-1.491];
 function blocked(p,forms){
  const d=sub(p,localEye);
  for(const f of forms)for(let i=1;i<f.points.length-1;i++){
   const [a,b,c]=[f.points[0],f.points[i],f.points[i+1]],e1=sub(b,a),e2=sub(c,a),h=cross(d,e2),det=dot(e1,h);if(Math.abs(det)<1e-9)continue;
   const s=sub(localEye,a),u=dot(s,h)/det;if(u<0||u>1)continue;const q=cross(s,e1),v=dot(d,q)/det;if(v<0||u+v>1)continue;
   const t=dot(e2,q)/det;if(t>0&&t<.992)return true;
  }return false;
 }
 const forms=app.context.CubeHabitats.model('oasis',0,true).flat().filter(f=>f.alpha>=.995);let visible=0,total=0;
 for(let t=0;t<40;t+=2){const p=app.context.GroundNatural.camelPose(t);
  for(const off of [[0,0,.28],[.29,0,.56],[-.15,-.06,.10],[.15,-.06,.10]]){total++;if(!blocked(p.map((n,i)=>n+off[i]),forms))visible++;}
 }
 assert.ok(visible/total>=.9,`${visible}/${total} camel landmark rays unobstructed; choose a clearer camera, not new geometry`);
});

test('optional diagnostics reports real refresh samples and starts a fresh batch on suite/reset',()=>{
 const normal=boot();assert.equal(normal.inspect().performance,null,'normal UI does not sample or display diagnostics');
 const app=boot('?diagnostics=1');for(let i=0;i<125;i++)app.tick(20);
 assert.equal(app.inspect().performance.samples,124);assert.equal(app.inspect().performance.medianMs,20);
 assert.match(app.$('performance').textContent,/20\.0/);assert.equal(app.$('performance').hidden,false);
 app.$('suite-original').emit('click');assert.equal(app.inspect().performance.samples,0);
 for(let i=0;i<125;i++)app.tick(25);assert.equal(app.inspect().performance.medianMs,25);assert.equal(app.inspect().performance.suite,'original');
 app.$('reset').emit('click');assert.equal(app.inspect().performance.samples,0);
});

function assertShellInside(app,width,height){
 const v=app.inspect().view,{eye,right,up}=app.context.GroundCamera.axes(v),focus=v.slice(4,7),scale=Math.min(width,height)*.166*v[2];
 for(const x of [-1.491,1.491])for(const y of [-1.491,1.491])for(const z of [-1.491,1.491]){
  const p=[x,y,z].map((n,i)=>n-focus[i]),dot=a=>p.reduce((s,n,i)=>s+n*a[i],0),q=1-dot(eye)/13,u=width/2+dot(right)*scale/q,w=height/2-dot(up)*scale/q;
  assert.ok(u>=8&&u<=width-8&&w>=8&&w<=height-24,`stale framing after resize: ${u},${w} outside ${width}x${height}`);
 }
}
test('resize during camera transition is coalesced and fitted once after the transition settles',()=>{
 const app=boot();app.$('scene-list').children[1].emit('click');const first=app.fitCalls();
 app.tick(100);app.resize(300,626);app.resize(230,626);assert.equal(app.fitCalls(),first,'do not fit while camera interpolates');
 app.tick(200);assert.equal(app.fitCalls(),first);app.tick(400);
 assert.equal(app.fitCalls(),first+1,'one deferred fit must consume the latest size');assertShellInside(app,230,626);
 for(let i=0;i<10;i++)app.tick(16);assert.equal(app.fitCalls(),first+1,'not a per-frame fit loop');
});
test('resize during a layer turn fits the committed cubies once, not intermediate turn geometry',()=>{
 const app=boot();app.$('scene-list').children[1].emit('click');app.tick(700);const first=app.fitCalls();
 app.$('positive').emit('click');app.tick(100);app.resize(230,626);assert.equal(app.fitCalls(),first);
 app.tick(200);assert.equal(app.fitCalls(),first);app.tick(300);
 assert.equal(app.inspect().move,null);assert.equal(app.inspect().historyLength,1);assert.equal(app.fitCalls(),first+1);assertShellInside(app,230,626);
 for(let i=0;i<10;i++)app.tick(16);assert.equal(app.fitCalls(),first+1);
});
test('overlapping camera and layer animations postpone a pending fit until both are complete',()=>{
 const app=boot();app.$('scene-list').children[1].emit('click');app.tick(300);app.$('positive').emit('click');
 const first=app.fitCalls();app.resize(230,626);app.tick(350);
 assert.equal(app.inspect().cameraMoving,false);assert.ok(app.inspect().move);assert.equal(app.fitCalls(),first,'camera end alone is not enough');
 app.tick(250);assert.equal(app.fitCalls(),first+1);assertShellInside(app,230,626);
});
test('resize does not fit close-up/original cameras and pending work is cleared on suite/demo reset',()=>{
 const close=boot();close.$('scene-list').children[1].emit('click');close.tick(100);close.resize(230,626);
 const count=close.fitCalls();close.$('close-view').emit('click');close.tick(700);
 assert.equal(close.inspect().closeView,true);assert.equal(close.fitCalls(),count,'switching to close-up cancels the old normal fit');
 close.resize(220,626);close.tick(700);assert.equal(close.fitCalls(),count);assert.equal(close.inspect().view[2],1.4);
 const original=boot('?suite=original');original.$('scene-list').children[1].emit('click');original.tick(100);original.resize(230,626);original.tick(700);
 assert.equal(original.fitCalls(),0);assert.equal(original.inspect().view[2],1.21);
 const changed=boot();changed.$('scene-list').children[1].emit('click');changed.resize(230,626);const n=changed.fitCalls();changed.$('suite-original').emit('click');changed.tick(800);assert.equal(changed.fitCalls(),n);
 changed.$('suite-natural').emit('click');changed.$('scene-list').children[1].emit('click');changed.resize(220,626);const beforeDemo=changed.fitCalls();changed.context.renderAt(5);changed.tick(800);assert.equal(changed.fitCalls(),beforeDemo);
});
