import {readdirSync, mkdirSync, writeFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import path from "node:path";

const root = process.env.BERT_CORE_PATH || path.resolve(import.meta.dirname, "../../../bert-core");
const revision = execFileSync("git", ["rev-parse", "HEAD"], {cwd:root,encoding:"utf8"}).trim();
// A pinned revision must describe committed source, never unpublished local edits.
execFileSync("git", ["diff", "--exit-code", revision, "--", "contracts", "docs"], {cwd:root,stdio:"pipe"});
const committed = (file) => execFileSync("git", ["show", `${revision}:${file}`], {cwd:root,encoding:"utf8",maxBuffer:10*1024*1024});
const walk = (dir) => readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const files = walk(path.join(root,"contracts/BERT")).filter((file)=>file.endsWith(".sol"));
for (const file of walk(path.join(root,"contracts")).filter((file)=>/RoleBootstrapDistributor\.sol$/.test(file))) files.push(file);
const contracts = files.map((file)=>{
  const relative=path.relative(root,file), source=committed(relative);
  const functions=[...source.matchAll(/function\s+(\w+)\s*\([\s\S]*?\)\s*[^{};]*[;{]/g)].filter((match)=>! /\b(private|internal)\b/.test(match[0])).map((match)=>{
    const before=source.slice(Math.max(0,match.index-2500),match.index);
    const block=before.match(/(?:\/\*\*[\s\S]*?\*\/|(?:\s*\/\/\/[^\n]*\n)+)\s*$/)?.[0] || "";
    return {name:match[1],signature:match[0].slice(0,-1).replace(/\s+/g," ").trim(),notes:block.replace(/\/\*\*|\*\/|^\s*\* ?|^\s*\/\/\/ ?/gm,"").trim()};
  });
  const title=source.match(/@title\s+([^\n]+)/)?.[1]?.trim() || path.basename(file,".sol");
  const notice=source.match(/@notice\s+([^\n]+)/)?.[1]?.trim() || "Source-defined protocol component. Read its interface and authorization checks before integrating.";
  const declarations=[...source.matchAll(/^\s*(?:event|error|enum|struct)\s+\w+[^;{]*[;{]|^\s*(?:uint\d*|address|bytes32|bool|string)\s+public[^;]*;/gm)].map((match)=>match[0].trim());
  return {name:path.basename(file,".sol"),path:relative,title,notice,functions,declarations,source};
});
const guideFiles=["CURRENT-RELEASE.md","ARCHITECTURE.md","AUTHORITY-MAP.md","ROLES.md","REPUTATION-AND-PROGRESSION.md","INVARIANTS.md","CONFIG.md","UPGRADES.md","TREASURY.md","TESTING.md","SECURITY.md","KNOWN-LIMITATIONS.md","DEPENDENCY-SECURITY.md","V2.4-PROTOCOL-REVENUE.md","V2.4-HISTORICAL-ACCOUNTING.md","V2.3-BACKER-MILESTONES-SPEC.md"];
const guides=guideFiles.map((file)=>({file,title:file.replace(/\.md$/,"").replaceAll("-"," "),markdown:committed(`docs/${file}`)}));
const output=path.resolve(import.meta.dirname,"../assets/reference");mkdirSync(output,{recursive:true});
writeFileSync(path.join(output,"core-snapshot.json"),JSON.stringify({revision,capturedOn:"2026-11-27",contracts,guides}));
console.log(`Pinned ${contracts.length} source files and ${guides.length} source guides at ${revision}.`);
