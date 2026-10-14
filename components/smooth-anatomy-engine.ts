import {assemblyShare} from '@/lib/assembly-motion';
import {mechanismPose,type MechanismMotion} from '@/lib/mechanism-motion';
import * as THREE from 'three';
import {mergeGeometries,toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {createMachineMaterial,createStudioEnvironment} from './anatomy-3d-materials';
import {geometryBatchKey} from '@/lib/anatomy-batches';
type Vec=[number,number,number];
type Frame={o:Vec;a:Vec;u:Vec;v:Vec};
type Motion=MechanismMotion;
type Solid={phiStart?:number;phiLength?:number;materialKey?:string;inspectionOffset?:Vec;motion?:Motion;kind:'prism'|'body';F:Frame;poly:[number,number][];s0?:number;s1?:number;part:string;name:string;component?:string;stage?:string;tone?:string;className?:string;move:Vec};
type Ink={inspectionOffset?:Vec;points?:Vec[];kind:'line'|'circle'|'dot'|'text';F?:Frame;s?:number;r?:number;point?:Vec;text?:string;size?:number;part:string;component?:string;stage?:string;move:Vec};
type StudyPlacement={scale:number;offset:Vec};
export type AnatomyModel={study?:Record<string,StudyPlacement>;azimuth:number;elevation:number;bounds:Vec[];parts:Solid[];inks:Ink[]};
const levels=['foundations','systems','engineering'];
export function createSmoothEngine(host:HTMLElement,model:AnatomyModel,onAngle:(value:number)=>void){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
 const canvas=renderer.domElement;canvas.className='anatomy-canvas';canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
 const scene=new THREE.Scene(),root=new THREE.Group();root.scale.x=-1;scene.add(root); // Match the Anatomy projection's handedness.
 const camera=new THREE.OrthographicCamera(-200,200,200,-200,.1,3000);camera.up.set(0,0,1);scene.add(camera);
 const paleHousing=model.parts.some(p=>p.materialKey==='white-polymer');
 const keyLight=new THREE.DirectionalLight(0xffffff,paleHousing?1.9:3.2);keyLight.position.set(-180,220,350);camera.add(keyLight);
 const fillLight=new THREE.DirectionalLight(0xf3f5ee,paleHousing?.45:1.1);fillLight.position.set(220,-80,120);camera.add(fillLight);
 scene.add(new THREE.HemisphereLight(0xffffff,0x51535a,paleHousing?.4:.8));
 const environment=createStudioEnvironment(renderer);scene.environment=environment.texture;
 const objects:{group:THREE.Group;object:THREE.Object3D;move:Vec;data:Solid|Ink;material?:THREE.MeshStandardMaterial;outline?:THREE.LineBasicMaterial;base:number}[]=[],pickables:THREE.Object3D[]=[],resources:{dispose:()=>void}[]=[];
 const vector=(a:Vec)=>new THREE.Vector3(...a);
 const metadata=(s:Solid|Ink)=>({part:s.part,component:s.component,stage:s.stage});
 // Material colours explain the assemblies; the housing stays neutral.
 const boardParts=new Set(['board','compute','controller','computer','charger','driver','electronics']);
 const darkParts=new Set(['battery','cell','pack','power','storage','controls','buttons','sticks']);
 const metalParts=new Set(['motors','drive','rotor','wheels','drivetrain','brakes','steering']);
 const baseColour=(s:Solid)=>{
  if(s.component==='windings')return 0xa57b55;
  if(s.component==='magnets')return 0x3e5143;
  if(s.className==='screen-glass')return 0x273a30;
  if(s.className==='screen-widget')return 0xb4c5a4;
  if(s.component==='busbars'||s.component==='contacts')return 0xb78d59;
  if(boardParts.has(s.part))return s.tone==='hi'?0x303b32:0x4d6956;
  if(darkParts.has(s.part))return s.tone==='lo'?0x303831:0x59655a;
  if(metalParts.has(s.part))return s.tone==='lo'?0x343e36:0xb6bdb0;
  if(s.part==='sensor'||s.part==='led')return s.tone==='hi'?0xd6c3a0:0x78876e;
  return s.tone==='lo'?0x6b7768:s.tone==='mid'?0xc0c7b9:0xe1e3da;
 };
 const selectedColour=new THREE.Color(0x83bd58),workingColour=new THREE.Color();
 function place(object:THREE.Object3D,s:Solid|Ink,base=0,material?:THREE.MeshStandardMaterial){const group=new THREE.Group();group.add(object);if('motion' in s&&s.motion)object.position.sub(vector(s.motion.pivot));root.add(group);object.userData=metadata(s);objects.push({group,object,move:s.move||[0,0,0],data:s,material,base});return group;}
 const batches=new Map<string,{data:Solid;base:number;geometries:THREE.BufferGeometry[]}>();
 for(const s of model.parts){
  let geometry:THREE.BufferGeometry;
  if(s.kind==='prism'){
   const shape=new THREE.Shape();s.poly.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();geometry=new THREE.ExtrudeGeometry(shape,{depth:(s.s1||0)-(s.s0||0),bevelEnabled:false,curveSegments:8});
   const matrix=new THREE.Matrix4().makeBasis(vector(s.F.u),vector(s.F.v),vector(s.F.a));matrix.setPosition(vector(s.F.o).addScaledVector(vector(s.F.a),s.s0||0));geometry.applyMatrix4(matrix);
  }else{
   const profile=[...s.poly,s.poly[0]].map(([axis,radius])=>new THREE.Vector2(radius,axis));geometry=new THREE.LatheGeometry(profile,48,s.phiLength?Math.PI/2-(s.phiStart||0)-s.phiLength:0,s.phiLength||Math.PI*2);
   const matrix=new THREE.Matrix4().makeBasis(vector(s.F.u),vector(s.F.a),vector(s.F.v));matrix.setPosition(vector(s.F.o));geometry.applyMatrix4(matrix);
   if(s.phiLength){
    const capShape=new THREE.Shape();s.poly.forEach(([axis,radius],i)=>i?capShape.lineTo(axis,radius):capShape.moveTo(axis,radius));capShape.closePath();
    const pieces=[geometry];for(const angle of [s.phiStart||0,(s.phiStart||0)+s.phiLength]){const radial=vector(s.F.u).multiplyScalar(Math.cos(angle)).addScaledVector(vector(s.F.v),Math.sin(angle));const cap=new THREE.ShapeGeometry(capShape),basis=new THREE.Matrix4().makeBasis(vector(s.F.a),radial,new THREE.Vector3().crossVectors(vector(s.F.a),radial));basis.setPosition(vector(s.F.o));cap.applyMatrix4(basis);pieces.push(cap);}
    const plain=pieces.map(g=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();return n;});geometry=mergeGeometries(plain)!;plain.forEach(g=>g.dispose());
   }
  }
  const base=baseColour(s),key=geometryBatchKey(s,base),normalised=geometry.index?geometry.toNonIndexed():geometry;if(normalised!==geometry)geometry.dispose();normalised.deleteAttribute('uv');
  const batch=batches.get(key);if(batch)batch.geometries.push(normalised);else batches.set(key,{data:s,base,geometries:[normalised]});
 }
 // Hundreds of curved sectors become a few selectable assembly meshes. Their
 // actual geometry and independent joints remain intact, including hidden stages.
 for(const {data:s,base,geometries} of batches.values()){
  let geometry=geometries.length===1?geometries[0]:mergeGeometries(geometries);if(!geometry)throw new Error('Incompatible anatomy geometry');for(const g of geometries)if(g!==geometry)g.dispose();const smooth=toCreasedNormals(geometry,Math.PI/3);if(smooth!==geometry)geometry.dispose();geometry=smooth;resources.push(geometry);
  const material=createMachineMaterial(s.part,s.component,s.name,base,s.materialKey);resources.push(material);const mesh=new THREE.Mesh(geometry,material),group=place(mesh,s,material.userData.base,material);pickables.push(mesh);
  const edges=new THREE.EdgesGeometry(geometry,26),ink=new THREE.LineBasicMaterial({color:0x303b2d,transparent:true,opacity:.22,depthWrite:false});resources.push(edges,ink);const outline=new THREE.LineSegments(edges,ink);outline.renderOrder=2;group.add(outline);if(s.motion)outline.position.sub(vector(s.motion.pivot));objects[objects.length-1].outline=ink;
 }
 host.dataset.solids=String(model.parts.length);host.dataset.meshes=String(batches.size);
 for(const ink of model.inks){
  if(ink.kind==='line'&&ink.points){const geometry=new THREE.BufferGeometry().setFromPoints(ink.points.map(vector)),material=new THREE.LineBasicMaterial({color:0x738176,transparent:true,opacity:.65,depthWrite:false});resources.push(geometry,material);const line=new THREE.Line(geometry,material);line.renderOrder=3;place(line,ink);pickables.push(line);}
  if(ink.kind==='circle'&&ink.F){const f=ink.F,points=Array.from({length:64},(_,i)=>vector(f.o).addScaledVector(vector(f.a),ink.s||0).addScaledVector(vector(f.u),Math.cos(i*Math.PI/32)*(ink.r||0)).addScaledVector(vector(f.v),Math.sin(i*Math.PI/32)*(ink.r||0)));const geometry=new THREE.BufferGeometry().setFromPoints(points),material=new THREE.LineBasicMaterial({color:0x354331,transparent:true,opacity:.7,depthWrite:false});resources.push(geometry,material);const line=new THREE.LineLoop(geometry,material);line.renderOrder=3;place(line,ink);pickables.push(line);}
  if(ink.kind==='dot'&&ink.point){const geometry=new THREE.SphereGeometry(Math.max(.5,(ink.size||.5)-.3),6,4),material=new THREE.MeshBasicMaterial({color:0x354331});resources.push(geometry,material);const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(vector(ink.point));place(mesh,ink);pickables.push(mesh);}
  if(ink.kind==='text'&&ink.point){const surface=document.createElement('canvas');surface.width=512;surface.height=128;const ctx=surface.getContext('2d')!;ctx.font='72px sans-serif';ctx.fillStyle=boardParts.has(ink.part)||darkParts.has(ink.part)||ink.part==='display'?'#f1f5e9':'#30412b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ink.text||'',256,64);const texture=new THREE.CanvasTexture(surface);texture.flipY=false;texture.colorSpace=THREE.SRGBColorSpace;const height=(ink.size||7)*1.5,geometry=new THREE.PlaneGeometry(height*4,height),material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide});resources.push(texture,geometry,material);const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(vector(ink.point));mesh.renderOrder=3;place(mesh,ink);}
 }
 let angle=0,target=0,tilt=0,targetTilt=0,roll=0,targetRoll=0,zoom=1,opened=0,wantOpen=0,stage='foundations',selected='',workingPart='',xray=false,isolated=false,still=false,frame=0,last=0,inView=true,disposed=false,viewHeight=400,mechanismSpeed=0,phase=0;
 let lastHit:THREE.Object3D|null=null;const centre=new THREE.Vector3(),raycaster=new THREE.Raycaster();raycaster.params.Line={threshold:.8};
 // Fit both mounting poses once, so orbiting never changes object scale.
 for(const item of objects){item.group.position.copy('motion' in item.data&&item.data.motion?vector(item.data.motion.pivot):new THREE.Vector3()).add(vector(('inspectionOffset' in item.data&&item.data.inspectionOffset)||model.study?.[item.data.component||item.data.part]?.offset||item.move));}root.updateMatrixWorld(true);const expandedBox=new THREE.Box3().setFromObject(root);for(const item of objects)item.group.position.copy('motion' in item.data&&item.data.motion?vector(item.data.motion.pivot):new THREE.Vector3());root.updateMatrixWorld(true);const assembledBox=new THREE.Box3().setFromObject(root),assembledCentre=assembledBox.getCenter(new THREE.Vector3()),expandedCentre=expandedBox.getCenter(new THREE.Vector3());
 const heightOf=(box:THREE.Box3)=>{const size=box.getSize(new THREE.Vector3());return Math.max(20,Math.hypot(size.x,size.y,size.z))*1.1;};const assembledHeight=heightOf(assembledBox),expandedHeight=heightOf(expandedBox);centre.copy(assembledCentre);viewHeight=assembledHeight;
 // A procedural soft contact shadow requires no downloaded environment image.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const shadowContext=shadowCanvas.getContext('2d')!;const gradient=shadowContext.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(20,23,20,.24)');gradient.addColorStop(.5,'rgba(20,23,20,.1)');gradient.addColorStop(1,'rgba(20,23,20,0)');shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,128,128);const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadowSize=assembledBox.getSize(new THREE.Vector3()),shadowGeometry=new THREE.PlaneGeometry(shadowSize.x*1.6,shadowSize.y*1.6),shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});const shadow=new THREE.Mesh(shadowGeometry,shadowMaterial);shadow.position.set(assembledCentre.x,assembledCentre.y,assembledBox.min.z-.5);scene.add(shadow);resources.push(shadowTexture,shadowGeometry,shadowMaterial);

 function sizeCanvas(){const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
  // Use layout size, not the modal's animated bounding box: CSS transforms
  // otherwise leave a small framebuffer stretched after the popup settles.
  // Supersample even on 1× displays, with a bounded mobile pixel budget.
  const ratio=Math.min(2,Math.sqrt(1500000/(width*height)));
  if(canvas.width!==Math.floor(width*ratio)||canvas.height!==Math.floor(height*ratio)){renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);}const aspect=width/height,fitHeight=viewHeight/Math.min(1,aspect);camera.left=-fitHeight*aspect/(2*zoom);camera.right=fitHeight*aspect/(2*zoom);camera.top=fitHeight/(2*zoom);camera.bottom=-fitHeight/(2*zoom);camera.updateProjectionMatrix();}
 function isSelected(data:Solid|Ink){return !!selected&&(data.part===selected||data.component===selected);}
 function render(){if(!isolated){centre.copy(assembledCentre).lerp(expandedCentre,opened);viewHeight=assembledHeight+(expandedHeight-assembledHeight)*opened;sizeCanvas();}const a=(180-model.azimuth-angle)*Math.PI/180,e=Math.max(-89,Math.min(89,model.elevation+tilt))*Math.PI/180;camera.position.copy(centre).add(new THREE.Vector3(Math.cos(a)*Math.cos(e),Math.sin(a)*Math.cos(e),Math.sin(e)).multiplyScalar(1000));camera.up.set(0,0,1);camera.lookAt(centre);camera.rotateZ(roll*Math.PI/180);camera.updateMatrixWorld();for(const item of objects){const motion='motion' in item.data?item.data.motion:undefined,study=('inspectionOffset' in item.data&&item.data.inspectionOffset)?{offset:item.data.inspectionOffset,scale:1}:model.study?.[item.data.component||item.data.part],scale=study&&opened?study.scale:1;item.group.scale.setScalar(1);item.group.position.copy(motion?vector(motion.pivot).multiplyScalar(scale):new THREE.Vector3());if(study){item.group.position.addScaledVector(vector(study.offset),assemblyShare(opened,!!('inspectionOffset' in item.data&&item.data.inspectionOffset)));}else item.group.position.addScaledVector(vector(item.move),assemblyShare(opened,false));if(motion){const pose=mechanismPose(motion,phase);item.group.position.add(vector(pose.offset).multiplyScalar(scale));item.group.quaternion.setFromAxisAngle(vector(motion.axis),pose.angle);}item.group.visible=(!item.data.stage||levels.indexOf(item.data.stage)<=levels.indexOf(stage))&&(!isolated||!selected||isSelected(item.data));if(item.material){const shell=('inspectionOffset' in item.data&&item.data.inspectionOffset)||['case','chassis','cabinet','cavity','shell','hull','carbody','handle','body','frame','inlet','vessel'].includes(item.data.part);const ghost=!!(xray&&shell);if(item.material.transparent!==ghost){item.material.transparent=ghost;item.material.needsUpdate=true;}item.object.userData.ghost=ghost;item.material.opacity=ghost?.18:1;item.material.depthWrite=!ghost;workingColour.setHex(item.base);const active=isSelected(item.data);if(active)workingColour.lerp(selectedColour,.88);else if(workingPart&&(item.data.component||item.data.part)===workingPart)workingColour.lerp(selectedColour,.4);item.material.color.copy(workingColour);item.material.emissive.setHex(active?0x355d21:0x000000);item.material.emissiveIntensity=active?.35:0;}}for(const item of objects){if(item.outline){const active=isSelected(item.data);item.outline.color.setHex(active?0x2a561b:0x303b2d);item.outline.opacity=active?.8:('materialKey' in item.data&&item.data.materialKey==='white-polymer'?0:.22);}}renderer.render(scene,camera);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);host.dataset.assembly=opened.toFixed(3);onAngle(((angle%360)+360)%360);host.dataset.angle=String(angle);host.dataset.tilt=String(tilt);host.dataset.roll=String(roll);}
 function tick(now:number){frame=0;if(disposed||!inView||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;if(mechanismSpeed&&!still)phase+=dt*mechanismSpeed*Math.PI/30;const follow=still?1:1-Math.exp(-dt/.11);angle+=(target-angle)*follow;tilt+=(targetTilt-tilt)*follow;roll+=(targetRoll-roll)*follow;opened=opened+(wantOpen-opened)*follow;if(Math.abs(targetTilt-tilt)<.015)tilt=targetTilt;if(Math.abs(targetRoll-roll)<.015)roll=targetRoll;if(Math.abs(target-angle)<.015)angle=target;if(Math.abs(wantOpen-opened)<.002)opened=wantOpen;render();if(angle!==target||tilt!==targetTilt||roll!==targetRoll||opened!==wantOpen||(mechanismSpeed>0&&!still))frame=requestAnimationFrame(tick);}
 function kick(){if(!frame&&!disposed&&inView&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else kick();}
 const resize=new ResizeObserver(()=>{sizeCanvas();kick();});resize.observe(host);const visibilityObserver=new IntersectionObserver(entries=>{inView=entries[entries.length-1].isIntersecting;if(inView)kick();else{cancelAnimationFrame(frame);frame=0;}});visibilityObserver.observe(host);document.addEventListener('visibilitychange',visibility);sizeCanvas();render();
 return {
  angle:()=>angle,tilt:()=>tilt,
  setTilt:(value:number)=>{targetTilt=Math.max(-89-model.elevation,Math.min(89-model.elevation,value));kick();},
  setRoll:(value:number)=>{targetRoll=value;kick();},
  setZoom:(value:number)=>{zoom=value;sizeCanvas();kick();},
  setTarget:(value:number)=>{target=value;kick();},
  configure:(options:{opened:boolean;selected?:string;workingPart?:string;xray?:boolean;isolated?:boolean;stage:string;still?:boolean;mechanismSpeed?:number})=>{const changed=wantOpen!==(options.opened?1:0);wantOpen=options.opened?1:0;selected=options.selected||'';workingPart=options.workingPart||'';xray=!!options.xray;isolated=!!options.isolated;stage=options.stage;still=!!options.still;mechanismSpeed=Math.max(0,Math.min(60,options.mechanismSpeed||0));if(isolated&&selected){render();root.updateMatrixWorld(true);const fit=new THREE.Box3();for(const item of objects)if(item.group.visible)fit.expandByObject(item.group);fit.getCenter(centre);viewHeight=heightOf(fit);sizeCanvas();}kick();},
  pick:(x:number,y:number)=>{const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((x-r.x)/r.width*2-1,-(y-r.y)/r.height*2+1),camera);root.updateMatrixWorld(true);const hit=raycaster.intersectObjects(pickables,false).find(hit=>hit.object.parent?.visible&&!hit.object.userData.ghost);lastHit=hit?.object||null;if(!hit)return null;const data=hit.object.userData;return data.component&&levels.indexOf(stage)>=levels.indexOf(data.stage)?data.component:data.part;},
  anchor:()=>{if(!lastHit)return null;const box=new THREE.Box3().setFromObject(lastHit),r=canvas.getBoundingClientRect();const points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));const left=r.left+(Math.min(...points.map(p=>p.x))+1)*r.width/2,right=r.left+(Math.max(...points.map(p=>p.x))+1)*r.width/2,top=r.top+(1-Math.max(...points.map(p=>p.y)))*r.height/2,bottom=r.top+(1-Math.min(...points.map(p=>p.y)))*r.height/2;return {left,right,top,bottom,width:right-left,height:bottom-top};},
  destroy:()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',visibility);resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
