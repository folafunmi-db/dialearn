import * as THREE from 'three';
/** Local procedural surface detail; no image downloads or bitmap dependencies. */
export function createSurfaceMaps(){
 const create=(brushed:boolean)=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d')!;const data=ctx.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,noise=((x*1973+y*9277+89173)^(x*y*13))&255,v=brushed?155+(y*73%31)+noise*.05:170+noise*.18;data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=255;}
  ctx.putImageData(data,0,0);const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(brushed?2:5,brushed?2:5);return map;
 };
 const metal=create(true),grain=create(false);return {metal,grain,dispose(){metal.dispose();grain.dispose();}};
}
export function createExhibitLighting(scene:THREE.Scene,renderer:THREE.WebGLRenderer){
 let dark=document.documentElement.dataset.theme==='dark';const ground=new THREE.Color(dark?0x253033:0xd9d5ca);
 scene.background=ground;scene.fog=new THREE.FogExp2(ground,.025);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const key=new THREE.DirectionalLight(0xffecd3,3.1);key.position.set(-3,7,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;key.shadow.normalBias=.025;key.shadow.radius=3;scene.add(key);
 const fill=new THREE.DirectionalLight(0xcbdce3,1.25);fill.position.set(3,3,-5);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xffd498,1.8);rim.position.set(-3,2,-4);scene.add(rim);
 const ambient=new THREE.HemisphereLight(0xe5f0ed,0x26231d,1.05);scene.add(ambient);
 const geometry=new THREE.PlaneGeometry(180,180),material=new THREE.MeshStandardMaterial({color:ground,roughness:.94,metalness:.04}),floor=new THREE.Mesh(geometry,material);floor.rotation.x=-Math.PI/2;floor.position.y=-.245;floor.receiveShadow=true;scene.add(floor);
 function fit(bounds:THREE.Box3){const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),extent=Math.max(size.x,size.y,size.z,3)*.8;key.target.position.copy(center);scene.add(key.target);key.position.copy(center).add(new THREE.Vector3(-extent,extent*1.7,extent));key.shadow.camera.left=-extent;key.shadow.camera.right=extent;key.shadow.camera.top=extent;key.shadow.camera.bottom=-extent;key.shadow.camera.near=.1;key.shadow.camera.far=extent*6;key.shadow.camera.updateProjectionMatrix();key.shadow.needsUpdate=true;}
 function syncTheme(){const next=document.documentElement.dataset.theme==='dark';if(next===dark)return;dark=next;ground.setHex(dark?0x253033:0xd9d5ca);scene.background=ground;(scene.fog as THREE.FogExp2).color.copy(ground);material.color.copy(ground);}
 return {fit,syncTheme,dispose(){geometry.dispose();material.dispose();key.shadow.map?.dispose();}};
}
