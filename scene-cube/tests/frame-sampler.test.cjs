const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'../assets/starter/frame-sampler.js');
if(fs.existsSync(file))require(file);
const context={suite:'natural',viewport:[1280,800],stage:[856,626]};
test('read-only RAF sampler computes actual median/p90 from recorded intervals including slow frames',()=>{
 assert.equal(typeof global.FrameSampler,'function');const sampler=FrameSampler();
 [0,10,30,60,160].forEach(t=>sampler.record(t,context));const out=sampler.read();
 assert.equal(out.samples,4);assert.equal(out.medianMs,25);assert.equal(out.p90Ms,100);assert.equal(out.suite,'natural');
 assert.deepEqual(out.viewport,[1280,800]);assert.deepEqual(out.stage,[856,626]);
 out.viewport[0]=5;assert.deepEqual(sampler.read().viewport,[1280,800],'snapshot cannot mutate recorded context');
});
test('suite/viewport changes and explicit reset do not mix sampling batches',()=>{
 assert.ok(global.FrameSampler);const s=FrameSampler();[0,16,32].forEach(t=>s.record(t,context));
 s.record(500,{...context,suite:'original'});assert.equal(s.read().samples,0);s.record(520,{...context,suite:'original'});assert.equal(s.read().medianMs,20);
 s.record(900,{...context,suite:'original',viewport:[390,844]});assert.equal(s.read().samples,0);
 s.reset();assert.equal(s.read().samples,0);assert.equal(s.read().medianMs,null);
});
