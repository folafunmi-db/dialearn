'use client';
import {useState} from 'react';
import {explainTerms,plainLanguage} from '@/lib/learning-copy';
import {projects} from '@/lib/projects';
import {projectKits} from '@/lib/project-kits';
import {deviceSources,type DeviceId} from '@/lib/devices';
import type {Stage} from '@/lib/stages';
import type {Lang} from '@/lib/content';
import {Button} from './ui/button';
import {Icon} from './icons';
import {Tabs,TabsList,TabsTrigger,TabsContent} from './ui/tabs';
export function ProjectGuide({id,stage,lang,onWatchStep}:{id:DeviceId;stage:Stage;lang:Lang;onWatchStep?:(step:number)=>void}){
 const project=projects.find(p=>p.id===id),[done,setDone]=useState<number[]>([]),[packed,setPacked]=useState<string[]>([]);
 if(!project)return null;
 const kit=projectKits[project.id];
 return <section className="project-guide" lang="en" dir="ltr">
  <div className="project-guide-intro"><p className="eyebrow">DIY LAB / {id==='pi-station'?'RASPBERRY PI':'ARDUINO'}</p><h2>{project.title}</h2><p>{project.goal}</p>{lang!=='en'?<p className="translation-note">Build instructions currently available in English.</p>:null}<p className="microcopy">No kit yet? Explore the diagram and sketch your idea first. Checklists are for this visit only.</p>{onWatchStep?<Button variant="ghost" className="secondary build-watch-button" onClick={()=>onWatchStep(0)}><Icon name="layers" size={16}/>Build along in 3D<Icon name="outward" size={14}/></Button>:null}</div>
  <Tabs defaultValue="kit" className="build-guide-tabs">
   <TabsList aria-label="Build guide sections" className="build-guide-tab-list"><TabsTrigger value="kit">Components <span>{kit.parts.length}</span></TabsTrigger><TabsTrigger value="steps">Steps <span>{project.steps.length}</span></TabsTrigger><TabsTrigger value="wiring">Wiring</TabsTrigger><TabsTrigger value="resources">Resources</TabsTrigger></TabsList>
   <TabsContent value="kit" className="build-guide-panel"><h3>Your component checklist</h3><p className="microcopy">{packed.length} of {kit.parts.length} component types gathered · quantities shown per item.</p>{kit.note?<p className="kit-note">{kit.note}</p>:null}<ul className="project-kit-list">{kit.parts.map(item=><li key={item.name}><label><input type="checkbox" checked={packed.includes(item.name)} onChange={()=>setPacked(prev=>prev.includes(item.name)?prev.filter(name=>name!==item.name):[...prev,item.name])}/><span><strong>{item.name}</strong><span>{item.note}</span></span><span className="kit-quantity" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span></label></li>)}</ul><h3>Tools & setup</h3><ul className="project-tools">{kit.tools.map(tool=><li key={tool}>{tool}</li>)}</ul><p>{kit.setup}</p></TabsContent>
   <TabsContent value="steps" className="build-guide-panel"><div className="build-progress"><h3>One step at a time</h3><span role="status">{done.length} / {project.steps.length} complete</span></div><progress className="build-progress-bar" max={project.steps.length} value={done.length} aria-label="Build steps completed"/><p className="microcopy">Read each step before marking it complete. Disconnect power before changing connections.</p><ol className="project-steps">{project.steps.map((step,i)=><li key={step.title}><label className={done.includes(i)?'completed':''}><input type="checkbox" checked={done.includes(i)} onChange={()=>setDone(prev=>prev.includes(i)?prev.filter(n=>n!==i):[...prev,i])}/><span><strong>{i+1}. {step.title}</strong><span>{stage==='foundations'?plainLanguage(step.body):explainTerms(step.body)}</span></span></label>{onWatchStep?<Button variant="ghost" className="quiet-link watch-step-button" onClick={()=>onWatchStep(i)}><span aria-hidden="true">▷</span>Watch this step in 3D<Icon name="outward" size={14}/></Button>:null}</li>)}</ol><h3>Try one idea</h3><p>{project.prompts[stage]}</p></TabsContent>
   <TabsContent value="wiring" className="build-guide-panel"><h3>Connection map</h3><p className="microcopy">Power off first. Follow the labels on your exact board and module; the exploratory model simplifies routes.</p><div className="connection-table"><table><thead><tr><th scope="col">From</th><th scope="col">To</th></tr></thead><tbody>{project.connections.map(([from,to])=><tr key={from}><td>{from}</td><td>{to}</td></tr>)}</tbody></table></div></TabsContent>
   <TabsContent value="resources" className="build-guide-panel"><h3>Code & build references</h3><a className="secondary build-download" href={project.file} download={project.file.startsWith('/')||undefined} target={project.file.startsWith('/')?undefined:'_blank'} rel={project.file.startsWith('/')?undefined:'noopener noreferrer'}><Icon name={project.file.startsWith('/')?'download':'outward'} size={17}/>{project.fileLabel}</a><p className="microcopy">{project.note}</p><div className="lesson-sources">{deviceSources.filter(s=>project.refs.includes(s.id)).map(s=><a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">{s.name} · {s.title}<Icon name="outward" size={12}/></a>)}</div></TabsContent>
  </Tabs>
 </section>;
}
