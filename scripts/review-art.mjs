// Temporary local visual review fixtures. Run after build; not in offline manifest.
import {readFileSync,writeFileSync} from 'node:fs';
import {LINE_ENDS} from '../vendor/anatomy/scripts/line-ends.mjs';
import {ISO_CSS} from '../vendor/anatomy/iso-kit.mjs';
for(const id of ['controller','console','car','solar','bicycle','breadboard-led','reaction-timer','plant-waterer'])for(const pose of ['rest','open'])for(const theme of ['light','dark']){
 let svg=readFileSync(`out/art/${id}${pose==='open'?'-open':''}.svg`,'utf8').replace(/<style>[\s\S]*?<\/style>/,'');
 if(theme==='dark')svg=svg.replace(/ style="[^"]*"/,'').replace('data-theme="light"','data-theme="dark"');
 writeFileSync(`out/review-${id}-${pose}-${theme}.html`,`<!doctype html><html data-theme="${theme}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${id} · ${pose} · ${theme} review</title><style>${ISO_CSS} body{background:var(--anatomy-paper);color:var(--anatomy-hi);margin:0;font:16px sans-serif}h1,pre{margin:16px 24px;font-size:18px}.fixture{width:min(560px,100%);margin:auto}.fixture svg{width:100%;height:auto}body.zoom .fixture{width:2240px;max-width:none}pre{white-space:pre-wrap}</style><body class="iso" data-theme="${theme}"><h1>${id} · ${pose} · ${theme}</h1><div class="fixture iso-plate">${svg}</div><pre id="result">Checking line ends…</pre><script>if(new URLSearchParams(location.search).has('zoom'))document.body.classList.add('zoom');const lineEnds=${LINE_ENDS};requestAnimationFrame(()=>{const result=lineEnds({select:'.fixture'});document.getElementById('result').textContent=JSON.stringify(result);});</script></html>`);
}
console.log('32 local Anatomy visual and line-end fixtures generated.');
