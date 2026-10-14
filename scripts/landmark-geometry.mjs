import * as G from '../vendor/anatomy/lathe.mjs';
import * as k from '../vendor/anatomy/iso-kit.mjs';
const ids=new Set(['raptor-1','raptor-2','raptor-3','raptor-vacuum','wtc-bathtub','channel-tunnel','golden-gate-bearings','burj-foundation','hoover-galleries','lagos-revetment','third-mainland-joints','civic-towers-foundation']);
export function buildLandmark(spec,machine){
 if(!ids.has(spec.id))return false;
 const rocket=spec.id.startsWith('raptor'),m=machine(spec.id,k.boxCorners({x:-150,y:-110,w:300,d:220},0,rocket?190:145),38,28),{slab,post,round:rawRound,beam,screw,lathe}=m;
 const at=(id,fn)=>{m.begin(id);m.detail(id,spec.parts.find(p=>p.id===id)?.stage||'foundations',fn);};
 const base=(id,w=260,d=180)=>at(id,()=>{slab(-w/2,-d/2,w,d,0,4,'lo',5);for(const x of [-w/2+7,w/2-7])for(const y of [-d/2+7,d/2-7])screw(x,y,4);});
 const box=(id,x,y,w,d,z=4,h=12)=>at(id,()=>{slab(x,y,w,d,z,h,'mid',2);for(const xx of [x+3,x+w-3])screw(xx,y+3,z+h);});
 const board=(id,x,y,w=24,d=14)=>at(id,()=>{slab(x,y,w,d,4,2,'mid',1);slab(x+5,y+3,w-10,d-6,6,2,'hi',.5);for(let i=0;i<4;i++)post(x+2+i*(w-4)/3,y+d-2,6,1,.5,'hi');});
 const wall=(F,s0,s1,r,inner,start=-Math.PI/2,end=Math.PI/2)=>{for(let i=0,n=rocket?16:8;i<n;i++){const a=start+(end-start)*i/n,b=start+(end-start)*(i+1)/n,poly=[];for(let j=0;j<=4;j++){const t=a+(b-a)*j/4;poly.push([r*Math.cos(t),r*Math.sin(t)]);}for(let j=4;j>=0;j--){const t=a+(b-a)*j/4;poly.push([inner*Math.cos(t),inner*Math.sin(t)]);}m.collarWall(F,poly,s0,s1);}};
 const round=(F,s0,s1,r,tone='hi',inner=0)=>{if(!inner||!rocket&&r<=4)return rawRound(F,s0,s1,r,tone,inner);for(let j=0,n=Math.max(1,Math.ceil((s1-s0)/(rocket?12:20)));j<n;j++)wall(F,s0+(s1-s0)*j/n,s0+(s1-s0)*(j+1)/n,r,inner,0,Math.PI*2);};
 const pipe=(id,points,r=1.1)=>at(id,()=>{for(let i=1;i<points.length;i++)beam(points[i-1],points[i],r*2,'mid');});
 const shaftRotor=(id,x,y,z,r=7)=>at(id,()=>{m.motion({pivot:[x,y,z],axis:[0,0,1],ratio:1},()=>{round(G.frameAlong([x,y,z],[0,0,1]),0,2,3,'hi',1.8);for(let i=0;i<10;i++){const a=i*Math.PI/5;beam([x+Math.cos(a)*3,y+Math.sin(a)*3,z+1],[x+Math.cos(a)*r,y+Math.sin(a)*r,z+1],.7,'hi');}});});
 if(rocket){
  const vacuum=spec.id==='raptor-vacuum',version=spec.id==='raptor-1'?1:spec.id==='raptor-2'?2:3;
  base('mount',240,170);at('mount',()=>{for(const x of [-94,86])slab(x,-6,8,12,4,162,'mid',2);slab(-94,-6,188,12,166,8,'mid');for(const x of [-27,27])post(x,0,119,47,1.5,'hi');});
  at('nozzle',()=>lathe(G.frameAlong([0,0,0],[0,0,1]),[[12,vacuum?55:35],[22,vacuum?39:27],[38,19],[53,9],[55,9],[55,11],[38,21],[22,vacuum?41:29],[12,vacuum?57:37]],'hi'));
  at('throat',()=>round(G.frameAlong([0,0,55],[0,0,1]),0,3,11,'mid',9));
  at('chamber',()=>lathe(G.frameAlong([0,0,0],[0,0,1]),[[58,11],[73,20],[110,20],[112,21],[112,19],[73,18],[58,9]],'hi'));
  at('injector',()=>{post(0,0,112,4,21,'mid');for(let i=0;i<3;i++)for(let j=0;j<8;j++){const a=j*Math.PI/4;screw(Math.cos(a)*(4+i*5),Math.sin(a)*(4+i*5),116,'hi',.45);}});
  at('retainers',()=>{round(G.frameAlong([0,0,116],[0,0,1]),0,3,30,'mid',19);for(const x of [-27,27])screw(x,0,119);for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;post(Math.cos(a)*26,Math.sin(a)*26,119,2,1.1,'hi');}});
  at('cooling-jacket',()=>{round(G.frameAlong([0,0,73],[0,0,1]),0,37,22,'mid',20);for(let i=0;i<12;i++){const a=i*Math.PI/6;round(G.frameAlong([Math.cos(a)*22,Math.sin(a)*22,74],[0,0,1]),0,34,.5,'hi');}});
  for(const [id,x] of [['fuel-pump',-56],['oxygen-pump',56]])at(id,()=>{if(vacuum){post(x,-20,4,65,2,'mid');beam([x,-20,69],[x,0,71],2,'mid');}else post(x,0,4,69,2,'mid');round(G.frameAlong([x,0,72],[0,0,1]),0,1,14,'mid');post(x,0,73,33,1.8,'hi');round(G.frameAlong([x,0,73],[0,0,1]),0,29,14,'mid',9);round(G.frameAlong([x,0,102],[0,0,1]),0,3,14,'hi',2);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])screw(x+Math.cos(a)*11,Math.sin(a)*11,105);});
  shaftRotor('fuel-inducer',-56,0,74,7);shaftRotor('oxygen-inducer',56,0,74,7);shaftRotor('fuel-turbine',-56,0,106,10);shaftRotor('oxygen-turbine',56,0,106,10);
  for(const [id,x] of [['fuel-preburner',-56],['oxygen-preburner',56]])at(id,()=>{post(x,-35,4,73,2,'mid');round(G.frameAlong([x,-35,75],[0,0,1]),0,2,7,'mid',2);lathe(G.frameAlong([x,-35,0],[0,0,1]),[[77,7],[80,10],[104,10],[108,7],[108,5],[104,8],[80,8],[77,5]],'mid');post(x,-35,108,3,7,'hi');for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])screw(x+Math.cos(a)*5,-35+Math.sin(a)*5,111);});
  for(const [id,x] of [['fuel-inlet',-56],['oxygen-inlet',56]])at(id,()=>{post(x,29,4,60,3,'mid');round(G.frameAlong([x,29,64],[0,0,1]),0,3,9,'hi',3);});
  for(const [id,x] of [['fuel-valve',-56],['oxygen-valve',56]])at(id,()=>{slab(x-6,24,12,10,67,7,'mid');post(x,29,74,7,4,'hi');});
  pipe('fuel-manifold',[[-56,29,81],[-56,29,87],[-56,15.3,87]],1.3);pipe('oxygen-manifold',[[56,29,81],[56,29,87],[56,15.3,87]],1.3);
  pipe('fuel-duct',[[-56,-14,104],[-56,-20,104],[-30,-20,104],[-30,-20,124],[0,-20,124],[0,-16,124],[0,-16,116]],1);pipe('oxygen-duct',[[56,14,104],[56,20,104],[30,20,104],[30,20,124],[0,20,124],[0,16,124],[0,16,116]],1);
  pipe('fuel-preburner',[[-56,-35,111],[-56,-35,114],[-56,-8,114],[-56,-8,108]],1);pipe('oxygen-preburner',[[56,-35,111],[56,-35,114],[56,-8,114],[56,-8,108]],1);
  at('gimbal',()=>round(G.frameAlong([0,0,158],[0,0,1]),0,8,14,'hi',8));
  for(const x of [-42,42])at('actuators',()=>{post(x,-45,4,116,1.5,'mid');round(G.frameAlong([x,-45,120],[0,0,1]),0,18,5,'hi',2);post(x,-45,138,14,2,'hi');beam([x,-45,152],[x,-6,168],2,'mid');});
  board('ignition',-80,42,25,18);board('pressure',-86,12,25,18);at('pressure',()=>round(G.frameAlong([-74,21,8],[0,0,1]),0,2,4,'hi'));
  board('temperature',64,12,25,18);at('temperature',()=>{for(let i=0;i<3;i++)post(72+i*5,18,8,6,.6,'hi');});
  board('controller',-25,46,50,24);at('controller',()=>{for(let i=0;i<version;i++)slab(-20+i*14,52,10,12,8,1,'hi');});
  pipe('harness',[[-55,49,6.7],[-40,49,6.7],[-40,57,6.7],[-25,57,6.7]],.7);pipe('harness',[[25,57,6.7],[42,57,6.7],[42,21,6.7],[64,21,6.7]],.7);pipe('harness',[[-72,30,6.7],[-72,42,6.7]],.7);
 }else if(['burj-foundation','civic-towers-foundation'].includes(spec.id)){
  base('ground',220,170);at('ground',()=>{for(const z of [4,24,44])slab(-105,-77,9,150,z,20,z===24?'mid':'lo',0);});
  const positions=[];for(const x of [-55,0,55])for(const y of [-40,0,40])positions.push([x,y]);
  at('piles',()=>{for(const [x,y] of positions)round(G.frameAlong([x,y,4],[0,0,1]),0,62,7,'mid',4.5);});
  at('cages',()=>{for(const [x,y] of positions){for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])post(x+Math.cos(a)*3.3,y+Math.sin(a)*3.3,4,62,.5,'hi');for(const z of [5,20,35,50,64])round(G.frameAlong([x,y,z],[0,0,1]),0,.5,3.8,'mid',3);}});
  at('heads',()=>{for(const [x,y] of positions)post(x,y,66,3,8,'hi');});
  at('raft',()=>slab(-75,-60,150,120,69,10,'mid',3));
  at('lower-steel',()=>{for(const x of [-70,-40,-10,20,50,70])slab(x,-58,1,116,79,.8,'hi',0);});
  at('upper-steel',()=>{for(const y of [-55,-25,5,35,55])slab(-73,y,146,1,79.8,.8,'hi',0);});
  at('core',()=>{slab(-25,-20,50,40,80.6,7,'mid');for(const x of [-20,18])slab(x,-16,4,32,87.6,43,'hi');slab(-16,-16,34,4,87.6,43,'mid');});
  at('waterproofing',()=>slab(-75,60,150,1,69,10,'hi',0));
  at('joints',()=>slab(75,-59,1,118,69,10,'hi',0));
  board('monitoring',77,22,21,21);box('formation',78,-59,18,68,4,40);
 }else if(spec.id==='wtc-bathtub'){
  base('bedrock',260,190);at('slurry-wall',()=>{for(const x of [-75,-23,29])slab(x,-52,50,3,4,74,'mid',0);slab(-78,-52,3,104,4,74,'mid',0);slab(77,-52,3,104,4,74,'mid',0);});
  at('joints',()=>{for(const x of [-25,27])slab(x,-52,2,3,4,74,'hi',0);});
  at('columns',()=>{for(const x of [-48,48])for(const y of [-24,24])post(x,y,4,20,4,'mid');for(const x of [-48,48])for(const y of [-24,24])post(x,y,30,44,3,'hi');});
  at('raft',()=>slab(-65,-39,130,78,24,6,'mid',2));
  at('anchors',()=>{for(const x of [-52,52])beam([x,-52.5,54],[x,-82,30],2,'hi');});
  at('cages',()=>{for(const x of [-63,-39,0,39,63])post(x,-46,4,70,1,'hi');for(const z of [15,35,55])beam([-63,-46,z],[63,-46,z],1,'mid');});
  at('liner',()=>slab(-71,-44,2,87,4,73,'hi',0));
  at('penetrations',()=>{post(100,40,4,20,2,'mid');round(G.frameAlong([100,40,24],[0,0,1]),0,2,6,'hi',2);});
  box('drainage',88,-40,25,24,4,12);board('monitoring',86,-9,26,19);box('groundwater',86,15,27,18,4,55);
 }else if(spec.id==='channel-tunnel'){
  base('ground',280,200);at('ground',()=>{for(const y of [-56,-24,-11,11,24,56]){if(Math.abs(y)===24){slab(-108,y-1,98,2,4,16,'mid',0);slab(10,y-1,98,2,4,16,'mid',0);}else slab(-108,y-1,216,2,4,16,'mid',0);}});
  at('rail-bores',()=>{for(const y of [-40,40])for(let j=0;j<6;j++)wall(G.frameOf([0,y,20],[1,0,0],[0,0,1],[0,-1,0]),-108+j*36,-73+j*36,16,13);});
  at('service-bore',()=>{for(let j=0;j<6;j++)wall(G.frameOf([0,0,20],[1,0,0],[0,0,1],[0,-1,0]),-108+j*36,-73+j*36,11,9);});
  at('track',()=>{for(const y of [-40,40]){slab(-100,y-7,200,14,4,2,'mid',0);for(const yy of [y-4,y+4])slab(-100,yy-1,200,2,6,3,'hi',0);for(let i=0;i<10;i++)slab(-95+i*20,y-6,3,12,6,1,'mid',0);}});
  at('walkways',()=>{for(const y of [-40,40])for(const dy of [-9,9]){slab(-100,y+dy-1,200,2,12,2,'hi',0);for(const x of [-104,100])slab(x,y+dy-1,4,2,4,8,'mid',0);}});
  at('cross-passages',()=>{for(const y of [-26,12]){slab(-10,y,20,14,4,2,'mid',0);for(const x of [-10,8])slab(x,y,2,14,6,12,'hi',0);slab(-10,y,20,14,18,2,'mid',0);}});
  at('doors',()=>{for(const y of [-27,26])slab(-6,y,12,1,6,12,'mid',1);});
  at('catenary',()=>{for(const y of [-40,40]){for(const x of [-112,112])post(x,y,4,27,.7,'mid');beam([-112,y,31],[112,y,31],.6,'hi');}});
  pipe('cooling',[[-112,64,4],[-112,64,16],[112,64,16],[112,64,4]],1.1);box('ventilation',-132,-83,30,18,4,19);box('drainage',96,-81,30,18,4,11);board('signals',-20,67,42,19);
 }else if(spec.id==='golden-gate-bearings'){
  base('pier',160,140);at('pier',()=>slab(-43,-43,86,86,4,20,'mid',4));
  at('seat',()=>slab(-39,-39,78,78,24,4,'hi',2));
  at('lower-plate',()=>slab(-36,-36,72,72,28,4,'mid',2));
  for(let i=0;i<7;i++){at('rubber',()=>round(G.frameAlong([0,0,32+i*5],[0,0,1]),0,3,29,'mid',7));if(i<6)at('steel',()=>round(G.frameAlong([0,0,35+i*5],[0,0,1]),0,2,29,'hi',7));}
  at('core',()=>post(0,0,32,33,7,'hi'));
  at('upper-plate',()=>slab(-36,-36,72,72,65,4,'mid',2));
  at('deck',()=>slab(-65,-42,130,84,69,9,'hi',3));
  at('anchors',()=>{for(const x of [-32,32])for(const y of [-32,32]){post(x,y,32,1.5,1.3,'hi');screw(x,y,33.5);}});
  box('restraint',-70,45,18,15,4,29);board('monitor',34,46,27,18);box('cover',-16,48,32,17,4,13);
 }else if(spec.id==='third-mainland-joints'){
  base('pier',220,150);at('pier',()=>{for(const x of [-63,37])slab(x,-27,26,54,4,30,'mid',2);});
  at('seat',()=>{for(const x of [-65,35])slab(x,-30,30,60,34,3,'hi',1);});
  at('plates',()=>{for(const x of [-64,36]){slab(x,-27,28,54,37,3,'mid',1);slab(x,-27,28,54,49,3,'mid',1);}});
  at('bearing',()=>{for(const x of [-50,50])for(let i=0;i<3;i++)round(G.frameAlong([x,0,40+i*3],[0,0,1]),0,3,13,'hi');});
  at('deck',()=>{slab(-94,-38,86,76,52,8,'mid',2);slab(8,-38,86,76,52,8,'mid',2);});
  at('edge-beams',()=>{for(const x of [-8,6])slab(x,-38,2,76,52,8,'hi',0);});
  at('joint',()=>{for(const y of [-30,-10,10,30])slab(-6,y,12,3,55,3,'hi',0);});
  at('seals',()=>{for(const y of [-26,-6,14])slab(-6,y,12,6,55,1,'mid',0);});
  at('anchors',()=>{for(const x of [-12,12])for(const y of [-30,0,30]){post(x,y,60,1,1.2,'hi');screw(x,y,61);}});
  pipe('drainage',[[-94,44,4],[-94,44,46],[94,44,46],[94,44,4]],1.2);box('restraint',-92,-64,30,18,4,17);board('monitor',57,-64,28,18);
 }else if(spec.id==='hoover-galleries'){
  base('foundation',240,180);at('concrete',()=>{for(const x of [-84,-40,4,48])slab(x,-50,42,24,4,105,'mid',1);for(const x of [-84,48])slab(x,-26,42,76,4,18,'mid',1);});
  at('joints',()=>{for(const x of [-42,2,46])slab(x,-50,2,24,4,105,'hi',0);});
  at('gallery',()=>{slab(-40,-22,88,46,4,3,'hi',0);for(const y of [-22,21])slab(-40,y,88,3,7,24,'mid',0);slab(-40,-22,88,46,31,3,'mid',0);});
  at('access',()=>{slab(-37,-18,82,36,7,1,'hi',0);for(const x of [-36,42])slab(x,-17,2,34,8,2,'mid',0);});
  at('collection',()=>slab(-36,25,80,4,4,2,'mid',0));
  at('drains',()=>{for(const x of [-31,0,31])post(x,28,6,17,.7,'hi');});
  at('waterstops',()=>{for(const x of [-42,2,46])slab(x,-25,2,1,4,103,'mid',0);});
  at('grout',()=>{for(const x of [-65,0,65])post(x,-59,4,36,1.4,'hi');});
  board('instruments',-111,58,28,19);board('services',80,58,27,19);box('upstream',-30,-84,60,23,4,46);
 }else if(spec.id==='lagos-revetment'){
  base('formation',260,180);
  const slope=G.unit3([62,0,48]),normal=[-slope[2],0,slope[0]],origin=[-28,0,4],point=(t,n)=>[origin[0]+62*t+normal[0]*n,0,origin[2]+48*t+normal[2]*n];
  at('core',()=>m.collarWall(G.frameOf([0,0,0],[0,1,0],[1,0,0],[0,0,1]),[[-28,4],[34,4],[34,52]],-65,65));
  for(const [id,n] of [['filter',0],['underlayer',3]])at(id,()=>{const a=point(0,n),b=point(1,n),c=point(1,n+3),d=point(0,n+3);m.collarWall(G.frameOf([0,0,0],[0,1,0],[1,0,0],[0,0,1]),[a,b,c,d].map(p=>[p[0],p[2]]),-65,65);});
  at('armour',()=>{for(let i=0;i<5;i++)for(let j=0;j<6;j++){const p=point((i+.5)/5,6);p[1]=-57+j*23;const cross=[[-4,-2],[-2,-2],[-2,-4],[2,-4],[2,-2],[4,-2],[4,2],[2,2],[2,4],[-2,4],[-2,2],[-4,2]];m.collarWall(G.frameOf(p,normal,slope,[0,1,0]),cross,0,8);}});
  at('toe',()=>slab(-58,-70,14,140,4,7,'mid',2));
  at('crest',()=>slab(34,-68,9,136,4,51,'hi',1));
  box('backfill',46,-67,42,134,4,42);pipe('drainage',[[94,-65,4],[94,-65,13],[94,65,13],[94,65,4]],1.2);
  at('joints',()=>{slab(89,-67,2,134,4,42,'mid',0);});board('survey',93,69,25,15);box('water',-118,-66,35,132,4,13);
 }
 m.finish();return true;
}
