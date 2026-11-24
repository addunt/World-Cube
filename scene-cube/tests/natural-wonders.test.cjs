const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
for(const f of ['ground-water','ground-valley','ground-night'])require('../assets/starter/'+f+'.js');
const naturalFile=path.join(__dirname,'../assets/starter/ground-natural.js');
if(fs.existsSync(naturalFile))require(naturalFile);
const art=require('../assets/starter/cube-habitats.js');
const ids=['snow','oasis','bamboo','firefly','volcano','island'];
const sig=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const tri=tiles=>tiles.flat().reduce((n,p)=>n+p.points.length-2,0);
const boundary=(tile,axis,edge)=>new Set(tile.flatMap(f=>f.points.filter(p=>Math.abs(p[axis]-edge)<1e-7).map(p=>[f.color,...p.map(n=>Math.round(n*1e6))].join('/'))));
const joins=(a,b)=>[...a].filter(v=>b.has(v)).length;
test('suites preserve the original API and register six unique natural worlds',()=>{
 assert.ok(art.suites,'suite registry required');
 assert.equal(art.scenes.length,6);assert.equal(art.suites.original.scenes,art.scenes);
 assert.deepEqual(art.suites.natural.scenes.map(s=>s.id).sort(),ids.slice().sort());
 assert.equal(new Set([...art.scenes,...art.suites.natural.scenes].map(s=>s.id)).size,12);
 assert.deepEqual(art.suites.natural.atlasOf,{PY:'snow',PZ:'bamboo',PX:'oasis',NX:'island',NZ:'volcano',NY:'firefly'});
});
test('natural worlds occupy nine unique clipped cells, both seam axes and five height bands',()=>{
 for(const id of ids){
  const fixed=art.model(id,1.2,true),moving=art.model(id,1.2,false),tiles=fixed.map((v,i)=>v.concat(moving[i]));
  assert.equal(tiles.length,9);let lo=Infinity,hi=-Infinity;const bands=new Set(),fragments=new Set(),seams=[0,0];
  tiles.forEach((tile,slot)=>{
   assert.ok(tile.length,id+' empty '+slot);const x=slot%3-1,y=1-Math.floor(slot/3);
   fragments.add(sig(tile.map(f=>f.points.map(([u,v,h])=>[u-x,v-y,h]))));
   for(const f of tile)for(const [u,v,h] of f.points){
    assert.ok([u,v,h].every(Number.isFinite),id);assert.ok(Math.abs(u-x)<=.5000001&&Math.abs(v-y)<=.5000001,id+' bounds');
    assert.ok(h>=-1e-7&&h<1.45,id+' height '+h);lo=Math.min(lo,h);hi=Math.max(hi,h);bands.add(Math.floor(h*5));
   }
   if(slot%3<2&&joins(boundary(tile,0,x+.5),boundary(tiles[slot+1],0,x+.5))>=2)seams[0]++;
   if(slot<6&&joins(boundary(tile,1,y-.5),boundary(tiles[slot+3],1,y-.5))>=2)seams[1]++;
  });
  assert.equal(fragments.size,9,id);assert.ok(seams.every(n=>n>=2),id+' seams '+seams);
  assert.ok(lo<.065&&hi>.85&&bands.size>=5,id+' vertical '+[lo,hi,bands.size]);
 }
});
test('natural motion seeks reversibly, stays above shell and never contaminates original static cache',()=>{
 const before=art.scenes.map(s=>sig(art.model(s.id,0,true)));
 for(const id of ids){
  const first=sig(art.model(id,.36,false));assert.notEqual(first,sig(art.model(id,2.81,false)),id);assert.equal(first,sig(art.model(id,.36,false)),id);
  assert.deepEqual(art.model(id,8,true),art.model(id,0,true),id);
  for(const t of [0,.36,1.2,2.81,5,9,14,19.2])for(const f of art.model(id,t,false).flat())for(const p of f.points)assert.ok(p[2]>=0&&p[2]<1.45,id+' moving height '+p[2]);
 }
 assert.deepEqual(art.scenes.map(s=>sig(art.model(s.id,0,true))),before);
});
test('each natural triangle workload stays within 1.5 times the same-run original maximum',t=>{
 const count=id=>({id,static0:tri(art.model(id,0,true)),active0:tri(art.model(id,0,false)),active5:tri(art.model(id,5,false))});
 const original=art.scenes.map(s=>count(s.id)),natural=ids.map(count),total=r=>r.static0+r.active0+r.active5;
 const max=Math.max(...original.map(total));t.diagnostic(JSON.stringify({original,natural,max,limit:max*1.5}));
 for(const row of natural)assert.ok(total(row)<=max*1.5,row.id+' budget '+total(row));
});
test('shared surfaces classify approved landmarks and animals have grounded, time-varying poses',()=>{
 const n=globalThis.GroundNatural;assert.ok(n);
 for(const [id,x,y] of [['snow',.15,-.35],['oasis',.2,-.55],['bamboo',.03,0],['firefly',0,0],['volcano',.15,-1.0],['island',1.4,1.4]])assert.ok(n.surface(id,x,y)<0,id+' water');
 for(const [id,x,y] of [['snow',-.55,.15],['oasis',.55,-.25],['bamboo',-1,0],['volcano',-.75,.55],['island',0,.1]])assert.ok(n.surface(id,x,y)>0,id+' land');
 assert.notDeepEqual(n.camelPose(.36),n.camelPose(2.81));
 for(const t of [0,.3,2,5]){const p=n.camelPose(t);assert.equal(p[1],-.15);assert.ok(n.surface('oasis',p[0],p[1])>=0);}
 const a=n.frogPose(0),peak=n.frogPose(.4),landing=n.frogPose(.8);assert.ok(peak[2]>a[2]+.1);assert.ok(landing[2]>.1);assert.notDeepEqual(a,landing);
 assert.ok(!fs.readFileSync(naturalFile,'utf8').includes('Math.random'));
});
test('natural module precedes surfaces in HTML and static deploy includes every resource',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../assets/starter/index.html'),'utf8');
 assert.ok(html.indexOf('src="ground-natural.js"')>=0);assert.ok(html.indexOf('src="ground-natural.js"')<html.indexOf('src="ground-surfaces.js"'));
 for(const [,resource]of html.matchAll(/(?:src|href)="([^"]+)"/g))assert.ok(fs.existsSync(path.join(__dirname,'../assets/starter',resource)),resource);
});

