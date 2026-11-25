"use strict";
// Shared authored contact surfaces, absolute-time mechanisms and cached analytic
// envelopes. No animation accumulation, wall clock, model enumeration or RNG.
((root)=>{
 const tau=2*Math.PI,sin=Math.sin,cos=Math.cos,phase=(t,p)=>{const q=t/p-Math.floor(t/p);return q<1e-10||q>1-1e-10?0:q;},angle=(t,p)=>tau*phase(t,p),smooth=(a,b,t)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
 const yaw=(p,q)=>[p[0]*cos(q)-p[1]*sin(q),p[0]*sin(q)+p[1]*cos(q),p[2]],at=(pose,p)=>yaw(p,pose.angle||0).map((n,k)=>n+pose.p[k]),river=y=>.18*sin(2*y);
 function surface(id,x,y){if(id==='civ_canal')return Math.abs(x-river(y))-(.32+.09*smooth(.20,.43,Math.abs(y+.34)));if(id==='civ_farm')return Math.max(Math.abs(y+.62)-.16,Math.abs(x-.72)-.60);if(!ids.includes(id))throw Error('Unknown civilization '+id);return 1;}
 function height(id,x,y){return id==='civ_canal'&&surface(id,x,y)<0?.045:id==='civ_farm'&&surface(id,x,y)<0?.075:.025;}
 const ids=['civ_station','civ_farm','civ_canal','civ_mine','civ_caravan','civ_greenhouse'];
 const radius=.22,perimeter=3.28+tau*radius;
 // Eight exact arclength pieces, clockwise. Position AND tangent are periodic.
 const routeParts=[{l:1,a:[.5,-1.04],d:[-1,0]},{l:Math.PI*radius/2,c:[-.5,-.82],q:-Math.PI/2},{l:.64,a:[-.72,-.82],d:[0,1]},{l:Math.PI*radius/2,c:[-.5,-.18],q:Math.PI},{l:1,a:[-.5,.04],d:[1,0]},{l:Math.PI*radius/2,c:[.5,-.18],q:Math.PI/2},{l:.64,a:[.72,-.18],d:[0,-1]},{l:Math.PI*radius/2,c:[.5,-.82],q:0}];
 function route(t,offset=0){let s=phase(t/19.2+offset,1)*perimeter;for(let i=0;i<routeParts.length;i++){const p=routeParts[i];if(s<=p.l||i===routeParts.length-1){if(p.a)return {p:[p.a[0]+p.d[0]*s,p.a[1]+p.d[1]*s,.025],angle:Math.atan2(p.d[1],p.d[0]),s:phase(t/19.2+offset,1)*perimeter};const q=p.q-s/radius;return {p:[p.c[0]+radius*cos(q),p.c[1]+radius*sin(q),.025],angle:Math.atan2(-cos(q),sin(q)),s:phase(t/19.2+offset,1)*perimeter};}s-=p.l;}}
 const rotor=(cx,cy,cz,q,inner,outer,wi,wo)=>[[inner,-wi],[outer,-wo],[outer,wo],[inner,wi]].map(([r,s])=>[cx+r*cos(q)-s*sin(q),cy,cz+r*sin(q)+s*cos(q)]);
 function motion(id,t){const m={featureVisible:[true,true]};switch(id){
 case 'civ_station':{const x=.80*sin(angle(t,19.2));m.train={p:[x,-.60,0],angle:0,wheel:-x/.09};m.crate=[1,-.08,.42+.18*sin(angle(t,6.4))];m.features=[at(m.train,[.36,-.14,.15]),[1.14,-.20,m.crate[2]+.10]];break;}
 case 'civ_farm':{m.windAngle=angle(t,6.4);m.wheelAngle=angle(t,4.8);m.sails=Array.from({length:4},(_,i)=>rotor(-.65,.16,.80,m.windAngle+i*tau/4,.075,Math.sqrt(.44**2-.06**2),.025,.06));m.buckets=Array.from({length:8},(_,i)=>rotor(.78,-.62,.31,m.wheelAngle+i*tau/8,.18,Math.sqrt(.25**2-.045**2),.04,.045));m.features=[m.sails[0][1],m.buckets[0][1]];break;}
 case 'civ_canal':{const y=-.34+.55*sin(angle(t,19.2)),u=phase(t,19.2)*19.2;m.boat={p:[river(y),y,.065],angle:Math.atan2(1,.36*cos(2*y))+Math.PI*(smooth(4,5.6,u)-smooth(13.6,15.2,u))};m.basket=[.78,-.76,.42+.18*sin(angle(t,6.4))];m.features=[at(m.boat,[.31,0,.10]),[.92,-.90,m.basket[2]+.10]];break;}
 case 'civ_mine':{m.lift=[-.8,-.55,.48+.25*sin(angle(t,6.4))];m.hammer=[.66,-.72,.45+.16*cos(angle(t,3.2))];m.pin=[.66+.16*sin(angle(t,3.2)),-.63,m.hammer[2]+.18];m.crank=[.66,-.45,.63];m.features=[[m.lift[0]+.16,m.lift[1]-.13,m.lift[2]+.10],[.81,-.84,m.hammer[2]+.08]];break;}
 case 'civ_caravan':{m.animals=[0,.5].map(offset=>{const p=route(t,offset);return {...p,gait:tau*6*p.s/perimeter};});m.bucket=[-.55,.50,.38+.17*sin(angle(t,6.4))];m.crankAngle=angle(t,6.4);m.features=[at(m.animals[0],[.11,-.07,.505]),[-.41,.40,m.bucket[2]+.09]];break;}
 case 'civ_greenhouse':{m.scanner={p:[0,0,0],angle:angle(t,9.6)};m.panelAngle=(30+25*sin(angle(t,6.4)))*Math.PI/180;m.panels=[-.65,.65].map(x=>[[x-.21,.45,.85],[x+.21,.45,.85],[x+.21,.45-.28*cos(m.panelAngle),.85+.28*sin(m.panelAngle)],[x-.21,.45-.28*cos(m.panelAngle),.85+.28*sin(m.panelAngle)]]);m.features=[at(m.scanner,[.75,-.10,.61]),m.panels[0][2]];break;}
 default:throw Error('Unknown civilization motion '+id);
 }return m;}
 const ribs=Array.from({length:6},(_,i)=>Array.from({length:7},(_,j)=>{const q=i*tau/6,u=j*Math.PI/12;return [1.175*cos(u)*cos(q),1.175*cos(u)*sin(q),.025+1.235*sin(u)];}));
 // AABBs of authored components and full analytic trajectories. Lower faces
 // extend to ground; per-cell intersection is cached, never rebuilt each RAF.
 const components={
 civ_station:[[-1.08,.08,0,.30,.88,.83],[-1.1,.47,0,-.66,.93,1.20],[.63,.18,0,1.06,.67,.92],[-1.36,-.79,0,1.36,-.41,.11],[-1.17,-.78,.045,1.17,-.42,.64],[.80,-.23,0,1.19,.26,1.10]],
 civ_farm:[[-.94,.20,0,-.36,.72,1.14],[-1.10,.125,.35,-.20,.195,1.25],[.48,-.70,0,1.09,-.49,.59],[.47,.31,0,1.14,.90,.59],[-1.40,-1.39,0,1.40,1.36,.18]],
 civ_canal:[[-1.35,-.53,0,-.50,1.36,1.03],[-.46,-.47,0,.46,.38,.21],[.56,-.43,0,1.33,.47,.65],[-.65,.67,0,.65,1.03,.58],[-.15-.36,-.89-.36,.035,.08+.36,.21+.36,.43],[.61,-.93,0,1.02,-.55,.95]],
 civ_mine:[[-1.35,.10,0,.12,1.32,1.23],[-1.03,-.73,0,-.57,-.32,1.15],[.31,-.92,0,1.10,.04,.88],[-.97,-.69,.12,-.63,-.41,.84]],
 civ_caravan:[[-1.12,.39,0,1.18,1.03,1.16],[-1.12,-.21,0,-.84,.76,.59],[.84,-.21,0,1.12,.76,.59],[-.96,-1.28,0,.96,.28,.58],[-.83,.30,0,-.28,.65,.96],[.28,.12,0,.92,.55,.63],[-1.37,-1.39,0,-.99,-.80,.19]],
 civ_greenhouse:[[-.72,-.72,0,.72,.72,.35],[-1.13,-.94,0,-.71,-.52,.55],[.67,.43,0,1.14,.87,.72],[-.77,-.77,.42,.77,.77,.63],[-.88,.15,.83,-.42,.65,1.10],[.42,.15,.83,.88,.65,1.10],[-.05,-.05,0,.05,.05,.59]]
 };
 for(const rib of ribs)for(let i=1;i<rib.length;i++)components.civ_greenhouse.push([...rib[i-1].map((n,k)=>Math.min(n,rib[i][k])-.016),...rib[i-1].map((n,k)=>Math.max(n,rib[i][k])+.016)]);
 const cached=new Map();function bounds(id){if(cached.has(id))return cached.get(id);if(!components[id])throw Error('Unknown civilization bounds '+id);const cells=Array.from({length:9},(_,i)=>{const lo=[i%3-1.5,.5-Math.floor(i/3),0],hi=[i%3-.5,1.5-Math.floor(i/3),.08],parts=[{lo:lo.slice(),hi:hi.slice()}];for(const [x,y,z,a,b,c]of components[id])if(x<=hi[0]+1e-9&&a>=lo[0]-1e-9&&y<=hi[1]+1e-9&&b>=lo[1]-1e-9){hi[2]=Math.max(hi[2],c);parts.push({lo:[Math.max(lo[0],x),Math.max(lo[1],y),0],hi:[Math.min(hi[0],a),Math.min(hi[1],b),c]});}const points=[];for(const box of parts)for(const x of[box.lo[0],box.hi[0]])for(const y of[box.lo[1],box.hi[1]])for(const z of[box.lo[2],box.hi[2]])points.push(Object.freeze([x,y,z]));return Object.freeze({lo:Object.freeze(lo),hi:Object.freeze(hi),parts:Object.freeze(parts),points:Object.freeze(points)});});cached.set(id,Object.freeze(cells));return cells;}
 root.GroundCivilizationWorld=Object.freeze({surface,height,motion,bounds,at,yaw,phase,angle,river,route,routeParts,perimeter,ribs});
})(globalThis);
