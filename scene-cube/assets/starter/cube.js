"use strict";

(() => {
  const resolution=CubeHabitats.resolveSuite(location.search);
  const supported=document.getElementById("world").getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true});
  // One generation spans the pre-controller bootstrap and all later selections.
  let suiteRequest=0,activeControls=null,resolveStartup,rejectStartup;
  const startupReady=new Promise((resolve,reject)=>{resolveStartup=resolve;rejectStartup=reject;});
  function start(initialSuite,initialNotice="") {
  const $ = id => document.getElementById(id);
  const stage = $("world");
  const params = new URLSearchParams(location.search);
  const exportMode = params.has("export");
  const diagnostics=params.has("diagnostics")&&!exportMode?FrameSampler():null;
  let suite = initialSuite;
  let loading=false;
  const suiteButtons = CubeHabitats.availableSuites();
  function markSuite(){for(const key of suiteButtons) $("suite-"+key).setAttribute("aria-pressed",String(key===suite));}
  markSuite();
  $("suite-status").hidden=!initialNotice;$("suite-status").textContent=initialNotice;
  document.body.classList.toggle("export", exportMode);
  const gl = supported;
  if (!gl) {
    $("fallback").hidden = false;
    for (const id of ["play","seek","reset","positive","negative","undo","close-view",...suiteButtons.map(key=>"suite-"+key)]) $(id).disabled = true;
    return;
  }

  if(diagnostics){
    $("performance").hidden=false;
    $("performance").textContent="RAF 采样中…";
    document.addEventListener?.("visibilitychange",()=>{if(document.hidden)diagnostics.pause();});
  }
  const duration = 19.2;
  const quarter = Math.PI/2;
  const state = CubeState;
  const art = CubeHabitats;
  const faces = Object.entries(state.faces);
  // Renderer closes over this object: mutate its entries, never replace it.
  const atlasOf = {...art.suites[suite].atlasOf};
  let sceneById = new Map(art.suites[suite].scenes.map(scene => [scene.id, scene]));
  const portrait=GroundCamera.habitat;
  const azimuth={PY:24,PZ:16,PX:-23,NX:18,NZ:26,NY:-16};
  const naturalAngles={PY:[12,34],PZ:[14,42],PX:[40,32],NX:[-12,32],NZ:[22,40],NY:[-24,38]};
  function sceneView(face,low){
    const original=portrait(face,azimuth[face]+(low?16:0),low?26:40,low?1.40:1.21,low?1.78:1.43);
    if(art.suites[suite].angles){
      const [a,h,la,lh,x,y]=art.suites[suite].angles[face];
      return HabitatFraming.fit(portrait(face,low?la:a,low?lh:h,low?1.30:1.21,low?1.78:1.43,low?x:0,low?y:0),HabitatFraming.points(art,atlasOf,cubies,low?face:null),stage.clientWidth,stage.clientHeight,getCamera);
    }
    if(suite!=="natural"||low)return original;
    const [a,h]=naturalAngles[face];
    return HabitatFraming.fit(portrait(face,a,h,1.21,1.43),HabitatFraming.points(art,atlasOf,cubies),stage.clientWidth,stage.clientHeight,getCamera);
  }
  const axisIndex = {x:0,y:1,z:2};
  const sceneTitle = key => sceneById.get(key)?.name || key;
  const faceOrder = ["PZ","PX","PY","NX","NZ","NY"];
  const initial = state.create();
  const beats = [
    {start:2.48,end:3.22,move:{axis:"x",layer:1,dir:1},cue:"右侧林地带着树干翻到海底一侧"},
    {start:3.46,end:4.17,move:{axis:"x",layer:1,dir:-1},cue:"溪岸随右层回到山谷"},
    {start:7.08,end:7.78,move:{axis:"y",layer:0,dir:-1},cue:"礁鲨所在的中层转入湖湾"},
    {start:8.10,end:8.80,move:{axis:"y",layer:0,dir:1},cue:"海床与湖岸各自复位"},
    {start:12.10,end:12.80,move:{axis:"z",layer:-1,dir:-1},cue:"拱根和河床一同转过九十度"},
    {start:13.12,end:13.82,move:{axis:"z",layer:-1,dir:1},cue:"沉木与虾群回到原来的方位"}
  ];
  const wide=[.58,.52,.93,0,0,.06,0];
  // Separate camera takes keep opposing local gravities readable. A last key
  // followed by a cut holds its exact pose through the end of that take.
  const shots = [
    [0,wide],[.72,portrait("PY",34,34,1.07,.86)],
    [1.57,portrait("PY",18,29,1.81,1.78,-.27,0)],[2.11,portrait("PY",12,30,1.82,1.78,-.28,0)],
    [2.48,[.52,.47,1.00,0,0,.23,.03]],[4.18,[.52,.47,1.00,0,0,.23,.03]],
    [4.20,portrait("PZ",24,35,1.30,1.62),true],[5.70,portrait("PZ",9,31,1.48,1.78,.06,-.02)],
    [6.63,portrait("PZ",-12,36,1.40,1.66)],[7.04,portrait("PZ",-24,43,1.16,1.03)],
    [7.82,portrait("PZ",-35,45,1.08,.84)],
    [7.84,portrait("NX",33,33,1.15,1.48),true],[8.84,portrait("NX",24,38,1.28,1.56)],
    [10.34,portrait("NX",5,28,1.43,1.72)],[10.63,portrait("NX",1,30,1.37,1.67)],
    [10.65,portrait("NZ",23,32,1.35,1.67),true],[11.79,portrait("NZ",7,30,1.43,1.76)],
    [12.14,portrait("NZ",-13,40,1.19,1.25)],[13.83,portrait("NZ",-20,43,1.14,1.11)],
    [13.85,portrait("PX",-25,28,1.61,1.74,.04,-.14),true],[15.48,portrait("PX",-7,33,1.82,1.77,.23,-.32)],
    [15.84,portrait("PX",4,38,1.28,1.55)],
    [15.86,portrait("NY",-28,36,1.38,1.78),true],[17.58,portrait("NY",13,29,1.40,1.76)],
    [18.00,portrait("NY",23,35,1.27,1.51)],[18.02,[.86,.39,.95,0,0,.05,0],true],[19.2,wide]
  ];

  const naturalCues = [
    "右层带着竹梢、棕榈和细雪一同翻转",
    "雪地与溪岸随右层回到原位",
    "中层带走石桥和沿溪漂流的竹叶",
    "石桥、沙路和低云随中层复位",
    "后层带着黑岩、熔岩沟和火星翻转",
    "火山口与上升的灰烟回到原来的方位"
  ];
  const naturalBeats = beats.map((beat,i)=>({...beat,cue:naturalCues[i]}));
  const naturalShots = [
    [0,wide],[.72,portrait("PY",30,34,1.07,1.00)],
    [1.57,portrait("PY",15,29,1.48,1.78,-.12,.03)],[2.11,portrait("PY",9,30,1.49,1.78,-.12,.03)],
    [2.48,[.52,.47,1.00,0,0,.23,.03]],[4.18,[.52,.47,1.00,0,0,.23,.03]],
    [4.20,portrait("PZ",24,35,1.24,1.58),true],[5.70,portrait("PZ",12,29,1.42,1.72,.02,-.08)],
    [6.63,portrait("PZ",-12,36,1.32,1.62)],[7.04,portrait("PZ",-24,43,1.12,1.08)],
    [7.82,portrait("PZ",-35,45,1.05,.88)],
    [7.84,portrait("NX",31,32,1.16,1.67),true],[8.84,portrait("NX",23,32,1.26,1.74)],
    [10.34,portrait("NX",7,28,1.32,1.84,.02,.02)],[10.63,portrait("NX",2,30,1.29,1.79)],
    [10.65,portrait("NZ",23,32,1.28,1.64),true],[11.79,portrait("NZ",7,30,1.34,1.71)],
    [12.14,portrait("NZ",-13,40,1.15,1.24)],[13.83,portrait("NZ",-20,43,1.10,1.10)],
    [13.85,portrait("PX",-25,30,1.34,1.68,.04,-.10),true],[15.48,portrait("PX",-7,33,1.46,1.74,.11,-.18)],
    [15.84,portrait("PX",4,38,1.24,1.55)],
    [15.86,portrait("NY",-24,31,1.27,1.64),true],[17.58,portrait("NY",12,28,1.38,1.72)],
    [18.00,portrait("NY",23,32,1.23,1.54)],[18.02,[.86,.39,.95,0,0,.05,0],true],[19.2,wide]
  ];
  let easternShotCache=null;
  function easternShots(){
    const key=suite+":"+stage.clientWidth+":"+stage.clientHeight;if(easternShotCache?.key===key)return easternShotCache.shots;
    let scene=initial;const points=[];
    for(const beat of beats){
      for(const angle of [0,Math.PI/8,Math.PI/4,Math.PI*3/8,Math.PI/2])points.push(...HabitatFraming.points(art,atlasOf,scene,null,beat.move,beat.move.dir*angle));
      scene=state.turn(scene,beat.move);
    }
    const fit=view=>HabitatFraming.fit(view,points,stage.clientWidth,stage.clientHeight,getCamera);
    const frames=[[0,fit(wide)]];
    for(const [i,face]of ["PY","PZ","NX","NZ","PX","NY"].entries()){
      const [a,h]=art.suites[suite].angles[face],view=fit(portrait(face,a,h,1.21,1.43));
      frames.push([i===0?.72:i*3.0+.72,view,i>0,face],[Math.min(18.1,(i+1)*3+.70),view,false,face]);
    }
    frames.push([18.8,fit(wide)],[19.2,fit(wide)]);easternShotCache={key,shots:frames};return frames;
  }
  const selectedShots = ()=>art.suites[suite].angles?easternShots():suite==="natural"?naturalShots:shots;
  const easternBeats=beats.map((beat,i)=>({...beat,cue:["右层带着东方山水的地面与景物翻转","右层的屋檐与地面回到原位","中层带着东方山水的地面与景物翻转","中层景物随地面复位","后层带着东方山水的地面与景物翻转","后层景物回到原来的方位"][i]}));
  const suiteBeats=Object.fromEntries(Object.entries(art.suites).filter(([,def])=>def.cues).map(([key,def])=>[key,beats.map((beat,i)=>({...beat,cue:def.cues[i]}))]));
  const selectedBeats = ()=>suiteBeats[suite]??(art.suites[suite].angles?easternBeats:suite==="natural"?naturalBeats:beats);

  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const clamp = (x,a=0,b=1) => Math.min(b,Math.max(a,x));
  const ease = t => { const q=clamp(t); return q*q*(3-2*q); };
  const turnEase = t => { const q=ease(t); return ease(q*.7+t*.3); };
  const now = () => performance.now()/1000;
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  const thumbnailButtons = new Map();

  const renderer=HabitatRenderer(gl,art,atlasOf);
  const getCamera=renderer.getCamera;
  let lastView,pickable=[];
  function paint(cubies,move,angle,view,t){
    const shortSide=Math.max(1,Math.min(stage.clientWidth,stage.clientHeight));
    const density=Math.min(exportMode?1:devicePixelRatio,800/shortSide);
    const result=renderer.paint(cubies,move,angle,view,t,stage,density);
    lastView=result.camera;pickable=result.picks;
  }

  function shotAt(t) {
    const shots=selectedShots();
    const next=shots.findIndex(k=>k[0]>t);
    if(next===-1) return shots.at(-1)[1].slice();
    const a=shots[Math.max(next-1,0)],b=shots[next];
    if(b[2])return a[1].slice();
    const f=ease((t-a[0])/(b[0]-a[0]));
    return GroundCamera.between(a[1],b[1],f);
  }
  function sample(t) {
    let cubies=initial, cue="";
    for (const beat of selectedBeats()) {
      if(t<beat.start) break;
      if(t<beat.end) {
        const progress=(t-beat.start)/(beat.end-beat.start);
        return {cubies,move:beat.move,angle:beat.move.dir*quarter*turnEase(progress),cue:beat.cue};
      }
      cubies=state.turn(cubies,beat.move);
      cue=beat.cue;
    }
    return {cubies,cue};
  }
  function visibleFace(view) {
    // A fitted camera can center near the cube origin. Focus-vector inference
    // then chooses a neighbour despite an intentionally authored face portrait.
    if(art.suites[suite].angles&&demoMode){
      let target;for(const key of selectedShots()){if(key[0]>t)break;target=key[3];}
      if(target)return target;
    }
    if(suite!=="original"&&!demoMode&&focusedFace)return focusedFace;
    const focus=view.slice(4,7);
    const dir=Math.hypot(...focus)>.65?focus:getCamera(view,1,1).eye;
    return faces.reduce((best,item)=>dot(item[1].normal,dir)>dot(best[1].normal,dir)?item:best)[0];
  }
  function readFace(cubies,name) {
    const stickers=state.faceLayout(cubies,name);
    const counts=new Map();
    for(const sticker of stickers) counts.set(sticker.face,(counts.get(sticker.face)||0)+1);
    const lead=[...counts].sort((a,b)=>b[1]-a[1])[0];
    const anchor=stickers[0];
    const aligned=lead[1]===9&&stickers.every(sticker=>{
      if(sticker.turns!==anchor.turns) return false;
      let {col,row}=sticker;
      for(let i=0;i<sticker.turns;i++) [col,row]=[2-row,col];
      return col===sticker.targetCol&&row===sticker.targetRow;
    });
    return {id:atlasOf[lead[0]],count:lead[1],parts:counts.size,aligned};
  }
  let lastInspector="";
  function inspect(cubies,view,move,cue) {
    const name=visibleFace(view);
    const {id,count,parts,aligned}=readFace(cubies,name);
    const overview=Math.hypot(...view.slice(4,7))<.30&&!move&&aligned;
    const key=[id,count,parts,aligned,overview,move?.axis,move?.layer,move?.dir,cue,name].join("|");
    if(key===lastInspector) return;
    lastInspector=key;
    const scene=sceneById.get(id);
    document.documentElement.style.setProperty("--accent",scene.color);
    $("scene-kind").textContent=overview?"六面全景":aligned?"生态景观已对齐":parts===1?"景观朝向错位":"生态景观重组";
    $("scene-name").textContent=overview?"六面引力":sceneTitle(id);
    $("scene-description").textContent=overview?(art.suites[suite].overview??(suite==="eastern"?"粉墙、梯田、雪院与海崖，六处东方山水随九格转动。":suite==="natural"?"六处自然奇境，九格各成天地。拧动一层，雪、竹叶与低云随地面一起翻转。":"每面的九格拼成一块地面。拧动一层，树干、落叶和海底的气泡都会随那块地面转向。")):aligned
      ?(scene.description||scene.caption)
      : parts===1?"九格来自同一景观。转动方向改变后，接缝也会随之改变。"
      : `这一面拼着 ${parts} 处不同景观，其中 ${count} 格来自「${sceneTitle(id)}」。`;
    $("stage-state").textContent=move?"生境随方块转动":aligned?"生态景观已对齐":"生态景观已重组";
    $("feedback").textContent=move
      ? (cue||`${move.axis.toUpperCase()} 轴 · ${move.layer} 层 · ${move.dir===1?"+":"−"}90°`)
      : (cue||"可用任意转轴和层进行组合。");
    for (const [face,button] of thumbnailButtons) button.setAttribute("aria-pressed",String(!overview&&face===name));
  }

  let t=0, cubies=initial, view=shotAt(0), lastManualCue="";
  let playing=false, demoMode=true, animation=null, cameraMove=null;
  let closeView=false,focusedFace=null,pendingFit=false;
  let startTime=0, lastManualTime=0, manualStart=0, raf=0;
  let pointer=null;
  const history=[];
  const $play=$("play"),$seek=$("seek");
  $seek.max=String(duration);
  function playerText() {
    $play.textContent=playing?"Ⅱ 暂停":"▶ 播放演示";
    $seek.value=t;
    $("time").value=`${t.toFixed(2).padStart(5,"0")} / ${duration}`;
    $("undo").disabled=animation!==null||history.length===0;
  }
  function drawDemo(time) {
    t=clamp(Number(time)||0,0,duration);
    const shot=sample(t);
    const camera=shotAt(t);
    paint(shot.cubies,shot.move,shot.angle,camera,t);
    if(!exportMode) {
      inspect(shot.cubies,camera,shot.move,shot.cue);
      playerText();
    }
  }
  function applyPendingFit(){
    if(!pendingFit||cameraMove||animation)return;
    pendingFit=false;
    if(suite==="original"||!focusedFace||(closeView&&!art.suites[suite].angles)||demoMode)return;
    if(art.suites[suite].angles){view=sceneView(focusedFace,closeView);return;}
    const resizeView=view.slice();resizeView[2]=1.21;
    view=HabitatFraming.fit(resizeView,HabitatFraming.points(art,atlasOf,cubies),stage.clientWidth,stage.clientHeight,getCamera);
  }
  function drawManual(clock,advanceCamera=true) {
    const modelTime=lastManualTime+(motionPreference.matches?0:clock-manualStart);
    if (cameraMove&&advanceCamera) {
      const u=clamp((clock-cameraMove.start)/cameraMove.duration);
      view=GroundCamera.between(cameraMove.from,cameraMove.to,ease(u));
      if (u===1) cameraMove=null;
    }
    if (animation) {
      const active=animation;
      const u=clamp((clock-active.start)/active.duration);
      if (u===1) {
        cubies=state.turn(cubies,active.move);
        if (active.remember) history.push(active.move);
        lastManualCue=`${active.move.axis.toUpperCase()} 轴 · ${active.move.layer} 层已转 ${active.move.dir>0?"+":"−"}90°`;
        animation=null;
      }
      applyPendingFit();
      paint(cubies,animation?.move,active.move.dir*quarter*turnEase(u),view,modelTime);
    } else {
      applyPendingFit();
      paint(cubies,null,0,view,modelTime);
    }
    inspect(cubies,view,animation?.move,animation?"":lastManualCue);
    playerText();
  }
  function refresh(clock) {
    raf=0;
    if(diagnostics){
      const count=diagnostics.record(clock,{suite,viewport:[globalThis.innerWidth,globalThis.innerHeight],stage:[stage.clientWidth,stage.clientHeight]});
      if(count&&count%60===0){
        const measured=diagnostics.read();
        $("performance").textContent=`RAF ${measured.samples} 帧 · 中位 ${measured.medianMs.toFixed(1)} ms · P90 ${measured.p90Ms.toFixed(1)} ms · ${measured.viewport.join("×")} · ${suite}`;
      }
    }
    if(playing){
      const time=clock/1000-startTime;
      if(time>=duration) playing=false;
      drawDemo(time);
      if(!playing&&!motionPreference.matches)toManual();
    } else if(!demoMode) {
      drawManual(clock/1000);
    }
    if(playing || (!demoMode && (!motionPreference.matches || animation || cameraMove))) schedule();
  }
  function schedule(){ if(!raf) raf=requestAnimationFrame(refresh); }
  function toManual() {
    if(!demoMode) return;
    playing=false;
    demoMode=false;
    const pose=sample(t);
    cubies=pose.move&&Math.abs(pose.angle)>quarter*.5?state.turn(pose.cubies,pose.move):pose.cubies;
    view=shotAt(t);
    lastManualTime=t;
    manualStart=now();
    lastManualCue="";
    history.length=0;
  }
  function turn(move,remember=true) {
    toManual();
    if (animation) return false;
    if (motionPreference.matches) {
      cubies=state.turn(cubies,move);
      if(remember) history.push(move);
      lastManualCue=`${move.axis.toUpperCase()} 轴 · ${move.layer} 层已转 ${move.dir>0?"+":"−"}90°`;
      drawManual(now());
    } else {
      animation={move,remember,start:now(),duration:.55};
      schedule();
    }
    return true;
  }
  function look(face,near=closeView) {
    toManual();
    if (animation) return;
    closeView=near;
    focusedFace=face;pendingFit=false;
    $("close-view").setAttribute("aria-pressed",String(closeView));
    const goal=sceneView(face,near);
    if(motionPreference.matches) {
      view=goal;
      drawManual(now());
    } else {
      cameraMove={from:view,to:goal,start:now(),duration:.64};
      schedule();
    }
  }
  function inside([x,y],points) {
    let sign=0;
    for(let i=0;i<points.length;i++){
      const a=points[i], b=points[(i+1)%points.length];
      const k=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);
      if(Math.abs(k)<.01) continue;
      const direction=Math.sign(k);
      if(sign&&direction!==sign)return false;
      sign=direction;
    }
    return true;
  }
  function moveForPick(hit,dx,dy) {
    const base=lastView.project(hit.anchor);
    const options=[];
    for(const [axis,index] of Object.entries(axisIndex)){
      if(Math.abs(hit.normal[index])>.9) continue;
      const moved=lastView.project(state.rotate(hit.anchor,axis,.12));
      const rx=moved[0]-base[0], ry=moved[1]-base[1];
      const length=Math.hypot(rx,ry);
      if(length<.01) continue;
      const agreement=(rx*dx+ry*dy)/length;
      options.push({axis,layer:hit.cubie.pos[index],dir:agreement<0?-1:1,score:Math.abs(agreement)});
    }
    options.sort((a,b)=>b.score-a.score);
    return options[0];
  }
  function loadingUI(value){
    loading=value;stage.setAttribute("aria-busy",String(value));
    for(const id of ["positive","negative","undo","close-view","play","seek","axis","layer"])$(id).disabled=value;
    for(const button of thumbnailButtons.values())button.disabled=value;
    if(!value)playerText();
  }
  function reset(cancelRequest=true) {
    if(cancelRequest){suiteRequest++;loadingUI(false);}
    if(diagnostics){diagnostics.reset();$("performance").textContent="RAF 采样中…";}
    if(raf){cancelAnimationFrame(raf);raf=0;}
    if(pointer){
      const id=pointer.id;pointer=null;
      if(stage.hasPointerCapture?.(id))stage.releasePointerCapture(id);
    }
    playing=false;
    demoMode=false;
    animation=null;
    cameraMove=null;
    closeView=false;focusedFace=null;pendingFit=false;
    $("close-view").setAttribute("aria-pressed","false");
    history.length=0;
    t=0;cubies=state.create();view=shotAt(0);
    lastManualCue="";lastInspector="";
    lastManualTime=0;manualStart=now();
    drawManual(manualStart);
    if(!motionPreference.matches)schedule();
  }
  function selectSuite(key){
    const request=++suiteRequest;
    if(key===suite&&!loading)return;
    const commit=()=>{
      loadingUI(false);suite=key;easternShotCache=null;
      Object.assign(atlasOf,art.suites[suite].atlasOf);
      sceneById=new Map(art.suites[suite].scenes.map(scene=>[scene.id,scene]));
      markSuite();buildThumbnails();reset(false);
      $("suite-status").hidden=true;
      const url=new URL(location.href);url.searchParams.set("suite",suite);historyAPI(url);
    };
    if(art.isReady(key)){commit();return;}
    if(raf){cancelAnimationFrame(raf);raf=0;}
    if(pointer){if(stage.hasPointerCapture?.(pointer.id))stage.releasePointerCapture(pointer.id);pointer=null;}
    playing=false;animation=null;cameraMove=null;pendingFit=false;
    if(demoMode){const sampleNow=sample(t);cubies=sampleNow.cubies;view=shotAt(t);demoMode=false;}
    lastManualTime=0;manualStart=now();drawManual(manualStart,false);loadingUI(true);
    $("suite-status").hidden=false;$("suite-status").textContent="正在加载"+art.suites[key].name+"…";
    art.ensureSuite(key).then(()=>{if(request===suiteRequest)commit();},()=>{
      if(request!==suiteRequest)return;loadingUI(false);reset(false);
      $("suite-status").hidden=false;$("suite-status").textContent="套装加载失败，当前套装仍可使用；可再次点击重试。";
    });
  }
  function historyAPI(url){window.history?.replaceState(null,"",url.href);}
  function setDemo(t,play) {
    if(loading)return;
    focusedFace=null;pendingFit=false;
    animation=null;
    cameraMove=null;
    demoMode=true;
    playing=play;
    history.length=0;
    if (play) startTime=now()-t;
    drawDemo(t);
    if (play) schedule();
  }
  function buildThumbnails() {
    thumbnailButtons.clear();
    $("scene-list").replaceChildren();
    for (const face of faceOrder) {
      const id=atlasOf[face];
      const button=document.createElement("button"), thumb=document.createElement("canvas");
      button.type="button";
      button.setAttribute("aria-label",`巡视${sceneTitle(id)}的初始方位`);
      button.setAttribute("aria-pressed","false");
      button.addEventListener("click",()=>look(face));
      thumb.width=108; thumb.height=72;
      thumb.setAttribute("aria-hidden","true");
      const ctx=thumb.getContext("2d");
      art.thumbnail(ctx,id);
      const name=document.createElement("span");
      name.textContent=sceneTitle(id);
      button.append(thumb,name);
      $("scene-list").append(button);
      thumbnailButtons.set(face,button);
    }
  }
  function configure() {
    buildThumbnails();
    const moveFromControls=dir=>({axis:$("axis").value,layer:Number($("layer").value),dir});
    $("positive").addEventListener("click",()=>turn(moveFromControls(1)));
    $("negative").addEventListener("click",()=>turn(moveFromControls(-1)));
    $("undo").addEventListener("click",()=>{
      const move=history.at(-1);
      if(move&&turn(state.inverse(move),false)) history.pop();
      playerText();
    });
    $("close-view").addEventListener("click",()=>{
      const face=visibleFace(demoMode?shotAt(t):view);
      look(face,!closeView);
    });
    $seek.addEventListener("input",()=>setDemo(Number($seek.value),false));
    $play.addEventListener("click",()=>{
      if (playing) {
        playing=false;
        playerText();
      } else {
        setDemo(demoMode&&t<duration-.01?t:0,true);
      }
    });
    stage.addEventListener("pointerdown",event=>{
      if(loading||event.button!==0||animation||pointer) return;
      const rect=stage.getBoundingClientRect(), point=[event.clientX-rect.left,event.clientY-rect.top];
      const hit=playing?null:pickable.find(item=>inside(point,item.points));
      toManual();
      cameraMove=null;
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY,view:view.slice(),hit,done:false};
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove",event=>{
      if(!pointer||pointer.id!==event.pointerId||pointer.done) return;
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      if(pointer.hit) {
        if(Math.hypot(dx,dy)<12) return;
        const move=moveForPick(pointer.hit,dx,dy);
        if(move) {
          pointer.done=true;
          turn({axis:move.axis,layer:move.layer,dir:move.dir});
        }
      } else {
        view=[pointer.view[0]-dx*.009,clamp(pointer.view[1]+dy*.009,-1.53,1.53),...pointer.view.slice(2)];
        drawManual(now());
        schedule();
      }
    });
    for(const eventName of ["pointerup","pointercancel","lostpointercapture"]){
      stage.addEventListener(eventName,event=>{
        if(pointer?.id===event.pointerId) pointer=null;
      });
    }
    stage.addEventListener("keydown",event=>{
      if(loading)return;
      if (!"wasd".includes(event.key.toLowerCase())||event.key.length!==1) return;
      event.preventDefault();
      toManual();
      cameraMove=null;
      const key=event.key.toLowerCase();
      view=[view[0]+.2*((key==="d")-(key==="a")),clamp(view[1]+.18*((key==="s")-(key==="w")),-1.53,1.53),...view.slice(2)];
      drawManual(now());
      schedule();
    });
    new ResizeObserver(()=>{
      // Coalesce resize events, including those received during a transition.
      // drawManual consumes this once, after BOTH animations have settled.
      if(suite!=="original"&&focusedFace&&(!closeView||art.suites[suite].angles)&&!demoMode)pendingFit=true;
      easternShotCache=null;
      if(loading)return;
      if(demoMode) drawDemo(t);
      else drawManual(now(),false);
    }).observe(stage.parentElement);
  }
  window.renderAt = time => setDemo(time,false);
  window.sceneCube = Object.freeze({
    duration,ready:startupReady,
    inspect() {
      const active=demoMode?sample(t):{cubies,move:animation?.move};
      const frame=demoMode?shotAt(t):view;
      const face=visibleFace(frame);
      return { suite, loading, mode:demoMode?"demo":"manual", time:t, playing, performance:diagnostics?.read()??null,
        closeView, historyLength:history.length, cameraMoving:cameraMove!==null,
        view:frame.slice(), cue:active.cue||lastManualCue, move:active.move??null, face,
        picture:readFace(active.cubies,face), cubies:structuredClone(active.cubies) };
    }
  });
  activeControls={selectSuite,reset};
  if(!exportMode) configure();
  drawDemo(0);
  if(!exportMode&&!motionPreference.matches){toManual();schedule();}
  }
  function beginInitial(key,notice="",rewrite=false){
    const request=++suiteRequest;
    const commit=(chosen,message,error)=>{
      if(request!==suiteRequest)return;
      start(chosen,message);
      if(rewrite){const url=new URL(location.href);url.searchParams.set("suite",chosen);window.history?.replaceState(null,"",url.href);}
      if(error&&new URLSearchParams(location.search).has("export"))rejectStartup(error);else resolveStartup();
    };
    if(CubeHabitats.isReady(key)){commit(key,notice);return;}
    const status=document.getElementById("suite-status");status.hidden=false;status.textContent="正在加载"+CubeHabitats.suites[key].name+"…";
    CubeHabitats.ensureSuite(key).then(()=>commit(key,notice),error=>commit("natural","套装加载失败，当前显示自然奇境。",error));
  }
  // These intent listeners must exist before the first asynchronous dependency.
  // Reset before any world is active cancels the requested suite into natural.
  if(!new URLSearchParams(location.search).has("export")){
    for(const key of CubeHabitats.availableSuites())document.getElementById("suite-"+key).addEventListener("click",()=>{
      if(activeControls)activeControls.selectSuite(key);else beginInitial(key,"",true);
    });
    document.getElementById("reset").addEventListener("click",()=>{
      if(activeControls)activeControls.reset();else beginInitial("natural","",true);
    });
  }
  window.sceneCube={ready:startupReady};
  beginInitial(supported?resolution.suite:"natural",resolution.notice);
})();
