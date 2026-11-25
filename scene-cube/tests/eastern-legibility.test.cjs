const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup,projectedVisible,contrast}=require('../test-support/visibility.cjs');
test('bell body projected-area static-occlusion probes meet 70% in 75% of sampled phases, not just a tip ray',()=>{
 const {art,view}=setup(),fixed=art.model('eastern_zentemple',0,true).flat().filter(f=>f.alpha>=.995);const counts=[];
 for(const low of [false,true]){let count=0;for(let i=0;i<24;i++){const forms=art.model('eastern_zentemple',i*.4,false).flat().filter(f=>['#ba9458','#e0bf78'].includes(f.color)),v=projectedVisible(forms,fixed,view('PX',low));if(v.ratio>=.70)count++;}counts.push(count);}
 console.log('BELL_BODY_PROBES '+JSON.stringify(counts));assert.ok(Math.max(...counts)>=18,'body-level occlusion, unlike representative-vertex visibility, must not hide most swing phases');
});
test('both flags have real folded width orientation and strong adjacent-material contrast, with approved endpoint amplitudes intact',()=>{
 const {ctx,art}=setup();for(const [id,x,z,length,width,amplitude,period,colors] of [['eastern_waterlane',.80,.75,.45,.34,.18,3.2,['#ad574c','#d88762','#d8ba89']],['eastern_zentemple',.68,.95,.54,.24,.20,4.8,['#ac554e','#d88b68','#ead2a2']]]){
  const before=ctx.GroundEasternWorld.motion(id,0).cloth,rows=ctx.GroundEasternWorld.motion(id,period/4).cloth,end=rows.at(-1),center=(end[0][0]+end[1][0])/2;
  assert.ok(Math.abs(end[1][1]-end[0][1])>.025,id+' sheet must rotate its cross-section instead of sliding an unchanged flat ribbon');
  assert.ok(Math.abs(center-(x+amplitude))<1e-8);assert.ok(Math.abs(end[0][2]-(z-length))<1e-8);for(const row of rows)assert.ok(Math.abs(Math.hypot(row[1][0]-row[0][0],row[1][1]-row[0][1])-width)<1e-8);
  assert.deepEqual(rows[0],before[0]);const forms=art.model(id,.8,false).flat(),inks=[...new Set(forms.filter(f=>colors.includes(f.color)||['#a52942','#ffe2a5'].includes(f.color)).map(f=>f.color))];assert.ok(inks.some(a=>inks.some(b=>contrast(a,b)>=3)),id+' contrasting moving bands must exist in the actual mesh');
 }
});
test('tea foreground is below waist, fresh leaves face the viewer and baskets use approved full dimensions',()=>{
 const {ctx,art}=setup(),id='eastern_tea_trail',motion=ctx.GroundEasternWorld.motion(id,.8),mesh=art.model(id,.8,false).flat();
 const leaves=mesh.filter(f=>['#b6c87a','#91b967','#e3f3a0','#cae982'].includes(f.color)),p=motion.shoots[0].tip,first=leaves.filter(f=>f.points.some(q=>Math.hypot(...q.map((n,k)=>n-p[k]))<1e-7));
 const v=first.flatMap(f=>f.points);assert.ok(Math.max(...v.map(p=>p[0]))-Math.min(...v.map(p=>p[0]))<=.220001,'approved .22-wide fans, not oversized horizontal leaves');assert.ok(Math.max(...v.map(p=>p[2]))-Math.min(...v.map(p=>p[2]))>=.15,'upright leaf fan presents a real face to low cameras');
 const greens=art.model(id,0,true).flat().map(f=>f.color).filter(hex=>{const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;return g>r*1.1&&g>b*1.1;});for(const c of new Set(leaves.map(f=>f.color)))assert.ok(greens.every(g=>contrast(c,g)>=3),'fresh leaf/static-green contrast '+c);
 for(const f of art.model(id,0,true).flat()){const n=parseInt(f.color.slice(1),16),green=(n>>8&255)>(n>>16)*1.1&&(n>>8&255)>(n&255)*1.1;if(green&&f.points.every(p=>p[1]<.35))for(const p of f.points)assert.ok(p[2]<=ctx.GroundEasternWorld.height(id,p[0],p[1])+.26+1e-6,'foreground canopy cannot conceal the walker above waist level');}
 const m=motion.porter,cs=Math.cos(m.angle),sn=Math.sin(m.angle),basket=mesh.filter(f=>['#c0aa72','#e5cc7f'].includes(f.color)).flatMap(f=>f.points).map(p=>[(p[0]-m.p[0])*cs+(p[1]-m.p[1])*sn,-(p[0]-m.p[0])*sn+(p[1]-m.p[1])*cs,p[2]]);assert.ok(basket.length);
 assert.ok(Math.abs(Math.max(...basket.map(p=>p[0]))-Math.min(...basket.map(p=>p[0]))-.28)<1e-7,'basket approved .28 width');assert.ok(Math.abs(Math.max(...basket.map(p=>p[2]))-Math.min(...basket.map(p=>p[2]))-.30)<1e-7,'basket approved .30 height');
});
test('river oar uses approved .48 length/32-degree stroke with its tip present in real paddle mesh',()=>{
 const {ctx,art}=setup();for(const t of [0,.8,2.4]){const m=ctx.GroundEasternWorld.motion('eastern_li_river',t),b=m.boat;assert.ok(Math.abs(b.oar)<=32*Math.PI/180+1e-10,'river stroke not generic35-degree stroke');assert.ok(b.oarRoot&&b.oarTip,'draw and test share actual oar contact kinematics');assert.ok(Math.abs(Math.hypot(...b.oarTip.map((n,k)=>n-b.oarRoot[k]))-.48)<1e-8);const p=ctx.GroundEasternWorld.at(b,b.oarTip);assert.ok(art.model('eastern_li_river',t,false).flat().some(f=>f.points.some(q=>Math.hypot(...q.map((n,k)=>n-p[k]))<1e-8)));}
});
test('close view retains current face base and full selected envelope; spec permits cropping other rear faces',()=>{
 for(const [w,h]of [[856,626],[356.8,429]]){const {ctx,art,view}=setup(w,h),atlas=art.suites.eastern.atlasOf;for(const face of Object.keys(atlas)){const v=view(face,true);for(const p of ctx.HabitatFraming.points(art,atlas,ctx.CubeState.create(),face)){const q=v.cam.project(p);assert.ok(q[0]>=8&&q[0]<=w-8&&q[1]>=8&&q[1]<=h-8,face+' current scenery/base cannot be cropped');}}}
});
test('river camera reduces real path foreshortening at desktop/mobile without increasing the authored boat displacement',()=>{
 for(const size of [[856,626],[356.8,429]])for(const low of [false,true]){
  const s=setup(...size),a=s.art.suites.eastern.angles.NX,saved=Array.from(a),span=v=>{const p=[0,4.8].map(t=>v.project(s.ctx.GroundEasternWorld.motion('eastern_li_river',t).boat.p));return Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);},now=span(s.view('NX',low));
  a[low?2:0]=low?-22:-12;a[low?3:1]=low?27:40;const previous=span(s.view('NX',low));for(let i=0;i<saved.length;i++)a[i]=saved[i];
  assert.ok(now>previous*1.1,'a measurable >10% screen-path gain, not faster or enlarged boat motion');
 }
});
test('waterlane boat crosses the actual bridge span twice per cycle and its sampled mesh clears the authored inner arch',()=>{
 const {ctx,art}=setup(),id='eastern_waterlane',bx=-.55;
 const sides=art.model(id,0,true).flat().filter(f=>['#acb4a2','#8d9b8d'].includes(f.color)&&f.points.every(p=>Math.abs(Math.abs(p[0]-bx)-.18)<1e-8));assert.ok(sides.length);
 const archCeiling=y=>{const hits=[];for(const f of sides)for(let i=0;i<f.points.length;i++){const a=f.points[i],b=f.points[(i+1)%f.points.length];if(Math.abs(b[1]-a[1])<1e-10)continue;const u=(y-a[1])/(b[1]-a[1]);if(u>=0&&u<=1)hits.push(a[2]+u*(b[2]-a[2]));}return Math.min(...hits);};
 let crossings=0,last=1,min=Infinity,inside=0;
 for(let i=0;i<=192;i++){const t=i*.05,m=ctx.GroundEasternWorld.motion(id,t),sign=Math.sign(m.boat.p[0]-bx);if(sign!==last){crossings++;last=sign;}
  for(const p of art.model(id,t,false).flat().flatMap(f=>f.points))if(Math.abs(p[0]-bx)<.18-1e-6){inside++;const ceiling=archCeiling(p[1]);assert.ok(Number.isFinite(ceiling),'actual mesh arch opening is above boat');min=Math.min(min,ceiling-p[2]);assert.ok(p[2]<ceiling,'boat geometry must not pierce arch');}
 }
 console.log('WATERLANE_ARCH_CLEARANCE '+JSON.stringify({crossings,sampledVertices:inside,min}));assert.equal(crossings,2);assert.ok(inside>0);
});
test('bell readability changes keep approved .23 belly width and .82 hinge instead of enlarging the actor',()=>{
 const {ctx,art}=setup(),m=ctx.GroundEasternWorld.motion('eastern_zentemple',.8),v=art.model('eastern_zentemple',.8,false).flat().filter(f=>['#ba9458','#e0bf78','#ffe0a0'].includes(f.color)).flatMap(f=>f.points).map(p=>(p[0]+.72)*Math.cos(m.bell)-(p[2]-.82)*Math.sin(m.bell));assert.ok(Math.abs(Math.max(...v)-Math.min(...v)-.23)<1e-7,'actual bell belly must retain approved .23 width');assert.deepEqual(Array.from(m.bellPoint([0,0,0])),[-.72,-.28,.82]);
});
