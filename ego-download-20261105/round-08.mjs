const fs=await import('node:fs/promises');const t=await taskSpace(1),p=t.page('p1');
const urls=JSON.parse(await fs.readFile('F:/Paper/PaperLine.JSON','utf8'));
const ids=[...new Set(urls.filter(u=>u.includes('ieee.org')).map(u=>u.match(/arnumber=(\d+)/)?.[1]||u.match(/\/(\d+)-aam\.pdf/)?.[1]).filter(Boolean))];
const results=new Map(JSON.parse(await fs.readFile('F:/Paper/ieee-download-status.json','utf8')).map(x=>[x.id,x]));let streak=0,state;
for(const id of ids){
 if(results.get(id)?.status==='downloaded')continue;
 const path='F:/Paper/PDF/IEEE_'+id+'.pdf';let row;
 try{const start=Date.now();const response=await p.fetch('https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?tp=&arnumber='+id+'&ref=',{saveAs:path,timeout:90000});const b=await fs.readFile(path);if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Non-PDF HTTP '+response.status+'; inspect access');}row={id,path,status:'downloaded',bytes:b.length,seconds:(Date.now()-start)/1000};streak=0;}
 catch(e){row={id,status:'failed',error:String(e)};streak++;}
 results.set(id,row);const rows=[...results.values()];const stop=streak>=5||/Non-PDF|control|inactive|unassigned/i.test(row.error||'');
 state={state:stop?'needs_inspection':'running',total:ids.length,processed:rows.length,downloaded:rows.filter(x=>x.status==='downloaded').length,last:row,updated:new Date().toISOString()};
 await fs.writeFile('F:/Paper/ieee-download-status.json',JSON.stringify(rows,null,2));await fs.writeFile('F:/Paper/ieee-run-state.json',JSON.stringify(state));console.log(state);
 if(stop)break;await new Promise(r=>setTimeout(r,3000));
}
if(state?.state==='running'){state.state='finished';await fs.writeFile('F:/Paper/ieee-run-state.json',JSON.stringify(state));}
