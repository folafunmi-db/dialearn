import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import * as A from '../vendor/anatomy/audit.mjs';
import * as k from '../vendor/anatomy/iso-kit.mjs';
// Anatomy inspection offsets: every assembly retains its original scale and
// orientation. Offsets are relative to its assembled position, never a parts grid.
// Fixed infrastructure is a conceptual section lift, not a maintenance procedure.
const catalogue=JSON.parse(readFileSync('lib/advanced-catalogue.json'));
const plans=existsSync('lib/exploded-poses.json')?JSON.parse(readFileSync('lib/exploded-poses.json')):{};
const signature=m=>createHash('sha256').update(JSON.stringify(m.parts.map(p=>[p.kind,p.F,p.poly,p.s0,p.s1,p.part,p.component,p.inspectionOffset,...(p.phiLength?[p.phiStart,p.phiLength,p.cut]:[])]))).digest('hex');
const offsets={
 'dslr-camera':{body:[0,0,0],mount:[0,-55,0],lens:[0,-100,0],mirror:[0,-65,0],shutter:[0,45,25],sensor:[0,85,25],viewfinder:[0,0,90],processor:[75,0,20],battery:[0,0,100],storage:[0,0,120],controls:[0,140,0]},
 'wrist-watch':{case:[0,0,0],barrel:[0,0,30],train:[0,0,65],hands:[0,0,175],escapement:[0,0,95],balance:[0,0,125],crown:[60,0,0],jewels:[0,0,150],bridges:[0,0,200],regulator:[-65,0,90]}
};
for(const device of catalogue.devices){
 if(process.env.ANATOMY_DEVICE&&process.env.ANATOMY_DEVICE!==device.id)continue;
 const path=`public/art/${device.id}`,model=JSON.parse(readFileSync(path+'-model.json')),drawing=JSON.parse(readFileSync(path+'.json'));
 const P=k.fitProjection(model.bounds,560,560,{pad:48,azimuth:model.azimuth,elevation:model.elevation});
 const assemblies=device.parts.map(part=>{const members=model.parts.filter(s=>(s.component||s.part)===part.id),core=members.filter(s=>!s.inspectionOffset),solids=core.length?core:members;if(!solids.length)throw Error(`${device.id}: no geometry for ${part.id}`);const b=solids.map(A.boundsOf);const min=[0,1,2].map(j=>Math.min(...b.map(v=>v.min[j]))),max=[0,1,2].map(j=>Math.max(...b.map(v=>v.max[j])));return {part,solids,min,max,centre:min.map((v,j)=>(v+max[j])/2)};});
 const lo=[0,1,2].map(j=>Math.min(...assemblies.map(v=>v.min[j]))),hi=[0,1,2].map(j=>Math.max(...assemblies.map(v=>v.max[j]))),centre=lo.map((v,j)=>(v+hi[j])/2),span=Math.max(...hi.map((v,j)=>v-lo[j]));
 const plan=plans[device.id]?.signature===signature(model)?plans[device.id].offsets:null;
 model.study={};const points=[];
 for(const [i,item] of assemblies.entries()){
  const known=offsets[device.id]?.[item.part.id];const original=item.solids.find(s=>s.move?.some(v=>v!==0))?.move;
  // Existing removal axes take precedence. Other assemblies lift outward from
  // the object centre, with a small depth tier to expose nested components.
  let offset=plan?.[item.part.id]||known||original||item.centre.map((v,j)=>(v-centre[j])*.85+(j===2?(i%4)*span*.16:0));
  if(i===0&&!known&&!plan)offset=[0,0,0];
  if(offset.every(v=>Math.abs(v)<.1)&&i>0)offset[2]=span*.25;
  model.study[item.part.id]={scale:1,offset};
  const zero=k.iso([0,0,0],P),lift=k.iso(offset,P),dx=lift[0]-zero[0],dy=lift[1]-zero[1];
  for(const g of drawing.filter(g=>g.id===item.part.id)){const extra=g.inspectionOffset?k.iso(g.inspectionOffset,P):null;g.study=extra?`translate(${(extra[0]-zero[0]).toFixed(3)} ${(extra[1]-zero[1]).toFixed(3)})`:`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`;g.lift=g.study;}
  for(const amount of [0,1])for(const x of [item.min[0],item.max[0]])for(const y of [item.min[1],item.max[1]])for(const z of [item.min[2],item.max[2]])points.push(k.iso([x+offset[0]*amount,y+offset[1]*amount,z+offset[2]*amount],P));
 }
 const origin=k.iso([0,0,0],P),axes=[[1,0,0],[0,1,0],[0,0,1]].map(v=>{const p=k.iso(v,P);return [p[0]-origin[0],p[1]-origin[1]];});
 const motions=model.parts.filter(s=>s.motion).map(s=>({m:s.motion,p:k.iso(s.motion.pivot,P)}));
 for(const g of drawing)g.svg=g.svg.replace(/ data-motion='[^']*'/g,'').replace(/data-spin="([^"]+)" data-ratio="([^"]+)"/g,(all,basis,ratio)=>{const b=basis.split(',').map(Number),match=motions.find(v=>Math.abs(v.p[0]-b[4])<.001&&Math.abs(v.p[1]-b[5])<.001&&v.m.ratio===Number(ratio));return match?`${all} data-motion='${JSON.stringify({...match.m,axes})}'`:all;});
 delete drawing[0].studyLabels;
 for(const solid of model.parts.filter(s=>s.inspectionOffset)){const b=A.boundsOf(solid);for(const amount of [0,1])for(const x of [b.min[0],b.max[0]])for(const y of [b.min[1],b.max[1]])for(const z of [b.min[2],b.max[2]])points.push(k.iso([x+solid.inspectionOffset[0]*amount,y+solid.inspectionOffset[1]*amount,z+solid.inspectionOffset[2]*amount],P));}
 const min=[0,1].map(j=>Math.min(...points.map(p=>p[j]))-28),max=[0,1].map(j=>Math.max(...points.map(p=>p[j]))+28);
 drawing[0].explodedFrame=[min[0],min[1],max[0]-min[0],max[1]-min[1]].map(v=>Number(v.toFixed(3)));
 for(const solid of model.parts){delete solid._b;delete solid._f;}
 writeFileSync(path+'-model.json',JSON.stringify(model));writeFileSync(path+'.json',JSON.stringify(drawing));
 console.log(`${device.id}: ${device.parts.length} relative exploded assemblies`);
}
