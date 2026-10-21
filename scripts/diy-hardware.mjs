import {readFileSync} from 'node:fs';
import * as k from '../vendor/anatomy/iso-kit.mjs';
import * as G from '../vendor/anatomy/lathe.mjs';
// Original parametric teaching hardware. Dimensions are millimetre-like; the
// project may uniformly scale or rotate a board without changing its proportions.
// One material palette supplies the SVG shading ramps and Three.js finishes.
const diyMaterials=JSON.parse(readFileSync(new URL('../lib/diy-materials.json',import.meta.url),'utf8'));
function tint(hex,target,fraction){const a=parseInt(hex.slice(1),16),b=parseInt(target,16);return '#'+[16,8,0].map(shift=>Math.round(((a>>shift)&255)*(1-fraction)+((b>>shift)&255)*fraction).toString(16).padStart(2,'0')).join('');}
export const diyMaterialCss=Object.entries(diyMaterials).map(([key,{color}])=>`[data-material=${key}]{--anatomy-top:${tint(color,'ffffff',.12)};--anatomy-paper:${color};${[.48,.34,.2,.07].map((share,i)=>`--anatomy-shade-${i}:${tint(color,'000000',share)}`).join(';')};--anatomy-hi:${tint(color,'000000',.55)};--anatomy-mid:${tint(color,'ffffff',.65)};--anatomy-lo:${tint(color,'ffffff',.38)}}`).join('\n')+'\n';
export function diyMaterialFor(key,id,part,component){
 if(!['arduino-rover','pi-station','breadboard-led','reaction-timer','plant-waterer'].includes(id))return key;
 if(key==='diy-pcb'&&['board','controller'].includes(part))return 'diy-arduino';
 if(key==='diy-pcb'&&id==='pi-station'&&part==='sensor')return 'diy-blue';
 if(key==='diy-pcb'&&id==='arduino-rover'&&part==='driver')return 'diy-red';
 if(key==='diy-pcb'&&id==='plant-waterer'&&part==='sensor')return 'diy-chip';
 if(key==='diy-ivory'&&part==='resistor')return 'diy-tan';
 if(key==='diy-ivory'&&part==='motors')return 'diy-yellow';
 if(key==='diy-chip'&&id==='plant-waterer'&&part==='driver'&&!component)return 'diy-blue';
 return key;
}
// Every solid is recorded by the existing generator and exported to the 3D model.
function local(m,x,y,z,scale=1,portrait=false){
 const point=(u,v,h=0)=>portrait?[x+v*scale,y+(68.6-u)*scale,z+h*scale]:[x+u*scale,y+v*scale,z+h*scale];
 const box=(u,v,w,d,h,t,tone='hi',r=.25)=>{const [a,b,c]=portrait?point(u+w,v,h):point(u,v,h);m.slab(a,b,(portrait?d:w)*scale,(portrait?w:d)*scale,c,t*scale,tone,r*scale);};
 const disc=(u,v,h,t,r,tone='mid',inner=0)=>m.round(G.frameAlong(point(u,v,h),[0,0,1]),0,t*scale,r*scale,tone,inner*scale);
 const label=(u,v,h,text,size=1.9)=>m.text(...point(u,v,h),text,size*scale);
 const line=(points,tone='mid')=>m.line(points.map(p=>point(...p)),tone);
 const axis=(origin,direction)=>G.frameAlong(point(...origin),portrait?[direction[1],-direction[0],direction[2]]:direction);
 const mat=(key,fn)=>m.material(key,fn);
 const component=(id,fn)=>id?m.detail(id,'foundations',fn):fn();
 const smd=(u,v,h=1.6,w=1.6,d=.8)=>{mat('diy-chip',()=>box(u,v,w,d,h,.6,'mid',.1));mat('diy-metal',()=>{box(u,v,.25,d,h+.6,.1);box(u+w-.25,v,.25,d,h+.6,.1);});};
 const pad=(u,v,h=1.61,r=1.6)=>{mat('diy-gold',()=>disc(u,v,h,.08,r,'hi',r*.55));mat('diy-chip',()=>disc(u,v,h-.03,.04,r*.55,'lo'));};
 return {point,box,disc,label,line,axis,mat,component,smd,pad};
}
export function drawUno(m,{x,y,z,scale=1,portrait=false,scopes={}}){
 const t=local(m,x,y,z,scale,portrait),{point,box,disc,label,line,mat,component,smd,pad,axis}=t;
 const outline=[[0,0],[65.6,0],[68.6,3],[68.6,10],[67.3,11.3],[67.3,42.1],[68.6,43.4],[68.6,50.4],[65.6,53.4],[0,53.4]].map(([u,v])=>point(u,v).slice(0,2));
 mat('diy-pcb',()=>m.plate(outline,z,1.6*scale,'mid'));
 for(const [u,v] of [[13.9,2.5],[66.1,7.6],[66.1,35.6],[15.2,50.8]])pad(u,v);
 // Copper routes and vias are surface details, not a manufacturer routing file.
 for(let i=0;i<9;i++)line([[25+i*3.3,7,1.65],[25+i*3.3,11+i*.45,1.65],[35+i*1.5,14+i*.45,1.65]],'lo');
 for(let i=0;i<6;i++){line([[44+i*2.54,46,1.65],[44+i*2.54,42-i*.6,1.65],[46+i*2,38,1.65]],'lo');disc(28+i*4.5,25,1.62,.05,.3,'lo');}
 const ports={};
 function sockets(u,v,n,names){
  mat('diy-chip',()=>{
   box(u-.65,v-.9,n*2.54,2.9,1.6,6.4,'lo',.15);
   box(u-.65,v-.9,n*2.54,.55,8,1,'lo',.05);
   box(u-.65,v+.8,n*2.54,1.2,8,1,'lo',.05);
   for(let i=0;i<n;i++){box(u+i*2.54-.65,v-.35,.5,1.15,8,1,'lo',.04);box(u+i*2.54+1,v-.35, .89,1.15,8,1,'lo',.04);}
  });
  // Actual recessed wells, with contacts below the rim rather than painted dots.
  mat('diy-gold',()=>{for(let i=0;i<n;i++){box(u+i*2.54-.14,v-.3,.16,.95,8,.88);box(u+i*2.54+.83,v-.3,.16,.95,8,.88);}});
  for(let i=0;i<n;i++){ports[names[i]]=point(u+i*2.54+.35,v+.15,9.05);label(u+i*2.54+.35,v<20?v+4.4:v-2.8,1.67,names[i],1.25);}
 }
 component(scopes.header,()=>{sockets(18.8,2.1,10,['SCL','SDA','AREF','GND','13','12','11','10','9','8']);sockets(46.3,2.1,8,['7','6','5','4','3','2','TX','RX']);sockets(27.8,49,8,['NC','IOREF','RST','3V3','5V','GND','GND','VIN']);sockets(50.5,49,6,['A0','A1','A2','A3','A4','A5']);});
 // USB type B: three enclosing walls, a roof lip, recessed tongue and contacts.
 component(scopes.usb,()=>{mat('diy-metal',()=>{box(-1,8.7,15.5,1,1.6,10.7);box(-1,20.1,15.5,1,1.6,10.7);box(13.5,9.7,1,10.4,1.6,10.7);box(-1,9.7,15.5,10.4,11.3,1);});mat('diy-chip',()=>box(2,11.6,11.5,6.7,3.3,4.5));mat('diy-gold',()=>{for(let i=0;i<4;i++)box(1.9,12.2+i*1.3,4,.45,7.8,.12);});label(8.2,15,12.4,'USB',2);});
 // Barrel jack: round open socket with a centre pin on a supporting body.
 mat('diy-chip',()=>box(0,34.5,13.4,9,1.6,9,'lo',.9));mat('diy-chip',()=>m.round(axis([0,39,6.6],[-1,0,0]),0,1.2*scale,4.2*scale,'lo',3.1*scale));mat('diy-metal',()=>m.round(axis([0,39,6.6],[-1,0,0]),0,1.5*scale,.65*scale,'hi'));
 // ATmega328P socket, 28 separate bent leads, not a featureless processor slab.
 mat('diy-chip',()=>box(28,27.2,32,10,1.6,2.1,'lo',.4));
 mat('diy-metal',()=>{for(let i=0;i<14;i++){for(const v of [26.1,37.2]){box(29.2+i*2.15,v,1,1.1,1.6,2.2);box(29.2+i*2.15,v<30?v+1.1:v-1.1,1,1.1,3.6,.55);}}});
 component(scopes.chip,()=>{mat('diy-chip',()=>box(29,28.2,30,8,3.7,2.3,'mid',.6));label(44,32.3,6.08,'ATMEGA328P',2.05);disc(30.5,30,6.05,.04,.6,'lo');});
 mat('diy-chip',()=>disc(29.2,32.2,5.96,.08,1.4,'lo'));
 // USB interface IC, with four rows of leads.
 mat('diy-metal',()=>{for(let i=0;i<8;i++){box(18.2+i*.75,18.2,.4,1.2,1.6,.25);box(18.2+i*.75,25,.4,1.2,1.6,.25);box(17.2,19.4+i*.65,1,.35,1.6,.25);box(24,19.4+i*.65,1,.35,1.6,.25);}});mat('diy-chip',()=>box(18.2,19.4,5.8,5.6,1.6,1.15));label(21,22,2.8,'16U2',1.15);
 // Two 2×3 ICSP headers and individually visible metallic pins.
 for(const [u,v] of [[12.8,24.5],[63.8,22]]){mat('diy-chip',()=>box(u-.5,v-.5,5.2,7.7,1.6,2.4));mat('diy-gold',()=>{for(let i=0;i<3;i++)for(let j=0;j<2;j++)box(u+j*2.54,v+i*2.54,.6,.6,4,5,'hi',.05);});}
 // Reset switch, oscillator package, power regulator, status lights and passives.
 mat('diy-metal',()=>box(3.8,1.5,6.2,5.5,1.6,1.7));mat('diy-red',()=>disc(6.9,4.2,3.3,1.5,1.7,'hi'));
 component(scopes.clock,()=>{mat('diy-metal',()=>box(17.3,29.3,7.8,3.8,1.6,2.1,'hi',1.8));line([[18.3,31.2,3.74],[24.1,31.2,3.74]],'lo');});
 component(scopes.regulator,()=>{mat('diy-metal',()=>box(17.1,38.6,5.2,5,1.6,.6));mat('diy-chip',()=>box(17.8,38.7,4,4.5,2.2,1.3));for(let i=0;i<3;i++)smd(18+i*1.15,44,1.6,.5,2);});
 component(scopes.caps,()=>{for(const u of [5.4,11.3]){mat('diy-chip',()=>disc(u,28.5,1.6,5.5,2.35,'lo'));mat('diy-metal',()=>disc(u,28.5,7.1,.15,2.15,'hi'));line([[u-1.5,28.5,7.27],[u+1.5,28.5,7.27]],'lo');line([[u,27,7.27],[u,30,7.27]],'lo');}});
 for(const [u,v] of [[29,14],[36,14],[47,14],[54,18],[57,23],[32,43],[39,43],[24,10],[30,22],[49,21],[59,42]])smd(u,v);
 for(const [u,v,name] of [[29,19,'L'],[32.8,19,'TX'],[36.6,19,'RX'],[58.5,43,'ON']]){mat('diy-metal',()=>box(u,v,2.6,1.5,1.6,.3));mat('diy-gold',()=>box(u+.4,v+.2,1.8,1.1,1.9,.45));label(u+1.2,v-1,1.67,name,1.35);}
 label(43.5,10.7,1.7,'DIGITAL',2);label(57.8,44,1.7,'ANALOG IN',1.65);label(36,23.8,1.7,'UNO R3',4);
 if(scopes.logic)for(const [i,key] of scopes.logic.entries())component(key,()=>box(32+i*5,28.4,3,2,6.04,.045,'mid',.15));
 if(scopes.pwm)component(scopes.pwm,()=>box(45,34,3,1.8,6.04,.045,'mid',.1));
 return {ports,point};
}
export function drawPi(m,{x,y,z,scale=1}){
 const t=local(m,x,y,z,scale),{box,disc,label,line,mat,component,smd,pad}=t;
 mat('diy-pcb',()=>box(0,0,65,30,0,1.6,'mid',2.5));
 for(const u of [3.5,61.5])for(const v of [3.5,26.5])pad(u,v);
 // Fitted male header, matching this lesson's kit (20 columns × 2 rows).
 component('header',()=>{mat('diy-chip',()=>box(7,1,51,5.2,1.6,2.5,'lo',.2));mat('diy-gold',()=>{for(let i=0;i<20;i++)for(let j=0;j<2;j++)box(7.7+i*2.54,1.65+j*2.54,.6,.6,4.1,5.5,'hi',.06);});});
 component('processor',()=>{mat('diy-chip',()=>box(19.5,9.2,14.5,14.5,1.6,1.3,'mid',.3));label(26.75,15.5,3,'RP3A0',2.05);label(26.75,19,3,'ZERO 2 W',1.35);});
 component('ram',()=>{box(21,20.8,11.5,.3,2.96,.04,'mid',.05);});
 mat('diy-metal',()=>{box(37,10.3,13,13,1.6,2.2,'hi',.5);line([[38.2,11.5,3.86],[48.8,11.5,3.86],[48.8,22.1,3.86]],'lo');});
 // Mini HDMI and two micro-USB sockets: open front, metallic roof and side walls.
 function port(u,v,w,d,h,name){mat('diy-metal',()=>{box(u,v, .6,d,1.6,h);box(u+w-.6,v,.6,d,1.6,h);box(u,v,w,d-.7,1.6,.4);box(u,v,w,d,1.6+h-.5,.5);box(u,v,w,.5,1.6,h);});mat('diy-chip',()=>box(u+.6,v+1,w-1.2,d-1.5,2,.85));mat('diy-gold',()=>{for(let i=0;i<5;i++)box(u+1.2+i*(w-2.4)/5,v+d-1.2,.28,.7,2.85,.1);});label(u+w/2,v-1,1.68,name,1.3);}
 port(8.5,24,12,7,4,'HDMI');port(39.6,25,7.7,5.2,2.6,'USB');port(52.4,25,7.7,5.2,2.6,'PWR IN');
 // microSD socket on the same face as the processor, with spring contacts and seam.
 mat('diy-metal',()=>{box(.7,10,15,.6,1.6,1.8);box(.7,22.4,15,.6,1.6,1.8);box(14.7,10,1,12.8,1.6,1.8);box(.7,11,15,11.8,3,.4);});for(let i=0;i<6;i++)box(2+i*1.9,13,1,1,3.43,.03,'lo',.15);
 mat('diy-gold',()=>{for(let i=0;i<8;i++)box(1.6+i*1.5,21.6,.7,2,1.6,.2);});
 // CSI connector at the short board edge, with individually seated contacts.
 mat('diy-ivory',()=>box(61.6,7.3,2.6,15.8,1.6,2));mat('diy-chip',()=>box(64,7.3,.8,15.8,1.6,2.4));mat('diy-gold',()=>{for(let i=0;i<22;i++)box(60.6,8+i*.63,1,.25,1.6,.3);});
 component('regulator',()=>{for(const [u,v] of [[53,10],[54,17]]){mat('diy-chip',()=>box(u,v,3.8,3.5,1.6,1.6));smd(u-2,v,1.6,1,2);smd(u+4.3,v,1.6,1,2);}});
 component('clock',()=>{mat('diy-metal',()=>box(15.4,19.5,3.1,2.2,1.6,.7));});
 component('capacitors',()=>{for(const [u,v] of [[17,9],[17,14],[35,9],[35,17],[51,9],[52,22],[57,14],[58,21],[35,25]])smd(u,v,1.6,1.8,.9);});
 component('antenna',()=>{mat('diy-gold',()=>box(50.5,6.7,7.3,.3,1.65,.04,'mid',.04));line([[50.5,6.8,1.71],[53,6.8,1.71],[53,7.9,1.71],[57.8,7.9,1.71]],'mid');});
 for(let i=0;i<9;i++)line([[12+i*4.8,6.6,1.65],[12+i*4.8,7.5+i%3*.5,1.65],[13+i*4.8,8.5+i%3*.5,1.65]],'lo');
 label(44,8.2,1.68,'Raspberry Pi',2.2);label(27,26.6,1.68,'ZERO 2 W',1.6);
 const ports={};for(const [name,pin] of [['3V3',1],['GND',6],['SDA',3],['SCL',5]]){const col=Math.floor((pin-1)/2),row=(pin-1)%2;ports[name]=t.point(8+col*2.54,1.95+row*2.54,9.6);}
 return {...t,ports};
}
// Breadboard socket cores use shallow dark geometry so the terminal pattern
// stays readable in SVG and Three.js without costly cuts in every hole.
export function drawBreadboard(m,{x=0,y=-50,z=4,w=88,d=100,rows=17}={}){
 const t=local(m,x,y,z),{box,label,line,mat}=t;
 mat('diy-ivory',()=>{box(0,0,w,d,0,6.6,'hi',2);box(-1,15,1,8,1,4);box(-1,48,1,8,1,4);box(w,30,1,8,1,4);});
 // A moulded channel, two five-hole terminal banks and isolated side rails.
 mat('diy-chip',()=>box(w/2-2.1,5,4.2,d-10,6.6,.05,'lo',.1));
 const pitch=(d-12)/(rows-1),bankWidth=24,step=bankWidth/4;
 const left=12,right=w/2+8;
 mat('diy-chip',()=>{for(let row=0;row<rows;row++)for(let col=0;col<10;col++){const u=col<5?left+col*step:right+(col-5)*step;box(u-.8,6+row*pitch-.8,1.6,1.6,6.62,.04,'lo',.25);}for(let row=0;row<rows;row++)for(const u of [4.1,8.2,w-8.2,w-4.1])box(u-.65,6+row*pitch-.65,1.3,1.3,6.62,.04,'lo',.2);});
 for(const u of [2.2,10.3,w-10.3,w-2.2])line([[u,4,6.68],[u,d-4,6.68]],'mid');
 for(let row=0;row<rows;row+=2){label(w/2-5,6+row*pitch+1,6.72,String(row+1),1.7);}
 for(let col=0;col<10;col++)label(col<5?left+col*step:right+(col-5)*step,3.3,6.72,'ABCDEFGHIJ'[col],1.8);
 label(4.1,2.8,6.72,'+',2.3);label(8.2,2.8,6.72,'−',2.3);label(w-8.2,2.8,6.72,'+',2.3);label(w-4.1,2.8,6.72,'−',2.3);
 return {point:t.point,pitch,terminal:(row,col)=>t.point(col<5?left+col*step:right+(col-5)*step,6+row*pitch,6.65)};
}
export function jumper(m,a,b,{material='diy-wire',height=13,r=.65,bend=0}={}){
 // A cubic arch seats each end exactly on its own terminal. Insulated female
 // housings and exposed metal tips distinguish connections from floating lines.
 const aa=[a[0],a[1]+bend,a[2]+height],bb=[b[0],b[1]+bend,b[2]+height],points=[];
 for(let i=0;i<=12;i++){const u=i/12,v=1-u;points.push(a.map((n,j)=>v*v*v*n+3*v*v*u*aa[j]+3*v*u*u*bb[j]+u*u*u*b[j]));}
 m.material(material,()=>{for(let i=0;i<points.length-1;i++){const delta=G.sub3(points[i+1],points[i]),len=G.len3(delta);m.round(G.frameAlong(points[i],G.unit3(delta)),0,len,r,'mid');}});
 for(const p of [a,b]){m.material('diy-chip',()=>m.slab(p[0]-1.05,p[1]-1.05,2.1,2.1,p[2],4,'lo',.3));m.material('diy-gold',()=>m.post(p[0],p[1],p[2]+.02,.12,.28,'hi'));}
}
export function drawResistor(m,a,b){
 const centre=a.map((v,i)=>(v+b[i])/2),delta=G.sub3(b,a),len=G.len3(delta),dir=G.unit3(delta),F=G.frameAlong(centre,dir);const h=centre[2]+5;
 for(const p of [a,b]){m.material('diy-metal',()=>{m.post(p[0],p[1],p[2],4,.33,'hi');m.beam([p[0],p[1],p[2]+4],[centre[0]+(p[0]-centre[0])*.3,centre[1]+(p[1]-centre[1])*.3,h],.55,'mid');});}
 const body=G.frameAlong([centre[0],centre[1],h],dir);
 m.material('diy-ivory',()=>m.lathe(body,[[-3.2,0],[-3.2,1.1],[-2.7,1.65],[-1.8,1.8],[1.8,1.8],[2.7,1.65],[3.2,1.1],[3.2,0]],'hi'));
 for(const [pos,key] of [[-2,'diy-red'],[-.8,'diy-red'],[.6,'diy-brown'],[2,'diy-gold']])m.material(key,()=>m.round(body,pos,pos+.42,1.83,'mid',1.72));
}
export function drawLed(m,a,b){
 const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,z=Math.max(a[2],b[2]);
 for(const p of [a,b])m.material('diy-metal',()=>{m.post(p[0],p[1],p[2],4,.35,'hi');m.beam([p[0],p[1],z+4],[x+(p[0]-x)*.22,y,z+6],.5,'mid');});
 m.material('diy-red',()=>{m.post(x,y,z+6,1,3.3,'mid');m.lathe(G.frameAlong([x,y,z+7],[0,0,1]),[[0,0],[0,2.7],[4,2.7],[5,2.5],[6,1.9],[6.5,1],[6.7,0]],'hi');});
 return [x,y,z+13.7];
}
export function drawButton(m,x,y,z){
 m.material('diy-chip',()=>m.slab(x-6,y-6,12,12,z,3,'lo',.65));
 m.material('diy-metal',()=>{for(const dx of [-8,8])for(const dy of [-5.5,5.5]){m.slab(x+dx-.55,y+dy-1,1.1,2,z-2,2,'mid',.1);m.slab(x+Math.min(dx,Math.sign(dx)*5.6),y+dy-.7,2.4,1.4,z,.7,'mid',.1);}m.slab(x-5.8,y-5.8,11.6,11.6,z+3,.7,'hi',.3);});
 m.material('diy-red',()=>m.lathe(G.frameAlong([x,y,z+3.7],[0,0,1]),[[0,0],[0,3.7],[.6,3.9],[2.5,3.8],[3.1,3.2],[3.1,0]],'hi'));
 for(const dx of [-4.6,4.6])for(const dy of [-4.6,4.6])m.post(x+dx,y+dy,z+3.7,.15,.55,'lo');
}
function driverModule(m,x,y,z){
 m.material('diy-pcb',()=>m.slab(x,y,44,25,z,1.6,'mid',1.3));
 m.material('diy-chip',()=>m.slab(x+14,y+7,16,10,z+1.6,1.6,'mid',.3));
 m.material('diy-metal',()=>{for(let i=0;i<12;i++)for(const v of [y+5.5,y+17])m.slab(x+14+i*1.27,v,.55,1.6,z+1.6,.25,'hi',.05);});
 m.text(x+22,y+12,z+3.25,'TB6612',3);
 m.detail('bridge','foundations',()=>m.slab(x+19,y+8,4,2,z+3.21,.035,'mid',.1));
 for(const u of [x+2,x+39]){m.material('diy-chip',()=>m.slab(u,y+2,3,21,z+1.6,2.2,'lo',.2));m.material('diy-gold',()=>{for(let i=0;i<8;i++)m.post(u+1.5,y+3+i*2.54,z+3.8,4,.35,'hi');});}
 m.detail('diodes','foundations',()=>{for(const v of [y+5,y+18]){m.material('diy-chip',()=>m.slab(x+7,v,4,2,z+1.6,.7,'lo',.2));m.material('diy-metal',()=>m.slab(x+10,v,.5,2,z+2.3,.1));}});
 for(const [u,v] of [[x+8,y+10],[x+32,y+5],[x+32,y+17]])m.material('diy-metal',()=>m.slab(u,v,2,1,z+1.6,.5,'hi',.2));
 return {left:[x+3.5,y+3,z+7.8],right:[x+40.5,y+3,z+7.8]};
}
function bmeBreakout(m,x,y,z){
 m.material('diy-pcb',()=>m.slab(x,y,34,25,z,1.6,'mid',1.5));
 for(const u of [x+3,x+31])m.material('diy-gold',()=>m.round(G.frameAlong([u,y+3,z+1.6],[0,0,1]),0,.1,1.6,'hi',.8));
 m.detail('sensing','foundations',()=>{m.material('diy-metal',()=>{m.slab(x+12,y+6,8,8,z+1.6,2,'hi',.5);m.post(x+16,y+10,z+3.6,.025,1.05,'lo');});});
 for(const [u,v] of [[x+5,y+7],[x+24,y+6],[x+23,y+11],[x+5,y+13]]){m.material('diy-chip',()=>m.slab(u,v,3,1.6,z+1.6,.7,'lo',.2));m.material('diy-metal',()=>{m.slab(u,v,.45,1.6,z+2.3,.1);m.slab(u+2.55,v,.45,1.6,z+2.3,.1);});}
 m.text(x+16,y+16,z+1.68,'BME280',3.2);
 const ports={};m.detail('i2c','foundations',()=>{m.material('diy-chip',()=>m.slab(x+4,y+19,24,3,z+1.6,2.2,'lo',.3));for(const [i,name] of ['3V3','GND','SDA','SCL'].entries()){const u=x+6+i*6;m.material('diy-gold',()=>m.post(u,y+20.5,z+3.8,4,.4,'hi'));m.text(u,y+23.2,z+1.7,name,1.5);ports[name]=[u,y+20.5,z+7.8];}});return ports;
}
export function buildDiy(machine){
 {const m=machine('arduino-rover',k.boxCorners({x:-70,y:-72,w:140,d:144},0,160),38,30);
  m.begin('chassis');m.material('diy-ivory',()=>m.slab(-45,-66,90,132,12,4,'mid',7));
  for(const x of [-62.5,62.5]){const F=G.frameAlong([x,-37,14],[1,0,0]);m.material('diy-chip',()=>m.round(F,-5,5,14,'lo',9));m.material('diy-ivory',()=>m.round(F,-4.8,4.8,8.9,'hi',3));m.material('diy-metal',()=>m.round(F,-5.2,5.2,2.8,'mid',1.6));
   for(let i=0;i<20;i++){const a=i*Math.PI/10,yy=-37+Math.cos(a)*13.9,zz=14+Math.sin(a)*13.9;m.material('diy-chip',()=>m.round(G.frameAlong([x,yy,zz],[1,0,0]),-5.3,5.3,.55,'lo'));}
  }
  m.material('diy-metal',()=>{m.post(0,55,0,6,5.5,'hi');m.slab(-7,48,14,14,6,6,'mid',2);});
  for(const x of [-35,35])for(const y of [-57,57]){m.material('diy-metal',()=>m.post(x,y,16,.7,2.3,'hi'));m.screw(x,y,16.7);}
  for(const [x,y] of [[-24,-54],[24,-54],[-24,-18],[24,-18],[-17,-6],[17,-6],[-17,10],[17,10]])m.material('diy-metal',()=>m.post(x,y,16,5,1.7,'mid'));
  m.begin('power',[0,0,24]);m.material('diy-chip',()=>{m.slab(-28,23,56,29,16,3,'lo',1.5);for(const y of [23,50])m.slab(-28,y,56,2,19,10,'lo',.4);});
  for(let i=0;i<4;i++){const x=-21+i*14,F=G.frameAlong([x,37,23.8],[0,1,0]);m.material('diy-metal',()=>m.round(F,-11,11,4.8,'hi'));m.material('diy-gold',()=>m.round(F,-6,6,4.85,'mid',4.7));m.material('diy-metal',()=>m.round(F,11,11.7,1.7,'hi'));}
  m.material('diy-chip',()=>m.slab(-8,53,16,6,16,4,'lo',.8));m.text(0,53,20.1,'POWER',3);
  m.begin('board',[0,0,48]);const board=drawUno(m,{x:-28,y:-58,z:21,scale:56/68.6,scopes:{header:'gpio',pwm:'pwm',clock:'clock',usb:'usb',regulator:'regulator',caps:'capacitors'}});
  m.begin('driver',[0,0,72]);const driver=driverModule(m,-22,-10,21);
  jumper(m,board.ports['9'],driver.left,{height:9,r:.5});jumper(m,board.ports.GND,driver.right,{height:8,material:'diy-chip',r:.5});
  m.begin('motors',[0,0,100]);for(const sign of [-1,1]){const x=sign<0?-56:45;m.material('diy-ivory',()=>m.slab(x,-47,11,20,12,10,'mid',2));m.detail('gearbox','foundations',()=>{m.material('diy-ivory',()=>m.slab(sign<0?-56:51,-46,5,18,22,2,'hi',.7));m.material('diy-metal',()=>{for(const y of [-43,-32])m.post(sign<0?-53.5:53.5,y,24,.2,.7,'mid');});});m.material('diy-metal',()=>{m.round(G.frameAlong([sign*56.65,-37,14],[1,0,0]),-.65,.65,1.5,'hi');m.slab(sign<0?-45:41,-45,4,16,16,4,'mid',.8);});}
  m.finish();
 }
 {const m=machine('pi-station',k.boxCorners({x:-65,y:-54,w:130,d:108},0,145),38,33);
  m.begin('case');m.material('diy-ivory',()=>{m.slab(-60,-50,120,100,0,4,'mid',5);for(const x of [-60,56])m.slab(x,-46,4,92,4,8,'mid',.6);m.slab(-56,-50,112,4,4,8,'mid',.6);for(let i=0;i<9;i++)m.slab(-56+i*13,46,8,4,4,8,'mid',.5);});
  for(const x of [-38.45,36.95])for(const y of [-34.45,-4.55])m.material('diy-metal',()=>m.post(x,y,4,6,1.4,'mid'));
  for(const x of [15,43])for(const y of [23,42])m.material('diy-metal',()=>m.post(x,y,4,16,1.4,'mid'));
  m.begin('power',[0,0,21]);m.material('diy-chip',()=>m.slab(-44,20,28,21,4,11,'lo',2));m.material('diy-metal',()=>m.slab(-26,27,10,7,15,.4,'hi',.4));m.text(-30,29,15.5,'5V USB',3);
  m.begin('computer',[0,0,43]);const pi=drawPi(m,{x:-43,y:-39,z:10,scale:1.3});
  m.begin('sensor',[0,0,70]);const sensor=bmeBreakout(m,12,20,20);for(const [i,name] of ['3V3','GND','SDA','SCL'].entries())m.detail('i2c','foundations',()=>jumper(m,pi.ports[name],sensor[name],{height:12+i*2.1,material:i===0?'diy-red':i===1?'diy-chip':'diy-wire',r:.55}));
  m.begin('storage',[0,0,98]);const card=local(m,-43,-39,10,1.3);card.mat('diy-chip',()=>card.box(-2,11,16.7,11.4,1.75,.8,'lo',.7));card.mat('diy-ivory',()=>card.box(-1,12.5,7,8.8,2.55,.04,'hi',.3));card.label(2.3,17,2.62,'SD',2.5);
  m.finish();
 }
 for(const id of ['breadboard-led','reaction-timer','plant-waterer']){
  const water=id==='plant-waterer',timer=id==='reaction-timer',m=machine(id,k.boxCorners({x:-104,y:-68,w:208,d:136},0,165),38,35);
  m.begin('breadboard');m.material('diy-ivory',()=>m.slab(-98,-60,196,120,0,4,'mid',5));for(const x of [-83,-37])for(const y of [-36,36])m.material('diy-metal',()=>m.post(x,y,4,4,1.6,'mid'));
  const bb=drawBreadboard(m,{rows:17});
  m.detail('contacts','foundations',()=>m.material('diy-gold',()=>m.slab(10,-45,28,1,10.62,.06,'hi',.1)));
  if(id==='breadboard-led'){
   m.detail('contactclips','foundations',()=>{for(let i=0;i<5;i++)m.material('diy-gold',()=>m.slab(12+i*6,-46,2.2,1.2,10.65,.07,'hi',.1));});
   m.detail('rail','foundations',()=>m.material('diy-gold',()=>m.slab(3.9,-45,.4,90,10.65,.04,'mid',.05)));
  }
  m.begin('controller',[0,0,30]);const uno=drawUno(m,{x:-91,y:-43,z:8,scale:62/53.4,portrait:true,scopes:{chip:'processor',header:'gpio',clock:timer?'clock':null,caps:water?'capacitors':null,logic:water?['threshold']:timer?['pullup','debounce','interrupt']:['timer','transistor']}});
  if(!water){
   m.begin('resistor',[0,0,56]);drawResistor(m,bb.terminal(7,4),bb.terminal(7,5));
   m.begin('led',[0,0,77]);const led=drawLed(m,bb.terminal(3,4),bb.terminal(3,5));
   m.detail('junction','foundations',()=>m.material('diy-gold',()=>m.post(led[0],led[1],led[2]-13.65,.08,.6,'mid')));
   if(timer){m.begin('button',[0,0,58]);const c=bb.terminal(12,4),other=bb.terminal(12,5);const bx=(c[0]+other[0])/2,by=c[1],bz=c[2]+2;drawButton(m,bx,by,bz);m.detail('timing','foundations',()=>m.material('diy-metal',()=>m.slab(bx-2,by-4,4,.4,bz+3.72,.035,'mid',.05)));m.detail('switchcontacts','foundations',()=>m.material('diy-gold',()=>{for(const u of [bx-4,bx+4])m.slab(u,by-3,1.8,6,bz+3,.1,'mid',.2);}));}
   m.begin('wiring',[0,0,102]);jumper(m,uno.ports['9'],bb.terminal(7,3),{height:18,material:'diy-red'});jumper(m,uno.ports.GND,bb.terminal(3,6),{height:28,material:'diy-chip'});jumper(m,bb.terminal(7,6),bb.terminal(3,3),{height:8,r:.5});
   if(timer){jumper(m,uno.ports['2'],bb.terminal(11,3),{height:16,r:.55});jumper(m,bb.terminal(11,6),bb.terminal(3,7),{height:10,material:'diy-chip',r:.5});}
   if(id==='breadboard-led')m.detail('ground','foundations',()=>m.material('diy-metal',()=>m.post(...bb.terminal(3,7),.08,.55,'hi')));
  }else{
   m.begin('sensor',[0,0,62]);m.material('diy-pcb',()=>{m.slab(67,-46,15,51,10.7,1.6,'mid',1.2);m.slab(65,1,19,12,12.3,1.6,'mid',1.2);});m.detail('sensing','foundations',()=>{for(let i=0;i<9;i++)m.material('diy-gold',()=>{m.slab(69,-43+i*4.6,10,.6,12.34,.04,'mid',.1);m.slab(69,-43, .6,38,12.34,.04,'mid',.1);});});m.material('diy-chip',()=>m.slab(70,4,8,4,13.9,1.3,'lo',.3));m.text(74,-23,12.4,'SOIL',2.3);
   m.begin('driver',[0,0,85]);for(const x of [16,53])for(const y of [8,35])m.material('diy-metal',()=>m.post(x,y,10.7,4,1.2,'mid'));m.material('diy-pcb',()=>m.slab(12,4,46,36,14.7,1.6,'mid',1.3));m.material('diy-chip',()=>m.slab(22,10,25,19,16.3,13,'mid',1));m.text(34.5,19.5,29.4,'RELAY',3.2);
   for(let i=0;i<3;i++){m.material('diy-ivory',()=>m.slab(15+i*12,32,9,6,16.3,5,'mid',.6));m.material('diy-metal',()=>{m.post(19.5+i*12,35,21.3,.15,2,'hi');m.line([[18.2+i*12,35,21.48],[20.8+i*12,35,21.48]],'lo');});}
   m.detail('mosfet','foundations',()=>{m.material('diy-chip',()=>m.slab(14,17,5,7,16.3,1.4,'lo',.3));for(let i=0;i<3;i++)m.material('diy-metal',()=>m.slab(14+i*1.7,24, .6,2,16.3,.3,'hi',.05));});
   m.detail('diode','foundations',()=>{m.material('diy-chip',()=>m.slab(49,17,6,3,16.3,1.1,'lo',.8));m.material('diy-ivory',()=>m.slab(53,17,.8,3,17.4,.06,'hi',.05));});
   m.begin('pump',[0,0,108]);m.material('diy-ivory',()=>{m.slab(68,18,24,29,10.7,3,'mid',2);m.post(80,31,13.7,15,9,'hi');m.post(80,31,28.7,4,10,'mid');m.post(80,31,32.7,9,3,'hi');});m.material('diy-metal',()=>{m.round(G.frameAlong([89,31,29],[1,0,0]),0,6,2.4,'hi',1.5);for(const dx of [-7,7])m.post(80+dx,31,32.75,.3,1,'mid');});m.detail('impeller','foundations',()=>{for(let i=0;i<5;i++){const a=i*Math.PI*2/5;m.material('diy-chip',()=>m.beam([80+Math.cos(a)*2,31+Math.sin(a)*2,32.73],[80+Math.cos(a)*6,31+Math.sin(a)*6,32.73],.55,'mid'));}});
   // The sensor and driver receive signal leads, rather than a bare unconnected PCB.
   m.begin('sensor',[0,0,62]);jumper(m,uno.ports.A0,[71,9,15.2],{height:24,bend:-35,r:.55});jumper(m,uno.ports['5V'],[77,9,15.2],{height:28,bend:-40,material:'diy-red',r:.55});
  }
  m.finish();
 }
}
