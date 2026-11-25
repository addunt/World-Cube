const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {load,starter}=require('../test-support/load.cjs');
const ids=['fantasy_moonshroom','fantasy_crystal','fantasy_ruins','fantasy_treehouse','fantasy_starspring','fantasy_dragon'];
function ready(){const c=load();for(const f of ['fantasy-world.js','ground-fantasy.js'])if(fs.existsSync(path.join(starter,f)))vm.runInContext(fs.readFileSync(path.join(starter,f),'utf8'),c);assert.ok(c.GroundFantasyWorld&&c.GroundFantasy,'complete lazy fantasy world/provider must exist');return c;}
const tris=tiles=>tiles.flat().reduce((s,f)=>s+f.points.length-2,0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
test('fantasy registers six unique ready-gated ids, stays lazy, preserves defaults and coexists with all five implemented suites',()=>{
 const c=load(),a=c.CubeHabitats;assert.deepEqual(Array.from(a.availableSuites()),['natural','eastern','fantasy','civilizations','original']);assert.equal(a.resolveSuite('?suite=fantasy').suite,'fantasy');assert.equal(a.resolveSuite('').suite,'natural');assert.equal(a.resolveSuite('?suite=civilizations').suite,'civilizations');assert.deepEqual(Array.from(a.suites.fantasy.scenes,s=>s.id),ids);assert.equal(c.GroundFantasy,undefined);assert.throws(()=>a.model(ids[0],0,true),/not ready/);assert.equal(new Set(Object.values(a.suites).flatMap(s=>Array.from(s.scenes,x=>x.id))).size,30);
});
test('six fantasy compositions have nine varied cells, proper height levels and actual specified high paired seams',()=>{
 const c=ready(),a=c.CubeHabitats;const seams=[[0,-.5,.8],[0,.5,.15],[0,.5,.7],[0,-.5,.2],[1,-.5,.06],[0,.5,.1]];
 for(const [n,id]of ids.entries()){
  const cells=a.model(id,0,true);assert.equal(cells.length,9);assert.ok(cells.every(v=>v.length));assert.equal(new Set(cells.map(v=>JSON.stringify(v))).size,9);
  const heights=new Set();let lo=9,hi=-9;for(const f of [...cells.flat(),...a.model(id,1.2,false).flat()]){
   assert.ok(f.points.length>=3);let area=0;for(const p of f.points){assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(p[0])<=1.500001&&Math.abs(p[1])<=1.500001);assert.ok(p[2]>=-1e-8&&p[2]<1.45,id+' z='+p[2]);lo=Math.min(lo,p[2]);hi=Math.max(hi,p[2]);heights.add(Math.round(p[2]*100));}
   for(let i=1;i<f.points.length-1;i++)area+=Math.hypot(...cross(f.points[i].map((n,k)=>n-f.points[0][k]),f.points[i+1].map((n,k)=>n-f.points[0][k])));assert.ok(area>1e-12,id+' nondegenerate triangle fan');
  }assert.ok(lo<.065&&hi>.85&&heights.size>=5,id+' independent vertical composition');
  const [axis,edge,z]=seams[n],halves=[new Set(),new Set()];for(const forms of cells)for(const f of forms){const side=f.points.reduce((s,p)=>s+p[axis],0)/f.points.length<edge?0:1;for(const p of f.points)if(Math.abs(p[axis]-edge)<1e-7&&p[2]>z)halves[side].add(p.map(n=>n.toFixed(6)).join(',')+f.color);}assert.ok([...halves[0]].some(k=>halves[1].has(k)),id+' paired high seam is real subject, not only floor');
 }
});
test('fantasy static first requested nonzero is canonical, reverse seeks deterministic and both visible landmarks are actual moving mesh points',()=>{
 const c=ready(),a=c.CubeHabitats,w=c.GroundFantasyWorld;for(const id of ids){assert.equal(JSON.stringify(a.model(id,13.7,true)),JSON.stringify(ready().CubeHabitats.model(id,0,true)));const before=a.model(id,.36,false);a.model(id,2.81,false);assert.deepEqual(a.model(id,.36,false),before);assert.notDeepEqual(before,a.model(id,2.81,false));
  for(let channel=0;channel<2;channel++){const points=[];for(const t of [0,.4,.8,1.2,1.6,2.4,3.2,3.6,4.8]){const m=w.motion(id,t);if(m.featureVisible?.[channel]===false)continue;const p=m.features[channel];points.push(p);assert.ok(a.model(id,t,false).flat().some(f=>f.points.some(q=>Math.hypot(...p.map((n,k)=>n-q[k]))<1e-7)),id+' channel'+channel+' actual visible mesh landmark');}let span=0;for(const p of points)for(const q of points)span=Math.max(span,Math.hypot(...p.map((n,k)=>n-q[k])));assert.ok(span>.15,id+' channel'+channel+' substantial independent travel');}
 }
});
test('cached analytic component bounds contain static and full 42s sampled actor trajectories without querying models',()=>{
 const c=ready(),a=c.CubeHabitats;for(const id of ids){const original=a.model;a.model=()=>{throw Error('bounds must not enumerate models');};const boxes=a.bounds(id);assert.equal(a.bounds(id),boxes);a.model=original;assert.equal(boxes.length,9);
  for(const [t,pass]of [[0,true],...Array.from({length:421},(_,i)=>[i*.1,false]),...[.5,.7,.75,1,1.5,1.75,2.1,2.25,3,3.5].map(t=>[t,false])])for(const [cell,forms]of a.model(id,t,pass).entries())for(const f of forms)for(const p of f.points){for(let k=0;k<3;k++)assert.ok(p[k]>=boxes[cell].lo[k]-1e-7&&p[k]<=boxes[cell].hi[k]+1e-7,id+' cell'+cell+' axis'+k+' t'+t+' point'+p);assert.ok(boxes[cell].parts.some(b=>p.every((n,k)=>n>=b.lo[k]-1e-7&&n<=b.hi[k]+1e-7)),id+' component-union gap cell'+cell+' t'+t+' point'+p);}
 }
});
test('fantasy exact n-2 and active peaks stay within same-run original1.5x, including approved extrema',()=>{
 const c=ready(),a=c.CubeHabitats,stats={};for(const id of [...Array.from(a.scenes,s=>s.id),...ids]){const s={static:tris(a.model(id,0,true)),active0:tris(a.model(id,0,false)),active5:tris(a.model(id,5,false)),peak:0};for(const t of [...Array.from({length:421},(_,i)=>i/10),.5,.7,.75,1.5,1.75,2.1,2.25,3.5])s.peak=Math.max(s.peak,tris(a.model(id,t,false)));s.sum=s.static+s.active0+s.active5;stats[id]=s;}const old=Array.from(a.scenes,s=>stats[s.id]),limit=Math.max(...old.map(s=>s.sum))*1.5,peakLimit=Math.max(...old.map(s=>s.peak))*1.5;console.log('FANTASY_TRIANGLE_BUDGET '+JSON.stringify({limit,peakLimit,stats}));for(const id of ids){assert.ok(stats[id].sum<=limit,id+' total');assert.ok(stats[id].peak<=peakLimit,id+' active');}
});
test('approved actor populations, extents, pivots and phase periods are not replaced by recolored particles',()=>{
 const c=ready(),w=c.GroundFantasyWorld;
 for(let i=0;i<=96;i++){const t=i*.1,m=w.motion(ids[0],t);assert.equal(m.moths.length,3);assert.equal(m.spores.length,8);for(const x of m.moths)assert.ok(x.p[2]>=.28);assert.equal(w.motion(ids[1],t).crystals.length,2);assert.equal(w.motion(ids[1],t).rings.length,3);assert.equal(w.motion(ids[2],t).stones.length,3);assert.equal(w.motion(ids[3],t).books.length,2);assert.equal(w.motion(ids[4],t).grains.length,16);assert.ok(w.motion(ids[5],t).breath.length<=7);}
 for(const [id,period]of ids.map((id,i)=>[id,[12,60,14,42,15,12][i]])){const x=w.motion(id,.36),y=w.motion(id,.36+period);for(let k=0;k<2;k++)assert.ok(Math.hypot(...x.features[k].map((n,j)=>n-y.features[k][j]))<1e-7,id+' combined period');}
 const ring=w.motion(ids[1],.4).rings[0];assert.ok(ring.width>=.025); // spec§100/104: authored band width is a design lower bound, not a visibility cap.
 assert.ok(ring.radius>=.08&&ring.radius<=.48);
 const flagA=w.motion(ids[2],.5).flag.at(-1),flagB=w.motion(ids[2],1.5).flag.at(-1);assert.ok(Math.abs(flagA[0][1]-flagB[0][1]-.20)<1e-7);
 const a=w.motion(ids[5],1),b=w.motion(ids[5],3);assert.ok(Math.hypot(...a.tail.at(-1).map((n,k)=>n-b.tail.at(-1)[k]))>=.22);assert.deepEqual(a.feet,b.feet);assert.equal(w.motion(ids[5],3).breath.length,0);
});
test('actual moth wing spans remain within .16–.22 while their combined fold sweeps at least70degrees',()=>{const c=ready(),w=c.GroundFantasyWorld,folds=[];for(let i=0;i<=80;i++){const a=w.motion('fantasy_moonshroom',i*.01).moths[0],left=a.wings[0][1],right=a.wings[1][1],span=Math.hypot(left[0]-right[0],left[1]-right[1]);assert.ok(span>=.16-1e-8&&span<=.22+1e-8,'actual folded width '+span);folds.push(a.wing);}assert.ok((Math.max(...folds)-Math.min(...folds))*2>=70*Math.PI/180-1e-7);});
