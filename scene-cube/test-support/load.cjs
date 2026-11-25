const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const starter=path.join(__dirname,'../assets/starter');
function load(extra={}){
 const ctx=vm.createContext({console,URL,URLSearchParams,structuredClone,Math,Map,Set,...extra});ctx.window=ctx;
 for(const name of ['cube-state','ground-camera','ground-water','ground-valley','ground-night','ground-natural','suite-catalog','cube-habitats','habitat-renderer','habitat-framing']){
  const file=path.join(starter,name+'.js');if(fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:name+'.js'});
 }return ctx;
}
function eastern(ctx){for(const file of ['eastern-world.js','ground-eastern.js'])vm.runInContext(fs.readFileSync(path.join(starter,file),'utf8'),ctx,{filename:file});return ctx;}
function fantasy(ctx){for(const file of ['fantasy-world.js','ground-fantasy.js'])vm.runInContext(fs.readFileSync(path.join(starter,file),'utf8'),ctx,{filename:file});return ctx;}
module.exports={load,eastern,fantasy,starter};
