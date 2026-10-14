'use client';
import {useEffect,useState,type RefObject} from 'react';
// A guided energy/information sequence complements real joints. It does not
// pretend that stationary electronics, foundations or treatment stages rotate.
export function useWorkingCycle(id:string,running:boolean,still:boolean,root:RefObject<HTMLElement|null>,available?:string){
 const [path,setPath]=useState<string[]>([]),[step,setStep]=useState(0);
 useEffect(()=>{if(!running)return;let live=true;import('@/lib/engineering-guides').then(module=>{const guide=(module.engineeringGuides as Record<string,{path:string[]}>)[id];if(live)setPath((guide?.path||[]).filter(part=>!available||available.split(',').includes(part)));});return()=>{live=false;};},[id,running,available]);
 useEffect(()=>{if(!running||still||!path.length||!root.current)return;const media=matchMedia('(prefers-reduced-motion: reduce)');let timer:ReturnType<typeof setInterval>|undefined,visible=true;function sync(){if(timer)clearInterval(timer);timer=undefined;if(visible&&!document.hidden&&!media.matches)timer=setInterval(()=>setStep(step=>(step+1)%path.length),1400);}const observer=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;sync();});observer.observe(root.current);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);sync();return()=>{if(timer)clearInterval(timer);observer.disconnect();document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);};},[running,still,path,root]);
 return {part:running&&!still?path[step%path.length]||'':'',step:step%Math.max(1,path.length)+1,count:path.length};
}
