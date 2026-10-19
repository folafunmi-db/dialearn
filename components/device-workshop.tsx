'use client';
import {ProjectCredit} from './project-credit';
import {advancedLearningNotice} from '@/lib/advanced-learning-notice';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {devices,deviceCopy,deviceSources,type DeviceId} from '@/lib/devices';
import {ui} from '@/lib/i18n';
import type {Lang} from '@/lib/content';
import {lessonCopy} from '@/lib/learning-copy';
import {stages,stageCopy,type Stage} from '@/lib/stages';
import {Button} from './ui/button';
import {Tabs,TabsList,TabsTrigger,TabsContent} from './ui/tabs';
import {Slider} from './ui/slider';
import {ChoiceSelect} from './choice-select';
import {Icon} from './icons';
import {AnatomyTooltip,elementAnchor,type Anchor} from './anatomy-tooltip';
import {ExploreNext,DetailWindow,InspirationPrompt} from './explore-next';
import {useStillness} from './use-stillness';
import {useWorkingCycle} from './use-working-cycle';
import {useAssemblyFrame} from './use-assembly-frame';
import {useSvgMechanism} from './use-svg-mechanism';
import {Explore3D} from './explore-3d';
import {SelectionPrompt,selectionCopy} from './selection-prompt';
export function DeviceWorkshop({id,lang,stage,onStage,textOnly,still,saved,onSave,initialPart,headingAction}:{id:DeviceId;lang:Lang;stage:Stage;onStage:(s:Stage)=>void;textOnly:boolean;still:boolean;saved:string[];onSave:(key:string)=>void;initialPart?:string;headingAction?:ReactNode}){
 const calm=useStillness(still);
 const device=devices.find(d=>d.id===id)!,t=ui[lang],c=deviceCopy[lang],st=stageCopy[lang];
 const available=device.parts.filter(p=>stages.indexOf(p.stage)<=stages.indexOf(stage));
 const [running,setRunning]=useState(false);
 const [selected,setSelected]=useState(initialPart||''),[opened,setOpened]=useState(true),[tab,setTab]=useState('works'),[deep,setDeep]=useState(false),[preview,setPreview]=useState<string|null>(null),[anchor,setAnchor]=useState<Anchor|null>(null),[choice,setChoice]=useState<number|null>(null),[checked,setChecked]=useState(false),[front,setFront]=useState(42),[rear,setRear]=useState(21);
 const root=useRef<HTMLDivElement>(null),lessonRef=useRef<HTMLDivElement>(null);
 const lesson=available.find(p=>p.id===selected)||available[0],key=id+':'+lesson.id;
 const explanation=lessonCopy({...lesson,simple:lesson.simple[lang]},stage,{id,part:lesson.id,lang:device.complex?'en':lang,expanded:deep});
 const [groups,setGroups]=useState<{id:string;svg:string;lift:string;study?:string;inspectionOffset?:number[];explodedFrame?:number[];studyLabels?:{id:string;x:number;y:number;stage:string}[]}[]>([]);
 useEffect(()=>{if(textOnly)return;const abort=new AbortController();fetch(`/art/${id}.json`,{signal:abort.signal}).then(r=>r.json()).then(setGroups).catch(()=>{});return()=>abort.abort();},[id,textOnly]);
 useEffect(()=>{setDeep(false);if(selected&&!available.some(p=>p.id===selected))setSelected('');setPreview(null);},[stage]); // Stage is freely chosen, never an access gate.
 useEffect(()=>{const seen=new Set<string>();root.current?.querySelectorAll<SVGGElement>('[data-assembly],[data-component]').forEach(el=>{const part=device.parts.find(p=>p.id===(el.dataset.component||el.dataset.assembly));const enabled=part&&available.some(p=>p.id===part.id);const unique=enabled&&!seen.has(part.id);if(enabled)seen.add(part.id);if(unique)el.setAttribute('aria-label',part!.name[lang]);else el.removeAttribute('aria-label');el.setAttribute('role',unique?'button':'presentation');el.setAttribute('tabindex',unique?'0':'-1');el.classList.toggle('part-selected',!!enabled&&part.id===selected);if(unique)el.setAttribute('aria-pressed',String(part.id===selected));else el.removeAttribute('aria-pressed');});},[groups,lang,stage,selected,opened]);
 useSvgMechanism(root,running,calm,groups);
 useAssemblyFrame(root,opened,groups[0]?.explodedFrame,calm);
 const cycle=useWorkingCycle(id,running,calm,root,available.map(p=>p.id).join(','));
 useEffect(()=>{root.current?.querySelectorAll<SVGElement>('[data-assembly],[data-component]').forEach(el=>el.classList.toggle('cycle-active',(el.dataset.component||el.dataset.assembly)===cycle.part));},[cycle.part,groups]);
 const canPlay=true;const playLabel=running?({en:'Pause',fr:'Pause',pt:'Pausar',ar:'إيقاف مؤقت'})[lang]:({en:'Play how it works',fr:'Voir le fonctionnement',pt:'Ver como funciona',ar:'شاهد كيف تعمل'})[lang];
 function pick(partId:string){if(!available.some(p=>p.id===partId))return;setSelected(partId);setTab('works');if(window.matchMedia('(max-width: 720px)').matches)requestAnimationFrame(()=>lessonRef.current?.scrollIntoView({block:'start',behavior:'instant'}));}
 function target(node:EventTarget|null){const el=node as Element;const inner=el?.closest?.('[data-component]')?.getAttribute('data-component');if(inner&&available.some(p=>p.id===inner))return inner;return el?.closest?.('[data-assembly]')?.getAttribute('data-assembly')||null;}
 const previewPart=device.parts.find(p=>p.id===preview);
 return <>
 <div className="workshop-heading"><div><h1>{device.name[lang]}</h1><p>{device.description[lang]}</p><ProjectCredit id={id} lang={lang} linked/></div><div className="workshop-header-controls">{headingAction}<div className="depth-switch" role="group" aria-label={t.depth}>{[false,true].map(v=><Button key={String(v)} variant="ghost" aria-pressed={deep===v} className={deep===v?'active':''} onClick={()=>setDeep(v)}>{v?t.deep:t.quick}</Button>)}</div></div></div>
 <div className="mobile-part-picker"><label htmlFor="device-part">{t.choosePart}</label><ChoiceSelect id="device-part" label={t.choosePart} value={selected||null} onChange={pick} options={available.map(p=>({value:p.id,label:p.name[lang]}))}/></div>
 <div className="workshop-grid"><div className="workshop-model">
 {textOnly?<div className="text-model"><Icon name="layers" size={40}/><p>{t.choosePart}</p></div>:<div className="model-illustration">
 <div ref={root} className={`phone-stage device-stage iso iso-plate ${calm?'still':''}`} data-stage={stage} onClick={e=>{const p=target(e.target);if(p)pick(p);else if(!(e.target as Element).closest('button,a,input')){setSelected('');setPreview(null);}}} onPointerOver={e=>{setPreview(target(e.target));setAnchor(elementAnchor(e.target));}} onPointerLeave={()=>setPreview(null)} onFocus={e=>{setPreview(target(e.target));setAnchor(elementAnchor(e.target));}} onBlur={()=>setPreview(null)} onKeyDown={e=>{if(e.key==='Escape'){setSelected('');setPreview(null);}if(e.key==='Enter'||e.key===' '){const p=target(e.target);if(p){e.preventDefault();pick(p);}}}}>
 <div className="stage-top"><span>{t.figure.split('/')[0]} / {device.name[lang]}</span><span className="stage-dot"/></div>
 <div className="anatomy-art">{groups.length?<svg className="iso-svg" viewBox={groups[0]?.explodedFrame?.join(' ')||'0 0 560 560'} role="group" aria-label={device.name[lang]}>{groups.map((g,i)=><g key={g.id+i} className={`assembly device-assembly ${selected===g.id?'active-assembly':''}`} data-assembly={g.id} data-inspection={g.inspectionOffset?'true':undefined} data-open={g.study||g.lift} style={{transform:opened?(g.study||g.lift).replace(/translate\(([-\d.]+) ([-\d.]+)\)/,'translate($1px, $2px)'):'translate(0px, 0px)'}} dangerouslySetInnerHTML={{__html:g.svg}}/>)}</svg>:<img className="iso-svg" width="560" height="560" src={`/art/${id}.svg`} alt={device.name[lang]}/>}</div>
 <AnatomyTooltip content={previewPart?{name:previewPart.name[lang],simple:lessonCopy({...previewPart,simple:previewPart.simple[lang]},stage,{id,part:previewPart.id,lang:device.complex?'en':lang}).summary}:null} anchor={anchor} stageRef={root}/>
 <div className="stage-bottom">{canPlay?<Button variant="ghost" className="stage-toggle mechanism-play" aria-label={playLabel} title={playLabel} disabled={calm} aria-pressed={running} onClick={e=>{e.stopPropagation();if(!running)setOpened(false);setRunning(!running);}}><span aria-hidden="true">{running?'Ⅱ':'▷'}</span></Button>:null}<Button variant="ghost" className="stage-toggle" onClick={e=>{e.stopPropagation();setRunning(false);setOpened(!opened);}} aria-pressed={opened}><Icon name="layers" size={17}/>{opened?t.closeup:device.complex?({en:'Separate parts',fr:'Séparer les pièces',pt:'Separar peças',ar:'فصل الأجزاء'})[lang]:t.open}</Button></div>
 {running?<p className="mechanism-caption" lang="en" dir="ltr">{cycle.count?`${cycle.step} / ${cycle.count} · ${device.parts.find(p=>p.id===cycle.part)?.name[lang]||cycle.part}. `:''}Slowed teaching motion and a representative energy or information path.</p>:null}<Explore3D id={id} lang={lang} stage={stage} still={calm}/></div></div>}
 {device.sourceNotice?<p className="source-notice" lang="en" dir="ltr">{device.sourceNotice}</p>:null}<p className="model-caption">{device.complex?({en:'Exploded teaching model: assemblies keep their relative size and float away from their assembled positions. Put together returns them to the object. Layouts and removal paths are illustrative.',fr:'Vue éclatée pédagogique : les ensembles conservent leur taille relative et retrouvent leur position lors du réassemblage.',pt:'Vista explodida didática: os conjuntos mantêm o tamanho relativo e voltam à sua posição ao juntar.',ar:'نموذج تعليمي مفكك يحافظ على الأحجام النسبية ويعيد الأجزاء إلى مواقعها عند التجميع.'})[lang]:c.model}</p>
 <div className="part-list" role="group" aria-label={t.choosePart}>{available.map((p,i)=><Button variant="ghost" key={p.id} onClick={()=>pick(p.id)} aria-pressed={selected===p.id} className={`${selected===p.id?'selected':''} ${p.stage!=='foundations'?'detail-part':''}`}><span>{p.stage==='foundations'?'0'+(i+1):'↳'}</span>{p.name[lang]}<Icon name="arrow" size={14}/></Button>)}</div>
 </div><div className="lesson-panel" ref={lessonRef}>{selected?<><Button variant="ghost" className="quiet-link clear-selection" onClick={()=>{setSelected('');setPreview(null);}}>{selectionCopy[lang].clear}</Button>
 <div className="lesson-eyebrow"><span>{st.labels[stage]}</span><Button variant="ghost" className={`icon-button ${saved.includes(key)?'is-saved':''}`} aria-label={`${saved.includes(key)?t.saved:t.save}: ${lesson.name[lang]}`} aria-pressed={saved.includes(key)} onClick={()=>onSave(key)}><Icon name="bookmark"/></Button></div>
 <h3 lang={device.complex?'en':lang} dir={device.complex?'ltr':undefined}>{lesson.name[lang]}</h3><p className="lesson-role" lang={device.complex?'en':lang} dir={device.complex?'ltr':undefined}>{lessonCopy({...lesson,simple:lesson.simple[lang]},'foundations',{id,part:lesson.id,lang:device.complex?'en':lang}).works}</p>
 <Tabs value={tab} onValueChange={setTab}><TabsList variant="line" className="lesson-tabs ui-tabs-list" aria-label={t.how}>{['works','made','story'].map(v=><TabsTrigger key={v} value={v} className="ui-tabs-trigger">{t[v as 'works'|'made'|'story']}</TabsTrigger>)}</TabsList>
 <TabsContent value="works" className="lesson-text"><p lang={stage!=='foundations'||device.complex?'en':lang} dir={stage!=='foundations'||device.complex?'ltr':undefined}>{explanation.works}</p></TabsContent><TabsContent value="made" className="lesson-text"><p lang="en" dir="ltr">{explanation.made}</p></TabsContent><TabsContent value="story" className="lesson-text"><p lang="en" dir="ltr">{explanation.story}</p></TabsContent></Tabs>
 {lang!=='en'?<p className="translation-note">{device.complex?advancedLearningNotice[lang]:c.reference}</p>:null}
 <div className="lesson-actions"><a className="quiet-link" href={`/read/${lang}/#${id}-${lesson.id}`} target="_blank" rel="noopener noreferrer">{t.print}<Icon name="outward" size={14}/></a></div>
 {id==='bicycle'&&['drivetrain','ratio'].includes(lesson.id)&&tab==='works'?<section className="experiment"><p className="eyebrow">{c.ratio}</p><label>{c.front}<strong>{front}</strong><Slider min={24} max={52} step={2} value={[front]} onValueChange={v=>setFront(Array.isArray(v)?v[0]:v)} aria-label={c.front}/></label><label>{c.rear}<strong>{rear}</strong><Slider min={12} max={32} step={1} value={[rear]} onValueChange={v=>setRear(Array.isArray(v)?v[0]:v)} aria-label={c.rear}/></label><div className="experiment-output"><span>{c.turns}</span><output>{new Intl.NumberFormat(lang,{maximumFractionDigits:2}).format(front/rear)}</output></div><p className="microcopy" lang="en" dir="ltr">Ideal single-speed model: front teeth ÷ rear teeth. It omits wheel size, losses and rider effort.</p></section>:null}
 {tab==='works'?<fieldset className="challenge" lang="en" dir="ltr"><legend>{c.question}</legend><p>{device.question}</p>{device.options.map((option,i)=><label key={option} className={choice===i?'chosen':''}><input type="radio" name={`prediction-${id}`} checked={choice===i} onChange={()=>{setChoice(i);setChecked(false);}}/>{option}</label>)}<Button variant="ghost" className="secondary small" disabled={choice===null} onClick={()=>setChecked(true)}>{t.check}</Button>{checked?<p className={`answer ${choice===device.correct?'right':''}`} role="status"><strong>{choice===device.correct?t.correct:t.thinkAgain}</strong> {device.answer}</p>:null}</fieldset>:null}
 {tab!=='story'?<Button variant="ghost" className="story-link" onClick={()=>setTab('story')}><Icon name="book" size={17}/>{t.storyLink}<Icon name="arrow" size={16}/></Button>:null}
 <DetailWindow label={t.sourceDetail} lang={lang}><div className="lesson-sources"><h4>{t.sourceDetail}</h4>{deviceSources.filter(s=>lesson.refs.includes(s.id)).map(s=><a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"><span>{s.name} · {s.title}</span><Icon name="outward" size={13}/></a>)}<p>{t.sourceDate}</p></div></DetailWindow>
 </>:stage==='foundations'?<InspirationPrompt id={id} lang={lang}/>:<SelectionPrompt lang={lang}/>}</div></div><ExploreNext id={id} selected={selected} stage={stage} lang={lang} onSelect={pick} available={available.map(p=>p.id)}/></>;
}
