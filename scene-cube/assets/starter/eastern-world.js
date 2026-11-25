"use strict";
// Shared whole-face support, kinematics and conservative envelopes. No model
// generation, clock or mutable simulation is used to answer a bounds query.
((root)=>{
 const tau=2*Math.PI,sin=Math.sin,cos=Math.cos,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const phase=(t,p)=>{const q=t/p-Math.floor(t/p);return q<1e-10||q>1-1e-10?0:q;},angle=(t,p)=>tau*phase(t,p);
 const smooth=(a,b,x)=>{const q=clamp((x-a)/(b-a));return q*q*(3-2*q);};
 const canal=x=>.32*sin(1.6*x)-.45,coast=y=>-.25+.13*sin(2*y);
 const terrace=(x,y)=>(y+.98+.09*sin(2*x))/.32;
 const tea=(x,y)=>.06+.14*(1+sin(1.3*x+.7*y))+.16*smooth(.15,1.1,y);
 function surface(id,x,y){switch(id){
  case 'eastern_waterlane':return Math.abs(y-canal(x))-.30;
  case 'eastern_terraces':{const u=terrace(x,y);return u<0||u>=6?1:.32*(Math.abs(u-Math.floor(u)-.10)-.075);}
  case 'eastern_zentemple':case 'eastern_tea_trail':return 1;
  case 'eastern_li_river':return Math.max(Math.abs(x)-(.68+.08*sin(2*y)),
   ...[[-.93,.70,.43,.48],[.84,.85,.58,.42],[.15,1.15,.26,.25]].map(([a,b,rx,ry])=>.2*(1-Math.hypot((x-a)/rx,(y-b)/ry))));
  case 'eastern_seacliff':return x-coast(y);
  default:throw Error('Unknown eastern surface '+id);
 }}
 function height(id,x,y){switch(id){
  case 'eastern_terraces':return .03+.14*clamp(Math.floor(terrace(x,y)),0,5);
  case 'eastern_zentemple':return .02+.10*smooth(-.10,.95,y);
  case 'eastern_tea_trail':return tea(x,y)+(Math.abs(Math.hypot(x/1.05,(y+.12)/.75)-1)*.8<.15?.015:0);
  case 'eastern_seacliff':return surface(id,x,y)>=0?.46+.12*smooth(0,1.1,y):.012;
  default:return surface(id,x,y)>=0?.025:.012;
 }}
 const at=(pose,p)=>[pose.p[0]+p[0]*cos(pose.angle)-p[1]*sin(pose.angle),pose.p[1]+p[0]*sin(pose.angle)+p[1]*cos(pose.angle),pose.p[2]+p[2]];
 function cloth(x,y,z,length,width,amplitude,t,period){
  return Array.from({length:4},(_,i)=>{
   const q=i/3,a=angle(t,period),fold=a+(1-q)*Math.PI;
   const dx=amplitude*q**1.25*sin(fold),dy=.025*q*cos(a+q),twist=q*(26*Math.PI/180)*sin(fold);
   const ux=width/2*cos(twist),uy=width/2*sin(twist);
   return [[x+dx-ux,y+dy-uy,z-length*q],[x+dx+ux,y+dy+uy,z-length*q]];
  });
 }
 function boat(id,t){const q=angle(t,9.6);let x,y,dx,dy;
  if(id==='eastern_waterlane'){x=.80*cos(q);y=canal(x)+.035*sin(q);dx=-.80*sin(q);dy=.512*cos(1.6*x)*dx+.035*cos(q);}
  else if(id==='eastern_li_river'){x=.10*sin(q);y=-.35+.45*cos(q);dx=.10*cos(q);dy=-.45*sin(q);}
  else{x=-1.02+.10*sin(q);y=-.15+.67*cos(q);dx=.10*cos(q);dy=-.67*sin(q);}
  const pose={p:[x,y,.025],angle:Math.atan2(dy,dx),oar:(id==='eastern_li_river'?32*Math.PI/180:.61)*sin(angle(t,3.2))};
  if(id==='eastern_li_river'){
   pose.oarRoot=[-.15,.06,.17];const endZ=height(id,x,y)-pose.p[2],span=Math.sqrt(.48**2-(pose.oarRoot[2]-endZ)**2);
   pose.oarTip=[-.15+span*cos(pose.oar),.06+span*sin(pose.oar),endZ];
  }
  return pose;
 }
 function motion(id,t){const out={};
  if(['eastern_waterlane','eastern_li_river','eastern_seacliff'].includes(id))out.boat=boat(id,t);
  switch(id){
   case 'eastern_waterlane':out.cloth=cloth(.80,-.90,.75,.45,.34,.18,t,3.2);out.features=[at(out.boat,[.20,0,.07]),out.cloth[3][1]];break;
   case 'eastern_terraces':{
    out.wheel=angle(t,4.8);const strips=[];
    for(let i=0;i<2;i++){const q=phase(t+i*1.6,3.2),a=q,b=Math.min(1,q+.32),point=(u,s)=>[.70-.55*u+s*.038,.10-.60*u-s*.035,.59-.24*u+.006];strips.push([point(a,-1),point(b,-1),point(b,1),point(a,1)]);}
    out.water=strips;out.features=[[.78+.30*cos(out.wheel),-.695,.40+.30*sin(out.wheel)],strips[0][2]];break;
   }
   case 'eastern_zentemple':{
    out.bell=.419*sin(angle(t,3.2));out.cloth=cloth(.68,-.72,.95,.54,.24,.20,t,4.8);
    out.bellPoint=p=>[-.72+p[0]*cos(out.bell)+p[2]*sin(out.bell),-.28+p[1],.82-p[0]*sin(out.bell)+p[2]*cos(out.bell)];
    out.features=[out.bellPoint([.115,0,-.25]),out.cloth[3][1]];break;
   }
   case 'eastern_li_river':{
    out.netHeight=.10+.32*(.5-.5*cos(angle(t,4.8)));
    out.net=[[-.26,-.44,out.netHeight],[.38,-.44,out.netHeight],[.38,-.04,out.netHeight],[-.26,-.04,out.netHeight]].map(p=>at(out.boat,p));
    out.features=[at(out.boat,[.25,.015,.057]),out.net[0]];break;
   }
   case 'eastern_tea_trail':{
    const q=angle(t,9.6),p=[1.05*cos(q),-.12+.75*sin(q),0],a=Math.atan2(.75*cos(q),-1.05*sin(q));
    const ground=height(id,p[0],p[1]),step=sin(angle(t,1.6));
    out.porter={p,angle:a,ground,feet:[{x:.07*step,y:-.055,lift:.08*Math.max(0,step)},{x:-.07*step,y:.055,lift:.08*Math.max(0,-step)}]};
    out.shoots=[[.10,-.45],[-.48,-.20],[.47,.13]].map(([x,y],i)=>{const h=height(id,x,y);return {root:[x,y,h+.18],tip:[x+.15*sin(angle(t,3.2)+i*.9),y+.045*cos(angle(t,3.2)+i),h+.58]};});
    out.features=[at(out.porter,[.075,.065,ground+.53]),out.shoots[0].tip];break;
   }
   case 'eastern_seacliff':{
    // Widen to .07 without changing the existing mid-strip trajectory. Only
    // the shoremost ridge's right end bends .10 seawards: rotating the whole
    // strip would push its opposite end into the boat's .06 dark-water gap.
    out.waves=Array.from({length:3},(_,i)=>{const q=angle(t,4.8)+i*1.1,x=-.95+.22*sin(q),y=-1.38+i*.14-.0175,z=.055+.025*cos(q),bend=i===2?.10:0;
     const points=bend?[[-.325,-.035,-.025],[0,-.035,-.025],[.325,-.035-bend,-.025],[.325,.035-bend,0],[0,.035,0],[-.325,.035,0]]:[[-.325,-.035,-.025],[.325,-.035,-.025],[.325,.035,0],[-.325,.035,0]];
     return points.map(([u,v,h])=>[x+u,y+v,z+h]);});
    out.features=[at(out.boat,[.21,0,.07]),out.waves[0][2]];break;
   }
   default:throw Error('Unknown eastern motion '+id);
  }return out;
 }
 // These upper bounds enclose both fixed roofs/peaks and complete actor sweeps.
 // x/y are clipped cell limits, z maxima include >=.02 headroom. They are
 // intentionally conservative; dense tests are regression evidence, not proof.
 const highs={
  eastern_waterlane:[1.24,1.24,1.24,1.24,1.24,1.24,.66,.80,.94],
  eastern_terraces:[1.35,1.35,.88,1.35,1.35,.88,.52,.78,.82],
  eastern_zentemple:[1.28,1.28,1.28,1.28,1.28,1.28,1.10,1.10,1.08],
  eastern_li_river:[1.36,1.15,1.30,1.36,1.15,1.30,.92,1.10,.92],
  eastern_tea_trail:[1.39,1.39,1.25,1.39,1.39,1.25,1.22,1.22,1.22],
  eastern_seacliff:[.80,1.40,1.40,.80,1.40,1.40,.80,.82,.82]
 };
 const boxes=Object.fromEntries(Object.entries(highs).map(([id,heights])=>[id,heights.map((z,i)=>({lo:[i%3-1.5,.5-Math.floor(i/3),0],hi:[i%3-.5,1.5-Math.floor(i/3),z]}))]));
 root.GroundEasternWorld=Object.freeze({surface,height,motion,bounds:id=>boxes[id],at,canal,coast,terrace,tea,smooth});
})(globalThis);
