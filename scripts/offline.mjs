import {readdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
const files=[];function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path);else if(!/\.(map|txt)$/.test(entry.name)&&!['sw.js','offline-manifest.json'].includes(entry.name)){files.push('/'+path.replace(/^out\//,''));}}}walk('out');
const core=files;
const assets=core.filter(p=>!p.endsWith('.html'));const html=core.filter(p=>p.endsWith('.html')).map(p=>p.replace(/index\.html$/,''));
const bytes=core.reduce((sum,p)=>sum+statSync('out'+p).size,0);
writeFileSync('out/offline-manifest.json',JSON.stringify({files:[...assets,...html],bytes,version:2}));
console.log(`Offline pack: ${core.length} files, ${(bytes/1024/1024).toFixed(2)} MB before HTTP compression.`);
