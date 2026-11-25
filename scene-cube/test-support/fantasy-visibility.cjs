const {setup}=require('./fantasy.cjs');
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
function span(forms,project){const ps=forms.flatMap(f=>f.points.map(project));return [0,1].map(k=>Math.max(...ps.map(p=>p[k]))-Math.min(...ps.map(p=>p[k])));}
// Emitted actual quads after the provider's shoreline exclusion, before nine-cell
// partition. Adjacent triangles reconstruct their true silhouette, not a radius proxy.
function rings(ctx,t){const forms=[];ctx.GroundFantasy.draw('fantasy_crystal',{static(){},face(points,color,alpha=1){if(color==='#d6fcf4'&&alpha>=.5)forms.push({points,color,alpha});}},t);const out=[];for(let i=0;i<forms.length;i+=2){const a=forms[i],b=forms[i+1];out.push([a.points[0],a.points[1],a.points[2],b.points[2]]);}return out;}
// Normal separation of the two true inner/outer contour edges at corresponding
// segment stations. Radial spokes between adjacent retained sectors are internal
// tessellation, not silhouette. Shoreline end-cap corner width tends to zero for
// any polygon and is not the ring-band thickness definition.
function normalThickness(quad,project,u=.5){const p=quad.map(project),along=(a,b)=>a.map((n,k)=>n*(1-u)+b[k]*u),inner=along(p[0],p[3]),outer=along(p[1],p[2]),tangent=[(p[3][0]-p[0][0]+p[2][0]-p[1][0])/2,(p[3][1]-p[0][1]+p[2][1]-p[1][1])/2],l=Math.hypot(...tangent),normal=[-tangent[1]/l,tangent[0]/l];return Math.abs(dot(sub(outer,inner),normal));}
const ringColors=new Set(['#d4c6a0','#95917e','#b5aa8d','#737c72']);
const excludedDragon=new Set(['#819fac','#adc6cf','#d8e2dd','#93b9cf','#d3e2e5','#6e96b2','#e1f8f6','#a5dcea']);
// Ellipsoid egg colors use the unchanged builder's rounded shade rule. No nest,
// floor, ice peaks, eggs, or breath sheet contributes to the dragon width mask.
for(let level=0;level<=150;level++){const c=0xe8e7d6,channel=v=>Math.round(Math.min(255,v*level/100)).toString(16).padStart(2,'0');excludedDragon.add('#'+channel(c>>16)+channel(c>>8&255)+channel(c&255));}
const dragon=forms=>forms.filter(f=>f.alpha>=.995&&!excludedDragon.has(f.color));
module.exports={setup,span,rings,normalThickness,ringColors,dragon};
