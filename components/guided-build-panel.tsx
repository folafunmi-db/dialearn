'use client';
import type {RefObject} from 'react';
import {projects} from '@/lib/projects';
import {buildPlans,buildFocus} from '@/lib/build-timeline';
import {plainLanguage,explainTerms} from '@/lib/learning-copy';
import type {Stage} from '@/lib/stages';
import {Button} from './ui/button';
import {Icon} from './icons';
type Props={id:string;step:number;stage:Stage;playing:boolean;still:boolean;ready:boolean;timeline:RefObject<HTMLInputElement|null>;focusOutput:RefObject<HTMLOutputElement|null>;time:RefObject<number>;labels:Record<string,string>;onStep:(step:number)=>void;onPlay:()=>void;onReplay:()=>void;onSeek:(fraction:number)=>void;onExit:()=>void;selected?:{label:string;simple:string};onClear:()=>void};
export function GuidedBuildPanel(p:Props){
 const project=projects.find(project=>project.id===p.id),plan=buildPlans[p.id];if(!project||!plan)return null;
 const step=project.steps[p.step],cue=plan.steps[p.step];
 return <section className="guided-build-panel" aria-label="Guided 3D build" lang="en" dir="ltr">
  <div className="guided-build-heading"><p className="eyebrow">BUILD ALONG / 3D</p><Button variant="ghost" className="quiet-link" onClick={p.onExit}>Free explore<Icon name="outward" size={14}/></Button></div>
  <nav className="build-step-tabs" aria-label="Build steps">{project.steps.map((step,index)=><Button key={step.title} variant="ghost" className={index===p.step?'active':''} aria-current={index===p.step?'step':undefined} aria-label={`Step ${index+1}: ${step.title}`} onClick={()=>p.onStep(index)}>{String(index+1).padStart(2,'0')}</Button>)}</nav>
  <div className="guided-build-reading" key={p.step}><p className="microcopy" role="status">Step {p.step+1} of {project.steps.length}</p><h3>{step.title}</h3><p className="build-scene-caption">{cue.caption}</p><p className="build-focus-label">In focus <output ref={p.focusOutput} aria-label="Part in focus" aria-live="off">{p.labels[buildFocus(p.id,p.time.current,p.step)]}</output></p>
   <details className="build-instructions"><summary>Full instructions</summary><p>{p.stage==='foundations'?plainLanguage(step.body):explainTerms(step.body)}</p></details>
   <details className="build-instructions"><summary>Wiring & code</summary><div className="connection-table"><table><thead><tr><th scope="col">From</th><th scope="col">To</th></tr></thead><tbody>{project.connections.map(([from,to])=><tr key={from}><td>{from}</td><td>{to}</td></tr>)}</tbody></table></div><a className="quiet-link" href={project.file} download={project.file.startsWith('/')||undefined} target={project.file.startsWith('/')?undefined:'_blank'} rel={project.file.startsWith('/')?undefined:'noopener noreferrer'}>{project.fileLabel}<Icon name="outward" size={13}/></a></details>
   {p.selected?<div className="build-inspected-part"><div><strong>{p.selected.label}</strong><Button variant="ghost" size="icon-sm" aria-label="Clear selected part" onClick={p.onClear}><Icon name="close" size={15}/></Button></div><p>{p.selected.simple}</p></div>:null}
   <p className="build-model-note">Illustrative assembly, not a running circuit. {p.still?'Motion is reduced; use the steps or scrubber to inspect each pose.':'Drag the model to look around. Green highlights mark this step’s parts.'}</p>
  </div>
  <div className="guided-build-playback"><div className="build-animation-controls"><Button variant="ghost" className="secondary" disabled={!p.ready||p.still} aria-pressed={p.playing} onClick={p.onPlay}>{p.playing?'Pause':'Play step'}<span aria-hidden="true">{p.playing?'Ⅱ':'▷'}</span></Button><Button variant="ghost" className="quiet-link" disabled={!p.ready||p.still} onClick={p.onReplay}>Replay<span aria-hidden="true">↺</span></Button></div><label className="build-scrubber">Step animation<input ref={p.timeline} aria-label="Step animation position" type="range" min="0" max="1" step="0.005" defaultValue={Math.max(0,Math.min(1,p.time.current-p.step))} disabled={!p.ready} onChange={e=>p.onSeek(Number(e.target.value))}/></label><div className="build-step-navigation"><Button variant="ghost" className="secondary" disabled={p.step===0} onClick={()=>p.onStep(p.step-1)}>← Back</Button><span>{p.step+1} / {project.steps.length}</span><Button variant="ghost" className="secondary" onClick={()=>p.step===project.steps.length-1?p.onExit():p.onStep(p.step+1)}>{p.step===project.steps.length-1?'Finish':'Next step'} →</Button></div></div>
 </section>;
}
