"use strict";
// Six original low-poly compositions. Fixed scenery and living actors share
// fantasy-world's support/kinematic data; the existing partition owns all cuts.
((root)=>{
 const W=root.GroundFantasyWorld,tau=2*Math.PI,sin=Math.sin,cos=Math.cos;
 const palettes={
  fantasy_moonshroom:['#282d50','#57516b','#243e59','#60748e'],fantasy_crystal:['#273c58','#556a7d','#194b66','#407d91'],
  fantasy_ruins:['#8d8b7b','#c4c9b8','#61778a','#b4c4c9'],fantasy_treehouse:['#33442d','#6c7e49','#485c3c','#89966b'],
  fantasy_starspring:['#373351','#787085','#203d57','#498289'],fantasy_dragon:['#96b2c6','#dde5df','#6c9ba9','#b4d6df']};
 const quad=(b,p,c,a=1)=>{b.face([p[0],p[1],p[2]],c,a);b.face([p[0],p[2],p[3]],c,a);},beam=(b,a,c,r,color)=>b.branch(a,c,r,r*.84,color,5);
 function disk(b,x,y,z,rx,ry,color,n=12,alpha=1){b.face(Array.from({length:n},(_,i)=>[x+rx*cos(tau*i/n),y+ry*sin(tau*i/n),z]),color,alpha);}
 function octa(b,p,r,color,alpha=1,orient=v=>v){const point=v=>orient(v).map((n,k)=>n+p[k]),ring=[[-r,0,0],[0,-r,0],[r,0,0],[0,r,0]].map(point),top=point([0,0,r]),bottom=point([0,0,-r]);for(let i=0;i<4;i++){b.face([top,ring[i],ring[(i+1)%4]],color,alpha);b.face([bottom,ring[(i+1)%4],ring[i]],color,alpha);}}
 function localBox(b,point,x,y,z,sx,sy,sz,color){const rings=[-1,1].map(k=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>point([x+i*sx/2,y+j*sy/2,z+k*sz/2])));quad(b,rings[1],color);quad(b,rings[0],color);for(let i=0;i<4;i++)quad(b,[rings[0][i],rings[0][(i+1)%4],rings[1][(i+1)%4],rings[1][i]],color);}
 function terrain(b,id){const p=palettes[id];
  if(id==='fantasy_ruins'){for(let i=0;i<9;i++){const x=i%3-1.5,y=.5-Math.floor(i/3);quad(b,[[x,y,.008],[x+1,y,.008],[x+1,y+1,.008],[x,y+1,.008]],p[i%2],.24);}return;}
  const land=id==='fantasy_dragon'?.02:id==='fantasy_crystal'||id==='fantasy_starspring'?.04:.025,water=id==='fantasy_moonshroom'?.012:.024;
  const clip=(pts,positive)=>{const out=[];let a=pts.at(-1),sa=W.surface(id,...a),ina=(sa>=0)===positive;for(const c of pts){const sc=W.surface(id,...c),inc=(sc>=0)===positive;if(ina!==inc){let l=a,r=c,sl=sa;for(let k=0;k<16;k++){const m=[(l[0]+r[0])/2,(l[1]+r[1])/2],sm=W.surface(id,...m);if((sm>=0)===(sl>=0)){l=m;sl=sm;}else r=m;}out.push([(l[0]+r[0])/2,(l[1]+r[1])/2]);}if(inc)out.push(c);a=c;sa=sc;ina=inc;}return out;};
  for(let j=0;j<12;j++)for(let i=0;i<12;i++){const x=-1.5+i*.25,y=-1.5+j*.25,a=[x,y],c=[x+.25,y],d=[x+.25,y+.25],e=[x,y+.25];for(const tri of [[a,c,d],[a,d,e]])for(const dry of [true,false]){const q=clip(tri,dry);if(q.length>=3)b.face(q.map(([x,y])=>[x,y,dry?land:water]),p[dry?(i+j)%2:2],dry?.20:.30);}}
 }
 function rock(b,x,y,z,rx,ry,h,seed,colors){const n=7,lower=Array.from({length:n},(_,i)=>{const q=tau*i/n,r=.85+.15*b.rnd(seed+i);return [x+rx*r*cos(q),y+ry*r*sin(q),z];}),upper=lower.map((p,i)=>[x+(p[0]-x)*(.50+.2*b.rnd(seed+i+19)),y+(p[1]-y)*.60,z+h*(.80+.2*b.rnd(seed+i+31))]);
  for(let i=0;i<n;i++)quad(b,[lower[i],lower[(i+1)%n],upper[(i+1)%n],upper[i]],colors[i%colors.length]);for(let i=1;i<upper.length-1;i++)b.face([upper[0],upper[i],upper[i+1]],colors.at(-1));
 }
 function mushroom(b,x,y,top,r,stem,color,seed){const z=W.height('fantasy_moonshroom',x,y);b.branch([x,y,z],[x,y,stem+.012],r*.16,r*.12,'#d7d9bd',6);const n=12,edge=Array.from({length:n},(_,i)=>[x+r*cos(tau*i/n),y+r*sin(tau*i/n),stem+(top-stem)*.21]),inner=edge.map((p,i)=>[x+(p[0]-x)*.58,y+(p[1]-y)*.58,top-.035]);
  for(let i=0;i<n;i++){const k=(i+1)%n;quad(b,[edge[i],edge[k],inner[k],inner[i]],i%3?'#8278ac':color);b.face([inner[i],inner[k],[x,y,top]],i%2?color:'#c0addd');b.face([[x,y,stem],edge[k],edge[i]],'#c8cbbb');}
  for(let i=0;i<8;i++){const q=tau*i/8;beam(b,[x+.07*cos(q),y+.07*sin(q),stem+.006],[x+r*.93*cos(q),y+r*.93*sin(q),stem+(top-stem)*.21-.006],.008,'#f2e7bc');}
 }
 function moonFixed(b){terrain(b,'fantasy_moonshroom');mushroom(b,-.55,.30,1.13,.45,.85,'#b3a0e3',1);mushroom(b,.80,.75,.55,.30,.37,'#859acf',2);mushroom(b,-1.03,-.78,.72,.26,.53,'#a381c0',3);
  for(let i=0;i<4;i++){const x=.35+i*.13,y=-.73+.09*sin(i*2),h=.12+i*.05;mushroom(b,x,y,h,.07+i*.008,h*.64,'#96b6b9',i+10);}
  for(let i=0;i<6;i++){const q=tau*i/6;beam(b,[-.55,.30,.08],[-.55+.49*cos(q),.30+.39*sin(q),.045],.024,'#74738e');}
  b.ell(.15,1.1,.235,.28,.18,.21,'#999eab',22);
 }
 function crystal(b,x,y,z,h,r,colors,spin=0){const n=6,lo=Array.from({length:n},(_,i)=>[x+r*cos(tau*i/n+spin),y+r*sin(tau*i/n+spin),z]),hi=lo.map(p=>[x+(p[0]-x)*.82,y+(p[1]-y)*.82,z+h*.72]);
  b.face(lo,colors[0]);for(let i=0;i<n;i++){const k=(i+1)%n;quad(b,[lo[i],lo[k],hi[k],hi[i]],colors[i%colors.length]);b.face([hi[i],hi[k],[x,y,z+h]],colors[(i+1)%colors.length]);}
 }
 function caveFixed(b){const id='fantasy_crystal';terrain(b,id);
  for(let i=0;i<7;i++){const x=-1.12+i*.37,y=.96+.12*cos(i*.9),h=[.82,1.04,1.18,1.12,1.22,.93,.79][i];rock(b,x,y,.04,.27,.27,h-.04,i*11+2,['#24354d','#374d69','#596b81']);}
  for(let i=0;i<5;i++){const q=tau*i/5,x=-.65+.15*cos(q),y=.30+.12*sin(q),h=i?(.57+i*.09):1.06;b.branch([x,y,.04],[x,y,.06],.11,.11,'#62778c',6);crystal(b,x,y,.06,h,.075,['#63a9c2','#96d6e1','#b1b2d8'],i*.31);}
  for(let i=0;i<3;i++)crystal(b,.91+.10*cos(i*2),-.65+.09*sin(i*2),.04,.26+i*.06,.065,['#7cacc4','#b6cce0','#607ea7'],i);
  // The left bridge foot is an explicit emergent islet inside the pond.
  disk(b,.20,-.10,.14,.095,.095,'#8ea9b1');b.branch([.20,-.10,.012],[.20,-.10,.14],.095,.095,'#5e7e8b',8);
  b.branch([.85,-.10,.04],[.85,-.10,.30],.10,.10,'#638395',6);
  const a=[.20,-.10,.16],c=[.85,-.10,.32];for(const side of [-1,1])beam(b,[a[0],a[1]+side*.075,a[2]-.015],[c[0],c[1]+side*.075,c[2]-.015],.015,'#6d9fac');const deck=[[.20,-.175,.16],[.85,-.175,.32],[.85,-.025,.32],[.20,-.025,.16]],under=deck.map(p=>[p[0],p[1],p[2]-.02]);quad(b,deck,'#b7e2dd');quad(b,under,'#7199a6');for(let i=0;i<4;i++)quad(b,[deck[i],deck[(i+1)%4],under[(i+1)%4],under[i]],'#83afb8');
 }
 function island(b,a){const n=12,top=Array.from({length:n},(_,i)=>[a.x+a.r*cos(tau*i/n),a.y+a.r*sin(tau*i/n),a.z]),mid=top.map(p=>[a.x+(p[0]-a.x)*.57,a.y+(p[1]-a.y)*.57,.04+(a.z-.04)*.37]);b.face(top,'#bab391');for(let i=0;i<n;i++){const k=(i+1)%n;quad(b,[top[i],top[k],mid[k],mid[i]],i%2?'#777e76':'#9b9a87');b.face([mid[i],mid[k],[a.x,a.y,.04]],'#586a6b');}}
 function ruinsFixed(b){terrain(b,'fantasy_ruins');for(const a of W.islands)island(b,a);
  const ring=(q,r)=>[.45+.80*r*cos(q),.35,.84+.41*r*sin(q)];for(let i=0;i<20;i++){if(i>=6&&i<10)continue;const a=tau*i/20,c=tau*(i+1)/20,front=[ring(a,1),ring(c,1),ring(c,.75),ring(a,.75)];for(const side of [-1,1])quad(b,front.map(p=>[p[0],p[1]+side*.06,p[2]]),side===-1?'#d4c6a0':'#95917e');for(const [r,color]of [[1,'#b5aa8d'],[.75,'#737c72']])quad(b,[[ring(a,r)[0],.29,ring(a,r)[2]],[ring(c,r)[0],.29,ring(c,r)[2]],[ring(c,r)[0],.41,ring(c,r)[2]],[ring(a,r)[0],.41,ring(a,r)[2]]],color);}
  b.box(.45,.35,.43,.18,.14,.02,'#9b9b7c');rock(b,-.96,.26,.30,.075,.075,.35,54,['#959980','#c5b995','#777e6c']);rock(b,.72,.50,.42,.065,.07,.48,71,['#989984','#d4c6a1','#7c8773']);
  b.branch([-.70,.05,.30],[-.70,.05,1.10],.014,.011,'#6b6556',5);
  for(let i=0;i<3;i++){const y=-1.11+i*.12,z=.04+i*.08;b.box(.15,y,z/2+.004,.34,.13,z,'#aaa98e');}
 }
 function roof(b,x,y,z,w,d,h){const a=[x-w/2,y-d/2,z],c=[x+w/2,y-d/2,z],e=[x+w/2,y+d/2,z],f=[x-w/2,y+d/2,z],l=[x-w*.30,y,z+h],r=[x+w*.30,y,z+h];quad(b,[a,c,r,l],'#68836b');quad(b,[e,f,l,r],'#55755c');b.face([f,a,l],'#41594c');b.face([c,e,r],'#78926e');beam(b,l,r,.016,'#b5b08a');}
 function libraryFixed(b){terrain(b,'fantasy_treehouse');const x=-.48,y=.28;
  b.branch([x,y,.025],[x,y,1.25],.17,.10,'#796044',7);for(let i=0;i<7;i++){const q=tau*i/7;beam(b,[x,y,.21],[x+.55*cos(q),y+.49*sin(q),.05],.040,'#6d5c3e');}
  for(const [px,py,z,w,d]of [[-.48,.20,.35,.85,.55],[-.48,.32,.72,.85,.55]]){b.box(px,py,z-.025,w,d,.05,'#9d8056');for(const dx of [-.36,.36])for(const dy of [-.20,.20])b.branch([px+dx,py+dy,.025],[px+dx,py+dy,z-.05],.023,.020,'#6b5b40',5);}
  b.box(-.35,.19,.54,.67,.04,.38,'#75533a');for(const px of [-.69,-.01])b.box(px,.10,.54,.035,.22,.38,'#98774f');b.box(-.35,.08,.74,.72,.29,.04,'#b3945c');roof(b,-.35,.10,.77,.85,.36,.12);
  for(const [sx,sy]of [[-.61,-.02],[-.22,-.02]]){b.box(sx,sy,.48,.22,.045,.018,'#b29667');b.box(sx,sy,.66,.22,.045,.018,'#b29667');for(let i=0;i<5;i++){b.box(sx-.08+i*.039,sy-.006,.55,.026,.047,.12,['#9d4c48','#669b91','#e0c278','#667eaf','#a56b87'][i]);}}
  // Rear-only canopy leaves front door, books and moving lamp uncovered.
  for(const [i,dx,dy]of [[0,-.40,.58],[1,0,.76],[2,.39,.61],[3,-.08,.37]]){beam(b,[x,y,1.03],[x+dx,y+dy,1.15],.035,'#7c6944');b.ell(x+dx,y+dy,1.16,.38,.28,.17,['#425d3e','#5a7847','#72914f','#456b43'][i],i+80);}
  for(let i=0;i<5;i++){const u=i/4,px=.55-.63*u,py=-.75+.68*u,z=.055+.295*u;b.box(px,py,z/2+.012,.18,.14,z-.025,'#9b9a7a');}
  for(const side of [-1,1])beam(b,[.55+side*.08,-.75,.09],[-.08+side*.08,-.07,.35],.015,'#a38a58');
 }
 function springFixed(b){const id='fantasy_starspring';terrain(b,id);for(let i=0;i<12;i++){const q=tau*i/12,p={p:[.10+.80*cos(q),-.20+.68*sin(q),.085],angle:q};localBox(b,v=>W.at(p,v),0,0,0,.20,.13,.09,i%2?'#a79d91':'#c3ba9e');}
  for(let i=0;i<3;i++)rock(b,1.06,.36+i*.25,.04,.31-i*.025,.28,.14+i*.15,101+i,['#6f6682','#8e839a','#b0a08c']);
  b.branch([-.75,.70,.04],[-.75,.80,.52],.075,.055,'#5d607c',6);beam(b,[-.75,.80,.50],[-.96,.80,1.00],.045,'#6f7488');beam(b,[-.75,.80,.50],[-.57,.80,1.10],.042,'#747f92');beam(b,[-.57,.80,1.10],[-.57,.67,1.10],.014,'#c7b78f');
  const center=[-.89,.80,1.00],star=Array.from({length:10},(_,i)=>{const q=Math.PI/2+tau*i/10,r=i%2?.052:.12;return [center[0]+r*cos(q),center[1]-.014,center[2]+r*sin(q)];});for(let i=0;i<10;i++)b.face([center,star[i],star[(i+1)%10]],i%2?'#e4cd90':'#fff0b4');
  for(let i=0;i<4;i++){const y=-1.17+i*.10;disk(b,.10+.06*sin(i),y,.07+i*.005,.09,.07,'#b6ac94',6);}
 }
 function transformFrom(b,start,point){for(let i=start;i<b.shapes.length;i++)b.shapes[i].points=b.shapes[i].points.map(point);}
 function dragonFixed(b){terrain(b,'fantasy_dragon');const nestStart=b.shapes.length;disk(b,.05,-.10,.10,.68,.68,'#819fac');
  for(let i=0;i<12;i++){const q=tau*i/12,p={p:[.05+.76*cos(q),-.10+.76*sin(q),.09],angle:q};localBox(b,v=>W.at(p,v),0,0,0,.18,.14,.14,i%2?'#adc6cf':'#d8e2dd');}
  transformFrom(b,nestStart,W.dragonPoint);
  for(const [x,y,h]of [[-1.04,.86,1.20],[-.64,1.12,.84],[.19,1.15,1.02],[.87,.97,1.10],[1.10,.69,.76]])crystal(b,x,y,.02,h-.02,.14,['#93b9cf','#d3e2e5','#6e96b2'],x*2);
  const actorStart=b.shapes.length;
  for(const [x,y,z]of W.sourceMotion('fantasy_dragon',0).feet){b.box(x,y-.025,z+.04,.12,.20,.08,'#8dafc7');for(const dx of [-.034,0,.034])beam(b,[x+dx,y-.10,z+.035],[x+dx,y-.145,z+.018],.010,'#344e78');}
  // Four fixed solid legs join actual feet to the lower torso; breathing
  // changes only the torso's upper half, never these contact/support points.
  for(const [i,foot]of W.sourceMotion('fantasy_dragon',0).feet.entries()){
   const a=[foot[0],foot[1]-.025,.145],c=[foot[0]*.55-.06,foot[1]*.55,.29],rings=[a,c].map((p,j)=>Array.from({length:6},(_,k)=>[p[0]+(j?.075:.045)*cos(tau*k/6),p[1]+(j?.075:.045)*sin(tau*k/6),p[2]])),color=['#769ab8','#7ca0bc','#6f95b4','#83a6bf'][i];
   b.face(rings[0],color);b.face(rings[1],color);for(let j=0;j<6;j++)quad(b,[rings[0][j],rings[0][(j+1)%6],rings[1][(j+1)%6],rings[1][j]],color);
  }
  beam(b,[.14,-.10,.29],[.31,-.34,.47],.10,'#9dbdd4');b.ell(.43,-.45,.52,.20,.13,.14,'#accbdc',201);beam(b,[.52,-.48,.51],[.64,-.56,.54],.07,'#a0bfd0');
  for(const side of [-1,1]){b.ell(.48,-.45+side*.105,.566,.042,.018,.028,'#ecbd65',210+side);b.ell(.49,-.45+side*.12,.567,.017,.007,.021,'#243454',215+side);beam(b,[.37+side*.07,-.38,.63],[.31+side*.09,-.29,.75],.027,'#344d76');}
  b.face([[.615,-.57,.52],[.66,-.575,.54],[.635,-.575,.565]],'#32476a');
  for(const side of [-1,1]){const wing=[[-.32,side*.03,.42],[-.52,side*.22,.66],[.02,side*.17,.39]];b.face(wing,side===1?'#637ca6':'#839dc0');beam(b,wing[0],wing[1],.014,'#3c577f');beam(b,wing[1],wing[2],.013,'#48638e');}
  transformFrom(b,actorStart,W.dragonPoint);
  for(let i=0;i<3;i++){const x=-.76+i*.13,y=-.58+.035*sin(i);b.ell(x,y,.19,.065,.075,.09,'#e8e7d6',230+i);}
 }
 function moonLiving(b,m){for(const [i,a]of m.moths.entries()){for(const wing of a.wings)quad(b,wing,i===1?'#ffe2a8':'#f5ead0');b.branch(W.at(a,[0,-.045,0]),W.at(a,[0,.045,0]),.012,.009,'#5a5577',5);}for(const a of m.spores)octa(b,a.p,a.radius,'#c6f2dc',a.alpha);}
 function caveLiving(b,m){for(const a of m.crystals)crystal(b,a.p[0],a.p[1],a.p[2]-.15,.30,.05,['#d1f5ec','#8fcbeb','#b3a9df'],a.angle);
  for(const a of m.rings)for(let i=0;i<32;i++){const q=tau*i/32,c=tau*(i+1)/32,p=(r,q)=>[a.p[0]+r*cos(q),a.p[1]+r*sin(q),a.p[2]],poly=[p(a.radius-a.width/2,q),p(a.radius+a.width/2,q),p(a.radius+a.width/2,c),p(a.radius-a.width/2,c)];if(poly.every(p=>W.surface('fantasy_crystal',p[0],p[1])<-.003))quad(b,poly,'#d6fcf4',a.alpha);}
 }
 function ruinsLiving(b,m){for(const [i,a]of m.stones.entries()){localBox(b,p=>W.at(a,p),0,0,0,a.size,a.size,a.size,['#ead5a1','#bbc7aa','#8ba09d'][i]);b.face([[-.02,-a.size/2-.001,0],[0,-a.size/2-.001,.025],[.02,-a.size/2-.001,0]].map(p=>W.at(a,p)),'#695e67');}
  for(let i=0;i<3;i++){quad(b,[m.flag[i][0],m.flag[i+1][0],m.flag[i+1][1],m.flag[i][1]],i===1?'#f5dfa3':'#aa4b62');beam(b,m.flag[i][0],m.flag[i+1][0],.004,'#ffe8b4');}
 }
 function libraryLiving(b,m){for(const book of m.books){for(const [i,page]of book.pages.entries()){quad(b,page,i?'#fff2cf':'#e5d49f');beam(b,page[2],page[3],.005,'#698e91');}beam(b,book.pages[0][0],book.pages[0][1],.006,'#476879');}
  const a=m.lantern;beam(b,a.pivot,a.attachment,.007,'#c9b98c');localBox(b,a.point,0,0,-.295,.10,.07,.13,'#ffdc87');for(const x of [-.05,.05])for(const y of [-.035,.035])beam(b,a.point([x,y,-.23]),a.point([x,y,-.36]),.006,'#805944');
 }
 function springLiving(b,m){for(const a of m.grains)octa(b,a.p,a.size/2,'#ffe5a1',a.alpha,W.grainPoint);const a=m.pendant;beam(b,a.pivot,a.attachment,.007,'#c6bb95');const ring=[[.055,0,-.31],[0,-.03,-.31],[-.055,0,-.31],[0,.03,-.31]];for(let i=0;i<4;i++){b.face([[0,0,-.21],ring[i],ring[(i+1)%4]].map(a.bodyPoint),'#b9f0dd');b.face([[0,0,-.41],ring[(i+1)%4],ring[i]].map(a.bodyPoint),'#f5dfaa');}}
 function dragonLiving(b,m){const start=b.shapes.length;
  // ell closes over its builder's face, so use an explicit four-band hull here
  // to keep only its upper surface breathing while all four feet stay fixed.
  const n=10,bands=4,rings=Array.from({length:bands+1},(_,j)=>{const q=(j/bands-.5)*Math.PI;return Array.from({length:n},(_,i)=>{const a=tau*i/n,z=.30+.20*sin(q);return [-.12+.37*cos(q)*cos(a),-.02+.25*cos(q)*sin(a),z+m.breathing*Math.max(0,(z-.30)/.20)];});});
  for(let j=0;j<bands;j++)for(let i=0;i<n;i++){const k=(i+1)%n,p=[rings[j][i],rings[j][k],rings[j+1][k],rings[j+1][i]];if(!j)p.shift();else if(j===bands-1)p.pop();b.face(p,j===2?'#9fc5d8':j===3?'#b8d7e2':'#7b9dbb');}
  for(let i=0;i<m.tail.length-1;i++)b.branch(m.tail[i],m.tail[i+1],[.10,.075,.045][i],[.075,.045,.006][i],'#87afc9',6);
  const tip=m.tail.at(-1),previous=m.tail.at(-2);b.face([tip,[previous[0],previous[1]-.035,previous[2]+.015],[previous[0]-.04,previous[1]+.06,previous[2]+.05]],'#6d95b9');
  for(const [i,f]of m.breath.entries())quad(b,f.points,i%2?'#a5dcea':'#e1f8f6',f.alpha);
  transformFrom(b,start,W.dragonPoint);
 }
 const fixed={fantasy_moonshroom:moonFixed,fantasy_crystal:caveFixed,fantasy_ruins:ruinsFixed,fantasy_treehouse:libraryFixed,fantasy_starspring:springFixed,fantasy_dragon:dragonFixed};
 function draw(id,b,t){const f=fixed[id];if(!f)throw Error('Unknown fantasy habitat '+id);b.static(id,()=>f(b));const m=id==='fantasy_dragon'?W.sourceMotion(id,t):W.motion(id,t);({fantasy_moonshroom:moonLiving,fantasy_crystal:caveLiving,fantasy_ruins:ruinsLiving,fantasy_treehouse:libraryLiving,fantasy_starspring:springLiving,fantasy_dragon:dragonLiving})[id](b,m);}
 root.GroundFantasy=Object.freeze({draw,surface:W.surface,height:W.height,bounds:W.bounds,palettes});
})(globalThis);
