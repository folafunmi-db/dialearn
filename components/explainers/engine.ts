import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {explainerStories} from '@/lib/explainer-stories';
import {createExhibitLighting,createSurfaceMaps} from './studio';
import {createStudioEnvironment} from '../anatomy-3d-materials';
import {beamDeflection,createExperiment,explainers,stringDisplacement,type ExplainerId,type Inputs,type Snapshot} from '@/lib/explainers';
type V=[number,number,number];
const up=new THREE.Vector3(0,1,0);
export function createExplainerEngine(host:HTMLElement,id:ExplainerId,initial:Inputs,onPick:(id:string)=>void,onInput:(key:string,value:number)=>void,initialView='cutaway'){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 const canvas=renderer.domElement;canvas.setAttribute('aria-label','Interactive experiment. Drag to orbit; click a part to inspect it.');canvas.setAttribute('role','img');host.appendChild(canvas);
 const scene=new THREE.Scene(),apparatus=new THREE.Group();scene.add(apparatus);
 const camera=new THREE.PerspectiveCamera(36,1,.01,200);camera.position.set(6,4,7);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.6;controls.maxDistance=60;controls.maxPolarAngle=Math.PI*.49;
 const environment=createStudioEnvironment(renderer);scene.environment=environment.texture;
 const studio=createExhibitLighting(scene,renderer),surfaceMaps=createSurfaceMaps();
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d')!;const gradient=ctx.createRadialGradient(64,64,6,64,64,64);gradient.addColorStop(0,'rgba(32,38,30,.22)');gradient.addColorStop(1,'rgba(32,38,30,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadowGeometry=new THREE.PlaneGeometry(1,1),shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});const shadow=new THREE.Mesh(shadowGeometry,shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=-.23;scene.add(shadow);
 let textures:THREE.Texture[]=[],resources:(THREE.BufferGeometry|THREE.Material)[]=[],pickables:THREE.Object3D[]=[],materials=new Map<string,THREE.MeshPhysicalMaterial>(),selected='',p=initial,drawMechanism:(s:Snapshot)=>void=()=>{},updatePhysicalInputs:()=>void=()=>{},setAssembly:(mode:string,spread?:number)=>void=()=>{},sceneView=initialView,explodedAmount=initialView==='exploded'?1:0,assemblyFrame=0,latest=createExperiment(id,p).sample(0),disposed=false,fitDistance=8,viewInitialized=false;
 const colors={paint:0x31513f,metal:0xc3c8ca,brass:0xc59b50,rubber:0x20262a,paper:0xbbb8aa,rope:0x8d7650,white:0xe3e0d5};
 type Finish=keyof typeof colors;
 function material(part:string,finish:Finish){const key=part+finish;let m=materials.get(key);if(!m){const metallic=finish==='metal'||finish==='brass';m=new THREE.MeshPhysicalMaterial({color:colors[finish],metalness:metallic?.92:finish==='paper'?.32:0,roughness:finish==='rubber'?.7:metallic?.26:.42,clearcoat:finish==='paint'?.35:0,clearcoatRoughness:.3,roughnessMap:metallic?surfaceMaps.metal:surfaceMaps.grain,bumpMap:metallic?surfaceMaps.metal:surfaceMaps.grain,bumpScale:metallic?.002:.006,envMapIntensity:metallic?1.35:.7});m.userData.base=colors[finish];m.userData.part=part;materials.set(key,m);resources.push(m);}return m;}
 function mesh(part:string,g:THREE.BufferGeometry,finish:Finish,pos:V=[0,0,0],parent:THREE.Object3D=apparatus){resources.push(g);const m=new THREE.Mesh(g,material(part,finish));m.position.set(...pos);m.userData.part=part;m.castShadow=true;m.receiveShadow=true;parent.add(m);pickables.push(m);return m;}
 function box(part:string,w:number,h:number,d:number,pos:V,finish:Finish='metal',parent:THREE.Object3D=apparatus){return mesh(part,new RoundedBoxGeometry(w,h,d,2,Math.min(.035,w/5,h/5,d/5)),finish,pos,parent);}
 function cylinder(part:string,r:number,h:number,pos:V,finish:Finish='metal',parent:THREE.Object3D=apparatus){return mesh(part,new THREE.CylinderGeometry(r,r,h,32),finish,pos,parent);}
 function sphere(part:string,r:number,pos:V,finish:Finish='brass',parent:THREE.Object3D=apparatus){return mesh(part,new THREE.SphereGeometry(r,32,20),finish,pos,parent);}
 function torus(part:string,r:number,tube:number,pos:V,finish:Finish='metal',parent:THREE.Object3D=apparatus){return mesh(part,new THREE.TorusGeometry(r,tube,10,64),finish,pos,parent);}
 function link(part:string,a:V,b:V,r=.035,finish:Finish='metal',parent:THREE.Object3D=apparatus){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.sub(av);const m=cylinder(part,r,delta.length(),av.addScaledVector(delta,.5).toArray() as V,finish,parent);m.quaternion.setFromUnitVectors(up,delta.normalize());return m;}
 function bolt(part:string,x:number,y:number,z:number,parent:THREE.Object3D=apparatus){cylinder(part,.045,.025,[x,y,z],'metal',parent);box(part,.045,.004,.008,[x,y+.015,z],'rubber',parent);}
 function plaque(part:string,text:string,pos:V,w:number,h:number,parent:THREE.Object3D=apparatus){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d')!;ctx.fillStyle='#20292b';ctx.fillRect(0,0,512,96);ctx.strokeStyle='#8e9a87';ctx.lineWidth=2;ctx.strokeRect(5,5,502,86);ctx.fillStyle='#dce1cc';ctx.font='500 25px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);const mat=new THREE.MeshStandardMaterial({map:texture,roughness:.48,metalness:.15});resources.push(mat);const g=new THREE.PlaneGeometry(w,h);resources.push(g);const object=new THREE.Mesh(g,mat);object.position.set(...pos);object.userData.part=part;parent.add(object);pickables.push(object);return object;}
 function bench(part:string,w:number,d:number){
  box(part,w,.17,d,[0,-.08,0],'rubber');const top=mesh(part,new RoundedBoxGeometry(w-.04,.045,d-.04,4,.02),'metal',[0,.018,0]);top.material=material(part,'paper');
  for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35]){cylinder(part,.075,.08,[x,-.2,z],'rubber');bolt(part,x,.055,z);}
  const marks:V[]=[];for(let i=0;i<Math.floor(w*10)-2;i++){const x=-w/2+.15+i*.1;marks.push([x,.045,d/2-.16],[x,.045,d/2-(i%5===0?.25:.2)]);}
  const geometry=new THREE.BufferGeometry().setFromPoints(marks.map(p=>new THREE.Vector3(...p))),mat=new THREE.LineBasicMaterial({color:0x52605a});resources.push(geometry,mat);apparatus.add(new THREE.LineSegments(geometry,mat));
 }
 function line(part:string,points:V[],color=0x769368,dashed=false){const geometry=new THREE.BufferGeometry().setFromPoints(points.map(v=>new THREE.Vector3(...v)));resources.push(geometry);const m=dashed?new THREE.LineDashedMaterial({color,dashSize:.1,gapSize:.07}):new THREE.LineBasicMaterial({color});resources.push(m);const object=new THREE.Line(geometry,m);object.userData.part=part;if(dashed)object.computeLineDistances();apparatus.add(object);pickables.push(object);return object;}
 // Reused instances form a round cord (or rectangular beam), without per-frame geometry allocation.
 function flexible(part:string,capacity:number,r:number,finish:Finish,rectangular=false){const g=rectangular?new THREE.BoxGeometry(1,1,1):new THREE.CylinderGeometry(1,1,1,8);resources.push(g);const object=new THREE.InstancedMesh(g,material(part,finish),capacity);object.userData.part=part;object.frustumCulled=false;object.castShadow=true;object.receiveShadow=true;apparatus.add(object);pickables.push(object);const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),position=new THREE.Vector3(),direction=new THREE.Vector3(),scale=new THREE.Vector3();return (points:V[])=>{object.count=Math.min(capacity,points.length-1);for(let i=0;i<object.count;i++){position.set(...points[i]);direction.set(...points[i+1]).sub(position);const length=direction.length();position.addScaledVector(direction,.5);q.setFromUnitVectors(up,direction.normalize());scale.set(r,length,rectangular?.06:r);matrix.compose(position,q,scale);object.setMatrixAt(i,matrix);}object.instanceMatrix.needsUpdate=true;object.computeBoundingSphere();};}
 // Merge only declared static assemblies; moving parts keep their own transforms.
 function consolidate(parent:THREE.Object3D,excluded=new Set<THREE.Object3D>()){
  const groups=new Map<THREE.Material,THREE.Mesh[]>();for(const child of parent.children){if(!(child instanceof THREE.Mesh)||child instanceof THREE.InstancedMesh||child.children.length||excluded.has(child)||Array.isArray(child.material))continue;const list=groups.get(child.material)||[];list.push(child);groups.set(child.material,list);}
  for(const [mat,objects] of groups){if(objects.length<2)continue;const parts=new Set(objects.map(o=>o.userData.part));if(parts.size!==1)continue;const geometries=objects.map(o=>{o.updateMatrix();const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrix);return geometry;}),merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!merged)continue;resources.push(merged);const object=new THREE.Mesh(merged,mat);object.castShadow=true;object.receiveShadow=true;object.userData.part=objects[0].userData.part;parent.add(object);pickables.push(object);for(const old of objects){parent.remove(old);pickables=pickables.filter(p=>p!==old);resources=resources.filter(r=>r!==old.geometry);old.geometry.dispose();}}
 }
 const forceLayer=new THREE.Group();apparatus.add(forceLayer);
 function arrow(origin:V,direction:V,color:number,part:string){const object=new THREE.ArrowHelper(new THREE.Vector3(...direction).normalize(),new THREE.Vector3(...origin),.65,color,.14,.08);forceLayer.add(object);object.traverse(o=>{o.userData.part=part;if((o as THREE.Mesh).geometry)resources.push((o as THREE.Mesh).geometry);const m=(o as THREE.Mesh).material;if(m)resources.push(...(Array.isArray(m)?m:[m]));});return object;}
 function sheave(part:string,x:number,y:number,parent:THREE.Object3D=apparatus){const group=new THREE.Group();group.position.set(x,y,0);parent.add(group);const rim=cylinder(part,.185,.12,[0,0,0],'brass',group);rim.rotation.x=Math.PI/2;for(const z of [-.07,.07]){const flange=cylinder(part,.215,.02,[0,0,z],'metal',group);flange.rotation.x=Math.PI/2;}const hub=cylinder(part,.055,.19,[0,0,0],'metal',group);hub.rotation.x=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;link(part,[.07*Math.cos(a),.07*Math.sin(a),.075],[.16*Math.cos(a),.16*Math.sin(a),.075],.012,'metal',group);}return group;}
 function build(){
  setAssembly=()=>{};updatePhysicalInputs=()=>{};
  if(id==='projectile-launcher'){
   const model=createExperiment(id,p),last=model.sample(model.duration),range=last.values.range,offset=-range/2;
   bench('ground',range+2,1.8);box('base',.8,.12,.75,[offset,.06,0],'paint');for(const z of [-.23,.23]){link('base',[offset-.2,.1,z],[offset,.8,z],.05);link('base',[offset+.2,.1,z],[offset,.8,z],.05);}
   const axle=cylinder('pivot',.12,.65,[offset,.8,0],'brass');axle.rotation.x=Math.PI/2;
   const barrel=new THREE.Group();barrel.position.set(offset,.8,0);barrel.rotation.z=p.angle*Math.PI/180;apparatus.add(barrel);const tube=mesh('barrel',new THREE.LatheGeometry([[.11,-.6],[.14,-.6],[.14,0],[.11,0],[.11,-.6]].map(([r,y])=>new THREE.Vector2(r,y)),40),'paint',[0,0,0],barrel);tube.rotation.z=-Math.PI/2;const mouth=torus('barrel',.125,.018,[0,0,0],'metal',barrel);mouth.rotation.y=Math.PI/2;for(const x of [-.55,-.45]){const band=torus('barrel',.143,.012,[x,0,0],'metal',barrel);band.rotation.y=Math.PI/2;}
   const ball=sphere('ball',.1,[offset,.8,0],'brass');box('target',.08,.5,.05,[offset+range,.25,-.28],'metal');box('target',.3,.18,.025,[offset+range+.1,.45,-.28],'paint');
   line('target',Array.from({length:81},(_,i)=>{const s=model.sample(model.duration*i/80);return [offset+s.values.x,s.values.y,0] as V;}),0x6e8d62,true);
   const gravityArrow=arrow([offset,.8,0],[0,-1,0],0xb99556,'ball');
   drawMechanism=s=>{ball.position.set(offset+s.values.x,s.values.y,0);gravityArrow.position.copy(ball.position);};
  }else if(id==='inclined-plane'){
   bench('base',4.3,1.8);const angle=p.angle*Math.PI/180,rig=new THREE.Group();rig.position.set(1.5,.35,0);rig.rotation.z=-angle;apparatus.add(rig);
   box('ramp',3.5,.11,1.1,[-1.75,0,0],'metal',rig);box('surface',3.48,.025,.9,[-1.75,.068,0],'rubber',rig);
   for(const z of [-.5,.5]){const c=cylinder('hinge',.13,.13,[1.5,.25,z],'brass');c.rotation.x=Math.PI/2;box('hinge',.35,.18,.25,[1.5,.09,z],'paint');}
   const supportX=1.5-2.65*Math.cos(angle),height=.35+2.65*Math.sin(angle);for(const z of [-.4,.4]){cylinder('support',.055,height,[supportX,height/2,z],'metal');box('support',.5,.08,.3,[supportX,.04,z],'paint');for(let i=0;i<8;i++)torus('support',.061,.006,[supportX,.1+i*.035,z],'metal').rotation.x=Math.PI/2;}
   const block=box('block',.42,.32,.55,[-3.25,.24,0],'paint',rig);for(const z of [-.23,.23])bolt('block',-.1,.17,z,block);
   const weight=arrow([0,0,0],[0,-1,0],0xb99556,'block'),normal=arrow([0,0,0],[Math.sin(angle),Math.cos(angle),0],0x8a9da4,'surface'),friction=arrow([0,0,0],[-Math.cos(angle),Math.sin(angle),0],0x4a7951,'surface');
   drawMechanism=s=>{block.position.x=-3.25+s.values.s;rig.updateMatrixWorld(true);const position=block.getWorldPosition(new THREE.Vector3());for(const a of [weight,normal,friction])a.position.copy(position);friction.visible=s.values.friction>0;};
  }else if(id==='pendulum-clock'){
   bench('base',2.9,1.6);for(const z of [-.45,.45]){link('frame',[-1.15,0,z],[0,3.2,z],.055,'paint');link('frame',[1.15,0,z],[0,3.2,z],.055,'paint');for(const x of [-1.15,1.15]){box('frame',.4,.08,.3,[x,.04,z],'metal');bolt('frame',x,.1,z);}}
   const axle=cylinder('pivot',.08,1.1,[0,3.2,0],'brass');axle.rotation.x=Math.PI/2;
   const arm=new THREE.Group();arm.position.set(0,3.2,0);apparatus.add(arm);link('rod',[0,0,0],[0,-p.length,0],.018,'metal',arm);const bob=cylinder('bob',.18,.08,[0,-p.length,0],'brass',arm);bob.rotation.x=Math.PI/2;torus('bob',.17,.012,[0,-p.length,.045],'metal',arm);const bobFace=cylinder('bob',.13,.012,[0,-p.length,.047],'brass',arm);bobFace.rotation.x=Math.PI/2;cylinder('bob',.035,.08,[0,-p.length-.18,0],'metal',arm);
   const points:V[]=[];for(let i=-70;i<=70;i++)points.push([.5*Math.sin(i*Math.PI/180),3.2-.5*Math.cos(i*Math.PI/180),-.12]);line('scale',points,0x8a9487);for(let i=-60;i<=60;i+=10)link('scale',[.48*Math.sin(i*Math.PI/180),3.2-.48*Math.cos(i*Math.PI/180),-.12],[.54*Math.sin(i*Math.PI/180),3.2-.54*Math.cos(i*Math.PI/180),-.12],.007);
   line('scale',[[0,3.2,-.15],[0,3.2-p.length-.25,-.15]],0x9ba295,true);
   drawMechanism=s=>{arm.rotation.z=s.values.angle;};
  }else if(id==='gyroscope'){
   bench('base',2.7,2.3);cylinder('stand',.22,.12,[0,.06,0],'paint');cylinder('stand',.075,1.4,[0,.8,0],'metal');sphere('pivot',.11,[0,1.55,0],'brass');
   for(let i=0;i<24;i++){const a=i*Math.PI/12;link('base',[.7*Math.cos(a),.012,.7*Math.sin(a)],[.78*Math.cos(a),.012,.78*Math.sin(a)],.008,'rubber');}
   const carrier=new THREE.Group();carrier.position.y=1.55;apparatus.add(carrier);link('axle',[-.18,0,0],[p.arm+.18,0,0],.025,'metal',carrier);const spin=new THREE.Group();spin.position.x=p.arm;carrier.add(spin);
   const disk=cylinder('wheel',.45,.07,[0,0,0],'metal',spin);disk.rotation.z=Math.PI/2;const rim=torus('wheel',.435,.022,[0,0,0],'brass',spin);rim.rotation.y=Math.PI/2;
   for(const x of [-.05,.05]){const hub=cylinder('wheel',.09,.06,[x,0,0],'brass',spin);hub.rotation.z=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;const boltMesh=cylinder('wheel',.017,.015,[x*1.5,.12*Math.cos(a),.12*Math.sin(a)],'metal',spin);boltMesh.rotation.z=Math.PI/2;}}
   box('marker',.012,.09,.055,[.042,.35,0],'paint',spin);
   const torque=arrow([p.arm,1.55,0],[0,-1,0],0xb99556,'wheel');drawMechanism=s=>{carrier.rotation.y=s.values.azimuth;spin.rotation.x=s.values.spin/20;torque.position.set(p.arm*Math.cos(s.values.azimuth),1.55,-p.arm*Math.sin(s.values.azimuth));};
  }else if(id==='vibrating-string'){
   bench('base',3.2,1.3);for(const [x,part] of [[-1,'left-clamp'],[1,'right-clamp']] as const){box(part,.3,.12,.5,[x,.06,0],'paint');cylinder(part,.045,1.3,[x,.77,0],'metal');box(part,.22,.15,.24,[x,1.45,0],'brass');bolt(part,x,1.55,0);}
   const knob=cylinder('tensioner',.13,.13,[1.2,1.45,0],'rubber');knob.rotation.z=Math.PI/2;for(let i=0;i<16;i++){const a=i*Math.PI/8;link('tensioner',[1.15,1.45+.125*Math.cos(a),.125*Math.sin(a)],[1.25,1.45+.125*Math.cos(a),.125*Math.sin(a)],.006,'metal');}
   const cord=flexible('string',120,.012,'paint'),nodes:THREE.Mesh[]=[];for(let i=0;i<=p.harmonic;i++)nodes.push(sphere('nodes',.022,[-1+2*i/p.harmonic,1.45,0],'brass'));
   drawMechanism=s=>cord(Array.from({length:101},(_,i)=>[-1+2*i/100,1.45+stringDisplacement(2*i/100,s.time,p),0] as V));
  }else if(id==='pulley-rig'){
   bench('frame',3.4,1.6);for(const x of [-1.4,1.4]){box('frame',.12,3.25,.15,[x,1.625,0],'paint');box('frame',.5,.1,.65,[x,.05,0],'metal');bolt('frame',x,.115,-.2);bolt('frame',x,.115,.2);}box('frame',3,.14,.22,[0,3.25,0],'metal');
   const n=p.strands,loadX=n===1?-.4:n===2?-.6:-.2,moving=new THREE.Group();apparatus.add(moving);
   box('load',.55,.55,.5,[loadX,.65,0],'paint',moving);for(const z of [-.23,.23])link('load',[loadX,.92,z],[loadX,1.1,z],.035,'metal',moving);
   const movingWheels:THREE.Group[]=[],fixedWheels:THREE.Group[]=[];
   if(n===1){fixedWheels.push(sheave('fixed',-.2,3));link('fixed',[-.2,3,0],[-.2,3.22,0],.03);}else{for(let i=0;i<n/2;i++){const x=-.6+i*.8;movingWheels.push(sheave('moving',x,1.2,moving));fixedWheels.push(sheave('fixed',x+.4,3));link('fixed',[x+.4,3,0],[x+.4,3.22,0],.03);link('moving',[x,1.2,0],[loadX,1.1,0],.025,'metal',moving);}link('frame',[-.8,3,0],[-.8,3.22,0],.025);}
   const freeX=n===4?.8:0,handle=box('handle',.3,.08,.14,[freeX,2.5,0],'rubber'),cord=flexible('rope',128,.016,'rope');
   const arc=(cx:number,cy:number,lower:boolean)=>Array.from({length:17},(_,i)=>{const a=lower?Math.PI+i*Math.PI/16:Math.PI-i*Math.PI/16;return [cx+.2*Math.cos(a),cy+.2*Math.sin(a),.01] as V;});
   drawMechanism=s=>{const rise=s.values.rise,pull=s.values.pull,ym=1.2+rise;moving.position.y=rise;handle.position.y=2.5-pull;const points:V[]=[];if(n===1){points.push([-.4,1.1+rise,.01],[-.4,3,.01],...arc(-.2,3,false),[0,2.5-pull,.01]);}else{points.push([-.8,3,.01]);for(let i=0;i<n/2;i++){const x=-.6+i*.8;points.push([x-.2,ym,.01],...arc(x,ym,true),[x+.2,3,.01],...arc(x+.4,3,false));}points.push([freeX,2.5-pull,.01]);}cord(points);for(const wheel of fixedWheels)wheel.rotation.z=-pull/.2;for(const wheel of movingWheels)wheel.rotation.z=(pull-rise)/.2;};
  }else if(id==='car-differential'){
   bench('base',4.4,2.1);
   const center=new THREE.Group();center.position.y=1.05;apparatus.add(center);
   for(const x of [-1.05,1.05]){box('bearings',.32,.94,.42,[x,.47,0],'paint');const bearing=torus('bearings',.16,.055,[x,1.05,0]);bearing.rotation.y=Math.PI/2;bolt('bearings',x,.05,.3);}
   // Truncated conical tooth sectors share a pitch apex at the axle centre.
   function bevel(part:string,count:number,radius:number,height:number,parent:THREE.Group){
    const vertices:number[]=[];const triangle=(a:V,b:V,c:V)=>vertices.push(...a,...b,...c);
    for(let i=0;i<count;i++){const a=2*Math.PI*(i+.16)/count,b=2*Math.PI*(i+.65)/count;const pts:V[]=[];for(const [y,scale] of [[height,.99],[height*.5,.5]])for(const r of [radius*.87,radius*1.035])for(const angle of [a,b])pts.push([r*scale*Math.cos(angle),y,r*scale*Math.sin(angle)]);for(const [a,b,c,d] of [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]){triangle(pts[a],pts[b],pts[c]);triangle(pts[a],pts[c],pts[d]);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();mesh(part,g,'brass',[0,0,0],parent);
    const hub=cylinder(part,radius*.23,height*.65,[0,height*.75,0],'metal',parent);const web=torus(part,radius*.84,radius*.065,[0,height*.94,0],'metal',parent);web.rotation.x=Math.PI/2;for(let j=0;j<6;j++){const a=j*Math.PI/3;link(part,[radius*.2*Math.cos(a),height*.94,radius*.2*Math.sin(a)],[radius*.83*Math.cos(a),height*.94,radius*.83*Math.sin(a)],radius*.055,'metal',parent);}return hub;
   }
   const carrier=new THREE.Group();center.add(carrier);const crown=torus('carrier',.72,.065,[0,0,0],'paint',carrier);crown.rotation.y=Math.PI/2;
   const crownTeeth=new THREE.Group();crownTeeth.rotation.z=-Math.PI/2;carrier.add(crownTeeth);bevel('carrier',40,.72,.18,crownTeeth);
   const inputPinion=new THREE.Group();inputPinion.position.y=1.05;apparatus.add(inputPinion);const inputGear=new THREE.Group();inputGear.rotation.x=Math.PI/2;inputPinion.add(inputGear);bevel('carrier',10,.18,.72,inputGear);link('carrier',[0,0,.72],[0,0,1.18],.04,'metal',inputPinion);
   box('base',.5,.09,.36,[0,.05,.85],'paint');box('base',.12,.84,.16,[0,.5,.95],'metal');const driveBearing=torus('carrier',.09,.025,[0,1.05,.96],'metal');
   link('spiders',[0,-.57,0],[0,.57,0],.035,'metal',carrier);
   for(const z of [-.58,.58]){link('carrier',[-.42,0,z],[.42,0,z],.035,'paint',carrier);for(const x of [-.42,.42])link('carrier',[x,0,0],[x,0,z],.03,'paint',carrier);}
   const left=new THREE.Group(),right=new THREE.Group();center.add(left,right);
   for(const [part,x,group] of [['left',-1,left],['right',1,right]] as const){
    link(part,[x*.24,0,0],[x*1.65,0,0],.065,'metal',group);
    const gear=new THREE.Group();gear.rotation.z=x<0?Math.PI/2:-Math.PI/2;group.add(gear);bevel(part,20,.48,.24,gear);
    const tire=torus(part,.43,.11,[x*1.7,0,0],'rubber',group);tire.rotation.y=Math.PI/2;
    const rim=torus(part,.31,.035,[x*1.7,0,0],'metal',group);rim.rotation.y=Math.PI/2;const hub=cylinder(part,.1,.2,[x*1.7,0,0],'metal',group);hub.rotation.z=Math.PI/2;const treadGeo=new THREE.BoxGeometry(.15,.018,.042),treads=new THREE.InstancedMesh(treadGeo,material(part,'rubber'),64);resources.push(treadGeo);treads.userData.part=part;treads.castShadow=true;group.add(treads);pickables.push(treads);const td=new THREE.Object3D();for(let j=0;j<64;j++){const a=j*Math.PI/32;td.position.set(x*1.7,.536*Math.cos(a),.536*Math.sin(a));td.rotation.set(a,0,x*.18);td.updateMatrix();treads.setMatrixAt(j,td.matrix);}
    for(let i=0;i<6;i++){const a=i*Math.PI/3;link(part,[x*1.79,.09*Math.cos(a),.09*Math.sin(a)],[x*1.79,.29*Math.cos(a),.29*Math.sin(a)],.025,'paint',group);}
    box(part,.025,.11,.065,[x*1.82,.35,0],'brass',group);
   }
   const spiders:THREE.Group[]=[];for(const sign of [-1,1]){const gear=new THREE.Group();gear.rotation.z=sign<0?Math.PI:0;carrier.add(gear);bevel('spiders',10,.24,.48,gear);spiders.push(gear);}
   for(const group of [left,right,...spiders,carrier,crownTeeth,inputGear])consolidate(group);
   drawMechanism=s=>{carrier.rotation.x=s.values.carrierPhase;inputPinion.rotation.z=-4*s.values.carrierPhase;left.rotation.x=s.values.leftPhase;right.rotation.x=s.values.rightPhase;spiders[0].rotation.y=-s.values.spiderPhase;spiders[1].rotation.y=s.values.spiderPhase;};
  }else if(id==='drone-balance'){
   bench('stand',2.8,2.7);
   for(const z of [-.9,.9]){box('stand',.16,1.75,.16,[0,.875,z],'paint');box('stand',.6,.1,.45,[0,.05,z],'metal');const bearing=torus('stand',.12,.035,[0,1.75,z]);bolt('stand',-.2,.12,z);bolt('stand',.2,.12,z);}
   const rig=new THREE.Group();rig.position.y=1.75;apparatus.add(rig);
   link('frame',[0,0,-1],[0,0,1],.055,'metal',rig);box('frame',.45,.12,.55,[0,0,0],'paint',rig);box('frame',.35,.18,.4,[0,-.14,0],'rubber',rig);
   box('controller',.24,.04,.22,[0,.1,0],'paint',rig);box('imu',.08,.035,.08,[0,.14,0],'rubber',rig);for(const x of [-.07,.07])for(let j=0;j<5;j++)box('controller',.018,.012,.012,[x,.128,-.06+j*.03],'metal',rig);for(const x of [-.1,.1])for(const z of [-.09,.09])bolt('controller',x,.13,z,rig);
   const rotors:{group:THREE.Group;side:number;direction:number;force:THREE.ArrowHelper}[]=[];
   for(const side of [-1,1])for(const front of [-1,1]){
    const part=side<0?'left-rotors':'right-rotors',x=side*.6,z=front*.5;
    link('frame',[0,0,0],[x,0,z],.045,'paint',rig);cylinder(part,.09,.16,[x,.04,z],'metal',rig);torus(part,.09,.008,[x,.1,z],'brass',rig).rotation.x=Math.PI/2;
    const group=new THREE.Group();group.position.set(x,.16,z);rig.add(group);cylinder(part,.045,.06,[0,0,0],'brass',group);
    for(const direction of [-1,1]){const shape=new THREE.Shape();shape.moveTo(.02,-.018);shape.bezierCurveTo(.13,-.075,.29,-.045,.36,.01);shape.bezierCurveTo(.32,.045,.14,.055,.02,.018);shape.closePath();const blade=mesh(part,new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:2,steps:1}),'rubber',[0,.018,0],group);blade.rotation.x=-Math.PI/2;blade.rotation.z=direction<0?Math.PI:0;}for(let j=0;j<8;j++){const a=j*Math.PI/4;const winding=torus(part,.012,.004,[x+.065*Math.cos(a),.06,z+.065*Math.sin(a)],'brass',rig);winding.rotation.x=Math.PI/2;}
    const force=new THREE.ArrowHelper(up.clone(),new THREE.Vector3(x,.2,z),.6,side<0?0x90aa79:0xc3a365,.09,.05);rig.add(force);force.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)resources.push(m.geometry);if(m.material)resources.push(...(Array.isArray(m.material)?m.material:[m.material]));});rotors.push({group,side,direction:side*front,force});
   }
   link('disturbance',[0,-.08,0],[.3,-.3,0],.025,'metal',rig);sphere('disturbance',.07,[.3,-.3,0],'brass',rig);
   consolidate(rig);rotors.forEach(r=>consolidate(r.group));
   drawMechanism=s=>{rig.rotation.z=s.values.angle;for(const rotor of rotors){rotor.group.rotation.y=rotor.direction*(rotor.side<0?s.values.leftPhase:s.values.rightPhase)/40;rotor.force.setLength((rotor.side<0?s.values.left:s.values.right)*.2,.09,.05);}};
  }else if(id==='camera-focus'){
   bench('body',7.1,2.55);const y=1.43;
   // Optical carriages connect every assembly to the same precision rail.
   for(const z of [-.48,.48]){link('body',[-3.45,.2,z],[2.05,.2,z],.045,'metal');for(const x of [-3.35,1.95])box('body',.16,.23,.2,[x,.13,z],'rubber');}
   const ticks:V[]=[];for(let i=0;i<54;i++){const x=-3.35+i*.1;ticks.push([x,.251,.5],[x,.251,i%5===0?.65:.58]);}const tickGeo=new THREE.BufferGeometry().setFromPoints(ticks.map(p=>new THREE.Vector3(...p))),tickMat=new THREE.LineBasicMaterial({color:0x38443e});resources.push(tickGeo,tickMat);apparatus.add(new THREE.LineSegments(tickGeo,tickMat));
   for(const x of [-.18,1.05]){box('body',.48,.12,1.12,[x,.31,0],'metal');box('body',.22,.68,.28,[x,.7,0],'rubber');bolt('body',x,.39,-.43);bolt('body',x,.39,.43);const screw=cylinder('focus',.11,.09,[x,.32,.68],'brass');screw.rotation.x=Math.PI/2;}
   const casing=new THREE.Group(),optics=new THREE.Group(),iris=new THREE.Group(),sensor=new THREE.Group(),subject=new THREE.Group(),lid=new THREE.Group();apparatus.add(casing,optics,iris,sensor,subject,lid);
   // A complete recognizable camera silhouette, with removable top/near shell.
   box('body',1.58,.15,1.74,[1.0,.86,0],'rubber',casing);box('body',.15,1.08,1.72,[1.74,1.38,0],'rubber',casing);box('body',1.5,1.02,.12,[1.0,1.38,-.83],'rubber',casing);
   box('body',.65,1.15,.44,[.68,1.4,.83],'rubber',casing);box('body',.62,.08,.45,[.68,2.0,.83],'metal',casing);cylinder('body',.075,.05,[.45,2.06,.83],'brass',casing);
   for(let i=0;i<8;i++)box('body',.48,.012,.018,[.64,1.12+i*.075,1.058],'paint',casing);
   box('body',1.5,.12,1.66,[1.0,1.93,0],'rubber',lid);box('body',1.45,1.05,.1,[1.03,1.39,.84],'rubber',lid);box('body',.58,.23,.7,[1.02,2.08,-.05],'rubber',lid);box('body',.27,.12,.37,[1.27,2.18,-.05],'metal',lid);
   const modeDial=cylinder('body',.16,.09,[1.4,2.03,-.57],'rubber',lid);for(let i=0;i<20;i++){const a=i*Math.PI/10;box('body',.015,.055,.02,[1.4+.155*Math.cos(a),2.03,-.57+.155*Math.sin(a)],'metal',lid);}
   const backScreen=box('body',.025,.67,.93,[1.828,1.38,-.08],'metal',casing);box('body',.032,.56,.82,[1.85,1.38,-.08],'rubber',casing);for(const z of [.51,.65]){const button=cylinder('body',.045,.032,[1.84,1.28,z],'rubber',casing);button.rotation.z=Math.PI/2;}
   const bodyLabel=plaque('body','DIALEARN / OPTICAL STUDY',[.38,1.87,.75],.55,.075,casing);
   function barrel(part:string,profile:number[][],start:number,length:number,parent:THREE.Group,finish:Finish='rubber'){
    const object=mesh(part,new THREE.LatheGeometry(profile.map(([r,x])=>new THREE.Vector2(r,x)),72,start,length),finish,[0,y,0],parent);object.rotation.z=-Math.PI/2;return object;
   }
   const shellProfile=[[.43,-.59],[.53,-.59],[.53,.37],[.43,.37],[.43,-.59]];
   const cutShell=barrel('body',shellProfile,0,Math.PI*1.5,casing),fullShell=barrel('body',shellProfile,0,Math.PI*2,casing);
   for(const x of [-.6,.37]){const rim=torus('body',.49,.045,[x,y,0],'metal',casing);rim.rotation.y=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;const screw=cylinder('body',.018,.028,[x,y+.49*Math.sin(a),.49*Math.cos(a)],'brass',casing);screw.rotation.z=Math.PI/2;}}
   // Machined focus collar and repeated knurling use one instanced draw call.
   const focusRing=new THREE.Group();focusRing.position.set(-.38,y,0);apparatus.add(focusRing);const collar=mesh('focus',new THREE.LatheGeometry([[.435,-.12],[.565,-.12],[.565,.12],[.435,.12],[.435,-.12]].map(([r,x])=>new THREE.Vector2(r,x)),72),'rubber',[0,0,0],focusRing);collar.rotation.z=-Math.PI/2;
   const knurlGeo=new THREE.BoxGeometry(.19,.018,.033),knurls=new THREE.InstancedMesh(knurlGeo,material('focus','rubber'),64);resources.push(knurlGeo);knurls.userData.part='focus';knurls.castShadow=true;knurls.receiveShadow=true;focusRing.add(knurls);pickables.push(knurls);const dummy=new THREE.Object3D();for(let i=0;i<64;i++){const a=i*Math.PI/32;dummy.position.set(0,.57*Math.cos(a),.57*Math.sin(a));dummy.rotation.set(a,0,0);dummy.updateMatrix();knurls.setMatrixAt(i,dummy.matrix);}
   for(const x of [-.515,-.245]){const rim=torus('focus',.551,.012,[x+.38,0,0],'brass',focusRing);rim.rotation.y=Math.PI/2;}
   box('focus',.12,.018,.025,[0,.588,0],'brass',focusRing);
   const focusPlate=plaque('focus','50 mm  /  FOCUS',[0,.59,.04],.4,.07,focusRing);focusPlate.rotation.x=-Math.PI/2;
   // The single biconvex element is the thin lens; the shell is illustrative.
   const lensProfile:number[][]=[];for(let i=0;i<=24;i++){const r=.395*i/24;lensProfile.push([r,-(.012+.075*(1-(r/.395)**2))]);}for(let i=24;i>=0;i--){const r=.395*i/24;lensProfile.push([r,.012+.075*(1-(r/.395)**2)]);}
   const glass=barrel('lens',lensProfile,0,Math.PI*2,optics,'white'),glassMaterial=material('lens','white');glassMaterial.color.setHex(0xadc9bc);glassMaterial.userData.base=0xadc9bc;glassMaterial.transparent=true;glassMaterial.opacity=.3;glassMaterial.roughness=.06;glassMaterial.metalness=.15;glassMaterial.clearcoat=1;glassMaterial.depthWrite=false;glassMaterial.side=THREE.DoubleSide;glass.castShadow=false;
   const lensRim=torus('lens',.398,.012,[0,y,0],'metal',optics);lensRim.rotation.y=Math.PI/2;
   const irisX=.19;let opening=.32*1.8/p.aperture;
   const irisMount=torus('iris',.398,.028,[irisX,y,0],'brass',iris);irisMount.rotation.y=Math.PI/2;
   function irisGeometry(i:number){const a=i*Math.PI*2/9,b=(i+1)*Math.PI*2/9+.07,shape=new THREE.Shape();shape.moveTo(.4*Math.cos(a),.4*Math.sin(a));shape.absarc(0,0,.4,a,b,false);shape.lineTo(opening*Math.cos(b-.04),opening*Math.sin(b-.04));shape.lineTo(opening*Math.cos(a-.04),opening*Math.sin(a-.04));shape.quadraticCurveTo(.28*Math.cos(a-.18),.28*Math.sin(a-.18),.4*Math.cos(a),.4*Math.sin(a));return new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1,steps:1});}
   const irisBlades=Array.from({length:9},(_,i)=>{const blade=mesh('iris',irisGeometry(i),'metal',[irisX+i*.001,y,0],iris);blade.rotation.y=Math.PI/2;return blade;});
   updatePhysicalInputs=()=>{const next=.32*1.8/p.aperture;if(Math.abs(next-opening)<1e-9)return;opening=next;irisBlades.forEach((blade,i)=>{const old=blade.geometry;resources=resources.filter(r=>r!==old);old.dispose();blade.geometry=irisGeometry(i);resources.push(blade.geometry);});};
   const irisLever=link('iris',[irisX,y+.39,0],[irisX,y+.55,.11],.012,'brass',iris);sphere('iris',.024,[irisX,y+.55,.11],'rubber',iris);
   // Original target artwork becomes the source and the live sensor image.
   const chart=document.createElement('canvas');chart.width=chart.height=512;const cc=chart.getContext('2d')!;cc.fillStyle='#e5ddbf';cc.fillRect(0,0,512,512);cc.strokeStyle='#30392e';cc.lineWidth=10;cc.strokeRect(12,12,488,488);cc.fillStyle='#213d30';cc.font='bold 260px sans-serif';cc.fillText('F',68,320);cc.fillStyle='#be8142';cc.beginPath();cc.arc(375,310,58,0,Math.PI*2);cc.fill();for(let i=0;i<22;i++){cc.fillStyle=i%2?'#e5ddbf':'#26372c';cc.fillRect(55+i*18,380,18,58);}cc.fillStyle='#26372c';cc.font='20px monospace';cc.fillText('DIALEARN · FOCUS TARGET',69,472);
   const chartTexture=new THREE.CanvasTexture(chart);chartTexture.colorSpace=THREE.SRGBColorSpace;textures.push(chartTexture);const chartMat=new THREE.MeshStandardMaterial({map:chartTexture,roughness:.65,side:THREE.DoubleSide});resources.push(chartMat);
   box('subject',.08,1.05,1.05,[0,0,0],'rubber',subject);const chartGeo=new THREE.PlaneGeometry(.94,.94);resources.push(chartGeo);const chartFace=new THREE.Mesh(chartGeo,chartMat);chartFace.rotation.y=Math.PI/2;chartFace.position.x=.046;chartFace.userData.part='subject';subject.add(chartFace);pickables.push(chartFace);const chartBack=chartFace.clone();chartBack.position.x=-.046;subject.add(chartBack);pickables.push(chartBack);
   link('subject',[0,-.5,0],[0,-1.05,0],.035,'metal',subject);box('subject',.35,.1,1.1,[0,-1.08,0],'metal',subject);const targetKnob=cylinder('subject',.085,.09,[0,-1.04,.65],'brass',subject);targetKnob.rotation.x=Math.PI/2;
   box('sensor',.055,.82,.86,[0,0,0],'paint',sensor);box('sensor',.065,.68,.72,[-.012,0,0],'metal',sensor);for(const z of [-.36,.36])for(const sy of [-.34,.34]){const screw=cylinder('sensor',.022,.022,[-.06,sy,z],'brass',sensor);screw.rotation.z=Math.PI/2;}
   const imageCanvas=document.createElement('canvas');imageCanvas.width=imageCanvas.height=256;const imageCtx=imageCanvas.getContext('2d')!,imageTexture=new THREE.CanvasTexture(imageCanvas);imageTexture.colorSpace=THREE.SRGBColorSpace;textures.push(imageTexture);const sensorMaterial=new THREE.MeshBasicMaterial({map:imageTexture,side:THREE.DoubleSide}),sensorGeo=new THREE.PlaneGeometry(.57,.57);resources.push(sensorMaterial,sensorGeo);const sensorImage=new THREE.Mesh(sensorGeo,sensorMaterial);sensorImage.rotation.y=-Math.PI/2;sensorImage.position.x=-.05;sensorImage.userData.part='sensor';sensor.add(sensorImage);pickables.push(sensorImage);
   // A larger instrument display shows exactly the same computed raw image.
   box('sensor',.98,.88,.12,[.92,.5,1.02],'rubber');const monitor=new THREE.Mesh(new THREE.PlaneGeometry(.68,.68),sensorMaterial);resources.push(monitor.geometry);monitor.position.set(.92,.48,1.086);monitor.userData.part='sensor';apparatus.add(monitor);pickables.push(monitor);plaque('sensor','RAW SENSOR',[.92,.894,1.086],.83,.075);
   const sensorCable=link('sensor',[.06,-.25,-.2],[.25,-.5,-.5],.015,'brass',sensor);
   const rayColors=[0x9dcea6,0xe7c187,0xd2ded5],rays=Array.from({length:9},(_,i)=>line('rays',[[0,0,0],[0,0,0],[0,0,0]],rayColors[Math.floor(i/3)]));
   const coneGeometry=new THREE.BufferGeometry();coneGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(18),3));const coneMaterial=new THREE.MeshBasicMaterial({color:0xe9d5a6,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});resources.push(coneGeometry,coneMaterial);const cone=new THREE.Mesh(coneGeometry,coneMaterial);cone.userData.part='rays';apparatus.add(cone);pickables.push(cone);
   const rayArrow=mesh('rays',new THREE.ConeGeometry(.025,.1,8),'brass');rayArrow.castShadow=false;
   let spread=sceneView==='exploded'?1:0,mode=sceneView;
   const applyAssembly=()=>{fullShell.visible=mode==='assembled';cutShell.visible=mode!=='assembled';lid.visible=mode!=='cutaway';casing.position.x=spread*1.25;lid.position.x=spread*1.25;lid.position.y=spread*.5;lid.position.z=-spread*.3;optics.position.x=-spread*.3;iris.position.x=-spread*.3;focusRing.position.x=-.38-spread*.7;};
   setAssembly=(next,amount)=>{mode=next;spread=amount??(next==='exploded'?1:0);applyAssembly();};applyAssembly();
   consolidate(casing,new Set([cutShell,fullShell]));consolidate(lid);consolidate(focusRing);consolidate(subject);consolidate(sensor);consolidate(iris,new Set(irisBlades));
   let lastImage='';
   drawMechanism=s=>{
    const sx=1.1+(s.values.sensor-.05)*90+spread*.18,ix=1.1+(s.values.image-.05)*90+spread*.18,ux=-1.65-(s.values.subject-.4)*.35,lx=-spread*.3;
    subject.position.set(ux,y,0);sensor.position.set(sx,y,0);focusRing.rotation.x=(p.focus-.4)*1.1;
    for(let field=0;field<3;field++){const h=(field-1)*.29,imageY=y-h*(ix-lx)/(lx-ux);for(let pupil=0;pupil<3;pupil++){const py=y+(pupil-1)*opening,atSensor=py+(imageY-py)*(sx-lx)/(ix-lx),ray=rays[field*3+pupil];ray.geometry.setFromPoints([new THREE.Vector3(ux,y+h,0),new THREE.Vector3(lx,py,0),new THREE.Vector3(sx,atSensor,0)]);ray.geometry.computeBoundingSphere();}}
    const topY=y+opening,bottomY=y-opening,blurAtSensor=opening*Math.abs(sx-ix)/Math.max(.01,ix-lx),vertices=coneGeometry.attributes.position as THREE.BufferAttribute;vertices.setXYZ(0,lx,topY,.002);vertices.setXYZ(1,lx,bottomY,.002);vertices.setXYZ(2,sx,y+blurAtSensor,.002);vertices.setXYZ(3,lx,bottomY,.002);vertices.setXYZ(4,sx,y-blurAtSensor,.002);vertices.setXYZ(5,sx,y+blurAtSensor,.002);vertices.needsUpdate=true;coneGeometry.computeBoundingSphere();rayArrow.position.set(ux+(lx-ux)*.52,y,.02);rayArrow.quaternion.setFromUnitVectors(up,new THREE.Vector3(1,0,0));
    const imageKey=(s.values.blur*1000).toFixed(3)+'/'+s.values.light.toFixed(3);if(imageKey!==lastImage){lastImage=imageKey;imageCtx.fillStyle='#0e1514';imageCtx.fillRect(0,0,256,256);imageCtx.save();imageCtx.translate(128,128);imageCtx.rotate(Math.PI);imageCtx.globalAlpha=s.values.light;imageCtx.filter=`blur(${Math.min(18,s.values.blur*1000*20)}px)`;imageCtx.drawImage(chart,-128,-128,256,256);imageCtx.restore();imageTexture.needsUpdate=true;}
   };
  }else{
   bench('base',p.span+1,1.6);for(const [x,part] of [[-p.span/2,'pin'],[p.span/2,'roller']] as const){box(part,.5,.1,.7,[x,.05,0],'paint');box(part,.16,1.08,.3,[x,.64,0],'metal');const head=new THREE.Shape();head.moveTo(-.18,0);head.lineTo(.18,0);head.lineTo(0,.2);head.closePath();const g=new THREE.ExtrudeGeometry(head,{depth:.3,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:2,steps:1});mesh(part,g,'brass',[x,1.18,-.15]);if(part==='roller'){const c=cylinder(part,.035,.32,[x,1.4,0],'metal');c.rotation.x=Math.PI/2;}for(const z of [-.25,.25])bolt(part,x,.12,z);}
   for(const x of [-p.span/2-.35,p.span/2+.35]){box('base',.12,2.12,.18,[x,1.06,-.36],'paint');bolt('base',x,.11,-.5);}box('base',p.span+.82,.14,.28,[0,2.15,-.36],'metal');link('load',[0,2.15,-.36],[0,2.15,0],.065,'metal');cylinder('load',.1,.4,[0,1.98,0],'rubber');const piston=cylinder('load',.028,.45,[0,1.7,0],'metal');
   line('datum',[[-p.span/2,1.45,.08],[p.span/2,1.45,.08]],0x91a08b,true);const beam=flexible('beam',100,.08,'paint',true);
   const head=new THREE.Group();apparatus.add(head);box('load',.13,.24,.18,[0,.16,0],'brass',head);const loadArrow=arrow([0,1.9,0],[0,-1,0],0xb99556,'load');const left=arrow([-p.span/2,1,0],[0,1,0],0x6b976b,'pin'),right=arrow([p.span/2,1,0],[0,1,0],0x6b976b,'roller');
   drawMechanism=s=>{beam(Array.from({length:81},(_,i)=>{const x=p.span*i/80;return [x-p.span/2,1.45-8*beamDeflection(x,p.span,s.values.load),0] as V;}));head.position.y=1.45-8*s.values.deflection;piston.position.y=(head.position.y+1.84)/2;piston.scale.y=(1.84-head.position.y)/.45;loadArrow.position.y=head.position.y+.7;loadArrow.visible=left.visible=right.visible=s.values.load>0;};
  }
 }
 function isVisible(object:THREE.Object3D){let current:THREE.Object3D|null=object;while(current){if(!current.visible)return false;current=current.parent;}return true;}
 function select(part:string){selected=part;for(const m of materials.values()){m.color.setHex(m.userData.base);const active=m.userData.part===selected;if(active)m.color.lerp(new THREE.Color(0xb5d393),.16);m.emissive.setHex(active?0x325c28:0);m.emissiveIntensity=active?.24:0;}render();}
 function fit(reset=false,overview=false){
  const bounds=new THREE.Box3().setFromObject(apparatus);studio.fit(bounds);if(id==='camera-focus'&&!overview)bounds.set(new THREE.Vector3(window.innerWidth<=850?-1.1:-2.75,-.18,-1.1),new THREE.Vector3(3.4,2.85,1.25));if(id==='projectile-launcher'&&!overview){const start=-latest.values.range/2;bounds.set(new THREE.Vector3(start-1.25,-.24,-.9),new THREE.Vector3(start+1.8,1.85,.9));}const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const aspect=Math.max(.2,(host.clientWidth-(window.innerWidth>850?312:0))/Math.max(1,host.clientHeight));
  const ratio=reset||!viewInitialized?1:Math.max(.35,Math.min(3,camera.position.distanceTo(controls.target)/fitDistance));
  const direction=reset||!viewInitialized?(id==='camera-focus'?new THREE.Vector3(-.65,.5,1.6):id==='drone-balance'?new THREE.Vector3(1.15,1.65,1.4):id==='gyroscope'?new THREE.Vector3(1.4,.7,1.1):id==='car-differential'?new THREE.Vector3(1,.7,1.4):new THREE.Vector3(.6,.5,1.5)).normalize():camera.position.clone().sub(controls.target).normalize();
  const right=new THREE.Vector3().crossVectors(up,direction).normalize(),vertical=new THREE.Vector3().crossVectors(direction,right).normalize(),tan=Math.tan(camera.fov*Math.PI/360);
  let distance=1;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const point=new THREE.Vector3(x,y,z).sub(center),depth=point.dot(direction);distance=Math.max(distance,depth+Math.abs(point.dot(right))/(tan*aspect),depth+Math.abs(point.dot(vertical))/tan);}
  fitDistance=distance*1.04;viewInitialized=true;controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,fitDistance*ratio);camera.near=.01;camera.far=Math.max(200,fitDistance*10);camera.updateProjectionMatrix();controls.update();shadow.position.x=center.x;shadow.position.z=center.z;shadow.scale.set(Math.max(size.x,2)*1.25,Math.max(size.z,1)*1.6,1);
 }
 let cameraFrame=0;
 function stopCamera(){cancelAnimationFrame(cameraFrame);cameraFrame=0;}
 function inspect(part:string){
  stopCamera();apparatus.updateMatrixWorld(true);const bounds=new THREE.Box3();for(const object of pickables)if(object.userData.part===part&&isVisible(object))bounds.union(new THREE.Box3().setFromObject(object));if(bounds.isEmpty())return;
  const target=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),direction=camera.position.clone().sub(controls.target).normalize(),aspect=Math.max(.3,camera.aspect),distance=Math.max(.8,Math.max(size.y,size.x/aspect,size.z)*1.35/(2*Math.tan(camera.fov*Math.PI/360))),position=target.clone().addScaledVector(direction,distance),fromPosition=camera.position.clone(),fromTarget=controls.target.clone(),start=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('still-mode');
  if(reduce){camera.position.copy(position);controls.target.copy(target);controls.update();render();return;}
  const tick=(now:number)=>{if(disposed)return;const t=Math.min(1,(now-start)/420),ease=1-(1-t)**3;camera.position.lerpVectors(fromPosition,position,ease);controls.target.lerpVectors(fromTarget,target,ease);controls.update();render();if(t<1)cameraFrame=requestAnimationFrame(tick);};cameraFrame=requestAnimationFrame(tick);
 }
 const labelLayer=document.createElement('div');labelLayer.className='ex-world-labels';host.appendChild(labelLayer);const leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');leaders.classList.add('ex-label-leaders');leaders.setAttribute('aria-hidden','true');labelLayer.appendChild(leaders);let showLabels=true;const leaderLines=new Map<string,SVGLineElement>();
 const labelButtons=new Map<string,HTMLButtonElement>();for(const part of explainers.find(d=>d.id===id)!.parts){const button=document.createElement('button');button.type='button';button.className='ex-world-label';button.textContent=part.name;button.addEventListener('click',()=>onPick(part.id));button.hidden=true;labelLayer.appendChild(button);labelButtons.set(part.id,button);const leader=document.createElementNS('http://www.w3.org/2000/svg','line');leaders.appendChild(leader);leaderLines.set(part.id,leader);}
 function updateLabels(){
  const mobile=window.innerWidth<=850,ids=[selected,...explainerStories[id].chain].filter(Boolean),placed:{x:number;y:number}[]=[];for(const button of labelButtons.values())button.hidden=true;for(const line of leaderLines.values())line.style.display='none';leaders.setAttribute('viewBox',`0 0 ${host.clientWidth} ${host.clientHeight}`);if(!showLabels)return;
  for(const part of [...new Set(ids)]){if(placed.length>=(mobile?2:3))break;const button=labelButtons.get(part);if(!button)continue;const bounds=new THREE.Box3();for(const object of pickables)if(object.userData.part===part&&isVisible(object))bounds.union(new THREE.Box3().setFromObject(object));if(bounds.isEmpty())continue;
   const point=bounds.getCenter(new THREE.Vector3()).project(camera),available=host.clientWidth-(mobile?0:312),x=(point.x+1)*host.clientWidth/2+12,y=(1-point.y)*host.clientHeight/2-35;
   if(point.z<0||point.z>1||x<8||x>available-95||y<65||y>host.clientHeight-85||placed.some(p=>Math.abs(p.x-x)<155&&Math.abs(p.y-y)<43))continue;
   let detail='';if(id==='camera-focus'){if(part==='iris')detail=' · f/'+p.aperture.toFixed(1);if(part==='sensor')detail=' · '+(latest.values.blur*1000).toFixed(2)+' mm';}if(id==='car-differential'){if(part==='carrier')detail=' · '+latest.values.carrier+' rpm';if(part==='right')detail=' · '+latest.values.right+' rpm';}
   button.textContent=explainers.find(d=>d.id===id)!.parts.find(p=>p.id===part)!.name+detail;button.style.left=Math.min(x,available-175)+'px';button.style.top=y+'px';button.dataset.active=String(part===selected);button.setAttribute('aria-pressed',String(part===selected));button.hidden=false;const leader=leaderLines.get(part)!;leader.setAttribute('x1',String((point.x+1)*host.clientWidth/2));leader.setAttribute('y1',String((1-point.y)*host.clientHeight/2));leader.setAttribute('x2',String(Math.min(x,available-175)));leader.setAttribute('y2',String(y+15));leader.style.display='';placed.push({x,y});
  }
 }
 function render(){if(disposed)return;const start=performance.now();studio.syncTheme();renderer.render(scene,camera);updateLabels();host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.renderMs=(performance.now()-start).toFixed(2);}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75,Math.sqrt(1200000/(w*h))));renderer.setSize(w,h,false);camera.aspect=w/h;if(window.innerWidth>850)camera.setViewOffset(w,h,156,0,w,h);else camera.clearViewOffset();camera.updateProjectionMatrix();fit();render();}
 function configure(inputs:Inputs){
  stopCamera();cancelAnimationFrame(assemblyFrame);explodedAmount=sceneView==='exploded'?1:0;
  const previous=p;p={...inputs};const live=viewInitialized&&(id==='camera-focus'||id==='car-differential'||id==='drone-balance'||id==='gyroscope'&&p.arm===previous.arm||id==='inclined-plane'&&p.angle===previous.angle||id==='pendulum-clock'&&p.length===previous.length||id==='vibrating-string'&&p.harmonic===previous.harmonic||id==='pulley-rig'&&p.strands===previous.strands||id==='beam-bending'&&p.span===previous.span);
  if(live){updatePhysicalInputs();setAssembly(sceneView);latest=createExperiment(id,p).sample(0);drawMechanism(latest);render();return;}
  apparatus.clear();forceLayer.clear();apparatus.add(forceLayer);resources.forEach(r=>r.dispose());resources=[];textures.forEach(t=>t.dispose());textures=[];pickables=[];materials=new Map();build();setAssembly(sceneView);latest=createExperiment(id,p).sample(0);drawMechanism(latest);select(selected);fit();render();
 }
 const raycaster=new THREE.Raycaster();raycaster.params.Line.threshold=.04;const pointer=new THREE.Vector2();let down:V|null=null;
 let manipulation:{pointer:number;x:number;value:number;control:typeof definition.controls[number]}|null=null;
 const definition=explainers.find(d=>d.id===id)!;
 function hit(e:PointerEvent){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(pickables,false).find(h=>isVisible(h.object))?.object.userData.part as string|undefined;}
 const pointerDown=(e:PointerEvent)=>{
  stopCamera();
  if(manipulation){e.stopImmediatePropagation();return;}
  const picked=hit(e),part=definition.parts.find(part=>part.id===picked),control=definition.controls.find(c=>c.key===part?.control);
  if(e.isPrimary&&e.button===0&&picked===selected&&control){
   manipulation={pointer:e.pointerId,x:e.clientX,value:p[control.key],control};controls.enabled=false;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='ew-resize';host.dataset.manipulating=control.key;e.stopImmediatePropagation();e.preventDefault();
  }else down=[e.clientX,e.clientY,e.pointerId];
 };
 const endManipulation=()=>{if(!manipulation)return;const pointer=manipulation.pointer;manipulation=null;controls.enabled=true;delete host.dataset.manipulating;canvas.style.cursor='grab';if(canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);};
 const pointerUp=(e:PointerEvent)=>{if(manipulation){e.stopImmediatePropagation();if(e.pointerId===manipulation.pointer)endManipulation();return;}if(!down||e.pointerId!==down[2])return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved<6)onPick(hit(e)||'');};
 const pointerMove=(e:PointerEvent)=>{
  if(manipulation&&e.pointerId===manipulation.pointer){const {control:c,value,x}=manipulation,raw=value+(e.clientX-x)*(c.max-c.min)/240;let next=Math.max(c.min,Math.min(c.max,c.min+Math.round((raw-c.min)/c.step)*c.step));if(c.options)next=c.options.reduce((a,b)=>Math.abs(a-raw)<Math.abs(b-raw)?a:b);if(Math.abs(next-p[c.key])>1e-8)onInput(c.key,Number(next.toFixed(6)));e.stopImmediatePropagation();e.preventDefault();return;}
  const picked=hit(e);canvas.style.cursor=e.buttons?'grabbing':picked===selected&&definition.parts.find(part=>part.id===picked)?.control?'ew-resize':picked?'pointer':'grab';
 };
 const cancel=()=>{down=null;endManipulation();};const leave=()=>{if(!manipulation)down=null;};
 canvas.addEventListener('pointerdown',pointerDown,true);canvas.addEventListener('pointerup',pointerUp,true);canvas.addEventListener('pointermove',pointerMove,true);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);canvas.addEventListener('pointerleave',leave);controls.addEventListener('change',render);
 canvas.addEventListener('wheel',stopCamera,{passive:true});
 const themeObserver=new MutationObserver(()=>render());themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);configure(initial);resize();
 return {configure,select,inspect,labels:(visible:boolean)=>{showLabels=visible;render();},view:(mode:string)=>{cancelAnimationFrame(assemblyFrame);const from=explodedAmount,to=mode==='exploded'?1:0;sceneView=mode;setAssembly(mode,to);drawMechanism(latest);fit(true);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('still-mode');if(reduced){explodedAmount=to;render();return;}const started=performance.now();const tick=(now:number)=>{if(disposed)return;const t=Math.min(1,(now-started)/650),ease=t*t*(3-2*t);explodedAmount=from+(to-from)*ease;setAssembly(mode,explodedAmount);drawMechanism(latest);render();if(t<1)assemblyFrame=requestAnimationFrame(tick);};assemblyFrame=requestAnimationFrame(tick);},draw:(s:Snapshot)=>{latest=s;drawMechanism(s);host.dataset.time=s.time.toFixed(4);render();},forces:(visible:boolean)=>{forceLayer.visible=visible;render();},resetView:()=>{stopCamera();fit(true,true);render();},zoom:(factor:number)=>{stopCamera();camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();render();},destroy:()=>{stopCamera();cancelAnimationFrame(assemblyFrame);disposed=true;themeObserver.disconnect();resizeObserver.disconnect();canvas.removeEventListener('wheel',stopCamera);controls.dispose();cancel();canvas.removeEventListener('pointerdown',pointerDown,true);canvas.removeEventListener('pointerup',pointerUp,true);canvas.removeEventListener('pointermove',pointerMove,true);canvas.removeEventListener('pointercancel',cancel);canvas.removeEventListener('lostpointercapture',cancel);canvas.removeEventListener('pointerleave',leave);resources.forEach(r=>r.dispose());textures.forEach(t=>t.dispose());surfaceMaps.dispose();studio.dispose();shadowTexture.dispose();shadowGeometry.dispose();shadowMaterial.dispose();labelLayer.remove();environment.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
export type ExplainerEngine=ReturnType<typeof createExplainerEngine>;
