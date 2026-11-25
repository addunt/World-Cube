const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup:fantasy}=require('../test-support/fantasy.cjs');
const {setup:eastern,blocked}=require('../test-support/visibility.cjs');
const {triangles,firstIntersection}=require('../test-support/mesh-intersection.cjs');
const bodyColors=new Set(['#b9f0dd','#f5dfaa']),waveColor='#d6e8df';
const strips=q=>q.length===6?[[q[0],q[1],q[4],q[5]],[q[1],q[2],q[3],q[4]]]:[q];
const distance=(a,b)=>Math.hypot(...a.map((n,k)=>n-b[k]));
const area=f=>{let s=0;for(let i=1;i<f.points.length-1;i++){const a=f.points[i].map((n,k)=>n-f.points[0][k]),b=f.points[i+1].map((n,k)=>n-f.points[0][k]);s+=Math.hypot(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])/2;}return s;};
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function hull(points){const ps=[...new Map(points.map(p=>[p.slice(0,2).join(','),p.slice(0,2)])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const half=a=>{const out=[];for(const p of a){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=1e-12)out.pop();out.push(p);}return out;};return [...half(ps).slice(0,-1),...half(ps.slice().reverse()).slice(0,-1)];}
function segment(p,a,b){const d=b.map((n,k)=>n-a[k]),u=Math.max(0,Math.min(1,p.reduce((s,n,k)=>s+(n-a[k])*d[k],0)/d.reduce((s,n)=>s+n*n,0)));return distance(p,a.map((n,k)=>n+u*d[k]));}
function gap(a,b){const inside=(p,h)=>h.every((v,i)=>cross(v,h[(i+1)%h.length],p)>=-1e-10);if(a.some(p=>inside(p,b))||b.some(p=>inside(p,a)))return 0;let n=Infinity;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){const p=a[i],q=a[(i+1)%a.length],r=b[j],s=b[(j+1)%b.length];if(cross(p,q,r)*cross(p,q,s)<0&&cross(r,s,p)*cross(r,s,q)<0)return 0;n=Math.min(n,segment(p,r,s),segment(q,r,s),segment(r,p,q),segment(s,p,q));}return n;}

test('phone normal pendant BODY alone stays >=12CSSpx with >=1.5px margin at every sampled phase',()=>{
 const s=fantasy(357,429),view=s.view('NZ'),report={minLong:Infinity,minShort:Infinity,maxLong:0,phases:241,css:[356.8125,429]},tip=[];
 for(let i=0;i<=240;i++){const t=i*3/240,forms=s.art.model('fantasy_starspring',t,false).flat().filter(f=>bodyColors.has(f.color));assert.ok(forms.length>=8);const ps=forms.flatMap(f=>f.points).map(view.project).map(p=>[p[0]*356.8125/357,p[1]]),axes=[0,1].map(k=>Math.max(...ps.map(p=>p[k]))-Math.min(...ps.map(p=>p[k])));report.minLong=Math.min(report.minLong,Math.max(...axes));report.minShort=Math.min(report.minShort,Math.min(...axes));report.maxLong=Math.max(report.maxLong,...axes);tip.push(view.project(s.ctx.GroundFantasyWorld.motion('fantasy_starspring',t).features[1]));}
 // Bound unsampled times as well: rigid-body speed r*max|angle'| and the
 // actual renderer column's perspective denominator bound both bbox axes.
 const motion=s.ctx.GroundFantasyWorld.motion('fantasy_starspring',0),pivot=motion.pendant.pivot,body=s.art.model('fantasy_starspring',0,false).flat().filter(f=>bodyColors.has(f.color)),radius=Math.max(...body.flatMap(f=>f.points).map(p=>distance(p,pivot))),frame=s.ctx.CubeState.faces.NZ,worldPivot=frame.right.map((n,k)=>n*pivot[0]+frame.up[k]*pivot[1]+frame.normal[k]*(1.491+pivot[2])),camera=view.camera,relative=worldPivot.map((n,k)=>n-view.v[k+4]),dot=(a,b)=>a.reduce((n,v,k)=>n+v*b[k],0),inverseLens=Math.abs(camera.column(camera.eye,false)[3]),qMin=camera.column(worldPivot,true)[3]-radius*inverseLens,scale=Math.abs(camera.column(camera.right,false)[0]*357/2),speed=radius*(Math.PI/6)*(2*Math.PI/3);
 assert.ok(qMin>0);const maxAxisSpeed=Math.max(...[camera.right,camera.up].map((axis,k)=>scale*speed*(1/qMin+(Math.abs(dot(relative,axis))+radius)*inverseLens/(qMin*qMin))*(k===0?356.8125/357:1)));
 report.betweenSamplesBoundCSS=maxAxisSpeed*3/240;report.guaranteedMinLong=report.minLong-report.betweenSamplesBoundCSS;report.guaranteedMinShort=report.minShort-report.betweenSamplesBoundCSS;
 report.tipTravel=Math.max(...tip.flatMap(p=>tip.map(q=>distance(p.slice(0,2),q.slice(0,2)))));console.log('PENDANT_REAL_BODY '+JSON.stringify(report));assert.ok(report.minLong>=13.5,JSON.stringify(report));assert.ok(report.guaranteedMinLong>=12);assert.ok(report.guaranteedMinShort>=3);assert.ok(report.tipTravel>=8);
});

