// Refresh finishes only, retaining the audited geometry, projection and ordering.
import {readFileSync,writeFileSync} from 'node:fs';
import {diyMaterialCss,diyMaterialFor} from './diy-hardware.mjs';
const ids=['arduino-rover','pi-station','breadboard-led','reaction-timer','plant-waterer'];
for(const id of ids){
 const path=`public/art/${id}`,model=JSON.parse(readFileSync(path+'-model.json','utf8'));
 for(const part of model.parts)part.materialKey=diyMaterialFor(part.materialKey,id,part.part,part.component);
 writeFileSync(path+'-model.json',JSON.stringify(model));
 const drawing=JSON.parse(readFileSync(path+'.json','utf8'));
 for(const group of drawing)group.svg=group.svg.replace(/(<g data-component="([^"]+)" data-stage="[^"]+">)?<g data-material="([^"]+)">/g,(_,prefix,component,key)=>(prefix||'')+`<g data-material="${diyMaterialFor(key,id,group.id,component)}">`);
 writeFileSync(path+'.json',JSON.stringify(drawing));
 for(const opened of [false,true]){
  const file=path+(opened?'-open':'')+'.svg',old=readFileSync(file,'utf8'),end=old.lastIndexOf('</style>')+8;
  let prefix=old.slice(0,end).replace(/\[data-material=diy-[^\n]+\n/g,'');
  prefix=prefix.replace(/<style>/,'<style>'+diyMaterialCss);
  writeFileSync(file,prefix+drawing.map(g=>`<g ${opened?`transform="${g.lift}"`:''}>${g.svg}</g>`).join('')+'</svg>');
 }
}
const cssFile='app/globals.css',css=readFileSync(cssFile,'utf8').replace(/\[data-material=diy-[^\n]+\n/g,'');
writeFileSync(cssFile,css+'\n'+diyMaterialCss);
console.log('Updated five DIY SVGs and Three.js models from the shared hardware palette; geometry unchanged.');
