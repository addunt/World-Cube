"use strict";
// Original Eastern compositions authored in whole-face coordinates. Terrain,
// planted feet and boats all consult eastern-world; clipping stays centralized.
((root)=>{
 const W=root.GroundEasternWorld,tau=Math.PI*2,sin=Math.sin,cos=Math.cos;
 const inks={
  eastern_waterlane:['#8f9c8a','#b9bea3','#23575c','#6c9e99'],
  eastern_terraces:['#6b8e4c','#aabd70','#437c80','#b4d1b0'],
  eastern_zentemple:['#b4cbd8','#ecf0e7','#527b88','#91b0bc'],
  eastern_li_river:['#4f7665','#9ba17a','#204b52','#658b85'],
  eastern_tea_trail:['#365b36','#648147','#54765a','#8ca682'],
  eastern_seacliff:['#aeb28f','#e2d1a6','#234e73','#6b9daf']};
 const quad=(b,p,c,a=1)=>{b.face([p[0],p[1],p[2]],c,a);b.face([p[0],p[2],p[3]],c,a);};
 function beam(b,a,c,r,color){b.branch(a,c,r,r*.93,color,5);}
 function disk(b,x,y,z,rx,ry,c,n=12){b.face(Array.from({length:n},(_,i)=>[x+rx*cos(tau*i/n),y+ry*sin(tau*i/n),z]),c);}
 function terrain(b,id){
  const palette=inks[id];
  // Sparse translucent water relief keeps open-water cells genuinely modeled
  // while letting the static 240px shoreline painting remain visible below.
  for(let j=0;j<3;j++)for(let i=0;i<3;i++){const x=i-1.5,y=j-1.5;quad(b,[[x,y,.008],[x+1,y,.008],[x+1,y+1,.008],[x,y+1,.008]],palette[2],.12);}
  if(id==='eastern_terraces'){
   // Curved terraces are authored as strips with explicit risers, never a
   // triangulation spanning a step discontinuity.
   for(let k=0;k<6;k++)for(let j=0;j<20;j++){
    const x=-1.5+j*.15,x1=x+.15,y=u=>-.98+.32*k-.09*sin(2*u),z=.03+.14*k;
    for(const [a,c,color]of [[0,.056,palette[2]],[.056,.32,palette[k%2]]])quad(b,[[x,y(x)+a,z],[x1,y(x1)+a,z],[x1,y(x1)+c,z],[x,y(x)+c,z]],color);
    if(k)quad(b,[[x,y(x),z-.14],[x1,y(x1),z-.14],[x1,y(x1),z],[x,y(x),z]],'#596f40');
   }
   quad(b,[[-1.5,-1.5,.018],[1.5,-1.5,.018],[1.5,-.98,.018],[-1.5,-.98,.018]],palette[0]);
   // Back strip reaches the outer edge and continues the sixth terrace.
   for(let j=0;j<20;j++){const x=-1.5+j*.15,y=u=>.94-.09*sin(2*u);quad(b,[[x,y(x),.73],[x+.15,y(x+.15),.73],[x+.15,1.5,.73],[x,1.5,.73]],palette[1]);}
   return;
  }
  if(id==='eastern_seacliff'){
   for(let j=0;j<24;j++){
    const y=-1.5+j*.125,y1=y+.125,a=W.coast(y),c=W.coast(y1),z=W.height(id,a+.001,y),h=W.height(id,c+.001,y1);
    quad(b,[[a,y,.018],[c,y1,.018],[c,y1,h],[a,y,z]],['#898d80','#c0b895','#d6c6a4'][j%3]);
    for(let k=0;k<5;k++){const l=k/5,r=(k+1)/5;quad(b,[[a+(1.5-a)*l,y,z],[a+(1.5-a)*r,y,z],[c+(1.5-c)*r,y1,h],[c+(1.5-c)*l,y1,h]],palette[k%2]);}
   }
   return;
  }
  const n=14,step=3/n;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
   const x=-1.5+i*step,y=-1.5+j*step,wet=W.surface(id,x+step/2,y+step/2)<0;
   if(wet&&(id==='eastern_waterlane'||id==='eastern_li_river'))continue;
   const point=(u,v)=>[u,v,W.height(id,u,v)];
   quad(b,[point(x,y),point(x+step,y),point(x+step,y+step),point(x,y+step)],palette[Math.floor(b.rnd(i+j*31+8)*2)]);
  }
 }
 function roof(b,x,y,z,width,depth,rise,color,snow=false){
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,c])=>[x+a*width/2,y+c*depth/2,z+.035]);
  const left=[x-width*.28,y,z+rise],right=[x+width*.28,y,z+rise];
  quad(b,[corners[0],corners[1],right,left],color);quad(b,[corners[2],corners[3],left,right],snow?'#dce8e5':color);
  b.face([corners[3],corners[0],left],color);b.face([corners[1],corners[2],right],color);
  beam(b,left,right,.024,snow?'#f2f5e9':'#536166');
  for(let i=0;i<4;i++)beam(b,corners[i],corners[(i+1)%4],.018,snow?'#d8e6e7':'#3e4d4f');
  // Sparse broad tile seams, not hundreds of thin decorative strips.
  for(let i=1;i<6;i++){const u=i/6,px=x-width/2+width*u;beam(b,[px,y-depth/2,z+.038],[x+(px-x)*.56,y,z+rise+.008],.007,snow?'#a7bdc8':'#697477');}
 }
 function windowRow(b,x,y,z,count,width,color='#e9cb88'){
  for(let i=0;i<count;i++)b.box(x+(i-(count-1)/2)*width,y,z,width*.57,.022,.15,color);
 }
 // Terrain is nonnegative. Embed the closed plinth down to its datum rather
 // than guessing contact from the center's analytic (untriangulated) height.
 // Top and footprint remain the authored dimensions; only the buried base grows.
 function foundation(b,x,y,top,width,depth,color){b.box(x,y,top/2,width,depth,top,color);}
 function house(b,x,y,z,width,depth,h,color='#d5d3b8'){
  foundation(b,x,y,z+.08,width+.08,depth+.06,'#78857c');b.box(x,y,z+h/2+.06,width,depth,h,color);
  windowRow(b,x,y-depth/2-.015,z+h*.56,3,width*.22);
  roof(b,x,y,z+h+.06,width+.20,depth+.18,.28,'#465960');
  b.box(x-width*.36,y-depth*.52,z+.19,.05,.05,.34,'#5c6a62');
 }
 function rock(b,x,y,rx,ry,h,z=.02,colors=['#667b70','#87968a','#a6ac98']){
  const ring=Array.from({length:7},(_,i)=>{const q=tau*i/7,r=.85+.15*b.rnd(i*19+Math.round(x*1000)*31+Math.round(y*1000)*7);return [x+rx*r*cos(q),y+ry*r*sin(q),z];});
  const top=[x-rx*.12,y+ry*.12,z+h];for(let i=0;i<7;i++)b.face([ring[i],ring[(i+1)%7],top],colors[i%colors.length]);
 }
 function posts(b,x,y,z,width,depth,height,color='#685b45'){
  for(const dx of [-width/2,width/2])for(const dy of [-depth/2,depth/2])b.box(x+dx,y+dy,z+height/2,.045,.045,height,color);
 }
 function waterlaneFixed(b){
  terrain(b,'eastern_waterlane');house(b,-.72,.65,.10,.84,.62,.61);house(b,.70,.72,.10,.86,.63,.66,'#e1dfc5');
  for(let i=0;i<4;i++)b.box(.50,-.04-i*.12,.13-i*.025,.48,.14,.055,'#9caa9b');
  const x=-.55,y=W.canal(x),n=10;
  for(let i=0;i<n;i++){
   const a=i*Math.PI/n,c=(i+1)*Math.PI/n,ring=(q,r,z)=>[y+r*cos(q),.07+z*sin(q)];
   const ao=ring(a,.42,.40),co=ring(c,.42,.40),ai=ring(a,.32,.29),ci=ring(c,.32,.29);
   for(const side of [-1,1])quad(b,[[x+side*.18,...ao],[x+side*.18,...co],[x+side*.18,...ci],[x+side*.18,...ai]],i%2?'#acb4a2':'#8d9b8d');
   quad(b,[[x-.18,...ao],[x+.18,...ao],[x+.18,...co],[x-.18,...co]],'#c5c7b0');
   if(i%2===0)for(const side of [-1,1]){const p=[x+side*.20,ao[0],ao[1]+.08];b.box(...p,.035,.035,.16,'#85917e');}
  }
  b.box(.80,-.90,.39,.045,.045,.75,'#5f5b48');beam(b,[.58,-.90,.75],[1.02,-.90,.75],.018,'#5f5b48');
  for(const [px,py]of [[-1.15,1.20],[1.20,1.18]]){const z=.03;b.branch([px,py,z],[px,py,.48],.05,.025,'#687052',5);b.ell(px,py,.60,.23,.21,.22,'#6e8c61',4);}
 }
 function terracesFixed(b){
  terrain(b,'eastern_terraces');const x=-.65,y=.73,floor=.84;
  for(const dx of [-.40,.40])for(const dy of [-.26,.26]){const h=W.height('eastern_terraces',x+dx,y+dy);b.box(x+dx,y+dy,(h+floor)/2,.055,.055,floor-h,'#66543c');}
  b.box(x,y,floor,.98,.67,.065,'#a18c5d');posts(b,x,y,floor,.80,.48,.24);b.box(x,y+.08,floor+.13,.78,.38,.23,'#b69b68');windowRow(b,x,y-.13,floor+.16,4,.16,'#e3ce92');roof(b,x,y,1.08,1.12,.78,.20,'#645e42');
  for(let k=0;k<5;k++)for(let i=0;i<9;i++){const px=-1.3+i*.30,py=-.75+k*.32-.09*sin(2*px),h=W.height('eastern_terraces',px,py);if(Math.abs(px+.65)<.55&&py>.36)continue;beam(b,[px,py,h],[px+.025,py,h+.10],.009,'#d0c171');}
  for(const sy of [-.80,-.46]){const h=W.height('eastern_terraces',.78,sy);b.box(.78,sy,(h+.43)/2,.065,.065,.43-h,'#655b43');}
  beam(b,[.78,-.84,.40],[.78,-.43,.40],.035,'#6c6046');
  // Shared sloping channel descends toward the actual .17 terrace pool.
  const p=(u,side)=>[.70-.55*u+side*.058,.10-.60*u-side*.053,.59-.24*u];
  quad(b,[p(0,-1),p(1,-1),p(1,1),p(0,1)],'#617663');
  for(const side of [-1,1])beam(b,p(0,side),p(1,side),.018,'#b3aa78');
  disk(b,.15,-.50,.175,.18,.10,'#77b9ad');
 }
 function zenFixed(b){
  terrain(b,'eastern_zentemple');foundation(b,-.10,.58,.28,1.48,.76,'#879ca3');
  b.box(-.10,.71,.58,1.25,.34,.60,'#49585c');posts(b,-.10,.42,.28,1.20,.48,.56,'#6f6c60');
  roof(b,-.10,.58,.88,1.65,.94,.24,'#e6eeea',true);windowRow(b,-.10,.526,.57,4,.24,'#e2b878');
  for(let i=0;i<4;i++)b.box(-.10,-.08-i*.14,.18-i*.035,.70,.16,.065,'#bcc9c8');
  foundation(b,-.72,-.28,.18,.50,.48,'#849ba3');
  // Open the front of the bell pavilion: front posts intersected the swing in
  // the prescribed low camera. Rear piers and cantilevers keep a real load path.
  for(const px of [-.94,-.50]){b.box(px,-.10,.52,.045,.045,.68,'#5a625d');beam(b,[px,-.10,.82],[px,-.48,.82],.018,'#6c7778');}
  b.box(-.72,-.07,.51,.48,.025,.66,'#283b43');
  beam(b,[-.94,-.28,.82],[-.50,-.28,.82],.035,'#80735b');roof(b,-.72,-.28,.91,.52,.44,.12,'#dce8e7',true);
  b.box(.68,-.72,.49,.045,.045,.94,'#635e4e');beam(b,[.52,-.72,.95],[.84,-.72,.95],.018,'#b7ac83');
  for(const x of [-1.24,1.24]){b.box(x,.48,.24,.09,1.55,.34,'#7c9097');b.box(x,.48,.43,.13,1.59,.055,'#e0eae5');}
 }
 function karst(b,x,y,rx,ry,h,seed){
  const rings=Array.from({length:4},(_,j)=>Array.from({length:7},(_,i)=>{const q=tau*i/7,r=(.8+.2*b.rnd(seed+i*7+j*31))*[1,.9,.73,.40][j];return [x+rx*r*cos(q)+j*.016,y+ry*r*sin(q),.025+h*[0,.35,.78,1][j]];}));
  for(let j=0;j<3;j++)for(let i=0;i<7;i++)quad(b,[rings[j][i],rings[j][(i+1)%7],rings[j+1][(i+1)%7],rings[j+1][i]],['#47635b','#688174','#8b9681'][(i+j)%3]);b.face(rings[3],'#a0ad8b');
 }
 function riverFixed(b){
  terrain(b,'eastern_li_river');karst(b,-.93,.70,.43,.48,1.26,11);karst(b,.84,.85,.58,.42,1.13,31);karst(b,.15,1.15,.26,.25,.78,19);
  for(const side of [-1,1])for(let i=0;i<4;i++)rock(b,side*(.9+i*.13),-.35+i*.27,.13,.16,.09+i*.045,.02,['#6a8376','#899987','#afaf8c']);
  for(let i=0;i<3;i++){const x=1.23-i*.1,y=.35+i*.23;beam(b,[x,y,.05],[x-.03,y,.44],.025,'#646f54');b.ell(x-.04,y,.47,.15,.14,.12,'#7e986b',i+5);}
 }
 function teaFixed(b){
  terrain(b,'eastern_tea_trail');
  // Separate sinuous low tea rows, never the horizontal risers of the terraces.
  for(let row=0;row<5;row++)for(let j=0;j<14;j++){
   const x=-1.36+j*.205,y=-1.13+row*.48+.14*sin(x*2+row*.5);if(Math.abs(Math.hypot(x/1.05,(y+.12)/.75)-1)*.8<.22)continue;
   const z=W.height('eastern_tea_trail',x,y),canopy=Math.min(y<.35?.18:.29,.58-z);b.ell(x,y,z+canopy*.52,.15,.115,canopy*.48,['#23432c','#365831','#486936'][(j+row)%3],j+row*31);
  }
  for(let i=0;i<46;i++){const q=tau*i/46,x=1.05*cos(q),y=-.12+.75*sin(q),h=W.height('eastern_tea_trail',x,y);b.box(x,y,h-.006,.14,.14,.022,i%2?'#aea77f':'#c0b38b');}
  const x=.77,y=.76,z=W.height('eastern_tea_trail',x,y);b.box(x,y,z+.03,.57,.48,.06,'#82765b');posts(b,x,y,z+.06,.45,.36,.37);roof(b,x,y,z+.43,.72,.62,.18,'#b5a778');
  beam(b,[-.87,.83,W.height('eastern_tea_trail',-.87,.83)],[-.88,.83,.98],.075,'#665c44');
  for(let i=0;i<4;i++){const px=-.9+(i-1.5)*.15,py=.84+.12*sin(i*2);beam(b,[-.88,.83,.82],[px,py,1.08],.025,'#665c44');b.ell(px,py,1.12,.19,.17,.11,'#456238',i+16);}
 }
 function cliffFixed(b){
  terrain(b,'eastern_seacliff');const x=.68,y=.43;
  foundation(b,x,y,.69,.80,.72,'#c9ba95');posts(b,x,y,.69,.62,.49,.27,'#a35543');
  b.box(x,y+.12,.81,.48,.26,.24,'#c3b68d');roof(b,x,y,.96,.97,.82,.15,'#4c686d');
  b.box(x,y,1.10,.47,.41,.035,'#b9946a');posts(b,x,y,1.115,.40,.31,.09,'#a65843');roof(b,x,y,1.205,.64,.56,.095,'#536d70');
  for(const sy of [-.33,.33]){beam(b,[x-.37,y+sy,.78],[x+.37,y+sy,.78],.016,'#b56245');for(let i=0;i<5;i++)b.box(x-.34+i*.17,y+sy,.72,.025,.025,.14,'#ac5d45');}
  for(let i=0;i<10;i++){const py=-1.18+i*.125,h=.06+i*.052;b.box(.84-.12*sin(i*.3),py,h,.34,.145,.07,'#b4b095');}
  for(let i=0;i<6;i++)rock(b,-.12+.08*sin(i),-1.18+i*.45,.15,.13,.10,.02,['#7d908a','#a1aa95','#c0baa0']);
 }
 function clothDraw(b,rows,colors){for(let i=0;i<rows.length-1;i++){quad(b,[rows[i][0],rows[i][1],rows[i+1][1],rows[i+1][0]],colors[i%colors.length]);for(const j of [0,1])beam(b,rows[i][j],rows[i+1][j],.006,'#542c3b');}for(const row of rows.slice(1))beam(b,row[0],row[1],.006,'#ffe2a5');}
 function localBuilder(b,pose){
  const point=p=>W.at(pose,p);
  return {face:(p,c,a)=>{const v=p.map(point);for(let i=1;i<v.length-1;i++)b.face([v[0],v[i],v[i+1]],c,a);},branch:(a,c,r,rr,color,sides)=>b.branch(point(a),point(c),r,rr,color,sides),
   box(x,y,z,sx,sy,sz,c){const rings=[-1,1].map(k=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>point([x+i*sx/2,y+j*sy/2,z+k*sz/2])));b.face(rings[1],c);b.face(rings[0],c);for(let i=0;i<4;i++)b.face([rings[0][i],rings[0][(i+1)%4],rings[1][(i+1)%4],rings[1][i]],c);}
  };
 }
 function vessel(b,pose,length,width,sail=false,raft=false){
  const l=localBuilder(b,pose),ring=[[length/2,0,.07],[length*.31,-width/2,.08],[-length*.38,-width/2,.08],[-length/2,0,.05],[-length*.38,width/2,.08],[length*.31,width/2,.08]];
  if(raft){
   // A raft needs readable separated bamboo, not the opaque boat deck which
   // previously covered all five logs. Log bottoms immerse in the shared water.
   for(let i=0;i<5;i++){const y=-width/2+.025+i*(width-.05)/4;l.branch([-length/2,y,.005],[length/2,y,.005],.025,.025,i%2?'#b88e4e':'#e1c981',6);}
   for(const x of [-.16,.16])l.box(x,0,.043,.025,width,.024,'#654c32');
   l.face([[-.25,-.015,.057],[.25,-.015,.057],[.25,.015,.057],[-.25,.015,.057]],'#c5ab70');
  }else{
   l.face(ring,'#ae7950');
   for(let i=0;i<ring.length;i++){const a=ring[i],c=ring[(i+1)%ring.length];l.face([a,c,[c[0]*.88,c[1]*.68,.01],[a[0]*.88,a[1]*.68,.01]],i%2?'#725944':'#936b47');}
  }
  if(sail){
   l.branch([-.02,0,.07],[-.02,0,.49],.015,.010,'#7c7256',5);
   l.face([[-.02,-.008,.47],[.26,-.008,.17],[-.02,-.008,.17]],'#f0ead1');l.face([[-.04,.008,.45],[-.04,.008,.20],[-.20,.008,.20]],'#d5dbca');
  }else if(!raft){
   for(let i=0;i<6;i++){const a=i*Math.PI/6,c=(i+1)*Math.PI/6,p=q=>[.06,.085*cos(q),.14+.12*sin(q)];l.face([[-.15,p(a)[1],p(a)[2]],[.12,p(a)[1],p(a)[2]],[.12,p(c)[1],p(c)[2]],[-.15,p(c)[1],p(c)[2]]],i%2?'#50625e':'#66736a');}
  }
  // The lifting frame reaches local y=-.02; the raft fisherman's old
  // torso began at -.0225. Shift only that figure .025 inward, retaining
  // actor dimensions, net travel, raft/oar path and every other vessel.
  if(!sail){const personY=raft?.04:.015;l.box(-.14,personY,raft?.13:.15,.065,.075,.15,raft?'#214b65':'#4c6670');l.box(-.14,personY,raft?.24:.26,.06,.06,.07,raft?'#e8c58e':'#d5b483');
   const a=pose.oarRoot??[-.15,.06,.17],c=pose.oarTip??[-.15+.33*cos(pose.oar),.06+.30*sin(pose.oar),.02];l.branch(a,c,.012,raft?.010:.015,'#d5b47a',5);
   if(raft){const q=pose.oar,back=[c[0]-.10*cos(q),c[1]-.10*sin(q),c[2]+.012],nx=.026*-sin(q),ny=.026*cos(q);l.face([c,[back[0]+nx,back[1]+ny,back[2]],[back[0]-nx,back[1]-ny,back[2]]],'#f3deb0');}
  }
 }
 function wheelDraw(b,q){
  const cx=.78,cy=-.63,cz=.40,p=(r,a,y=-.695)=>[cx+r*cos(a),y,cz+r*sin(a)];
  for(let i=0;i<8;i++){const a=q+i*tau/8;quad(b,[p(.23,a),p(.30,a),p(.30,a+.18),p(.23,a+.18)],i===0?'#e8d58e':'#a68b5b');beam(b,p(.045,a),p(.26,a),.015,'#867048');
   quad(b,[p(.30,a),p(.30,a+.18),p(.30,a+.18,-.565),p(.30,a,-.565)],i%2?'#c2ad76':'#8a7852');}
  for(let i=0;i<16;i++){const a=tau*i/16;beam(b,p(.23,a),p(.23,a+tau/16),.018,'#a99361');}
  beam(b,[cx,-.72,cz],[cx,-.55,cz],.045,'#dfc68a');
 }
 function zenLiving(b,m,t){
  const pt=m.bellPoint,n=10;
  for(let i=0;i<n;i++){const a=tau*i/n,c=tau*(i+1)/n;quad(b,[[.06*cos(a),.06*sin(a),-.045],[.06*cos(c),.06*sin(c),-.045],[.115*cos(c),.115*sin(c),-.25],[.115*cos(a),.115*sin(a),-.25]].map(pt),i%2?'#ba9458':'#e0bf78');quad(b,[[.115*cos(a),.115*sin(a),-.23],[.115*cos(c),.115*sin(c),-.23],[.115*cos(c),.115*sin(c),-.25],[.115*cos(a),.115*sin(a),-.25]].map(pt),'#ffe0a0');}
  beam(b,pt([0,0,0]),pt([0,0,-.045]),.025,'#9d8154');
  const clapper=[-.02*sin(tau*t/3.2-.5),0,-.285];beam(b,pt([0,0,-.07]),pt(clapper),.014,'#544f3b');
  clothDraw(b,m.cloth,['#a52942','#ffe2a5','#a52942']);
 }
 function riverLiving(b,m){
  vessel(b,m.boat,.50,.30,false,true);const l=localBuilder(b,m.boat);
  l.branch([-.20,.12,.08],[-.20,.12,.66],.015,.012,'#9d9a68',5);l.branch([-.20,.12,.66],[.06,-.24,.68],.014,.010,'#c2b47d',5);
  const hook=W.at(m.boat,[.06,-.24,.68]);for(const p of m.net)beam(b,hook,p,.006,'#c7bd84');
  for(let i=0;i<4;i++){
    const a=m.net[i],c=m.net[(i+1)%4],d=Math.hypot(c[0]-a[0],c[1]-a[1]),nx=-(c[1]-a[1])/d*.020,ny=(c[0]-a[0])/d*.020;
    quad(b,[[a[0]-nx,a[1]-ny,a[2]],[c[0]-nx,c[1]-ny,c[2]],[c[0]+nx,c[1]+ny,c[2]],[a[0]+nx,a[1]+ny,a[2]]],'#e2cb88');
  }
  const mix=(a,c,u)=>a.map((v,k)=>v+(c[k]-v)*u);
  for(let i=1;i<5;i++){const u=i/5;beam(b,mix(m.net[0],m.net[1],u),mix(m.net[3],m.net[2],u),.010,'#d1bb7c');beam(b,mix(m.net[0],m.net[3],u),mix(m.net[1],m.net[2],u),.010,'#d1bb7c');}
  // Actual net corner geometry, retained as an unambiguous moving landmark.
  b.face([m.net[0],mix(m.net[0],m.net[1],.08),mix(m.net[0],m.net[3],.12)],'#efd798');
  l.box(-.18,.12,.40,.065,.065,.12,'#e7bd70');
 }
 function teaLiving(b,m){
  const man=m.porter,l=localBuilder(b,man),h=man.ground;
  l.box(0,0,h+.32,.17,.16,.24,'#173f62');l.box(0,0,h+.46,.15,.13,.14,'#edc6a0');
  l.box(-.10,0,h+.31,.28,.24,.30,'#e5cc7f');for(const z of [h+.23,h+.39])l.box(-.10,-.121,z,.28,.008,.018,'#765c38');
  for(const foot of man.feet){const p=W.at(man,[foot.x,foot.y,0]),z=W.height('eastern_tea_trail',p[0],p[1]);
   l.branch([0,foot.y,h+.23],[foot.x,foot.y,z+.025+foot.lift],.026,.022,'#6b705c',5);l.box(foot.x+.025,foot.y,z+.018+foot.lift,.10,.055,.036,'#575c4f');}
  l.branch([.04,-.095,h+.40],[.12,-.10,h+.22],.023,.020,'#c1a578',5);l.branch([.04,.095,h+.40],[.10,.10,h+.28],.023,.020,'#c1a578',5);
  for(const shoot of m.shoots){beam(b,shoot.root,shoot.tip,.015,'#77964d');const p=shoot.tip;
   quad(b,[[p[0]-.11,p[1],p[2]-.18],[p[0]-.085,p[1]-.035,p[2]-.055],p,[p[0]-.025,p[1]+.025,p[2]-.12]],'#e3f3a0');
   quad(b,[p,[p[0]+.08,p[1]-.035,p[2]-.055],[p[0]+.11,p[1],p[2]-.18],[p[0]+.025,p[1]+.025,p[2]-.12]],'#cae982');}
 }
 function draw(id,b,t){
  const fixed={eastern_waterlane:waterlaneFixed,eastern_terraces:terracesFixed,eastern_zentemple:zenFixed,eastern_li_river:riverFixed,eastern_tea_trail:teaFixed,eastern_seacliff:cliffFixed}[id];if(!fixed)throw Error('Unknown eastern habitat '+id);
  b.static(id,()=>fixed(b));const m=W.motion(id,t);
  switch(id){
   case 'eastern_waterlane':vessel(b,m.boat,.40,.14);clothDraw(b,m.cloth,['#a52942','#ffe2a5','#a52942']);break;
   case 'eastern_terraces':wheelDraw(b,m.wheel);for(const p of m.water)quad(b,p,'#c4e0c4');quad(b,[[.11,-.5,.35],[.19,-.5,.35],[.19,-.5,.175],[.11,-.5,.175]],'#b1dac7');break;
   case 'eastern_zentemple':zenLiving(b,m,t);break;
   case 'eastern_li_river':riverLiving(b,m);break;
   case 'eastern_tea_trail':teaLiving(b,m);break;
   case 'eastern_seacliff':vessel(b,m.boat,.42,.18,true);for(const p of m.waves){if(p.length===6){quad(b,[p[0],p[1],p[4],p[5]],'#d6e8df');quad(b,[p[1],p[2],p[3],p[4]],'#d6e8df');}else quad(b,p,'#d6e8df');}break;
  }
 }
 root.GroundEastern=Object.freeze({draw,surface:W.surface,height:W.height,bounds:W.bounds,palettes:inks});
})(globalThis);
