"use strict";

// Each image is an original top-down ground material in the exact coordinates
// of the scene. The banks, sandbars and trails continue across the nine cells.
globalThis.GroundSurfaces=(()=>{
  const size=240,cache=new Map();
  const clamp=n=>Math.max(0,Math.min(1,n));
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*clamp(t));
  const hash=(i,j)=>{const n=Math.imul(i+137,1597334677)^Math.imul(j+391,3812015801);return ((Math.imul(n^(n>>>16),2246822519)>>>0)/4294967296);};
  const fade=x=>x*x*(3-2*x);
  function field(x,y,k){
    const u=x*k+24.73,v=y*k+37.26,i=Math.floor(u),j=Math.floor(v),a=fade(u-i),b=fade(v-j);
    return (1-a)*((1-b)*hash(i,j)+b*hash(i,j+1))+a*((1-b)*hash(i+1,j)+b*hash(i+1,j+1));
  }
  const water=(x,y)=>Math.sin(21*x+4.6*y+2*Math.sin(y*8))*.52+Math.sin(10*y-3*x+1.4*Math.cos(x*8))*.48;
  const naturalPalettes={
          snow:[[179,208,219],[237,246,238],[45,119,119],[111,184,169],[152,175,176]],
          oasis:[[192,139,68],[244,207,130],[23,85,83],[54,138,126],[163,151,91]],
          bamboo:[[53,94,60],[131,161,99],[37,102,104],[112,174,157],[134,152,113]],
          firefly:[[76,91,54],[125,135,78],[24,57,53],[59,102,82],[107,116,70]],
          volcano:[[40,45,49],[98,91,79],[178,51,24],[255,145,48],[115,71,49]],
          island:[[104,147,83],[184,200,125],[104,149,170],[176,203,209],[135,159,124]]
        };
  function get(id){
    if(cache.has(id))return cache.get(id);
    const eastern=globalThis.GroundEastern?.palettes?.[id]?.map(hex=>{const n=parseInt(hex.slice(1),16);return [n>>16,n>>8&255,n&255];});
    if(id.startsWith("eastern_")&&!eastern)throw Error("Eastern material not ready: "+id);
    const fantasy=globalThis.GroundFantasy?.palettes?.[id]?.map(hex=>{const n=parseInt(hex.slice(1),16);return [n>>16,n>>8&255,n&255];});
    if(id.startsWith("fantasy_")&&!fantasy)throw Error("Fantasy material not ready: "+id);
    const civilizations=globalThis.GroundCivilizations?.palettes?.[id]?.map(hex=>{const n=parseInt(hex.slice(1),16);return [n>>16,n>>8&255,n&255];});
    if(id.startsWith("civ_")&&!civilizations)throw Error("Civilization material not ready: "+id);
    const canvas=document.createElement("canvas");canvas.width=canvas.height=size;
    const ctx=canvas.getContext("2d"),img=ctx.createImageData(size,size);
    for(let j=0;j<size;j++)for(let i=0;i<size;i++){
      const x=3*(i+.5)/size-1.5,y=1.5-3*(j+.5)/size;
      const f=field(x,y,2.0)*.48+field(x,y,5.1)*.32+field(x,y,12.5)*.20;
      const fine=field(x,y,31),salt=hash(i,j),vein=water(x,y);
      let c;
      if(civilizations){
        const shore=GroundCivilizations.surface(id,x,y),[a,b,wa,wb]=civilizations;
        c=shore>=0?mix(a,b,f):mix(wa,wb,f);
        if(shore<0&&vein>.76)c=mix(c,[194,221,202],.26);
        if(id==="civ_greenhouse"&&(Math.abs(x*8-Math.round(x*8))<.06||Math.abs(y*8-Math.round(y*8))<.06))c=mix(c,[46,70,75],.45);
        if(id==="civ_caravan"&&Math.abs(y+.85)<.32)c=mix(c,[177,155,121],.44);
      }else if(fantasy){
        const shore=GroundFantasy.surface(id,x,y),[a,b,wa,wb]=fantasy;
        c=shore>=0?mix(a,b,f):mix(wa,wb,f);
        if(shore<0&&vein>.76)c=mix(c,[187,219,215],.28);
        if(id==="fantasy_starspring"&&shore>=0&&salt>.965)c=mix(c,[239,216,151],.67);
        if(id==="fantasy_dragon"&&fine>.60)c=mix(c,[233,243,238],.30);
      }else if(eastern){
        const shore=GroundEastern.surface(id,x,y),[a,b,wa,wb]=eastern;
        c=shore>=0?mix(a,b,f):mix(wa,wb,f);
        if(shore<0&&vein>.76)c=mix(c,[184,210,195],.28);
        if(id==="eastern_zentemple"&&fine>.58)c=mix(c,[244,246,231],.36);
      }else if(Object.hasOwn(naturalPalettes,id)){
        const shore=GroundNatural.surface(id,x,y);
        const [a,b,wa,wb,edge]=naturalPalettes[id];
        c=shore>=0?mix(edge,mix(a,b,f),clamp(shore*12)):mix(edge,mix(wa,wb,f),clamp(-shore*14));
        if(shore<-.04&&vein>.76)c=mix(c,id==="volcano"?[255,202,91]:[186,214,183],.35);
        if(id==="oasis"&&shore>0){const crest=Math.sin(y*43+x*13+field(x,y,3)*5);if(crest>.87)c=mix(c,[255,224,157],.32);}
        if(id==="snow"&&shore>0&&fine>.64)c=mix(c,[251,255,247],.43);
        if(id==="volcano"&&shore>.04&&salt>.93)c=mix(c,[140,117,88],.32);
      }else if(id==="autumn"||id==="lake"){
        const autumn=id==="autumn",shore=GroundValley.surface(id,x,y);
        const greenery=autumn?mix([89,101,57],[161,144,76],f):mix([55,86,61],[129,130,75],f);
        const sand=autumn?[167,145,98]:[195,158,109];
        const wet=autumn?mix([55,99,94],[106,158,139],f):mix([51,110,127],[99,158,156],f);
        c=shore>=0?mix(sand,greenery,shore*9):mix(sand,wet,-shore*(autumn?18:11));
        if(shore<-.04){
          const bands=Math.sin((x*.40+y)*40+5*field(x,y,2));
          c=mix(c,autumn?[166,188,151]:[237,191,124],(bands>.82&&fine>.58?.43:0));
          if(!autumn)c=mix(c,[228,185,125],.25*Math.exp(-3*(x+.20-y*.40)**2));
        }else if(autumn){
          const path=.07*Math.sin(y*4)-.47+.34*Math.max(0,-y);
          c=mix(c,[166,131,87],clamp(1-Math.abs(x-path)/.11)*.69);
          if(salt>.94&&fine>.52)c=mix(c,[213,133,60],.58);
        }
      }else if(id==="reef"){
        const lane=Math.exp(-1.9*(y-x*.40+.03)**2);
        c=mix(mix([46,112,113],[105,151,126],f),mix([171,170,115],[235,212,148],f),.16+.73*lane);
        if(vein>.78)c=mix(c,[238,225,165],.49);
      }else if(id==="root"){
        c=mix([45,74,68],[129,123,79],f*.9+.08*Math.sin(x*3+y*4));
        if(vein>.84)c=mix(c,[160,157,104],.34);
      }else if(id==="marsh"){
        c=mix([33,66,72],[91,135,119],.87*f+.1*Math.sin(y*4+x*2));
        c=mix(c,[152,176,145],.17*Math.exp(-3*(x+.3-y*.63)**2));
        if(fine>.63&&Math.sin(y*57+x*.75+field(x,y,3)*3)>.72)c=mix(c,[163,187,163],.37);
      }else{
        c=mix([27,55,79],[69,117,119],f);
        if(vein>.77)c=mix(c,[106,168,158],.29);
      }
      const grit=(salt-.5)*10+(fine-.5)*12;
      const k=(j*size+i)*4;
      for(let h=0;h<3;h++)img.data[k+h]=c[h]+grit;
      img.data[k+3]=255;
    }
    ctx.putImageData(img,0,0);cache.set(id,canvas);return canvas;
  }
  return {get};
})();
