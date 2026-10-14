import * as G from '../vendor/anatomy/lathe.mjs';
import * as k from '../vendor/anatomy/iso-kit.mjs';
// AirPods 4 ANC exterior baseline, in millimetres. Apple lists each earbud as
// 30.2 × 18.3 × 18.1 mm and the case as 46.2 × 50.1 × 21.2 mm.
// https://support.apple.com/en-by/121204
// https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/121204-airpods-4-anc.png
// Internal packaging is a representative teaching arrangement, not Apple CAD.
// Audio: antenna → radio/H2-style processing → coil/diaphragm → acoustic grille.
// ANC: external/inward microphones → processing → the same driver.
// Charge: USB-C/inductive coil → case electronics/cell → stem contacts.
export function buildEarbuds(spec,machine){
 if(spec.id!=='wireless-earbuds')return false;
 const m=machine(spec.id,k.boxCorners({x:-50,y:-18,w:100,d:63},0,50),-80,20);
 const {slab,round,post,beam}=m;
 const at=(id,offset,fn)=>{m.begin(id,offset);m.detail(id,spec.parts.find(p=>p.id===id)?.stage||'foundations',fn);};
 const white=fn=>m.material('white-polymer',fn),black=fn=>m.material('acoustic-mesh',fn);
 let coverNo=0;
 const cover=(id,offset,fn,join)=>{m.begin(join||`${id}-cover-${++coverNo}`,offset);m.detail(id,spec.parts.find(p=>p.id===id)?.stage||'foundations',()=>m.exterior(offset,()=>white(fn)));};
 for(const side of [-1,1]){
  const x=side*35,angle=25*Math.PI/180,F=G.frameOf([x,-3,21.1],[-side*Math.cos(angle),-Math.sin(angle),0],[0,0,1],[-side*Math.sin(angle),Math.cos(angle),0]);
  // Two hollow curved shell halves, with a real acoustic aperture at the front.
  const shellProfile=[[-9.15,0],[-9.15,1],[-8.6,3.5],[-7,6.4],[-4,8.3],[0,9.05],[3,8.5],[6,6.8],[8,5.3],[9.15,4.6],[9.15,4],[8,4.5],[5.6,6],[2.8,7.6],[0,8.15],[-4,7.4],[-6.4,5.5],[-8,2.7],[-8.25,0]];
  const backProfile=[[-9.15,0],[-9.15,1],[-8.6,3.5],[-7,6.4],[-4,8.3],[0,9.05],[0,8.15],[-4,7.4],[-6.4,5.5],[-8,2.7],[-8.25,0]];
  const frontProfile=[[0,9.05],[3,8.5],[6,6.8],[8,5.3],[9.15,4.6],[9.15,4],[8,4.5],[5.6,6],[2.8,7.6],[0,8.15]];
  cover('shell',[0,80,0],()=>{m.latheHalf(F,backProfile,0,'hi');m.latheHalf(F,frontProfile,0,'hi');},`shell-back-${side}`);
  cover('shell',[0,-26,0],()=>m.latheHalf(F,shellProfile,Math.PI,'hi'));
  const stem=G.frameAlong([x+side*4,1,0],[0,0,1]);
  cover('shell',[0,80,0],()=>m.lathe(stem,[[0,0],[0,2.2],[.6,3],[13,3],[14.4,2.7],[14.4,2.1],[1,2.1],[1,0]],'hi'),`shell-back-${side}`);
  at('charging',[0,0,-14],()=>m.material('steel',()=>round(stem,0,.5,2.15,'hi')));
  cover('shell',[0,80,0],()=>{post(x+side*4,-3,13.9,2.6,1.4,'hi');post(x-side*.8,-3,12.1,4.3,.6,'hi');beam([x+side*4-2.1,1,5],[x+side*4+2.1,1,5],.35,'hi');},`shell-back-${side}`);
  at('radio',[0,-25,0],()=>{slab(x+side*4-1.2,.1,2.4,1.8,5,7,'mid',.2);slab(x+side*4-.8,-.25,1.6,.35,7,2,'hi',.1);});
  at('battery',[side*27,0,0],()=>m.material('battery',()=>{for(const start of [0,Math.PI])m.latheHalf(F,[[-5.8,0],[-5.8,4.6],[-2.3,4.6],[-2.3,0]],start,'mid');round(F,-6,-5.8,2.5,'hi');}));
  at('driver',[-side*28,0,0],()=>{m.material('steel',()=>round(F,-1,1,4.7,'mid',2));m.material('copper',()=>round(F,1,2,4.5,'hi',3.7));m.material('acoustic-mesh',()=>round(F,2,2.3,4.5,'lo'));});
  at('acoustics',[-side*40,0,0],()=>black(()=>{round(F,9.15,9.4,4,'lo');for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++)if(i*i+j*j<10)round(G.frameOf(G.add3(G.pointOf(F,9.4,0,0),G.add3(G.mul3(F.v,i*.85),G.mul3(F.u,j*.85))),F.a,F.u,F.v),0,.05,.14,'mid');}));
  at('microphones',[0,-32,8],()=>{black(()=>round(G.frameAlong([x-side*2,-11.05,24.6],[0,-1,0]),0,.4,1.35,'lo'));slab(x+side*4-.65,.5,1.3,1,.8,1,'hi',.2);});
  at('antenna',[side*22,0,0],()=>m.material('copper',()=>beam([x+side*4+1.4,1,5],[x+side*4+1.4,1,12],.25,'hi')));
  at('controls',[0,-40,0],()=>{black(()=>round(G.frameAlong([x-side*3,-11,21],[0,-1,0]),0,.2,.8,'lo'));slab(x+side*4-1,-1.2,2,.3,8,4,'mid',.5);});
 }
 // Compact rounded case. Split front/back skins and perimeter keep real wall
 // thickness and a useful inspection state without substituting a solid box.
 const caseF=G.frameOf([0,20,0],[0,1,0],[1,0,0],[0,0,1]);
 const plan=k.roundedPlan({x:-25.05,y:0,w:50.1,d:46.2,r:9},12);
 const inner=k.roundedPlan({x:-23.65,y:1.4,w:47.3,d:43.4,r:7.6},12);
 const clip=(poly,axis,bound,keep)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ina=keep*(a[axis]-bound)>=-1e-9,inb=keep*(b[axis]-bound)>=-1e-9;if(ina)out.push(a);if(ina!==inb){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,j)=>v+(b[j]-v)*t));}}return out;};
 cover('case',[0,-70,0],()=>{for(const p of [clip(plan,0,-3,-1),clip(plan,0,3,1),clip(clip(clip(plan,0,-3,1),0,3,-1),1,4,-1),clip(clip(clip(plan,0,-3,1),0,3,-1),1,5.8,1)])for(const [z,dir] of [[32.9,-1],[33.05,1]]){const q=clip(p,1,z,dir);if(q.length>=3)m.collarWall(caseF,q,0,1.4);}m.line([[-24.5,19.9,33],[24.5,19.9,33]],'mid');});
 cover('case',[0,35,0],()=>m.collarWall(caseF,plan,19.8,21.2));
 cover('case',[0,0,0],()=>{for(let i=0;i<plan.length;i++){const j=(i+1)%plan.length;m.collarWall(caseF,[plan[i],plan[j],inner[j],inner[i]],1.4,19.8);}});
 at('case',[0,0,0],()=>{white(()=>slab(-23.65,23,47.3,15,30,2,'mid',3));m.material('steel',()=>slab(-8,40.8,16,.6,33,2,'hi',.8));m.material('battery',()=>slab(-17,24,34,13,7,10,'lo',3));for(const x of [-14,14])post(x,33,6,1,1,'hi');});
 at('charging',[0,-70,0],()=>{for(const x of [-17,17])post(x,25,1.4,2.6,.7,'hi');slab(-19,24,38,13,4,2,'mid',2);slab(-4,26,8,6,6,1,'hi',.8);m.material('copper',()=>round(G.frameAlong([0,39.3,21],[0,1,0]),0,.5,10,'mid',9));black(()=>slab(-3,19.8,6,.2,4,1.8,'lo',.8));beam([0,20,4.5],[0,24,4.5],.3,'hi');m.material('indicator',()=>round(G.frameAlong([0,20,32],[0,-1,0]),0,.2,.65,'hi'));});
 // The split lid seam is surface ink, attached to the front face.
 at('case',[0,-70,0],()=>{m.ring(G.frameAlong([0,20,32],[0,-1,0]),0,.65,'mid');});
 m.finish();return true;
}
