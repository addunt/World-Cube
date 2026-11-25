const {load,fantasy}=require('./load.cjs');
const dot=(a,b)=>a.reduce((s,n,k)=>s+n*b[k],0);
function setup(width=856,height=626){const ctx=fantasy(load()),art=ctx.CubeHabitats,atlas=art.suites.fantasy.atlasOf,gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(o,k)=>k in o?o[k]:()=>({})}),getCamera=ctx.HabitatRenderer(gl,art,{}).getCamera;
 function view(face,close=false,cubies=ctx.CubeState.create()){const [a,h,la,lh,x,y]=art.suites.fantasy.angles[face],frame=ctx.CubeState.faces[face],base=ctx.GroundCamera.habitat(face,close?la:a,close?lh:h,close?1.30:1.21,close?1.78:1.43,close?x:0,close?y:0),points=ctx.HabitatFraming.points(art,atlas,cubies,close?face:null),v=ctx.HabitatFraming.fit(base,points,width,height,getCamera),camera=getCamera(v,width,height),axes=ctx.GroundCamera.axes(v),eye=v.slice(4,7).map((n,k)=>n+13*axes.eye[k]);return {v,camera,points,eye:[dot(eye,frame.right),dot(eye,frame.up),dot(eye,frame.normal)-1.491],project:p=>camera.project(frame.right.map((n,k)=>n*p[0]+frame.up[k]*p[1]+frame.normal[k]*(1.491+p[2])))};}
 return {ctx,art,atlas,view,getCamera};
}
module.exports={setup};
