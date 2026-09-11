export const startDocs = [
  {
    slug: "docs-home",
    section: "Build with BERT",
    title: "Developer portal",
    summary: "Technical documentation for integrating BERT V2 funding, BERT V3 Communities, Arc Testnet infrastructure and indexers.",
    tags: ["developers", "overview", "v2", "v3", "arc", "usdc", "integration"],
    content: `
      <p class="eyebrow">BERT / Developer portal</p>
      <h1>Build transparent<br /><span>capital systems.</span></h1>
      <p class="lead">BERT is USDC-native EVM infrastructure. Integrate V2 for global idea-to-grant funding rounds, or V3 for isolated stake-gated Community governance. These docs focus on contract boundaries, read/write flows, events, indexers, deployment configuration and integration invariants.</p>
      <div class="protocol-illustration" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="orbit-node node-v2">V2</span><span class="orbit-node node-v3">V3</span><img src="./assets/bert-logo.png" alt="" /></div>
      <div class="status-strip"><div><span>Network</span><strong>Arc Testnet</strong><code>5042002</code></div><div><span>Release status</span><strong>Active development</strong><em>Not mainnet</em></div><div><span>Settlement unit</span><strong>USDC</strong><em>6 decimals</em></div></div>
      <div class="callout warning"><strong>Read this first.</strong> The public BERT deployment is on Arc Testnet. Transactions interact with deployed contracts, but testnet assets have no monetary value. Testnet uses an explicitly labelled Demo verification record; it is not proof of personhood and has no Sybil-resistance claim.</div>

      <h2>Start an integration</h2>
      <div class="doc-cards three-up"><a href="#integration-quickstart" data-doc-link class="doc-card"><span class="mini-icon">01</span><h3>Integration quickstart</h3><p>Configure Arc, read contracts, prepare USDC writes and verify receipts.</p><b>Start building <i>→</i></b></a><a href="#v2-overview" data-doc-link class="doc-card version-v2"><span class="card-kicker">BERT V2</span><h3>Funding contracts</h3><p>Ideas, USDC-backed voting rounds, FundingPool accounting and staged grants.</p><b>Open V2 reference <i>→</i></b></a><a href="#v3-overview" data-doc-link class="doc-card version-v3"><span class="card-kicker">BERT V3</span><h3>Community contracts</h3><p>Factory discovery, isolated Hubs, local Treasuries and scoped governance.</p><b>Open V3 reference <i>→</i></b></a></div>

      <h2>Integration source of truth</h2>
      <table><thead><tr><th>Question</th><th>Authoritative source</th><th>Why</th></tr></thead><tbody><tr><td>Can an account act now?</td><td>Live contract read</td><td>Eligibility, roles, pause state, balances and timestamps are onchain state.</td></tr><tr><td>What happened previously?</td><td>Events and subgraph</td><td>Indexing serves history, discovery and lists; it does not override contracts.</td></tr><tr><td>What does the UI permit?</td><td>Contract guard plus frontend preflight</td><td>The UI explains a likely outcome; the contract makes the final decision.</td></tr><tr><td>What does a verifier mean?</td><td>Deployment policy + trusted signer</td><td>PoPVerifier validates a signed record. Provider policy belongs to the backend and deployment configuration.</td></tr></tbody></table>

      <h2>Developer documentation map</h2>
      <div class="doc-cards three-up compact"><a href="#client-and-network" data-doc-link class="doc-card"><span class="mini-icon">01</span><h3>Client configuration</h3><p>Network guards, RPC strategy and units.</p></a><a href="#indexing-and-subgraphs" data-doc-link class="doc-card"><span class="mini-icon">02</span><h3>Indexing</h3><p>V2 and V3 GraphQL read models.</p></a><a href="#testnet-guide" data-doc-link class="doc-card"><span class="mini-icon">03</span><h3>Testnet operations</h3><p>Demo PoP, safe testing and reporting.</p></a><a href="#protocol-map" data-doc-link class="doc-card"><span class="mini-icon">04</span><h3>Protocol architecture</h3><p>How V2 and V3 connect without merging scopes.</p></a></div>
    `,
  },
  {
    slug: "protocol-map",
    section: "Build with BERT",
    title: "Protocol architecture",
    summary: "The separation of responsibilities between V2 global funding and V3 Community governance for integrators.",
    tags: ["architecture", "v2", "v3", "funding-pool", "community", "treasury"],
    content: `
      <p class="eyebrow">Build with BERT / Architecture</p><h1>One settlement rail.<br /><span>Two integration scopes.</span></h1>
      <p class="lead">V2 and V3 are deliberately connected without becoming one contract surface. V2 owns the global funding and grant rail. V3 lets Communities govern local activity and routes only explicitly configured reserve capital back into V2. An integration must keep these namespaces separate.</p>
      <div class="flow-diagram"><div><small>V2</small><strong>Global funding layer</strong><span>Ideas · rounds · FundingPool · GrantManager</span></div><b>↔</b><div><small>V3</small><strong>Community layer</strong><span>Hub · local Treasury · validators · local rounds</span></div></div>
      <h2>V2 owns global capital allocation</h2><ul><li><strong>IdeaRegistryUpgradeable</strong> holds protocol-wide ideas and their lifecycle.</li><li><strong>VotingSystemUpgradeable</strong> runs global idea rounds with USDC commitments.</li><li><strong>FundingPoolUpgradeable</strong> accounts for V2 deposits, votes, distributions and the protocol reserve.</li><li><strong>GrantManagerUpgradeable</strong> releases winning funding through the 30 / 40 / 30 milestone rail.</li></ul>
      <h2>V3 owns Community-local governance</h2><ul><li>Every Community receives its own Hub and Treasury with isolated membership stakes, proposal bonds, vote escrows and reward accounting.</li><li>Communities run binary proposals and Slate Rounds without creating global V2 ideas for every local decision.</li><li>Only the configured reserve share from eligible settled Community flows can route into the V2 FundingPool. Local execution and validator reward balances remain local.</li></ul>
      <div class="callout info"><strong>Integration invariant.</strong> A V3 Treasury cannot route arbitrary funds into V2. FundingPool accepts Community reserve capital only from an authenticated V3 Treasury registered through the V3 Factory path.</div>
      <h2>Shared security primitives</h2><table><thead><tr><th>Primitive</th><th>V2 use</th><th>V3 use</th></tr></thead><tbody><tr><td>USDC settlement</td><td>Deposits, votes, grants, reserve</td><td>Entry stakes, bonds, vote escrow, local balances</td></tr><tr><td>PoPVerifier</td><td>Protected idea creation and voting when enabled</td><td>Community creation and membership entry</td></tr><tr><td>Pause controls</td><td>Contain affected V2 write paths</td><td>Freeze Community clock and protected local operations</td></tr><tr><td>Subgraph</td><td>V2 history and discovery</td><td>Separate V3 index for Community/event views</td></tr></tbody></table>
    `,
  },
];
