const fs=await import('node:fs/promises');
await fs.rename('F:/Paper/PDF/AAAI_27647.pdf','F:/Paper/ego-download-20261105/AAAI-verification.html');
const t=await taskSpace(1); const p=t.page('p2');
console.log(await p.snapshot());
const d=p.waitForEvent('download',{timeout:15000});
try { await p.goto('https://ojs.aaai.org/index.php/AAAI-SS/article/download/27647/27420'); } catch(e){console.log(String(e));}
try {const a=await d; await a.saveAs('F:/Paper/PDF/AAAI_27647.pdf'); console.log('Saved AAAI');}catch(e){console.log(String(e));}
const n=await t.newPage(); console.log(n.label);
try{await n.goto('https://www.nature.com/articles/s41467-023-44609-w');}catch(e){console.log(String(e));}
console.log(await n.snapshot());
