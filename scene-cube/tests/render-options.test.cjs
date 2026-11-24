const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const render=require('../scripts/render.cjs');
const script=path.resolve(__dirname,'../scripts/render.cjs');
const input=path.resolve(__dirname,'../assets/starter/index.html');

test('export options explicitly select the default natural suite in the URL and stay silent',()=>{
 assert.equal(typeof render.exportSettings,'function','pure export settings must be testable without launching a browser');
 const settings=render.exportSettings(input,{}),entry=new URL(settings.entry);
 assert.equal(settings.suite,'natural');assert.equal(settings.audioFile,null);
 assert.equal(entry.searchParams.get('suite'),'natural');assert.equal(entry.searchParams.get('export'),'1');
 assert.equal(decodeURIComponent(entry.pathname),input);
});
test('original export URL and explicit audio preserve suite and file paths',()=>{
 const audio='../assets/gravity-foley.flac',settings=render.exportSettings('/tmp/scene with spaces/index.html',{suite:'original',audio});
 const entry=new URL(settings.entry);assert.equal(settings.suite,'original');assert.equal(entry.searchParams.get('suite'),'original');
 assert.equal(settings.audioFile,path.resolve(audio));assert.equal(entry.searchParams.get('export'),'1');assert.match(settings.entry,/scene%20with%20spaces/);
 assert.equal(render.exportSettings(input,{suite:'original'}).audioFile,null);
});
test('natural refuses the original foley track and invalid suite/query filenames fail clearly',()=>{
 for(const suite of [undefined,'natural'])assert.throws(()=>render.exportSettings(input,{suite,audio:'scene-cube/assets/gravity-foley.flac'}),/natural.*silent|audio.*original/i);
 assert.throws(()=>render.exportSettings(input,{suite:'invalid'}),/invalid suite/i);
 assert.throws(()=>render.exportSettings(input+'?suite=original',{}),/--suite/);
});
test('CLI documents suite selection and rejects invalid/audio-mismatched requests before browser loading',()=>{
 const run=args=>spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
 const help=run(['--help']);assert.equal(help.status,0);assert.match(help.stdout,/--suite/);
 for(const [args,message]of [[[input,'/tmp/world-cube-invalid-unused.mp4','--suite','invalid'],/invalid suite/i],[[input,'/tmp/world-cube-invalid-unused.mp4','--audio','scene-cube/assets/gravity-foley.flac'],/natural.*silent|audio.*original/i]]){
  const output=run(args);assert.equal(output.status,1);assert.match(output.stderr,message);assert.doesNotMatch(output.stderr,/Install Playwright|Cannot find module/);
 }
});
test('production export examples select original explicitly for bundled foley and natural without audio',()=>{
 const text=fs.readFileSync(path.resolve(__dirname,'../references/production.md'),'utf8');
 const commands=text.split('\n').filter(line=>line.startsWith('node scripts/render.cjs'));
 assert.ok(commands.some(line=>line.includes('--suite natural')&&!line.includes('--audio')));
 const audioCommands=commands.filter(line=>line.includes('gravity-foley.flac'));assert.ok(audioCommands.length);
 for(const line of audioCommands)assert.ok(line.includes('--suite original'));
});
