const fs=await import('node:fs/promises');
const t=await taskSpace(1), p=t.page('p1');
const urls=JSON.parse(await fs.readFile('F:/Paper/PaperLine.JSON','utf8'));
const ids=[...new Set(urls.filter(u=>u.includes('ieee.org')).map(u=>u.match(/arnumber=(\d+)/)?.[1]||u.match(/\/(\d+)-aam\.pdf/)?.[1]).filter(Boolean))];
let failures=0;const log=[];
await fs.writeFile('F:/Paper/ieee-run-state.json',JSON.stringify({state:'running',total:ids.length}));
for(const id of ids){
 const path='F:/Paper/PDF/IEEE_'+id+'.pdf';
 try{
  let valid=false;try{const b=await fs.readFile(path);valid=b.subarray(0,5).toString()==='%PDF-';}catch{}
  if(!valid){await p.fetch('https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?tp=&arnumber='+id+'&ref=',{saveAs:path,timeout:30000});const b=await fs.readFile(path);if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Not PDF: login, access or verification required');}}
  failures=0;log.push({id,path,status:'downloaded'});
 }catch(e){failures++;log.push({id,status:'failed',error:String(e)});}
 await fs.writeFile('F:/Paper/ieee-download-status.json',JSON.stringify(log,null,2));
 await fs.writeFile('F:/Paper/ieee-run-state.json',JSON.stringify({state:failures>=3?'stopped_after_repeated_failures':'running',total:ids.length,processed:log.length,downloaded:log.filter(x=>x.status==='downloaded').length,last:log.at(-1)}));
 if(failures>=3)break;
 await new Promise(r=>setTimeout(r,1500));
}
if(log.length===ids.length)await fs.writeFile('F:/Paper/ieee-run-state.json',JSON.stringify({state:'finished',total:ids.length,downloaded:log.filter(x=>x.status==='downloaded').length}));
console.log(await fs.readFile('F:/Paper/ieee-run-state.json','utf8'));
