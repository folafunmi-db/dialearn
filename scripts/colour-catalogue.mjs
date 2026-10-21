// Material-only refresh: no changes to audited solids, poses or drawing order.
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {materialFor,materialCss} from './catalogue-materials.mjs';
import {diyMaterialCss} from './diy-hardware.mjs';
// Standalone images are used as small project previews. Keep their linework
// quieter than the full-size interactive SVG diagrams, whose styles stay intact.
const previewLines='.iso .iso-line{stroke-opacity:.36;stroke-width:.45px}.iso .iso-edge{stroke-opacity:.5}';
const css=materialCss+'\n'+diyMaterialCss+'\n'+previewLines;
const colourSvg=(svg,id,part)=>{
 // Remove only this script's own outer wrapper on repeated runs.
 if(svg.startsWith('<g data-catalogue-material='))svg=svg.slice(svg.indexOf('>')+1,-4);
 svg=svg.replace(/<g data-component="([^"]+)"([^>]*)>/g,(_,component,rest)=>`<g data-component="${component}"${rest.replace(/ data-material="[^"]*"/g,'')} data-material="${materialFor(id,part,component)}">`);
 return `<g data-catalogue-material="true" data-material="${materialFor(id,part)}">${svg}</g>`;
};
let count=0;
for(const file of readdirSync('public/art').filter(f=>f.endsWith('-model.json'))){
 const id=file.slice(0,-11),base='public/art/'+id,model=JSON.parse(readFileSync(base+'-model.json'));
 for(const p of model.parts)p.materialKey=materialFor(id,p.part,p.component,p.materialKey);
 writeFileSync(base+'-model.json',JSON.stringify(model));
 for(const variant of ['',...Array.from({length:7},(_,i)=>'-'+(i+1))]){
  const data=base+variant+'.json';if(!existsSync(data))continue;
  const drawing=JSON.parse(readFileSync(data));if(!Array.isArray(drawing))continue;
  for(const g of drawing)g.svg=colourSvg(g.svg,id,g.id);
  writeFileSync(data,JSON.stringify(drawing));
 }
 for(const suffix of ['.svg','-open.svg','-card.svg']){
  const path=base+suffix;if(!existsSync(path))continue;
  let svg=readFileSync(path,'utf8').replace(/<style data-catalogue-colours(?:="true")?>[\s\S]*?<\/style>/g,'');
  // Existing standalone artwork retains its independently fitted projection.
  svg=svg.replace(/<g(?: transform="[^"]*")? class="assembly ([^"]+)"[^>]*>/g,(all,part)=>all.replace(/ data-material="[^"]*"/g,'').replace(/>$/,` data-material="${materialFor(id,part)}">`));
  if(id!=='phone'){
   const drawing=JSON.parse(readFileSync(base+'.json'));
   const end=svg.lastIndexOf('</style>')+8;
   if(end>7)svg=svg.slice(0,end)+drawing.map(g=>`<g ${suffix==='-open.svg'?`transform="${g.lift}"`:''}>${g.svg}</g>`).join('')+'</svg>';
  }
  svg=svg.replace('</svg>',`<style data-catalogue-colours="true">${css}</style></svg>`);
  writeFileSync(path,svg);
 }
 count++;
}
const globals='app/globals.css';let global=readFileSync(globals,'utf8').replace(/\/\* Catalogue material palette \*\/[\s\S]*?\/\* End catalogue material palette \*\//g,'');
writeFileSync(globals,global.trimEnd()+'\n/* Catalogue material palette */\n'+materialCss+'\n/* End catalogue material palette */\n');
console.log(`Applied shared material finishes to ${count} models, their SVG diagrams and cards.`);
