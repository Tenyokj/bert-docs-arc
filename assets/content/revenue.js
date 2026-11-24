export const revenueDocs = [
  {
    slug: "v2-4-transparent-treasury",
    section: "BERT V2.4 / Unreleased candidate",
    group: "Treasury and revenue",
    title: "Transparent treasury: what changes",
    summary: "The undeployed V2.4 candidate separates custody, reserve and earned protocol revenue without investor shares or APY.",
    tags: ["v2.4", "unreleased", "treasury", "revenue", "accounting", "usdc"],
    content: `
      <p class="eyebrow">V2.4 / Local source candidate</p><h1>Custody is not income.<br /><span>Show each purpose.</span></h1>
      <div class="callout warning"><strong>Not deployed.</strong> Updated 24 November 2026. Public contracts remain V2.3 + V3.2.1. The V2.4 FundingPool 2.0.0, immutable ProtocolRevenueTreasury 1.0.0, client panels and V2 indexer are prepared locally. This page does not announce an upgrade, an active revenue policy or mainnet readiness.</div>
      <p class="lead">FundingPool holds money for different obligations. A token balance is not the team's earnings, an investor's ownership share or a withdrawable depositor account. V2.4 adds transparent accounting and a separate destination for a configured share of earned success fees, without changing the author's net milestone schedule.</p>
      <h2>Read seven distinct quantities</h2>
      <table><thead><tr><th>Accounting field</th><th>Meaning</th></tr></thead><tbody><tr><td>Actual custody</td><td>USDC token balance at the pool.</td></tr><tr><td>Recorded custody</td><td>Total accounted funds, inclusive of reserve and uncollected earned revenue.</td></tr><tr><td>Protocol reserve</td><td>Protocol allocation capital, not withdrawable team income.</td></tr><tr><td>Pending revenue</td><td>Earned receiver credits still held by FundingPool.</td></tr><tr><td>Other accounted funds</td><td>Recorded custody minus reserve and pending revenue; not a new exhaustive ledger of every historical obligation.</td></tr><tr><td>Unrecorded surplus</td><td>Direct token transfers not yet accounted; never automatically team income.</td></tr><tr><td>Shortfall</td><td>Recorded custody exceeding actual tokens; an error to investigate, not zeroed away.</td></tr></tbody></table>
      <h2>What earns revenue?</h2>
      <p>Only fees vested by actual payouts of an opted-in round, limited to its recorded winning-pledge-funded portion. Direct pool deposits, author bonds, slashes, V3 reserve inflows, refunds, grant principal and reserve-funded top-ups do not become the team's fee base. Existing rounds keep their original snapshotted policy.</p>
      <div class="formula-box"><code>earned Treasury revenue = eligible earned success fee x round Treasury share</code></div>
      <h2>Approved testnet terms, not yet active</h2>
      <p>On 24 November the owner approved a 20% share of eligible earned fees for the testnet Treasury, not 20% of custody. With 1,000 USDC of winning pledges and a 5% round fee, the author still receives 950 USDC over 20/40/40. Complete execution vests 50 USDC in fees: 10 USDC to Treasury and 40 USDC to reserve. Only the paid portion vests if execution stops early; unpaid gross escrow follows the existing refunds. Integer token-unit rounding applies. These terms are not publicly activated.</p>
      <h2>What this release does not add</h2>
      <ul><li>No investor equity, pool shares, guaranteed returns or interest-bearing deposits.</li><li>No access to 20% of pool custody: a fee share applies only to eligible earned fees.</li><li>No changes to V2.3 backer review, legacy-round 30/40/30, V3 execution, validator rewards or Community Admin quorum.</li><li>No V3 Factory replacement and no conversion of old reserves into revenue.</li></ul>
      <div class="doc-cards two-up compact"><a href="#v2-4-revenue-policy" data-doc-link class="doc-card"><h3>Policy and fixed payees</h3><p>48-hour notice, future rounds, collection and immutable beneficiaries.</p></a><a href="#v2-4-release-and-testing" data-doc-link class="doc-card"><h3>Release and test boundaries</h3><p>What has passed locally and what still blocks rollout.</p></a></div>
    `,
  },
  {
    slug: "v2-4-revenue-policy",
    section: "BERT V2.4 / Unreleased candidate",
    group: "Treasury and revenue",
    title: "Revenue policy and fixed beneficiaries",
    summary: "Future-round fee policy, the approved 48-hour notice and ownerless Treasury payments; not a deployed earning product.",
    tags: ["v2.4", "policy", "timelock", "beneficiaries", "immutable", "risks"],
    content: `
      <p class="eyebrow">V2.4 / Undeployed policy</p><h1>Announce the fee split.<br /><span>Do not rewrite old rounds.</span></h1>
      <div class="callout warning"><strong>Source versus deployment.</strong> The owner approved the candidate's 48-hour policy delay on 24 November 2026. This is not a scheduled public activation. There is no new deployed Treasury address or verified V2.4 upgrade receipt yet.</div>
      <h2>Two different percentages</h2>
      <p>The pool's <code>shareBps</code> selects the fraction of eligible earned fees assigned to Treasury. Inside that Treasury, fixed beneficiary shares distribute its receipts and must sum to 10,000 bps. A beneficiary with 100% of Treasury does not own 100% of the pool or grant budget.</p>
      <h2>Four separate transitions</h2>
      <ol class="numbered-flow"><li><strong>Schedule.</strong> Protocol Admin announces a verified Treasury address and fee share. Cancel or replacement does not change the current policy.</li><li><strong>Wait and activate.</strong> After 48 real hours anyone may execute the exact pending policy. Replacing it restarts the delay. No wait starts merely by reading docs or running local tests.</li><li><strong>Snapshot and earn.</strong> Newly opened rounds fix their own receiver/share. Later policy changes cannot redirect their accrued credits. Earnings vest alongside actual grant payouts.</li><li><strong>Collect and release.</strong> Anyone may relay collection, which pays only the original Treasury. Anyone may trigger a beneficiary payment, which pays only that fixed address, never the relayer.</li></ol>
      <h2>Immutable receiver, upgradeable pool</h2>
      <p>ProtocolRevenueTreasury is not a proxy and has no owner, arbitrary rescue, recipient rotation or unrestricted call mechanism. It fixes its pool, token and 1-16 unique beneficiaries at deployment. A new Treasury can serve future rounds but cannot rewrite old entitlements. Verify bytecode and constructor arguments: matching identity getters alone do not establish trusted code.</p>
      <p>The selected testnet beneficiary is <code>0xA4B0a01dB1d68D4CDB007F78bAB63Cb4ebd814bF</code>, with 100% of Treasury receipts. It is also the testnet administrator; this is not a claim of decentralized control or a recommended mainnet custody arrangement. The actual fee share and final deployment evidence belong to the reviewed core release configuration.</p>
      <h2>Recovery limits are deliberate</h2>
      <ul><li>A lost key or blocked beneficiary may permanently strand its entitlement; no team override recovers it.</li><li>USDC issuer freeze/blocklist powers remain. Exact-transfer checks do not remove issuer control.</li><li>FundingPool pause blocks collection, but Treasury can still pay previously collected funds if token rules permit.</li><li>The 48-hour delay protects fee-policy changes, not ProxyAdmin upgrades or every existing Admin action.</li><li>Scheduling the first nonzero policy pins the revenue token even if that schedule is later cancelled.</li></ul>
      <p>Immediately after an upgrade, receiver/share remain zero without a revenue initializer. Enabling the approved policy is a separate, delayed operation. Never run a blind downgrade after accrual: old code does not understand the new earmarked credits.</p>
    `,
  },
  {
    slug: "v2-4-release-and-testing",
    section: "BERT V2.4 / Unreleased candidate",
    group: "Integration and rollout",
    title: "V2.4 rollout, indexing and test evidence",
    summary: "Bounded local evidence, offline release configuration and remaining acceptance/deployment gates.",
    tags: ["v2.4", "testing", "release", "graphql", "configuration", "security"],
    content: `
      <p class="eyebrow">V2.4 / Release engineering</p><h1>Local evidence first.<br /><span>Public receipts later.</span></h1>
      <div class="callout warning"><strong>Not deployed.</strong> Public contracts remain V2.3 + V3.2.1. Bounded browser, full native-Arc GrantManager and separate fresh-chain Graph Node replay/reorg checks pass. Fresh preflight, explicit deployment authorization and the public pilot are not complete.</div>
      <h2>Recorded checks</h2>
      <table><thead><tr><th>Scope</th><th>Evidence and limit</th></tr></thead><tbody>
      <tr><td>Core</td><td>268 local tests, populated-proxy/layout checks and a separate full native-Arc GrantManager run with 160 receipts. Not an independent audit or public upgrade.</td></tr>
      <tr><td>Custody inventory</td><td>Pinned block 73753950 reconciles 1,040 USDC deposits plus 100 USDC remaining author bonds. Explorer discovery checked against receipts; not an independent exhaustive scan and not a fresh upgrade preflight.</td></tr>
      <tr><td>Clients</td><td>106 mined UI transactions with MockUSDC and a local EIP-1193 test wallet. Combined V3/V2.4 tests pass in 3.9 minutes. Not the MetaMask extension or a native-Arc browser run.</td></tr>
      <tr><td>V2 indexer</td><td>87 root tests, ten mapping checks, seven toolchain tests and both WASM builds. Separate real Graph Node/Postgres acceptance passes 38-log agreement, restart, two-block reorg and clean replay on a fresh MockUSDC chain. This is not native Arc or public Graph synchronization.</td></tr>
      </tbody></table>
      <h2>Subsequent native execution checks</h2>
      <p>The separate Arc Foundry run passed 160 receipts: full 20/40/40 and cancellation after 0/20/60%, exact gas-adjusted native-USDC refunds/payments and 1.08 USDC collected/paid. The subsequent fresh MockUSDC fixture passed 169 receipts and real Graph Node discovery, exact 38-log agreement, restart, controlled reorg and clean-store replay. The earlier Arc fork cannot serve some historical fixture bytecode; that limitation is retained, not hidden or mislabeled as a passing native-Arc/Graph test. No Solidity change or public deployment was needed.</p>
      <h2>Indexer amounts must not double count</h2>
      <p><code>ProtocolRevenueAccrued</code> creates credit. Pool <code>ProtocolRevenueClaimed</code> reduces pending credit. Treasury <code>RevenueCollected</code> confirms that same transfer; it is not another expense. <code>RevenueReleased</code> records an actual fixed-payee payment. Earlier Treasury constructor payees are hydrated through bounded immutable getters, with discovery errors and observation start recorded explicitly.</p>
      <p>New entities include <code>ProtocolRevenueState</code>, <code>FundingRoundRevenue</code>, <code>ProtocolRevenueReceiver</code>, <code>RevenueBeneficiary</code> and <code>RevenueEvent</code>. Use bounded queries and verify sensitive state against pinned RPC reads. Missing legacy revenue data means unavailable, not invented zero. Public Graph endpoints and original start blocks are not replaced by this source draft.</p>
      <h2>Offline configuration review</h2>
      <pre><code>cd bert-core
node scripts/deploy/prepare-v2-4-release.mjs
node --test scripts/deploy/prepare-v2-4-release.test.mjs</code></pre>
      <p>The planner checks the draft against the manifest, split constraints and compiled runtime size/hash. It makes no RPC request, loads no signer and sends no transaction. Even a valid plan reports <code>readyToBroadcast: false</code>. A recorded address or approval flag is not live evidence or authorization.</p>
      <h2>Remaining gates</h2>
      <ol class="numbered-flow"><li>Review the approved configuration and bounded local acceptance evidence; do not invent a deployed Treasury address.</li><li>Review/merge the source changes while retaining browser, native-Arc and separate Graph test boundaries.</li><li>Perform a fresh pinned preflight, obtain separate authorization, rehearse the exact upgrade, then deploy and verify with revenue initially disabled.</li><li>Publish reviewed clients/indexer, schedule the approved policy, wait the actual 48-hour notice and verify activation plus the public pilot.</li></ol>
      <p>Slither findings and dependency advisories remain documented, not silently dismissed. The small FundingPool EIP-170 margin also needs a fresh size check after any source/compiler change. Public release is not mainnet approval.</p>
      <p>Canonical candidate source and detailed runbooks: <a href="https://github.com/Tenyokj/bert-core-arc" target="_blank" rel="noreferrer">core repository</a> and <a href="https://github.com/Tenyokj/bert-front-arc" target="_blank" rel="noreferrer">frontend/subgraph repository</a>. Local work may not appear on their default branches until reviewed and published.</p>
    `,
  },
];
