// Actual post-partition contact probes shared by tests/local evidence; no authored height proxy.
const {triangles}=require('./mesh-intersection.cjs');
const tol=1e-7;
function topAt(tri,x,y){const[a,b,c]=tri.p,den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-12)return null;const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den;if(u< -tol||v< -tol||u+v>1+tol)return null;return u*a[2]+v*b[2]+(1-u-v)*c[2];}
function railTops(a){const forms=a.model('civ_station',0,true).flat().filter(f=>f.color==='#515e65'),z=Math.max(...forms.flatMap(f=>f.points.map(p=>p[2])));return triangles(forms.filter(f=>f.points.every(p=>Math.abs(p[2]-z)<tol)));}
function caps(forms){return forms.filter(f=>f.color==='#303f4e'&&f.points.every(p=>p[2]<.25)&&f.points.every(p=>Math.abs(p[1]-f.points[0][1])<tol));}
function wheels(forms,x){const faces=caps(forms);return [-.24,0,.24].flatMap(dx=>[-1,1].map(side=>{const selected=faces.filter(f=>f.points.every(p=>Math.abs(p[0]-x-dx)<=.090001&&(p[1]+.60)*side>0)),points=selected.flatMap(f=>f.points),bottom=Math.min(...points.map(p=>p[2]));return {dx,side,forms:selected,points,bottom,contacts:points.filter(p=>Math.abs(p[2]-bottom)<tol)};}));}
module.exports={topAt,railTops,wheels};
