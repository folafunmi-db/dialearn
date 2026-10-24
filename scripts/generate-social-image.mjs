import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[require.resolve('next')]}));
// Editable vector source; raster output is used by social preview crawlers.
await sharp('design/social-card.svg').resize(1200,630).png().toFile('app/opengraph-image.png');
console.log('Generated 1200 × 630 Dialearn Open Graph image.');
