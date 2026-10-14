import * as G from '../vendor/anatomy/lathe.mjs';
// Representative construction skins for the existing teaching assemblies.
// These close real enclosure boundaries; they do not substitute for internals.
// Dimensions here follow this model's layout, not a manufacturer's CAD file.
export function completeEnclosure(id,m){
 const {slab,round}=m;
 const sleeve=(F,a,b,R,r)=>{for(let i=0;i<12;i++){const poly=[];for(let j=0;j<=4;j++){const t=(i+j/4)*Math.PI/6;poly.push([Math.cos(t)*R,Math.sin(t)*R]);}for(let j=4;j>=0;j--){const t=(i+j/4)*Math.PI/6;poly.push([Math.cos(t)*r,Math.sin(t)*r]);}m.collarWall(F,poly,a,b);}};
 const panel=(part,name,offset,fn)=>{m.begin(`${part}-${name}`,offset);m.detail(part,'foundations',()=>m.exterior(offset,fn));};
 const lid=(part,x,y,w,d,z,offset=[0,0,110])=>panel(part,'lid',offset,()=>slab(x,y,w,d,z,2,'mid',2));

 const shell=(part,x,y,w,d,r,z,h,t=2)=>{
  panel(part,'edge-left',[-75,0,0],()=>slab(x,y+r,t,d-2*r,z,h,'mid',0));
  panel(part,'edge-right',[75,0,0],()=>slab(x+w-t,y+r,t,d-2*r,z,h,'mid',0));
  panel(part,'edge-front',[0,-85,0],()=>slab(x+r,y,w-2*r,t,z,h,'mid',0));
  panel(part,'edge-back',[0,85,0],()=>slab(x+r,y+d-t,w-2*r,t,z,h,'mid',0));
  for(const [cx,cy,start] of [[x+r,y+r,Math.PI],[x+w-r,y+r,Math.PI*1.5],[x+w-r,y+d-r,0],[x+r,y+d-r,Math.PI*.5]])panel(part,`corner-${start}`,[(cx-(x+w/2))*3,(cy-(y+d/2))*3,0],()=>{const F=G.frameOf([cx,cy,z],[0,0,1],[1,0,0],[0,1,0]);for(let i=0;i<8;i++){const a=start+i*Math.PI/16,b=a+Math.PI/16;m.collarWall(F,[[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(b)*r,Math.sin(b)*r],[Math.cos(b)*(r-t),Math.sin(b)*(r-t)],[Math.cos(a)*(r-t),Math.sin(a)*(r-t)]],0,h);}});
 };
 const half=(part,cx,cy,z,h,R,r,offset)=>panel(part,'back-half',offset,()=>{const F=G.frameOf([cx,cy,z],[0,0,1],[1,0,0],[0,-1,0]);for(let i=12;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;const start=part==='shell'&&[17,18].includes(i)?3:0;m.collarWall(F,[[Math.cos(a)*R,Math.sin(a)*R],[Math.cos(b)*R,Math.sin(b)*R],[Math.cos(b)*r,Math.sin(b)*r],[Math.cos(a)*r,Math.sin(a)*r]],start,h);}});
 if(id==='refrigerator'){
  panel('cabinet','right',[75,0,0],()=>slab(46,-34,2,63,4,120,'mid',1));lid('cabinet',-46,-34,94,63,124);
 }else if(id==='home-console'){
  lid('chassis',-83,-49,166,100,34);
  panel('chassis','front',[0,-75,0],()=>slab(-83,-51,166,2,4,30,'lo',1));
  panel('io','ports',[0,-75,0],()=>{for(const x of [-69,-39,-8,22])slab(x,-52,15,1,10,5,'lo',.4);});
 }else if(id==='laser-printer'){
  panel('frame','right',[80,0,0],()=>slab(82,-47,2,91,4,68,'mid',1));
  lid('frame',-82,-47,166,91,72);
  panel('frame','front',[0,85,0],()=>{slab(-82,42,166,2,4,50,'mid',1);slab(-82,42,12,2,54,18,'mid',1);slab(70,42,14,2,54,18,'mid',1);slab(-70,42,140,2,66,6,'mid',1);slab(-65,43,130,27,50,2,'hi',1);});
 }else if(id==='robot-vacuum'){
  half('chassis',0,0,4,28,62,59,[0,150,0]);
  panel('chassis','lid',[0,0,90],()=>sleeve(G.frameAlong([0,0,32],[0,0,1]),0,2,62,15));
  panel('vision','turret',[0,0,125],()=>{sleeve(G.frameAlong([0,5,34],[0,0,1]),0,9,15,5);round(G.frameAlong([0,5,43],[0,0,1]),0,2,15,'lo');});
 }else if(id==='washing-machine'){
  panel('frame','left',[-90,0,0],()=>slab(-49,-38,2,79,4,111,'mid',1));
  panel('frame','right',[90,0,0],()=>slab(47,-38,2,79,4,111,'mid',1));
  lid('frame',-49,-38,98,79,115,[0,0,145]);
  panel('frame','front',[0,-110,0],()=>{
   const F=G.frameOf([0,-40,54],[0,1,0],[1,0,0],[0,0,1]);
   for(const sx of [-1,1])for(const sz of [-1,1]){const h=sz>0?61:50,poly=[[sx*49,0],[sx*49,sz*h],[0,sz*h]];for(let i=16;i>=0;i--){const a=i*Math.PI/32;poly.push([sx*Math.cos(a)*36,sz*Math.sin(a)*36]);}m.collarWall(F,poly,0,2);}
  });
  panel('door','collar',[0,-165,0],()=>{sleeve(G.frameAlong([0,-41,54],[0,1,0]),0,1,37,26);sleeve(G.frameAlong([0,-40,54],[0,1,0]),0,2,35,26);sleeve(G.frameAlong([0,-38,54],[0,1,0]),0,14,33,26);m.material('glass',()=>round(G.frameAlong([0,-40,54],[0,1,0]),0,1,26,'hi'));});
  panel('controller','face',[0,-110,0],()=>{slab(8,-41,29,1,102,8,'lo',1);round(G.frameAlong([-27,-41,106],[0,1,0]),0,1,5,'hi');});
 }else if(id==='microwave'){
  panel('cavity','right',[80,0,0],()=>slab(63,-44,2,99,4,68,'mid',1));
  lid('cavity',-63,-44,128,99,72);
  panel('controller','fascia',[0,95,0],()=>{slab(19,39,44,2,4,68,'mid',1);slab(26,41,27,1,48,15,'lo',1);for(const z of [15,28])round(G.frameAlong([40,41,z],[0,1,0]),0,2,5,'hi');});
 }else if(id==='inverter-ac'){
  lid('frames',-119,-34,116,52,64);
  panel('frames','indoor-right',[0,0,105],()=>slab(-3,-34,2,52,4,60,'mid',1));
  panel('frames','outdoor-right',[65,0,0],()=>slab(120,-36,2,64,4,60,'mid',1));
  lid('frames',18,-36,104,64,64,[0,0,150]);
  panel('frames','indoor-vanes',[0,80,0],()=>{for(const x of [-119,-3])slab(x,18,2,2,4,60,'mid',.4);for(const z of [17,27,37,47])slab(-117,18,114,2,z,2,'hi',.4);});
 }else if(id==='smart-watch'){
  shell('case',-30,-35,60,70,10,8,15);
 }else if(id==='optical-mouse'){
  shell('shell',-35,-57,70,114,15,4,20);
 }else if(id==='electric-toothbrush'){
  half('handle',0,0,8,98,18,16,[0,50,0]);
  panel('head','neck',[0,0,80],()=>sleeve(G.frameAlong([0,0,108],[0,0,1]),0,9,5,2));
 }else if(id==='wireless-earbuds'){
  half('shell',-35,0,9,28,25,22,[0,0,100]);
  panel('shell','cap',[0,0,100],()=>round(G.frameAlong([-35,0,37],[0,0,1]),0,1,25,'mid'));
  half('case',45,0,9,18,23,20,[0,0,110]);
  panel('case','cap',[0,0,110],()=>round(G.frameAlong([45,0,27],[0,0,1]),0,1,23,'mid'));
 }else if(id==='coffee-barista'){
  panel('frame','right',[80,0,0],()=>slab(55,-34,2,65,4,105,'mid',1));
  lid('frame',-55,-34,112,65,109);
  panel('frame','front',[0,105,0],()=>{slab(-55,31,112,2,44,65,'mid',1);slab(-55,31,15,2,4,40,'mid',1);slab(40,31,17,2,4,40,'mid',1);slab(-26,33,52,1,82,15,'lo',2);});
 }
}
