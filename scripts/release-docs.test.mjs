import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { docs } from "../assets/docs-data.js";

const paper = readFileSync(new URL("../whitepaper/BERTDAO-Protocol-Whitepaper.html", import.meta.url), "utf8");
const candidates = docs.filter((doc) => doc.legacySection === "BERT V2.4 / Arc Testnet rollout");

test("documentation retains unique routes and three rollout pages with receipt-backed activation", () => {
  assert.equal(new Set(docs.map((doc) => doc.slug)).size, docs.length);
  assert.equal(candidates.length, 3);
  for (const doc of candidates) {
    assert(/active policy|policy active|policy is active|activation transaction|activation is confirmed|policy activation is confirmed/i.test(doc.content));
    assert(/74359134/.test(doc.content));
  }
});
test("candidate navigation links resolve without replacing deployed V2/V3 references", () => {
  const slugs = new Set(docs.map((doc) => doc.slug));
  for (const doc of candidates) {
    for (const [, target] of doc.content.matchAll(/href="#([^"]+)"/g)) assert(slugs.has(target), `Unknown route: ${target}`);
  }
  assert(slugs.has("v2-overview"));
  assert(slugs.has("v3-overview"));
  assert(docs.find((doc) => doc.slug === "v2-overview").content.includes("V2.4 is installed on Arc Testnet"));
});
test("approved testnet fee/recipient terms and recovery limits remain distinct from custody", () => {
  const text = candidates.map((doc) => doc.content).join("\n");
  assert(text.includes("20% share of eligible earned fees"));
  assert(text.includes("0xA4B0a01dB1d68D4CDB007F78bAB63Cb4ebd814bF"));
  assert(text.includes("100% of Treasury receipts"));
  assert(text.includes("48 real hours"));
  assert(text.includes("No investor equity"));
  assert(text.includes("permanently strand"));
  assert(text.includes("readyToBroadcast: false"));
});
test("one whitepaper distinguishes installed contracts, activated policy and pending public pilot", () => {
  assert(paper.includes("Revision 1.4.2"));
  assert(paper.includes("27 November 2026, 10:03:38 UTC"));
  assert(paper.includes("74359134"));
  assert(paper.includes("FundingPool 2.0.0 is installed"));
  assert(paper.includes("26 November 2026, 22:03:24 UTC"));
  assert(paper.includes("public revenue pilot remains pending"));
  assert(paper.includes('id="v2-4-candidate"'));
  assert(paper.includes("20% of eligible earned fees"));
  assert(paper.includes("every public wallet/GrantManager flow"));
  assert(paper.includes("Version 1.3.2") === false);
  assert.equal(readFileSync(new URL("../whitepaper/BERTDAO-Protocol-Whitepaper.pdf", import.meta.url)).subarray(0, 5).toString(), "%PDF-");
});
