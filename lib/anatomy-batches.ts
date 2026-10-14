import type {MechanismMotion} from './mechanism-motion';
// Merge only geometry that shares selection, visibility, material and motion.
export function geometryBatchKey(s:{phiStart?:number;phiLength?:number;inspectionOffset?:[number,number,number];materialKey?:string;part:string;component?:string;stage?:string;move?:[number,number,number];motion?:MechanismMotion},colour:number){return JSON.stringify([s.component||s.part,s.component||'',s.stage||'',colour,s.move||[0,0,0],s.motion||null,s.materialKey||null,s.inspectionOffset||null,s.phiStart||0,s.phiLength||null]);}
