export const developerDocs = [
  {
    slug: "integration-quickstart",
    section: "Build with BERT",
    title: "Integration quickstart",
    summary: "Connect an EVM client to Arc Testnet, read BERT state, prepare USDC writes, and verify receipts safely.",
    tags: ["quickstart", "viem", "wagmi", "arc", "usdc", "contracts", "integration"],
    content: `
      <p class="eyebrow">Build with BERT / Quickstart</p><h1>Integrate the contracts.<br /><span>Trust the receipt.</span></h1>
      <p class="lead">BERT is an EVM protocol. An integration reads canonical state directly from deployed contracts, prepares writes locally, asks the connected wallet to sign, and treats the confirmed transaction receipt as the result. The dApp and subgraphs are useful reference implementations; neither replaces contract state.</p>
      <div class="callout warning"><strong>Current network.</strong> The public deployment is Arc Testnet, chain ID <code>5042002</code>. It is an active development environment: use only test assets, pin the expected chain before every write, and do not hardcode an address copied from an old deployment.</div>
      <h2>1. Install and configure a client</h2>
      <p>BERT's reference frontend uses <code>viem</code> and <code>wagmi</code>. Any EIP-1193-compatible wallet client works. Keep protocol addresses in versioned deployment configuration, not in UI components or source literals.</p>
      <pre><code>npm install viem wagmi

import { createPublicClient, http, parseUnits } from "viem";

export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [process.env.ARC_RPC_URL!] } },
} as const;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.ARC_RPC_URL),
});

const amount = parseUnits("10", 6); // Arc USDC uses six decimals</code></pre>
      <p>Do not assume the native gas asset, a USDC-compatible ERC-20, and application display formatting are interchangeable. Values sent to BERT contracts are token-native integers; format only at the presentation boundary.</p>
      <h2>2. Obtain the authoritative integration inputs</h2>
      <table><thead><tr><th>Input</th><th>Where to obtain it</th><th>How to use it</th></tr></thead><tbody><tr><td>Chain ID and RPC</td><td>Current deployment profile</td><td>Reject writes on any other chain.</td></tr><tr><td>Proxy / Factory address</td><td>Versioned deployment manifest</td><td>Use the proxy address for V2 contracts and the active V3 Factory address for Community discovery.</td></tr><tr><td>ABI</td><td>Published contract artifact or interface</td><td>Pin it to the deployed implementation and verify its source before a production integration.</td></tr><tr><td>USDC address and decimals</td><td>FundingPool / Treasury read plus deployment profile</td><td>Use it for allowance, balance and unit conversion.</td></tr><tr><td>Event start block</td><td>Deployment manifest</td><td>Bound log scans and subgraph sources to the relevant deployment block.</td></tr></tbody></table>
      <h2>3. Read before preparing a write</h2>
      <p>Every user action should start with current reads. For example, an application joining a Community should read the Hub status, its paired Treasury, the member's role or membership state, and the entry stake before showing an approval flow. A V2 vote UI should read round state, deadline, the selected idea, minimum stake and any human-verification policy.</p>
      <pre><code>const communityStatus = await publicClient.readContract({
  address: hub,
  abi: communityHubAbi,
  functionName: "communityStatus",
});

const entryStake = await publicClient.readContract({
  address: hub,
  abi: communityHubAbi,
  functionName: "entryStake",
});</code></pre>
      <div class="callout info"><strong>Read-model rule.</strong> The subgraph is optimized for history and pagination. Before displaying a permissioned CTA or broadcasting a transaction, re-read the contract state that protects that action.</div>
      <h2>4. Simulate, approve, write, wait</h2>
      <p>When an operation pulls USDC, the wallet must have both sufficient balance and an ERC-20 allowance for the contract that performs the pull. Simulate the exact write first, request approval only when necessary, submit the protocol call, then wait for the receipt and refresh affected reads.</p>
      <pre><code>const { request } = await publicClient.simulateContract({
  account,
  address: hub,
  abi: communityHubAbi,
  functionName: "joinCommunity",
});

const hash = await walletClient.writeContract(request);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") throw new Error("BERT write reverted");</code></pre>
      <p>Simulation reduces avoidable wallet prompts but is not a settlement guarantee. State can change between simulation and inclusion. Handle a revert as a normal protocol outcome: surface the failed prerequisite, refresh state, and never mark an action complete until the receipt succeeds.</p>
      <h2>Where to continue</h2>
      <div class="doc-cards three-up compact"><a href="#client-and-network" data-doc-link class="doc-card"><span class="mini-icon">01</span><h3>Client and network</h3><p>Environment variables, RPC resilience and unit safety.</p></a><a href="#v2-overview" data-doc-link class="doc-card"><span class="mini-icon">02</span><h3>V2 contracts</h3><p>Global funding reads, writes and invariants.</p></a><a href="#v3-overview" data-doc-link class="doc-card"><span class="mini-icon">03</span><h3>V3 contracts</h3><p>Factory, Hub and Treasury integration boundary.</p></a></div>
    `,
  },
  {
    slug: "client-and-network",
    section: "Build with BERT",
    title: "Client and network configuration",
    summary: "Production-grade client configuration: chain checks, environment boundaries, unit handling and RPC fallback design.",
    tags: ["rpc", "network", "environment", "chain-id", "viem", "usdc", "configuration"],
    content: `
      <p class="eyebrow">Build with BERT / Client configuration</p><h1>Make the network<br /><span>an explicit dependency.</span></h1>
      <p class="lead">A BERT client should be deployable without source edits. Network identifiers, RPC endpoints, contract addresses, indexer endpoints and feature gates belong in environment-specific configuration with validation at process start.</p>
      <h2>Required client configuration</h2>
      <pre><code>ARC_RPC_URL=https://your-arc-testnet-rpc
BERT_CHAIN_ID=5042002
USDC_ADDRESS=0x...
FUNDING_POOL_ADDRESS=0x...
IDEA_REGISTRY_ADDRESS=0x...
VOTING_SYSTEM_ADDRESS=0x...
V3_FACTORY_ADDRESS=0x...
V3_EVENT_FROM_BLOCK=0
V2_SUBGRAPH_URL=https://...
V3_SUBGRAPH_URL=https://...</code></pre>
      <p>The names above are integration-facing examples, not a replacement for BERT's deployment manifest. Validate address shape and chain ID before constructing contract clients. A missing address should disable the affected feature with a visible configuration error, never silently fall back to another network.</p>
      <h2>Chain guards</h2>
      <p>Check the connected wallet's chain before simulation and again before a write. A public client can read a stale or default RPC while a wallet is pointed elsewhere; both contexts must identify Arc Testnet for the transaction path.</p>
      <pre><code>const chainId = await walletClient.getChainId();
if (chainId !== 5042002) {
  throw new Error("Switch wallet to Arc Testnet before using BERT");
}</code></pre>
      <h2>USDC unit and allowance discipline</h2>
      <ul><li>Keep monetary values as <code>bigint</code> from the RPC through transaction construction.</li><li>Use the token's reported decimals or the deployment manifest. Arc's current USDC-compatible test asset uses six decimals.</li><li>Approve the smallest operational amount when the user experience permits it. Never interpret an approval as a completed BERT action.</li><li>After any receipt that transfers or locks USDC, refresh balances and contract-specific liabilities rather than applying a guessed local delta.</li></ul>
      <h2>RPC and event-query strategy</h2>
      <p>Public Arc nodes may prune historical logs. Do not scan from block zero, and do not make a live UI depend on an unbounded <code>eth_getLogs</code> query. Start at the recorded contract deployment block, query in bounded ranges, cache cursor progress, and prefer the BERT subgraphs for long history, search and lists.</p>
      <div class="callout warning"><strong>Fallback hierarchy.</strong> Use indexed data for discovery; direct reads for current permissions and balances; bounded event queries only for the narrow interval that an indexer has not covered yet. If an RPC cannot serve pruned history, treat that as an infrastructure limitation, not as protocol absence.</div>
      <h2>Testnet verification feature gate</h2>
      <p>On Arc Testnet, BERT may expose an explicitly labelled Demo verification route so every tester can exercise protected contract paths. It creates a real onchain verifier record but is not proof of personhood. Integrations must expose this state as a test-only feature and must not reuse it on a production chain. See <a href="#testnet-guide" data-doc-link>Arc Testnet and verification</a> for the exact boundary.</p>
    `,
  },
  {
    slug: "indexing-and-subgraphs",
    section: "Infrastructure & operations",
    title: "Indexing and subgraphs",
    summary: "Use BERT's V2 and V3 subgraphs for discovery, pagination and event history without weakening onchain correctness.",
    tags: ["subgraph", "graphql", "indexing", "events", "v2", "v3", "pagination"],
    content: `
      <p class="eyebrow">Infrastructure & operations / Indexing</p><h1>Index history.<br /><span>Verify live state.</span></h1>
      <p class="lead">BERT exposes separate V2 and V3 indexing domains. The V2 index tracks global ideas, rounds, votes, reviews, grants and distributions. The V3 index begins at the Factory, discovers each Community's Hub and Treasury, then indexes their scoped governance and accounting events.</p>
      <div class="callout info"><strong>Correctness boundary.</strong> A subgraph is a derived read model. It can lag a block, be redeployed or be unavailable. A contract's current return value and a successful transaction receipt remain authoritative for permission, settlement and balance decisions.</div>
      <h2>V3 discovery flow</h2>
      <ol class="numbered-flow"><li>Index <code>CommunityTreasuryCreated</code> from the active <code>CommunityFactory</code>.</li><li>Wait for <code>CommunityCreated</code>, which links the verified Hub and reserved Treasury.</li><li>Create dynamic Hub and Treasury data sources for that Community.</li><li>Use Community-scoped entities for members, proposals, slate rounds, votes, validator epochs, withdrawals and quorum actions.</li></ol>
      <p>This architecture prevents a global event scan across every Hub and Treasury. It also preserves each Community as an isolated query namespace.</p>
      <h2>Example V3 query</h2>
      <pre><code>query Communities($first: Int!, $where: Community_filter) {
  communities(
    first: $first
    orderBy: createdAt
    orderDirection: desc
    where: $where
  ) {
    id
    communityId
    creator
    hub
    treasury
    name
    metadataURI
    active
    createdAt
  }
}</code></pre>
      <p>Use cursor-style pagination or stable ordering with an explicit cursor when consuming large lists. Do not rely on UI-only page indices as a durable protocol identifier; V2 idea IDs, V2 round IDs, V3 Community IDs, V3 proposal IDs and V3 Treasury withdrawal IDs live in different namespaces.</p>
      <h2>Schema-level interpretation</h2>
      <table><thead><tr><th>Entity family</th><th>Best use</th><th>Do not use as</th></tr></thead><tbody><tr><td>V2 <code>Idea</code>, <code>Round</code>, <code>Vote</code></td><td>Explore funding history, rank ideas, paginate votes.</td><td>A replacement for live round deadline or eligibility reads.</td></tr><tr><td>V3 <code>Community</code></td><td>Discover Factory-created communities and their paired addresses.</td><td>Proof that a newly submitted transaction is final before indexing catches up.</td></tr><tr><td>V3 <code>CommunityProposal</code>, <code>CommunitySlateRound</code></td><td>Proposal timelines, slate presentation and historical accounting.</td><td>Authorization for a validator or member action.</td></tr><tr><td>Treasury-derived entities</td><td>Withdrawals, reward epochs, claims and refund history.</td><td>Available balance for a transaction without a Treasury read.</td></tr></tbody></table>
      <h2>Indexer operations checklist</h2>
      <ul><li>Pin each data source to the deployment's Factory or proxy address and start block.</li><li>Version ABI changes with the subgraph deployment; do not index an upgrade with a stale ABI.</li><li>Expose indexer freshness to users where it affects a list or dashboard.</li><li>Reconcile critical totals against direct contract reads in monitoring.</li><li>Keep the V2 and V3 endpoints separate; they model different protocols and entity schemas.</li></ul>
    `,
  },
];
