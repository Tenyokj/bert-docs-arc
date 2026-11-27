import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const port=Number(process.env.PORT || 3200);
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".pdf":"application/pdf"};
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,"http://localhost");
    const file=path.resolve(root,"."+decodeURIComponent(url.pathname==="/"?"/index.html":url.pathname));
    if(!file.startsWith(root+path.sep)||path.relative(root,file).split(path.sep).some(part=>part.startsWith(".")))throw Error("Not public");
    const body=await readFile(file);
    res.writeHead(200,{"content-type":types[path.extname(file)] || "application/octet-stream","cache-control":"no-store"});res.end(body);
  } catch {res.writeHead(404);res.end("Not found");}
}).listen(port,"127.0.0.1",()=>console.log(`Local docs preview: http://127.0.0.1:${port}`));
