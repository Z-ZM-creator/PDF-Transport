const fs=await import('node:fs/promises');const t=await taskSpace(2),p=t.page('p1');
const urls=JSON.parse(await fs.readFile('F:/Paper/PaperLine.JSON','utf8'));
const ids=[...new Set(urls.filter(u=>u.includes('ieee.org')).map(u=>u.match(/arnumber=(\d+)/)?.[1]||u.match(/\/(\d+)-aam\.pdf/)?.[1]).filter(Boolean))];
const results=new Map(JSON.parse(await fs.readFile('F:/Paper/ieee-download-status.json','utf8')).map(x=>[x.id,x]));let renewed=Date.now(),streak=0;
async function renew(id){
 await p.goto('https://ieeexplore.ieee.org/document/'+id,{timeout:30000});
 await p.waitForFunction(()=>document.body.innerText.includes('Institutional Sign In')||document.body.innerText.includes('Hohai University Library'),undefined,{timeout:20000});
 if(await p.evaluate(()=>document.body.innerText.includes('Hohai University Library'))){renewed=Date.now();return;}
 await p.click('text="Institutional Sign In"');await p.click('loc=role:button[name*="Hohai University"]');
 await p.waitForFunction(()=>document.body.innerText.includes('Hohai University Library'),undefined,{timeout:30000});renewed=Date.now();
}
async function save(state,last){const rows=[...results.values()];await fs.writeFile('F:/Paper/ieee-download-status.json',JSON.stringify(rows,null,2));await fs.writeFile('F:/Paper/ieee-run-state.json',JSON.stringify({state,spaceId:2,total:ids.length,processed:rows.length,downloaded:rows.filter(x=>x.status==='downloaded').length,last,updated:new Date().toISOString()}));}
await save('running',null);
let halted=false;
for(const id of ids){
 if(results.get(id)?.status==='downloaded')continue;
 const path='F:/Paper/PDF/IEEE_'+id+'.pdf';let row;
 try{
  if(Date.now()-renewed>25*60000)await renew(id);
  for(let attempt=0;attempt<2;attempt++){
   try{const start=Date.now();const response=await p.fetch('https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?tp=&arnumber='+id+'&ref=',{saveAs:path,timeout:180000});const b=await fs.readFile(path);if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Non-PDF HTTP '+response.status);}
    row={id,path,status:'downloaded',bytes:b.length,seconds:(Date.now()-start)/1000};break;
   }catch(e){if(/control|inactive|unassigned|not found/i.test(String(e)))throw e;if(attempt===1)throw e;if(/Non-PDF/.test(String(e)))await renew(id);}
  }streak=0;
 }catch(e){row={id,status:'failed',error:String(e)};streak++;}
 results.set(id,row);const stop=streak>=5||/Non-PDF|control|inactive|unassigned|not found|waitForFunction/i.test(row.error||'');await save(stop?'needs_inspection':'running',row);console.log(row);
 if(stop){halted=true;break;}await new Promise(r=>setTimeout(r,3000));
}
if(!halted)await save('finished',null);
