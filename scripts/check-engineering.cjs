const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dialearn-check-'));
try {
 for(const name of ['content','stages','devices','deep-parts','maker-devices','circuit-devices','engineering-guides','engineering-models']){
  const compiled=ts.transpileModule(fs.readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText.replace(/require\("\.\/([^"/]+)"\)/g,'require("./$1.cjs")');fs.writeFileSync(path.join(dir,name+'.cjs'),compiled);
 }
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
 console.log('Validated all 12 guides, trace paths, references, component IDs, motion axes and teaching-model boundary values.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
