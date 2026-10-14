import * as G from '../vendor/anatomy/lathe.mjs';
import * as k from '../vendor/anatomy/iso-kit.mjs';
// Original representative teaching geometry. Exterior references:
// Xiaomi T302: https://www.mi.com/global/product/xiaomi-electric-toothbrush-t302/
// Sony: https://www.sony.com/en-ae/electronics/headband-headphones/wh-1000xm5
// Shapes use model units and estimated packaging, not manufacturer CAD.
export function buildNewHardware(spec,machine){
 if(!['electric-toothbrush','headphones'].includes(spec.id))return false;
 const box=spec.id==='headphones'?{x:-64,y:-26,w:128,d:52,z:0,h:140}:{x:-16,y:-16,w:32,d:32,z:-4,h:217};
 const m=machine(spec.id,k.boxCorners(box,box.z,box.h),spec.id==='electric-toothbrush'?-90:spec.id==='headphones'?-48:42,22);
 const {slab,round,post,beam}=m;
 const each=(id,move,index,fn)=>{m.begin(`hardware-${id}-${index}`,move);m.detail(id,spec.parts.find(p=>p.id===id)?.stage||'foundations',fn);};
 const at=(id,move,fn)=>{m.begin(id,move);m.detail(id,spec.parts.find(p=>p.id===id)?.stage||'foundations',fn);};
 let covers=0;const mat=(key,fn)=>m.material(key,fn),cover=(id,move,fn)=>{m.begin(`hardware-${id}-${++covers}`,move);m.detail(id,spec.parts.find(p=>p.id===id)?.stage||'foundations',()=>m.exterior(move,fn));};
 if(spec.id==='electric-toothbrush'){
  at('handle',[0,0,0],()=>{mat('white-polymer',()=>{post(0,0,0,1,10,'hi');for(let i=0;i<48;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24;m.collarWall(G.frameAlong([0,0,0],[0,0,1]),[[10*Math.cos(a),10*Math.sin(a)],[10*Math.cos(b),10*Math.sin(b)],[8.5*Math.cos(b),8.5*Math.sin(b)],[8.5*Math.cos(a),8.5*Math.sin(a)]],1,3);}});post(0,0,1,7,5.5,'mid');post(0,0,66,9,2,'mid');});
  const F=G.frameOf([0,0,0],[0,0,1],[1,0,0],[0,1,0]),profile=[[3,10],[130,10],[137,8],[140,5],[140,2.2],[139,2.2],[136,7],[129,9.1],[3,9.1]];
  for(const a of [0,Math.PI])cover('handle',[0,a===0?80:-80,0],()=>mat('white-polymer',()=>{m.latheHalf(F,[[3,9.1],[3,10],[8,10],[8,9.1]],a,'hi');for(let z=8;z<128;z+=20)m.latheHalf(F,[[z,9.1],[z,10],[z+20,10],[z+20,9.1]],a,'hi');m.latheHalf(F,[[128,9.1],[128,10],[130,10],[137,8],[140,5],[140,2.2],[139,2.2],[136,7],[129,9.1]],a,'hi');}));
  at('battery',[0,45,0],()=>{round(F,8,65,5.5,'mid');round(F,65,66,2,'hi');});
  at('drive',[-40,0,0],()=>{round(F,75,105,5.8,'mid');round(F,105,108,2.5,'hi');});
  at('shaft',[0,0,55],()=>m.motion({pivot:[0,0,108],axis:[0,0,1],ratio:2,mode:'oscillate',amplitude:.035},()=>[108,110,137,140].forEach((z,i)=>round(F,z,[110,137,140,145][i],1.5,'hi'))));
  at('pressure',[0,0,35],()=>(()=>{for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;m.collarWall(F,[[3*Math.cos(a),3*Math.sin(a)],[3*Math.cos(b),3*Math.sin(b)],[1.5*Math.cos(b),1.5*Math.sin(b)],[1.5*Math.cos(a),1.5*Math.sin(a)]],108,110);}})());
  at('head',[0,0,80],()=>m.motion({pivot:[0,0,140],axis:[0,0,1],ratio:2,mode:'oscillate',amplitude:.035},()=>mat('white-polymer',()=>{
   m.lathe(F,[[140,1.6],[140,5],[150,5],[179,3.8],[185,3.8],[185,0],[183,0],[183,2],[150,2],[140,1.6]],'hi');
   const front=G.frameOf([0,-2,0],[0,1,0],[1,0,0],[0,0,1]);m.collarWall(front,k.roundedPlan({x:-4.5,y:183,w:9,d:28,r:4.5},12),0,5);
   for(let i=-1;i<=1;i++)for(let j=0;j<5;j++)round(G.frameAlong([i*2.5,-2,187+j*4.5],[0,-1,0]),0,5+.6*Math.cos(j),.7,'hi');
  })));
  at('controller',[0,-30,0],()=>{slab(-3,-8,6,1.1,12,47,'mid',.3);for(const z of [22,40])slab(-2,-8.3,4,.3,z,5,'hi',.2);beam([0,-7,59],[0,-5.8,77],.3,'mid');});
  at('button',[0,-55,0],()=>{mat('rubber',()=>round(G.frameAlong([0,-9.7,85],[0,-1,0]),0,.6,3,'lo'));for(const z of [44,52,60,68])round(G.frameAlong([0,-9.9,z],[0,-1,0]),0,.2,.6,'hi');});
  at('charging',[0,0,-25],()=>{mat('white-polymer',()=>round(F,-4,0,14,'hi'));mat('copper',()=>{for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;m.collarWall(F,[[7*Math.cos(a),7*Math.sin(a)],[7*Math.cos(b),7*Math.sin(b)],[6*Math.cos(b),6*Math.sin(b)],[6*Math.cos(a),6*Math.sin(a)]],1,2);}});for(const x of [-6.5,6.5])post(x,0,1,.5,.2,'hi');});
  at('seals',[0,0,60],()=>mat('rubber',()=>(()=>{for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;m.collarWall(F,[[2.2*Math.cos(a),2.2*Math.sin(a)],[2.2*Math.cos(b),2.2*Math.sin(b)],[1.5*Math.cos(b),1.5*Math.sin(b)],[1.5*Math.cos(a),1.5*Math.sin(a)]],137,140);}})()));
 }else if(spec.id==='headphones'){
  const bandF=G.frameOf([0,-3,52],[0,1,0],[1,0,0],[0,0,1]);
  at('headband',[0,0,0],()=>{mat('rubber',()=>{for(let i=5;i<43;i++){const a=i*Math.PI/48,b=(i+1)*Math.PI/48;m.collarWall(bandF,[[40*Math.cos(a),75*Math.sin(a)],[40*Math.cos(b),75*Math.sin(b)],[37*Math.cos(b),72*Math.sin(b)],[37*Math.cos(a),72*Math.sin(a)]],0,6);}});for(let i=0;i<48;i++){const a=i*Math.PI/48,b=(i+1)*Math.PI/48;m.collarWall(bandF,[[45*Math.cos(a),80*Math.sin(a)],[45*Math.cos(b),80*Math.sin(b)],[40*Math.cos(b),75*Math.sin(b)],[40*Math.cos(a),75*Math.sin(a)]],0,6);}});
  for(const side of [-1,1]){
   const x=side*42,F=G.frameOf([x,0,26],[-side,0,0],[0,1,0],[0,0,1]);
   const ellipse=(ry,rz)=>Array.from({length:48},(_,i)=>[Math.cos(i*Math.PI/24)*ry,Math.sin(i*Math.PI/24)*rz]);
   at('yokes',[side*15,0,0],()=>beam([x,0,50],[x,0,52],2,'mid'));
   cover('cups',[side*140,0,0],()=>mat('plastic',()=>{m.collarWall(F,ellipse(18,24),-10,-9);for(let i=0;i<48;i++){if([35,36].includes(i))continue;const a=i*Math.PI/24,b=(i+1)*Math.PI/24;m.collarWall(F,[[18*Math.cos(a),24*Math.sin(a)],[18*Math.cos(b),24*Math.sin(b)],[16*Math.cos(b),22*Math.sin(b)],[16*Math.cos(a),22*Math.sin(a)]],-9,6);}}));
   cover('cushions',[-side*38,0,0],()=>mat('rubber',()=>{for(let i=0;i<48;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24;m.collarWall(F,[[20*Math.cos(a),26*Math.sin(a)],[20*Math.cos(b),26*Math.sin(b)],[12*Math.cos(b),18*Math.sin(b)],[12*Math.cos(a),18*Math.sin(a)]],6,11);}}));
   at('drivers',[-side*25,0,0],()=>{round(F,-3,-2,15,'mid');round(F,-9,-3,.7,'mid');round(F,-2,-1,2,'mid');round(F,-2,3,15.5,'mid',14.5);m.motion({pivot:[x,0,26],axis:F.a,ratio:2,mode:'vibrate',amplitude:.15},()=>mat('acoustic-mesh',()=>round(F,3,3.3,15,'lo')));});
   at('magnets',[0,-35,0],()=>round(F,-1,1,5.5,'mid'));
   at('coils',[0,-60,0],()=>mat('copper',()=>round(F,1,3,5.5,'hi',4.2)));
   at(side<0?'radio':'battery',[0,side*80,0],()=>{const lo=side<0?-50:45;if(side<0){mat('pcb',()=>slab(lo,6,1,7,18,16,'mid',.3));mat('plastic',()=>slab(lo+1,7.5,.6,4,22,8,'hi',.2));}else slab(lo,6,5,7,18,16,'mid',1);beam([x+side*9,9,21],[x+side*8,9,21],1,'mid');});
   at('microphones',[0,-30,0],()=>{for(const z of [16,36])round(G.frameAlong([x, -16.3,z],[0,-1,0]),0,.4,1.2,'lo');});
   at('controls',[0,30,0],()=>{for(const z of [22,28])slab(x-side*2,17.6,2,1,z,2,'hi',.3);});
   at('charging',[0,0,-24],()=>slab(x-side*2,-2.3,4,4.6,2,2,'lo',.6));
  }
 }
 m.finish();return true;
}
