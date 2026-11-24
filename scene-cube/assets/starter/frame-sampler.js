"use strict";

// Opt-in, read-only observations of the application's existing RAF callbacks.
// No synthetic frames, fixed FPS claims, app-driving events or outlier removal.
globalThis.FrameSampler=()=>{
  let last=null,key=null,metadata=null,intervals=[];
  function reset(){last=null;key=null;metadata=null;intervals=[];}
  function pause(){last=null;}
  function record(time,context){
    const next=JSON.stringify([context.suite,context.viewport,context.stage]);
    if(next!==key){reset();key=next;metadata={suite:context.suite,viewport:context.viewport.slice(),stage:context.stage.slice()};}
    if(last!==null&&time>last){intervals.push(time-last);if(intervals.length>12000)intervals.shift();}
    last=time;return intervals.length;
  }
  function read(){
    const sorted=intervals.slice().sort((a,b)=>a-b),n=sorted.length;
    return {suite:metadata?.suite??null,viewport:metadata?.viewport.slice()??null,stage:metadata?.stage.slice()??null,samples:n,
      medianMs:n?(sorted[Math.floor((n-1)/2)]+sorted[Math.floor(n/2)])/2:null,p90Ms:n?sorted[Math.ceil(n*.9)-1]:null};
  }
  return Object.freeze({record,read,reset,pause});
};
