"use strict";
((root)=>{
 const faceOrder=['PY','PZ','PX','NX','NZ','NY'];
 const definitions={
  eastern:{name:'东方山水',available:true,provider:'GroundEastern',files:['eastern-world.js','ground-eastern.js'],
   scenes:[
    ['eastern_waterlane','江南水巷','#c37b63','粉墙黛瓦围住弯河，乌篷船穿桥而过，岸边红幡舒卷。'],
    ['eastern_terraces','梯田山寨','#90ad65','木寨架在层层梯田上，大水轮转动，渠水跌入下层田池。'],
    ['eastern_zentemple','雪夜禅寺','#b7cddb','雪院围着敞口钟亭，铜钟缓摆，长幡在蓝雪前翻折。'],
    ['eastern_li_river','漓江渔火','#7fa49a','峭拔峰林让出江道，竹筏逐水缓行，扳罾在渔火前升起。'],
    ['eastern_tea_trail','古道茶山','#a3b97a','茶垄沿丘面起伏，背篓人走过石道，前排茶梢迎风摇动。'],
    ['eastern_seacliff','海崖楼阁','#bfad8a','双檐朱楼坐落海崖，白帆从外海驶过，三道浪脊向岸推进。']].map(([id,name,color,description])=>({id,name,color,description})),
   angles:{PY:[18,40,18,27,0,-.25],PZ:[-18,43,-26,27,0,-.12],PX:[24,38,32,26,-.1,-.25],NX:[-35,46,-35,30,0,-.30],NZ:[20,43,28,28,0,-.15],NY:[-24,41,-32,28,-.20,-.15]}},
  fantasy:{name:'奇幻秘境',available:true,provider:'GroundFantasy',files:['fantasy-world.js','ground-fantasy.js'],
   scenes:[['fantasy_moonshroom','月光菌林','#b3a0e3','紫伞乳褶守着夜溪，三只月蛾巡游振翅，八束明亮孢子沿伞前升起。'],['fantasy_crystal','水晶洞窟','#78c8db','敞口岩窟围着晶桥，两根悬晶在池前回转，三道光环沿水面扩散。'],['fantasy_ruins','浮空遗迹','#c9b88c','收尖石台托住缺口石环，三块方石在环前回旋，前台长幡随风摆动。'],['fantasy_treehouse','巨树书屋','#b89a6c','巨根托住双层书屋，两本展开的书绕屋飞行，门前金灯连绳缓摆。'],['fantasy_starspring','星砂秘泉','#83c5bf','靛砂围着秘泉，十六颗星砂旋升，分叉星石旁的菱形摆锤往复。'],['fantasy_dragon','冰晶龙巢','#b7d9eb','幼龙卧在冰环巢台，连贯长尾舒缓扫动，鼻前六片冰羽周期喷吐。']].map(([id,name,color,description])=>({id,name,color,description})),
   angles:{PY:[18,36,30,26,.0,-.25],PZ:[-16,38,15,25,.05,-.15],PX:[22,35,34,24,.1,-.1],NX:[12,37,25,25,-.15,-.15],NZ:[-18,39,10,26,.0,-.15],NY:[28,36,40,24,.15,-.25]},
   overview:'紫伞、晶桥、断环、巨树、星泉与幼龙，六处奇幻秘境随九格一同转动。',
   cues:['右层带着紫伞、晶桥与回旋石一同翻转','伞褶与断环随右层回到原位','中层带着悬晶与飞书随地面翻转','晶桥和巨树书屋随中层复位','后层带着星砂、冰环与鼻前冰羽翻转','秘泉和冰晶龙巢回到原来的方位']},
  civilizations:{name:'微缩文明',available:true,provider:'GroundCivilizations',files:['civilization-world.js','ground-civilizations.js'],scenes:[['civ_station','蒸汽车站','#bd8266','钟楼守着砖拱车站，六轮蒸汽车往返，吊箱沿刻度升降。'],['civ_farm','风车农庄','#c4b56f','四帆高塔俯瞰扇形麦田，红帆转过塔前，金斗水轮提水。'],['civ_canal','运河集市','#7daba2','曲河穿过砖房与蓝棚，货舟在转船池调头，桅杆旁吊篮起落。'],['civ_mine','矿山工坊','#a4b0ac','三级采壁环着开放工坊，矿斗升降，槽式轭架驱动锻锤。'],['civ_caravan','沙海驿城','#d3ad78','残缺陶墙让出石路，两只驮兽绕城行走，青桶在井旁提升。'],['civ_greenhouse','星际温室','#a0c7b7','六肋穹顶敞开前庭，琥珀灌溉头绕菜床扫描，两片青板翻开。']].map(([id,name,color,description])=>({id,name,color,description})),
   angles:{PY:[12,38,-18,20,0,-.15],PZ:[-16,38,-24,22,0,-.15],PX:[18,44,26,24,0,-.15],NX:[-12,40,-20,24,0,-.15],NZ:[10,44,18,24,0,-.15],NY:[-14,42,-22,24,0,-.15]},
   overview:'砖拱车站、四帆麦田、曲河集市、采场锻锤、陶墙商队与六肋温室，六座微缩文明共同转动。',
   cues:['右层带着蒸汽车、风帆和货舟翻转','车站、麦田和运河随右层归位','中层带着提斗与槽式锻锤翻转','矿山和集市随中层复位','后层带着商队与灌溉头翻转','驿城与温室回到原来的方位']}
 };
 for(const def of Object.values(definitions)){def.atlasOf=Object.fromEntries(faceOrder.map((f,i)=>[f,def.scenes[i].id]));Object.freeze(def);}
 const order=['natural','eastern','fantasy','civilizations','original'];
 const requests=new Map(),scripts=new Map();
 function create(legacy){
  const suites={...legacy,...definitions},ids=new Set();
  for(const def of Object.values(suites))for(const scene of def.scenes??[]){if(ids.has(scene.id))throw Error('Duplicate habitat ID: '+scene.id);ids.add(scene.id);}
  return Object.freeze(suites);
 }
 function available(suites){return order.filter(key=>suites[key]&&suites[key].available!==false);}
 function resolve(search,suites){
  const value=new URLSearchParams(search).get('suite');
  if(!value)return {suite:'natural',notice:''};
  if(Object.hasOwn(suites,value)&&suites[value].available!==false)return {suite:value,notice:''};
  return {suite:'natural',notice:Object.hasOwn(suites,value)?'该套装尚未开放，当前显示自然奇境。':'未识别的套装，当前显示自然奇境。'};
 }
 function isReady(key,suites){const def=Object.hasOwn(suites,key)&&suites[key];return !!def&&def.available!==false&&(!def.provider||typeof root[def.provider]?.draw==="function");}
 function load(key,suites){
  const def=Object.hasOwn(suites,key)&&suites[key];if(!def||def.available===false)return Promise.reject(Error('Suite unavailable: '+key));
  if(isReady(key,suites))return Promise.resolve();
  if(requests.has(key))return requests.get(key);
  function file(name){
   if(scripts.has(name))return scripts.get(name);
   const promise=new Promise((resolve,reject)=>{
    if(!root.document?.head){reject(Error('Cannot load suite without a document'));return;}
    const script=root.document.createElement('script');script.src=new URL(name,root.document.baseURI).href;script.async=false;
    script.onload=resolve;script.onerror=()=>{script.remove?.();reject(Error('Failed to load '+name));};
    root.document.head.appendChild(script);
   }).catch(error=>{scripts.delete(name);throw error;});scripts.set(name,promise);return promise;
  }
  const request=(async()=>{for(const name of def.files)await file(name);if(!isReady(key,suites)){for(const name of def.files)scripts.delete(name);throw Error('Suite provider not ready: '+key);}})().catch(error=>{requests.delete(key);throw error;});
  requests.set(key,request);return request;
 }
 const api={create,available,resolve,load,isReady,definitions};root.SuiteCatalog=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
