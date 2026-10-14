const share=(p,cover)=>{const t=Math.max(0,Math.min(1,cover?p/.35:(p-.18)/.82));return t*t*(3-2*t);};
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as A from '../vendor/anatomy/audit.mjs';
const catalogue=JSON.parse(fs.readFileSync('lib/advanced-catalogue.json'));
const signature=m=>createHash('sha256').update(JSON.stringify(m.parts.map(p=>[p.kind,p.F,p.poly,p.s0,p.s1,p.part,p.component,p.inspectionOffset,...(p.phiLength?[p.phiStart,p.phiLength,p.cut]:[])]))).digest('hex');
const plans=fs.existsSync('lib/exploded-poses.json')?JSON.parse(fs.readFileSync('lib/exploded-poses.json')):{};
const states=process.env.ANATOMY_DENSE?Array.from({length:20},(_,i)=>(i+1)/20):[.1,.25,.5,.75,1];let unresolved=0;
for(const d of catalogue.devices){
 if(process.env.ANATOMY_DEVICE&&process.env.ANATOMY_DEVICE!==d.id)continue;
 if(process.env.ANATOMY_DEVICES&&!process.env.ANATOMY_DEVICES.split(',').includes(d.id))continue;
 const m=JSON.parse(fs.readFileSync(`public/art/${d.id}-model.json`));if(!m.study)throw Error('Run generate-breakdowns first');
 const solids=m.parts.map(p=>({...p,owner:p.component||p.part,piece:p.component||p.part,move:p.inspectionOffset||m.study[p.component||p.part].offset}));
 const groups=new Map(d.parts.map(p=>[p.id,solids.filter(s=>s.piece===p.id&&!s.inspectionOffset)])),names=new Map(solids.map(s=>[s.name,s.piece]));
 const bounds=solids.map(A.boundsOf),span=Math.max(...[0,1,2].map(i=>Math.max(...bounds.map(b=>b.max[i]))-Math.min(...bounds.map(b=>b.min[i]))));
 const score=()=>{const errors=states.flatMap(state=>A.solidClearances(solids.map(s=>({...s,move:s.move.map(v=>v*share(state,!!s.inspectionOffset))})),{state:1,spacing:Number(process.env.ANATOMY_CLEARANCE_SPACING||2)}));return {errors,value:errors.reduce((sum,e)=>sum+Math.max(.1,-e.clearance),0)};};
 let current=score();
 for(let pass=0;pass<5&&current.errors.length;pass++){
  let improved=false;const ids=[...new Set(current.errors.flatMap(e=>[names.get(e.tube),names.get(e.other)]))].filter(id=>id&&id!==d.parts[0].id);
  for(const id of ids){
   const group=groups.get(id);if(!group?.length)continue;const original=m.study[id].offset;let best=original,bestScore=current;
   const candidates=[];for(const distance of [.3,.65,1.1,1.7,2.5])for(const axis of [0,1,2])for(const sign of [-1,1]){const v=[0,0,0];v[axis]=span*distance*sign;candidates.push(v);}
   for(const v of candidates){if(Object.entries(m.study).some(([key,p])=>key!==id&&Math.hypot(...v.map((x,i)=>x-p.offset[i]))<span*.025))continue;for(const s of group)s.move=v;const next=score();if(next.value<bestScore.value-1e-6){best=v;bestScore=next;if(!next.errors.length)break;}}
   for(const s of group)s.move=best;m.study[id].offset=best;if(bestScore.value<current.value-1e-6){improved=true;current=bestScore;}
  }
  if(!improved)break;
 }
 const fine=states.flatMap(state=>A.solidClearances(solids.map(s=>({...s,move:s.move.map(v=>v*share(state,!!s.inspectionOffset))})),{state:1,spacing:1}));
 if(fine.length){unresolved++;console.log(`${d.id}: ${fine.length} sampled clearance findings remain`);}else console.log(`${d.id}: sampled intermediate clearances pass`);
 plans[d.id]={signature:signature(m),offsets:Object.fromEntries(Object.entries(m.study).map(([id,p])=>[id,p.offset])),verified:!fine.length};
 fs.writeFileSync('lib/exploded-poses.json',JSON.stringify(plans,null,2));
}
console.log(`Unresolved models: ${unresolved}`);if(unresolved)process.exitCode=1;
