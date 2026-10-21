import * as THREE from 'three';
import diyMaterials from '@/lib/diy-materials.json';
import machineMaterials from '@/lib/machine-materials.json';
// Adapted from Airsup Anatomy 3D MAT and studioEnvironment (MIT).
// Presets describe representative construction materials, not measured alloy
// assignments for a specific product. Preserve green for PCBs and selection.
const presets:Record<string,THREE.MeshPhysicalMaterialParameters>={
 ...diyMaterials,
 ...machineMaterials,
};
export function createMachineMaterial(part:string,component:string|undefined,name:string,base:number,materialKey?:string){
 if(materialKey==='white-polymer'){const m=new THREE.MeshPhysicalMaterial({color:machineMaterials['white-polymer'].color,metalness:0,roughness:.42,clearcoat:.28,clearcoatRoughness:.35,envMapIntensity:.45,side:THREE.DoubleSide});m.userData.base=m.color.getHex();return m;}
 if(materialKey==='acoustic-mesh'){const m=new THREE.MeshPhysicalMaterial({color:0x171b1a,metalness:.15,roughness:.75,side:THREE.DoubleSide});m.userData.base=m.color.getHex();return m;}
 if(materialKey==='indicator'){const m=new THREE.MeshPhysicalMaterial({color:0x8dbf77,emissive:0x3a6c26,emissiveIntensity:.2});m.userData.base=m.color.getHex();return m;}
 if(materialKey==='glass'){const glass=new THREE.MeshPhysicalMaterial({color:machineMaterials.glass.color,metalness:0,roughness:.08,transmission:.82,thickness:.3,ior:1.5,clearcoat:1,side:THREE.DoubleSide});glass.userData.base=glass.color.getHex();return glass;}
 const key=`${component||''} ${part} ${name}`.toLowerCase();
 let preset=presets.aluminium;
 if(/soil|rock|concrete|raft|foundation|masonry/.test(key))preset=presets.ceramic;
 else if(/windings|copper|busbar|contact/.test(key))preset=presets.copper;
 else if(/gear|barrel|escapement/.test(key))preset=presets.brass;
 else if(/turbine|combustor|nozzle/.test(key))preset=presets.titanium;
 else if(/board|processor|controller|computer|electronics|driver|sensor/.test(key))preset=presets.pcb;
 else if(/tire|tyre|seal|rubber|belt/.test(key))preset=presets.rubber;
 else if(/battery|button|display|screen|lens|cover|body|storage|case/.test(key))preset=presets.plastic;
 else if(/shaft|motor|crank|bearing|fastener|bolt|bridge|rail|valve/.test(key))preset=presets.steel;
 if(materialKey&&materialKey in presets)preset=presets[materialKey as keyof typeof presets];
 const material=new THREE.MeshPhysicalMaterial({...preset,side:THREE.DoubleSide,clearcoat:preset===presets.plastic?.15:0,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
 // The engine's selection blend starts from the true material colour.
 material.userData.base=material.color.getHex();return material;
}
export function createStudioEnvironment(renderer:THREE.WebGLRenderer){
 const studio=new THREE.Scene();studio.background=new THREE.Color(0x76787b);
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[];
 for(const [x,y,z,w,h,intensity] of [[-3,2,4,5,6,3],[4,-2,1,3,5,1.5],[0,5,0,7,3,2]]){
  const g=new THREE.PlaneGeometry(w,h),m=new THREE.MeshBasicMaterial({color:new THREE.Color(intensity,intensity,intensity),side:THREE.DoubleSide});const panel=new THREE.Mesh(g,m);panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);geometries.push(g);materials.push(m);
 }
 const pmrem=new THREE.PMREMGenerator(renderer),map=pmrem.fromScene(studio,.15);pmrem.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());return map;
}
