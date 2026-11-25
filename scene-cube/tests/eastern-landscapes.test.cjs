const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load,eastern,starter}=require('../test-support/load.cjs');
const ctx=load();if(fs.existsSync(path.join(starter,'ground-eastern.js')))eastern(ctx);
const art=ctx.CubeHabitats,ids=Array.from(art.suites.eastern.scenes,s=>s.id),tris=tiles=>tiles.flat().reduce((n,p)=>n+p.points.length-2,0);
function ready(){assert.ok(ctx.GroundEasternWorld&&ctx.GroundEastern,'Eastern world and geometry must exist');return ctx.GroundEasternWorld;}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
test('six eastern compositions have nine distinct tiles, high landmark seams and finite nondegenerate convex geometry',()=>{
 ready();assert.equal(ids.length,6);
 for(const id of ids){
  const cells=art.model(id,0,true);assert.equal(cells.length,9);assert.ok(cells.every(a=>a.length));assert.equal(new Set(cells.map(a=>JSON.stringify(a))).size,9);
  const all=[...cells.flat(),...art.model(id,2.81,false).flat()],heights=new Set();let min=9,max=-9;
  for(const f of all){assert.match(f.color,/^#[0-9a-f]{6}$/i);assert.ok(f.points.length>=3);let area=0;
   for(const p of f.points){assert.ok(p.every(Number.isFinite));assert.ok(p[0]>=-1.50001&&p[0]<=1.50001&&p[1]>=-1.50001&&p[1]<=1.50001);assert.ok(p[2]>=-1e-8&&p[2]<1.45,id+' height '+p[2]);min=Math.min(min,p[2]);max=Math.max(max,p[2]);heights.add(Math.round(p[2]*100));}
   const a=f.points[0];for(let i=1;i<f.points.length-1;i++)area+=Math.hypot(...cross(f.points[i].map((n,k)=>n-a[k]),f.points[i+1].map((n,k)=>n-a[k])));
   assert.ok(area>1e-12,id+' zero-area face');
  }
  assert.ok(min<.065&&max>.85&&heights.size>=5,id+' vertical composition');
  for(const axis of [0,1]){let matches=0;for(const edge of [-.5,.5]){
   const halves=[new Set(),new Set()];for(const cell of cells)for(const f of cell){const side=f.points.reduce((a,p)=>a+p[axis],0)/f.points.length<edge?0:1;for(const p of f.points)if(Math.abs(p[axis]-edge)<1e-7&&p[2]>.08)halves[side].add(p.map(n=>n.toFixed(5)).join(','));}
   matches+=[...halves[0]].filter(k=>halves[1].has(k)).length;
  }assert.ok(matches>0,id+' actual high seam on axis '+axis);}
 }
});
test('static is canonical, active seeks reverse deterministically and two real mesh landmarks move independently',()=>{
 const world=ready();
 for(const id of ids){assert.deepEqual(art.model(id,12.2,true),art.model(id,0,true));const before=art.model(id,.36,false);art.model(id,40,false);assert.deepEqual(art.model(id,.36,false),before);assert.notDeepEqual(before,art.model(id,2.81,false));
  for(const channel of [0,1]){const points=[];for(const t of [0,.8,1.2,1.6,2.4,3.6,4.8]){
   const p=world.motion(id,t).features[channel];points.push(p);const vertices=art.model(id,t,false).flat().flatMap(f=>f.points);
   assert.ok(vertices.some(q=>Math.hypot(...p.map((n,k)=>n-q[k]))<1e-7),id+' channel '+channel+' landmark is an actual animated mesh vertex');
  }let span=0;for(const a of points)for(const b of points)span=Math.max(span,Math.hypot(...a.map((n,k)=>n-b[k])));assert.ok(span>.14,id+' channel '+channel+' large-scale movement');}
 }
});
test('shared height/shore functions keep dry feet and water actors attached, with bounded periodic kinematics',()=>{
 const w=ready();for(let t=0;t<=19.2;t+=.12){
  for(const id of ids){const a=w.motion(id,t),b=w.motion(id,t+19.2);for(let c=0;c<2;c++)assert.ok(Math.hypot(...a.features[c].map((n,k)=>n-b.features[c][k]))<1e-8,id+' periodic');}
  for(const id of ['eastern_waterlane','eastern_li_river','eastern_seacliff']){const p=w.motion(id,t).boat.p;assert.ok(w.surface(id,p[0],p[1])<-.10,id+' ship center has shore clearance');}
  const man=w.motion('eastern_tea_trail',t).porter;assert.ok(Math.abs(man.ground-w.height('eastern_tea_trail',...man.p))<1e-8);assert.ok(man.feet.some(f=>Math.abs(f.lift)<1e-9),'at least one grounded foot');
 }
});
test('declared per-cell bounds contain static and densely sampled activities without model generation at query time',()=>{
 ready();for(const id of ids){const boxes=ctx.GroundEastern.bounds(id);assert.equal(boxes.length,9);assert.equal(ctx.GroundEastern.bounds(id),boxes);
  for(const [t,pass]of [[0,true],...Array.from({length:193},(_,i)=>[i*.1,false])])for(const [i,forms]of art.model(id,t,pass).entries())for(const f of forms)for(const p of f.points)for(let k=0;k<3;k++)assert.ok(p[k]>=boxes[i].lo[k]-1e-7&&p[k]<=boxes[i].hi[k]+1e-7,`${id} cell ${i} axis${k} ${p[k]} outside declared ${boxes[i].hi[k]}`);
 }
});
test('real post-partition n-2 triangle and 0-42s active peak budgets compare to same-run originals',()=>{
 ready();const stats={};for(const id of [...Array.from(art.scenes,s=>s.id),...ids]){
  const stat={static:tris(art.model(id,0,true)),active0:tris(art.model(id,0,false)),active5:tris(art.model(id,5,false)),peak:0};
  for(let i=0;i<=420;i++)stat.peak=Math.max(stat.peak,tris(art.model(id,i/10,false)));stat.sum=stat.static+stat.active0+stat.active5;stats[id]=stat;
 }
 const originals=Array.from(art.scenes,s=>stats[s.id]),limit=Math.max(...originals.map(s=>s.sum))*1.5,peakLimit=Math.max(...originals.map(s=>s.peak))*1.5;
 console.log('EASTERN_TRIANGLE_BUDGET '+JSON.stringify({limit,peakLimit,stats}));for(const id of ids){assert.ok(stats[id].sum<=limit,id+' total');assert.ok(stats[id].peak<=peakLimit,id+' active peak');}
});
test('approved cloth observation times put the free end at center then opposing extrema',()=>{
 const w=ready();for(const [id,x,width,p]of [['eastern_waterlane',.80,.34,3.2],['eastern_zentemple',.68,.24,4.8]]){
  const center=w.motion(id,0).cloth[3][1][0];assert.ok(Math.abs(center-(x+width/2))<1e-9,id+' t0 centered');
  const a=w.motion(id,p/4).cloth[3][1][0],b=w.motion(id,3*p/4).cloth[3][1][0];assert.ok(a>center+.14&&b<center-.14,id+' visible opposing phases');
 }
});
test('entire waterlane hull and oar sweep stay over its canonical canal, not merely the ship center',()=>{
 const w=ready();for(let i=0;i<=192;i++){
  const t=i*.1,m=w.motion('eastern_waterlane',t),p=m.boat;
  for(const v of [[.20,0,.07],[.124,-.07,.08],[-.152,-.07,.08],[-.20,0,.05],[-.152,.07,.08],[.124,.07,.08]]){const a=w.at(p,v);assert.ok(w.surface('eastern_waterlane',a[0],a[1])<-.015,'hull shoreline '+t);}
  const end=[-.15+.33*Math.cos(p.oar),.06+.30*Math.sin(p.oar),.02];for(let j=0;j<=8;j++){const a=w.at(p,[-.15+(end[0]+.15)*j/8,.06+(end[1]-.06)*j/8,.02]);assert.ok(w.surface('eastern_waterlane',a[0],a[1])<-.005,'oar shoreline '+t);}
 }
});
// Intersect the actual clipped static mesh triangles, not the analytic height
// field: the latter differs from the triangulated terrain on curved surfaces.
function verticalHits(forms,x,y){const hits=[];for(const f of forms)for(let i=1;i<f.points.length-1;i++){
 const [a,b,c]=[f.points[0],f.points[i],f.points[i+1]],d=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(d)<1e-12)continue;
 const u=((x-a[0])*(c[1]-a[1])-(y-a[1])*(c[0]-a[0]))/d,v=((b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]))/d;
 if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)hits.push(a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]));
 }return hits;}
