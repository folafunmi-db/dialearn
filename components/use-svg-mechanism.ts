'use client';
import {useEffect,useRef,type RefObject} from 'react';
import {mechanismPose,type MechanismMotion} from '@/lib/mechanism-motion';
// One clock drives every joint. The 2D matrix is the actual projection of the
// rotating joint plane, so an oblique wheel does not spin as a flat screen disc.
export function useSvgMechanism(root:RefObject<HTMLElement|null>,running:boolean,still:boolean,revision:unknown){
 const phase=useRef(0);
 useEffect(()=>{
  const host=root.current;if(!host)return;const media=matchMedia('(prefers-reduced-motion: reduce)');
  const joints=[...host.querySelectorAll<SVGGElement>('[data-spin]')].map(el=>({el,b:el.dataset.spin!.split(',').map(Number),ratio:Number(el.dataset.ratio||1),motion:el.dataset.motion?JSON.parse(el.dataset.motion) as MechanismMotion&{axes:number[][]}:null}));
  let frame=0,last=0,visible=true;
  function draw(){for(const {el,b,ratio,motion} of joints){const [a,c,bx,d,px,py]=b,det=a*d-bx*c;if(Math.abs(det)<1e-8)continue;const pose=motion?mechanismPose(motion,phase.current):{angle:phase.current*ratio,offset:[0,0,0]};const cos=Math.cos(pose.angle),sin=Math.sin(pose.angle);const u=a*cos+bx*sin,v=c*cos+d*sin,w=-a*sin+bx*cos,x=-c*sin+d*cos;const aa=(u*d-w*c)/det,bb=(v*d-x*c)/det,cc=(-u*bx+w*a)/det,dd=(-v*bx+x*a)/det;const shift=motion?motion.axes.reduce((sum,axis,i)=>[sum[0]+axis[0]*pose.offset[i],sum[1]+axis[1]*pose.offset[i]],[0,0]):[0,0];el.setAttribute('transform',`matrix(${aa} ${bb} ${cc} ${dd} ${px-aa*px-cc*py+shift[0]} ${py-bb*px-dd*py+shift[1]})`);}}
  function tick(now:number){frame=0;if(!visible||document.hidden||media.matches||still||!running)return;const dt=last?Math.min((now-last)/1000,1/30):0;last=now;phase.current+=dt*12*Math.PI/30;draw();frame=requestAnimationFrame(tick);}
  function kick(){last=0;if(!frame&&visible&&!document.hidden&&!media.matches&&!still&&running)frame=requestAnimationFrame(tick);}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function visibility(){if(document.hidden)stop();else kick();}
  const observer=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;if(visible)kick();else stop();});observer.observe(host);media.addEventListener('change',visibility);document.addEventListener('visibilitychange',visibility);draw();kick();
  return()=>{stop();observer.disconnect();media.removeEventListener('change',visibility);document.removeEventListener('visibilitychange',visibility);};
 },[root,running,still,revision]);
}
