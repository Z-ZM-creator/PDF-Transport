const fs=await import('node:fs/promises');const t=await taskSpace(1);const p=t.page('p4');
const all=JSON.parse(await fs.readFile('F:/Paper/PaperLine.JSON','utf8'));const urls=all.filter(u=>u.includes('doi.org')&&!u.includes('/10.1016/'));const log=[];const blocked=new Set();
for(const url of urls){
 const prefix=new URL(url).pathname.split('/')[1];if(blocked.has(prefix)){log.push({url,status:'pending_platform_verification'});continue;}
 try{
  try{await p.goto(url,{timeout:20000});}catch(e){if(/control|inactive|unassigned/i.test(String(e)))throw e;}
  const data=await p.evaluate(()=>({url:location.href,title:document.title,text:document.body.innerText.slice(0,18000),pdf:document.querySelector('meta[name="citation_pdf_url"]')?.content,links:[...document.querySelectorAll('a[href]')].filter(a=>/\.pdf(?:$|\?)|\/pdf\//.test(a.href)||/download pdf|view pdf/i.test(a.textContent)).map(a=>a.href)}));
  if(/captcha|verify you are human|are you a robot|checking your browser|just a moment/i.test(data.title+' '+data.text)){blocked.add(prefix);log.push({url,status:'verification_required',page:data.url});}
  else{
   const pdf=data.pdf||data.links[0];if(!pdf){log.push({url,status:'no_pdf_link',page:data.url,title:data.title});}
   else{const path='F:/Paper/PDF/DOI_'+url.split('doi.org/')[1].replace(/[^a-zA-Z0-9._-]/g,'_')+'.pdf';await p.fetch(pdf,{saveAs:path,timeout:60000});const b=await fs.readFile(path);if(b.subarray(0,5).toString()!=='%PDF-'){await fs.unlink(path);throw Error('Non PDF response');}log.push({url,status:'downloaded',path,bytes:b.length});}
  }
 }catch(e){log.push({url,status:'failed',error:String(e)});if(/control|inactive|unassigned/i.test(String(e)))break;}
 await fs.writeFile('F:/Paper/doi-download-status.json',JSON.stringify(log,null,2));console.log(log.at(-1));
}
await fs.writeFile('F:/Paper/doi-download-status.json',JSON.stringify(log,null,2));
