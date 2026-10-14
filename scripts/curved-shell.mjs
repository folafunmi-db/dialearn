import * as k from '../vendor/anatomy/iso-kit.mjs';
import * as G from '../vendor/anatomy/lathe.mjs';
// Closed half-lathe surfaces, shaded from their actual world-space normals.
// Split at the shell seam so hidden internals can interleave in SVG depth order.
export function halfLatheSvg(F,poly,P,start){
 const end=start+Math.PI,V=G.viewOf(P),L=G.lightOf(P),faces=[];
 const profile=[...poly,poly[0]];
 for(let j=0;j<profile.length-1;j++)for(let i=0;i<48;i++){
  const a=start+i*Math.PI/48,b=a+Math.PI/48,[s0,r0]=profile[j],[s1,r1]=profile[j+1];
  const radial=G.radialOf(F,(a+b)/2),normal=G.unit3(G.add3(G.mul3(F.a,-(r1-r0)),G.mul3(radial,s1-s0)));
  faces.push({points:[G.pointOf(F,s0,r0,a),G.pointOf(F,s1,r1,a),G.pointOf(F,s1,r1,b),G.pointOf(F,s0,r0,b)],normal});
 }
 for(const [angle,sign] of [[start,-1],[end,1]])faces.push({points:poly.map(([s,r])=>G.pointOf(F,s,r,angle)),normal:G.mul3(G.tangentOf(F,angle),sign)});
 const visible=faces.filter(f=>G.dot3(f.normal,V)>1e-6).sort((a,b)=>a.points.reduce((s,p)=>s+G.dot3(p,V),0)/a.points.length-b.points.reduce((s,p)=>s+G.dot3(p,V),0)/b.points.length),all=visible.map(f=>k.pathOf(f.points.map(p=>k.iso(p,P)),true));
 const shades=[0,1,2,3,4].map(band=>visible.filter(f=>G.bandOf(G.dot3(f.normal,L))===band).map(f=>k.pathOf(f.points.map(p=>k.iso(p,P)),true)).join(''));
 // Only boundary edges have an outline, never tessellation seams.
 const edgeMap=new Map();for(const f of faces)for(let i=0;i<f.points.length;i++){const a=f.points[i],b=f.points[(i+1)%f.points.length],key=[a.map(v=>v.toFixed(4)).join(','),b.map(v=>v.toFixed(4)).join(',')].sort().join('|');const entry=edgeMap.get(key)||{a,b,seen:[]};entry.seen.push(G.dot3(f.normal,V)>1e-6);edgeMap.set(key,entry);}
 const outline=[...edgeMap.values()].filter(e=>e.seen.some(Boolean)&&(e.seen.length===1||e.seen.some(v=>!v))).map(e=>k.pathOf([k.iso(e.a,P),k.iso(e.b,P)],false)).join('');
 const svg='<g class="iso-solid" data-seamless="">'+visible.map(f=>{const band=G.bandOf(G.dot3(f.normal,L));return `<path class="${band===4?'iso-top':'iso-shade'}" data-shade="${band}" d="${k.pathOf(f.points.map(p=>k.iso(p,P)),true)}"/>`;}).join('')+`<path class="iso-line iso-edge" data-tone="mid" d="${outline}"/></g>`;
 return {svg,fill:all.join(''),outline,crease:'',top:shades[4],shades:shades.slice(0,4),seamless:true};
}
