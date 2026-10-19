const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'dialearn-explainers-'));
try{
 const source=ts.transpileModule(fs.readFileSync('lib/explainers.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const file=path.join(temporary,'model.cjs');fs.writeFileSync(file,source);const {explainers,createExperiment,gravity:g,beamDeflection,stringDisplacement,pendulumPeriod}=require(file);
 const storySource=ts.transpileModule(fs.readFileSync('lib/explainer-stories.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const storyFile=path.join(temporary,'stories.cjs');fs.writeFileSync(storyFile,storySource);const {explainerStories,storyTrialPreset}=require(storyFile);
 for(const d of explainers){const story=explainerStories[d.id];assert(story,'Missing guided story: '+d.id);for(const id of story.chain)assert(d.parts.some(p=>p.id===id),'Unknown story component '+id);assert(d.presets[storyTrialPreset[d.id]],'Missing contrasting setup');assert(explainers.some(d=>d.id===story.related),'Invalid related explainer');assert.equal(story.choices.length,2);}
 const near=(a,b,tol=1e-8)=>assert(Math.abs(a-b)<=tol,`${a} differs from ${b}`);
 let samples=0;
 for(const d of explainers){
  assert.equal(new Set(d.parts.map(p=>p.id)).size,d.parts.length);
  for(const preset of d.presets)for(const control of d.controls)assert.equal(typeof preset.inputs[control.key],'number');
  const cases=[...d.presets.map(p=>p.inputs),...d.controls.flatMap(c=>[{...d.initial,[c.key]:c.min},{...d.initial,[c.key]:c.max}])];
  for(const input of cases){const run=createExperiment(d.id,input);assert(run.duration>0&&Number.isFinite(run.duration));for(const t of [0,run.duration/4,run.duration/2,run.duration]){const s=run.sample(t);for(const value of [...Object.values(s.values),...s.metrics.map(m=>m.value)])assert(Number.isFinite(value),d.id+' invalid output');assert.deepEqual(s,run.sample(t),'Replay must be deterministic');samples++;}assert(run.sample(run.duration).done);assert.equal(run.sample(-1).time,0);assert.deepEqual(run.sample(run.duration+100),run.sample(run.duration));}
 }
 const projectile=createExperiment('projectile-launcher',{speed:8,angle:45}),start=projectile.sample(0),land=projectile.sample(projectile.duration);
 near(start.values.y,.8);near(land.values.y,.1);near(land.values.x,land.values.range);near(land.values.vx,start.values.vx);near(.5*(land.values.vx**2+land.values.vy**2)+g*land.values.y,.5*64+g*.8);
 const held=createExperiment('inclined-plane',{angle:25,friction:.6}).sample(1);near(held.values.s,0);near(held.values.friction,held.values.drive);
 const frictionless=createExperiment('inclined-plane',{angle:30,friction:0});near(frictionless.sample(0).values.a,g*.5);near(frictionless.sample(frictionless.duration).values.s,3);
 const pendulum=createExperiment('pendulum-clock',{length:1.4,angle:60}),energy=pendulum.sample(0).values.energy;
 for(let i=0;i<=600;i++)near(pendulum.sample(i/20).values.energy,energy,2e-5);
 assert(pendulumPeriod(1.4,Math.PI/3)>2*Math.PI*Math.sqrt(1.4/g));
 const gyro1=createExperiment('gyroscope',{rpm:1200,arm:.45}).sample(3),gyro2=createExperiment('gyroscope',{rpm:2400,arm:.45}).sample(3);
 near(gyro1.values.precession,2*gyro2.values.precession);near(gyro1.values.torque,gyro1.values.precession*gyro1.values.H);
 for(const n of [1,2,3,4,5])for(const t of [0,.012,.15])for(let j=0;j<=n;j++)near(stringDisplacement(2*j/n,t,{tension:20,harmonic:n}),0);
 const f1=createExperiment('vibrating-string',{tension:10,harmonic:1}).sample(0).values.frequency,f2=createExperiment('vibrating-string',{tension:40,harmonic:1}).sample(0).values.frequency;near(f2,2*f1);
 for(const n of [1,2,4]){const run=createExperiment('pulley-rig',{mass:12,strands:n,pull:1.6});for(const t of [0,2,5]){const s=run.sample(t);near(s.values.inputWork,s.values.outputWork);near(s.values.rise*n,s.values.pull);near(s.values.effort*n,12*g);}}
 const beam=createExperiment('beam-bending',{span:3,load:4000}).sample(2),long=createExperiment('beam-bending',{span:6,load:4000}).sample(2);
 near(beam.values.reaction*2,beam.values.load);near(long.values.deflection,8*beam.values.deflection);near(beamDeflection(0,3,4000),0);near(beamDeflection(3,3,4000),0);near(beamDeflection(.4,3,4000),beamDeflection(2.6,3,4000));near(createExperiment('beam-bending',{span:3,load:0}).sample(2).values.deflection,0);

 // Reverse timeline seeking must sample the same state, independently of visit order.
 for(const d of explainers){const run=createExperiment(d.id,d.initial),middle=run.sample(run.duration*.47);run.sample(run.duration);run.sample(0);assert.deepEqual(run.sample(run.duration*.47),middle);}
 for(const carrier of [0,30,60])for(const left of [-60,0,30,120]){const run=createExperiment('car-differential',{carrier,left});for(const t of [0,1.25,20]){const v=run.sample(t).values;near(v.left+v.right,2*v.carrier);near(v.leftPhase+v.rightPhase,2*v.carrierPhase);near(v.spider,2*(left-carrier));}}
 const recovery=createExperiment('drone-balance',{tilt:20,gain:.8,disturbance:0});assert(Math.abs(recovery.sample(6).values.angle)<Math.PI/180,'PD controller must recover tilt');
 const disabled=createExperiment('drone-balance',{tilt:20,gain:0,disturbance:0});near(disabled.sample(6).values.angle,20*Math.PI/180);near(disabled.sample(3).values.torque,0);
 for(const setup of [{tilt:25,gain:1.6,disturbance:.06},{tilt:-25,gain:0,disturbance:-.06}]){const run=createExperiment('drone-balance',setup);for(let i=0;i<=120;i++){const v=run.sample(i/20).values;near(2*(v.left+v.right),1.2*g);near(2*.6*(v.right-v.left),v.torque);assert(v.left>0&&v.right>0);assert(Math.abs(v.torque)<=1);near(.08*v.acceleration,v.torque+setup.disturbance-.02*v.omega);}}
 const focused=createExperiment('camera-focus',{subject:2,focus:2,aperture:1.8}).sample(0).values;near(focused.blur,0);near(focused.image,focused.sensor);near(focused.light,1);
 const wide=createExperiment('camera-focus',{subject:2,focus:1,aperture:2}).sample(0).values,stopped=createExperiment('camera-focus',{subject:2,focus:1,aperture:8}).sample(0).values;near(wide.blur,4*stopped.blur);near(wide.light,16*stopped.light);near(1/.05,1/2+1/wide.image);
 console.log(`Verified ${explainers.length} explainers, ${samples} scenario/limit samples, deterministic replay, projectile energy, static friction, pendulum energy, precession, string nodes, ideal work beam symmetry/scaling, differential closure, drone thrust/torque balance, optical focus and reverse seeking.`);
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
