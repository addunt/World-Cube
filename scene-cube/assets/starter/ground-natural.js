"use strict";

// Six independent compositions. Whole-face XY is cut only by CubeHabitats;
// +Z is always the local vertical. Fixed callbacks deliberately ignore time.
((root)=>{
  const tau=2*Math.PI, sin=Math.sin, cos=Math.cos;
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const phase=(t,rate=1,offset=0)=>((t*rate+offset)%1+1)%1;
  const stream=y=>.03+.25*sin(y*2.4+.35);
  const lava=y=>.13+.10*sin((y+.2)*4);
  function surface(id,x,y){
    switch(id){
      case "snow":return Math.hypot(x-.15,y+.35)-.42;
      // Compress the pool along Y to leave a dry camel path at y=-.15.
      case "oasis":return Math.hypot((x-.2)/.61,(y+.55)/.29)-1;
      case "bamboo":return Math.abs(x-stream(y))-(.19+.025*cos(y*4));
      case "firefly":return Math.max(.31-Math.hypot(x+1.06,(y-.85)*1.3),.25-Math.hypot((x-1.03)*1.4,y+.88));
      case "volcano":return Math.min(Math.hypot(x,y-.25)-.32,Math.abs(x-lava(y))-.105+.35*Math.max(0,y+.2));
      case "island":return 1-Math.hypot(x,(y-.1)/.75);
      default:throw Error("Unknown natural surface "+id);
    }
  }
  // Convex facets only: four-point slopes are split if they can be warped.
  function mound(b,x,y,rx,ry,h,inks,base=.018,seed=1){
    const n=9,ring=Array.from({length:n},(_,i)=>{
      const a=tau*i/n,r=.87+.13*b.rnd(seed+i*7);return [x+rx*r*cos(a),y+ry*r*sin(a),base];
    });
    const top=[x-rx*.16,y+ry*.12,base+h];
    for(let i=0;i<n;i++)b.face([ring[i],ring[(i+1)%n],top],inks[i%inks.length]);
  }
  function disc(b,x,y,z,rx,ry,ink,n=16){b.face(Array.from({length:n},(_,i)=>[x+rx*cos(tau*i/n),y+ry*sin(tau*i/n),z]),ink);}
  function puff(b,x,y,z,rx,ry,rz,ink,alpha){
    // Alpha belongs on polygons; the stock ellipsoid is deliberately opaque.
    const n=8;
    for(let i=0;i<n;i++){
      const a=tau*i/n,c=tau*(i+1)/n,p=[x+rx*cos(a),y+ry*sin(a),z],q=[x+rx*cos(c),y+ry*sin(c),z];
      b.face([p,q,[x,y,z+rz]],ink,alpha);b.face([q,p,[x,y,z-rz]],ink,alpha);
    }
  }
  function ribbon(b,points,width,ink){
    for(let i=0;i<points.length-1;i++){
      const a=points[i],c=points[i+1],dx=c[0]-a[0],dy=c[1]-a[1],d=Math.hypot(dx,dy)||1,ox=-dy/d*width,oy=dx/d*width;
      b.face([[a[0]-ox,a[1]-oy,a[2]],[c[0]-ox,c[1]-oy,c[2]],[c[0]+ox,c[1]+oy,c[2]],[a[0]+ox,a[1]+oy,a[2]]],ink);
    }
  }
  function leaf(b,x,y,z,len,angle,ink,width=.30){
    const p=(u,v,h)=>[x+len*(u*cos(angle)-v*sin(angle)),y+len*(u*sin(angle)+v*cos(angle)),z+len*h];
    b.face([p(-.18,0,0),p(.35,-width,.035),p(1,0,.075),p(.35,width,.035)],ink);
  }
  function ripple(b,x,y,z,r,ink,alpha=1){
    for(let i=0;i<18;i++){
      const a=tau*i/18,c=tau*(i+1)/18,w=.005;
      b.face([[x+r*cos(a),y+r*sin(a),z],[x+r*cos(c),y+r*sin(c),z],[x+(r+w)*cos(c),y+(r+w)*sin(c),z],[x+(r+w)*cos(a),y+(r+w)*sin(a),z]],ink,alpha);
    }
  }
  // A sparse tiled relief gives every region its own silhouette and material,
  // while leaving the signed water/land boundary to the pixel terrain below.
  function ground(b,id,land,wet){
    const n=18,step=3/n;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const x=-1.5+i*step,y=-1.5+j*step;
      const p=(u,v)=>{
        const d=surface(id,u,v),h=id==="firefly"?Math.max(0,d)*.11:id==="volcano"?Math.max(0,Math.min(d,.2))*.13:0;
        return [u,v,.008+h];
      };
      const d=surface(id,x+step/2,y+step/2),palette=d>0?land:wet;
      const ink=palette[Math.floor(b.rnd(i+31*j+12)*palette.length)];
      // Small low-alpha relief intentionally keeps the 240px texture visible.
      const a=p(x,y),c=p(x+step,y),e=p(x+step,y+step),f=p(x,y+step);
      b.face([a,c,e],ink,.14);b.face([a,e,f],ink,.14);
    }
  }
  function stones(b,id,count,palette,seed=4){
    for(let i=0;i<count;i++){
      const x=(b.rnd(seed+i*19)-.5)*2.86,y=(b.rnd(seed+8+i*23)-.5)*2.86;
      if(surface(id,x,y)<.06)continue;
      const r=.035+.065*b.rnd(seed+i*29);mound(b,x,y,r*1.3,r,r*.85,palette,.015,seed+i);
    }
  }
  function snowFixed(b){
    ground(b,"snow",["#d8e9ec","#b7d2dc","#eff6ed"],["#4d9a99","#77b5ab"]);
    // Backward diagonal massif: rock base with a distinct white cap.
    for(let i=0;i<5;i++){
      const x=-1.12+i*.53,y=.90+.18*sin(i*1.8),h=.60+.39*sin(.6+i*.63);
      mound(b,x,y,.45,.40,h,["#6e8a99","#8daab6","#adbfca"],.018,40+i);
      mound(b,x-.045,y+.035,.25,.225,h*.44,["#f4f7ef","#d8e8ea","#c4dce3"],h*.56+.018,40+i);
    }
    // Cabin's posts visibly descend to snow. Gable runs across x=-.5.
    const x=-.55,y=.15;
    b.box(x,y,.09,.73,.54,.16,"#657f88");
    b.box(x,y,.29,.62,.46,.33,"#654d42");
    for(let i=0;i<5;i++)b.box(x,y-.235,.17+i*.065,.63,.019,.012,"#997865");
    for(const u of [-.27,.27])for(const v of [-.19,.19])b.branch([x+u,y+v,.02],[x+u,y+v,.48],.023,.023,"#493b35",5);
    const roof=(yy,z)=>[[x-.42,yy,z],[x+.42,yy,z],[x+.42,y,.68],[x-.42,y,.68]];
    b.face(roof(y-.33,.46),"#eaf5f2");b.face(roof(y+.33,.46).reverse(),"#bdd5dd");
    for(const u of [-.32,.32])b.face([[x+u,y-.24,.45],[x+u,y+.24,.45],[x+u,y,.66]],"#735548");
    b.box(x-.13,y-.244,.28,.12,.014,.21,"#352e2d");
    b.box(x+.15,y-.25,.33,.14,.015,.11,"#efc984");
    b.box(x+.15,y-.263,.33,.012,.012,.12,"#70513d");
    b.box(x+.15,y-.263,.33,.15,.012,.012,"#70513d");
    b.box(x+.2,y+.04,.64,.085,.08,.25,"#776d69");b.box(x+.2,y+.04,.77,.11,.11,.04,"#e0eaeb");
    b.box(x-.13,y-.35,.05,.25,.20,.06,"#b0bfc1");
    for(let i=0;i<18;i++){
      const a=tau*i/18,u=.15+.46*cos(a),v=-.35+.46*sin(a);
      mound(b,u,v,.09,.065,.09,["#7f969a","#b2c9cc","#e2eeee"],.012,90+i);
    }
    disc(b,.15,-.35,.018,.39,.39,"#76c0b1");
    // A few dark firs frame the warm pool without copying autumn's trees.
    for(const [u,v,h]of [[-1.22,-.69,.72],[1.12,.70,.87],[1.12,-1.03,.64],[-1.22,.25,.57]]){
      b.branch([u,v,.01],[u,v,h],.035,.014,"#655f58",5);
      for(let k=0;k<3;k++)mound(b,u,v,.21-k*.045,.21-k*.045,.27,["#3c6266","#587c7c","#93b4b5"],h*.30+k*.17,30+k);
      mound(b,u,v,.13,.13,.17,["#e3f0ec","#c2d9dd"],h*.30+.40,33);
    }
  }
  function snow(b,t){
    b.static("snow",snowFixed);
    for(let i=0;i<11;i++){
      const q=phase(t,.18,i/11),a=i*2.4;
      puff(b,.15+.23*cos(a)+.07*sin(t+i),-.35+.20*sin(a),.09+q*.83,.035+q*.065,.026+q*.043,.07+q*.09,"#e6f3ef",.38*(1-q));
    }
    for(let i=0;i<54;i++){
      const q=phase(t,.14,b.rnd(i*17));
      b.pixel((b.rnd(i*29)-.5)*2.85+.04*sin(t*.7+i),(b.rnd(i*37+5)-.5)*2.85,.045+(1-q)*1.22,.011+b.rnd(i)*.009,"#f7fcf5");
    }
    for(let i=0;i<3;i++){const q=phase(t,.29,i/3);ripple(b,.15,-.35,.023,.07+q*.29,"#b5e0cd",.65*(1-q));}
  }
  function palm(b,x,y,h,seed){
    const base=[x-.07,y,.015],top=[x+.035,y+.02,h];
    b.branch(base,top,.052,.027,"#957044",7);
    for(let i=1;i<8;i++){
      const q=i/8;b.branch([x-.07+.105*q,y,h*q],[x-.07+.105*q,y,h*q+.016],.053-.025*q,.053-.025*q,"#c0985e",7);
    }
    for(let i=0;i<7;i++){
      const a=tau*i/7+seed;
      const tip=[top[0]+.39*cos(a),top[1]+.39*sin(a),h-.14];
      b.face([[top[0],top[1],h+.04],[top[0]+.19*cos(a)-.06*sin(a),top[1]+.19*sin(a)+.06*cos(a),h+.06],tip],i%2?"#285847":"#3e7650");
      b.face([[top[0],top[1],h+.04],tip,[top[0]+.19*cos(a)+.06*sin(a),top[1]+.19*sin(a)-.06*cos(a),h+.015]],"#60834e");
      b.branch(top,tip,.007,.002,"#7b9460",4);
    }
    for(let i=0;i<3;i++)b.ell(x+.035+.04*cos(i*2),y+.02+.04*sin(i*2),h-.05,.035,.035,.04,"#6e5233",i);
    for(let i=0;i<4;i++){const a=i*tau/4;b.branch([x-.07,y,.08],[x-.07+.11*cos(a),y+.11*sin(a),.014],.03,.012,"#8e714a",4);}
  }
  function oasisFixed(b){
    ground(b,"oasis",["#c2904d","#e3b465","#f0cb7d"],["#347e7a","#27635f"]);
    for(let i=0;i<7;i++){
      const a=.1+Math.PI*i/7,x=.15+1.16*cos(a),y=-.30+.98*sin(a);
      mound(b,x,y,.48,.44,.30+.21*sin(a),["#c99851","#e1b565","#f2ce83"],.012,190+i);
      // Crisp wind-facing crest cuts through neighboring squares.
      b.face([[x-.38,y-.12,.025],[x+.28,y+.03,.025],[x-.04,y+.04,.30+.21*sin(a)]],"#f4d28e");
    }
    disc(b,.2,-.55,.014,.56,.255,"#2d8179");
    for(const [x,y,h]of [[.55,-.25,1.03],[1,-.62,.91],[-.49,-.63,.88]])palm(b,x,y,h,x);
    for(let i=0;i<14;i++){
      const a=tau*i/14;mound(b,.2+.64*cos(a),-.55+.32*sin(a),.075,.05,.04,["#aa9869","#d6be81"],.012,i+10);
    }
    stones(b,"oasis",25,["#b98b51","#d8b071"],108);
    // Sandstone stacks in the quiet far corner.
    for(let i=0;i<3;i++){b.box(-1.1+i*.18,1.04,.13+i*.055,.24,.27,.24+i*.11,"#b9854d");b.box(-1.1+i*.18,1.04,.27+i*.11,.27,.29,.055,"#e2b66b");}
  }
  const camelPose=t=>[-.22+.35*sin(t*.16),-.15,.032];
  function camel(b,t){
    const [x,y,z]=camelPose(t),ink="#b88c58";
    b.ell(x,y,z+.28,.25,.10,.13,ink,2);
    for(const u of [-.11,.11])b.ell(x+u,y,z+.40,.09,.08,.10,"#c19a64",5);
    b.branch([x+.19,y,z+.29],[x+.26,y,z+.55],.061,.040,ink,6);
    b.ell(x+.29,y,z+.56,.10,.052,.055,"#d3ad75",4);
    b.branch([x+.28,y-.027,z+.59],[x+.26,y-.04,z+.67],.018,.008,ink,4);
    b.pixel(x+.34,y-.035,z+.59,.014,"#382e27");
    for(let i=0;i<4;i++){
      const u=i<2?-.16:.15,v=i%2?-.064:.064,w=sin(t*2+i%2*Math.PI+(i<2?0:Math.PI))*.035;
      const foot=[x+u+w,y+v,z];b.branch([x+u,y+v,z+.24],[x+u-w*.4,y+v,z+.13],.022,.016,ink,5);
      b.branch([x+u-w*.4,y+v,z+.13],foot,.016,.013,"#a67d4d",5);b.box(foot[0],foot[1],z,.055,.035,.025,"#71573e");
    }
    b.branch([x-.23,y,z+.29],[x-.31,y+.025*sin(t*2),z+.16],.012,.004,"#81603f",4);
  }
  function oasis(b,t){
    b.static("oasis",oasisFixed);camel(b,t);
    for(let i=0;i<48;i++){
      const x=-1.48+phase(t,.11,b.rnd(i*19))*2.96,y=(b.rnd(i*31)-.5)*2.8;
      if(surface("oasis",x,y)<.05)continue;
      const h=.035+.075*b.rnd(i*3);ribbon(b,[[x-.07,y,h],[x+.035,y+.008,h+.005]],.006,"#f4d493");
    }
  }
  function bridge(b){
    // Voussoirs follow an arch in X. The bridge deliberately spans x=.5.
    const n=12,y=-.12;
    for(let i=0;i<n;i++){
      const x=-.43+i*.09,h=.17+.17*sin((i+.5)/n*Math.PI);
      b.box(x,y,h,.094,.32,.09,i%2?"#9baba0":"#b3beb1");
      for(const v of [-.17,.17])b.box(x,y+v,h+.09,.09,.045,.12,"#778c80");
    }
    for(const x of [-.42,.56]){b.box(x,y,.085,.16,.38,.15,"#6d8279");b.box(x+.04,y-.24,.035,.23,.16,.055,"#afbcac");}
  }
  function bambooStalk(b,x,y,h,seed,t,moving){
    const sway=.025*sin(t*.85+seed),z=h*.74;
    if(!moving){
      b.branch([x,y,.014],[x,y,h],.023,.016,"#508251",6);
      for(let i=1;i<6;i++)b.branch([x,y,h*i/6],[x,y,h*i/6+.014],.026,.025,"#a5b16c",6);
      for(let i=0;i<3;i++)b.branch([x,y,.07],[x+.08*cos(i*2),y+.08*sin(i*2),.012],.017,.005,"#687653",4);
    }else{
      b.branch([x,y,z],[x+sway,y+.015*cos(t+seed),h+.10],.013,.006,"#6e9759",5);
      for(let i=0;i<5;i++){
        const a=seed+i*2.4;leaf(b,x+sway*.8,y,z+.07+i*.035,.14,a,"#5c9b59",.13);leaf(b,x+sway+.06*cos(a),y+.06*sin(a),h+.04,.13,a+.4,"#8ab76a",.13);
      }
    }
  }
  const bambooSites=Array.from({length:24},(_,i)=>({x:(i%2?1:-1)*(.65+(i%4)*.17),y:-1.25+Math.floor(i/2)*.222,h:.69+.43*(.5+.5*sin(i*3.7)),seed:i*13}));
  function bambooFixed(b){
    ground(b,"bamboo",["#547856","#799369","#9aab79"],["#488e8c","#74aba0"]);
    for(const s of bambooSites)bambooStalk(b,s.x,s.y,s.h,s.seed,0,false);
    bridge(b);stones(b,"bamboo",50,["#73877c","#8e9c8a","#a8b29b"],292);
    // Grounded black and near-white panda at the near bridge step.
    const x=-.70,y=-.43;
    b.box(x,y,.055,.36,.27,.10,"#a7b5a5");
    for(const u of [-.11,.11])for(const v of [-.07,.07])b.ell(x+u,y+v,.13,.065,.055,.08,"#27322e",u+v);
    b.ell(x,y,.23,.17,.13,.16,"#e8e9dc",12);b.ell(x+.07,y-.10,.36,.12,.095,.11,"#eeefe3",15);
    for(const u of [-.065,.065]){
      b.ell(x+.07+u,y-.10,.45,.038,.034,.04,"#25312d",2);
      b.ell(x+.07+u*.75,y-.181,.38,.033,.023,.039,"#2e3732",3);
      b.ell(x+.07+u*.75,y-.201,.387,.008,.005,.009,"#f4f4de",4);
    }
    b.ell(x+.07,y-.19,.33,.022,.019,.015,"#202c28",8);
    for(let i=0;i<7;i++)leaf(b,-1.05+i*.08,-.82,.022,.14,i*1.7,"#567e4b");
  }
  function bamboo(b,t){
    b.static("bamboo",bambooFixed);
    for(const s of bambooSites)bambooStalk(b,s.x,s.y,s.h,s.seed,t,true);
    for(let i=0;i<22;i++){
      const q=phase(t,.13,i/22),y=1.4-q*2.8,x=stream(y)+.09*sin(i*4+q*8),z=q<.45?.025+(1-q/.45)*.80:.024;
      leaf(b,x,y,z,.06,i+t*.5,"#c7bc63",.24);
    }
    for(let i=0;i<26;i++){
      const y=1.45-phase(t,.17,i/26)*2.9,x=stream(y)+.11*sin(i*17);
      ribbon(b,[[x,y,.018],[x+.035,y+.055,.018]],.007,i%3?"#a6d0ba":"#dbdfb3");
    }
  }
  function reeds(b,x,y,h,seed){
    for(let k=0;k<5;k++){
      const a=tau*k/5,u=x+.045*cos(a),v=y+.045*sin(a),z=h*(.7+.3*b.rnd(seed+k));
      b.branch([u,v,.015],[u+.05*cos(a),v+.05*sin(a),z],.006,.004,"#7e8c50",4);
      b.branch([u+.05*cos(a),v+.05*sin(a),z-.10],[u+.05*cos(a),v+.05*sin(a),z+.03],.014,.012,"#806248",5);
      leaf(b,u,v,z*.3,.18,a,"#667f4b",.11);
    }
  }
  const logStart=[-.9,.2,.13],logEnd=[.4,-.3,.13];
  function fireflyFixed(b){
    ground(b,"firefly",["#4e6552","#6d7d56"],["#234d48","#39675a"]);
    // Low shoals and tall reed silhouettes, no egret/moon/lotus composition.
    for(const [x,y,h]of [[-1.12,.90,.94],[.93,-.92,.83],[-1.20,-.5,.62],[.83,.91,.91],[1.26,.21,.67]]){
      mound(b,x,y,.24,.20,.045,["#65714e","#818257"],.014,13);reeds(b,x,y,h,Math.floor(x*100));
    }
    b.branch(logStart,logEnd,.125,.10,"#5e4c37",9);
    b.branch([-.91,.205,.13],[-.925,.21,.13],.092,.092,"#c09b65",9);
    b.branch([-.932,.213,.13],[-.935,.214,.13],.052,.052,"#584936",9);
    b.branch([-.21,-.06,.19],[-.1,.21,.39],.045,.012,"#69543b",6);
    b.branch([-.64,.10,.19],[-.77,-.14,.30],.038,.009,"#69543b",6);
    for(let i=0;i<8;i++){const u=-.82+i*.15;leaf(b,u,.2-(u+.9)*.38,.245,.09,i*2,"#85975b");}
    for(const [x,y]of [[-.86,.22],[.34,-.28]])mound(b,x,y,.13,.12,.06,["#666c50","#848360"],.008,8);
    for(let i=0;i<12;i++){const x=(b.rnd(i*37)-.5)*2.6,y=(b.rnd(i*41+8)-.5)*2.6;disc(b,x,y,.018,.035,.026,"#6d8e65",7);}
  }
  // Water → log in .8s, rest, then slip back into water late in each cycle.
  function frogPose(t){
    const q=phase(t,1/5)*5,u=q<.8?q/.8:q<4.3?1:1-(q-4.3)/.7;
    return [.58-.23*u,-.65+.37*u,.025+.209*u+(q<.8?.21*sin(Math.PI*u):q>4.3?.08*sin(Math.PI*u):0)];
  }
  function frog(b,t){
    const [x,y,z]=frogPose(t),jump=phase(t,1/5)*5<.8;
    b.ell(x,y,z+.045,.075,.082,.045,"#6d9350",22);b.ell(x,y+.052,z+.073,.065,.047,.042,"#91aa5a",23);
    for(const d of [-1,1]){
      b.ell(x+d*.041,y+.066,z+.108,.019,.019,.019,"#bacd78",14);b.ell(x+d*.041,y+.080,z+.111,.008,.008,.011,"#25382d",15);
      b.branch([x+d*.055,y-.035,z+.04],[x+d*.10,y-.06,z+.015],.02,.012,"#668648",5);
      b.branch([x+d*.10,y-.06,z+.015],[x+d*.066,y+(jump?-.11:.035),z-.004],.012,.007,"#93a65c",5);
      b.branch([x+d*.045,y+.03,z+.04],[x+d*.07,y+.10,z-.004],.01,.006,"#8da65b",4);
    }
  }
  function firefly(b,t){
    b.static("firefly",fireflyFixed);frog(b,t);
    for(let i=0;i<34;i++){
      const a=t*.64+i*2.4,x=.97*sin(a*.5+i),y=1.16*cos(a*.5+i*.7),z=.18+.63*(.5+.5*sin(a+i));
      const r=.011+.010*(.5+.5*sin(t*3.1+i*1.7));
      b.ell(x,y,z,r,r,r,"#e0e797",i);b.pixel(x,y,z+.003,r*3,"#a5bb5d");
    }
    const q=phase(t,1/5)*5;
    if(q>.8&&q<2.7)ripple(b,.35,-.28,.025,.06+(q-.8)*.16,"#b0c28a",(2.7-q)/1.9);
    for(let i=0;i<3;i++){const u=phase(t,.16,i/3);ripple(b,-.2+i*.62,.6-i*.34,.021,.08+u*.14,"#658e75",.35*(1-u));}
  }
  function volcanoFixed(b){
    ground(b,"volcano",["#383c40","#4c4b4b","#5c5850"],["#c54925","#ed7831"]);
    // Open crater: outer skirt, jagged rim, inner wall, glowing floor.
    const n=18,cx=0,cy=.25;
    for(let i=0;i<n;i++){
      const point=(k,r,z)=>[cx+r*cos(tau*k/n),cy+r*sin(tau*k/n),z];
      const z=.51+.065*sin(i*3.3),zz=.51+.065*sin((i+1)*3.3);
      const a=point(i,.7,.025),c=point(i+1,.7,.025),d=point(i+1,.38,zz),e=point(i,.38,z);
      b.face([a,c,e],i%2?"#4c4848":"#5d5350");b.face([c,d,e],i%2?"#66605a":"#48474a");
      b.face([e,d,point(i+1,.27,.12),point(i,.27,.12)],i%3?"#633c32":"#955039");
    }
    disc(b,0,.25,.125,.28,.28,"#e7762b");
    mound(b,-.75,.55,.26,.30,1.13,["#303a40","#495058","#68717a"],.016,77);
    mound(b,-1.04,.81,.19,.20,.58,["#3d444a","#555d64"],.016,79);
    for(let i=0;i<13;i++){
      const y=-.2-i*.095,x=lava(y);
      for(const d of [-1,1])mound(b,x+d*.16,y,.09,.10,.06,["#514e48","#6e5e4b","#373c3d"],.018,i+5);
    }
    for(let i=0;i<6;i++){const a=i*1.9;mound(b,1.04*cos(a),.96*sin(a),.16,.18,.16+i*.035,["#383f43","#515758","#74736a"],.014,300+i);}
    stones(b,"volcano",52,["#3c4142","#69675d"],902);
  }
  function volcano(b,t){
    b.static("volcano",volcanoFixed);
    disc(b,.01,.25,.128,.255,.255,sin(t*1.6)>0?"#ff9a38":"#d95e25");
    for(let i=0;i<29;i++){
      const q=phase(t,.19,i/29),y=-.18-q*1.27,x=lava(y)+.065*sin(i*4.3);
      ribbon(b,[[x-.018,y,.039],[x+.014,y-.075,.039]],.008,i%3?"#ffac3d":"#ffdf77");
    }
    for(let i=0;i<19;i++){
      const q=phase(t,.25,b.rnd(i*11)),a=i*2.4;
      b.ell(.02+q*.22*cos(a),.25+q*.22*sin(a),.17+q*1.13,.009,.009,.017,i%2?"#ffbb54":"#ed7736",i);
    }
    for(let i=0;i<7;i++){
      const q=phase(t,.13,i/7);b.ell(-.05+q*.25,.27+.04*sin(t+i),.32+q*.88,.035+q*.08,.03+q*.065,.055+q*.055,["#69666a","#868080","#a49a93"][i%3],i);
    }
  }
  const islandFloor=.30;
  function islandFixed(b){
    ground(b,"island",["#8bb67a","#a8c88a"],["#799eaf","#a0bcc7"]);
    const n=20;
    const ring=(i,rx,ry,z)=>[rx*cos(tau*i/n),.1+ry*sin(tau*i/n),z];
    for(let i=0;i<n;i++){
      const a=ring(i,1,.75,islandFloor),c=ring(i+1,1,.75,islandFloor),d=ring(i+1,.33,.24,.055),e=ring(i,.33,.24,.055);
      b.face([a,c,d],i%2?"#8a8063":"#a39270");b.face([a,d,e],i%2?"#716d5b":"#8f8267");
      b.face([[0,.1,islandFloor],a,c],["#7ea566","#91b774","#a3bc79"][i%3]);
      b.branch(a,[a[0]*.94,a[1]-.01,islandFloor-.05],.02,.015,"#66894e",4);
    }
    // Windmill: timber truss and tapering tower, axis faces the front (-Y).
    const x=.45,y=.35;
    for(const u of [-.14,.14])for(const v of [-.11,.11])b.branch([x+u,y+v,islandFloor],[x+u*.46,y+v*.46,.92],.027,.018,"#81684c",5);
    b.box(x,y,.65,.22,.18,.42,"#c7bb91");
    b.face([[x-.17,y-.14,.86],[x+.17,y-.14,.86],[x,y-.14,.99]],"#806d58");
    b.face([[x-.17,y+.14,.86],[x+.17,y+.14,.86],[x,y+.14,.99]],"#a18b69");
    b.face([[x-.17,y-.14,.86],[x,y-.14,.99],[x,y+.14,.99],[x-.17,y+.14,.86]],"#9f8461");
    b.face([[x+.17,y-.14,.86],[x,y-.14,.99],[x,y+.14,.99],[x+.17,y+.14,.86]],"#b49c71");
    b.box(x,y-.098,.55,.065,.012,.15,"#6c6952");
    b.branch([x,y-.10,.87],[x,y-.20,.87],.03,.03,"#5b5b4c",6);
    // Winding stepping stones and a tiny fence define scale on the lawn.
    for(let i=0;i<8;i++)b.box(.35-i*.095,.08-i*.065,islandFloor+.014,.105,.065,.025,"#d3caa1");
    for(let i=0;i<6;i++){
      const u=-.72+i*.18,v=.42+.16*sin(i*.6);b.branch([u,v,islandFloor],[u,v,islandFloor+.13],.013,.011,"#a09168",4);
      if(i)b.branch([u-.18,.42+.16*sin((i-1)*.6),islandFloor+.09],[u,v,islandFloor+.09],.009,.009,"#b7a780",4);
    }
    for(let i=0;i<12;i++){
      const a=tau*i/12,x=.83*cos(a),y=.1+.58*sin(a);if(y<-.42)continue;
      leaf(b,x,y,islandFloor+.012,.10,a,"#c6cf7c");b.ell(x,y,islandFloor+.07,.017,.017,.024,i%2?"#f2dab0":"#debd92",i);
    }
    mound(b,-.2,-.72,.24,.19,.065,["#879c9c","#a6b4ae","#d1d4bf"],.014,67);
  }
  function island(b,t){
    b.static("island",islandFixed);
    const x=.45,y=.13,z=.87,a=t*.60;
    for(let i=0;i<4;i++){
      const q=a+i*Math.PI/2;
      const p=(u,v)=>[x+u*cos(q)-v*sin(q),y,z+u*sin(q)+v*cos(q)];
      b.branch(p(.025,0),p(.55,0),.012,.009,"#766b52",5);
      b.face([p(.16,.01),p(.53,.01),p(.53,.085),p(.22,.11)],i%2?"#ddd5b2":"#f2e9c9");
      for(let k=0;k<3;k++)b.branch(p(.24+k*.10,0),p(.24+k*.10,.085),.004,.004,"#a9966d",4);
    }
    b.ell(x,y-.018,z,.043,.025,.043,"#b1a079",2);
    // Falling sheets end above the shell and leave the rocky platform visible.
    for(let i=0;i<9;i++){
      const q=phase(t,.63,i/9),h=islandFloor-q*(islandFloor-.08),xx=-.2+.035*sin(i*2);
      ribbon(b,[[xx,-.63,h],[xx+.008,-.68,h-.025]],.012,i%3?"#c7e4df":"#f1f5dc");
    }
    b.face([[-.27,-.63,islandFloor],[-.13,-.63,islandFloor],[-.15,-.70,.085],[-.25,-.70,.085]],"#a3d1d1",.62);
    for(let i=0;i<13;i++){
      const a=i*2.4,x=-1.48+phase(t,.035,b.rnd(i*37))*2.96,y=1.15*sin(a),h=.09+.10*(.5+.5*sin(a*2));
      b.ell(x,y,h,.19+.04*cos(a),.11,.06,"#dfebea",i);
      b.ell(x+.12,y+.02,h+.035,.14,.085,.06,"#f1f3e9",i+9);
    }
  }
  const drawers={snow,oasis,bamboo,firefly,volcano,island};
  root.GroundNatural=Object.freeze({surface,camelPose,frogPose,islandHeight:islandFloor,draw(id,b,t){
    if(!drawers[id])throw Error("Unknown natural habitat "+id);
    drawers[id](b,t);
  }});
})(globalThis);
