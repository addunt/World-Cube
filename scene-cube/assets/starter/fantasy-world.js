"use strict";
// Absolute-time kinematics and explicit analytic component envelopes only.
// No renderer/model enumeration, wall clock, accumulated dt or random placement.
((root)=>{
 const tau=2*Math.PI,sin=Math.sin,cos=Math.cos,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),phase=(t,p)=>{const q=t/p-Math.floor(t/p);return q<1e-10||q>1-1e-10?0:q;},angle=(t,p)=>tau*phase(t,p),smooth=(a,b,x)=>{const u=clamp((x-a)/(b-a));return u*u*(3-2*u);};
 const add=(a,b)=>a.map((n,k)=>n+b[k]),yaw=(p,a)=>[p[0]*cos(a)-p[1]*sin(a),p[0]*sin(a)+p[1]*cos(a),p[2]],at=(pose,p)=>add(pose.p,yaw(p,pose.angle||0));
 const stream=y=>.20+.12*sin(2*y),islands=[{x:-.70,y:.20,z:.30,r:.48},{x:.45,y:.35,z:.42,r:.42},{x:.15,y:-.75,z:.20,r:.30}];
 const polygon=(x,y,r,n=12)=>r*cos(Math.PI/n)-Math.max(...Array.from({length:n},(_,i)=>x*cos(tau*(i+.5)/n)+y*sin(tau*(i+.5)/n)));
 function surface(id,x,y){switch(id){
  case 'fantasy_moonshroom':return Math.abs(x-stream(y))-.14;
  case 'fantasy_crystal':return Math.max(Math.hypot((x-.05)/.65,(y+.15)/.42)-1,.095-Math.hypot(x-.20,y+.10));
  case 'fantasy_ruins':return Math.max(...islands.map(a=>polygon(x-a.x,y-a.y,a.r)));
  case 'fantasy_treehouse':case 'fantasy_dragon':return 1;
  case 'fantasy_starspring':return Math.hypot((x-.10)/.72,(y+.20)/.60)-1;
  default:throw Error('Unknown fantasy surface '+id);
 }}
 function height(id,x,y){switch(id){
  case 'fantasy_moonshroom':return surface(id,x,y)>=0?.025:.012;
  case 'fantasy_crystal':return Math.hypot(x-.20,y+.10)<=.095?.14:surface(id,x,y)>=0?.04:.012;
  case 'fantasy_ruins':return Math.max(.008,...islands.filter(a=>polygon(x-a.x,y-a.y,a.r)>=-1e-10).map(a=>a.z));
  case 'fantasy_treehouse':return .025;
  case 'fantasy_starspring':return surface(id,x,y)>=0?.04:.025;
  case 'fantasy_dragon':return polygon((x+.12)/1.5-.12-.05,y+.10,.68)>=0?.10:.02;
  default:throw Error('Unknown fantasy height '+id);
 }}
 function pendant(pivot,cord,a){const point=p=>[pivot[0]+p[0]*cos(a)+p[2]*sin(a),pivot[1]+p[1],pivot[2]-p[0]*sin(a)+p[2]*cos(a)];return {pivot,cord,angle:a,point,attachment:point([0,0,-cord])};}
 // Fixed rigid asset orientation, not a camera-facing billboard: Rx51°, Rz-18°.
 const grainPoint=p=>yaw([p[0],p[1]*cos(51*Math.PI/180)-p[2]*sin(51*Math.PI/180),p[1]*sin(51*Math.PI/180)+p[2]*cos(51*Math.PI/180)],-18*Math.PI/180);
 function sourceMotion(id,t){const m={featureVisible:[true,true]};switch(id){
  case 'fantasy_moonshroom':{
   m.moths=Array.from({length:3},(_,i)=>{const q=angle(t,6)+i*tau/3,pose={p:[.15+.75*cos(q),-.35+.40*sin(q),.58+.16*sin(q+.5)],angle:Math.atan2(.40*cos(q),-.75*sin(q))},wing=(5+35*(.5+.5*sin(angle(t,.8)+i)))*Math.PI/180,width=.22;
    const wings=[-1,1].map(s=>[[0,-.04,0],[s*width/2*cos(wing),-.025,width/2*sin(wing)],[s*width/2*cos(wing),.04,width/2*sin(wing)],[0,.025,0]].map(p=>at(pose,p)));return {...pose,wing,width,wings};});
   m.spores=Array.from({length:8},(_,i)=>{const q=phase(t+i*.5,4);return {p:[-.55+.29*sin(i*1.7),-.27-.025*cos(i*2),.28+.97*q],radius:.04,alpha:smooth(0,.10,q)*(1-smooth(.80,1,q))};});
   m.features=[m.moths[0].wings[0][1],add(m.spores[2].p,[0,0,.04])];m.featureVisible[1]=m.spores[2].alpha>.006;break;
  }
  case 'fantasy_crystal':{
   m.crystals=Array.from({length:2},(_,i)=>{const q=angle(t,5)+i*Math.PI;return {p:[.10+.22*cos(q),-.38+.22*sin(q),.64+.10*sin(q+.6)],angle:angle(t,5)+i*.7,length:.30,width:.10};});
   m.rings=Array.from({length:3},(_,i)=>{const q=phase(t+i*.8,2.4);return {p:[.05,-.15,.025],radius:.08+.40*q,width:.12,alpha:smooth(0,.1,q)*(1-smooth(.68,1,q))};});
   const a=m.crystals[0],b=m.rings[0];m.features=[add(a.p,[0,0,.15]),add(b.p,[-b.radius-b.width/2,0,0])];m.featureVisible[1]=b.alpha>.006;break;
  }
  case 'fantasy_ruins':{
   m.stones=Array.from({length:3},(_,i)=>{const q=angle(t,7)+i*tau/3,size=[.12,.11,.10][i];return {p:[.45+.38*cos(q),.08,.76+.27*sin(q)],angle:angle(t,14)+i,size};});
   m.flag=Array.from({length:4},(_,i)=>{const u=i/3,q=angle(t,2);return [[-.70+.36*u,.05+.10*u*sin(q),1.06+.04*u*sin(q)],[-.70+.36*u,.05+.10*u*sin(q),.86+.04*u*sin(q)]];});
   const a=m.stones[0];m.features=[at(a,[a.size/2,a.size/2,a.size/2]),m.flag[3][0]];break;
  }
  case 'fantasy_treehouse':{
   m.books=Array.from({length:2},(_,i)=>{const q=angle(t,6)+i*Math.PI,p=[.20+.55*cos(q),-.38+.26*sin(q),.60-.12*sin(q)],opening=(80+35*sin(angle(t,1.5)+i))*Math.PI/180,pose={p,angle:0},h=opening/2;
    return {...pose,opening,pages:[-1,1].map(s=>[[0,-.05,0],[0,.05,0],[s*.10*sin(h),.05,.10*cos(h)],[s*.10*sin(h),-.05,.10*cos(h)]].map(v=>at(pose,v)))};});
   m.lantern=pendant([-.05,-.28,.96],.23,25*Math.PI/180*sin(angle(t,2.8)));
   m.features=[m.books[0].pages[1][2],m.lantern.point([.05,-.035,-.36])];break;
  }
  case 'fantasy_starspring':{
   m.grains=Array.from({length:16},(_,i)=>{const arm=Math.floor(i/8),q=phase(t+(i%8)*.625+arm*.08,5),a=tau*(1.5*q+arm*.5),r=.18+.37*q;return {p:[.10+r*cos(a),-.20+r*sin(a),.10+.55*q],size:.055,alpha:smooth(0,.08,q)*(1-smooth(.83,1,q))};});
   m.pendant=pendant([-.57,.67,.94],.21,30*Math.PI/180*sin(angle(t,3)));
   m.features=[add(m.grains[4].p,grainPoint([0,0,.0275])),m.pendant.point([0,0,-.41])];m.featureVisible[0]=m.grains[4].alpha>.006;break;
  }
  case 'fantasy_dragon':{
   m.breathing=.04*(.5+.5*sin(angle(t,3)));const wave=sin(angle(t,4));
   m.feet=[[-.35,-.24,.10],[.17,-.24,.10],[-.40,.16,.10],[.10,.18,.10]];
   m.tail=[[.04,.18,.28],[.29,.26+.04*wave,.26],[.52,.25+.10*wave,.23],[.75,.10+.18*wave,.22]];
   m.nose=[.64,-.56,.54];const q=phase(t,4)*4,progress=clamp(q/1.8),alpha=smooth(0,.16,q)*(1-smooth(1.8,2.5,q));m.breath=[];
   if(alpha>.006)for(let i=0;i<6;i++){const lo=progress*i/6,hi=progress*(i+1)/6,width=.04+.12*hi,p=u=>[.64,-.56-.55*u,.54+.18*u];const a=p(lo),c=p(hi);m.breath.push({points:[[a[0]-(i?width*.32:.020),a[1],a[2]],[c[0]-width/2,c[1],c[2]],[c[0]+width/2,c[1],c[2]],[a[0]+(i?width*.32:.020),a[1],a[2]]],alpha});}
   const end=[.64,-.56-.55*progress,.54+.18*progress],width=.04+.12*progress;
   m.features=[m.tail.at(-1),[end[0]+width/2,end[1],end[2]]];m.featureVisible[1]=!!m.breath.length;break;
  }
  default:throw Error('Unknown fantasy motion '+id);
 }return m;}
 const dragonPoint=p=>[-.12+1.5*(p[0]+.12),p[1],p[2]];
 function motion(id,t){const m=sourceMotion(id,t);if(id==='fantasy_dragon'){for(const key of ['feet','tail','features'])m[key]=m[key].map(dragonPoint);m.nose=dragonPoint(m.nose);m.breath=m.breath.map(f=>({...f,points:f.points.map(dragonPoint)}));}return m;}
 // Static component AABBs and exact orbit extrema with primitive radii. These
 // bound full trajectories analytically; dense mesh tests only catch mistakes.
 const components={
  fantasy_moonshroom:[[-1.02,-.17,0,-.08,.77,1.15],[.47,.42,0,1.13,1.08,.58],[-1.32,-1.07,0,-.74,-.49,.75],[-.18,.85,0,.50,1.36,.48],[.25,-.93,0,.90,-.43,.30],[-1.1,-.5,0,.1,.8,.18],[-.73,-.88,.28,1.03,.18,.88],[-.89,-.335,.24,-.21,-.205,1.30]],
  fantasy_crystal:[[-1.42,.61,0,1.42,1.42,1.27],[-.94,.07,0,-.33,.53,1.18],[.72,-.89,0,1.15,-.40,.48],[.09,-.21,0,.97,.01,.37],[-.19,-.67,.37,.39,-.09,.91],[-.50,-.70,.02,.60,.40,.03]],
  fantasy_ruins:[[-1.19,-.29,.04,-.21,.69,.32],[.02,-.08,.04,.88,.78,.44],[-.16,-1.06,.04,.46,-.44,.22],[-.37,.27,.42,1.27,.43,1.28],[-1.05,.10,.30,-.86,.40,.67],[.64,.42,.42,.80,.59,.92],[-.73,-.065,.3,-.31,.165,1.13],[-.044,-.04,.40,.944,.20,1.12],[-.10,-1.22,.008,.55,-.75,.21]],
  fantasy_treehouse:[[-1.16,-.28,.005,.20,.88,.40],[-.69,.06,.02,-.27,.50,1.27],[-1.30,.43,.87,.35,1.42,1.38],[-.93,-.09,.30,.09,.64,.95],[-.20,-.88,.025,.70,-.04,.37],[-.46,-.70,.47,.86,-.06,.83],[-.25,-.33,.57,.15,-.23,.98]],
  fantasy_starspring:[[-.83,-1.00,0,1.03,.58,.16],[-1.07,.60,.02,-.43,1.02,1.16],[.76,.10,0,1.43,1.30,.50],[-.50,-.80,.07,.70,.40,.69],[-.85,.63,.48,-.29,.71,.96],[-.08,-1.25,.025,.38,-.75,.11]],
  fantasy_dragon:[[-1.31,.53,0,1.33,1.40,1.25],[-1.26,-.96,0,1.53,.76,.19],[-.915,-.62,.10,1.17,.40,.77],[-.89,-.73,.10,-.37,-.36,.30],[.06,-.12,.16,1.275,.49,.37],[.885,-1.12,.53,1.155,-.55,.73]]
 };
 const cached=new Map();function bounds(id){if(cached.has(id))return cached.get(id);if(!components[id])throw Error('Unknown fantasy bounds '+id);const cells=Array.from({length:9},(_,i)=>{const lo=[i%3-1.5,.5-Math.floor(i/3),0],hi=[i%3-.5,1.5-Math.floor(i/3),.05],parts=[{lo:lo.slice(),hi:hi.slice()}];for(const [x,y,z,a,b,c]of components[id])if(x<=hi[0]+1e-9&&a>=lo[0]-1e-9&&y<=hi[1]+1e-9&&b>=lo[1]-1e-9){hi[2]=Math.max(hi[2],c);parts.push({lo:[Math.max(lo[0],x),Math.max(lo[1],y),0],hi:[Math.min(hi[0],a),Math.min(hi[1],b),c]});}const points=[];for(const box of parts)for(const x of [box.lo[0],box.hi[0]])for(const y of [box.lo[1],box.hi[1]])for(const z of [box.lo[2],box.hi[2]])points.push(Object.freeze([x,y,z]));return Object.freeze({lo:Object.freeze(lo),hi:Object.freeze(hi),parts:Object.freeze(parts),points:Object.freeze(points)});});cached.set(id,Object.freeze(cells));return cells;}
 root.GroundFantasyWorld=Object.freeze({surface,height,motion,sourceMotion,dragonPoint,bounds,at,yaw,grainPoint,stream,islands,polygon,phase,smooth});
})(globalThis);
