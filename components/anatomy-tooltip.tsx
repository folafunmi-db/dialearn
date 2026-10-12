'use client';
import {useEffect,useLayoutEffect,useRef,useState,type RefObject} from 'react';
export type Anchor={left:number;top:number;right:number;bottom:number;width:number;height:number};
export function elementAnchor(target:EventTarget|null):Anchor|null{const el=target as Element|null;const node=el?.closest?.('[data-component],[data-assembly]');return node?node.getBoundingClientRect():null;}
export function AnatomyTooltip({content,anchor,stageRef,id}:{content:{name:string;simple:string}|null;anchor:Anchor|null;stageRef:RefObject<HTMLDivElement|null>;id?:string}){
 const [shown,setShown]=useState(false),[last,setLast]=useState(content),[position,setPosition]=useState({left:12,top:40});const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(content){setLast(content);setShown(true);return;}setShown(false);const timer=setTimeout(()=>setLast(null),140);return()=>clearTimeout(timer);},[content?.name,content?.simple]);
 useLayoutEffect(()=>{if(!anchor||!stageRef.current||!box.current)return;const root=stageRef.current.getBoundingClientRect(),width=box.current.offsetWidth,height=box.current.offsetHeight,gap=12;
  const above=anchor.top-root.top-height-gap,below=anchor.bottom-root.top+gap;
  let left=(anchor.left+anchor.right)/2-root.left-width/2,top=above;
  if(above<36){if(anchor.right-root.left+gap+width<root.width-12){left=anchor.right-root.left+gap;top=(anchor.top+anchor.bottom)/2-root.top-height/2;}else top=below;}
  left=Math.max(12,Math.min(left,root.width-width-12));top=Math.max(36,Math.min(top,root.height-height-12));setPosition(current=>Math.abs(current.left-left)<.5&&Math.abs(current.top-top)<.5?current:{left,top});
 },[anchor,last,stageRef]);
 if(!last)return null;return <div ref={box} className="part-tooltip anchored-tooltip" id={id} role="tooltip" aria-hidden={!shown} data-visible={shown} style={{left:position.left,top:position.top}}><div key={last.name}><strong>{last.name}</strong><p>{last.simple}</p></div></div>;
}
