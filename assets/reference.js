const escape = (text) => String(text).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
import snapshot from "./reference/core-snapshot.json" with {type:"json"};
const base = `https://github.com/Tenyokj/bert-core-arc/blob/${snapshot.revision}/`;
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-$/," ").trim();
const sourceLink=(file)=>`${base}${file}`;

function inline(text) {
  const links=[];
  const linked=text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>{
    const safe=/^https?:\/\//.test(url)?url:new URL(url,sourceLink("docs/README.md")).href;
    links.push(`<a href="${escape(safe)}">${escape(label)}</a>`);return `@@LINK${links.length-1}@@`;
  });
  return escape(linked).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/@@LINK(\d+)@@/g,(_,n)=>links[n]);
}
function markdown(text) {
  const lines=text.split("\n");let html="",code=null,buffer=[],list="";
  const closeList=()=>{if(list){html+=`</${list}>`;list="";}};
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(line.startsWith("```")){closeList();if(code!==null){html+=`<pre><code data-language="${escape(code || "Text")}">${escape(buffer.join("\n"))}</code></pre>`;code=null;buffer=[];}else code=line.slice(3).trim();continue;}
    if(code!==null){buffer.push(line);continue;}
    if(!line.trim()){closeList();continue;}
    if(/^\|/.test(line)){
      closeList();const rows=[];while(i<lines.length&&/^\|/.test(lines[i])){if(!/^\|[\s:|-]+\|$/.test(lines[i])) rows.push(lines[i].replace(/^\||\|$/g,"").split("|").map((cell)=>cell.trim()));i++;}i--;
      html+="<table>"+rows.map((row,n)=>`<tr>${row.map(cell=>`<${n?'td':'th'}>${inline(cell)}</${n?'td':'th'}>`).join("")}</tr>`).join("")+"</table>";continue;
    }
    const heading=line.match(/^(#{1,6})\s+(.*)/);
    if(heading){closeList();const level=Math.min(heading[1].length+1,4);html+=`<h${level}>${inline(heading[2])}</h${level}>`;continue;}
    const item=line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)/);
    if(item){const type=/^\s*\d/.test(line)?"ol":"ul";if(list!==type){closeList();list=type;html+=`<${type}>`;}html+=`<li>${inline(item[1])}</li>`;continue;}
    closeList();const paragraph=[line];
    while(i+1<lines.length && lines[i+1].trim() && !/^(?:\s*[-*] |\s*\d+\. |#|\||```)/.test(lines[i+1])) paragraph.push(lines[++i]);
    html+=`<p>${inline(paragraph.join(" "))}</p>`;
  }
  closeList();if(code!==null)html+=`<pre><code>${escape(buffer.join("\n"))}</code></pre>`;return html;
}
const summaries={
  IdeaRegistryUpgradeable:"Global proposal intake: author bonds, metadata, minimum funding targets and committed milestone plans. A registered idea is not a paid grant.",
  VotingSystemUpgradeable:"Global round selection and idea-specific financial pledges. Round snapshots preserve fee and milestone policy; settlement is not completion.",
  FundingPoolUpgradeable:"V2 custody and category accounting: pledge and grant escrow, refunds, reserve and eligible earned fee revenue. Its proxy upgrade authority remains a trust boundary.",
  GrantManagerUpgradeable:"V2 grant lifecycle and timed proof review. New backer-governed rounds use 20/40/40; legacy reviewer-governed rounds retain 30/40/30.",
  ProtocolRevenueTreasury:"Immutable pool/token/beneficiary split. Permissionless collect and release relay fixed entitlements, not arbitrary team withdrawals or investor shares.",
  PoPVerifierUpgradeable:"Signed attestation verification with deployment-specific trusted signer/provider policy. A Demo record is not a proof of unique personhood.",
  VoterProgressionUpgradeable:"Global winning participation counters and earned role thresholds. These counters are not token balances or Community-local permissions.",
  ReputationSystemUpgradeable:"Authorized reputation score bookkeeping. A score does not represent escrow, vote weight or a financial claim.",
  RolesRegistryUpgradeable:"Global role grants, revocations and system-actor authority. Treat administrative and automatic grant permissions as explicit trust boundaries.",
  CommunityFactory:"Community reservation, binding validation and activation. Factory-qualified IDs identify instances; its deployers determine which immutable module generation is created.",
  CommunityHub:"The public route for Community writes. It binds local modules, governance and execution paths to one Community rather than granting global authority.",
  CommunityTreasury:"Local custody with separate stakes, bonds, voting funds, milestone reserves, validator rewards and free execution balance. Only specific authorized paths move a category.",
  CommunityMembershipModule:"Community-local roles, member stake/exit and Admin role-incarnation nonces. Removing and reappointing an Admin must not revive stale payment approval.",
  CommunityProposalModule:"Local Admin/Member proposal intake, validation state and bonds. Proposal validation is not execution proof review.",
  CommunityVotingModule:"Binary and Slate vote attribution, settlement and winning-cohort creation. Financial contribution and later review eligibility are separate concerns.",
  CommunityMilestoneManager:"Execution proof, review, correction, fresh Admin tranche authorization and expiry. Manager2.0.1 fixes correction liveness; old deployed Managers retain old behavior.",
  CommunityWinnerSnapshot:"Sealed winning-supporter attribution. Review weight/count excludes the execution recipient in patched Managers while the financial refund denominator retains its eligible contribution.",
};
export const contractDocs=snapshot.contracts.map((item)=>{
  const title=item.name;
  const section="Contract reference";
  const group=item.path.includes("/V3/")?"Community components":item.path.includes("/interfaces/")?"Global interfaces":"Global components";
  const summary=summaries[title] || item.notice;
  return {slug:`contract-${title.toLowerCase()}`,section,group,title,summary,tags:["solidity",title,...item.functions.map(fn=>fn.name)],content:`<p class="eyebrow">Source reference / ${escape(group)}</p><h1>${escape(title)}</h1><p class="lead">${escape(summary)}</p><div class="callout info">Source snapshot: ${snapshot.capturedOn}, revision <code>${snapshot.revision.slice(0,7)}</code>. This describes this source, not every historical deployment. <a href="${sourceLink(item.path)}">Inspect the pinned Solidity file</a>.</div><h2>Responsibilities and boundaries</h2><p>${escape(item.notice)}</p><p>For user entry points and accounting context read <a href="#protocol-map">the protocol architecture</a>, <a href="#global-roles-progression">role scopes</a> and <a href="#security-and-trust">trust assumptions</a>. Call the deployed interface for the selected version; do not send a transaction just because a method appears in source.</p><h2>Public and external functions</h2><p>Signatures below are extracted from explicitly declared functions; generated getters and inherited APIs may also exist. View/pure entries read state. A mutating function still requires its documented caller, role, lifecycle and timing guards.</p>${item.functions.map(fn=>`<details><summary><code>${escape(fn.name)}</code></summary><pre><code data-language="Solidity">${escape(fn.signature)}</code></pre>${fn.notes?`<pre><code data-language="NatSpec">${escape(fn.notes)}</code></pre>`:"<p>No adjacent NatSpec was found. Inspect the implementation and its modifiers; no access policy is inferred.</p>"}</details>`).join("") || "<p>This file declares types, helpers or inherited behavior rather than a standalone user-facing function list.</p>"}<h2>Events, errors and public declarations</h2><pre><code data-language="Solidity">${escape(item.declarations.join("\n") || "See linked source for declarations and inherited getters.")}</code></pre><h2>Read the implementation</h2><details><summary>Expand pinned Solidity source</summary><pre><code data-language="Solidity">${escape(item.source)}</code></pre></details><p class="source-note">Source: <a href="${sourceLink(item.path)}">${escape(item.path)}</a>. Interface listings are generated; their completeness is not an ABI compatibility or safety guarantee.</p>`};
});
export const sourceGuideDocs=snapshot.guides.map((guide)=>({slug:`source-${slug(guide.file.replace(/\.md$/,""))}`,title:guide.title,section:"Source guides",summary:`Pinned Core guide: ${guide.file}. Read dated and historical statements in their original scope.`,tags:["source",guide.title],content:`<p class="eyebrow">Detailed source guide</p><h1>${escape(guide.title)}</h1><div class="callout info">Pinned at ${snapshot.revision.slice(0,7)} on ${snapshot.capturedOn}. Historical snapshots and future/readiness conditions inside this document are not fresh onchain checks. <a href="${sourceLink(`docs/${guide.file}`)}">Original source</a>.</div>${markdown(guide.markdown)}`}));
export const referenceRevision=snapshot.revision;
