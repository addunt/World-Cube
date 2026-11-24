const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
global.CubeState=require('../assets/starter/cube-state.js');
for(const f of ['ground-camera','ground-water','ground-valley','ground-night','ground-natural','cube-habitats','habitat-renderer'])require('../assets/starter/'+f+'.js');
const file=path.join(__dirname,'../assets/starter/habitat-framing.js');
if(fs.existsSync(file))require(file);
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(o,k)=>k in o?o[k]:()=>({})});
const getCamera=global.HabitatRenderer(gl,CubeHabitats,{}).getCamera;
function actualPoints(cubies,atlas,t){
 const out=[];
 for(const x of [-1.491,1.491])for(const y of [-1.491,1.491])for(const z of [-1.491,1.491])out.push([x,y,z]);
 for(const c of cubies)for(const s of c.stickers){
  const frame=CubeState.groundFrame(c,s.face),slot=s.row*3+s.col;
  for(const pass of [true,false])for(const form of CubeHabitats.model(atlas[s.face],t,pass)[slot])for(const p of form.points){
   out.push(frame.origin.map((v,k)=>v+frame.right[k]*(p[0]-(s.col-1))+frame.forward[k]*(p[1]-(1-s.row))+frame.normal[k]*(.491+p[2])));
  }
 }
 return out;
}
test('fitted natural portraits contain real shell and habitat vertices on desktop/mobile, including mixed cubies',()=>{
 assert.ok(global.HabitatFraming,'a projection-aware framing module is required');
 const atlas=CubeHabitats.suites.natural.atlasOf,solved=CubeState.create(),turned=CubeState.turn(solved,{axis:'y',layer:0,dir:1});
 for(const cubies of [solved,turned])for(const [w,h]of [[856,626],[360,429],[350,429]]){
  const envelope=HabitatFraming.points(CubeHabitats,atlas,cubies);
  for(const face of Object.keys(atlas)){
   const original=GroundCamera.habitat(face,18,40,1.21,1.43),view=HabitatFraming.fit(original,envelope,w,h,getCamera);
   assert.deepEqual(view.slice(0,2),original.slice(0,2),'fit must not rotate the selected horizon');assert.equal(view[3],original[3]);
   const camera=getCamera(view,w,h);
   for(const t of [0,1.2,5])for(const p of actualPoints(cubies,atlas,t)){
    const [x,y]=camera.project(p);assert.ok(x>=8&&x<=w-8&&y>=8&&y<=h-24,`${face} ${w}x${h} clips real geometry at ${x},${y}`);
   }
  }
 }
});
test('framing reacts to viewport aspect and geometric extent, rather than fixed zoom expectations',()=>{
 assert.ok(global.HabitatFraming);
 const base=GroundCamera.habitat('PZ',16,40,4,1.43),corners=[];
 for(const x of [-1.491,1.491])for(const y of [-1.491,1.491])for(const z of [-1.491,1.491])corners.push([x,y,z]);
 const a=HabitatFraming.fit(base,corners,856,626,getCamera),large=HabitatFraming.fit(base,corners.map(p=>p.map(n=>n*1.5)),856,626,getCamera),narrow=HabitatFraming.fit(base,corners,230,626,getCamera);
 assert.ok(large[2]<a[2],'larger geometry requires a wider view');assert.notEqual(narrow[2],a[2]);
 assert.deepEqual(base,GroundCamera.habitat('PZ',16,40,4,1.43),'fit does not mutate input');
});

test('repeated resize fitting does not progressively shrink an already composed view',()=>{
 assert.ok(global.HabitatFraming);
 const points=HabitatFraming.points(CubeHabitats,CubeHabitats.suites.natural.atlasOf,CubeState.create());
 const first=HabitatFraming.fit(GroundCamera.habitat('PX',-58,45,1.21,1.43),points,856,626,getCamera);
 let next=first;for(let i=0;i<10;i++)next=HabitatFraming.fit(next,points,856,626,getCamera);
 assert.ok(Math.abs(next[2]-first[2])<.001,'repeated layout notifications must not accumulate a zoom penalty');
});

test('sampled habitat envelopes are cached across repeated selection/resize point queries',()=>{
 let calls=0;const instrumented={model(...args){calls++;return CubeHabitats.model(...args);}};
 const atlas=CubeHabitats.suites.natural.atlasOf,cubies=CubeState.create();
 const first=HabitatFraming.points(instrumented,atlas,cubies),coldCalls=calls;assert.ok(coldCalls>0);
 const again=HabitatFraming.points(instrumented,atlas,cubies);assert.equal(calls,coldCalls,'cached envelopes should not regenerate models');assert.deepEqual(again,first);
 HabitatFraming.points(instrumented,atlas,CubeState.turn(cubies,{axis:'x',layer:1,dir:1}));assert.equal(calls,coldCalls,'changed attachments reuse the same habitat envelopes');
});