test('frog feet contact water and log; full-length windmill rotor clears grass at every angle',()=>{
 const n=globalThis.GroundNatural;
 assert.ok(Math.abs(n.frogPose(0)[2]-.004-.021)<.003,'frog starts on water, not floating');
 assert.ok(Math.abs(n.frogPose(.8)[2]-.004-.225)<.009,'frog lands on the end of the log');
 assert.ok(Number.isFinite(n.islandHeight),'expose the shared grass elevation');
 for(let t=0;t<11;t+=.17){
  const blades=art.model('island',t,false).flat().filter(f=>['#ddd5b2','#f2e9c9'].includes(f.color));
  assert.ok(blades.length);for(const f of blades)for(const p of f.points)assert.ok(p[2]>n.islandHeight+.005,'rotor intersects grass');
 }
});

test('approved raised landmarks, not merely ground planes, meet across their designated seams',()=>{
 for(const [id,a,c,axis,edge,min]of [['snow',3,4,0,-.5,.4],['oasis',4,5,0,.5,.1],['bamboo',4,5,0,.5,.1],['firefly',3,4,0,-.5,.13],['volcano',4,7,1,-.5,.025],['island',4,5,0,.5,.3]]){
  const fixed=art.model(id,1.2,true),active=art.model(id,1.2,false),tiles=fixed.map((v,i)=>v.concat(active[i]));
  const points=tile=>new Set(tile.flatMap(f=>f.points.filter(p=>p[2]>min&&Math.abs(p[axis]-edge)<1e-7).map(p=>[f.color,...p.map(n=>Math.round(n*1e6))].join('/'))));
  assert.ok(joins(points(tiles[a]),points(tiles[c]))>=2,id+' missing raised landmark seam');
 }
});

test('warm spring steam becomes translucent instead of hiding the cabin behind opaque blobs',()=>{
 const steam=art.model('snow',1.2,false).flat().filter(f=>f.color==='#e6f3ef');
 assert.ok(steam.length);assert.ok(steam.every(f=>f.alpha<.5&&f.alpha>0));
 assert.ok(new Set(steam.map(f=>f.alpha.toFixed(2))).size>3);
});

test('all twelve 240px ground textures render, stay distinct and keep ID-isolated caches',()=>{
 const vm=require('node:vm'),textures=[];
 const context=vm.createContext({Uint8ClampedArray,Math,Map,Set,document:{createElement(){
  const canvas={width:0,height:0,getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(img){canvas.pixels=img.data;}};}};textures.push(canvas);return canvas;
 }}});
 for(const file of ['ground-valley','ground-natural','ground-surfaces'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/starter',file+'.js'),'utf8'),context);
 const all=[...art.scenes.map(s=>s.id),...ids],first=all.map(id=>context.GroundSurfaces.get(id));
 assert.equal(textures.length,12);assert.equal(new Set(first.map(c=>sig(Array.from(c.pixels)))).size,12);
 first.forEach((canvas,i)=>{assert.equal(canvas.width,240);assert.equal(canvas.height,240);assert.equal(canvas.pixels.length,240*240*4);assert.equal(context.GroundSurfaces.get(all[i]),canvas);});
});
