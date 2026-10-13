import type {MechanismMotion} from './mechanism-motion';
// Merge only geometry that shares selection, visibility, material and motion.
export function geometryBatchKey(s:{part:string;component?:string;stage?:string;move?:[number,number,number];motion?:MechanismMotion},colour:number){return JSON.stringify([s.part,s.component||'',s.stage||'',colour,s.move||[0,0,0],s.motion||null]);}
