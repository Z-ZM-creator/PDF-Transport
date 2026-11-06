const fs=await import('node:fs/promises');const t=await taskSpace(2);const p=await t.newPage();console.log(p.label);
const rows=JSON.parse(await fs.readFile('F:/Paper/doi-download-status.json','utf8'));
for(const row of rows.filter(x=>x.status!=='downloaded'&&/10.52202|10.5121/.test(x.url))){
 try{
  try{await p.goto(row.url,{timeout:30000});}catch{}
  const d=await p.evaluate(()=>({url:location.href,pdf:document.querySelector('meta[name="citation_pdf_url"]')?.content,links:[...document.querySelectorAll('a[href]')].filter(a=>/\.pdf(?:$|\?)/.test(a.href)).map(a=>a.href)}));
  const pdf=d.pdf||(/\.pdf(?:$|\?)/.test(d.url)?d.url:d.links[0]);if(!pdf)throw Error('No PDF link at '+d.url);
  const path='F:/Paper/PDF/DOI_'+row.url.split('doi.org/')[1].replace(/[^a-zA-Z0-9._-]/g,'_')+'.pdf';
  await p.fetch(pdf,{saveAs:path,timeout:180000});const b=await fs.readFile(path);if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Non-PDF response');}
  Object.assign(row,{status:'downloaded',path,bytes:b.length});delete row.error;
 }catch(e){row.error=String(e);}
 await fs.writeFile('F:/Paper/doi-download-status.json',JSON.stringify(rows,null,2));console.log(row);
}
