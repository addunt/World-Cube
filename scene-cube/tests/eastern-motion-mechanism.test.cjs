const {test}=require('node:test'),assert=require('node:assert/strict');
const {load,eastern}=require('../test-support/load.cjs');
const {triangles,intersects,firstIntersection}=require('../test-support/mesh-intersection.cjs');
test('triangle intersection distinguishes real crossing, coplanar overlap, separation and perspective overlap',()=>{
 const tri=p=>triangles([{points:p,color:'#ffffff'}])[0],a=tri([[0,0,0],[1,0,0],[0,1,0]]);
 assert.ok(intersects(a,tri([[.2,.2,-1],[.2,.2,1],[.5,.2,0]])));
 assert.ok(intersects(a,tri([[.1,.1,0],[.2,.1,0],[.1,.2,0]])));
 assert.ok(!intersects(a,tri([[.8,.8,0],[1,.8,0],[.8,1,0]])));
 assert.ok(!intersects(a,tri([[0,0,.1],[1,0,.1],[0,1,.1]])),'same projected footprint on another depth plane is not a collision');
});
test('actual river net frame clears fisherman body throughout the sampled 9.6s path',()=>{
 const {CubeHabitats:art}=eastern(load());let probes=0;
 for(let i=0;i<=192;i++){
  const t=i*.05,forms=art.model('eastern_li_river',t,false).flat(),net=triangles(forms.filter(f=>f.color==='#e2cb88')),body=triangles(forms.filter(f=>f.color==='#214b65'));
  assert.ok(net.length&&body.length);const hit=firstIntersection(net,body);assert.equal(hit,null,'actual net/body triangles intersect at t='+t+' (not a screen-space guess)');probes++;
 }
 console.log('RIVER_NET_BODY_TRIANGLE_PROBES '+probes);
});
test('actual raft, oar and net geometry do not intersect actual river static land, peaks, rocks or bamboo at sampled phases',()=>{
 const {CubeHabitats:art}=eastern(load()),obstacles=triangles(art.model('eastern_li_river',0,true).flat().filter(f=>f.alpha>=.995));let probes=0;
 for(let i=0;i<=192;i++){const t=i*.05,moving=triangles(art.model('eastern_li_river',t,false).flat());const hit=firstIntersection(moving,obstacles);assert.equal(hit,null,'actual living/static surface collision at t='+t);probes++;}
 console.log('RIVER_STATIC_TRIANGLE_PROBES '+JSON.stringify({probes,obstacleTriangles:obstacles.length}));
});
test('river actors remain spatially separate from other five faces, including the timber tea pavilion seen behind their projection',()=>{
 const ctx=eastern(load()),art=ctx.CubeHabitats,atlas=art.suites.eastern.atlasOf;
 const world=(face,forms)=>{const f=ctx.CubeState.faces[face];return forms.flatMap(p=>p.points).map(p=>f.right.map((n,k)=>n*p[0]+f.up[k]*p[1]+f.normal[k]*(1.491+p[2])));};
 const box=points=>({lo:[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),hi:[0,1,2].map(k=>Math.max(...points.map(p=>p[k])))}),others=Object.entries(atlas).filter(([face])=>face!=='NX').map(([face,id])=>({face,id,...box(world(face,art.model(id,0,true).flat()))})),gaps={};
 for(let i=0;i<=192;i++){const a=box(world('NX',art.model('eastern_li_river',i*.05,false).flat()));for(const b of others){const separation=Math.max(...[0,1,2].map(k=>Math.max(a.lo[k]-b.hi[k],b.lo[k]-a.hi[k])));assert.ok(separation>0,'world-space AABBs must be disjoint, not merely look separate: '+b.id);gaps[b.id]=Math.min(gaps[b.id]??Infinity,separation);}}
 console.log('RIVER_NEIGHBOR_AABB_GAPS '+JSON.stringify(gaps));
});
// A GL boundary spy: runs the UNMODIFIED real renderer and mesh packer. It does
// not rasterize pixels or stand in for actual browser/video quality acceptance.
function tracedGL(){let serial=0,bound=null,pass=null,tag=null;const uploads=[],draws=[],buffers=new Map();const methods={
 getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_,k)=>k,
 createBuffer:()=>({id:++serial}),bindBuffer:(_,v)=>{bound=v;},
 bufferData:(_,data,usage)=>{const entry={tag:tag&&{...tag},buffer:bound,usage,data:new Float32Array(data)};buffers.set(bound,entry);uploads.push(entry);},
 uniform1f:(k,v)=>{if(k==='pass')pass=v;},drawArrays:(_,start,count)=>draws.push({pass,start,count,entry:buffers.get(bound)})
 };return {gl:new Proxy(methods,{get:(o,k)=>k in o?o[k]:/^[A-Z_]+$/.test(k)?k:()=>({})}),uploads,draws,tag:v=>{tag=v;}};
}
test('real renderer reuploads changing bell/tea/net opaque meshes, draws those ranges, and reuses only identical-time living/static caches',()=>{
 const ctx=eastern(load({GroundSurfaces:{get:()=>({})}})),art=ctx.CubeHabitats,trace=tracedGL(),requests=[];
 const instrumented={...art,model(id,t,fixed){trace.tag({id,t,fixed});requests.push({id,t,fixed});return art.model(id,t,fixed);}},renderer=ctx.HabitatRenderer(trace.gl,instrumented,art.suites.eastern.atlasOf),canvas={clientWidth:871,clientHeight:635,width:1097,height:800},cubies=ctx.CubeState.create();
 const colors={eastern_zentemple:['#ba9458','#e0bf78'],eastern_tea_trail:['#e3f3a0','#cae982'],eastern_li_river:['#e2cb88','#d1bb7c']},snapshots={};
 const selected=(data,inks)=>{const out=[];for(let i=0;i<data.length;i+=7)if(inks.some(hex=>[1,3,5].every((k,j)=>Math.abs(data[i+3+j]-parseInt(hex.slice(k,k+2),16)/255)<1e-6)))out.push(...data.slice(i,i+3));return out;};
 for(const t of [0,.8,2.4]){
  const start=trace.draws.length;renderer.paint(cubies,null,0,[40,30,1,0,0,0,0],t,canvas,1.26);
  for(const [id,inks]of Object.entries(colors)){
   const entry=trace.uploads.findLast(e=>e.tag?.id===id&&e.tag.fixed===false&&e.tag.t===t);assert.ok(entry);const points=selected(entry.data,inks);assert.ok(points.length>9,id+' colored geometry really reaches bufferData');
   assert.ok(trace.draws.slice(start).some(d=>d.pass===0&&d.entry===entry&&selected(d.entry.data.subarray(d.start*7,(d.start+d.count)*7),inks).length>0),id+' actual opaque draw ranges include actor, not only shadows or unused buffer');
   if(snapshots[id])assert.notDeepEqual(points,snapshots[id],id+' GPU-uploaded actor positions must not stay stale');snapshots[id]=points;
  }
  const count=trace.uploads.length;renderer.paint(cubies,null,0,[40,30,1,0,0,0,0],t,canvas,1.26);assert.equal(trace.uploads.length,count,'unchanged time reuses model buffers');
 }
 for(const id of Object.keys(colors)){assert.equal(requests.filter(r=>r.id===id&&r.fixed).length,1);assert.equal(requests.filter(r=>r.id===id&&!r.fixed).length,3);}
});
