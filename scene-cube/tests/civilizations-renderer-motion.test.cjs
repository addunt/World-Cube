const {test}=require('node:test'),assert=require('node:assert/strict');
const {ready,ids,groups}=require('../test-support/civilizations.cjs');
function tracedGL(){let serial=0,bound=null,pass=null,tag=null;const uploads=[],draws=[],buffers=new Map();const methods={
 getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_,k)=>k,
 createBuffer:()=>({id:++serial}),bindBuffer:(_,v)=>{bound=v;},
 bufferData:(_,data,usage)=>{const entry={tag:tag&&{...tag},buffer:bound,usage,data:new Float32Array(data)};buffers.set(bound,entry);uploads.push(entry);},
 uniform1f:(k,v)=>{if(k==='pass')pass=v;},drawArrays:(_,start,count)=>draws.push({pass,start,count,entry:buffers.get(bound)})
 };return {gl:new Proxy(methods,{get:(o,k)=>k in o?o[k]:/^[A-Z_]+$/.test(k)?k:()=>({})}),uploads,draws,tag:v=>{tag=v;}};
}

// GL boundary tracing is not rasterization or human/video acceptance.
test('actual renderer uploads and draws all twelve changing civilizations masks, with no cross-id or same-time cache freeze',()=>{const c=ready({GroundSurfaces:{get:()=>({})}}),a=c.CubeHabitats,trace=tracedGL(),requests=[],art={...a,model(id,t,fixed){trace.tag({id,t,fixed});requests.push({id,t,fixed});return a.model(id,t,fixed);}},renderer=c.HabitatRenderer(trace.gl,art,a.suites.civilizations.atlasOf),canvas={clientWidth:871,clientHeight:682,width:1022,height:800},cubies=c.CubeState.create(),targets=Object.fromEntries(ids.flatMap(id=>groups[id].map((colors,i)=>[id+'_'+i,[id,colors]]))),snapshots=Object.fromEntries(Object.keys(targets).map(k=>[k,new Set()]));
function selected(data,colors){const ps=[];for(let i=0;i<data.length;i+=7)if(colors.some(h=>[1,3,5].every((k,j)=>Math.abs(data[i+3+j]-parseInt(h.slice(k,k+2),16)/255)<1e-6)))ps.push(...data.slice(i,i+3));return ps;}
for(const t of [0,.4,.8,1.2,1.6,2,2.4,2.8,3.2,3.6,4]){const start=trace.draws.length;renderer.paint(cubies,null,0,[40,30,1,0,0,0,0],t,canvas,1.173);for(const [key,[id,colors]]of Object.entries(targets)){const entry=trace.uploads.findLast(e=>e.tag?.id===id&&!e.tag.fixed&&e.tag.t===t);assert.ok(entry);const ps=selected(entry.data,colors);snapshots[key].add(JSON.stringify(ps));if(ps.length)assert.ok(trace.draws.slice(start).some(d=>d.pass===0&&d.entry===entry&&selected(d.entry.data.subarray(d.start*7,(d.start+d.count)*7),colors).length>0),key+' reaches an actual geometry draw, not only shadow or unused upload');else assert.fail(key+' mechanical actor disappeared');}const n=trace.uploads.length;renderer.paint(cubies,null,0,[40,30,1,0,0,0,0],t,canvas,1.173);assert.equal(trace.uploads.length,n);}
for(const [key,values]of Object.entries(snapshots))assert.ok(values.size>=3,key+' changing actual uploaded/drawn points');for(const id of new Set(Object.values(targets).map(a=>a[0])))assert.equal(requests.filter(r=>r.id===id&&r.fixed).length,1);console.log('REAL_RENDERER_DISTINCT_UPLOADS '+JSON.stringify(Object.fromEntries(Object.entries(snapshots).map(([k,v])=>[k,v.size]))));});
