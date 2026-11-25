const {load,eastern}=require('./load.cjs');
const dot=(a,b)=>a.reduce((s,n,k)=>s+n*b[k],0),sub=(a,b)=>a.map((n,k)=>n-b[k]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function blocked(eye,p,forms){const d=sub(p,eye);for(const f of forms)for(let i=1;i<f.points.length-1;i++){
 const [a,b,c]=[f.points[0],f.points[i],f.points[i+1]],e1=sub(b,a),e2=sub(c,a),h=cross(d,e2),det=dot(e1,h);if(Math.abs(det)<1e-9)continue;const s=sub(eye,a),u=dot(s,h)/det;if(u<0||u>1)continue;const q=cross(s,e1),v=dot(d,q)/det;if(v<0||u+v>1)continue;const t=dot(e2,q)/det;if(t>0&&t<.999)return true;
 }return false;}
function setup(w=856,h=626){const ctx=eastern(load()),art=ctx.CubeHabitats,gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(o,k)=>k in o?o[k]:()=>({})}),getCamera=ctx.HabitatRenderer(gl,art,{}).getCamera,cubies=ctx.CubeState.create(),atlas=art.suites.eastern.atlasOf;
 function view(face,low){const [a,e,la,le,x,y]=art.suites.eastern.angles[face],frame=ctx.CubeState.faces[face],v=ctx.HabitatFraming.fit(ctx.GroundCamera.habitat(face,low?la:a,low?le:e,low?1.30:1.21,low?1.78:1.43,low?x:0,low?y:0),ctx.HabitatFraming.points(art,atlas,cubies,low?face:null),w,h,getCamera),cam=getCamera(v,w,h),axes=ctx.GroundCamera.axes(v),camera=v.slice(4,7).map((n,k)=>n+13*axes.eye[k]);return {v,cam,eye:[dot(camera,frame.right),dot(camera,frame.up),dot(camera,frame.normal)-1.491],project:p=>cam.project(frame.right.map((n,k)=>n*p[0]+frame.up[k]*p[1]+frame.normal[k]*(1.491+p[2])))};}
 return {ctx,art,view};
}
function projectedVisible(forms,fixed,view){let area=0,visible=0;for(const f of forms)for(let i=1;i<f.points.length-1;i++){const ps=[f.points[0],f.points[i],f.points[i+1]],p=ps.map(view.project),weight=Math.abs((p[1][0]-p[0][0])*(p[2][1]-p[0][1])-(p[1][1]-p[0][1])*(p[2][0]-p[0][0]))/2;area+=weight;const center=[0,1,2].map(k=>ps.reduce((s,p)=>s+p[k],0)/3);if(!blocked(view.eye,center,fixed))visible+=weight;}return {area,ratio:visible/area};}
function luminance(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
module.exports={setup,blocked,projectedVisible,contrast};