test('actual static-mesh vertical intersections prove building foundations meet terrain while retaining platform tops',()=>{
 const cases=[['eastern_waterlane',-.72,.65,.92,.68,.18,'#78857c',['#8f9c8a','#b9bea3']],['eastern_waterlane',.70,.72,.94,.69,.18,'#78857c',['#8f9c8a','#b9bea3']],['eastern_zentemple',-.10,.58,1.48,.76,.28,'#879ca3',['#b4cbd8','#ecf0e7']],['eastern_seacliff',.68,.43,.80,.72,.69,'#c9ba95',['#aeb28f','#e2d1a6']]];
 const evidence=[];for(const [id,x,y,w,d,top,color,terrain]of cases){const mesh=art.model(id,0,true).flat(),ground=mesh.filter(f=>terrain.includes(f.color)),base=mesh.filter(f=>[.61,1.08,.96,.76,.70,.91].some(k=>{const n=parseInt(color.slice(1),16),shade="#"+[n>>16,n>>8&255,n&255].map(v=>Math.round(Math.min(255,v*k)).toString(16).padStart(2,"0")).join("");return f.color===shade;}));
  for(const dx of [-.31,0,.31])for(const dy of [-.31,0,.31]){
   const px=x+dx*w,py=y+dy*d,g=verticalHits(ground,px,py),b=verticalHits(base,px,py);assert.ok(g.length&&b.length,id+' actual terrain/foundation ray intersections');
   const groundTop=Math.max(...g),bottom=Math.min(...b),baseTop=Math.max(...b);evidence.push({id,x:px,y:py,groundTop,bottom,gap:bottom-groundTop});assert.ok(Math.abs(baseTop-top)<1e-8,id+' approved platform top unchanged');assert.ok(groundTop<=baseTop+1e-8,id+' terrain must not bury the platform');
  }
 }
 console.log('EASTERN_FOUNDATION_RAYS '+JSON.stringify(evidence.filter(x=>cases.some(c=>c[0]===x.id&&Math.abs(c[1]-x.x)<1e-8&&Math.abs(c[2]-x.y)<1e-8))));
 for(const p of evidence)assert.ok(p.gap<=1e-8,`${p.id} foundation gap ${p.gap} at ${p.x},${p.y}`);
});
