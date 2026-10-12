import * as THREE from 'three';
type Vec=[number,number,number];
type Frame={o:Vec;a:Vec;u:Vec;v:Vec};
type Solid={kind:'prism'|'body';F:Frame;poly:[number,number][];s0?:number;s1?:number;part:string;name:string;component?:string;stage?:string;tone?:string;className?:string;move:Vec};
type Ink={kind:'circle'|'dot'|'text';F?:Frame;s?:number;r?:number;point?:Vec;text?:string;size?:number;part:string;component?:string;stage?:string;move:Vec};
export type AnatomyModel={azimuth:number;elevation:number;bounds:Vec[];parts:Solid[];inks:Ink[]};
const levels=['foundations','systems','engineering'];
export function createSmoothEngine(host:HTMLElement,model:AnatomyModel,onAngle:(value:number)=>void){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
 const canvas=renderer.domElement;canvas.className='anatomy-canvas';canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
 const scene=new THREE.Scene(),root=new THREE.Group();root.scale.x=-1;scene.add(root); // Match the Anatomy projection's handedness.
 const camera=new THREE.OrthographicCamera(-200,200,200,-200,.1,3000);camera.up.set(0,0,1);scene.add(camera);
 const keyLight=new THREE.DirectionalLight(0xffffff,3.2);keyLight.position.set(-180,220,350);camera.add(keyLight);
 const fillLight=new THREE.DirectionalLight(0xf3f5ee,1.1);fillLight.position.set(220,-80,120);camera.add(fillLight);
 scene.add(new THREE.HemisphereLight(0xffffff,0x657061,1.6));
 const objects:{group:THREE.Group;object:THREE.Object3D;move:Vec;data:Solid|Ink;material?:THREE.MeshStandardMaterial;base:number}[]=[],pickables:THREE.Object3D[]=[],resources:{dispose:()=>void}[]=[];
 const vector=(a:Vec)=>new THREE.Vector3(...a);
 const metadata=(s:Solid|Ink)=>({part:s.part,component:s.component,stage:s.stage});
 // Material colours explain the assemblies; the housing stays neutral.
 const boardParts=new Set(['board','compute','controller','computer','charger','driver','electronics']);
 const darkParts=new Set(['battery','cell','pack','power','storage','controls','buttons','sticks']);
 const metalParts=new Set(['motors','drive','rotor','wheels','drivetrain','brakes','steering']);
 const baseColour=(s:Solid)=>{
  if(s.className==='screen-glass')return 0x273a30;
  if(s.className==='screen-widget')return 0xb4c5a4;
  if(s.component==='busbars'||s.component==='contacts')return 0xb78d59;
  if(boardParts.has(s.part))return s.tone==='hi'?0x303b32:0x4d6956;
  if(darkParts.has(s.part))return s.tone==='lo'?0x303831:0x59655a;
  if(metalParts.has(s.part))return s.tone==='lo'?0x343e36:0xb6bdb0;
  if(s.part==='sensor'||s.part==='led')return s.tone==='hi'?0xd6c3a0:0x78876e;
  return s.tone==='lo'?0x6b7768:s.tone==='mid'?0xc0c7b9:0xe1e3da;
 };
 const selectedColour=new THREE.Color(0xb6cba0),workingColour=new THREE.Color();
 function place(object:THREE.Object3D,s:Solid|Ink,base=0,material?:THREE.MeshStandardMaterial){const group=new THREE.Group();group.add(object);root.add(group);object.userData=metadata(s);objects.push({group,object,move:s.move||[0,0,0],data:s,material,base});return group;}
 for(const s of model.parts){
  let geometry:THREE.BufferGeometry;
  if(s.kind==='prism'){
   const shape=new THREE.Shape();s.poly.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();geometry=new THREE.ExtrudeGeometry(shape,{depth:(s.s1||0)-(s.s0||0),bevelEnabled:false,curveSegments:8});
   const matrix=new THREE.Matrix4().makeBasis(vector(s.F.u),vector(s.F.v),vector(s.F.a));matrix.setPosition(vector(s.F.o).addScaledVector(vector(s.F.a),s.s0||0));geometry.applyMatrix4(matrix);
  }else{
   const profile=[...s.poly,s.poly[0]].map(([axis,radius])=>new THREE.Vector2(radius,axis));geometry=new THREE.LatheGeometry(profile,48);
   const matrix=new THREE.Matrix4().makeBasis(vector(s.F.u),vector(s.F.a),vector(s.F.v));matrix.setPosition(vector(s.F.o));geometry.applyMatrix4(matrix);
  }
  resources.push(geometry);const base=baseColour(s),material=new THREE.MeshStandardMaterial({color:base,roughness:metalParts.has(s.part)?.48:.76,metalness:metalParts.has(s.part)?.35:.08,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});resources.push(material);const mesh=new THREE.Mesh(geometry,material),group=place(mesh,s,base,material);pickables.push(mesh);
  const edges=new THREE.EdgesGeometry(geometry,26),ink=new THREE.LineBasicMaterial({color:0x303b2d,transparent:true,opacity:.65,depthWrite:false});resources.push(edges,ink);const outline=new THREE.LineSegments(edges,ink);outline.renderOrder=2;group.add(outline);
 }
 for(const ink of model.inks){
  if(ink.kind==='circle'&&ink.F){const f=ink.F,points=Array.from({length:64},(_,i)=>vector(f.o).addScaledVector(vector(f.a),ink.s||0).addScaledVector(vector(f.u),Math.cos(i*Math.PI/32)*(ink.r||0)).addScaledVector(vector(f.v),Math.sin(i*Math.PI/32)*(ink.r||0)));const geometry=new THREE.BufferGeometry().setFromPoints(points),material=new THREE.LineBasicMaterial({color:0x354331,transparent:true,opacity:.7,depthWrite:false});resources.push(geometry,material);const line=new THREE.LineLoop(geometry,material);line.renderOrder=3;place(line,ink);pickables.push(line);}
  if(ink.kind==='dot'&&ink.point){const geometry=new THREE.SphereGeometry(Math.max(.5,(ink.size||.5)-.3),6,4),material=new THREE.MeshBasicMaterial({color:0x354331});resources.push(geometry,material);const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(vector(ink.point));place(mesh,ink);pickables.push(mesh);}
  if(ink.kind==='text'&&ink.point){const surface=document.createElement('canvas');surface.width=512;surface.height=128;const ctx=surface.getContext('2d')!;ctx.font='72px sans-serif';ctx.fillStyle=boardParts.has(ink.part)||darkParts.has(ink.part)||ink.part==='display'?'#f1f5e9':'#30412b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ink.text||'',256,64);const texture=new THREE.CanvasTexture(surface);texture.flipY=false;texture.colorSpace=THREE.SRGBColorSpace;const height=(ink.size||7)*1.5,geometry=new THREE.PlaneGeometry(height*4,height),material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide});resources.push(texture,geometry,material);const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(vector(ink.point));mesh.renderOrder=3;place(mesh,ink);}
 }
 let angle=0,target=0,tilt=0,targetTilt=0,roll=0,targetRoll=0,zoom=1,opened=1,wantOpen=1,stage='foundations',selected='',still=false,frame=0,last=0,inView=true,disposed=false,viewHeight=400;
 let lastHit:THREE.Object3D|null=null;const centre=new THREE.Vector3(),raycaster=new THREE.Raycaster();raycaster.params.Line={threshold:.8};
 // Fit both mounting poses once, so orbiting never changes object scale.
 for(const item of objects)item.group.position.set(...item.move);root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root);for(const item of objects)item.group.position.set(0,0,0);root.updateMatrixWorld(true);box.union(new THREE.Box3().setFromObject(root));box.getCenter(centre);const size=box.getSize(new THREE.Vector3());viewHeight=Math.hypot(size.x,size.y,size.z)*1.1;
 function sizeCanvas(){const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
  // Use layout size, not the modal's animated bounding box: CSS transforms
  // otherwise leave a small framebuffer stretched after the popup settles.
  // Supersample even on 1× displays, with a bounded mobile pixel budget.
  const ratio=Math.min(2,Math.sqrt(1500000/(width*height)));
  renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);const aspect=width/height;camera.left=-viewHeight*aspect/(2*zoom);camera.right=viewHeight*aspect/(2*zoom);camera.top=viewHeight/(2*zoom);camera.bottom=-viewHeight/(2*zoom);camera.updateProjectionMatrix();}
 function render(){const a=(180-model.azimuth-angle)*Math.PI/180,e=Math.max(-89,Math.min(89,model.elevation+tilt))*Math.PI/180;camera.position.copy(centre).add(new THREE.Vector3(Math.cos(a)*Math.cos(e),Math.sin(a)*Math.cos(e),Math.sin(e)).multiplyScalar(1000));camera.up.set(0,0,1);camera.lookAt(centre);camera.rotateZ(roll*Math.PI/180);camera.updateMatrixWorld();for(const item of objects){item.group.position.set(item.move[0]*opened,item.move[1]*opened,item.move[2]*opened);item.group.visible=item.data.stage!=='engineering'||stage==='engineering';if(item.material){workingColour.setHex(item.base);if((item.data.component||item.data.part)===selected)workingColour.lerp(selectedColour,.22);item.material.color.copy(workingColour);}}renderer.render(scene,camera);onAngle(((angle%360)+360)%360);host.dataset.angle=String(angle);host.dataset.tilt=String(tilt);host.dataset.roll=String(roll);}
 function tick(now:number){frame=0;if(disposed||!inView||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;const follow=still?1:1-Math.exp(-dt/.055);angle+=(target-angle)*follow;tilt+=(targetTilt-tilt)*follow;roll+=(targetRoll-roll)*follow;opened+=(wantOpen-opened)*follow;if(Math.abs(targetTilt-tilt)<.015)tilt=targetTilt;if(Math.abs(targetRoll-roll)<.015)roll=targetRoll;if(Math.abs(target-angle)<.015)angle=target;if(Math.abs(wantOpen-opened)<.002)opened=wantOpen;render();if(angle!==target||tilt!==targetTilt||roll!==targetRoll||opened!==wantOpen)frame=requestAnimationFrame(tick);}
 function kick(){if(!frame&&!disposed&&inView&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else kick();}
 const resize=new ResizeObserver(()=>{sizeCanvas();kick();});resize.observe(host);const visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)kick();else{cancelAnimationFrame(frame);frame=0;}});visibilityObserver.observe(host);document.addEventListener('visibilitychange',visibility);sizeCanvas();render();
 return {
  angle:()=>angle,tilt:()=>tilt,
  setTilt:(value:number)=>{targetTilt=Math.max(-89-model.elevation,Math.min(89-model.elevation,value));kick();},
  setRoll:(value:number)=>{targetRoll=value;kick();},
  setZoom:(value:number)=>{zoom=value;sizeCanvas();kick();},
  setTarget:(value:number)=>{target=value;kick();},
  configure:(options:{opened:boolean;selected?:string;stage:string;still?:boolean})=>{wantOpen=options.opened?1:0;selected=options.selected||'';stage=options.stage;still=!!options.still;kick();},
  pick:(x:number,y:number)=>{const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((x-r.x)/r.width*2-1,-(y-r.y)/r.height*2+1),camera);root.updateMatrixWorld(true);const hit=raycaster.intersectObjects(pickables,false).find(hit=>hit.object.parent?.visible);lastHit=hit?.object||null;if(!hit)return null;const data=hit.object.userData;return data.component&&levels.indexOf(stage)>=levels.indexOf(data.stage)?data.component:data.part;},
  anchor:()=>{if(!lastHit)return null;const box=new THREE.Box3().setFromObject(lastHit),r=canvas.getBoundingClientRect();const points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));const left=r.left+(Math.min(...points.map(p=>p.x))+1)*r.width/2,right=r.left+(Math.max(...points.map(p=>p.x))+1)*r.width/2,top=r.top+(1-Math.max(...points.map(p=>p.y)))*r.height/2,bottom=r.top+(1-Math.min(...points.map(p=>p.y)))*r.height/2;return {left,right,top,bottom,width:right-left,height:bottom-top};},
  destroy:()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',visibility);resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
