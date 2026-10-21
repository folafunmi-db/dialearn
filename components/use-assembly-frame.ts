'use client';
import {useEffect,useRef,type RefObject} from 'react';
import {assemblyShare} from '@/lib/assembly-motion';
// One time-based transition drives cover removal, retained assemblies and framing.
export function useAssemblyFrame(root:RefObject<HTMLDivElement|null>,opened:boolean,frame:number[]|undefined,still:boolean,closedFrame?:number[]){
 const progress=useRef(opened?1:0);
 useEffect(()=>{
  const svg=root.current?.querySelector<SVGSVGElement>('.anatomy-art svg');if(!svg)return;
  const pieces=Array.from(svg.querySelectorAll<SVGGElement>('.device-assembly')).map(el=>({el,offset:(el.dataset.open?.match(/translate\(([-\d.]+) ([-\d.]+)\)/)?.slice(1).map(Number)||[0,0]),cover:el.dataset.inspection==='true'}));
  let raf=0,start=0;const from=progress.current,target=opened?1:0;
  function apply(p:number){progress.current=p;const fit=pieces.some(v=>v.cover)?assemblyShare(p,true):assemblyShare(p,false),base=closedFrame||[0,0,560,560],end=frame||base;svg!.setAttribute('viewBox',end.map((v,i)=>base[i]+(v-base[i])*fit).join(' '));for(const {el,offset,cover} of pieces){const share=assemblyShare(p,cover);el.style.transition='none';el.style.transform=`translate(${offset[0]*share}px, ${offset[1]*share}px)`;}}
  apply(still?target:from);if(still)return;
  function tick(now:number){if(!start)start=now;const t=Math.min(1,(now-start)/900),ease=t*t*(3-2*t);apply(from+(target-from)*ease);if(t<1)raf=requestAnimationFrame(tick);}
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
 },[root,opened,frame,still,closedFrame]);
}
