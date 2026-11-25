const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load,starter}=require('../test-support/load.cjs');
test('catalog preserves legacy lists and registers exactly 30 unique IDs and advertises only implemented suites',()=>{
 const {CubeHabitats:art}=load();assert.equal(Object.keys(art.suites).length,5);
 assert.equal(art.suites.original.scenes,art.scenes);assert.equal(art.scenes.length,6);
 assert.deepEqual(Array.from(art.availableSuites()),['natural','eastern','fantasy','civilizations','original']);
 const ids=Object.values(art.suites).flatMap(s=>s.scenes.map(x=>x.id));assert.equal(ids.length,30);assert.equal(new Set(ids).size,30);
 for(const s of Object.values(art.suites)){assert.equal(s.scenes.length,6);assert.equal(new Set(Object.values(s.atlasOf)).size,6);}
});
test('URL defaults, first duplicate value, unknown and unavailable notices are explicit',()=>{
 const art=load().CubeHabitats;
 for(const [s,key]of [['','natural'],['?suite=','natural'],['?suite=original','original'],['?suite=eastern','eastern'],['?suite=eastern&suite=original','eastern']])assert.equal(art.resolveSuite(s).suite,key);
 for(const s of ['?suite=bogus','?suite=unbuilt','?suite=EASTERN']){const r=art.resolveSuite(s);assert.equal(r.suite,'natural');assert.ok(r.notice);}
 assert.throws(()=>art.model('not-a-scene',0,true),/Unknown/);
 assert.throws(()=>art.model('eastern_waterlane',0,true),/not ready/);
});
test('lazy dependencies load once in order; failed network requests retry; unavailable suites never load',async()=>{
 const pending=[];const ctx=load({document:{baseURI:'https://example.test/cube/index.html',createElement:()=>({remove(){}}),head:{appendChild:s=>pending.push(s)}}});const art=ctx.CubeHabitats;
 assert.equal(typeof art.ensureSuite,'function');await assert.rejects(art.ensureSuite('unbuilt'),/unavailable/);assert.equal(pending.length,0);
 const a=art.ensureSuite('eastern'),b=art.ensureSuite('eastern');assert.equal(a,b);await Promise.resolve();assert.equal(pending.length,1);assert.match(pending[0].src,/eastern-world\.js$/);
 pending.shift().onerror();await assert.rejects(a,/load/i);
 const retry=art.ensureSuite('eastern');await Promise.resolve();assert.equal(pending.length,1);
 for(const expected of ['eastern-world.js','ground-eastern.js']){
  const s=pending.shift();assert.ok(s.src.endsWith(expected));
  if(expected==='ground-eastern.js')ctx.GroundEastern={draw(){},bounds(){}};
  s.onload();await new Promise(r=>setImmediate(r));
 }
 await retry;assert.equal(art.isReady('eastern'),true);await art.ensureSuite('eastern');assert.equal(pending.length,0);
});
test('classic lazy scripts resolve under file URLs and an incomplete provider can be retried cleanly',async()=>{
 const pending=[],ctx=load({document:{baseURI:'file:///tmp/world%20cube/index.html',createElement:()=>({remove(){}}),head:{appendChild:s=>pending.push(s)}}}),art=ctx.CubeHabitats;
 const first=art.ensureSuite('eastern');first.catch(()=>{});assert.equal(pending[0].src,'file:///tmp/world%20cube/eastern-world.js');pending.shift().onload();await new Promise(r=>setImmediate(r));pending.shift().onload();await assert.rejects(first,/not ready/);
 const retry=art.ensureSuite('eastern');retry.catch(()=>{});await new Promise(r=>setImmediate(r));assert.equal(pending.length,1,'bad evaluated dependencies must not permanently poison retry');
 pending.shift().onload();await new Promise(r=>setImmediate(r));ctx.GroundEastern={draw(){},bounds(){}};pending.shift().onload();await retry;assert.equal(art.isReady('eastern'),true);
});
test('inherited object property names are unknown suites, never URL targets or loadable providers',async()=>{
 const art=load().CubeHabitats;
 for(const key of ['toString','constructor','__proto__','hasOwnProperty']){
  const result=art.resolveSuite('?suite='+key);assert.equal(result.suite,'natural');assert.ok(result.notice);assert.equal(art.isReady(key),false);await assert.rejects(art.ensureSuite(key),/unavailable/);
 }
});
