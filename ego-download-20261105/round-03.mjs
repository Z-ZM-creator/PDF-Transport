const fs=await import('node:fs/promises'); const t=await taskSpace(1);
const urls=JSON.parse(await fs.readFile('F:/Paper/PaperLine.JSON','utf8'));
const log=[];
for(const url of urls.filter(u=>/ojs.aaai.org|www.nature.com|https:\/\/ieeexplore/.test(u))){
 const host=new URL(url).hostname; const p=t.page(host==='ojs.aaai.org'?'p2':host==='www.nature.com'?'p3':'p1');
 const id=host==='ojs.aaai.org'?url.split('/').slice(-2).join('_'):new URL(url).pathname.split('/').pop();
 const path='F:/Paper/PDF/'+host+'_'+id.replace(/\.pdf$/,'')+'.pdf';
 try {await p.fetch(url,{saveAs:path,timeout:15000}); const b=await fs.readFile(path); if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Response is not PDF');} log.push({url,path,status:'downloaded',bytes:b.length});}
 catch(e){log.push({url,status:'failed',error:String(e)});}
 await fs.writeFile('F:/Paper/download-status.json',JSON.stringify(log,null,2)); console.log(log.at(-1));
}
