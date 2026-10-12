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
 const inks=[];const groups=[],R=A.recorder(P,{ground:shape=>A.boundsOf(shape).min[2]<=.05});let group,scope=null,lastItem=null;
 const begin=(id,move=[0,0,0])=>{group={id,move,lift:k.translateAlong(P,move),svg:'',shapes:[]};groups.push(group);};
 const append=svg=>{if(scope)svg=`<g data-component="${scope.id}" data-stage="${scope.stage}">${svg}</g>`;group.svg+=svg;if(lastItem)lastItem.svg+=svg;};
 const add=(paths,shape,tone='hi',lit=false)=>{const solid=R.solid({...shape,name:R.nameFor(group.id),owner:group.id,render:{tone,lit,component:scope?.id,stage:scope?.stage}});const raw=k.solidSvg(paths,{tone,lit});const svg=scope?`<g data-component="${scope.id}" data-stage="${scope.stage}">${raw}</g>`:raw;group.svg+=svg;group.shapes.push(solid);const b=A.boundsOf(solid);lastItem=R.put({name:solid.name,piece:group.id,at:b.min.map((v,i)=>(v+b.max[i])/2),svg,shapes:[solid],move:group.move});};
 const plate=(poly,z,h,tone='hi')=>add(k.extrude(poly,z,h,P,{convex:false}),A.extruded(poly,z,h),tone);
 const slab=(x,y,w,d,z,h=3,tone='hi',r=2)=>add(k.slabOf({x,y,w,d,r},z,h,P,6,.5),A.slab({x,y,w,d,r},z,h,{},6),tone);
 const round=(F,s0,s1,r,tone='hi',inner=0)=>add(inner?G.ringBand(s0,s1,inner,r,F,P,{fill:'facets'}):G.disc(s0,s1,r,F,P),inner?A.ring(F,s0,s1,inner,r):A.disc(F,s0,s1,r),tone);
 const post=(x,y,z,h,r,tone='hi')=>round(G.frameAlong([x,y,z],[0,0,1]),0,h,r,tone);
 const collarWall=(F,poly,s0,s1)=>add(G.prismOf(F,poly,s0,s1,P),A.prism(F,poly,s0,s1),'mid');
 const beam=(a,b,w=4,tone='mid')=>{const F=G.frameAlong(a,G.unit3(G.sub3(b,a))),len=G.len3(G.sub3(b,a)),poly=[[-w/2,-w/2],[w/2,-w/2],[w/2,w/2],[-w/2,w/2]];add(G.prismOf(F,poly,0,len,P),A.prism(F,poly,0,len),tone);};
 const ring=(F,s,r,tone='mid')=>{inks.push({kind:'circle',F,s,r,tone,part:group.id,component:scope?.id,stage:scope?.stage,move:group.move});const point=G.pointOf(F,s,r,0);const candidates=R.items.filter(i=>i.piece===group.id);const target=candidates.toSorted((a,b)=>Math.min(...a.shapes.map(shape=>Math.abs(A.sdf(shape,point))))-Math.min(...b.shapes.map(shape=>Math.abs(A.sdf(shape,point)))))[0];const previous=lastItem;lastItem=target||lastItem;append(k.lineSvg(G.circleOf(F,s,r,P),{tone}));lastItem=previous;};
 const screw=(x,y,z,tone='lo',size=.8)=>{const previous=lastItem;const candidates=R.items.filter(i=>i.piece===group.id);lastItem=candidates.toSorted((a,b)=>Math.min(...a.shapes.map(shape=>Math.abs(A.sdf(shape,[x,y,z]))))-Math.min(...b.shapes.map(shape=>Math.abs(A.sdf(shape,[x,y,z])))))[0]||lastItem;inks.push({kind:'dot',point:[x,y,z],tone,size,part:group.id,component:scope?.id,stage:scope?.stage,move:group.move});append(k.dotsSvg([k.iso([x,y,z],P)],{size,tone}));lastItem=previous;};
 const detail=(id,stage,fn)=>{scope={id,stage};fn();scope=null;};
 const text=(x,y,z,value,size=7)=>{inks.push({kind:'text',point:[x,y,z],text:value,size,part:group.id,move:group.move});append(k.faceTextSvg(k.topMatrix([x,y],z,P),value,{size,tone:'mid',anchor:'middle'}));};
 const finish=()=>{
  if(process.env.ANATOMY_DEVICE&&process.env.ANATOMY_DEVICE!==id)return;
  if(!view)writeFileSync(`public/art/${id}-model.json`,JSON.stringify({azimuth,elevation,bounds,inks,parts:R.solids.map(s=>({kind:s.kind,F:s.F,poly:s.poly,s0:s.s0,s1:s.s1,move:s.move,part:s.owner,name:s.name,...s.render}))}));
  for(let pass=0;pass<6;pass++){
   const settled=A.settle(R,P,{states:[0,.5,1],step:process.argv.includes('--audit')?.5:(view?2:1)});const items=R.items;const parent=items.map((_,i)=>i);const find=i=>parent[i]===i?i:(parent[i]=find(parent[i]));let changed=false;
   for(const pair of [...settled.solved.cycles,...settled.solved.dropped.map(rule=>({a:rule.front,b:rule.back}))]){if(items[pair.a].piece===items[pair.b].piece){const a=find(pair.a),b=find(pair.b);if(a!==b){parent[b]=a;changed=true;}}}
   if(!changed)break;
   const clusters=new Map();items.forEach((item,i)=>{const root=find(i);if(!clusters.has(root))clusters.set(root,[]);clusters.get(root).push(item);});
   R.items=[...clusters.values()].map(list=>list.length===1?list[0]:({...list[0],name:list.map(i=>i.name).join('+'),svg:list.map(i=>i.svg).join(''),shapes:list.flatMap(i=>i.shapes),key:list.reduce((sum,i)=>sum+i.key,0)/list.length}));R.settled=null;
  }
  const drawing=R.items.toSorted((a,b)=>a.key-b.key).map(item=>({id:item.piece,svg:item.svg,lift:k.translateAlong(P,item.move)}));
  A.auditOrExit(R,P,{frames:[0,.25,.5,.75,1],apart:true});
  writeFileSync(`public/art/${id}${viewSuffix}.json`,JSON.stringify(drawing));
  if(!view)for(const opened of [false,true])writeFileSync(`public/art/${id}${opened?'-open':''}.svg`,k.figureSvg({width:560,height:560,label:`Illustrative ${id} anatomy`,body:drawing.map(g=>`<g ${opened?`transform="${g.lift}"`:''}>${g.svg}</g>`).join(''),standalone:'light'}).replace('<svg ', '<svg style="--anatomy-paper:#e3e6dc;--anatomy-top:#c8d3bc;--anatomy-shade-0:#6c816c;--anatomy-shade-1:#869780;--anatomy-shade-2:#a1b098;--anatomy-shade-3:#b9c5ad;--anatomy-hi:#405842;--anatomy-mid:#6b7e66;--anatomy-lo:#95a48b;--anatomy-faint:#aab6a0" '));
  console.log(`${id}: ${groups.length} assemblies, ${R.solids.length} supported solids`);
 };
 return {P,begin,plate,collarWall,slab,round,post,beam,ring,screw,detail,text,finish};
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
 begin('drive',[0,0,67]);slab(-25,79,50,24,28,6,'mid');slab(-20,80,40,22,34,16,'hi',5);detail('rotor','systems',()=>slab(-16,84,32,14,50,2,'mid'));slab(-12,73,24,6,34,9,'mid');
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
 begin('motors',[0,0,78]);for(const x of [-78,78])for(const y of [-78,78]){post(x,y,12,16,8,'mid');post(x,y,28,2,3,'hi');slab(x-9,y-20,18,8,12,2,'mid');detail('esc','systems',()=>slab(x-6,y-19,12,6,14,2,'hi'));m.ring(G.frameAlong([x,y,28],[0,0,1]),0,6);}
 begin('rotors',[0,0,117]);for(const x of [-78,78])for(const y of [-78,78]){m.plate([[x-32,y-4],[x-4,y-3],[x+30,y-6],[x+32,y],[x+4,y+3],[x-30,y+6]],30,1.5,'hi');detail('hub','engineering',()=>post(x,y,31.5,1.5,3,'mid'));}m.finish();
}
{
 const m=machine('arduino-rover',k.boxCorners({x:-70,y:-72,w:140,d:144},0,133),38,25);const {begin,slab,post,round,detail,screw,text}=m;
 begin('chassis');for(const x of [-61,61])for(const y of [-37]){const F=G.frameAlong([x,y,14],[1,0,0]);round(F,-5,5,14,'lo');m.ring(F,x<0?-5:5,10);}post(0,55,0,6,6,'lo');slab(-8,47,16,16,6,6,'mid');slab(-45,-66,90,132,12,4,'mid',8);for(const x of [-35,35])for(const y of [-57,57])screw(x,y,16);for(const x of [-23,23])for(const y of [-53,-20])post(x,y,16,5,2,'mid');for(const x of [-17,17])for(const y of [-5,10])post(x,y,16,5,2,'mid');
 begin('power',[0,0,24]);slab(-28,24,56,27,16,4,'mid');for(let i=0;i<4;i++)slab(-25+i*13,27,10,21,20,5,'hi',3);slab(-8,52,16,6,16,4,'lo',1);
 begin('board',[0,0,48]);slab(-28,-58,56,44,21,2,'mid',2);slab(-17,-45,30,9,23,3,'hi');for(let i=0;i<12;i++)slab(-23+i*4,-55,2,3,23,3,'lo',.4);slab(-27,-29,10,10,23,6,'hi');slab(17,-27,8,8,23,5,'lo');detail('gpio','engineering',()=>{for(let i=0;i<8;i++)slab(-12+i*4,-19,2,3,23,3,'lo',.4);});detail('pwm','systems',()=>slab(16,-46,8,9,23,2,'hi'));text(0,-29,23.1,'UNO',6);
 begin('driver',[0,0,72]);slab(-22,-10,44,25,21,2,'mid',2);slab(-8,-5,16,10,23,3,'hi');detail('bridge','systems',()=>slab(-7,-4,14,8,26,.3,'hi'));for(const x of [-18,15])for(let y=0;y<4;y++)slab(x,-6+y*5,3,3,23,3,'lo',.3);
 begin('motors',[0,0,100]);for(const x of [-1,1])for(const y of [-37]){slab(x<0?-56:45,y-10,11,20,12,10,'mid',2);detail('gearbox','engineering',()=>slab(x<0?-56:51,y-9,5,18,22,2,'hi',1));slab(x<0?-45:41,y-8,4,16,16,4,'mid');}m.finish();
}
{
 const m=machine('pi-station',k.boxCorners({x:-65,y:-54,w:130,d:108},0,132),38,27);const {begin,slab,post,detail,screw,text}=m;
 begin('case');slab(-60,-50,120,100,0,4,'mid',7);for(const x of [-60,56])slab(x,-46,4,92,4,28,'mid');slab(-56,-50,112,4,4,28,'mid');for(let i=0;i<9;i++)slab(-56+i*13,46,8,4,4,28,'mid');for(const x of [-36,36])for(const y of [-32,4])post(x,y,4,6,2,'mid');for(const x of [17,40])for(const y of [25,39])post(x,y,4,16,2,'mid');for(const x of [-38,-18])for(const y of [24,37])post(x,y,4,6,2,'mid');
 begin('power',[0,0,21]);slab(-43,20,30,22,10,2,'mid');slab(-40,24,12,12,12,5,'lo');slab(-24,25,8,10,12,3,'hi');
 begin('computer',[0,0,43]);slab(-43,-39,86,50,10,2,'mid',3);detail('processor','engineering',()=>slab(-10,-28,20,19,12,3,'hi'));detail('header','engineering',()=>{slab(-39,-37,78,5,12,4,'lo',0);for(let i=0;i<20;i++){post(-36+i*3.7,-34.5,16,2,.45,'hi');}});for(const x of [-37,-21,-5,11,27])slab(x,-5,10,8,12,5,'mid');text(23,-21,12.1,'Pi',8);
 begin('sensor',[0,0,70]);slab(12,20,34,25,20,2,'mid',2);slab(25,25,9,8,22,2,'hi');detail('sensing','systems',()=>slab(26,26,7,6,24,.3,'hi'));detail('i2c','systems',()=>{for(let i=0;i<4;i++)post(17+i*7,41,22,3,1,'lo');});for(const x of [17,40])screw(x,25,22);
 begin('storage',[0,0,98]);slab(-31,-25,17,17,12,1,'lo',1);for(let i=0;i<5;i++)slab(-28+i*2.5,-24,1.5,4,13,.25,'mid',0);m.finish();
}
// Breadboard projects: real board supports and separated component bodies.
// Jumpers show construction; pin numbers and electrical paths use the build table.
for(const id of ['breadboard-led','reaction-timer','plant-waterer']){
 const water=id==='plant-waterer',timer=id==='reaction-timer';
 const m=machine(id,k.boxCorners({x:-100,y:-65,w:200,d:130},0,135),38,32);
 const {begin,slab,post,detail,text,screw,beam}=m;
 begin('breadboard');slab(-98,-60,196,120,0,4,'lo',7);
 for(const x of [-83,-37])for(const y of [-36,36])post(x,y,4,4,2,'mid');
 slab(0,-50,88,100,4,7,'hi',3);slab(41,-46,5,92,11,.2,'lo',0);
 for(let row=0;row<10;row++)for(const x of [9,16,23,30,37,50,57,64,71,78])screw(x,-40+row*9,11,'hi',1.35);
 detail('contacts','systems',()=>screw(9,-40,11,'hi',1.35));
 begin('controller',[0,0,30]);slab(-91,-43,62,86,8,2,'mid',3);
 detail('processor','engineering',()=>slab(-76,-14,18,31,10,4,'hi',1));
 detail('gpio','systems',()=>{for(const x of [-89,-35])for(let i=0;i<9;i++){slab(x,-34+i*8,4,6,10,4,'lo',.6);screw(x+2,-31+i*8,14);}});
 slab(-79,-42,19,14,10,9,'mid',2);slab(-52,-38,12,11,10,7,'lo',3);for(const x of [-70,-57])post(x,30,10,5,3,'mid');text(-60,22,10.1,'UNO',6);
 if(!water){
  begin('resistor',[0,0,56]);for(const x of [37,50])post(x,5,11,5,.7,'lo');beam([37,5,16],[40,5,19],1,'lo');beam([47,5,19],[50,5,16],1,'lo');slab(40,2,7,6,19,3,'mid',2);for(const x of [41,43,45])slab(x,2,0.6,6,22,.15,'hi',0);
  begin('led',[0,0,77]);for(const x of [37,50])post(x,-22,11,5,.7,'lo');beam([37,-22,16],[42,-22,19],1,'lo');beam([50,-22,16],[45,-22,19],1,'lo');post(43.5,-22,19,2,5,'mid');post(43.5,-22,21,9,4,'hi');detail('junction','engineering',()=>post(43.5,-22,30,1,2.8,'hi'));
  if(timer){begin('button',[0,0,58]);for(const x of [37,50])for(const y of [14,32])post(x,y,11,4,.8,'lo');slab(34,11,19,24,15,4,'mid',2);detail('timing','engineering',()=>slab(39,17,9,12,19,.4,'lo',1));post(43.5,23,19.4,6,4,'hi');}
  begin('wiring',[0,0,102]);for(const x of [-33,9])post(x,32,14,4,.7,'lo');beam([-33,32,18],[9,32,18],1.3,'mid');for(const x of [30,57])post(x,38,11,4,.7,'lo');beam([30,38,15],[57,38,15],1.3,'mid');
 }else{
  begin('sensor',[0,0,62]);slab(67,-46,15,53,11,2,'mid',2);slab(65,-5,19,15,13,2,'mid',2);slab(70,-1,9,6,15,2,'hi',1);for(const x of [68,73,78])post(x,7,15,3,.8,'lo');detail('sensing','engineering',()=>slab(68,-45,13,39,13,.4,'hi',1));
  begin('driver',[0,0,85]);for(const x of [16,53])for(const y of [8,35])post(x,y,11,4,1,'mid');slab(12,4,46,36,15,2,'mid',2);slab(22,10,25,22,17,15,'hi',2);for(let i=0;i<3;i++){slab(15+i*12,34,8,5,17,6,'mid',1);screw(19+i*12,36.5,23);}for(let i=0;i<3;i++)post(14+i*5,7,17,3,.7,'lo');
  begin('pump',[0,0,108]);slab(69,18,22,29,11,4,'mid',3);post(80,31,15,17,9,'hi');slab(73,25,14,12,32,3,'mid',3);post(80,31,35,8,3,'hi');
 }
 m.finish();
}
