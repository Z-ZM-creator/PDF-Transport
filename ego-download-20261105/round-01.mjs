const fs = await import('node:fs/promises');
const t = await taskSpace(1);
const p = await t.newPage();
console.log('page', p.label);
await p.goto('https://ojs.aaai.org');
const url='https://ojs.aaai.org/index.php/AAAI-SS/article/download/27647/27420';
const r=await p.fetch(url,{saveAs:'F:/Paper/PDF/AAAI_27647.pdf',timeout:20000});
console.log(r);
console.log(await p.snapshot());
