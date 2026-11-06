const fs=await import('node:fs/promises'); const t=await taskSpace(1);
const log=JSON.parse(await fs.readFile('F:/Paper/download-status.json','utf8'));
for(const row of log.filter(r=>r.status==='failed'&&!r.url.includes('ieee.org'))){
 const host=new URL(row.url).hostname,p=t.page(host==='ojs.aaai.org'?'p2':'p3');
 const id=host==='ojs.aaai.org'?row.url.split('/').slice(-2).join('_'):new URL(row.url).pathname.split('/').pop();
 const path='F:/Paper/PDF/'+host+'_'+id.replace(/\.pdf$/,'')+'.pdf';
 try{await p.fetch(row.url,{saveAs:path,timeout:90000});const b=await fs.readFile(path);if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Not PDF');}Object.assign(row,{status:'downloaded',path,bytes:b.length});delete row.error;}catch(e){row.error=String(e);}
 await fs.writeFile('F:/Paper/download-status.json',JSON.stringify(log,null,2));console.log(row);
}