test('pendant enlarged body retains real support, height, visible projection and true mesh feature through its 3s cycle',()=>{
 const s=fantasy(357,429),view=s.view('NZ'),fixed=s.art.model('fantasy_starspring',0,true).flat(),w=s.ctx.GroundFantasyWorld,fixedTriangles=triangles(fixed);let minZ=Infinity,minVisible=1;
 for(let i=0;i<=60;i++){const t=i*.05,m=w.motion('fantasy_starspring',t),body=s.art.model('fantasy_starspring',t,false).flat().filter(f=>bodyColors.has(f.color)),ps=body.flatMap(f=>f.points);assert.ok(fixed.some(f=>f.points.some(p=>distance(p,m.pendant.pivot)<.05)),'support reaches actual pivot');assert.ok(ps.some(p=>distance(p,m.features[1])<1e-8),'tracked tip belongs to stone, not cord');assert.ok(ps.every(p=>p[2]>=.45&&p[2]<=1.2));assert.equal(firstIntersection(triangles(body),fixedTriangles),null,'actual body triangles must clear the fork/terrain');minZ=Math.min(minZ,...ps.map(p=>p[2]));const visible=ps.filter(p=>!blocked(view.eye,p,fixed)).length/ps.length;minVisible=Math.min(minVisible,visible);assert.ok(visible>=.9,'static support must not cover enlarged body');assert.ok(distance(w.motion('fantasy_starspring',t+3).features[1],m.features[1])<1e-9);assert.ok(Math.abs(m.pendant.angle)<=Math.PI/6+1e-12);}
 console.log('PENDANT_SUPPORT '+JSON.stringify({minZ,minFiniteVertexVisibility:minVisible}));
});

test('three actual emitted seacliff strips have .06–.08 world-width and .65 length, not a declaration-only thickness',()=>{
 const s=eastern(),id='eastern_seacliff',w=s.ctx.GroundEasternWorld;let minWidth=Infinity,maxWidth=0,minSurfaceWidth=Infinity,maxSurfaceWidth=0;
 for(let i=0;i<=120;i++){const t=i*.08,quads=w.motion(id,t).waves,forms=s.art.model(id,t,false).flat().filter(f=>f.color===waveColor),points=forms.flatMap(f=>f.points);assert.equal(quads.length,3);let expectedArea=0;
  for(const ridge of quads){assert.ok(Math.abs(Math.max(...ridge.map(p=>p[0]))-Math.min(...ridge.map(p=>p[0]))-.65)<1e-9);for(const q of strips(ridge)){const long=q[1].map((n,k)=>n-q[0][k]),side=q[3].map((n,k)=>n-q[0][k]),length=Math.hypot(long[0],long[1]),width=Math.abs(long[0]*side[1]-long[1]*side[0])/length;const surfaceWidth=Math.sqrt(side.reduce((n,v)=>n+v*v,0)-Math.pow(side.reduce((n,v,k)=>n+v*long[k],0)/distance(q[0],q[1]),2));minSurfaceWidth=Math.min(minSurfaceWidth,surfaceWidth);maxSurfaceWidth=Math.max(maxSurfaceWidth,surfaceWidth);minWidth=Math.min(minWidth,width);maxWidth=Math.max(maxWidth,width);assert.ok(Math.abs(q[1][0]-q[0][0]-(ridge.length===6?.325:.65))<1e-9);for(const p of q)assert.ok(points.some(a=>distance(p,a)<1e-8),'actual renderer mesh retains strip corner');expectedArea+=area({points:q});}}
  assert.ok(Math.abs(forms.reduce((n,f)=>n+area(f),0)-expectedArea)<1e-8,'partition preserves actual strip surface');
 }
 console.log('WAVE_REAL_WIDTH '+JSON.stringify({minWidth,maxWidth,minSurfaceWidth,maxSurfaceWidth,phases:121}));assert.ok(minWidth>=.06-1e-9&&maxWidth<=.08+1e-9);assert.ok(minSurfaceWidth>=.06-1e-9&&maxSurfaceWidth<=.08+1e-9);
});

