import {materialFor,materialCss} from './catalogue-materials.mjs';
import {buildDiy,diyMaterialCss,diyMaterialFor} from './diy-hardware.mjs';
import {halfLatheSvg} from './curved-shell.mjs';
import {buildAdvanced} from './advanced-geometry.mjs';
import {engineeringGeometry} from './engineering-geometry.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
import * as k from '../vendor/anatomy/iso-kit.mjs';
import * as G from '../vendor/anatomy/lathe.mjs';
import * as A from '../vendor/anatomy/audit.mjs';
// Opening translates whole assemblies along their mounting direction. It reveals
// how they fit; this illustrative layout is not a manufacturer's repair guide.
mkdirSync('public/art',{recursive:true});
const view=Number(process.env.ANATOMY_VIEW||0);const viewSuffix=view?'-'+view:'';
function machine(id,bounds,azimuth=38,elevation=28){
 const P=k.fitProjection(bounds,560,560,{pad:48,azimuth:azimuth+view*45,elevation});
 const inks=[];const groups=[],R=A.recorder(P,{ground:shape=>A.boundsOf(shape).min[2]<=.05});let group,scope=null,lastItem=null,activeMotion=null,activeExterior=null,activeMaterial=null,enriched=false;
 const begin=(id,move=[0,0,0])=>{group={id,move,lift:k.translateAlong(P,move),svg:'',shapes:[]};groups.push(group);};
 const append=svg=>{if(scope)svg=`<g data-component="${scope.id}" data-stage="${scope.stage}">${svg}</g>`;group.svg+=svg;if(lastItem)lastItem.svg+=svg;};
 const add=(paths,shape,tone='hi',lit=false)=>{const resolvedMaterial=materialFor(id,group.id,scope?.id,activeMaterial);const solid=R.solid({...shape,name:R.nameFor(group.id),owner:activeExterior?scope?.id||group.id:group.id,render:{materialKey:resolvedMaterial,inspectionOffset:activeExterior,tone,lit,component:scope?.id,stage:scope?.stage,motion:activeMotion}});let raw=paths.svg||k.solidSvg(paths,{tone,lit});if(resolvedMaterial)raw=`<g data-material="${resolvedMaterial}">${raw}</g>`;let svg=scope?`<g data-component="${scope.id}" data-stage="${scope.stage}">${raw}</g>`:raw;if(activeMotion){const p=k.iso(activeMotion.pivot,P),u=G.frameAlong(activeMotion.pivot,activeMotion.axis),a=k.iso(G.add3(activeMotion.pivot,u.u),P),b=k.iso(G.add3(activeMotion.pivot,u.v),P);svg=`<g data-spin="${[a[0]-p[0],a[1]-p[1],b[0]-p[0],b[1]-p[1],p[0],p[1]].join(',')}" data-ratio="${activeMotion.ratio}">${svg}</g>`;}group.svg+=svg;group.shapes.push(solid);const b=A.boundsOf(solid);lastItem=R.put({name:solid.name,piece:group.id,at:b.min.map((v,i)=>(v+b.max[i])/2),svg,shapes:[solid],move:group.move});};
 const plate=(poly,z,h,tone='hi')=>add(k.extrude(poly,z,h,P,{convex:false}),A.extruded(poly,z,h),tone);
 const slab=(x,y,w,d,z,h=3,tone='hi',r=2)=>add(k.slabOf({x,y,w,d,r},z,h,P,6,.5),A.slab({x,y,w,d,r},z,h,{},6),tone);
 const round=(F,s0,s1,r,tone='hi',inner=0)=>add(inner?G.ringBand(s0,s1,inner,r,F,P,{fill:'facets'}):G.disc(s0,s1,r,F,P),inner?A.ring(F,s0,s1,inner,r):A.disc(F,s0,s1,r),tone);
 const post=(x,y,z,h,r,tone='hi')=>round(G.frameAlong([x,y,z],[0,0,1]),0,h,r,tone);
 const lathe=(F,poly,tone='hi')=>add(G.lathe(poly,F,P,{steps:48,rims:'all',smooth:{rows:3}}),A.body(F,poly),tone);
 const latheHalf=(F,poly,start=0,tone='hi')=>{
  const reach=Math.max(...poly.flat().map(Math.abs))*8+100;const cut=A.orientedBox(G.add3(F.o,G.mul3(F.v,start===0?-reach:reach)),[F.a,F.u,F.v],[reach,reach,reach]);
  add(halfLatheSvg(F,poly,P,start),A.body(F,poly,{cut} ),tone);
  R.solids.at(-1).render.phiStart=start;R.solids.at(-1).render.phiLength=Math.PI;
 };
 const collarWall=(F,poly,s0,s1)=>add(G.prismOf(F,poly,s0,s1,P),A.prism(F,poly,s0,s1),'mid');
 const beam=(a,b,w=4,tone='mid')=>{const F=G.frameAlong(a,G.unit3(G.sub3(b,a))),len=G.len3(G.sub3(b,a)),poly=[[-w/2,-w/2],[w/2,-w/2],[w/2,w/2],[-w/2,w/2]];add(G.prismOf(F,poly,0,len,P),A.prism(F,poly,0,len),tone);};
 const ring=(F,s,r,tone='mid')=>{inks.push({kind:'circle',F,s,r,tone,part:group.id,component:scope?.id,stage:scope?.stage,move:group.move});const point=G.pointOf(F,s,r,0);const candidates=R.items.filter(i=>i.piece===group.id);const target=candidates.toSorted((a,b)=>Math.min(...a.shapes.map(shape=>Math.abs(A.sdf(shape,point))))-Math.min(...b.shapes.map(shape=>Math.abs(A.sdf(shape,point)))))[0];const previous=lastItem;lastItem=target||lastItem;append(k.lineSvg(G.circleOf(F,s,r,P),{tone}));lastItem=previous;};
 const screw=(x,y,z,tone='lo',size=.8)=>{const previous=lastItem;const candidates=R.items.filter(i=>i.piece===group.id);lastItem=candidates.toSorted((a,b)=>Math.min(...a.shapes.map(shape=>Math.abs(A.sdf(shape,[x,y,z]))))-Math.min(...b.shapes.map(shape=>Math.abs(A.sdf(shape,[x,y,z])))))[0]||lastItem;inks.push({kind:'dot',point:[x,y,z],tone,size,part:group.id,component:scope?.id,stage:scope?.stage,move:group.move});append(k.dotsSvg([k.iso([x,y,z],P)],{size,tone}));lastItem=previous;};
 const motion=(spec,fn)=>{const before=activeMotion;activeMotion=spec;fn();activeMotion=before;};
 const material=(name,fn)=>{const before=activeMaterial;activeMaterial=diyMaterialFor(name,id,group?.id,scope?.id);fn();activeMaterial=before;};
 const exterior=(offset,fn)=>{const before=activeExterior;activeExterior=offset;fn();activeExterior=before;};
 const detail=(id,stage,fn)=>{scope={id,stage};fn();scope=null;};
 const line=(points,tone='mid')=>{inks.push({kind:'line',points,tone,part:group.id,component:scope?.id,stage:scope?.stage,move:group.move,inspectionOffset:activeExterior});append(k.lineSvg(points.map(p=>k.iso(p,P)),{tone}));};
 const text=(x,y,z,value,size=7)=>{inks.push({kind:'text',point:[x,y,z],text:value,size,part:group.id,move:group.move});append(k.faceTextSvg(k.topMatrix([x,y],z,P),value,{size,tone:'mid',anchor:'middle'}));};
 const cloneGeometry=(offset,test)=>{const originals=R.solids.filter(test).slice();for(const source of originals){const shape=A.moved(source,offset);begin(source.render.component||source.owner,source.move||[0,0,0]);detail(source.render.component||source.owner,source.render.stage||'foundations',()=>material(source.render.materialKey||null,()=>exterior(source.render.inspectionOffset||null,()=>{const paths=shape.kind==='prism'?G.prismOf(shape.F,shape.poly,shape.s0,shape.s1,P):G.lathe(shape.poly,shape.F,P,{steps:48,rims:'all',smooth:{rows:3}});add(paths,shape,source.render.tone,source.render.lit);})));}};
 const finish=()=>{
  if(process.env.ANATOMY_DEVICE&&process.env.ANATOMY_DEVICE!==id)return;
  if(process.env.ANATOMY_DEVICES&&!process.env.ANATOMY_DEVICES.split(',').includes(id))return;
  if(!enriched){enriched=true;engineeringGeometry(id,{begin,detail,slab,post,round,beam,screw,ring,motion});}
  if(!view)writeFileSync(`public/art/${id}-model.json`,JSON.stringify({azimuth,elevation,bounds,inks,parts:R.solids.map(s=>({kind:s.kind,F:s.F,poly:s.poly,s0:s.s0,s1:s.s1,cut:s.cut,move:s.move,part:s.owner,name:s.name,...s.render}))}));
  for(let pass=0;pass<6;pass++){
   const settled=A.settle(R,P,{states:[0,.5,1],step:process.argv.includes('--preview')?2:process.argv.includes('--audit')?.5:(view?2:1)});const items=R.items;const parent=items.map((_,i)=>i);const find=i=>parent[i]===i?i:(parent[i]=find(parent[i]));let changed=false;
   for(const pair of [...settled.solved.cycles,...settled.solved.dropped.map(rule=>({a:rule.front,b:rule.back}))]){if(items[pair.a].piece===items[pair.b].piece){const a=find(pair.a),b=find(pair.b);if(a!==b){parent[b]=a;changed=true;}}}
   if(!changed)break;
   const clusters=new Map();items.forEach((item,i)=>{const root=find(i);if(!clusters.has(root))clusters.set(root,[]);clusters.get(root).push(item);});
   R.items=[...clusters.values()].map(list=>list.length===1?list[0]:({...list[0],name:list.map(i=>i.name).join('+'),svg:list.map(i=>i.svg).join(''),shapes:list.flatMap(i=>i.shapes),key:list.reduce((sum,i)=>sum+i.key,0)/list.length}));R.settled=null;
  }
  const drawing=R.items.toSorted((a,b)=>a.key-b.key).map(item=>({id:item.shapes[0]?.render?.inspectionOffset||item.piece.startsWith('hardware-')?item.shapes[0].render.component:item.piece,svg:item.svg,lift:k.translateAlong(P,item.move),inspectionOffset:item.shapes[0]?.render?.inspectionOffset}));
  const diy=['arduino-rover','pi-station','breadboard-led','reaction-timer','plant-waterer','smart-watch','galaxy-watch6-classic'].includes(id);
  const fitFrame=amount=>{const points=R.solids.flatMap(s=>{const b=A.boundsOf(s),offset=s.move||[0,0,0];return k.boxCorners({x:b.min[0],y:b.min[1],w:b.max[0]-b.min[0],d:b.max[1]-b.min[1]},b.min[2],b.max[2]).map(p=>k.iso(p.map((v,i)=>v+offset[i]*amount),P));});const lo=[0,1].map(i=>Math.min(...points.map(p=>p[i]))-24),hi=[0,1].map(i=>Math.max(...points.map(p=>p[i]))+24);return [lo[0],lo[1],hi[0]-lo[0],hi[1]-lo[1]].map(v=>Number(v.toFixed(3)));};
  if(diy){drawing[0].assembledFrame=fitFrame(0);drawing[0].explodedFrame=fitFrame(1);}
  A.auditOrExit(R,P,{frames:[0,.25,.5,.75,1],apart:true});
  writeFileSync(`public/art/${id}${viewSuffix}.json`,JSON.stringify(drawing));
  if(!view)for(const opened of [false,true])writeFileSync(`public/art/${id}${opened?'-open':''}.svg`,k.figureSvg({width:560,height:560,label:`Illustrative ${id} anatomy`,body:'<style>'+materialCss+diyMaterialCss+'[data-material=glass]{opacity:.42}[data-material=white-polymer]{--anatomy-top:#f5f5ef;--anatomy-shade-0:#a6aca5;--anatomy-shade-1:#bec4bc;--anatomy-shade-2:#d6dad2;--anatomy-shade-3:#e8ebe3}[data-material=acoustic-mesh]{--anatomy-top:#303936;--anatomy-shade-0:#101a17;--anatomy-shade-1:#1b2823;--anatomy-shade-2:#27362f;--anatomy-shade-3:#34433b}</style>'+drawing.map(g=>`<g ${opened?`transform="${g.lift}"`:''}>${g.svg}</g>`).join(''),standalone:'light'}).replace('viewBox="0 0 560 560"',diy?`viewBox="${drawing[0][opened?'explodedFrame':'assembledFrame'].join(' ')}"`:'viewBox="0 0 560 560"').replace('<svg ', '<svg style="--anatomy-paper:#e3e6dc;--anatomy-top:#c8d3bc;--anatomy-shade-0:#6c816c;--anatomy-shade-1:#869780;--anatomy-shade-2:#a1b098;--anatomy-shade-3:#b9c5ad;--anatomy-hi:#405842;--anatomy-mid:#6b7e66;--anatomy-lo:#95a48b;--anatomy-faint:#aab6a0" '));
  console.log(`${id}: ${groups.length} assemblies, ${R.solids.length} supported solids`);
 };
 return {P,begin,plate,lathe,latheHalf,collarWall,slab,round,post,beam,ring,screw,detail,motion,exterior,material,cloneGeometry,text,line,finish};
}
{
 const m=machine('controller',k.boxCorners({x:-100,y:-50,w:200,d:140},0,125));const {begin,slab,post,detail,screw,text}=m;
 begin('shell');m.plate([[-80,-48],[80,-48],[94,-34],[94,12],[90,64],[78,78],[54,78],[41,42],[-41,42],[-54,78],[-78,78],[-90,64],[-94,12],[-94,-34]],0,5,'mid');for(const x of [-86,86])for(const y of [-30,61]){slab(x-3,y-3,6,6,5,5,'mid');screw(x,y,10);}
 for(const x of [-70,70])for(const y of [-29,10])slab(x-2,y-2,4,4,5,5,'mid');
 begin('rumble',[0,0,24]);for(const x of [-66,66]){slab(x-14,22,28,26,5,10,'lo',5);slab(x-9,18,18,4,5,6,'mid');detail('weights','systems',()=>post(x,35,15,3,7,'mid'));}
 begin('board',[0,0,47]);slab(-76,-32,152,47,10,2,'mid',8);slab(-9,-15,18,17,12,4,'hi');for(let i=0;i<12;i++)slab(-65+i*11,-26,4,3,12,1,'hi',.5);detail('radio','engineering',()=>{slab(30,-27,20,10,12,3,'hi');text(40,-22,15.1,'RF',4);});
 begin('sticks',[0,0,73]);for(const [x,y] of [[-49,-9],[27,2]]){slab(x-12,y-12,24,24,12,8,'mid');post(x,y,20,10,4);post(x,y,30,4,11);m.ring(G.frameAlong([x,y,34],[0,0,1]),0,8);detail('sensors','systems',()=>slab(x+12,y-7,3,14,12,7,'hi',.5));}
 begin('buttons',[0,0,100]);slab(-61,7,7,7,12,4,'mid');for(const [x,y] of [[63,-26],[49,-12],[77,-12],[63,2]])slab(x-2,y-2,4,4,12,4,'mid');for(const x of [-61,61])slab(x-4,-43,8,7,5,11,'mid');for(const [x,y] of [[63,-26],[49,-12],[77,-12],[63,2]])post(x,y,16,6,5);m.plate([[-61,5],[-54,5],[-54,15],[-44,15],[-44,22],[-54,22],[-54,26],[-61,26],[-61,22],[-72,22],[-72,15],[-61,15]],16,4);for(const x of [-61,61])slab(x-17,-45,34,11,16,5,'mid',3);detail('contacts','engineering',()=>{for(const x of [-6,0,6])slab(x-2,-6,4,5,16,3,'hi',1);});m.finish();
}
{
 const m=machine('console',k.boxCorners({x:-125,y:-62,w:250,d:124},0,120));const {begin,slab,post,detail,text,screw}=m;
 begin('case');slab(-122,-59,244,118,0,5,'mid',13);for(const x of [-116,116])for(const y of [-51,51]){slab(x-3,y-3,6,6,5,3,'mid');screw(x,y,8);}for(let i=0;i<10;i++)slab(-35+i*7,-58,3,3,5,3,'lo',.4);
 begin('power',[0,0,24]);slab(-72,-44,75,87,5,5,'hi',4);text(-35,8,10.1,'Li-ion');detail('powerchip','systems',()=>slab(-68,30,16,9,10,2,'mid'));
 begin('compute',[0,0,47]);slab(7,-44,66,88,5,2,'mid');slab(18,-28,26,27,7,3,'hi');slab(51,-28,16,24,7,2,'mid');for(let i=0;i<10;i++)slab(11+i*6,35,3,5,7,1,'hi',.3);detail('storage','systems',()=>slab(20,7,31,15,7,3,'hi'));detail('cooling','engineering',()=>{slab(17,-27,28,25,10,2,'mid');for(let i=0;i<8;i++)slab(18+i*3,-27,1,25,12,3,'hi',0);});
 begin('controls',[0,0,74]);for(const x of [-100,100]){slab(x-15,-44,30,88,5,5,'mid',8);post(x,-20,10,4,8);for(const [dx,dy] of [[0,0],[-8,9],[8,9],[0,18]])post(x+dx,dy,10,3,3);}detail('inputscan','engineering',()=>slab(-112,33,24,7,10,2,'hi'));
 begin('screen',[0,0,99]);for(const x of [-77,73])for(const y of [-47,43])slab(x,y,4,4,5,13,'mid');slab(-79,-49,158,98,18,3,'mid',7);slab(-73,-43,146,86,21,.8,'hi',4);text(0,-13,22,'PLAY',14);slab(-43,4,28,23,21.8,.2,'hi');slab(-8,4,51,23,21.8,.2,'hi');m.finish();
}
{
 const m=machine('solar',k.boxCorners({x:-65,y:-58,w:130,d:116},0,200),38,22);const {begin,slab,post,detail,text,screw}=m;
 begin('housing');slab(-60,-54,120,108,0,8,'mid',12);slab(-60,-54,6,108,8,33,'mid');slab(54,-54,6,108,8,33,'mid');slab(-54,-54,108,6,8,33,'mid');slab(-54,48,108,6,8,33,'mid');for(const x of [-45,45])for(const y of [-40,40]){post(x,y,8,21,3,'mid');screw(x,y,29);}slab(-20,54,40,5,12,13,'mid',3);
 begin('cell',[0,0,36]);slab(-40,-30,80,52,8,9,'hi',4);text(0,-3,17.1,'Li-ion');detail('protection','engineering',()=>slab(25,-27,12,14,17,2,'mid'));
 begin('charger',[0,0,70]);slab(-40,25,80,20,8,2,'mid');slab(-23,29,17,12,10,3,'hi');for(let i=0;i<8;i++)slab(2+i*4,28,2,5,10,1,'hi',.3);detail('regulator','systems',()=>slab(11,33,15,9,10,3,'hi'));
 begin('led',[0,0,101]);slab(-43,-37,86,76,29,3,'hi',4);for(let y=0;y<3;y++)for(let x=0;x<4;x++){slab(-29+x*18,-24+y*19,8,8,32,2,'hi',1);}detail('phosphor','systems',()=>slab(-29,-24,8,8,34,.3,'hi',1));slab(-48,-42,96,5,29,12,'mid');slab(-48,37,96,5,29,12,'mid');
 begin('panel',[0,0,138]);slab(-60,-54,120,108,41,3,'mid',8);for(let y=0;y<4;y++)for(let x=0;x<5;x++)slab(-51+x*21,-44+y*23,18,20,44,.8,'lo',1);detail('junction','engineering',()=>slab(12,-21,18,20,44.8,.2,'hi',1));m.finish();
}
{
 const m=machine('car',k.boxCorners({x:-90,y:-140,w:180,d:280},0,210),35,22);const {begin,slab,round,detail,screw,text}=m;
 begin('chassis');for(const x of [-67,67])for(const y of [-87,87]){const F=G.frameAlong([x,y,25],[1,0,0]);round(F,-10,10,25,'lo');round(F,x<0?-10:10,x<0?-9.6:10.4,16,'mid');}slab(-55,-116,110,232,22,6,'mid',7);for(const x of [-46,46]){slab(x-3,-105,6,210,28,5,'mid');for(const y of [-99,99])screw(x,y,33);}for(const y of [-87,87])slab(-60,y-3,120,6,25,3,'mid');
 begin('pack',[0,0,35]);slab(-42,-48,84,116,28,4,'mid',4);for(let y=0;y<6;y++)for(let x=0;x<4;x++)slab(-38+x*19,-43+y*17,16,14,32,4,'hi');detail('bms','systems',()=>slab(-37,60,40,6,32,3,'mid'));detail('busbars','engineering',()=>{for(let i=0;i<4;i++)slab(-35+i*19,-44,2,100,36,.7,'mid',.2);});
 begin('drive',[0,0,67]);slab(-25,79,50,24,28,6,'mid');slab(-20,80,40,22,34,3,'hi',3);slab(-20,99,40,3,37,13,'mid');for(const x of [-20,17])slab(x,80,3,19,37,13,'mid');detail('rotor','systems',()=>m.motion({pivot:[0,91,43.5],axis:[1,0,0],ratio:1},()=>m.round(G.frameAlong([0,91,43.5],[1,0,0]),-18,18,2,'hi')));slab(-12,73,24,6,34,9,'mid');
 begin('electronics',[0,0,98]);slab(-36,-92,72,33,28,12,'hi',4);for(let i=0;i<12;i++)slab(-33+i*5,-89,2,27,40,4,'mid',.3);detail('switches','engineering',()=>slab(-31,-87,25,23,44,.8,'hi'));slab(14,-110,22,14,28,9,'mid');
 begin('body',[0,0,119]);for(const x of [-54,44])for(const y of [-86,81])slab(x,y,10,6,33,15,'mid');slab(-49,-86,98,154,48,4,'hi',3);slab(-55,-125,110,38,48,4,'hi',10);slab(-55,104,110,21,48,4,'hi',10);for(const x of [-55,49])slab(x,-100,6,225,48,4,'hi',2);for(const x of [-48,43])for(const y of [-66,49])slab(x,y,5,8,52,30,'mid');slab(-47,-66,94,123,82,4,'hi',8);slab(-45,-63,90,18,69,1,'lo');slab(-45,42,90,15,69,1,'lo');for(const x of [-34,21])for(const y of [-35,10]){slab(x,y,13,25,52,8,'mid',3);slab(x,y+20,13,5,60,15,'mid',2);}for(const x of [-41,24])slab(x,-124,17,5,50,2,'hi',2);text(0,-101,52.2,'EV',8);m.finish();
}
{
 // An upright bicycle uses box-section beams to keep the load-bearing frame
 // visible. Wheels are true annular solids, not opaque decorative circles.
 const m=machine('bicycle',[[-120,-20,0],[120,20,0],[-120,-20,125],[120,20,125],[-120,-20,165],[120,20,165]],64,14);const {begin,round,beam,slab,detail,ring}=m;
 begin('wheels');for(const x of [-77,77]){const F=G.frameAlong([x,0,39],[0,1,0]);round(F,-3.2,0,39,'lo',32);ring(F,-3.2,34);round(F,-8,8,4,'hi');for(let i=0;i<16;i++){const a=i*Math.PI/8;beam([x+Math.cos(a)*4,0,39+Math.sin(a)*4],[x+Math.cos(a)*31.998,0,39+Math.sin(a)*31.998],.6,'mid');}round(F,0,3.2,39,'lo',32);ring(F,3.2,34);detail('bearings','systems',()=>round(F,8,8.6,2,'hi',.8));}
 begin('frame',[0,0,0]);for(const [a,b] of [[[ -77,-10,39],[-16,-10,41]],[[-77,-10,39],[-35,-10,92]],[[-35,-10,92],[-16,-10,41]],[[-35,-10,92],[42,-10,91]],[[42,-10,87],[-16,-10,41]]])beam(a,b,4,'mid');beam([-35,-10,92],[-39,-10,108],4,'mid');slab(-55,-18,31,16,108,4,'hi',5);const head=G.frameAlong([46,-10,91],G.unit3([-8,0,39]));for(const poly of [[[-5,-5],[-3,-5],[-3,5],[-5,5]],[[3,-5],[5,-5],[5,5],[3,5]],[[-3,-5],[3,-5],[3,-3],[-3,-3]],[[-3,3],[3,3],[3,5],[-3,5]]]){m.collarWall(head,poly,-5,5);}detail('joints','engineering',()=>{for(const p of [[-35,-10,92],[-16,-10,41]])round(G.frameAlong(p,[0,1,0]),-3,3,5,'hi');});
 begin('steering',[-1.6,0,7.8]);beam([77,-10,39],[50,-10,71],3,'mid');beam([50,-10,71],[42,-10,110],4,'mid');beam([42,-10,110],[52,-10,117],3,'mid');beam([52,-32,117],[52,12,117],3,'mid');for(const y of [-34,5])slab(49,y,7,9,116,3,'lo',2);
 begin('drivetrain',[0,24,0]);round(G.frameAlong([-16,-7,41],[0,1,0]),0,18,2,'mid');const F=G.frameAlong([-16,7,41],[0,1,0]);round(F,0,1.5,14,'mid',11);round(F,1.5,3,4,'hi');for(let i=0;i<4;i++){const a=i*Math.PI/2;beam([-16+Math.cos(a)*4,8,41+Math.sin(a)*4],[-16+Math.cos(a)*11,8,41+Math.sin(a)*11],1,'mid');}beam([-16,10,41],[-16,10,21],3,'hi');slab(-24,7,16,8,18,3,'lo');const back=G.frameAlong([-77,7,39],[0,1,0]);round(back,1,2.5,6,'mid',4); // The chain's two closed runs terminate on the sprockets.
 for(const z of [30,52])beam([-76,8,z===30?34:44],[-16,8,z],1,'lo');detail('ratio','systems',()=>{ring(F,1.6,12);ring(back,1.6,4.5);});
 begin('brakes',[0,-24,0]);for(const x of [-77,77]){const mount=x<0?[-45,-13.5,82]:[50,-13.5,71];beam(mount,[x,-13.5,73.5],3,'mid');beam([x,-13.5,73.5],[x,-5,73.5],3,'mid');beam([x-7,-5,73.5],[x+7,-5,73.5],3,'mid');slab(x-9,-8.2,5,5,71,1,'lo',.3);slab(x+4,-8.2,5,5,71,1,'lo',.3);}detail('friction','engineering',()=>slab(81,-8.2,5,5,72,.2,'hi',.3));m.finish();
}
{
 const m=machine('drone',k.boxCorners({x:-120,y:-115,w:240,d:230},0,165),38,30);const {begin,slab,post,beam,detail,screw}=m;
 begin('frame');for(const x of [-78,78])for(const y of [-78,78]){post(x,y,0,8,8,'lo');beam([0,0,10],[x,y,10],4,'mid');slab(x-10,y-20,20,30,8,4,'mid',4);screw(x+7,y+7,12);}slab(-30,-30,60,60,8,4,'mid',8);for(const x of [-22,22])for(const y of [-22,22]){post(x,y,12,9,2,'mid');screw(x,y,21);}
 begin('battery',[0,0,25]);slab(-18,4,36,22,12,7,'hi',3);slab(-12,4,4,22,19,1,'lo',0);slab(8,4,4,22,19,1,'lo',0);
 begin('controller',[0,0,51]);slab(-27,-27,54,25,21,2,'mid',2);slab(-8,-23,16,15,23,3,'hi');detail('imu','systems',()=>slab(14,-23,7,7,23,2,'hi',1));detail('mixer','engineering',()=>slab(-7,-22,14,13,26,.3,'hi'));for(let i=0;i<6;i++)slab(-24+i*7,-7,3,3,23,1,'hi',.4);
 begin('motors',[0,0,78]);for(const x of [-78,78])for(const y of [-78,78]){post(x,y,12,2,8,'mid');post(x,y,14,16,1.5,'hi');const shell=[];for(let i=0;i<=16;i++){const a=i*Math.PI/16;shell.push([x+Math.cos(a)*8,y+Math.sin(a)*8]);}for(let i=16;i>=0;i--){const a=i*Math.PI/16;shell.push([x+Math.cos(a)*7,y+Math.sin(a)*7]);}m.plate(shell,14,13,'mid');m.motion({pivot:[x,y,21],axis:[0,0,1],ratio:x*y>0?1:-1},()=>m.round(G.frameAlong([x,y,27],[0,0,1]),0,1,8,'mid',6));post(x,y,28,2,3,'hi');slab(x-9,y-20,18,8,12,2,'mid');detail('esc','systems',()=>slab(x-6,y-19,12,6,14,2,'hi'));m.ring(G.frameAlong([x,y,28],[0,0,1]),0,6);}
 begin('rotors',[0,0,117]);for(const x of [-78,78])for(const y of [-78,78]){m.motion({pivot:[x,y,30],axis:[0,0,1],ratio:x*y>0?1:-1},()=>m.plate([[x-32,y-4],[x-4,y-3],[x+30,y-6],[x+32,y],[x+4,y+3],[x-30,y+6]],30,1.5,'hi'));detail('hub','engineering',()=>post(x,y,31.5,1.5,3,'mid'));}m.finish();
}
buildDiy(machine);

buildAdvanced(machine);
