import * as k from '../vendor/anatomy/iso-kit.mjs';
import * as G from '../vendor/anatomy/lathe.mjs';
// Reference silhouettes: 45mm Series 8 and 43mm Watch6 Classic. Internal
// positions are a teaching arrangement, not manufacturer CAD or service data.
export function buildWatch(spec,machine){
 if(!['smart-watch','galaxy-watch6-classic'].includes(spec.id))return false;
 const circular=spec.id==='galaxy-watch6-classic',w=circular?43:38,d=circular?43:45;
 const m=machine(spec.id,k.boxCorners({x:-25,y:-70,w:53,d:140},-2,65),38,35);
 const {slab,round,post,beam}=m;
 const part=(id,offset,fn)=>{m.begin(id,offset);m.detail(id,'foundations',fn);};
 const mat=(key,fn)=>m.material(key,fn);
 const annulus=(z,h,R,r)=>{for(let i=0;i<48;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24;m.plate([[R*Math.cos(a),R*Math.sin(a)],[R*Math.cos(b),R*Math.sin(b)],[r*Math.cos(b),r*Math.sin(b)],[r*Math.cos(a),r*Math.sin(a)]],z,h,'hi');}};
 const face=G.frameAlong([0,0,0],[0,0,1]);
 part('case',[0,0,0],()=>{
  mat(circular?'steel':'graphite',()=>{
   if(circular){round(face,0,1.2,21.5);annulus(1.2,8,21.5,19.8);annulus(8.8,.4,19.8,18);for(const y of [-25,21])for(const x of [-10,8])slab(x,y,2,4,1,3,'hi',.8);}
   else {slab(-19,-22.5,38,45,0,1.3,'hi',9);const outer=k.roundedPlan({x:-19,y:-22.5,w:38,d:45,r:9},8),inner=k.roundedPlan({x:-17.8,y:-21.3,w:35.6,d:42.6,r:7.8},8);for(let i=0;i<outer.length;i++){const j=(i+1)%outer.length;m.plate([outer[i],outer[j],inner[j],inner[i]],1.3,8.8,'hi');}}
  });
  mat('rubber',()=>{for(const sign of [-1,1]){const y=sign<0?-68:d/2;slab(-10,y,20,68-d/2,1.5,2.5,'hi',5);}});
  mat('steel',()=>{slab(-9,-58,18,2,4,.5,'mid',.5);slab(-9,-60,2,12,4,1);slab(7,-60,2,12,4,1);});
  mat('plastic',()=>{for(let i=0;i<7;i++)post(0,34+i*4,4,.1,1,'hi');});
 });
 part('optical',[0,0,-12],()=>{mat('ceramic',()=>round(face,-1.2,0,10));mat('screen',()=>{round(face,-1.5,-1.2,8);for(let i=0;i<4;i++){const a=i*Math.PI/2;post(Math.cos(a)*4,Math.sin(a)*4,-1.6,.1,1.2);}});});
 part('charging',[0,0,-20],()=>mat('copper',()=>round(face,.05,.5,9,'hi',7.6)));
 part('battery',[0,0,16],()=>mat('battery',()=>slab(-15,-12,20,24,circular?1.2:1.3,3.3,'hi',circular?5:3)));
 part('processor',[0,0,27],()=>{mat('pcb',()=>slab(6,-12,8,24,circular?1.2:1.3,1,'hi',2));mat('chip',()=>slab(6.5,-10,7,13,circular?2.2:2.3,2,'hi',1));});
 for(const [id,y] of [['imu',5],['radio',10]])part(id,[id==='imu'?-16:16,0,35],()=>mat('chip',()=>slab(8,y,4,3,circular?2.2:2.3,1.2,'hi',.5)));
 part('haptics',[0,0,20],()=>{mat('steel',()=>slab(-8,12,16,4,circular?1.2:1.3,4,'hi',1));});
 part('controls',[10,0,0],()=>mat(circular?'steel':'graphite',()=>{
  if(circular){for(const y of [-9,9])slab(20,y-2,4,4,3,3,'hi',1);}
  else {round(G.frameAlong([19,8,5.5],[1,0,0]),0,3.5,3);for(let i=0;i<24;i++){const a=i*Math.PI/12;beam([20.5,8+Math.cos(a)*3,5.5+Math.sin(a)*3],[22,8+Math.cos(a)*3,5.5+Math.sin(a)*3],.18);}slab(19,-12,1.5,8,3.5,2,'hi',1);}
 }));
 if(circular)part('bezel',[0,0,50],()=>mat('steel',()=>{annulus(9.2,1.8,21.5,18.7);for(let i=0;i<60;i++){const a=i*Math.PI/30;beam([Math.cos(a)*20.9,Math.sin(a)*20.9,11],[Math.cos(a)*21.5,Math.sin(a)*21.5,11],.18,'mid');}}));
 part('display',[0,0,38],()=>{
  mat('screen',()=>{if(circular)round(face,9.2,11.3,18.5);else slab(-18,-21.5,36,43,10.1,1.2,'hi',8);});
  mat('aluminium',()=>{for(let i=0;i<12;i++){const a=i*Math.PI/6,r=circular?16:14;beam([Math.sin(a)*(r-1),Math.cos(a)*(r-1),11.4],[Math.sin(a)*r,Math.cos(a)*r,11.4],.4);}post(0,0,11.3,1.4,.8);beam([0,0,11.9],[-7,4,11.9],.8);beam([0,0,12.3],[5,9,12.3],.6);});
  mat('red-plastic',()=>beam([0,0,12.6],[2,-12,12.6],.25));
 });
 m.finish();return true;
}