test('full 9.6s seacliff meshes keep shoreline/boundaries and >=.06 dark-water boat clearance',()=>{
 const s=eastern(),id='eastern_seacliff',w=s.ctx.GroundEasternWorld;let minGap=Infinity,minShore=Infinity,minBoundary=Infinity;
 for(let i=0;i<=480;i++){const t=i*.02,m=w.motion(id,t),boat=hull(s.art.model(id,t,false).flat().filter(f=>['#ae7950','#725944','#936b47'].includes(f.color)).flatMap(f=>f.points));assert.ok(boat.length>=6);
  for(const q of m.waves){minGap=Math.min(minGap,gap(hull(q),boat));for(let j=0;j<q.length;j++)for(let k=0;k<=16;k++){const p=q[j].map((n,d)=>n+(q[(j+1)%q.length][d]-n)*k/16);minShore=Math.min(minShore,-w.surface(id,p[0],p[1]));minBoundary=Math.min(minBoundary,1.5-Math.abs(p[0]),1.5-Math.abs(p[1]));}}
 }
 const report={minGap,minShore,minBoundary,phases:481};console.log('WAVE_MESH_CLEARANCE '+JSON.stringify(report));assert.ok(minGap>=.06,JSON.stringify(report));assert.ok(minShore>=.06,JSON.stringify(report));assert.ok(minBoundary>=0);
});

test('wave centers retain original .44 travel, 4.8s period and .03–.08 crest heights after widening',()=>{
 const s=eastern(),w=s.ctx.GroundEasternWorld,id='eastern_seacliff',centers=[[],[],[]];let minZ=Infinity,maxZ=-Infinity;
 for(let i=0;i<=480;i++){const t=i*.01,m=w.motion(id,t);for(let j=0;j<3;j++){const q=m.waves[j],anchor=q.length===6?[q[1],q[4]]:q,center=anchor.reduce((a,p)=>a.map((n,k)=>n+p[k]/anchor.length),[0,0,0]);centers[j].push(center);assert.ok(Math.abs(center[1]-(-1.38+j*.14-.0175))<1e-9);const crest=q.slice(q.length/2);minZ=Math.min(minZ,...crest.map(p=>p[2]));maxZ=Math.max(maxZ,...crest.map(p=>p[2]));const after=w.motion(id,t+4.8).waves[j];for(let k=0;k<q.length;k++)assert.ok(distance(q[k],after[k])<1e-9);}}
 for(const cs of centers)assert.ok(Math.abs(Math.max(...cs.map(p=>p[0]))-Math.min(...cs.map(p=>p[0]))-.44)<.0001);assert.ok(Math.abs(minZ-.03)<.00001&&Math.abs(maxZ-.08)<.00001);
});

test('affected actual static/living models remain deterministic under reverse seeking, without changing static time independence',()=>{
 for(const [s,id] of [[fantasy(),'fantasy_starspring'],[eastern(),'eastern_seacliff']]){const ts=[0,.37,1.5,2.4,4.8,9.6,19.2],models=ts.map(t=>JSON.stringify(s.art.model(id,t,false))),fixed=JSON.stringify(s.art.model(id,0,true));for(let i=ts.length-1;i>=0;i--){assert.equal(JSON.stringify(s.art.model(id,ts[i],false)),models[i]);assert.equal(JSON.stringify(s.art.model(id,ts[i],true)),fixed);}}
});
