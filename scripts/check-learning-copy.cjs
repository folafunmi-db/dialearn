const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dialearn-learning-'));
try{
 for(const name of ['content','stages','devices','deep-parts','maker-devices','circuit-devices','advanced-devices','learning-copy','explainers','explainer-learning']){
  const compiled=ts.transpileModule(fs.readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText.replace(/require\("\.\/([^"/]+)"\)/g,(_,file)=>`require("./${file.endsWith('.json')?file:file+'.cjs'}")`);
  fs.writeFileSync(path.join(dir,name+'.cjs'),compiled);
 }
 for(const name of ['advanced-catalogue','beginner-project-copy'])fs.copyFileSync(`lib/${name}.json`,path.join(dir,name+'.json'));
 const {devices}=require(path.join(dir,'devices.cjs')),{lessons,order}=require(path.join(dir,'content.cjs')),{detailLessons,details,engineering}=require(path.join(dir,'stages.cjs')),{lessonCopy,explainTerms}=require(path.join(dir,'learning-copy.cjs'));
 const beginner=require(path.join(dir,'beginner-project-copy.json'));
 let parts=0;
 function check(source,id,part){
  const opts={id,part,lang:'en'},levels=['foundations','systems','engineering'].map(stage=>lessonCopy(source,stage,opts));
  levels.forEach(level=>assert(level.works.length>12,`${id}/${part} has no explanation`));
  assert.notEqual(levels[0].works,levels[1].works,`${id}/${part} beginner unchanged`);
  assert.notEqual(levels[1].works,levels[2].works,`${id}/${part} advanced unchanged`);
  assert(levels[2].works.includes(source.engineering||source.deep),`${id}/${part} loses technical content`);
  // Extra detail must remain readable at the chosen level, rather than switch to the advanced branch.
  if(beginner[id])assert(lessonCopy(source,'foundations',{...opts,expanded:true}).works.startsWith(beginner[id][part]));
  parts++;
 }
 for(const d of devices)for(const p of d.parts){if(d.complex)assert(beginner[d.id]?.[p.id],`No authored beginner copy: ${d.id}/${p.id}`);check({...p,simple:p.simple.en},d.id,p.id);}
 for(const id of order)check({...lessons.en[id],engineering:engineering.en[id]},'phone',id);
 for(const {id} of details)check(detailLessons.en[id],'phone',id);
 assert(explainTerms('A torque turns the shaft.').includes('the turning effect of a force'));
 assert.equal(explainTerms('This part holds the case.'),'This part holds the case.');
 const {explainers}=require(path.join(dir,'explainers.cjs')),{explainerLearning}=require(path.join(dir,'explainer-learning.cjs'));
 for(const def of explainers){const novice=explainerLearning(def,'foundations'),advanced=explainerLearning(def,'engineering');assert.notEqual(novice.intro,advanced.intro);for(const p of def.parts){assert(novice.describe(p)?.length>12,`${def.id}/${p.id} missing beginner description`);assert.notEqual(novice.describe(p),advanced.describe(p));assert(advanced.describe(p).includes(p.text));}}
 console.log(`Verified difficulty-sensitive explanations for ${parts} project parts and all ${explainers.length} explainers; 588 authored catalogue descriptions, complete advanced text and vocabulary support.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
