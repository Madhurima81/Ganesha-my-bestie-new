const http=require('http');
const fs=require('fs');
const path=require('path');
const {chromium}=require('playwright');
const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT=41919;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const server = http.createServer((req,res)=>{
  const requestPath = req.url==='/'?'/index.html':req.url;
  const filePath = path.join(ROOT, decodeURIComponent(requestPath.split('?')[0]));
  if(!fs.existsSync(filePath)||fs.statSync(filePath).isDirectory()){res.writeHead(404);res.end();return;}
  const ext=path.extname(filePath);
  res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});
  fs.createReadStream(filePath).pipe(res);
});
server.listen(PORT, async ()=>{
  const b=await chromium.launch({headless:true});
  const p=await b.newPage();
  await p.goto('http://127.0.0.1:'+PORT+'/index.html', {waitUntil:'networkidle', timeout:30000});
  await p.waitForTimeout(3000);
  const data = await p.evaluate(async ()=>{
    const libs = window.__pranaState.libraries;
    const situations = (libs.situations || libs.situationLibrary || []).filter((s)=>s.active!==false);
    const out=[];
    for (const situation of situations) {
      const request = { situationId: situation.id, characterId: null };
      const result = window.__pranaDebug.resolvePhase6(libs, request, {});
      const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, null);
      const templateId = artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId;
      const ctx = result && result.context;
      if (templateId === "T04") {
        out.push({
          id: situation.id,
          title: situation.title,
          storySeed: situation.storySeed,
          narrativeSummarySentences: ctx && ctx.narrativeSummarySentences,
        });
      }
    }
    return out;
  });
  fs.writeFileSync(path.resolve(process.cwd(),'tmp_t04_situations.json'), JSON.stringify(data,null,2),'utf8');
  console.log('count', data.length);
  await b.close();
  server.close();
});
