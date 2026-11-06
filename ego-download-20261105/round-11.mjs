const fs=await import('node:fs/promises');const t=await taskSpace(2),p=t.page('p2');const rows=JSON.parse(await fs.readFile('F:/Paper/download-status.json','utf8'));
for(const r of rows.filter(x=>x.status!=='downloaded'&&x.url.includes('ojs.aaai.org'))){
 const path='F:/Paper/PDF/ojs.aaai.org_'+r.url.split('/').slice(-2).join('_')+'.pdf';
 try{await p.fetch(r.url,{saveAs:path,timeout:180000});const b=await fs.readFile(path);if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Not PDF');}Object.assign(r,{status:'downloaded',path,bytes:b.length});delete r.error;}catch(e){r.error=String(e);}
 await fs.writeFile('F:/Paper/download-status.json',JSON.stringify(rows,null,2));console.log(r);
}
