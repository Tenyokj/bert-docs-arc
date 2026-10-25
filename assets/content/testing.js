export const testingDocs = [
  {
    slug: "community-pilot",
    section: "Testing & contributing",
    group: "Start here",
    title: "Community pilot",
    summary: "A small, guided Arc Testnet pilot for groups that decide which proposals to support and review delivery.",
    tags: ["pilot", "community", "organizers", "arc", "testnet", "contributors"],
    content: `
      <p class="eyebrow">BERT / Community pilot</p><h1>Start with one decision.<br /><span>Not a protocol migration.</span></h1>
      <p class="lead">If your community has selected proposals and checked whether work was delivered, we want to learn how you do it today. BERT V3.2 is an open-source Arc Testnet prototype for community decisions and staged execution. We are looking for a few organizers willing to give honest feedback, not deposits or publicity.</p>
      <div class="callout warning"><strong>Testnet only.</strong> Do not move real funds or import a valuable wallet. Testnet assets have no monetary value. Demo PoP is not production personhood verification, and this pilot is not a security audit or mainnet launch.</div>
      <h2>Choose your starting point</h2>
      <div class="doc-cards three-up"><a href="https://bertdao-console.vercel.app" target="_blank" rel="noreferrer" class="doc-card"><span class="mini-icon">01</span><h3>Look, no wallet</h3><p>Explore indexed Communities and proposals in the read-only BERT Console. Data can lag the chain.</p><b>Open Console →</b></a><a href="https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/COMMUNITY-PILOT.md" target="_blank" rel="noreferrer" class="doc-card"><span class="mini-icon">02</span><h3>Discuss your process</h3><p>Read the pilot brief and six questions about your last real funding decision before trying a demo.</p><b>Read pilot brief →</b></a><a href="#tester-arc-testnet-kit" data-doc-link class="doc-card"><span class="mini-icon">03</span><h3>Try a testnet flow</h3><p>Only if it fits: use separate test wallets, run one Community decision and preserve receipts.</p><b>Open tester kit →</b></a></div>
      <h2>What the guided pilot covers</h2>
      <ol class="numbered-flow"><li><strong>Understand the current workflow.</strong><span>Tell us about the last proposal you handled, its voters, budget custody and delivery checks.</span></li><li><strong>Inspect a real testnet example.</strong><span>Find a Community and proposal in Console without connecting a wallet.</span></li><li><strong>Run one decision, if useful.</strong><span>Create a Community and run an Admin Binary proposal on Arc Testnet with valueless assets. This needs multiple wallets and may span a voting window.</span></li><li><strong>Report friction honestly.</strong><span>We need the confusing step, failed expectation or mismatched data, not a positive testimonial.</span></li></ol>
      <p>Onchain milestones take longer than a short call. We do not claim that a complete 20/40/40 execution plan can be tested in 15 minutes. For a full disposable E2E run, use the <a href="#tester-local-lab" data-doc-link>local lab</a> and time travel.</p>
      <h2>Want to participate or contribute?</h2><p>Organizers can request a guided pilot at <a href="mailto:bertdaoarc@gmail.com">bertdaoarc@gmail.com</a>. For technical findings, use the <a href="#contributor-testing-hub" data-doc-link>contributor testing hub</a> and open a focused issue in the affected repository. The first scoped task drafts are in <a href="https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/STARTER-ISSUES.md" target="_blank" rel="noreferrer">Core's contributor backlog</a>. Do not post wallet secrets, private contact details or exploitable findings publicly.</p>
    `,
  },
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
      <p>Organizing a group rather than testing code? Start with the <a href="#community-pilot" data-doc-link>Community pilot</a> and its read-only Console path.</p>
      <h2>Choose a contribution lane</h2>
      <div class="doc-cards three-up"><a href="#tester-arc-testnet-kit" data-doc-link class="doc-card"><span class="mini-icon">01</span><h3>Arc Testnet kit</h3><p>Use the current dApp, addresses, Graph endpoints and testnet evidence template.</p><b>Open public kit →</b></a><a href="#tester-local-lab" data-doc-link class="doc-card"><span class="mini-icon">02</span><h3>Protocol QA</h3><p>Replay V2.3 and V3.2 lifecycle, accounting and role invariants locally.</p><b>Open local lab →</b></a><a href="#tester-security-reporting" data-doc-link class="doc-card"><span class="mini-icon">03</span><h3>Security research</h3><p>Probe authorization, accounting, liveness, token behavior and upgrade boundaries.</p><b>Open security scope →</b></a></div>
      <h2>Minimum evidence standard</h2>
      <ol class="numbered-flow"><li><strong>State environment.</strong><span>Commit SHA, local or Arc chain ID, and relevant addresses.</span></li><li><strong>Name actor.</strong><span>Wallet and intended role: Admin, Member, Validator, supporter or unrelated account.</span></li><li><strong>Replay exact steps.</strong><span>Commands, UI actions, calldata or minimal PoC.</span></li><li><strong>Show delta.</strong><span>Transaction hash, revert, direct read, balance change, log or screenshot.</span></li><li><strong>Name broken rule.</strong><span>Authorization, accounting, liveness, privacy, or UX invariant.</span></li></ol>
      <h2>Current scope</h2>
      <table><thead><tr><th>Surface</th><th>Current target</th><th>What success proves</th></tr></thead><tbody><tr><td>V2.3</td><td>Conditional pledge funding and backer milestones</td><td>Losing pledges are not redirected; winner delivery is reviewable.</td></tr><tr><td>V3.2</td><td>Modular Community Layer</td><td>Four governance lanes, isolated Treasury buckets, and 20 / 40 / 40 delivery.</td></tr><tr><td>Frontend</td><td>Next.js dApp</td><td>Correct chain/address use and no false transaction success.</td></tr><tr><td>Indexers</td><td>V2/V3 Graph deployments</td><td>Historical discovery reconciles with live reads.</td></tr></tbody></table>
      <p>The complete commands and reporting template live in the <a href="https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/TESTING.md" target="_blank" rel="noreferrer">Contributor Testing Guide</a>.</p>
    `,
  },
  {
    slug: "tester-arc-testnet-kit",
    section: "Testing & contributing",
    group: "Start here",
    title: "Arc Testnet tester kit",
    summary: "Current public endpoints, deployment addresses, a safe role plan and the exact evidence expected from an Arc Testnet test run.",
    tags: ["arc", "testnet", "v2.3", "v3.1", "subgraph", "qa"],
    content: `
      <p class="eyebrow">Contributor testing / Arc Testnet</p><h1>One test at a time.<br /><span>Record the chain evidence.</span></h1>
      <p class="lead">Use this path when you want to test the deployed dApp without running local infrastructure. It is real Arc Testnet execution with valueless test assets. Start with a single role and one focused lifecycle transition, then compare the receipt with a direct read and the relevant subgraph record.</p>
      <h2>Public endpoints</h2>
      <table><thead><tr><th>Service</th><th>Value</th><th>Use</th></tr></thead><tbody><tr><td>dApp</td><td><a href="https://bertdao.vercel.app" target="_blank" rel="noreferrer">bertdao.vercel.app ↗</a></td><td>Reference V2/V3 test UI and Demo PoP flow.</td></tr><tr><td>Network</td><td>Arc Testnet / <code>5042002</code></td><td>Every wallet write must use this chain.</td></tr><tr><td>Public RPC</td><td><code>https://arc-testnet.drpc.org</code></td><td>Direct reads and manual reproduction.</td></tr><tr><td>V2 Graph endpoint</td><td><code>.../bert-arc-testnet/v0.3.0</code></td><td>V2 ideas, rounds and milestones.</td></tr><tr><td>V3.2 Graph endpoint</td><td><code>.../bert-v-3-1-arc-testnet/v3.2.1</code></td><td>Communities, modules, governance and milestones.</td></tr></tbody></table>
      <pre><code>V2_GRAPH=https://api.studio.thegraph.com/query/1742046/bert-arc-testnet/v0.3.0
V3_GRAPH=https://api.studio.thegraph.com/query/1742046/bert-v-3-1-arc-testnet/v3.2.1
V3_1_FACTORY=0xe16Cd61a21feA97393e6eEE3A7F7A26828021dD0
V3_1_FACTORY_START_BLOCK=66809847</code></pre>
      <h2>Recommended wallet plan</h2>
      <table><thead><tr><th>Wallet</th><th>V3.2 purpose</th><th>Do not combine with</th></tr></thead><tbody><tr><td>A</td><td>Community creator and initial Admin</td><td>Active Member or Validator.</td></tr><tr><td>B</td><td>Second Admin for quorum actions</td><td>Active Member or Validator.</td></tr><tr><td>C</td><td>Validator for Member-proposal review</td><td>Admin or active Member.</td></tr><tr><td>D/E/F</td><td>Three independent winning supporters</td><td>Author or execution recipient review. Use a separate G wallet for a Member-proposal author.</td></tr></tbody></table>
      <h2>V3.2 smoke sequence</h2>
      <ol class="numbered-flow"><li>Connect wallet A to Arc Testnet, complete Demo PoP and create a Community using the V3.2 Factory.</li><li>Confirm Factory activation, then record Hub, Treasury, Membership, Proposal, Voting and Milestone module addresses from the Hub.</li><li>Have wallets D/E/F join the Community; approve the Community Treasury, not FundingPool, for membership/voting actions.</li><li>Run one Admin Binary flow and one Member Binary flow: review/validation where applicable, vote, wait for deadline, settle and compare direct state with the V3.2 subgraph.</li><li>Only after the preceding flow is stable, test the winning plan: settlement reserves without paying; Admins authorize each payment freshly; the independent winner cohort reviews both proofs. Test unpaid-stage expiry separately.</li></ol>
      <div class="callout warning"><strong>Do not treat indexer data as write authorization.</strong> The V3.2 subgraph is for discovery/history. Before each wallet prompt, resolve the active Community through Factory, resolve its module addresses from Hub and simulate the exact write against current chain state.</div>
      <h2>What to submit</h2><p>For a pass or failure, provide the dApp URL/page, wallet role, transaction hash or revert, affected contract/module, expected result, actual result, a direct post-transaction read, and a screenshot only when it clarifies a UX issue. Use the <a href="#tester-product-qa" data-doc-link>product QA guide</a> for browser/RPC/indexer cases and the private security channel for an exploitable finding.</p>
    `,
  },
  {
    slug: "tester-local-lab",
    section: "Testing & contributing",
    group: "Start here",
    title: "Local V3.2 protocol lab",
    summary: "Deploy a disposable V2 + V3.2 stack, mint MockUSDC, issue local PoP records, and test eight explicit roles.",
    tags: ["hardhat", "localhost", "e2e", "mock-usdc", "pop", "v3.1"],
    content: `
      <p class="eyebrow">Contributor testing / Local environment</p><h1>One disposable chain.<br /><span>Eight explicit roles.</span></h1>
      <p class="lead">The local lab deploys the real BERT contract graph to Hardhat chain ID <code>31337</code>, then provides MockUSDC and local-only signed PoP records. The dApp uses direct RPC reads, so no backend or local subgraph is required.</p>
      <div class="callout danger"><strong>Environment boundary.</strong> Restarting Hardhat deletes every deployed address and balance. Never reuse previous MetaMask account labels: verify addresses against the current node. Never import a real wallet into this lab.</div>
      <h2>Wallet roles</h2>
      <table><thead><tr><th>Wallet</th><th>Role</th><th>What it validates</th></tr></thead><tbody><tr><td>#0</td><td>Creator, Admin, Administration execution wallet</td><td>Factory creation, protected Admin actions and proof submission.</td></tr><tr><td>#1</td><td>Second Admin</td><td>Two-of-N control, pause/resume and cancellation.</td></tr><tr><td>#2</td><td>Validator</td><td>Member proposal validation and Validator rewards.</td></tr><tr><td>#3 / #4</td><td>Member proposal authors</td><td>Binary and Slate author/bond paths.</td></tr><tr><td>#5 / #6 / #7</td><td>Winning supporters</td><td>Snapshot review electorate, quorum and refunds.</td></tr></tbody></table>
      <h2>Required sequence</h2>
      <p>Terminal A keeps the node running. Run each later command in Terminal B from <code>bert-core</code>. Copy the newly printed proxy addresses into the next command; do not reuse addresses after restarting the node.</p>
      <div class="code-sample"><div class="code-sample-header"><span>Terminal A / local node</span><button type="button" class="code-copy-button" data-copy-code="tester-local-node" data-copy-label="Copy">Copy</button></div><pre><code id="tester-local-node">npx hardhat node</code></pre></div>
      <div class="code-sample"><div class="code-sample-header"><span>Terminal B / deploy, wire, fund and attest</span><button type="button" class="code-copy-button" data-copy-code="tester-local-sequence" data-copy-label="Copy">Copy</button></div><pre><code id="tester-local-sequence">cd ~/bert/bert-core

LOCAL_RPC_URL=http://127.0.0.1:8545 \\
USDC_ADDRESS= \\
PROXY_ADMIN_OWNER=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 \\
TRUSTED_SIGNER_ADDRESS=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 \\
HUMAN_ONLY_VOTING=true \\
HUMAN_ONLY_IDEA_CREATION=true \\
npx hardhat run scripts/deploy/deploy-proxies.ts --network localhost

# Substitute PoPVerifierUpgradeable printed above.
LOCAL_RPC_URL=http://127.0.0.1:8545 \\
POP_VERIFIER_ADDRESS=&lt;PoPVerifierUpgradeable-proxy&gt; \\
V3_PROXY_ADMIN_OWNER=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 \\
npx hardhat run scripts/deploy/deploy-v3-2.ts --network localhost

# These sources reproduce the deployed V3.2 policy in an isolated local lab, not original V3.1.
# Substitute FundingPoolUpgradeable and V3_2_FACTORY_ADDRESS printed above.
LOCAL_RPC_URL=http://127.0.0.1:8545 \\
FUNDING_POOL_ADDRESS=&lt;FundingPoolUpgradeable-proxy&gt; \\
V3_2_FACTORY_ADDRESS=&lt;V3_2_FACTORY_ADDRESS&gt; \\
npx hardhat run scripts/deploy/configure-v3-2-funding-pool.ts --network localhost

LOCAL_RPC_URL=http://127.0.0.1:8545 \\
MOCK_USDC_ADDRESS=&lt;USDC-asset&gt; \\
LOCAL_TEST_WALLET_COUNT=8 \\
MOCK_USDC_AMOUNT=100000 \\
npx hardhat run scripts/local/mint-v3-test-usdc.ts --network localhost

LOCAL_RPC_URL=http://127.0.0.1:8545 \\
POP_VERIFIER_ADDRESS=&lt;PoPVerifierUpgradeable-proxy&gt; \\
LOCAL_TEST_WALLET_COUNT=8 \\
npx hardhat run scripts/local/verify-v3-test-wallets.ts --network localhost</code></pre></div>
      <p>Next, put the printed values in the frontend's uncommitted <code>.env.local</code>, choose the Hardhat network, leave both subgraph URLs empty, run <code>npm run dev</code>, and import only the eight accounts printed by the current Hardhat node. The full environment template, timing commands and four-lane E2E matrix are maintained in <a href="https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/LOCAL-V3.1-E2E.md" target="_blank" rel="noreferrer">LOCAL-V3.1-E2E.md</a>.</p>
      <p>The Factory authorization step is a security boundary. FundingPool accepts defined Community reserve inflows only from Treasuries activated by an explicitly approved Factory. V3.0, original V3.1 and V3.2 approvals coexist; if the V3.2 link is missing, reserve-routing E2E coverage is incomplete.</p>
      <h2>Use time travel, not weaker policy</h2><p>V3.2 keeps a one-day minimum milestone review. Advance the local clock for testing; do not modify Solidity timing simply to make a demo faster.</p>
      <div class="callout info"><strong>Exit criterion.</strong> Cover all four V3.2 lanes, one completed 20 / 40 / 40 execution plan, one failed-plan supporter refund, each stage's fresh Admin approvals/payment, 100/80/40 expiry refunds, and negative eligibility checks.</div>
    `,
  },
  {
    slug: "tester-v2-v3-matrix",
    section: "Testing & contributing",
    group: "Protocol matrix",
    title: "V2.3 and V3.2 test matrix",
    summary: "Concrete functional and negative cases for funding, governance, Treasury accounting, milestones, and refunds.",
    tags: ["v2.3", "v3.1", "matrix", "refunds", "milestones", "treasury"],
    content: `
      <p class="eyebrow">Contributor testing / Protocol matrix</p><h1>Happy paths are not<br /><span>enough evidence.</span></h1>
      <p class="lead">Every terminal protocol action needs a positive assertion, a negative assertion and an accounting assertion. Read contracts directly before and after each step; a UI label or raw ERC-20 transfer is not sufficient evidence.</p>
      <h2>V2.3: conditional pledge funding</h2>
      <table><thead><tr><th>ID</th><th>Action</th><th>Expected invariant</th></tr></thead><tbody><tr><td>V2-01</td><td>Create idea with author bond and minimum net target.</td><td>Bond and target store once in USDC base units; malformed intake reverts.</td></tr><tr><td>V2-02</td><td>Open eligible round and pledge to one candidate.</td><td>Candidate composition respects limits; pledge stays attributable to one voter/idea.</td></tr><tr><td>V2-03</td><td>Settle viable winner.</td><td>Only winner pledge capital becomes grant budget after disclosed fee policy.</td></tr><tr><td>V2-04</td><td>Claim loser or no-winner refund.</td><td>Each voter pulls own entitlement once; no pledge funds another idea.</td></tr><tr><td>V2-05</td><td>Review milestone, correction, expiry, failure.</td><td>Unreleased capital follows defined backer/refund policy; no duplicate release.</td></tr></tbody></table>
      <h2>V3.2: four governance lanes</h2>
      <table><thead><tr><th>Lane</th><th>Entry route</th><th>Critical checks</th></tr></thead><tbody><tr><td>Admin Binary</td><td>Admin creates; Members vote YES/NO.</td><td>No Validator review or reward share; YES winner creates plan.</td></tr><tr><td>Member Binary</td><td>Member locks bond; Validators decide; Members vote.</td><td>Only Validators decide once; author cannot self-vote.</td></tr><tr><td>Admin Slate</td><td>Admin creates candidates and round.</td><td>One selection per Member; deterministic winner; one settlement.</td></tr><tr><td>Member Slate</td><td>Member candidates require validation before round.</td><td>Unapproved candidate cannot enter; winner starts same plan lifecycle.</td></tr></tbody></table>
      <h2>Execution-plan checks</h2>
      <div class="contract-rail"><div><b>20%</b><small>SETTLEMENT</small><strong>Reserved and released once</strong><span>Treasury reserves winner budget, then releases only first tranche to Administration execution wallet.</span></div><div><b>40%</b><small>MILESTONE ONE</small><strong>Supporter review</strong><span>Only eligible sealed supporters review. Weight quorum is 40%; approval is 6,667 bps (66.67%).</span></div><div><b>40%</b><small>MILESTONE TWO</small><strong>Terminal delivery</strong><span>Second proof follows same electorate. Failure makes only unspent funds refundable.</span></div></div>
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
Area: V2.3 / V3.2 / frontend / backend / indexer / operations
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
