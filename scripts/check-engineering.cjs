const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dialearn-check-'));
try {
 for(const name of ['content','stages','devices','deep-parts','maker-devices','circuit-devices','engineering-guides','engineering-models','advanced-devices','mechanism-motion','anatomy-batches']){
  const compiled=ts.transpileModule(fs.readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText.replace(/require\("\.\/([^"/]+)"\)/g,'require("./$1.cjs")');fs.writeFileSync(path.join(dir,name+'.cjs'),compiled.replace('.json.cjs','.json'));
 }
 fs.copyFileSync('lib/advanced-catalogue.json',path.join(dir,'advanced-catalogue.json'));
 const {devices,deviceSources}=require(path.join(dir,'devices.cjs')),{details}=require(path.join(dir,'stages.cjs')),{sources,order}=require(path.join(dir,'content.cjs')),{engineeringGuides}=require(path.join(dir,'engineering-guides.cjs')),{models}=require(path.join(dir,'engineering-models.cjs'));
 const refs=new Set([...sources,...deviceSources].map(s=>s.id));
 for(const device of devices){assert.equal(new Set(device.parts.map(p=>p.id)).size,device.parts.length,device.id+' duplicate parts');for(const part of device.parts)for(const ref of part.refs)assert(refs.has(ref),device.id+': missing reference '+ref);}
 for(const [id,guide] of Object.entries(engineeringGuides)){
  const parts=id==='phone'?[...order,...details.map(d=>d.id)]:devices.find(d=>d.id===id).parts.map(p=>p.id);
  for(const part of guide.path)assert(parts.includes(part),id+': invalid trace '+part);
  for(const ref of guide.refs)assert(refs.has(ref),id+': invalid guide reference '+ref);
  const model=JSON.parse(fs.readFileSync(`public/art/${id}-model.json`));const depicted=new Set(model.parts.flatMap(p=>[p.part,p.component].filter(Boolean)));
  for(const part of parts)assert(depicted.has(part)||['touch','ratio','contacts','spokes','cables'].includes(part),id+': missing geometry '+part);
  for(const p of model.parts.filter(p=>p.motion)){assert(p.motion.axis.every(Number.isFinite));assert(Math.abs(Math.hypot(...p.motion.axis)-1)<1e-10);assert(p.motion.pivot.every(Number.isFinite));}
 }
 for(const [id,m] of Object.entries(models))for(const value of [m.min,m.initial,m.max])assert(Number.isFinite(m.result(value).value),id+' invalid result');
 assert.equal(models.controller.result(0).value,0);assert.equal(models.controller.result(5).value,1023);assert.equal(models.drone.result(8).value,4*models.drone.result(4).value);assert.equal(models.car.result(0).value,0);assert.equal(models['arduino-rover'].result(100).value,6);assert.equal(models['pi-station'].result(60).value,1440);assert.equal(models['plant-waterer'].result(0).value,0);assert(Math.abs(models.console.result(60).value-1000/60)<1e-10);
 const {mechanismPose}=require(path.join(dir,'mechanism-motion.cjs'));
 const piston={pivot:[0,0,76],axis:[0,1,0],ratio:1,mode:'piston',radius:10,rodLength:38},rod={...piston,pivot:[0,0,35],mode:'rod'};
 assert.equal(mechanismPose(piston,0).offset[2],0);assert.equal(mechanismPose(piston,Math.PI).offset[2],-20);
 for(let i=0;i<=72;i++){const phase=i*Math.PI/36,p=mechanismPose(piston,phase),r=mechanismPose(rod,phase);assert(Number.isFinite(p.offset[2]));const tipX=r.offset[0]+38*Math.sin(r.angle),tipZ=35+r.offset[2]+38*Math.cos(r.angle);assert(Math.abs(tipX)<1e-9);assert(Math.abs(tipZ-(73+p.offset[2]))<1e-9,'Rod and piston pin must remain aligned through a full revolution');}
 assert(Math.abs(mechanismPose({...piston,mode:'oscillate',amplitude:.3},Math.PI/2).angle-.3)<1e-10);
 for(const d of devices.filter(d=>d.complex)){const model=JSON.parse(fs.readFileSync(`public/art/${d.id}-model.json`));assert.equal(new Set(model.parts.map(p=>p.component).filter(Boolean)).size,d.parts.length,d.id+' must depict every named component');if(d.hasMotion)assert(model.parts.some(p=>p.motion),d.id+' missing mechanism motion');}
 const {geometryBatchKey}=require(path.join(dir,'anatomy-batches.cjs'));
 const sample={part:'fan',component:'fan',stage:'engineering',move:[0,0,0],motion:{pivot:[0,0,10],axis:[0,0,1],ratio:1}};
 for(const changed of [{...sample,component:'shaft'},{...sample,stage:'foundations'},{...sample,move:[0,0,20]},{...sample,motion:{...sample.motion,pivot:[20,0,10]}}])assert.notEqual(geometryBatchKey(sample,0),geometryBatchKey(changed,0),'Batching must preserve independent selection, visibility and movement');
 assert.equal(geometryBatchKey(sample,0),geometryBatchKey({...sample,part:'hardware-fan-2'},0),'Pieces of the same selectable assembly may batch together');
 assert.notEqual(geometryBatchKey(sample,0),geometryBatchKey({...sample,inspectionOffset:[20,0,0]},0),'Independent cover movement must remain distinct');
 assert.notEqual(geometryBatchKey(sample,0),geometryBatchKey(sample,1),'Different materials must stay distinct');
 const jet=JSON.parse(fs.readFileSync('public/art/turbofan-model.json'));assert(new Set(jet.parts.map(p=>geometryBatchKey(p,0))).size<80,'Dense turbine must batch into assembly meshes');
 console.log(`Validated all ${Object.keys(engineeringGuides).length} guides, trace paths, references, component IDs, motion axes and teaching-model boundary values.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
