const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('../test-support/controller.cjs');const {load,eastern}=require('../test-support/load.cjs');
test('direct Eastern startup waits for local dependencies before first paint and publishes ready',async()=>{
 const app=boot('?suite=eastern&diagnostics=1');assert.equal(app.painted.length,0);assert.ok(app.context.sceneCube.ready);
 await app.flushScripts();await app.context.sceneCube.ready;assert.equal(app.inspect().suite,'eastern');assert.equal(app.painted[0].atlas.PY,'eastern_waterlane');assert.equal(app.$('scene-list').children.length,6);
});
test('lazy switching is atomic, deduplicated and latest-request-wins; failures keep the old suite usable',async()=>{
 const app=boot();app.$('positive').emit('click');app.$('suite-eastern').emit('click');assert.equal(app.inspect().loading,true);assert.equal(app.inspect().suite,'natural');assert.equal(app.inspect().move,null);
 const first=app.scripts[0];app.$('suite-eastern').emit('click');assert.equal(app.scripts.length,1);
 app.$('suite-original').emit('click');assert.equal(app.inspect().suite,'original');await app.flushScripts();assert.equal(app.inspect().suite,'original','late Eastern cannot overwrite original');
 app.$('suite-eastern').emit('click');assert.equal(app.inspect().suite,'eastern');assert.equal(app.inspect().historyLength,0);assert.equal(app.inspect().time,0);assert.equal(app.inspect().playing,false);
 assert.match(app.urls.at(-1),/suite=eastern/);
 const failed=boot();failed.$('suite-eastern').emit('click');failed.scripts.shift().onerror();await new Promise(r=>setImmediate(r));assert.equal(failed.inspect().suite,'natural');assert.equal(failed.inspect().loading,false);assert.match(failed.$('suite-status').textContent,/失败/);
 failed.$('positive').emit('click');assert.ok(failed.inspect().move);assert.ok(first);
});
test('reset cancels pending suite intent; unknown URLs show notice and no-WebGL never loads new models',async()=>{
 const app=boot();app.$('suite-eastern').emit('click');app.$('reset').emit('click');await app.flushScripts();assert.equal(app.inspect().suite,'natural');
 const unavailable=boot('?suite=unbuilt');assert.equal(unavailable.inspect().suite,'natural');assert.match(unavailable.$('suite-status').textContent,/未识别/);
 const noGL=boot('?suite=eastern',{webgl:false});assert.equal(noGL.scripts.length,0);assert.equal(noGL.$('suite-eastern').disabled,true);
});
test('Eastern fitting uses declared bounds without generating activity, while all actual sampled vertices fit desktop/mobile and mixed states',()=>{
 const ctx=eastern(load()),art=ctx.CubeHabitats,gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(o,k)=>k in o?o[k]:()=>({})}),camera=ctx.HabitatRenderer(gl,art,{}).getCamera,atlas=art.suites.eastern.atlasOf;
 let calls=0;const spy={bounds:art.bounds,model(...args){calls++;return art.model(...args);}};
 for(const cubies of [ctx.CubeState.create(),ctx.CubeState.turn(ctx.CubeState.create(),{axis:'y',layer:0,dir:1})]){
  const points=ctx.HabitatFraming.points(spy,atlas,cubies);assert.equal(calls,0,'declared bounds must avoid 60 cold model generations');
  for(const [w,h]of [[856,626],[356.8,429],[230,626]])for(const face of Object.keys(atlas)){
   const [a,e]=art.suites.eastern.angles[face],base=ctx.GroundCamera.habitat(face,a,e,1.21,1.43),view=ctx.HabitatFraming.fit(base,points,w,h,camera),cam=camera(view,w,h);
   for(const p of points){const [x,y]=cam.project(p);assert.ok(x>=8&&x<=w-8&&y>=8&&y<=h-24,face+' normal projected extent');}
  }
 }
});
test('Eastern real mesh motion landmarks exceed six projected CSS pixels in a prescribed fixed view',()=>{
 const ctx=eastern(load()),art=ctx.CubeHabitats,wld=ctx.GroundEasternWorld,gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(o,k)=>k in o?o[k]:()=>({})}),camera=ctx.HabitatRenderer(gl,art,{}).getCamera,cubies=ctx.CubeState.create(),atlas=art.suites.eastern.atlasOf;
 for(const [w,h]of [[856,626],[356.8,429]])for(const face of Object.keys(atlas)){
  const id=atlas[face],[a,e,la,le,x,y]=art.suites.eastern.angles[face],frame=ctx.CubeState.faces[face];
  const world=p=>frame.right.map((n,k)=>n*p[0]+frame.up[k]*p[1]+frame.normal[k]*(1.491+p[2]));
  const normal=ctx.HabitatFraming.fit(ctx.GroundCamera.habitat(face,a,e,1.21,1.43),ctx.HabitatFraming.points(art,atlas,cubies),w,h,camera);
  const low=ctx.HabitatFraming.fit(ctx.GroundCamera.habitat(face,la,le,1.30,1.78,x,y),ctx.HabitatFraming.points(art,atlas,cubies,face),w,h,camera);
  for(const channel of [0,1]){let best=0;for(const view of [normal,low]){const cam=camera(view,w,h),probes=[0,.8,1.2,1.6,2.4,3.6,4.8].map(t=>cam.project(world(wld.motion(id,t).features[channel])));for(const a of probes)for(const b of probes)best=Math.max(best,Math.hypot(a[0]-b[0],a[1]-b[1]));}assert.ok(best>=6,id+' A/B '+channel+' projected movement '+best);}
 }
});
test('Eastern resize races coalesce after camera and layer settle, with repeated fits stable',async()=>{
 const app=boot('',{width:856,height:626});app.$('suite-eastern').emit('click');await app.flushScripts();app.$('scene-list').children[0].emit('click');app.tick(200);app.$('positive').emit('click');const before=app.fitCalls();app.resize(230,626);app.tick(450);assert.equal(app.fitCalls(),before);app.tick(200);assert.equal(app.fitCalls(),before+1);const zoom=app.inspect().view[2];app.resize(230,626);assert.ok(Math.abs(app.inspect().view[2]-zoom)<.001);
 app.$('close-view').emit('click');app.tick(700);app.resize(220,626);assert.ok(app.inspect().closeView);app.tick(700);assert.equal(app.inspect().suite,'eastern');
});
const materialGroups={
 eastern_waterlane:[['#ae7950','#725944','#936b47'],['#a52942','#ffe2a5']],
 eastern_terraces:[['#e8d58e','#a68b5b'],['#c4e0c4','#b1dac7']],
 eastern_zentemple:[['#ba9458','#e0bf78'],['#a52942','#ffe2a5']],
 eastern_li_river:[['#c5ab70','#725944','#936b47'],['#e2cb88']],
 eastern_tea_trail:[['#173f62','#edc6a0'],['#e3f3a0','#cae982']],
 eastern_seacliff:[['#f0ead1','#d5dbca','#ae7950'],['#d6e8df']]
};
test('both Eastern action meshes occupy >=12 CSS px and representative landmark rays are mostly unoccluded in prescribed views',()=>{
 const ctx=eastern(load()),art=ctx.CubeHabitats,gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(o,k)=>k in o?o[k]:()=>({})}),getCamera=ctx.HabitatRenderer(gl,art,{}).getCamera,cubies=ctx.CubeState.create(),atlas=art.suites.eastern.atlasOf;
 const sub=(a,b)=>a.map((n,k)=>n-b[k]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((n,x,k)=>n+x*b[k],0);
 function blocked(eye,p,forms){const d=sub(p,eye);for(const f of forms)for(let i=1;i<f.points.length-1;i++){const [a,b,c]=[f.points[0],f.points[i],f.points[i+1]],e1=sub(b,a),e2=sub(c,a),h=cross(d,e2),det=dot(e1,h);if(Math.abs(det)<1e-9)continue;const s=sub(eye,a),u=dot(s,h)/det;if(u<0||u>1)continue;const q=cross(s,e1),v=dot(d,q)/det;if(v<0||u+v>1)continue;const t=dot(e2,q)/det;if(t>0&&t<.995)return true;}return false;}
 const report=[];
 for(const [w,h]of [[856,626],[356.8,429]])for(const face of Object.keys(atlas)){
  const id=atlas[face],[a,e,la,le,x,y]=art.suites.eastern.angles[face],frame=ctx.CubeState.faces[face],world=p=>frame.right.map((n,k)=>n*p[0]+frame.up[k]*p[1]+frame.normal[k]*(1.491+p[2]));
  const views=[ctx.HabitatFraming.fit(ctx.GroundCamera.habitat(face,a,e,1.21,1.43),ctx.HabitatFraming.points(art,atlas,cubies),w,h,getCamera),ctx.HabitatFraming.fit(ctx.GroundCamera.habitat(face,la,le,1.30,1.78,x,y),ctx.HabitatFraming.points(art,atlas,cubies,face),w,h,getCamera)];
  const fixed=art.model(id,0,true).flat().filter(f=>f.alpha>=.995),normalVisible=[];
  for(const channel of [0,1]){let best=0,bestSize=0;
   for(const [vi,view]of views.entries()){
    const cam=getCamera(view,w,h),axes=ctx.GroundCamera.axes(view),camera=view.slice(4,7).map((n,k)=>n+13*axes.eye[k]),eye=[dot(camera,frame.right),dot(camera,frame.up),dot(camera,frame.normal)-1.491];let visible=0;
    for(let i=0;i<24;i++){const t=i*.4,m=ctx.GroundEasternWorld.motion(id,t);if(!blocked(eye,m.features[channel],fixed))visible++;}
    if(vi===0)normalVisible[channel]=visible/24;best=Math.max(best,visible/24);
    const verts=art.model(id,.8,false).flat().filter(f=>materialGroups[id][channel].includes(f.color)).flatMap(f=>f.points).map(p=>cam.project(world(p)));assert.ok(verts.length,id+' needs opaque motion material geometry');
    const size=Math.max(Math.max(...verts.map(p=>p[0]))-Math.min(...verts.map(p=>p[0])),Math.max(...verts.map(p=>p[1]))-Math.min(...verts.map(p=>p[1])));bestSize=Math.max(bestSize,size);
   }
   report.push({id,stage:[w,h],channel,visible:best,size:bestSize});assert.ok(best>=.75,id+' channel '+channel+' representative static occlusion '+best);assert.ok(bestSize>=12,id+' channel '+channel+' action size '+bestSize);
  }
  assert.ok(normalVisible.some(n=>n>=.75),id+' needs at least one readable default action');
 }
 console.log('EASTERN_PROJECTED_ACTIONS '+JSON.stringify(report));
});
test('Eastern 19.2s demo preserves original physical beats, covers six faces and contains sampled turning extents',async()=>{
 const app=boot('?suite=eastern&export=1'),original=boot('?suite=original&export=1');await app.flushScripts();await app.context.sceneCube.ready;
 const ctx=app.context,art=ctx.CubeHabitats,faces=new Set(),getCamera=ctx.HabitatRenderer().getCamera;
 for(let t=0;t<=19.2+.0001;t+=.32){
  ctx.renderAt(t);original.context.renderAt(t);const out=app.inspect(),old=original.inspect(),paint=app.painted.at(-1);assert.deepEqual(out.cubies,old.cubies);assert.deepEqual(out.move,old.move);if(t>.72&&t<18){faces.add(out.face);const eye=ctx.GroundCamera.axes(paint.view).eye,normal=ctx.CubeState.faces[out.face].normal;assert.ok(eye.reduce((n,v,k)=>n+v*normal[k],0)>.5,"authored face must actually face the eye");}
  const cam=getCamera(paint.view,856,626),points=ctx.HabitatFraming.points(art,art.suites.eastern.atlasOf,out.cubies,null,paint.move,paint.angle);
  for(const p of points){const [x,y]=cam.project(p);assert.ok(x>=8&&x<=848&&y>=8&&y<=602,'demo turning geometry clipped at '+t+' '+x+','+y);}
 }
 assert.equal(faces.size,6);
});
test('successful suite URL replacement preserves unrelated flags and failures never rewrite the address',async()=>{
 const app=boot('?diagnostics=1&keep=yes');app.$('suite-eastern').emit('click');assert.equal(app.urls.length,0);await app.flushScripts();const url=new URL(app.urls.at(-1));assert.equal(url.searchParams.get('diagnostics'),'1');assert.equal(url.searchParams.get('keep'),'yes');assert.equal(url.searchParams.get('suite'),'eastern');
 app.$('close-view').emit('click');app.$('positive').emit('click');app.$('suite-original').emit('click');assert.equal(app.inspect().closeView,false);assert.equal(app.inspect().move,null);assert.equal(app.inspect().historyLength,0);
});
test('real-entry cold Eastern load honors suite/reset intent before configure and settles the original ready promise',async()=>{
 for(const intent of ['original','natural','reset']){
  const app=boot('?suite=eastern&keep=yes'),initialReady=app.context.sceneCube.ready;let settled=false;initialReady.then(()=>{settled=true;});
  assert.equal(app.painted.length,0);assert.ok(app.scripts.length>0);
  app.$(intent==='reset'?'reset':'suite-'+intent).emit('click');
  assert.equal(typeof app.context.sceneCube.inspect,'function','cold '+intent+' must have an active listener before dependencies load');
  const expected=intent==='original'?'original':'natural';assert.equal(app.inspect().suite,expected);await new Promise(r=>setImmediate(r));assert.equal(settled,true,'latest ready selection settles the original startup promise without waiting for obsolete Eastern load');
  await app.flushScripts();assert.equal(app.inspect().suite,expected);assert.equal(app.inspect().historyLength,0);assert.equal(app.inspect().closeView,false);assert.equal(app.$('suite-'+expected).getAttribute('aria-pressed'),'true');
 }
});
test('cold-to-warm request generations ignore obsolete load failures and later warm selection still works',async()=>{
 const app=boot('?suite=eastern');app.$('suite-original').emit('click');assert.equal(typeof app.context.sceneCube.inspect,'function');
 app.scripts.shift().onerror();await new Promise(r=>setImmediate(r));assert.equal(app.inspect().suite,'original');
 app.$('suite-eastern').emit('click');app.$('suite-natural').emit('click');await app.flushScripts();assert.equal(app.inspect().suite,'natural');
 app.$('suite-eastern').emit('click');await app.flushScripts();assert.equal(app.inspect().suite,'eastern');
});
