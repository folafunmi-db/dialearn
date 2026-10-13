import {readdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
const files=[];function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path);else if(!/\.(map|txt)$/.test(entry.name)&&!['sw.js','offline-manifest.json'].includes(entry.name)){files.push('/'+path.replace(/^out\//,''));}}}walk('out');
// Open SVGs are standalone review exports; the website opens its recorded SVG groups.
const core=files.filter(p=>!p.endsWith('-open.svg'));
const assets=core.filter(p=>!p.endsWith('.html'));const html=core.filter(p=>p.endsWith('.html')).map(p=>p.replace(/index\.html$/,''));
const bytes=core.reduce((sum,p)=>sum+statSync('out'+p).size,0);
const reading=core.filter(p=>!p.startsWith('/art/'));const readingBytes=reading.reduce((sum,p)=>sum+statSync('out'+p).size,0);
writeFileSync('out/offline-manifest.json',JSON.stringify({files:[...assets,...html],bytes,readingFiles:reading.map(p=>p.replace(/index\.html$/,'')),readingBytes,version:3}));
console.log(`Offline pack: ${core.length} files, ${(bytes/1024/1024).toFixed(2)} MB before HTTP compression.`);
