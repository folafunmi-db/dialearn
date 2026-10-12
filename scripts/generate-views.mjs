import {execFileSync} from 'node:child_process';
// Eight real camera azimuths, each using the same world geometry and shading.
// Frames are requested on demand so initial page access loads only one angle.
for(let view=1;view<8;view++){
 const env={...process.env,ANATOMY_VIEW:String(view)};
 execFileSync(process.execPath,['scripts/generate-art.mjs'],{env,stdio:'pipe'});
 execFileSync(process.execPath,['scripts/generate-devices.mjs'],{env,stdio:'pipe'});
 console.log(`Generated ${view*45}° camera views for all six devices.`);
}
