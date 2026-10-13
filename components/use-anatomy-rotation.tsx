'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {Button} from './ui/button';
import type {Lang} from '@/lib/content';
import type {createSmoothEngine,AnatomyModel} from './smooth-anatomy-engine';
type Options={enabled?:boolean;opened:boolean;selected?:string;stage:string;still?:boolean;mechanismSpeed?:number};
const words={en:{hint:'Drag left or right to rotate',left:'Rotate left',right:'Rotate right',reset:'Reset view',loading:'Preparing smooth rotation…'},fr:{hint:'Glissez à gauche ou à droite pour tourner',left:'Tourner à gauche',right:'Tourner à droite',reset:'Vue initiale',loading:'Préparation de la rotation…'},pt:{hint:'Arraste para os lados para girar',left:'Girar à esquerda',right:'Girar à direita',reset:'Vista inicial',loading:'Preparando rotação…'},ar:{hint:'اسحب يميناً أو يساراً لتدوير الجسم',left:'تدوير لليسار',right:'تدوير لليمين',reset:'إعادة العرض',loading:'جارٍ إعداد التدوير…'}};
// Static SVG remains the initial view. The renderer and world-space model load
// only when rotation is requested, then every intermediate angle is drawn locally.
export function useAnatomyRotation(id:string,options:Options){
 const mountRef=useRef<HTMLDivElement>(null),outputRef=useRef<HTMLOutputElement>(null),engine=useRef<ReturnType<typeof createSmoothEngine>|null>(null),preparing=useRef<Promise<void>|null>(null),target=useRef(0),latest=useRef(options),live=useRef(true);
 latest.current=options;
 const [tilt,setTilt]=useState(0),[roll,setRoll]=useState(0),[zoom,setZoom]=useState(1);const tiltRef=useRef(0),zoomRef=useRef(1);
 const [active,setActive]=useState(false),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false);
 const pointer=useRef<{id:number;startX:number;startY:number;startAngle:number;startTilt:number;moved:boolean}|null>(null),suppressClick=useRef(false);
 const pointers=useRef(new Map<number,{x:number;y:number}>()),pinch=useRef<{distance:number;zoom:number}|null>(null);
 useEffect(()=>{live.current=true;return()=>{live.current=false;engine.current?.destroy();engine.current=null;};},[id]);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>engine.current?.configure({...latest.current,still:latest.current.still||media.matches});media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{engine.current?.configure({...options,still:options.still||window.matchMedia('(prefers-reduced-motion: reduce)').matches});if(options.enabled===false){engine.current?.destroy();engine.current=null;setActive(false);}},[options.enabled,options.opened,options.selected,options.stage,options.still,options.mechanismSpeed]);
 useEffect(()=>{const host=mountRef.current?.parentElement;if(!host)return;const wheel=(event:WheelEvent)=>{if(!engine.current)return;event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?host.clientHeight:1);adjustZoom(zoomRef.current*Math.exp(-delta*.0015));};host.addEventListener('wheel',wheel,{passive:false});return()=>host.removeEventListener('wheel',wheel);},[id]);
 async function prepare(){if(engine.current||options.enabled===false)return;if(preparing.current)return preparing.current;setLoading(true);setFailed(false);preparing.current=(async()=>{try{const [module,response]=await Promise.all([import('./smooth-anatomy-engine'),fetch(`/art/${id}-model.json`)]);if(!response.ok)throw Error();const model=await response.json() as AnatomyModel;if(!live.current||!mountRef.current||latest.current.enabled===false)return;const instance=module.createSmoothEngine(mountRef.current,model,value=>{if(outputRef.current)outputRef.current.textContent=Math.round(value)+'°';});engine.current=instance;instance.configure({...latest.current,still:latest.current.still||window.matchMedia('(prefers-reduced-motion: reduce)').matches});instance.setTarget(target.current);instance.setTilt(tiltRef.current);instance.setZoom(zoomRef.current);setActive(true);const wrapper=mountRef.current.parentElement;if(wrapper?.querySelector('svg')?.contains(document.activeElement)){wrapper.parentElement?.querySelector<HTMLButtonElement>('.rotation-controls button')?.focus();}}catch{if(live.current)setFailed(true);}finally{if(live.current)setLoading(false);preparing.current=null;}})();return preparing.current;}
 function turn(value:number){target.current=value;void prepare().then(()=>engine.current?.setTarget(target.current));engine.current?.setTarget(value);}
 function rotate(step:number){turn(target.current+step*45);}
 // Rightward drags increase yaw; a second pointer switches to pinch zoom.
 const drag={
  onPointerDown:(e:PointerEvent<HTMLDivElement>)=>{
   if(e.button!==0||!(e.target as Element).closest('.anatomy-art'))return;
   pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.current.size>=2){const [a,b]=[...pointers.current.values()];pinch.current={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:zoomRef.current};pointer.current=null;suppressClick.current=true;for(const id of pointers.current.keys())e.currentTarget.setPointerCapture(id);}
   else{pinch.current=null;pointer.current={id:e.pointerId,startX:e.clientX,startY:e.clientY,startAngle:engine.current?.angle()||target.current,startTilt:engine.current?.tilt()||tiltRef.current,moved:false};suppressClick.current=false;}
  },
  onPointerMove:(e:PointerEvent<HTMLDivElement>)=>{
   if(pointers.current.has(e.pointerId))pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pinch.current&&pointers.current.size>=2){const [a,b]=[...pointers.current.values()];adjustZoom(pinch.current.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.current.distance);return;}
   const p=pointer.current;if(!p||p.id!==e.pointerId)return;
   if(e.pointerType==='mouse'&&e.buttons===0){pointer.current=null;pointers.current.delete(e.pointerId);return;}
   const dx=e.clientX-p.startX,dy=e.clientY-p.startY;
   if(!p.moved&&Math.hypot(dx,dy)>6){p.moved=true;suppressClick.current=true;e.currentTarget.setPointerCapture(e.pointerId);}
   if(p.moved){turn(p.startAngle+dx*.55);adjustTilt(p.startTilt+dy*.55);}
  },
  onPointerUp:(e:PointerEvent<HTMLDivElement>)=>{pointers.current.delete(e.pointerId);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(pinch.current){pinch.current=null;pointer.current=null;suppressClick.current=true;}else if(pointer.current?.id===e.pointerId)pointer.current=null;},
  onPointerCancel:()=>{pointers.current.clear();pinch.current=null;pointer.current=null;suppressClick.current=false;},
 };
 function adjustZoom(value:number){if(!Number.isFinite(value))return;const next=Math.min(3,Math.max(.6,value));zoomRef.current=next;setZoom(next);engine.current?.setZoom(next);}
 function adjustTilt(value:number){tiltRef.current=value;setTilt(value);engine.current?.setTilt(value);}
 function start(){void prepare();}
 function reset(){turn(0);adjustTilt(0);setRoll(0);adjustZoom(1);engine.current?.setRoll(0);}
 function swallowClick(){if(suppressClick.current){suppressClick.current=false;return true;}return false;}
 return {mountRef,outputRef,active,loading,failed,rotate,reset,start,tilt,roll,zoom,adjustTilt,adjustRoll:(v:number)=>{setRoll(v);engine.current?.setRoll(v);},adjustZoom,drag,swallowClick,pick:(x:number,y:number)=>engine.current?.pick(x,y)||null,anchor:()=>engine.current?.anchor()||null,isDragging:()=>!!pointer.current?.moved||!!pinch.current};
}
export function RotationControls({rotation,lang}:{rotation:ReturnType<typeof useAnatomyRotation>;lang:Lang}){const t=words[lang];return <div className="rotation-controls" onPointerDown={e=>e.stopPropagation()}><span>{rotation.loading?t.loading:t.hint}</span><div><Button variant="ghost" aria-label={t.left} onClick={e=>{e.stopPropagation();rotation.rotate(-1);}}>↶</Button><output ref={rotation.outputRef} aria-label={lang==='en'?'Viewing angle':t.hint}>0°</output><Button variant="ghost" aria-label={t.right} onClick={e=>{e.stopPropagation();rotation.rotate(1);}}>↷</Button><Button variant="ghost" className="reset-view" onClick={e=>{e.stopPropagation();rotation.reset();}}>{t.reset}</Button></div>{rotation.failed?<span role="status">{lang==='en'?'Smooth rotation is unavailable on this device. Explore the diagram and part selector.':lang==='fr'?'La rotation est indisponible ici. Utilisez le dessin et le sélecteur de pièces.':lang==='pt'?'A rotação está indisponível aqui. Use o diagrama e o seletor de peças.':'التدوير غير متاح هنا. استخدم الرسم وقائمة الأجزاء.'}</span>:null}</div>}
