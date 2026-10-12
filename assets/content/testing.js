export const testingDocs = [
  {
    slug: "contributor-testing-hub",
    section: "Testing & contributing",
    group: "Start here",
    title: "Contributor testing hub",
    summary: "A reproducible entry point for protocol QA, frontend testing, indexer operations, and security research.",
    tags: ["testing", "contributors", "qa", "security", "v2.3", "v3.1"],
    content: `
      <p class="eyebrow">BERT / Contributor program</p><h1>Test the invariant.<br /><span>Keep the evidence.</span></h1>
      <p class="lead">BERT is in active Arc Testnet development. External contributors help find broken permissions, accounting errors, liveness failures and confusing wallet UX before any mainnet proposal. A useful result is reproducible: it names the commit, chain, contracts, actor, transaction, expected invariant and observed result.</p>
      <div class="callout warning"><strong>Testnet only.</strong> Use Arc Testnet assets or an isolated local Hardhat chain. Do not use real funds, real keys, seed phrases or production identity credentials. Demo PoP tests a real onchain access gate, not personhood or Sybil resistance.</div>
      <h2>Choose a contribution lane</h2>
      <div class="doc-cards three-up"><a href="#tester-local-lab" data-doc-link class="doc-card"><span class="mini-icon">01</span><h3>Protocol QA</h3><p>Replay V2.3 and V3.1 lifecycle, accounting and role invariants locally or on Arc Testnet.</p><b>Open local lab →</b></a><a href="#tester-product-qa" data-doc-link class="doc-card"><span class="mini-icon">02</span><h3>dApp and indexers</h3><p>Test wallet changes, allowances, receipts, stale RPC state and indexer lag.</p><b>Open product QA →</b></a><a href="#tester-security-reporting" data-doc-link class="doc-card"><span class="mini-icon">03</span><h3>Security research</h3><p>Probe authorization, accounting, liveness, token behavior and upgrade boundaries.</p><b>Open security scope →</b></a></div>
      <h2>Minimum evidence standard</h2>
      <ol class="numbered-flow"><li><strong>State environment.</strong><span>Commit SHA, local or Arc chain ID, and relevant addresses.</span></li><li><strong>Name actor.</strong><span>Wallet and intended role: Admin, Member, Validator, supporter or unrelated account.</span></li><li><strong>Replay exact steps.</strong><span>Commands, UI actions, calldata or minimal PoC.</span></li><li><strong>Show delta.</strong><span>Transaction hash, revert, direct read, balance change, log or screenshot.</span></li><li><strong>Name broken rule.</strong><span>Authorization, accounting, liveness, privacy, or UX invariant.</span></li></ol>
      <h2>Current scope</h2>
      <table><thead><tr><th>Surface</th><th>Current target</th><th>What success proves</th></tr></thead><tbody><tr><td>V2.3</td><td>Conditional pledge funding and backer milestones</td><td>Losing pledges are not redirected; winner delivery is reviewable.</td></tr><tr><td>V3.1</td><td>Modular Community Layer</td><td>Four governance lanes, isolated Treasury buckets, and 20 / 40 / 40 delivery.</td></tr><tr><td>Frontend</td><td>Next.js dApp</td><td>Correct chain/address use and no false transaction success.</td></tr><tr><td>Indexers</td><td>V2/V3 Graph deployments</td><td>Historical discovery reconciles with live reads.</td></tr></tbody></table>
      <p>The complete commands and reporting template live in the <a href="https://github.com/Tenyokj/bert-core-arc/blob/main/docs/TESTING.md" target="_blank" rel="noreferrer">Contributor Testing Guide</a>.</p>
    `,
  },
  {
    slug: "tester-local-lab",
    section: "Testing & contributing",
    group: "Start here",
    title: "Local V3.1 protocol lab",
    summary: "Deploy a disposable V2 + V3.1 stack, mint MockUSDC, issue local PoP records, and test eight explicit roles.",
    tags: ["hardhat", "localhost", "e2e", "mock-usdc", "pop", "v3.1"],
    content: `
      <p class="eyebrow">Contributor testing / Local environment</p><h1>One disposable chain.<br /><span>Eight explicit roles.</span></h1>
      <p class="lead">The local lab deploys the real BERT contract graph to Hardhat chain ID <code>31337</code>, then provides MockUSDC and local-only signed PoP records. The dApp uses direct RPC reads, so no backend or local subgraph is required.</p>
      <div class="callout danger"><strong>Environment boundary.</strong> Restarting Hardhat deletes every deployed address and balance. Never reuse previous MetaMask account labels: verify addresses against the current node. Never import a real wallet into this lab.</div>
      <h2>Wallet roles</h2>
      <table><thead><tr><th>Wallet</th><th>Role</th><th>What it validates</th></tr></thead><tbody><tr><td>#0</td><td>Creator, Admin, Administration execution wallet</td><td>Factory creation, protected Admin actions and proof submission.</td></tr><tr><td>#1</td><td>Second Admin</td><td>Two-of-N control, pause/resume and cancellation.</td></tr><tr><td>#2</td><td>Validator</td><td>Member proposal validation and Validator rewards.</td></tr><tr><td>#3 / #4</td><td>Member proposal authors</td><td>Binary and Slate author/bond paths.</td></tr><tr><td>#5 / #6 / #7</td><td>Winning supporters</td><td>Snapshot review electorate, quorum and refunds.</td></tr></tbody></table>
      <h2>Required sequence</h2>
      <div class="code-sample"><div class="code-sample-header"><span>Core local setup</span><button type="button" class="code-copy-button" data-copy-code="tester-local-sequence" data-copy-label="Copy">Copy</button></div><pre><code id="tester-local-sequence">npx hardhat node
npx hardhat run scripts/deploy/deploy-proxies.ts --network localhost
npx hardhat run scripts/deploy/deploy-v3-1.ts --network localhost
npx hardhat run scripts/deploy/configure-v3-1-funding-pool.ts --network localhost
npx hardhat run scripts/local/mint-v3-test-usdc.ts --network localhost
npx hardhat run scripts/local/verify-v3-test-wallets.ts --network localhost</code></pre></div>
      <p>The Factory authorization step is a security boundary. FundingPool accepts defined Community reserve inflows only from Treasuries activated by an explicitly approved Factory. V3.0 and V3.1 approvals coexist; if the V3.1 link is missing, reserve-routing E2E coverage is incomplete.</p>
      <h2>Use time travel, not weaker policy</h2><p>V3.1 keeps a one-day minimum milestone review. Advance the local clock for testing; do not modify Solidity timing simply to make a demo faster.</p>
      <div class="callout info"><strong>Exit criterion.</strong> Cover all four V3.1 lanes, one completed 20 / 40 / 40 execution plan, one failed-plan supporter refund, and negative eligibility checks.</div>
    `,
  },
  {
    slug: "tester-v2-v3-matrix",
    section: "Testing & contributing",
    group: "Protocol matrix",
    title: "V2.3 and V3.1 test matrix",
    summary: "Concrete functional and negative cases for funding, governance, Treasury accounting, milestones, and refunds.",
    tags: ["v2.3", "v3.1", "matrix", "refunds", "milestones", "treasury"],
    content: `
      <p class="eyebrow">Contributor testing / Protocol matrix</p><h1>Happy paths are not<br /><span>enough evidence.</span></h1>
      <p class="lead">Every terminal protocol action needs a positive assertion, a negative assertion and an accounting assertion. Read contracts directly before and after each step; a UI label or raw ERC-20 transfer is not sufficient evidence.</p>
      <h2>V2.3: conditional pledge funding</h2>
      <table><thead><tr><th>ID</th><th>Action</th><th>Expected invariant</th></tr></thead><tbody><tr><td>V2-01</td><td>Create idea with author bond and minimum net target.</td><td>Bond and target store once in USDC base units; malformed intake reverts.</td></tr><tr><td>V2-02</td><td>Open eligible round and pledge to one candidate.</td><td>Candidate composition respects limits; pledge stays attributable to one voter/idea.</td></tr><tr><td>V2-03</td><td>Settle viable winner.</td><td>Only winner pledge capital becomes grant budget after disclosed fee policy.</td></tr><tr><td>V2-04</td><td>Claim loser or no-winner refund.</td><td>Each voter pulls own entitlement once; no pledge funds another idea.</td></tr><tr><td>V2-05</td><td>Review milestone, correction, expiry, failure.</td><td>Unreleased capital follows defined backer/refund policy; no duplicate release.</td></tr></tbody></table>
      <h2>V3.1: four governance lanes</h2>
      <table><thead><tr><th>Lane</th><th>Entry route</th><th>Critical checks</th></tr></thead><tbody><tr><td>Admin Binary</td><td>Admin creates; Members vote YES/NO.</td><td>No Validator review or reward share; YES winner creates plan.</td></tr><tr><td>Member Binary</td><td>Member locks bond; Validators decide; Members vote.</td><td>Only Validators decide once; author cannot self-vote.</td></tr><tr><td>Admin Slate</td><td>Admin creates candidates and round.</td><td>One selection per Member; deterministic winner; one settlement.</td></tr><tr><td>Member Slate</td><td>Member candidates require validation before round.</td><td>Unapproved candidate cannot enter; winner starts same plan lifecycle.</td></tr></tbody></table>
      <h2>Execution-plan checks</h2>
      <div class="contract-rail"><div><b>20%</b><small>SETTLEMENT</small><strong>Reserved and released once</strong><span>Treasury reserves winner budget, then releases only first tranche to Administration execution wallet.</span></div><div><b>40%</b><small>MILESTONE ONE</small><strong>Supporter review</strong><span>Only sealed supporters review. Weight quorum is 40%; approval is two-thirds.</span></div><div><b>40%</b><small>MILESTONE TWO</small><strong>Terminal delivery</strong><span>Second proof follows same electorate. Failure makes only unspent funds refundable.</span></div></div>
      <table><thead><tr><th>Negative case</th><th>Expected result</th></tr></thead><tbody><tr><td>Unrelated Member, NO voter, author, or executor reviews proof.</td><td>Revert: winner snapshot eligibility cannot be bypassed.</td></tr><tr><td>Review lacks quorum.</td><td>Only documented grace route opens; silence never auto-pays executor.</td></tr><tr><td>First proof fails.</td><td>One correction after cooldown.</td></tr><tr><td>Corrected proof fails or proof expires.</td><td>Plan fails; unreleased reserve is pro-rata claimable only by winner supporters.</td></tr><tr><td>Community pauses during deadline.</td><td>Community clock freezes voting, proof, review and action windows.</td></tr></tbody></table>
    `,
  },
  {
    slug: "tester-product-qa",
    section: "Testing & contributing",
    group: "Product and infrastructure",
    title: "dApp, backend and indexer QA",
    summary: "Test chain selection, allowances, receipts, direct reads, Demo PoP, and asynchronous indexer behavior.",
    tags: ["frontend", "backend", "subgraph", "wallet", "rpc", "qa"],
    content: `
      <p class="eyebrow">Contributor testing / Product quality</p><h1>A receipt is truth.<br /><span>A spinner is not.</span></h1>
      <p class="lead">The dApp may use indexers for history and discovery, but it must read live contract state before a protected write and wait for a confirmed receipt before reporting success. Test the failures normal users actually see.</p>
      <table><thead><tr><th>Test</th><th>Expected behavior</th></tr></thead><tbody><tr><td>Wrong chain</td><td>Write CTA switches/disables safely; it never writes to another network.</td></tr><tr><td>Account switch</td><td>Roles, balances, allowance and eligible actions refresh.</td></tr><tr><td>Allowance revoked</td><td>UI identifies actual spender: FundingPool or specific Community Treasury.</td></tr><tr><td>Wallet rejection</td><td>No optimistic success state, no fake balance delta, clear retry path.</td></tr><tr><td>Receipt revert</td><td>Direct reads refresh and useful prerequisite/error is shown.</td></tr><tr><td>Indexer lag</td><td>History may be delayed; permission, balance and settlement never rely only on subgraph.</td></tr></tbody></table>
      <h2>Demo PoP and indexing</h2><p>Test backend failure, wallet rejection, invalid/expired Demo PoP payload and successful verifier receipt separately. A backend response alone never grants access. For each indexed Community/proposal/vote/plan/refund event, compare subgraph data to current Factory, Hub, or Treasury reads. Pin the versioned deployment block; Arc RPC history can be pruned.</p>
    `,
  },
  {
    slug: "tester-security-reporting",
    section: "Testing & contributing",
    group: "Security research",
    title: "Security scope and reporting",
    summary: "Responsible research boundaries for authorization, accounting, liveness, token behavior, and upgradeability.",
    tags: ["security", "slither", "audit", "disclosure", "reentrancy", "upgrades"],
    content: `
      <p class="eyebrow">Contributor testing / Security</p><h1>Prove impact.<br /><span>Do not create it.</span></h1>
      <p class="lead">High-value findings show unauthorized movement or freezing of funds, broken role boundaries, duplicate releases/refunds, invalid state transitions, liveness loss, storage corruption, or a realistic identity-policy bypass.</p>
      <h2>Research targets</h2>
      <table><thead><tr><th>Domain</th><th>Question</th></tr></thead><tbody><tr><td>Authorization</td><td>Can unrelated wallet, wrong module, V3.0 deployment, or removed role holder execute a protected action?</td></tr><tr><td>Accounting</td><td>Can one USDC unit be counted, released, refunded twice, or stranded?</td></tr><tr><td>Execution plans</td><td>Can executor bypass review, self-review, alter snapshot, or claim failed-plan refund?</td></tr><tr><td>Token behavior</td><td>Can ERC-20 callbacks reenter join, vote, settlement, tranche, or refund paths?</td></tr><tr><td>Upgradeability</td><td>Can storage, initializer, proxy-admin, or dependency drift corrupt live state?</td></tr><tr><td>Liveness</td><td>Can an actor block settlement, refunds, exits, review finalization, or recovery?</td></tr></tbody></table>
      <div class="code-sample"><div class="code-sample-header"><span>Baseline</span><button type="button" class="code-copy-button" data-copy-code="tester-security-baseline" data-copy-label="Copy">Copy</button></div><pre><code id="tester-security-baseline">npm install
npx hardhat compile
npx hardhat test
npx hardhat --coverage
slither . --filter-paths "node_modules|test|legacy"</code></pre></div>
      <div class="callout danger"><strong>Responsible disclosure.</strong> Do not phish, impersonate, attack public infrastructure, use real funds, or publish a live exploit path. For high-impact issues, stop at minimum proof and use the repository security contact rather than a public issue.</div>
      <h2>Report format</h2><pre><code>Title:
Area: V2.3 / V3.1 / frontend / backend / indexer / operations
Environment: commit SHA, chain ID, deployment addresses
Actor and preconditions:
Exact reproduction:
Expected result:
Actual result:
Evidence: tx hashes, reads, logs, screenshots, PoC/test
Impact and suggested severity:</code></pre>
    `,
  },
];
