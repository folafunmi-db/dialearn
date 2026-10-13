export type MechanismMotion={pivot:[number,number,number];axis:[number,number,number];ratio:number;mode?:'rotate'|'oscillate'|'piston'|'rod';amplitude?:number;radius?:number;rodLength?:number};
export function mechanismPose(m:MechanismMotion,phase:number){const theta=phase*m.ratio,offset:[number,number,number]=[0,0,0];let angle=theta;
 if(m.mode==='oscillate')angle=Math.sin(theta)*(m.amplitude||1);
 if(m.mode==='piston'||m.mode==='rod'){const r=m.radius||10,L=m.rodLength||38;const x=r*Math.sin(theta);if(m.mode==='piston'){angle=0;offset[2]=r*Math.cos(theta)+Math.sqrt(Math.max(0,L*L-x*x))-r-L;}else{offset[0]=x;offset[2]=r*(Math.cos(theta)-1);angle=Math.asin(-x/L);}}
 return {offset,angle};}
