const fs=await import('node:fs/promises');const t=await taskSpace(3),p=t.page('p1');
const urls=JSON.parse(await fs.readFile('F:/Paper/PaperLine.JSON','utf8'));
const ids=[...new Set(urls.filter(u=>u.includes('ieee.org')).map(u=>u.match(/arnumber=(\d+)/)?.[1]||u.match(/\/(\d+)-aam\.pdf/)?.[1]).filter(Boolean))];
const results=new Map(JSON.parse(await fs.readFile('F:/Paper/ieee-download-status.json','utf8')).map(x=>[x.id,x]));let renewed=Date.now(),lastRenewAttempt=0;
const fatal=e=>/EGO_CONTROL|control.*(taken|lost)|inactive|unassigned|task space not found|browser.*(closed|disconnect)/i.test(String(e));
async function renew(id){
 lastRenewAttempt=Date.now();
 await p.goto('https://ieeexplore.ieee.org/document/'+id,{timeout:30000});
 await p.waitForFunction(()=>document.body.innerText.includes('Institutional Sign In')||document.body.innerText.includes('Hohai University Library'),undefined,{timeout:20000});
 if(!await p.evaluate(()=>document.body.innerText.includes('Hohai University Library'))){await p.click('text="Institutional Sign In"');await p.click('loc=role:button[name*="Hohai University"]');await p.waitForFunction(()=>document.body.innerText.includes('Hohai University Library'),undefined,{timeout:30000});}
 renewed=Date.now();
}
async function save(state,current,last){const rows=[...results.values()];await fs.writeFile('F:/Paper/ieee-download-status.json',JSON.stringify(rows,null,2));await fs.writeFile('F:/Paper/ieee-run-state.json',JSON.stringify({state,spaceId:3,total:ids.length,processed:rows.length,downloaded:rows.filter(x=>x.status==='downloaded').length,current,last,updated:new Date().toISOString()}));}
let stopped=false;
for(let pass=1;pass<=2&&!stopped;pass++){
 const queue=pass===1?[...ids.filter(id=>!results.has(id)),...ids.filter(id=>results.get(id)?.status==='failed')]:ids.filter(id=>results.get(id)?.status==='failed');
 for(const id of queue){
  if(results.get(id)?.status==='downloaded')continue;
  await save('running',{id,pass},null);const path='F:/Paper/PDF/IEEE_'+id+'.pdf';let row;
  try{
   if(Date.now()-renewed>20*60000&&Date.now()-lastRenewAttempt>5*60000){try{await renew(id);}catch(e){if(fatal(e))throw e;}}
   const start=Date.now();const r=await p.fetch('https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?tp=&arnumber='+id+'&ref=',{saveAs:path,timeout:180000});const b=await fs.readFile(path);
   if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);if(Date.now()-lastRenewAttempt>5*60000)renewed=0;throw Error('Non-PDF HTTP '+r.status);}
   row={id,path,status:'downloaded',bytes:b.length,seconds:(Date.now()-start)/1000};
  }catch(e){row={id,status:'failed',error:String(e),pass};if(fatal(e))stopped=true;}
  results.set(id,row);await save(stopped?'browser_unavailable':'running',null,row);console.log(row);
  if(stopped)break;
  await new Promise(r=>setTimeout(r,2000));
 }
}
if(!stopped)await save('queue_finished',null,null);
