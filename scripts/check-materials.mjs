import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {materials,materialFor,materialCss} from './catalogue-materials.mjs';
const diy=JSON.parse(readFileSync('lib/diy-materials.json'));
let models=0,solids=0;
for(const file of readdirSync('public/art').filter(f=>f.endsWith('-model.json'))){
 const id=file.slice(0,-11),model=JSON.parse(readFileSync('public/art/'+file));
 for(const p of model.parts){assert(materials[p.materialKey]||diy[p.materialKey],`${id}/${p.name}: missing material`);solids++;}
 const groups=JSON.parse(readFileSync(`public/art/${id}.json`));
 for(const g of groups)assert(g.svg.includes('data-material='),`${id}/${g.id}: uncoloured SVG`);
 const svg=readFileSync(`public/art/${id==='phone'?'phone-card':id}.svg`,'utf8');assert(svg.includes('data-catalogue-colours'),`${id}: missing standalone colours`);
 models++;
}
assert.equal(materialFor('smart-watch','case'),'graphite');
assert.equal(materialFor('galaxy-watch6-classic','case'),'steel');
assert.equal(materialFor('car','body'),'car-paint');
assert.equal(materialFor('headphones','coils'),'copper');
assert.equal(materialFor('drone','frame','','diy-red'),'diy-red');
for(const key of Object.keys(materials))assert(materialCss.includes(`[data-material="${key}"]`));
console.log(`Verified shared SVG/card/3D material coverage: ${models} models and ${solids} solids.`);
