// Closed triangle SAT, including coplanar edges. Tests use actual clipped model
// surfaces, not authored support heights, actor centers, or screen overlap.
const sub=(a,b)=>a.map((n,k)=>n-b[k]),dot=(a,b)=>a.reduce((s,n,k)=>s+n*b[k],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function triangles(forms){const out=[];for(const f of forms)for(let i=1;i<f.points.length-1;i++){
 const p=[f.points[0],f.points[i],f.points[i+1]],edges=p.map((q,j)=>sub(p[(j+1)%3],q)),normal=cross(edges[0],edges[1]);if(Math.hypot(...normal)<1e-12)continue;
 out.push({p,edges,normal,color:f.color,lo:[0,1,2].map(k=>Math.min(...p.map(q=>q[k]))),hi:[0,1,2].map(k=>Math.max(...p.map(q=>q[k])))});
}return out;}
function intersects(a,b,eps=1e-8){
 if([0,1,2].some(k=>a.hi[k]<b.lo[k]-eps||b.hi[k]<a.lo[k]-eps))return false;
 const axes=[a.normal,b.normal,...a.edges.flatMap(e=>b.edges.map(f=>cross(e,f))),...a.edges.map(e=>cross(a.normal,e)),...b.edges.map(e=>cross(b.normal,e))];
 for(const axis of axes){const len=Math.hypot(...axis);if(len<1e-12)continue;const d=axis.map(n=>n/len),x=a.p.map(p=>dot(p,d)),y=b.p.map(p=>dot(p,d));if(Math.max(...x)<Math.min(...y)-eps||Math.max(...y)<Math.min(...x)-eps)return false;}
 return true;
}
function firstIntersection(a,b){for(const x of a)for(const y of b)if(intersects(x,y))return {a:x,b:y};return null;}
module.exports={triangles,intersects,firstIntersection};
