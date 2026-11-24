"use strict";

// Camera composition only. Renderer projection, cubie attachments and the
// original suite remain untouched. Bounds include the shell and all habitats,
// not just the selected face. IMPORTANT: this is a finite sampled envelope
// (10 living poses + .05 height margin), not an analytic bound for every time.
// Tests check selected times/states; browser review is still required.
((root)=>{
  const envelopes=new WeakMap();
  function envelope(art,id){
    if(!envelopes.has(art))envelopes.set(art,new Map());
    const cache=envelopes.get(art);if(cache.has(id))return cache.get(id);
    const boxes=Array.from({length:9},()=>({lo:[Infinity,Infinity,Infinity],hi:[-Infinity,-Infinity,-Infinity]}));
    const include=tiles=>tiles.forEach((forms,i)=>{for(const form of forms)for(const p of form.points)for(let k=0;k<3;k++){
      boxes[i].lo[k]=Math.min(boxes[i].lo[k],p[k]);boxes[i].hi[k]=Math.max(boxes[i].hi[k],p[k]);
    }});
    include(art.model(id,0,true));
    // Whole absolute phases, including a full windmill revolution and camel /
    // frog cycles. Per-cell bounds reserve extra headroom between samples.
    for(const t of [0,.36,1.2,2.81,5,7,9,11,14,19.2])include(art.model(id,t,false));
    const result=boxes.map((box,i)=>{
      if(!Number.isFinite(box.hi[2]))return [];
      const x=i%3-1,y=1-Math.floor(i/3),points=[];
      for(const u of [x-.5,x+.5])for(const v of [y-.5,y+.5])for(const z of [0,Math.min(1.445,box.hi[2]+.05)])points.push([u,v,z]);
      return points;
    });
    cache.set(id,result);return result;
  }
  function points(art,atlas,cubies){
    const result=[];
    for(const x of [-1.491,1.491])for(const y of [-1.491,1.491])for(const z of [-1.491,1.491])result.push([x,y,z]);
    for(const cubie of cubies)for(const sticker of cubie.stickers){
      const frame=root.CubeState.groundFrame(cubie,sticker.face);
      for(const [u,v,z]of envelope(art,atlas[sticker.face])[sticker.row*3+sticker.col]){
        const x=u-(sticker.col-1),y=v-(1-sticker.row);
        result.push(frame.origin.map((n,k)=>n+frame.right[k]*x+frame.forward[k]*y+frame.normal[k]*(.491+z)));
      }
    }
    return result;
  }
  function fit(view,points,width,height,getCamera){
    if(!points.length||width<=0||height<=0)return view.slice();
    const result=view.slice(),{right,up}=root.GroundCamera.axes(view),unitScale=Math.min(width,height)*.166;
    result[2]=1;
    const bounds=()=>{
      const camera=getCamera(result,width,height),box=[Infinity,Infinity,-Infinity,-Infinity];
      for(const p of points){const [x,y]=camera.project(p);box[0]=Math.min(box[0],x);box[1]=Math.min(box[1],y);box[2]=Math.max(box[2],x);box[3]=Math.max(box[3],y);}
      return box;
    };
    // Move focus in the camera plane only. Eye depth and horizon are preserved.
    // Iterate because perspective division makes a naive world AABB midpoint
    // differ from the actual projected midpoint used by the renderer.
    for(let i=0;i<6;i++){
      const [l,t,r,b]=bounds(),dx=((l+r)/2-width/2)/unitScale,dy=((t+b)/2-height/2)/unitScale;
      for(let k=0;k<3;k++)result[k+4]+=right[k]*dx-up[k]*dy;
    }
    const [l,t,r,b]=bounds(),padding=Math.max(28,Math.min(width,height)*.05);
    result[2]=Math.min(view[2],.985*(width-2*padding)/(r-l),.985*(height-2*padding)/(b-t));
    return result;
  }
  root.HabitatFraming=Object.freeze({points,fit});
})(globalThis);
