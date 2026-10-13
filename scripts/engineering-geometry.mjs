import * as G from '../vendor/anatomy/lathe.mjs';
// Original component layouts for Dialearn, not borrowed collection figures.
export function engineeringGeometry(id,m){
 const {begin,detail,slab,post,round,beam,screw,ring}=m;
 const pkg=(parent,move,key,x,y,z,w=8,d=6)=>{begin(parent,move);detail(key,'engineering',()=>{slab(x,y,w,d,z,1.4,'hi',.7);for(let i=0;i<3;i++){slab(x+1+i*(w-2)/3,y-.7,1,.7,z,.5,'mid',.1);slab(x+1+i*(w-2)/3,y+d,1,.7,z,.5,'mid',.1);}});};
 const logic=(parent,move,key,x,y,z,w,d)=>{begin(parent,move);detail(key,'engineering',()=>slab(x,y,w,d,z,.12,'mid',.2));};
 const cap=(parent,move,key,x,y,z,count=5)=>{begin(parent,move);detail(key,'engineering',()=>{for(let i=0;i<count;i++){slab(x+i*3,y,2,3,z,1,'mid',.3);slab(x+i*3,y,0.4,3,z+1,.2,'hi',0);slab(x+i*3+1.6,y,.4,3,z+1,.2,'hi',0);}});};
 if(id==='controller'){
  logic('board',[0,0,47],'adc',-7,-13,16,5,5);pkg('board',[0,0,47],'usb',-10,7,12,20,5);pkg('board',[0,0,47],'clock',-27,-14,12,10,5);cap('board',[0,0,47],'capacitors',46,5,12,5);pkg('board',[0,0,47],'diodes',-71,5,12,7,4);
 }else if(id==='console'){
  pkg('compute',[0,0,47],'ram',56,8,7,12,18);pkg('compute',[0,0,47],'regulator',10,25,7,12,5);pkg('compute',[0,0,47],'audio',52,25,7,16,5);
  begin('compute',[0,0,47]);detail('heatpipe','engineering',()=>slab(17,-30,28,2,10,1,'mid',1));
  detail('fan','engineering',()=>{slab(69,20,14,19,5,2,'mid',3);post(76,29.5,7,2,7,'lo');post(76,29.5,9,2,2,'hi');for(let i=0;i<6;i++){const a=i*Math.PI/3;beam([76+Math.cos(a)*2,29.5+Math.sin(a)*2,10],[76+Math.cos(a)*6,29.5+Math.sin(a)*6,10],1.1,'mid');}});
 }else if(id==='drone'){
  pkg('controller',[0,0,51],'radio',-22,-23,23,10,10);pkg('controller',[0,0,51],'barometer',15,-13,23,7,6);
  begin('motors',[0,0,78]);for(const x of [-78,78])for(const y of [-78,78]){
   detail('windings','engineering',()=>{for(let i=0;i<12;i++){const a=i*Math.PI/6;post(x+Math.cos(a)*4.6,y+Math.sin(a)*4.6,14,10,.65,'mid');}});
   detail('magnets','engineering',()=>m.motion({pivot:[x,y,21],axis:[0,0,1],ratio:x*y>0?1:-1},()=>{for(let i=0;i<14;i++){const a=i*Math.PI/7;post(x+Math.cos(a)*6.2,y+Math.sin(a)*6.2,14,13,.45,'hi');}}));
   detail('bearings','engineering',()=>{const F=G.frameAlong([x,y,14],[0,0,1]);round(F,0,1.5,2.4,'mid',1.5);round(F,12,13.5,2.4,'mid',1.5);});
  }
 }else if(id==='car'){
  begin('drive',[0,0,67]);const axis=G.frameAlong([0,91,43.5],[1,0,0]);
  detail('windings','engineering',()=>{slab(-13,85,1,12,37,2,'mid',0);round(axis,-13,-12,6,'mid',4);for(let i=0;i<12;i++){const a=i*Math.PI/6;round(G.frameAlong([0,91+Math.cos(a)*4.8,43.5+Math.sin(a)*4.8],[1,0,0]),-12,12,.6,'mid');}});
  detail('magnets','engineering',()=>m.motion({pivot:[0,91,43.5],axis:[1,0,0],ratio:1},()=>{round(axis,-12,-11,4,'hi',2);for(let i=0;i<8;i++){const a=i*Math.PI/4;round(G.frameAlong([0,91+Math.cos(a)*3.2,43.5+Math.sin(a)*3.2],[1,0,0]),-11,11,.5,'hi');}}));
  detail('bearings','engineering',()=>{for(const x of [-17,17]){post(x,91,37,3.5,3,'mid');round(axis,x-.8,x+.8,3,'hi',2);}});
  pkg('electronics',[0,0,98],'dcconverter',-28,-105,28,24,10);pkg('chassis',[0,0,0],'chargeport',44,-109,28,9,10);
 }else if(id==='solar'){
  pkg('charger',[0,0,70],'blockingdiode',-38,30,10,8,8);begin('charger',[0,0,70]);detail('inductor','engineering',()=>{slab(29,29,8,9,10,1,'mid',1);for(let i=0;i<5;i++)post(30+i*1.3,33,11,1,.5,'hi');});cap('charger',[0,0,70],'capacitors',-37,41,10,5);pkg('cell',[0,0,36],'temperature',-34,-24,17,6,6);pkg('charger',[0,0,70],'switch',-5,35,10,8,5);
 }else if(id==='bicycle'){
  begin('drivetrain',[0,24,0]);const F=G.frameAlong([-77,7,39],[0,1,0]);detail('freewheel','engineering',()=>round(F,2.5,4,5,'hi',3));detail('chainlinks','engineering',()=>{for(let i=0;i<12;i++){const x=-72+i*4;round(G.frameAlong([x,8,34+(x+76)*(30-34)/60],[0,1,0]),-.65,.65,.85,'mid',.35);}});
  detail('bottombracket','engineering',()=>round(G.frameAlong([-16,10,41],[0,1,0]),0,1.5,4,'mid',2));
  begin('wheels');detail('spokes','engineering',()=>{for(const x of [-77,77])for(let i=0;i<16;i++){const a=i*Math.PI/8;round(G.frameAlong([x+Math.cos(a)*31.5,0,39+Math.sin(a)*31.5],[Math.cos(a),0,Math.sin(a)]),-.5,.5,.65,'mid');}});
  begin('brakes',[0,-24,0]);detail('cables','engineering',()=>{for(const x of [-77,77])post(x,-5,75,1,1,'hi');});
 }else if(id==='arduino-rover'){
  pkg('board',[0,0,48],'clock',3,-50,23,8,4);pkg('board',[0,0,48],'usb',-25,-38,23,6,7);pkg('board',[0,0,48],'regulator',5,-28,23,7,7);pkg('driver',[0,0,72],'diodes',-16,7,23,8,4);cap('board',[0,0,48],'capacitors',-20,-22,23,3);
 }else if(id==='pi-station'){
  pkg('computer',[0,0,43],'ram',15,-26,12,12,14);pkg('computer',[0,0,43],'regulator',31,-25,12,10,8);pkg('computer',[0,0,43],'clock',31,-12,12,10,4);cap('computer',[0,0,43],'capacitors',-8,-8,12,4);begin('computer',[0,0,43]);detail('antenna','engineering',()=>slab(31,-35,8,6,12,.3,'mid',.4));
 }else if(['breadboard-led','reaction-timer','plant-waterer'].includes(id)){
  const ctrl=[0,0,30];
  if(id==='breadboard-led'){
   begin('breadboard');detail('contactclips','engineering',()=>{for(let i=0;i<5;i++)slab(7+i*7,-45,5,1,10,1,'mid',.4);});detail('rail','engineering',()=>slab(4,-47,76,1,11,.25,'mid',0));
   logic('controller',ctrl,'timer',-73,-11,14,5,9);logic('controller',ctrl,'transistor',-65,5,14,5,9);pkg('wiring',[0,0,102],'ground',12,28,11,5,5);
  }else if(id==='reaction-timer'){
   logic('controller',ctrl,'pullup',-74,-12,14,5,5);pkg('controller',ctrl,'clock',-84,17,10,7,5);logic('controller',ctrl,'debounce',-74,-3,14,5,7);logic('controller',ctrl,'interrupt',-74,8,14,5,7);begin('button',[0,0,58]);detail('switchcontacts','engineering',()=>{slab(35,15,3,8,19,.5,'hi',.3);slab(50,15,2,8,19,.5,'hi',.3);});
  }else{
   pkg('driver',[0,0,85],'mosfet',14,18,17,6,10);pkg('driver',[0,0,85],'diode',49,18,17,6,10);cap('controller',ctrl,'capacitors',-86,17,10,5);logic('controller',ctrl,'threshold',-73,-11,14,12,24);
   begin('pump',[0,0,108]);detail('impeller','engineering',()=>{for(let i=0;i<5;i++){const a=i*Math.PI*2/5;beam([80+Math.cos(a)*2,31+Math.sin(a)*2,35],[80+Math.cos(a)*6,31+Math.sin(a)*6,35],.8,'mid');}});
  }
 }
}
