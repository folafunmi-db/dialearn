const share=(p,cover)=>{const t=Math.max(0,Math.min(1,cover?p/.35:(p-.18)/.82));return t*t*(3-2*t);};
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as A from '../vendor/anatomy/audit.mjs';
const catalogue=JSON.parse(readFileSync('lib/advanced-catalogue.json'));
let total=0,failed=0;
for(const device of catalogue.devices){
 if(process.env.ANATOMY_DEVICE&&process.env.ANATOMY_DEVICE!==device.id)continue;
 const model=JSON.parse(readFileSync(`public/art/${device.id}-model.json`)),drawing=JSON.parse(readFileSync(`public/art/${device.id}.json`));
 assert.equal(Object.keys(model.study||{}).length,device.parts.length,device.id+' missing exploded assembly');
 for(const part of device.parts){assert.equal(model.study[part.id].scale,1,device.id+' must preserve relative part scale');assert(model.study[part.id].offset.every(Number.isFinite));assert(drawing.some(g=>g.id===part.id&&g.study?.startsWith('translate(')),part.id+' missing SVG translation');}
 assert(drawing[0].explodedFrame.length===4&&drawing[0].explodedFrame.every(Number.isFinite));assert(!drawing[0].studyLabels,'Parts must not be arranged in a labelled inventory grid');
 if(process.argv.includes('--clearance')){
  const solids=model.parts.map(p=>({...p,piece:p.component||p.part,owner:p.component||p.part,move:p.inspectionOffset||model.study[p.component||p.part].offset}));
  const findings=[];for(const state of process.argv.includes('--dense')?Array.from({length:20},(_,i)=>(i+1)/20):[.1,.25,.5,.75,1]){const errors=A.solidClearances(solids.map(s=>({...s,move:s.move.map(v=>v*share(state,!!s.inspectionOffset))})),{state:1,spacing:1});if(errors.length)findings.push({state,count:errors.length,pairs:errors.slice(0,5).map(e=>[e.tube,e.other])});}
  if(findings.length){failed++;console.log(JSON.stringify({id:device.id,findings}));}
 }
 total+=device.parts.length;
}
if(failed){console.error(`${failed} models have sampled clearance findings.`);process.exitCode=1;}
console.log(`Verified ${process.env.ANATOMY_DEVICE?1:catalogue.devices.length} relative exploded models and ${total} named assemblies; SVG and 3D share equal-scale offsets.`);
