const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const {load,eastern,starter}=require('../test-support/load.cjs');
const render=require('../scripts/render.cjs');
test('Eastern CLI selects the correct URL silently, rejects audio and unknown suites before browser setup',()=>{
 const r=render.exportSettings('/tmp/a b/index.html',{suite:'eastern'});assert.equal(new URL(r.entry).searchParams.get('suite'),'eastern');assert.equal(r.audioFile,null);
 assert.throws(()=>render.exportSettings('index.html',{suite:'eastern',audio:'anything.flac'}),/silent|original/i);
 for(const suite of ['unbuilt'])assert.throws(()=>render.exportSettings('index.html',{suite}),/Invalid suite/i);
 const source=fs.readFileSync(path.join(__dirname,'../scripts/render.cjs'),'utf8');assert.match(source,/await .*sceneCube.*ready/);
});
test('Eastern pixel material consults the canonical shoreline once per pixel and remains cached',()=>{
 const images=[];const ctx=eastern(load({document:{createElement:()=>({width:0,height:0,getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:image=>images.push(image)};}})}}));
 let calls=0;const real=ctx.GroundEastern.surface;ctx.GroundEastern={...ctx.GroundEastern,surface(...args){calls++;return real(...args);}};
 vm.runInContext(fs.readFileSync(path.join(starter,'ground-surfaces.js'),'utf8'),ctx);
 const a=ctx.GroundSurfaces.get('eastern_waterlane');assert.equal(calls,240*240);assert.equal(ctx.GroundSurfaces.get('eastern_waterlane'),a);assert.equal(calls,240*240);
 const data=images[0].data;assert.equal(data.length,240*240*4);assert.ok(new Set(Array.from({length:240*240},(_,i)=>data.slice(i*4,i*4+3).join(','))).size>100);
});
test('new models use planar convex polygons after clipping and catalog rejects duplicate IDs',()=>{
 const ctx=eastern(load()),art=ctx.CubeHabitats;
 for(const id of art.suites.eastern.scenes.map(s=>s.id))for(const t of [0,.8,2.4])for(const pass of [true,false])for(const f of art.model(id,t,pass).flat()){
  if(f.points.length===3)continue;const p=f.points,sub=(a,b)=>a.map((n,k)=>n-b[k]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((n,x,k)=>n+x*b[k],0);
  let normal;for(let i=1;i<p.length-1;i++){const v=cross(sub(p[i],p[0]),sub(p[i+1],p[0]));if(Math.hypot(...v)>1e-10){normal=v;break;}}
  if(!normal)continue;const norm=Math.hypot(...normal);for(const v of p)assert.ok(Math.abs(dot(sub(v,p[0]),normal))/norm<1e-7,id+' nonplanar polygon');
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],c=p[(i+2)%p.length];assert.ok(dot(cross(sub(b,a),sub(c,b)),normal)>=-1e-9,id+' concave polygon');}
 }
 assert.throws(()=>ctx.SuiteCatalog.create({original:{scenes:[{id:'eastern_waterlane'}]}}),/duplicate/i);
});
test('clean static build includes lazy manifest resources but no eager Eastern script request',()=>{
 const html=fs.readFileSync(path.join(starter,'index.html'),'utf8');assert.doesNotMatch(html,/<script[^>]+src="(?:eastern-world|ground-eastern)\.js"/);
 const file=fs.readFileSync(path.join(__dirname,'../../scripts/world-cube.cjs'),'utf8');assert.match(file,/SuiteCatalog|suite-catalog/,'build must validate indirect manifest dependencies');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cube-eastern-build-')),out=path.join(tmp,'site');
 try{const r=cp.spawnSync(process.execPath,[path.join(__dirname,'../../scripts/world-cube.cjs'),'deploy','--out',out],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);for(const name of ['suite-catalog.js','eastern-world.js','ground-eastern.js'])assert.equal(fs.readFileSync(path.join(out,name),'utf8'),fs.readFileSync(path.join(starter,name),'utf8'));}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('three available desktop suite controls use one row; mobile wraps in document flow with touch targets',()=>{
 const css=fs.readFileSync(path.join(starter,'styles.css'),'utf8'),html=fs.readFileSync(path.join(starter,'index.html'),'utf8');
 assert.match(css,/\.suite-switch\s*\{[^}]*repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width: 765px\)[\s\S]*\.suite-switch\s*\{[^}]*repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/\.suite-switch button\s*\{[^}]*min-height: 44px/);assert.match(html,/<aside[\s\S]*id="suite-eastern"/);assert.match(html,/id="suite-civilizations"/);
});
