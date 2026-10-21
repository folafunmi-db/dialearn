'use client';
import {useRef,useState,type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import {requestGuidedBuild} from '@/lib/build-timeline';
import {projects} from '@/lib/projects';
import {devices,type DeviceId} from '@/lib/devices';
import type {Lang} from '@/lib/content';
import type {Stage} from '@/lib/stages';
import {Button} from './ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import {Icon} from './icons';
const EngineeringGuide=dynamic(()=>import('./engineering-guide').then(m=>m.EngineeringGuide));
const ProjectGuide=dynamic(()=>import('./project-guide').then(m=>m.ProjectGuide));
const copy={
 en:{inspire:'Imagine what you could make',systems:'Try one idea',engineering:'Choose your next investigation',hint:'Pick a part above. What would you change to make this object more useful to you?',build:'Components & steps',notebook:'Open engineering notebook',more:'Curious to go further?',note:'Explore first. Open the detailed guides whenever you want.',close:'Close',refs:'Sources & references'},
 fr:{inspire:'Imaginez ce que vous pourriez créer',systems:'Essayez une idée',engineering:'Choisissez votre prochaine recherche',hint:'Choisissez une pièce. Que changeriez-vous pour rendre cet objet plus utile ?',build:'Matériel et étapes',notebook:'Ouvrir le carnet d’ingénierie',more:'Envie d’aller plus loin ?',note:'Explorez d’abord. Ouvrez les guides détaillés à votre rythme.',close:'Fermer',refs:'Sources et références'},
 pt:{inspire:'Imagine o que pode criar',systems:'Experimente uma ideia',engineering:'Escolha a próxima investigação',hint:'Escolha uma peça. O que mudaria para tornar este objeto mais útil?',build:'Componentes e etapas',notebook:'Abrir caderno de engenharia',more:'Quer ir mais longe?',note:'Explore primeiro. Abra os guias detalhados quando quiser.',close:'Fechar',refs:'Fontes e referências'},
 ar:{inspire:'تخيّل ما يمكنك صنعه',systems:'جرّب فكرة واحدة',engineering:'اختر استكشافك التالي',hint:'اختر جزءاً بالأعلى. ما الذي ستغيّره ليصبح هذا الشيء أكثر فائدة لك؟',build:'المكونات والخطوات',notebook:'افتح دفتر الهندسة',more:'هل ترغب في التعمّق؟',note:'استكشف أولاً، وافتح الأدلة التفصيلية متى شئت.',close:'إغلاق',refs:'المصادر والمراجع'}
};
export function DetailWindow({label,children,lang}:{label:string;children:ReactNode;lang:Lang}){
 const [open,setOpen]=useState(false),trigger=useRef<HTMLButtonElement>(null);
 return <><Button ref={trigger} variant="ghost" className="quiet-link" onClick={()=>setOpen(true)}>{label}<Icon name="outward" size={15}/></Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="dialog learning-detail-dialog" showCloseButton={false} finalFocus={trigger}><div className="dialog-header"><DialogTitle>{label}</DialogTitle><Button variant="ghost" className="icon-button" aria-label={copy[lang].close} onClick={()=>setOpen(false)}><Icon name="close"/></Button></div><DialogDescription className="sr-only">{label}</DialogDescription><div className="dialog-body">{children}</div></DialogContent></Dialog></>;
}
export function ExploreNext({id,stage,lang,onSelect,available,selected}:{id:DeviceId|'phone';stage:Stage;lang:Lang;onSelect:(part:string)=>void;available:string[];selected:string}){
 const project=projects.find(p=>p.id===id),c=copy[lang];
 const [panel,setPanel]=useState<'build'|'engineering'|null>(null),lastFocus=useRef<HTMLElement|null>(null);
 function open(next:'build'|'engineering'){lastFocus.current=document.activeElement as HTMLElement;setPanel(next);}
 const title=stage==='foundations'?c.inspire:stage==='systems'?c.systems:c.engineering;
 return <section className="explore-next" data-learning-stage={stage}>
 <div className="explore-next-prompt"><span className="explore-next-spark" aria-hidden="true">✳</span><div><h2>{title}</h2><p lang={project?'en':lang} dir={project?'ltr':undefined}>{project?project.prompts[stage]:c.hint}</p>{project?<p className="microcopy" lang="en" dir="ltr">No kit needed: sketch your idea on paper first.</p>:null}</div></div>
 <div className="explore-next-actions">{project?<div className="project-guide-entry"><Button variant="ghost" className="secondary" onClick={()=>open('build')}><Icon name="layers" size={17}/>{c.build}<Icon name="arrow" size={16}/></Button><span className="microcopy">{({en:`Parts list · ${project.steps.length} guided steps`,fr:`Matériel · ${project.steps.length} étapes guidées`,pt:`Materiais · ${project.steps.length} etapas guiadas`,ar:`المكونات · ${project.steps.length} خطوات موجّهة`})[lang]}</span></div>:null}{stage==='foundations'?<details><summary>{c.more}</summary><div><Button variant="ghost" className="quiet-link" onClick={()=>open('engineering')}>{c.notebook}<Icon name="arrow" size={16}/></Button></div></details>:<><p className="microcopy">{c.note}</p><div><Button variant="ghost" className={project?'quiet-link':'secondary'} onClick={()=>open('engineering')}>{c.notebook}<Icon name="arrow" size={16}/></Button></div></>}</div>
 <Dialog open={panel!==null} onOpenChange={open=>{if(!open)setPanel(null);}}><DialogContent className={`dialog learning-detail-dialog ${panel==='build'?'build-guide-dialog':''}`} showCloseButton={false} finalFocus={()=>lastFocus.current}><div className="dialog-header"><DialogTitle>{panel==='build'?c.build:c.notebook}</DialogTitle><Button variant="ghost" className="icon-button" aria-label={c.close} onClick={()=>setPanel(null)}><Icon name="close"/></Button></div><DialogDescription className="sr-only">{id==='phone'?'Smartphone':devices.find(d=>d.id===id)?.name[lang]}</DialogDescription>{panel==='build'&&project?<ProjectGuide id={project.id} stage={stage} lang={lang} onWatchStep={step=>{lastFocus.current=null;setPanel(null);requestGuidedBuild(project.id,step);}}/>:panel==='engineering'?<EngineeringGuide id={id} stage={stage} lang={lang} selected={selected} available={available} onSelect={part=>{setPanel(null);onSelect(part);}}/>:null}</DialogContent></Dialog>
 </section>;
}

const inspirations:Record<string,string>={
 'arduino-rover':'Could you make a rover that delivers a tiny parcel or explores a maze? Tap a part to discover what would make it move.',
 'pi-station':'What could a tiny weather station discover about your home or classroom? Explore the parts, then imagine where you would put it.',
 'breadboard-led':'A blinking light could become a secret signal, a tiny lighthouse or a night-time decoration. Which would you make?',
 'reaction-timer':'Could you design a game that tests your friends’ reactions? Explore how a light, a button and a little code work together.',
 'plant-waterer':'Imagine a plant that can ask for a drink. Explore the parts that could help you notice when its soil is dry.'
};
export function InspirationPrompt({id,lang}:{id:string;lang:Lang}){return <div className="selection-prompt inspiration-prompt"><p className="eyebrow">✳ {copy[lang].inspire}</p><h3>{({en:'Start with a possibility.',fr:'Imaginez une possibilité.',pt:'Comece com uma possibilidade.',ar:'ابدأ باحتمال جديد.'})[lang]}</h3><p lang={inspirations[id]?'en':lang} dir={inspirations[id]?'ltr':undefined}>{inspirations[id]||copy[lang].hint}</p></div>;}
