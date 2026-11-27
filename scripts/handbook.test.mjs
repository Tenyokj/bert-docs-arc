import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {docs} from "../assets/docs-data.js";
import {contractDocs,sourceGuideDocs,referenceRevision} from "../assets/reference.js";
import {handbookDocs} from "../assets/content/handbook.js";
const bySlug=new Map(docs.map(doc=>[doc.slug,doc]));
test("complete route registry has unique stable routes and substantive pages",()=>{
  assert.equal(bySlug.size,docs.length);
  assert.equal(docs.length,138);assert.equal(handbookDocs.length,19);
  for(const doc of docs){assert(doc.summary.length>20,doc.slug);assert(doc.content.includes("<h1>"),doc.slug);assert(doc.content.length>700,doc.slug);}
});
test("all internal handbook links resolve, including original integration bookmarks",()=>{
  for(const doc of docs)for(const [,target]of doc.content.matchAll(/href="#([^"]+)"/g))assert(bySlug.has(target.split(":")[0]),`${doc.slug} -> ${target}`);
  for(const slug of ["docs-home","v2-overview","v3-overview","v3-tranche-authorizations","v2-4-revenue-policy","arc-testnet-deployments","bert-console"])assert(bySlug.has(slug));
});
test("home offers four task routes, with honest testnet and verification limits",()=>{
  const home=bySlug.get("docs-home").content;
  assert.equal((home.match(/class="doc-card"/g)||[]).length,4);
  for(const text of ["no monetary value","not proof of personhood","V2.4","V3.2.1","whitepaper"])assert(home.includes(text));
});
test("source reference includes all global and Community families, not invented module APIs",()=>{
  assert.equal(contractDocs.length,53);assert.equal(sourceGuideDocs.length,16);assert.match(referenceRevision,/^[0-9a-f]{40}$/);
  for(const name of ["FundingPoolUpgradeable","ProtocolRevenueTreasury","RolesRegistryUpgradeable","VoterProgressionUpgradeable","PoPVerifierUpgradeable","ReputationSystemUpgradeable","CommunityHub","CommunityTreasury","CommunityMilestoneManager","CommunityWinnerSnapshot"])assert(bySlug.has(`contract-${name.toLowerCase()}`));
  const snapshot=JSON.parse(readFileSync(new URL("../assets/reference/core-snapshot.json",import.meta.url)));
  for(const item of snapshot.contracts)for(const fn of item.functions)assert(item.source.includes(`function ${fn.name}`));
});
test("handbook separates current rules, legacy behavior, refunds and future ideas",()=>{
  assert(bySlug.get("user-v2-delivery").content.includes("exact two-thirds"));
  assert(bySlug.get("user-v2-delivery").content.includes("30/40/30"));
  assert(bySlug.get("user-community-delivery").content.includes("seven active Community days"));
  assert(bySlug.get("user-pool-revenue").content.includes("20% of a qualifying fee"));
  assert(bySlug.get("future-direction").content.includes("candidate direction"));
  assert(bySlug.get("security-and-trust").content.includes("not an independent audit"));
});
test("retained operational guides use the current endpoint and payment handoffs",()=>{
  for(const doc of docs.filter(doc=>doc.legacySection))assert(!doc.content.includes('bert-arc-testnet/v0.3.0'),doc.slug);
  assert(bySlug.get('v2-4-revenue-policy').content.includes('Control Center / Revenue'));
  assert(bySlug.get('v2-4-release-and-testing').content.includes('first policy is already active'));
  assert(bySlug.get('tester-v2-v3-matrix').content.includes('Settlement pays nothing in V3.2.1'));
  assert(bySlug.get('v2-capital-accounting').content.includes('Treasury credit'));
});
