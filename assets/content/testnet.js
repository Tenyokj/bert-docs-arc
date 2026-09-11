export const testnetDocs = [
  {
    slug: "testnet-guide",
    section: "Infrastructure & operations",
    title: "Arc Testnet and verification",
    summary: "What is real on Arc Testnet, how Demo verification works, and how to operate integrations responsibly before mainnet.",
    tags: ["testnet", "arc", "demo-verification", "pop", "security", "bug-bounty"],
    content: `
      <p class="eyebrow">Infrastructure & operations / Current deployment</p><h1>Test real flows.<br /><span>Do not assign real value.</span></h1>
      <p class="lead">BERT is currently operating on Arc Testnet while the protocol, frontend, backend and indexers are hardened before any mainnet launch. The contracts are deployed and transactions are real testnet transactions. Testnet USDC, balances, rewards and outcomes have no monetary value.</p>
      <div class="status-strip"><div><span>Chain</span><strong>Arc Testnet</strong><code>5042002</code></div><div><span>Public RPC</span><strong>rpc.testnet.arc.network</strong><em>Use your configured endpoint</em></div><div><span>Verification</span><strong>Demo PoP</strong><em>Test-only</em></div></div>
      <h2>What is real</h2><div class="doc-cards two-up compact"><div class="doc-card static-card"><h3>Onchain execution</h3><p>Wallet signatures, USDC approvals, stakes, votes, Treasury requests, settlements and claims execute against deployed Arc Testnet contracts.</p></div><div class="doc-card static-card"><h3>Test boundaries</h3><p>Deployments, indexes, configuration and test balances can change while development continues. Record transaction hashes when something behaves unexpectedly.</p></div></div>
      <h2>Demo verification: exact meaning</h2>
      <p>Protected BERT actions require an active record in <code>PoPVerifierUpgradeable</code>. On Arc Testnet, press <strong>Use demo verification</strong> in the dApp and confirm the resulting transaction. The backend signs a provider record marked <code>BERT_TESTNET_DEMO</code>; the wallet still finalizes it through the real onchain verifier.</p>
      <table><thead><tr><th>Demo verification does</th><th>Demo verification does not do</th></tr></thead><tbody><tr><td>Exercises frontend → backend → signature → PoPVerifier → protected contract flow.</td><td>Prove that a person is unique, human or trustworthy.</td></tr><tr><td>Lets every Arc Testnet wallet test V2 and V3 access-gated paths.</td><td>Prevent Sybil wallets or serve as a mainnet identity policy.</td></tr><tr><td>Uses the same onchain nonce, expiry and trusted-signer checks as other verification payloads.</td><td>Replace World ID production proof-of-personhood.</td></tr></tbody></table>
      <div class="callout danger"><strong>Never interpret testnet Demo PoP as security evidence.</strong> Its purpose is accessibility and full-flow testing. It is deliberately disabled outside the Arc Testnet deployment path.</div>
      <h2>Safe test flow</h2><ol class="numbered-flow"><li>Connect a wallet configured for Arc Testnet and obtain only test assets.</li><li>Open Profile and activate Demo verification. Confirm the onchain transaction.</li><li>Test one focused path: V2 idea/vote/settlement or one V3 Community lifecycle.</li><li>Capture the transaction hash, wallet, network, expected result and actual result.</li><li>For a suspected vulnerability, stop at the minimum proof of impact and report it privately.</li></ol>
      <h2>Production verification policy</h2><p>Demo verification is an Arc Testnet-only convenience. The intended mainnet policy is production World ID proof-of-personhood: the backend validates the World proof, binds one World nullifier to one BERT wallet in durable storage, and only then signs a payload for <code>PoPVerifierUpgradeable</code>. World ID rollout and mainnet launch criteria will be documented after their final policy is agreed.</p>
      <h2>Responsible disclosure</h2><p>Do not publish exploitable findings in issues, social posts, pull requests or discussions. Submit a private advisory through the <a href="https://github.com/Tenyokj/bert-core-arc/security/advisories/new" target="_blank" rel="noreferrer">BERT Core security channel ↗</a>. Include affected component, prerequisites, exact reproduction, impact and relevant transaction hashes. Do not access other users' data or funds, spam contracts, degrade service or disclose secrets.</p>
    `,
  },
  {
    slug: "testnet-deployment-manifest",
    section: "Infrastructure & operations",
    group: "Arc Testnet runbook",
    title: "Deployment manifest and preflight",
    summary: "How to version addresses, verify V2/V3 wiring and prevent clients from reading a stale Arc Testnet deployment.",
    tags: ["testnet", "deployment", "manifest", "factory", "proxy", "preflight"],
    content: `
      <p class="eyebrow">Arc Testnet / Deployment safety</p><h1>Addresses are release data.<br /><span>Never UI constants.</span></h1>
      <p class="lead">A testnet deployment is real contract state, but it is not permanent protocol identity. When V2 proxies are upgraded or a V3 Factory is redeployed, frontend, backend, subgraph and manual scripts must move as one release. Keep addresses in a versioned deployment manifest and make applications refuse an incomplete or mismatched manifest.</p>
      <h2>Manifest contract</h2>
      <p>The manifest should be committed without secrets and updated in the same pull request as deployment configuration. It is the single integration source for chain ID, proxy addresses, Factory/TreasuryDeployer pair, verifier, USDC, event start blocks and indexer URLs. Private keys, World signing keys, backend provider keys and Graph Studio deploy keys do not belong in it.</p>
      <pre><code>{
  "network": "arc-testnet",
  "chainId": 5042002,
  "releasedAt": "ISO-8601 timestamp",
  "contracts": {
    "usdc": "0x...",
    "popVerifier": "0x...",
    "ideaRegistryProxy": "0x...",
    "votingSystemProxy": "0x...",
    "fundingPoolProxy": "0x...",
    "grantManagerProxy": "0x...",
    "v3Factory": "0x...",
    "v3TreasuryDeployer": "0x..."
  },
  "eventFromBlock": {
    "v2": 0,
    "v3Factory": 0
  },
  "indexers": { "v2": "https://...", "v3": "https://..." }
}</code></pre>
      <h2>What must agree</h2>
      <table><thead><tr><th>Component</th><th>Must use</th><th>Failure when stale</th></tr></thead><tbody><tr><td>Frontend</td><td>Current V2 proxies, V3 Factory, PoPVerifier, backend URL and subgraph endpoints</td><td>Transactions simulate against an old contract or event search starts at the wrong block.</td></tr><tr><td>Backend</td><td>Current chain ID, verifier address, Demo-PoP testnet gate and signer matching onchain trusted signer</td><td>Frontend receives a valid-looking payload that onchain verification rejects.</td></tr><tr><td>V3 subgraph</td><td>Factory address, Factory event start block and dynamic Hub/Treasury templates</td><td>Communities never appear, or indexer queries pruned/unrelated history.</td></tr><tr><td>Deployment scripts</td><td>FundingPool, Factory and TreasuryDeployer values from one release</td><td>Factory deploys but Community Treasury authorization or reserve wiring fails.</td></tr></tbody></table>
      <h2>V2 and V3 preflight</h2>
      <div class="state-track"><div><small>CHAIN</small><strong>5042002</strong><span>Public client and wallet must both identify Arc Testnet.</span></div><div><small>CODE</small><strong>Contract deployed</strong><span>Check non-empty bytecode at each manifest address.</span></div><div><small>WIRING</small><strong>Read dependencies</strong><span>Verify V2 module links, Factory deployment pair and FundingPool V3 Factory.</span></div><div><small>INDEX</small><strong>Bounded history</strong><span>Query from recorded deploy block, never from zero by default.</span></div></div>
      <pre><code>const code = await publicClient.getBytecode({ address: manifest.contracts.v3Factory });
if (!code || code === "0x") throw new Error("V3 Factory has no deployed code");

const configuredFactory = await publicClient.readContract({
  address: manifest.contracts.fundingPoolProxy,
  abi: fundingPoolAbi,
  functionName: "communityFactory",
});
if (configuredFactory.toLowerCase() !== manifest.contracts.v3Factory.toLowerCase()) {
  throw new Error("FundingPool is wired to a different V3 Factory");
}</code></pre>
      <h2>Release checklist</h2><ol class="numbered-flow"><li>Deploy or upgrade contracts and collect emitted addresses/transaction hashes.</li><li>Run deploy verification scripts against the target network before touching frontend configuration.</li><li>Update manifest, frontend environment, backend environment and V3 subgraph source together.</li><li>Redeploy backend/frontend and publish or update subgraph.</li><li>Run one V2 protected action and one V3 Community creation flow with fresh state.</li></ol>
      <div class="callout warning"><strong>Do not fix a stale deployment by setting a broad event query to block zero.</strong> Arc RPC history can be pruned. Correct the release start block and source address instead.</div>
    `,
  },
  {
    slug: "testnet-troubleshooting",
    section: "Infrastructure & operations",
    group: "Arc Testnet runbook",
    title: "Troubleshooting real test flows",
    summary: "Diagnose chain mismatch, RPC history, PoP, allowance, Factory activation and indexing failures without guessing.",
    tags: ["testnet", "troubleshooting", "rpc", "pop", "allowance", "subgraph"],
    content: `
      <p class="eyebrow">Arc Testnet / Troubleshooting</p><h1>Read the state.<br /><span>Do not retry blindly.</span></h1>
      <p class="lead">Most testnet failures are reproducible state mismatches: wrong network, stale address, no allowance, expired proof, closed window or an indexer configured beyond the RPC history it can serve. Capture the transaction hash and resolve the responsible contract state before submitting another transaction.</p>
      <h2>First-response checklist</h2>
      <ol class="numbered-flow"><li><strong>Record context.</strong> Wallet address, chain ID, transaction hash, function, arguments and browser/backend error.</li><li><strong>Confirm network.</strong> Wallet and public RPC must both target chain <code>5042002</code>.</li><li><strong>Read fresh state.</strong> Fetch exact proposal, round, Community, Treasury request or verifier record.</li><li><strong>Simulate.</strong> Repeat using the same account and current ABI to decode the custom error.</li><li><strong>Classify.</strong> Fix configuration/state mismatch, or submit a private report if it violates an invariant.</li></ol>
      <h2>Error map</h2>
      <table><thead><tr><th>Symptom</th><th>Likely cause</th><th>Correct action</th></tr></thead><tbody><tr><td><code>pruned history unavailable</code> from <code>eth_getLogs</code></td><td>Query begins before provider-retained history.</td><td>Use deployment start block, bounded ranges or V2/V3 subgraph. Do not call it “no events”.</td></tr><tr><td>PoP verification rejected</td><td>Wrong environment, expired/used nonce, backend signer mismatch or Demo gate disabled.</td><td>Check backend health, expected chain ID, Demo flag and PoPVerifier trusted signer before retry.</td></tr><tr><td>USDC transfer failure</td><td>Insufficient balance or allowance for FundingPool/Treasury.</td><td>Read ERC-20 <code>balanceOf</code> and <code>allowance</code> for the exact spender.</td></tr><tr><td>Factory/Hub deployment reverts</td><td>Configuration/creator/Treasury mismatch or stale Factory wiring.</td><td>Verify Factory record, config hash path, FundingPool configured Factory and caller.</td></tr><tr><td>Action unavailable after mined tx</td><td>Indexer lag or stale frontend cache.</td><td>Use receipt and direct contract reads; wait for subgraph only for history/list refresh.</td></tr><tr><td>Admin execution reverts</td><td>Quorum not met, action expired, request terminal or Community status changed.</td><td>Read request, approval count, threshold, expiry and current Community status.</td></tr></tbody></table>
      <h2>Demo PoP diagnostics</h2>
      <p>The testnet path is <strong>frontend → backend Demo-proof endpoint → wallet transaction → PoPVerifierUpgradeable → protected contract</strong>. A green backend health endpoint alone proves only that the function loaded; it does not prove its signer matches onchain verifier configuration. Always test the final onchain verification transaction with a non-verified test wallet after a backend redeploy.</p>
      <pre><code>// Frontend preflight: never call a testnet verifier on the wrong chain.
const walletChainId = await walletClient.getChainId();
if (walletChainId !== 5042002) throw new Error("Switch to Arc Testnet");

const health = await fetch(backendUrl + "/api/health").then((response) =&gt; response.json());
if (!health.ok) throw new Error("BERT verification backend is unavailable");

// Backend must keep POP_DEMO_ENABLED scoped to Arc Testnet only.
// The frontend then submits the backend-signed payload to PoPVerifier onchain.</code></pre>
      <h2>Transaction-level debugging</h2>
      <p>Use the explorer to confirm recipient contract, receipt status, emitted logs and the exact block. If the explorer provides no revert reason, use local <code>simulateContract</code> with same <code>account</code>, <code>to</code>, calldata and current state. Do not turn off a security check or replace a contract address merely to make a test pass.</p>
      <h2>When to report privately</h2>
      <p>Use the private security channel if you can cause unauthorized balance movement, bypass a role/PoP gate, duplicate a payout/claim, permanently lock other users' funds, change immutable policy without quorum, or make canonical accounting diverge. Include the smallest reproducible sequence and stop after demonstrating impact. Normal parameter reverts, expired actions and indexer lag belong in an engineering issue, not a public vulnerability report.</p>
      <div class="callout danger"><strong>Never test an exploit against another user.</strong> Use accounts and test assets you control, avoid load generation, and disclose details only through the private channel until a fix is released.</div>
    `,
  },
  {
    slug: "testnet-security-program",
    section: "Infrastructure & operations",
    title: "Security and bug bounty program",
    summary: "Scope, safe-harbor reporting, validator-role recognition and rules for BERT's testnet security program.",
    tags: ["security", "bug-bounty", "responsible-disclosure", "testnet", "validators"],
    content: `
      <p class="eyebrow">BERT / Security program</p><h1>Find a real bug.<br /><span>Protect the Community.</span></h1>
      <p class="lead">BERT welcomes responsible testing while the protocol is on Arc Testnet. The program exists to find contract, backend, indexer and user-flow defects before mainnet. Reports must be private, reproducible and limited to the minimum proof needed to establish impact.</p>
      <h2>In scope</h2>
      <table><thead><tr><th>Surface</th><th>Examples of meaningful impact</th><th>Evidence to provide</th></tr></thead><tbody><tr><td>V2/V3 smart contracts</td><td>Unauthorized transfer, double claim, role bypass, incorrect settlement, permanent lock, broken quorum.</td><td>Fork/test steps, call sequence, expected invariant and receipt/log evidence.</td></tr><tr><td>PoP/backend path</td><td>Forged verification, broken wallet binding, replay that bypasses intended nonce/expiry control.</td><td>Minimal request/response shape with secrets removed and resulting onchain behavior.</td></tr><tr><td>Frontend/integration</td><td>Transaction construction that routes value to wrong address, hides a critical state or makes safe operation impossible.</td><td>Browser steps, network, account class and direct onchain comparison.</td></tr><tr><td>Subgraph/indexer</td><td>Persistent materially wrong state that causes unsafe transaction guidance.</td><td>Event logs, indexed output and canonical contract reads.</td></tr></tbody></table>
      <h2>Out of scope</h2><ul><li>Findings that require compromising a user's wallet, server, browser or private key.</li><li>Demo PoP's lack of Sybil resistance on Arc Testnet: this is an explicitly documented test-only limitation.</li><li>Reports without a reproducible security or correctness impact, including generic dependency scanner output without an exploitable path.</li><li>Social engineering, phishing, denial-of-service testing, automated spam and touching funds/accounts that are not yours.</li></ul>
      <h2>How to submit a report</h2>
      <ol class="numbered-flow"><li>Use the dApp Bug Bounty form to produce a structured report template.</li><li>Open a private advisory through the BERT Core GitHub security channel.</li><li>Include title, affected commit/deployment, severity rationale, prerequisites, exact reproduction and impact.</li><li>Share transaction hashes and sanitized screenshots; never paste private keys, API secrets or another user's personal data.</li><li>Allow maintainers to reproduce and coordinate a fix before any public disclosure.</li></ol>
      <h2>Recognition model</h2><p>For accepted, high-quality findings, BERT's intended recognition is a Validator role in the future BERT Community after mainnet governance launch. That is not an immediate token payment, a guaranteed yield or a transfer of treasury funds. Validator selection, role assignment and future reward policy remain subject to the Community's deployed quorum-controlled governance and applicable launch conditions.</p>
      <div class="callout warning"><strong>Do not represent recognition as guaranteed financial compensation.</strong> A Validator role can be valuable only if and when the future Community launches, its policy permits rewards and the selected Validator performs qualifying work. The testnet program must not promise income.</div>
      <h2>Safe harbor</h2><p>BERT will not pursue action against good-faith researchers who follow this policy, avoid harm, report privately and give reasonable time to remediate. This does not authorize breaking laws, accessing data without permission, service disruption or testing outside the stated scope.</p>
      <p><a href="https://github.com/Tenyokj/bert-core-arc/security/advisories/new" target="_blank" rel="noreferrer">Open a private BERT security advisory ↗</a></p>
    `,
  },
  {
    slug: "arc-testnet-overview",
    section: "Infrastructure & operations",
    group: "Network & access",
    title: "Arc Testnet overview",
    summary: "The current BERT environment, what can be tested, what remains intentionally non-production and where each component runs.",
    tags: ["arc", "testnet", "network", "dapp", "backend", "demo", "ethonline"],
    content: `
      <p class="eyebrow">BERT / Arc Testnet</p><h1>A real protocol<br /><span>in a test-only environment.</span></h1>
      <p class="lead">BERT is live on Arc Testnet for end-to-end protocol testing. Wallet signatures, ERC-20 approvals, V2 ideas and grants, V3 Communities, role changes, validator accounting and event indexing all interact with deployed contracts. The network and assets are test-only: no testnet balance, reward, grant or Community execution outcome has real monetary value.</p>
      <div class="status-strip"><div><span>Network</span><strong>Arc Testnet</strong><code>5042002</code></div><div><span>Release</span><strong>V2 + V3 integration</strong><em>Active development</em></div><div><span>Identity policy</span><strong>Demo PoP</strong><em>Arc-only, not personhood</em></div></div>
      <h2>Public components</h2>
      <table><thead><tr><th>Component</th><th>URL / network</th><th>Purpose</th><th>Authority boundary</th></tr></thead><tbody><tr><td>BERT dApp</td><td><a href="https://bertdao.vercel.app" target="_blank" rel="noreferrer">bertdao.vercel.app ↗</a></td><td>Reference UI for V2, V3, Profile, Demo PoP and bug-bounty reporting.</td><td>Convenience layer. Contracts decide permission and settlement.</td></tr><tr><td>Verification backend</td><td><a href="https://bert-backend-arc.vercel.app" target="_blank" rel="noreferrer">bert-backend-arc.vercel.app ↗</a></td><td>Health check and Arc-Testnet Demo PoP payloads.</td><td>May sign test payloads only; PoPVerifier validates them onchain.</td></tr><tr><td>Arc Testnet</td><td>Chain ID <code>5042002</code></td><td>Execution environment for every current BERT transaction.</td><td>Wallet network must match before any write.</td></tr><tr><td>V2/V3 subgraphs</td><td>Configured Graph endpoints</td><td>Search, lists, pagination and historical event views.</td><td>Derived read models. They never authorize a transaction.</td></tr></tbody></table>
      <h2>What a tester can exercise today</h2>
      <div class="contract-rail"><div><b>V2</b><small>Global funding</small><strong>Ideas through milestones</strong><span>Demo-verify, approve USDC, submit an idea, open/vote/settle a round, claim and review milestone flows.</span></div><div><b>V3</b><small>Community Layer</small><strong>Local governance</strong><span>Create a Community, join, validate proposals, vote Binary/Slate, settle, manage roles and test Treasury quorum flows.</span></div><div><b>OPS</b><small>Infrastructure</small><strong>Indexer and failure paths</strong><span>Verify deployment wiring, inspect events, reproduce RPC history limits and submit private security reports.</span></div></div>
      <h2>What is intentionally different from mainnet</h2>
      <table><thead><tr><th>Area</th><th>Arc Testnet behavior</th><th>Mainnet direction</th></tr></thead><tbody><tr><td>Assets</td><td>USDC-compatible test asset and testnet gas only.</td><td>Production assets and independent risk review before launch.</td></tr><tr><td>Human verification</td><td>Explicit Demo PoP provider, scoped in code to chain <code>5042002</code>.</td><td>Production World ID policy, proof validation and durable nullifier/wallet binding.</td></tr><tr><td>Timing</td><td>Test-friendly configuration may be used during controlled testing.</td><td>Governance durations and economic parameters are final deployed Community policy.</td></tr><tr><td>Deployments</td><td>Addresses can change during release hardening.</td><td>Address changes require explicit governance/upgrade policy and published release notes.</td></tr><tr><td>Security program</td><td>Responsible disclosure is encouraged with test-only scope.</td><td>Mainnet bounty and recognition policy finalized before launch.</td></tr></tbody></table>
      <h2>Minimal first test</h2>
      <ol class="numbered-flow"><li>Configure wallet for Arc Testnet and confirm its chain ID is <code>5042002</code>.</li><li>Open the dApp Profile page and use clearly labelled Demo verification; approve the onchain transaction.</li><li>Choose one focused V2 or V3 action. Do not attempt a whole protocol flow on a first run.</li><li>Wait for receipt success, record the transaction hash and compare UI state with direct contract reads or explorer logs.</li><li>Use the troubleshooting page for an unexpected state mismatch; use private disclosure only for security impact.</li></ol>
      <div class="callout danger"><strong>Testnet access is not permission to test destructively.</strong> Use accounts and assets you control. Do not spam contracts, create load, interact with other users' balances or publish an exploit before a private report is reviewed.</div>
    `,
  },
  {
    slug: "arc-testnet-deployments",
    section: "Infrastructure & operations",
    group: "Network & access",
    title: "Arc Testnet deployments",
    summary: "Full current addresses for BERT V2, shared infrastructure and V3 Factory release, with source and start-block metadata.",
    tags: ["arc", "testnet", "addresses", "deployments", "v2", "v3", "contracts"],
    content: `
      <p class="eyebrow">Arc Testnet / Deployment registry</p><h1>Full addresses.<br /><span>One current release.</span></h1>
      <p class="lead">The table below is the current Arc Testnet integration release recorded on 2026-09-09. It contains the public addresses a developer can call. Implementation and ProxyAdmin metadata remains in the versioned core deployment manifest for audit and operations, not in this integration table.</p>
      <div class="callout warning"><strong>Before integrating:</strong> compare these values with <code>bert-core/deployments/arc-testnet-v3.json</code> and the current frontend deployment profile. If a later release supersedes this table, treat the manifest as authoritative and update docs in the same release.</div>
      <h2>Network and shared infrastructure</h2>
      <table><thead><tr><th>Contract</th><th>Call address</th><th>Use</th></tr></thead><tbody><tr><td>Arc Testnet</td><td><code>5042002</code></td><td>Required chain ID for all testnet writes.</td></tr><tr><td>USDC-compatible token</td><td><code>0x3600000000000000000000000000000000000000</code></td><td>Settlement unit configured for the release.</td></tr><tr><td>RolesRegistryUpgradeable</td><td><code>0xf15c6213666EB4c09f594567DEf1345E2899BCC7</code></td><td>V2 protocol roles and shared role checks.</td></tr><tr><td>PoPVerifierUpgradeable</td><td><code>0xb8E2CB14F99E1a17C3Eee5863272A7F6dAF3C62b</code></td><td>Shared V2/V3 protected-action verifier.</td></tr><tr><td>RoleBootstrapDistributor</td><td><code>0xb0CA3E4F33994EAFe34a6257a0b904b8179A1b30</code></td><td>Testnet role bootstrap/distribution utility.</td></tr></tbody></table>
      <h2>V2 contract addresses</h2>
      <table><thead><tr><th>Contract</th><th>Call address</th><th>Use</th></tr></thead><tbody><tr><td>IdeaRegistryUpgradeable</td><td><code>0xE6563acfdc194Ba3861EfD928Bd8B1B33a5D29d5</code></td><td>Ideas, author stakes and lifecycle state.</td></tr><tr><td>FundingPoolUpgradeable</td><td><code>0x5eDdccd772a9E0F079cC6646b529C20e3D46e585</code></td><td>V2 escrow, reserve and V3 Factory configuration.</td></tr><tr><td>VotingSystemUpgradeable</td><td><code>0xD008fC96902A9680FF77305881Ad6C6C075e7a68</code></td><td>Global V2 rounds and vote entrypoint.</td></tr><tr><td>GrantManagerUpgradeable</td><td><code>0xA110baB4562d59d8bb7eDA4a05E53F40c678ccB2</code></td><td>Winning grant claim and milestone review entrypoint.</td></tr><tr><td>VoterProgressionUpgradeable</td><td><code>0xF6EB65957bb5e363FCD6B84AAdf76E41Ba754E14</code></td><td>Voter progression, levels and winning-participation state.</td></tr><tr><td>ReputationSystemUpgradeable</td><td><code>0x3594C46983460733F6470f7b61De2f3bB2918a81</code></td><td>Contributor reputation initialization and outcome updates.</td></tr></tbody></table>
      <h2>V3 Factory release addresses</h2>
      <table><thead><tr><th>Contract</th><th>Call address</th><th>Use</th></tr></thead><tbody><tr><td>CommunityFactory</td><td><code>0x811fFb3B53d43e608Ee4dF854aa1BdC471F37589</code></td><td>Canonical Community discovery and creation entrypoint.</td></tr><tr><td>CommunityTreasuryDeployer</td><td><code>0x84594a42E59789C687e9397a994D71CFfa522409</code></td><td>Factory dependency that deploys paired Treasuries.</td></tr><tr><td>CommunityAdminActions library</td><td><code>0x5EA79A8a98f588aa342f53baCBC8729A6Ea1177E</code></td><td>Linked Factory library for Community Admin action creation/execution.</td></tr></tbody></table>
      <h2>Release anchors</h2>
      <table><thead><tr><th>Anchor</th><th>Value</th><th>Why indexers need it</th></tr></thead><tbody><tr><td>V3 Factory deployment block</td><td><code>61277385</code></td><td>Start V3 Factory event indexing here, not at block zero.</td></tr><tr><td>FundingPool V3 configuration transaction</td><td><code>0x64f72f6faa86dab29a674a8da8ded1e4440661f31e15d16a1f966f33530e0dd8</code></td><td>Auditable record linking current FundingPool configuration to the V3 Factory release.</td></tr><tr><td>IdeaRegistry upgrade transaction</td><td><code>0x770192ab591bd70c08c2a21fb20b02babc5abbf1dcb02ea37e236238f1398d30</code></td><td>Release audit anchor for the current V2 proxy implementation.</td></tr><tr><td>FundingPool upgrade transaction</td><td><code>0x7f66bc89ee0bff9508a2ca58af4345acc3aefe6a48dfed560d57ad3ff03706ec</code></td><td>Release audit anchor for current FundingPool implementation.</td></tr></tbody></table>
      <h2>Copy-ready client configuration</h2>
      <pre><code>NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_ROLES_REGISTRY_ADDRESS=0xf15c6213666EB4c09f594567DEf1345E2899BCC7
NEXT_PUBLIC_POP_VERIFIER_ADDRESS=0xb8E2CB14F99E1a17C3Eee5863272A7F6dAF3C62b
NEXT_PUBLIC_IDEA_REGISTRY_ADDRESS=0xE6563acfdc194Ba3861EfD928Bd8B1B33a5D29d5
NEXT_PUBLIC_FUNDING_POOL_ADDRESS=0x5eDdccd772a9E0F079cC6646b529C20e3D46e585
NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS=0xD008fC96902A9680FF77305881Ad6C6C075e7a68
NEXT_PUBLIC_GRANT_MANAGER_ADDRESS=0xA110baB4562d59d8bb7eDA4a05E53F40c678ccB2
NEXT_PUBLIC_VOTER_PROGRESSION_ADDRESS=0xF6EB65957bb5e363FCD6B84AAdf76E41Ba754E14
NEXT_PUBLIC_REPUTATION_SYSTEM_ADDRESS=0x3594C46983460733F6470f7b61De2f3bB2918a81
NEXT_PUBLIC_V3_FACTORY_ADDRESS=0x811fFb3B53d43e608Ee4dF854aa1BdC471F37589
NEXT_PUBLIC_V3_EVENT_FROM_BLOCK=61277385</code></pre>
      <div class="callout info"><strong>Community Hub and Treasury addresses are dynamic.</strong> Do not add a static list of Community addresses to application configuration. Resolve each active pair from Factory <code>CommunityCreated</code> events or <code>getCommunity</code>.</div>
    `,
  },
  {
    slug: "arc-testnet-subgraphs",
    section: "Infrastructure & operations",
    group: "Deployments & indexing",
    title: "V2/V3 subgraph operations",
    summary: "Deploy, configure, test and monitor BERT's separate V2 and V3 indexing domains on Arc Testnet.",
    tags: ["arc", "subgraph", "graphql", "indexing", "factory", "start-block"],
    content: `
      <p class="eyebrow">Arc Testnet / Indexer operations</p><h1>Two domains.<br /><span>One release discipline.</span></h1>
      <p class="lead">V2 and V3 must be indexed independently. V2 is a known set of global contracts. V3 begins with one Factory and expands through dynamic Hub/Treasury templates after each canonical Community activation. Keeping the domains separate avoids mixing V2 round IDs with V3 proposal IDs and avoids global log scans across unknown Community deployments.</p>
      <h2>V2 versus V3 source map</h2>
      <table><thead><tr><th>Index</th><th>Static sources</th><th>Discovers</th><th>Primary entities</th></tr></thead><tbody><tr><td>V2 subgraph</td><td>VotingSystem, IdeaRegistry, FundingPool, GrantManager</td><td>No dynamic contract set required.</td><td>Ideas, rounds, votes, reviews, distributions, payouts and milestone requests.</td></tr><tr><td>V3 subgraph</td><td>CommunityFactory at <code>0x811f...7589</code>, from <code>61277385</code></td><td>Hub/Treasury templates only after <code>CommunityCreated</code>.</td><td>Communities, members, proposals, validator decisions, Binary/Slate votes, epochs, withdrawals and Admin actions.</td></tr></tbody></table>
      <h2>Configure V3 manifest</h2>
      <p>The V3 repository ships a template manifest. Build the final manifest from the current Factory address and deployment block before code generation/deployment. Pinning the source prevents the exact <code>pruned history unavailable</code> failure seen when querying a public RPC from genesis.</p>
      <pre><code>cd bert-frontend/subgraph-v3
export V3_FACTORY_ADDRESS=0x811fFb3B53d43e608Ee4dF854aa1BdC471F37589
export V3_EVENT_FROM_BLOCK=61277385

npm run configure-manifest
npm run codegen
npm run build
# Deploy with the Graph Studio key only in your local secure environment.</code></pre>
      <h2>Indexer correctness contract</h2>
      <ol class="numbered-flow"><li>Factory reservation event creates a pending Community record.</li><li><code>CommunityCreated</code> promotes it to active and creates Hub/Treasury dynamic sources.</li><li>Hub events update governance state; Treasury events update its economic ledger.</li><li>Every entity ID includes address/Community scope so local numeric IDs cannot collide.</li><li>Fresh direct reads supersede indexed state for any transaction preflight.</li></ol>
      <h2>Health checks before publishing an endpoint</h2>
      <table><thead><tr><th>Check</th><th>Expected result</th><th>Failure interpretation</th></tr></thead><tbody><tr><td>Factory entity</td><td>Current Factory source address and deployment-block history appear.</td><td>Wrong manifest address or indexing started too late/early.</td></tr><tr><td>Community creation</td><td>One activated Community appears with matching Hub/Treasury addresses.</td><td>Missing dynamic source creation or Factory event handler.</td></tr><tr><td>Proposal round trip</td><td>Proposal, decision/vote and settlement fields converge with Hub/Treasury reads.</td><td>Handler ordering/schema mapping error.</td></tr><tr><td>Pagination</td><td>Stable ordering does not duplicate/skip entity IDs across pages.</td><td>Unstable sort key or missing cursor condition.</td></tr><tr><td>Freshness</td><td>Indexer block is visible in monitoring and lags within target.</td><td>Do not use endpoint as sole action authority.</td></tr></tbody></table>
      <h2>GraphQL operational query</h2>
      <pre><code>query IndexerSmokeTest {
  communities(first: 5, orderBy: createdAt, orderDirection: desc) {
    id communityId name hub treasury active createdAt
    proposals(first: 3, orderBy: createdAt, orderDirection: desc) {
      proposalId status origin mode settled
    }
  }
}</code></pre>
      <div class="callout warning"><strong>Never expose Graph Studio deploy keys to the browser.</strong> The frontend needs only the deployed query endpoint. Manifest generation and subgraph deployment belong in local/CI operator environments.</div>
    `,
  },
  {
    slug: "arc-testnet-judge-flow",
    section: "Infrastructure & operations",
    group: "Testing & security",
    title: "Judge and tester walkthrough",
    summary: "A concise, deterministic Arc Testnet journey for ETHOnline judges, testers and bug-bounty researchers.",
    tags: ["ethonline", "judges", "testnet", "demo", "v2", "v3", "walkthrough"],
    content: `
      <p class="eyebrow">Arc Testnet / Guided test</p><h1>Test the protocol<br /><span>without waiting for days.</span></h1>
      <p class="lead">The dApp is configured for a focused demonstration flow on Arc Testnet. The purpose is not to simulate production economics or claim real value. It is to let a judge or tester prove that BERT's real contracts, backend verification path and indexed UI are connected correctly.</p>
      <h2>Before starting</h2>
      <table><thead><tr><th>Requirement</th><th>Why</th><th>How to check</th></tr></thead><tbody><tr><td>Compatible browser wallet</td><td>Every write is a real Arc Testnet wallet signature.</td><td>Connect account through dApp header.</td></tr><tr><td>Arc Testnet selected</td><td>All deployment addresses are for chain <code>5042002</code>.</td><td>Wallet network label must show Arc Testnet.</td></tr><tr><td>Test USDC and gas</td><td>Entry, proposal and vote paths pull test USDC and use test gas.</td><td>Wallet asset list/balance.</td></tr><tr><td>Demo verification</td><td>Protected V2/V3 paths require an active PoP record.</td><td>Profile shows verified after onchain confirmation.</td></tr></tbody></table>
      <h2>Five-minute V3 walkthrough</h2>
      <ol class="numbered-flow"><li><strong>Verify.</strong> Open Profile and choose <em>Use demo verification</em>. Confirm the wallet transaction; do not use a World simulator.</li><li><strong>Create.</strong> Open Community Layer → Create. Use test-friendly timing values, choose distinct Admin/Validator addresses, reserve Treasury, deploy Hub and activate.</li><li><strong>Join.</strong> With a verified non-role wallet, approve the local Treasury for entry stake and call <code>joinCommunity</code>.</li><li><strong>Govern.</strong> Create an Admin Binary proposal, open voting, cast a member vote and settle after configured Community time.</li><li><strong>Inspect.</strong> Copy Hub/Treasury addresses, inspect receipt logs and compare Community UI with Factory/Hub/Treasury reads.</li></ol>
      <h2>Focused V2 walkthrough</h2>
      <ol class="numbered-flow"><li>Demo-verify the wallet and approve FundingPool for the required test USDC amount.</li><li>Create an idea through IdeaRegistry. Confirm <code>IdeaCreated</code>.</li><li>When a round is available, inspect live round state, vote once with a non-author wallet and inspect <code>VoteCast</code>.</li><li>After deadline, call permissionless settlement and inspect <code>VotingRoundEnded</code>.</li><li>For a winner, use <code>canClaimGrant</code> before the author claim/milestone route.</li></ol>
      <h2>Expected behavior that may look unusual</h2>
      <table><thead><tr><th>Observation</th><th>Expected explanation</th></tr></thead><tbody><tr><td>Demo verification is available to different test wallets.</td><td>Correct: it tests wiring, not unique-human resistance.</td></tr><tr><td>Community action needs multiple wallet confirmations.</td><td>Correct: Admin control and withdrawals respect immutable quorum.</td></tr><tr><td>Validator reward is zero after an Admin proposal.</td><td>Correct: Admin proposals bypass validator review and do not create validator reward allocation.</td></tr><tr><td>NO-side Binary voter must claim a refund manually.</td><td>Correct: refunds are pull-based Treasury liabilities.</td></tr><tr><td>Subgraph list updates after receipt delay.</td><td>Correct: direct receipt/read is immediate; indexing is asynchronous.</td></tr></tbody></table>
      <h2>Useful evidence for a report</h2><p>For normal feedback or a bug report, include network, wallet address, contract address, transaction hash, exact page/action, expected behavior, observed behavior and a screenshot. For suspected security impact, use the private disclosure route and do not publish a proof that could harm other testers.</p>
      <div class="callout info"><strong>Time controls:</strong> Local development may use minute-scale timing. Arc Testnet deployment policy should be displayed by the dApp and read from the deployed Community configuration. A judge should test the configured flow rather than assume a mainnet-duration governance window.</div>
    `,
  },
  {
    slug: "arc-testnet-demo-pop",
    section: "Infrastructure & operations",
    group: "Verification & backend",
    title: "Demo PoP technical reference",
    summary: "Exact Arc-Testnet Demo PoP boundaries, request lifecycle, replay controls, backend configuration and production replacement plan.",
    tags: ["arc", "pop", "demo", "backend", "verification", "world-id", "security"],
    content: `
      <p class="eyebrow">Arc Testnet / Verification</p>
      <h1>Demo PoP is a test gate.<br /><span>It is not human proof.</span></h1>
      <p class="lead">BERT needs an accessible way for every Arc Testnet tester to execute contracts protected by PoPVerifierUpgradeable. Demo PoP supplies that path while deliberately making no claim of uniqueness, liveness, identity or Sybil resistance. The same onchain verifier still checks signer trust, wallet binding, nonce and expiry; the provider assertion is what changes for testnet.</p>
      <h2>Threat-model boundary</h2>
      <table>
        <thead><tr><th>Property</th><th>Demo PoP on Arc Testnet</th><th>Production World ID direction</th></tr></thead>
        <tbody>
          <tr><td>Wallet-bound proof</td><td>Yes. Backend response is generated for one submitted wallet address.</td><td>Yes. Proof is bound to a verified wallet after backend validation.</td></tr>
          <tr><td>Onchain nonce / expiry</td><td>Yes. PoPVerifier applies its ordinary payload checks.</td><td>Yes.</td></tr>
          <tr><td>Trusted backend signer</td><td>Yes. Onchain configured signer must match backend signing key.</td><td>Yes, with production key management and rotation procedure.</td></tr>
          <tr><td>One human, one credential</td><td>No. Different test wallets can obtain Demo records.</td><td>Required policy: World nullifier must bind durably to one BERT wallet.</td></tr>
          <tr><td>World credential</td><td>No World credential is requested or simulated.</td><td>Validated World proof at the selected production credential level.</td></tr>
        </tbody>
      </table>
      <div class="callout danger"><strong>Never call Demo PoP “verification of a person”.</strong> In product copy, testing material and bug-bounty rules, call it Demo verification or a test access gate. It exists to test BERT integration paths, not to secure production governance.</div>
      <h2>End-to-end sequence</h2>
      <div class="state-track">
        <div><small>01 CLIENT</small><strong>Request demo proof</strong><span>Frontend sends wallet address and Arc chain ID to backend over HTTPS.</span></div>
        <div><small>02 BACKEND</small><strong>Apply hard gate</strong><span>Endpoint requires <code>POP_DEMO_ENABLED=true</code> and chain <code>5042002</code>.</span></div>
        <div><small>03 SIGN</small><strong>Create test payload</strong><span>Backend signs a payload marked <code>BERT_TESTNET_DEMO</code>.</span></div>
        <div><small>04 WALLET</small><strong>Submit onchain</strong><span>Wallet sends payload to PoPVerifierUpgradeable.</span></div>
        <div><small>05 CONTRACT</small><strong>Record verification</strong><span>Protected V2/V3 actions can now pass the verifier gate until its expiry.</span></div>
      </div>
      <h2>Backend endpoint contract</h2>
      <p>The backend exposes a dedicated test-only endpoint at <code>POST /api/pop/demo-proof</code>. It must never become a generic signing endpoint. The caller supplies the connected wallet and target chain; server code validates the address and rejects every chain other than <code>5042002</code>. The endpoint returns an error rather than silently producing a proof for another environment.</p>
      <pre><code>POST https://bert-backend-arc.vercel.app/api/pop/demo-proof
content-type: application/json

{
  "walletAddress": "0xYourConnectedWallet",
  "chainId": 5042002
}

// The frontend submits the returned signed verification payload to the
// deployed PoPVerifierUpgradeable. The backend does not mutate onchain state.</code></pre>
      <h2>Required backend configuration</h2>
      <table>
        <thead><tr><th>Variable</th><th>Purpose</th><th>Arc Testnet rule</th></tr></thead>
        <tbody>
          <tr><td><code>CHAIN_ID</code></td><td>Network assertion for backend responses.</td><td>Must be <code>5042002</code>.</td></tr>
          <tr><td><code>POP_VERIFIER_ADDRESS</code></td><td>Verifier whose trusted signer and payload domain the backend targets.</td><td>Must equal deployed Arc PoPVerifier address in release manifest.</td></tr>
          <tr><td><code>POP_SIGNER_PRIVATE_KEY</code></td><td>Signs payload accepted by verifier.</td><td>Secret server-only value; public address must match verifier configured signer.</td></tr>
          <tr><td><code>POP_DEMO_ENABLED</code></td><td>Explicit opt-in for Demo endpoint.</td><td>True only for Arc Testnet backend deployment.</td></tr>
          <tr><td><code>WORLD_RP_SIGNING_KEY</code></td><td>Reserved World RP signing configuration.</td><td>Not a substitute for Demo signer and never expose to client.</td></tr>
        </tbody>
      </table>
      <h2>Failure modes and exact checks</h2>
      <table>
        <thead><tr><th>Failure</th><th>Meaning</th><th>Operator check</th></tr></thead>
        <tbody>
          <tr><td>Backend <code>500</code> on health</td><td>Configuration parser rejected a missing/malformed secret or address.</td><td>Read Vercel function logs. Confirm 32-byte hex key formatting without quotes/whitespace.</td></tr>
          <tr><td>Backend returns <code>403</code></td><td>Demo gate off or backend not configured for Arc chain.</td><td>Check <code>POP_DEMO_ENABLED</code> and <code>CHAIN_ID</code>.</td></tr>
          <tr><td>Onchain proof reverts</td><td>Signer/domain/nonce/expiry/wallet did not satisfy verifier.</td><td>Compare backend signer public address with PoPVerifier trusted signer and retry with a fresh payload.</td></tr>
          <tr><td>Protected action still reverts</td><td>Verification may have expired or wrong wallet submitted action.</td><td>Read verifier record for exact connected account and use fresh simulation.</td></tr>
          <tr><td>World simulator error</td><td>World sandbox is not part of current Demo PoP flow.</td><td>Do not open World simulator for Arc Demo verification; use dApp Demo path.</td></tr>
        </tbody>
      </table>
      <h2>Production replacement checklist</h2>
      <ol class="numbered-flow">
        <li>Disable Demo endpoint at source and deployment configuration before mainnet.</li>
        <li>Implement World proof verification against the production app/RP policy.</li>
        <li>Persist one accepted World nullifier to one BERT wallet in durable storage with explicit migration/revocation policy.</li>
        <li>Rotate to production signer key and confirm its public address in PoPVerifier governance configuration.</li>
        <li>Run adversarial replay, wrong-wallet, expiry and backend-key rotation tests before enabling protected mainnet actions.</li>
      </ol>
      <div class="callout warning"><strong>World ID is not enabled merely by creating a developer portal app.</strong> The app credential policy, backend validation, wallet binding, signer configuration and onchain verifier must all be configured and tested as one production release.</div>
    `,
  },
  {
    slug: "arc-testnet-environment-runbook",
    section: "Infrastructure & operations",
    group: "Verification & backend",
    title: "Frontend and backend environment runbook",
    summary: "Complete environment-variable boundaries and release order for BERT frontend, backend, core deployment and subgraph operators.",
    tags: ["arc", "environment", "vercel", "frontend", "backend", "secrets", "release"],
    content: `
      <p class="eyebrow">Arc Testnet / Release operations</p>
      <h1>Four deployments.<br /><span>One configuration boundary.</span></h1>
      <p class="lead">BERT's Arc environment spans Core contracts, the frontend dApp, the verification backend and separate V2/V3 subgraphs. A release is complete only when all four agree on the same chain, current addresses and feature policy. Treat configuration as deployable infrastructure, not as a collection of browser defaults.</p>
      <h2>Configuration ownership</h2>
      <table>
        <thead><tr><th>Repository / service</th><th>May contain public addresses</th><th>Must contain only secrets</th></tr></thead>
        <tbody>
          <tr><td><code>bert-core</code></td><td>Deployment manifest, chain ID, contract addresses, deployment transaction hashes.</td><td><code>DEPLOYER_KEY</code>, RPC provider credentials.</td></tr>
          <tr><td><code>bert-front-arc</code></td><td><code>NEXT_PUBLIC_*</code> addresses, chain ID, backend URL, public subgraph endpoints.</td><td>No signing key, no deployer key, no Graph deploy key.</td></tr>
          <tr><td><code>bert-backend-arc</code></td><td>Public health route only.</td><td>PoP signer, World RP signing key, Redis credentials and service API keys.</td></tr>
          <tr><td>Graph Studio / indexer</td><td>Subgraph endpoint and schema can be public after deployment.</td><td>Graph deployment key must stay in local/CI operator scope.</td></tr>
        </tbody>
      </table>
      <h2>Frontend required variables</h2>
      <pre><code>NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_BACKEND_URL=https://bert-backend-arc.vercel.app
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_ROLES_REGISTRY_ADDRESS=0xf15c6213666EB4c09f594567DEf1345E2899BCC7
NEXT_PUBLIC_POP_VERIFIER_ADDRESS=0xb8E2CB14F99E1a17C3Eee5863272A7F6dAF3C62b
NEXT_PUBLIC_IDEA_REGISTRY_ADDRESS=0xE6563acfdc194Ba3861EfD928Bd8B1B33a5D29d5
NEXT_PUBLIC_FUNDING_POOL_ADDRESS=0x5eDdccd772a9E0F079cC6646b529C20e3D46e585
NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS=0xD008fC96902A9680FF77305881Ad6C6C075e7a68
NEXT_PUBLIC_GRANT_MANAGER_ADDRESS=0xA110baB4562d59d8bb7eDA4a05E53F40c678ccB2
NEXT_PUBLIC_V3_FACTORY_ADDRESS=0x811fFb3B53d43e608Ee4dF854aa1BdC471F37589
NEXT_PUBLIC_V3_EVENT_FROM_BLOCK=61277385</code></pre>
      <p>Only values explicitly prefixed <code>NEXT_PUBLIC_</code> can be exposed to a Next.js browser bundle. That does not make them secret; addresses and public endpoints are intentionally inspectable. Never add an RPC credential, signing key or deployment key with this prefix.</p>
      <h2>Backend required variables</h2>
      <pre><code>CHAIN_ID=5042002
POP_VERIFIER_ADDRESS=0xb8E2CB14F99E1a17C3Eee5863272A7F6dAF3C62b
POP_SIGNER_PRIVATE_KEY=0x&lt;64-hex-characters&gt;
WORLD_RP_SIGNING_KEY=0x&lt;64-hex-characters&gt;
POP_DEMO_ENABLED=true
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Never commit these values or copy them into frontend configuration.</code></pre>
      <h2>Vercel release order</h2>
      <div class="state-track">
        <div><small>01 CORE</small><strong>Deploy/verify</strong><span>Deploy contracts, configure FundingPool V3 Factory and write release manifest.</span></div>
        <div><small>02 BACKEND</small><strong>Set secrets/redeploy</strong><span>Update verifier and signer configuration, then verify <code>/api/health</code>.</span></div>
        <div><small>03 SUBGRAPH</small><strong>Build/publish</strong><span>Pin Factory/start block and wait for indexing health.</span></div>
        <div><small>04 FRONTEND</small><strong>Set public config</strong><span>Deploy only after backend and subgraph addresses are confirmed.</span></div>
        <div><small>05 SMOKE TEST</small><strong>Fresh wallet</strong><span>Demo verify, execute one V2 and one V3 flow, then inspect receipts.</span></div>
      </div>
      <h2>Release acceptance matrix</h2>
      <table>
        <thead><tr><th>Check</th><th>Command / action</th><th>Pass condition</th></tr></thead>
        <tbody>
          <tr><td>Backend boot</td><td>Open <code>/api/health</code>.</td><td>Returns <code>{"ok":true,"service":"bert-backend"}</code>.</td></tr>
          <tr><td>Demo endpoint guard</td><td>POST valid Arc request and wrong-chain request.</td><td>Arc succeeds; wrong chain is rejected.</td></tr>
          <tr><td>Frontend configuration</td><td>Open V2 ideas and V3 directory with Arc wallet.</td><td>No “set address” placeholders; reads target current release.</td></tr>
          <tr><td>V3 wiring</td><td>Read FundingPool configured Factory.</td><td>Matches manifest V3 Factory exactly.</td></tr>
          <tr><td>V3 index</td><td>Query Factory/Community entity.</td><td>Source starts at current Factory deployment block.</td></tr>
          <tr><td>Safety</td><td>Run secret scan before push.</td><td>No secrets in Core, frontend or backend history.</td></tr>
        </tbody>
      </table>
      <h2>Rollback principle</h2>
      <p>Never “roll back” deployed contract state by editing a frontend environment value. If a frontend deployment points at an incorrect release, roll the frontend back to the prior known manifest. If a contract release itself is wrong, use the protocol's intended upgrade or redeployment procedure and publish a new manifest/version. Preserve transaction hashes, event start blocks and incident notes so indexers can be reconciled.</p>
      <div class="callout danger"><strong>Secrets must be rotated if they were ever committed or exposed in a deployment log.</strong> Removing a value from a file does not remove it from Git history, Vercel logs or browser bundles. Revoke/rotate first, then remediate history and configuration.</div>
    `,
  },
  {
    slug: "arc-testnet-test-matrix",
    section: "Infrastructure & operations",
    group: "Testing & security",
    title: "Manual test matrix",
    summary: "A reproducible V2/V3 test matrix for release smoke tests, judge demos and regression reporting on Arc Testnet.",
    tags: ["arc", "testnet", "testing", "matrix", "v2", "v3", "regression"],
    content: `
      <p class="eyebrow">Arc Testnet / Quality assurance</p>
      <h1>Test by invariant.<br /><span>Not by lucky clicks.</span></h1>
      <p class="lead">The matrix below turns manual testing into repeatable evidence. Each scenario has a required account class, an observable onchain result and one key negative path. Run it after a contract/configuration release, before a judge demo, and whenever a frontend change modifies transaction construction or action gating.</p>
      <h2>Account setup</h2>
      <table>
        <thead><tr><th>Account</th><th>Role</th><th>Use in tests</th></tr></thead>
        <tbody>
          <tr><td>A</td><td>Creator / Admin</td><td>Creates Community, Admin proposals, action requests and withdrawals.</td></tr>
          <tr><td>B</td><td>Second Admin</td><td>Tests immutable quorum approval/execution and handover safety.</td></tr>
          <tr><td>V</td><td>Validator</td><td>Tests validation decision, reward epoch activity and role protection.</td></tr>
          <tr><td>M</td><td>Active Member</td><td>Tests join, Member proposals and voter behavior.</td></tr>
          <tr><td>X</td><td>Unverified / unrelated wallet</td><td>Tests PoP, membership and role-negative paths.</td></tr>
        </tbody>
      </table>
      <h2>Cross-cutting prerequisites</h2>
      <ul>
        <li>Every participating account is connected to Arc Testnet <code>5042002</code>.</li>
        <li>Accounts used in protected flows completed Demo verification through the dApp and confirmed the onchain verifier transaction.</li>
        <li>Each account has enough test gas and USDC-compatible balance for the exact stake/bond/vote amount.</li>
        <li>Before every capital-moving action, the ERC-20 allowance is checked against the actual spender address.</li>
        <li>Every expected result is captured with transaction hash and direct post-receipt contract read.</li>
      </ul>
      <h2>V2 functional matrix</h2>
      <table>
        <thead><tr><th>ID</th><th>Scenario</th><th>Expected onchain result</th><th>Negative assertion</th></tr></thead>
        <tbody>
          <tr><td>V2-01</td><td>Verified A approves FundingPool and creates an idea.</td><td><code>IdeaCreated</code>; Registry status is <code>Pending</code>; author stake recorded.</td><td>X without active test verifier record cannot pass protected creation when gate is enabled.</td></tr>
          <tr><td>V2-02</td><td>Try title/description invalid input in UI and contract simulation.</td><td>UI blocks malformed input; contract simulation returns matching custom error.</td><td>No wallet signature prompt is sent for locally invalid input.</td></tr>
          <tr><td>V2-03</td><td>Start a round with enough pending ideas.</td><td><code>VotingRoundStarted</code>; selected ideas become <code>Voting</code>.</td><td>Starting with insufficient/invalid pending batch reverts.</td></tr>
          <tr><td>V2-04</td><td>M votes for an eligible non-authored idea.</td><td><code>VoteCast</code>; FundingPool per-round/idea balance increases.</td><td>Second vote by M in same round reverts.</td></tr>
          <tr><td>V2-05</td><td>Idea author tries to vote for own idea.</td><td>Transaction is rejected by self-vote guard.</td><td>Frontend never marks optimistic vote success.</td></tr>
          <tr><td>V2-06</td><td>Settle after deadline with a non-zero winner.</td><td><code>VotingRoundEnded</code>; one idea <code>WonVoting</code>, others rejected.</td><td>Settlement at/before deadline reverts.</td></tr>
          <tr><td>V2-07</td><td>Winning author calls grant claim.</td><td>Initial payout and protocol-reserve route follow onchain distribution; status becomes <code>Funded</code>.</td><td>Non-author cannot claim the winner's grant.</td></tr>
          <tr><td>V2-08</td><td>Author submits milestone; reviewers approve threshold.</td><td>Milestone event and tranche transfer; status advances.</td><td>Author cannot review their own request; duplicate reviewer vote fails.</td></tr>
          <tr><td>V2-09</td><td>Reviewers reject a milestone then author resubmits.</td><td>Request closes; retry accepted only after cooldown.</td><td>Immediate resubmission reverts with cooldown active.</td></tr>
        </tbody>
      </table>
      <h2>V3 Community creation matrix</h2>
      <table>
        <thead><tr><th>ID</th><th>Scenario</th><th>Expected onchain result</th><th>Negative assertion</th></tr></thead>
        <tbody>
          <tr><td>V3-01</td><td>A reserves config through Factory.</td><td>Reservation/Treasury creation event records ID, config hash and intended metadata.</td><td>Malformed role overlap or configuration fails before an active Community exists.</td></tr>
          <tr><td>V3-02</td><td>A deploys matching Hub and activates it.</td><td><code>CommunityCreated</code>; Factory returns canonical Hub/Treasury pair.</td><td>Different creator/config/Treasury cannot activate the reservation.</td></tr>
          <tr><td>V3-03</td><td>M approves local Treasury and joins.</td><td><code>MemberJoined</code>; Treasury locks entry stake.</td><td>Admin/Validator cannot join as active Member.</td></tr>
          <tr><td>V3-04</td><td>M requests then finalizes exit after conditions clear.</td><td>Cooldown and blockers enforced; stake released once.</td><td>Exit with unresolved proposal/vote lock or unfinished cooldown reverts.</td></tr>
          <tr><td>V3-05</td><td>A creates Admin Binary proposal and opens voting.</td><td>Proposal enters live voting without validator review.</td><td>Validator reward allocation is zero for this Admin lane.</td></tr>
          <tr><td>V3-06</td><td>M creates Member proposal; V validates.</td><td>Bond locks; decision event updates counts; eligible proposal advances after threshold.</td><td>Same validator cannot decide twice; non-validator cannot decide.</td></tr>
          <tr><td>V3-07</td><td>Finalize unresolved validation after deadline.</td><td>Permissionless finalization produces correct approval/rejection state.</td><td>Early finalization while window is still open reverts.</td></tr>
        </tbody>
      </table>
      <h2>V3 settlement and Treasury matrix</h2>
      <table>
        <thead><tr><th>ID</th><th>Scenario</th><th>Expected onchain result</th><th>Negative assertion</th></tr></thead>
        <tbody>
          <tr><td>V3-08</td><td>Binary YES wins.</td><td>YES routes execution less Member-validation reward share where applicable; NO routes reserve.</td><td>Second settlement attempt fails.</td></tr>
          <tr><td>V3-09</td><td>Binary NO/tie wins.</td><td>NO-side refund liability exists; voter can claim exactly once.</td><td>YES voter cannot claim NO refund.</td></tr>
          <tr><td>V3-10</td><td>Admin creates and settles Slate round.</td><td>One deterministic winner; full round escrow settles into execution; no validator share.</td><td>Member cannot vote twice/select two proposals in the same round.</td></tr>
          <tr><td>V3-11</td><td>Member Slate settles after validation.</td><td>Winning/losing proposal states and local reward route follow configured policy.</td><td>Unapproved Member proposal cannot enter Member Slate round.</td></tr>
          <tr><td>V3-12</td><td>Finalize/claim validator reward epoch.</td><td>Eligible active Validator claims once after finalization.</td><td>Inactive validator or duplicate claimant reverts.</td></tr>
          <tr><td>V3-13</td><td>A creates withdrawal, B approves, then execute.</td><td>Reserved execution becomes transferred only at quorum.</td><td>Single Admin cannot execute a 2-of-N request.</td></tr>
          <tr><td>V3-14</td><td>Admins cancel pending withdrawal through action queue.</td><td>Cancellation after action quorum releases reservation.</td><td>Direct withdrawal cancellation is unavailable.</td></tr>
        </tbody>
      </table>
      <h2>Result template</h2>
      <pre><code>Test ID: V3-13
Network: Arc Testnet (5042002)
Release manifest: 2026-09-09
Accounts: A=0x..., B=0x...
Contract: CommunityTreasury 0x...
Expected invariant: withdrawal cannot execute below immutable Admin threshold
Transaction hash: 0x...
Post-receipt read: approvalCount=2, executed=true, reservedExecutionBalance updated
Result: PASS / FAIL
Notes: explorer link, screenshot, decoded events</code></pre>
      <div class="callout info"><strong>Regression discipline:</strong> a test is not complete because MetaMask reports success. Confirm the expected event and read the contract state that represents the invariant.</div>
    `,
  },
  {
    slug: "arc-testnet-observability",
    section: "Infrastructure & operations",
    group: "Deployments & indexing",
    title: "Observability and incident response",
    summary: "Monitor the contracts, backend and subgraphs; classify incidents and preserve evidence without exposing secrets.",
    tags: ["arc", "monitoring", "observability", "incidents", "backend", "subgraph", "rpc"],
    content: `
      <p class="eyebrow">Arc Testnet / Observability</p>
      <h1>See the release.<br /><span>Before users feel it.</span></h1>
      <p class="lead">A testnet still needs observability. Most user-facing failures are not Solidity failures: a backend secret is malformed, frontend points to an old Factory, an indexer is behind, or an RPC cannot serve a wide historical query. Monitor every boundary and use contract reads to distinguish infrastructure lag from onchain state.</p>
      <h2>Signals to monitor</h2>
      <table>
        <thead><tr><th>Layer</th><th>Signal</th><th>Healthy condition</th><th>Response if unhealthy</th></tr></thead>
        <tbody>
          <tr><td>Frontend</td><td>Connected chain + configured address availability</td><td>Wallet is on <code>5042002</code>; no missing configuration fallback appears.</td><td>Stop transaction UX; compare deployed environment to manifest.</td></tr>
          <tr><td>Backend</td><td><code>GET /api/health</code></td><td>Returns <code>{"ok":true,"service":"bert-backend"}</code>.</td><td>Inspect function logs for environment parse error; do not retry verifier blindly.</td></tr>
          <tr><td>PoP</td><td>Fresh Demo proof completes onchain</td><td>Test wallet obtains active record and protected call simulates.</td><td>Compare backend signer public address with PoPVerifier configuration.</td></tr>
          <tr><td>RPC</td><td>Bounded read/log query latency and error rate</td><td>Current contract reads work; source-block event scans do not request pruned history.</td><td>Use fallback provider/subgraph for history; preserve direct-read authority.</td></tr>
          <tr><td>V2/V3 subgraphs</td><td>Indexed block/freshness and smoke query</td><td>New release source and test entities appear within expected lag.</td><td>Inspect manifest address/start block/templates; do not rewrite onchain UI outcome.</td></tr>
        </tbody>
      </table>
      <h2>Incident categories</h2>
      <table>
        <thead><tr><th>Category</th><th>Example</th><th>Immediate action</th><th>Escalation</th></tr></thead>
        <tbody>
          <tr><td>Configuration</td><td>Frontend uses stale V3 Factory.</td><td>Disable affected CTA, confirm manifest and redeploy frontend.</td><td>Release incident; no contract change unless wiring onchain is wrong.</td></tr>
          <tr><td>Backend secret</td><td>Health function crashes due invalid 32-byte signing key.</td><td>Rotate/correct secret and redeploy backend.</td><td>Security incident if key may have been exposed.</td></tr>
          <tr><td>Indexer lag</td><td>Transaction receipt exists but Community is absent from directory.</td><td>Display receipt/direct read; inspect subgraph source and sync status.</td><td>Indexer operations issue.</td></tr>
          <tr><td>RPC limitation</td><td><code>pruned history unavailable</code>.</td><td>Bound query to deployment block and use indexed history.</td><td>Provider issue; not protocol incident.</td></tr>
          <tr><td>Protocol invariant</td><td>Unexpected unauthorized transfer or double claim.</td><td>Stop reproduction at minimum impact, preserve evidence privately.</td><td>Security response and private advisory workflow.</td></tr>
        </tbody>
      </table>
      <h2>Evidence packet</h2>
      <pre><code>Timestamp (UTC):
Environment + Git commit:
Arc chain ID and RPC endpoint class:
Wallet / affected contract address:
Transaction hash or request ID:
Function and arguments (no secrets):
Expected contract invariant:
Observed receipt/log/read result:
Backend request ID or Vercel function log ID if relevant:
Indexer query and indexed block if relevant:
Severity hypothesis and user impact:
Mitigation already applied:</code></pre>
      <h2>Communication rules</h2>
      <ul>
        <li>Use public issues for reproducible non-sensitive UX, build, documentation and indexer freshness defects.</li>
        <li>Use private security reporting for an exploit, unauthorized access, secret exposure or invariant break.</li>
        <li>Never include signer keys, Redis tokens, World signing keys, Graph deploy keys or raw Vercel environment values in an issue or screenshot.</li>
        <li>When in doubt, redact first and use the private channel. The maintainers can request additional details safely.</li>
      </ul>
      <div class="callout warning"><strong>Pause is not an incident fix by itself.</strong> If a contract is paused, document which module is paused, what user actions are blocked and why. Do not claim funds are unsafe or safe until the relevant accounting state has been read and verified.</div>
    `,
  },
  {
    slug: "arc-mainnet-readiness",
    section: "Infrastructure & operations",
    title: "Mainnet readiness criteria",
    summary: "The explicit conditions BERT intends to satisfy before treating the current Arc Testnet system as eligible for a mainnet proposal.",
    tags: ["mainnet", "readiness", "security", "audit", "world-id", "launch"],
    content: `
      <p class="eyebrow">BERT / Future mainnet policy</p>
      <h1>Mainnet is a decision.<br /><span>Not a testnet deploy.</span></h1>
      <p class="lead">BERT is not declaring a mainnet launch date in these docs. This page records the engineering and governance criteria that should be met before any mainnet proposal. A successful Arc Testnet demo proves integration progress; it does not prove economic, security or operational readiness for real funds.</p>
      <h2>Required readiness domains</h2>
      <table>
        <thead><tr><th>Domain</th><th>Minimum evidence</th><th>Not sufficient on its own</th></tr></thead>
        <tbody>
          <tr><td>Contract correctness</td><td>Complete automated suite, manual matrix pass, static analysis triage and independent review/audit plan.</td><td>One local or testnet happy path.</td></tr>
          <tr><td>Economic policy</td><td>Reviewed stake, fee, quorum, reward and withdrawal parameters with clear user disclosure.</td><td>Values copied from test configuration.</td></tr>
          <tr><td>Identity policy</td><td>Production World ID implementation, nullifier/wallet binding, privacy review and disabled Demo route.</td><td>World Developer Portal app creation or sandbox success.</td></tr>
          <tr><td>Operations</td><td>Key custody, signer rotation, incident response, monitoring, deployment manifest and rollback procedures.</td><td>Environment values stored only in one personal machine.</td></tr>
          <tr><td>Indexer/UI</td><td>Address registry, bounded event sources, freshness monitoring and direct-read safety for critical CTAs.</td><td>A subgraph that works only on a clean local history.</td></tr>
          <tr><td>Governance</td><td>Named authority/upgrade policy and user-visible explanation of immutable versus changeable parameters.</td><td>Implicit founder control or undocumented proxy ownership.</td></tr>
        </tbody>
      </table>
      <h2>Pre-mainnet security checklist</h2>
      <ol class="numbered-flow">
        <li>Freeze a release candidate commit and deployment artifacts for review.</li>
        <li>Run tests, compiler checks, static analysis and dependency/security scans; document triage instead of ignoring output.</li>
        <li>Complete third-party review appropriate to assets and scope, then remediate and retest findings.</li>
        <li>Rotate all testnet/development secrets that could overlap operational infrastructure.</li>
        <li>Run full production-like deployment rehearsal, including Factory/Pool wiring, verifier signer and subgraph configuration.</li>
      </ol>
      <h2>What changes at mainnet</h2>
      <table>
        <thead><tr><th>Testnet component</th><th>Mainnet requirement</th></tr></thead>
        <tbody>
          <tr><td>Demo PoP</td><td>Removed/disabled. Mainnet protected writes require production human-verification policy.</td></tr>
          <tr><td>Test USDC and gas</td><td>Real assets require explicit risk disclosure, security controls and no informal testing.</td></tr>
          <tr><td>Mutable release profiles</td><td>Versioned signed/verified release process with published addresses and start blocks.</td></tr>
          <tr><td>Judge walkthrough timing</td><td>Real governance durations and no test-only bypasses.</td></tr>
          <tr><td>Validator recognition concept</td><td>Deployed governance policy and transparent eligibility/reward terms, not informal promises.</td></tr>
        </tbody>
      </table>
      <div class="callout danger"><strong>No one should transfer real funds based on testnet documentation.</strong> Mainnet documentation will be published only with final addresses, risk notices, deployed governance parameters and verified production identity policy.</div>
    `,
  },
  {
    slug: "arc-testnet-integration-reference",
    section: "Infrastructure & operations",
    group: "Network & access",
    title: "Arc integration quick reference",
    summary: "A practical developer reference for wallet setup, environment variables, direct reads, writes, events and safe fallback behavior on the active Arc Testnet release.",
    tags: ["arc", "testnet", "integration", "viem", "rpc", "events", "environment", "quick-reference"],
    content: `
      <p class="eyebrow">Arc Testnet / Developer quick reference</p>
      <h1>Connect deliberately.<br /><span>Read canonical state.</span></h1>
      <p class="lead">This page is the practical entry point for an integration that needs to interact with BERT on Arc Testnet. It specifies the network identity, the release data that must be supplied at build time, which reads are canonical, when an indexer is appropriate and how to keep a write flow correct when asynchronous services are delayed.</p>

      <h2>Integration contract</h2>
      <p>A BERT client is responsible for four things: it must use the current deployment manifest, force the wallet to Arc Testnet before a write, use the ABI and address of the contract that owns the state, and treat a mined receipt plus direct contract read as authoritative. The frontend may make the experience easier; it may not invent authorization, settlement results or balances.</p>
      <table>
        <thead><tr><th>Question</th><th>Correct source of truth</th><th>Do not use as authority</th></tr></thead>
        <tbody>
          <tr><td>Can this wallet submit a protected action?</td><td>PoPVerifier record plus target contract simulation.</td><td>A cached “Verified” badge or backend success response alone.</td></tr>
          <tr><td>Can an Admin execute a Treasury request?</td><td>CommunityTreasury request state, approvals, threshold and current status.</td><td>An action queue card that has not refreshed after the latest receipt.</td></tr>
          <tr><td>Which Hub/Treasury belongs to a Community?</td><td>Current Factory registry/event data and Factory getter.</td><td>A hand-maintained list of Community addresses.</td></tr>
          <tr><td>Was a vote, settlement or claim successful?</td><td>Transaction receipt, emitted event and post-transaction contract read.</td><td>A wallet popup closing or optimistic UI state.</td></tr>
          <tr><td>Should a historical list be paginated/searched?</td><td>V2/V3 subgraph after its freshness is established.</td><td>Unbounded <code>eth_getLogs</code> from block zero.</td></tr>
        </tbody>
      </table>

      <h2>Network definition</h2>
      <p>Arc Testnet uses chain ID <code>5042002</code>. A client must compare its wallet chain ID immediately before a write. Do not infer the chain from a user-facing network label, and do not silently send a transaction on a connected chain merely because an address has valid EVM syntax.</p>
      <pre><code>import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: {
      http: ["https://rpc.blockdaemon.testnet.arc.io"],
    },
  },
  blockExplorers: {
    default: { name: "ArcScan Testnet", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export async function requireArcTestnet(walletClient) {
  const chainId = await walletClient.getChainId();
  if (chainId !== arcTestnet.id) {
    throw new Error("Switch the wallet to Arc Testnet (5042002) before continuing");
  }
}</code></pre>
      <div class="callout warning"><strong>Native token naming is provider-specific.</strong> Always display the connected wallet's native balance using its network metadata and keep BERT settlement-token amounts separate. The BERT V2/V3 release token address is documented in the deployment registry.</div>

      <h2>Required public environment values</h2>
      <p>Public client configuration can contain chain IDs, contract addresses, deployment blocks, dApp URLs and subgraph endpoints. It must never contain deployer private keys, PoP signing keys, World RP keys, Redis credentials, Graph deploy keys or Vercel tokens. A missing required address is a hard configuration error, not a value to replace with a zero address.</p>
      <pre><code># Required for the active Arc Testnet release
NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_ROLES_REGISTRY_ADDRESS=0xf15c6213666EB4c09f594567DEf1345E2899BCC7
NEXT_PUBLIC_POP_VERIFIER_ADDRESS=0xb8E2CB14F99E1a17C3Eee5863272A7F6dAF3C62b
NEXT_PUBLIC_IDEA_REGISTRY_ADDRESS=0xE6563acfdc194Ba3861EfD928Bd8B1B33a5D29d5
NEXT_PUBLIC_FUNDING_POOL_ADDRESS=0x5eDdccd772a9E0F079cC6646b529C20e3D46e585
NEXT_PUBLIC_VOTING_SYSTEM_ADDRESS=0xD008fC96902A9680FF77305881Ad6C6C075e7a68
NEXT_PUBLIC_GRANT_MANAGER_ADDRESS=0xA110baB4562d59d8bb7eDA4a05E53F40c678ccB2
NEXT_PUBLIC_V3_FACTORY_ADDRESS=0x811fFb3B53d43e608Ee4dF854aa1BdC471F37589
NEXT_PUBLIC_V3_EVENT_FROM_BLOCK=61277385
NEXT_PUBLIC_BACKEND_URL=https://bert-backend-arc.vercel.app</code></pre>
      <p>The public values above are release metadata, not secrets. Their exact source is the versioned manifest <code>bert-core/deployments/arc-testnet-v3.json</code>. If the manifest changes, update the frontend configuration, backend configuration, subgraph source and documentation together as a release.</p>

      <h2>Fail closed at configuration boundaries</h2>
      <pre><code>import { getAddress, isAddress } from "viem";

function requiredAddress(name, value) {
  if (!value || !isAddress(value)) {
    throw new Error(name + " is missing or is not a valid EVM address");
  }
  return getAddress(value);
}

export const contracts = {
  usdc: requiredAddress("NEXT_PUBLIC_USDC_ADDRESS", process.env.NEXT_PUBLIC_USDC_ADDRESS),
  popVerifier: requiredAddress("NEXT_PUBLIC_POP_VERIFIER_ADDRESS", process.env.NEXT_PUBLIC_POP_VERIFIER_ADDRESS),
  ideaRegistry: requiredAddress("NEXT_PUBLIC_IDEA_REGISTRY_ADDRESS", process.env.NEXT_PUBLIC_IDEA_REGISTRY_ADDRESS),
  fundingPool: requiredAddress("NEXT_PUBLIC_FUNDING_POOL_ADDRESS", process.env.NEXT_PUBLIC_FUNDING_POOL_ADDRESS),
  v3Factory: requiredAddress("NEXT_PUBLIC_V3_FACTORY_ADDRESS", process.env.NEXT_PUBLIC_V3_FACTORY_ADDRESS),
};

if (Number(process.env.NEXT_PUBLIC_CHAIN_ID) !== 5042002) {
  throw new Error("This release profile is only valid for Arc Testnet");
}</code></pre>
      <p>Address normalization is useful for comparisons, but never use a normalized string to hide a release mismatch. For example, a FundingPool can contain valid bytecode and still point at a previous V3 Factory. Read its configured Factory and compare it to the manifest before presenting V3 creation as available.</p>

      <h2>Wallet write sequence</h2>
      <div class="state-track">
        <div><small>01 / PRECHECK</small><strong>Wallet + chain</strong><span>Require an account and Arc Testnet before constructing calldata.</span></div>
        <div><small>02 / READ</small><strong>Fresh state</strong><span>Read balances, role/PoP status, window and allowance from current contracts.</span></div>
        <div><small>03 / SIMULATE</small><strong>Same account</strong><span>Use the actual sender, target and arguments to expose custom errors early.</span></div>
        <div><small>04 / WRITE</small><strong>Await receipt</strong><span>Do not label success when a wallet merely accepts the request.</span></div>
        <div><small>05 / RECONCILE</small><strong>Read again</strong><span>Decode events and refresh canonical state before cache/indexer refresh.</span></div>
      </div>
      <pre><code>const { request } = await publicClient.simulateContract({
  account,
  address: contracts.v3Factory,
  abi: communityFactoryAbi,
  functionName: "reserveCommunity",
  args: [configuration],
});

const hash = await walletClient.writeContract(request);
const receipt = await publicClient.waitForTransactionReceipt({ hash });

if (receipt.status !== "success") {
  throw new Error("Arc transaction reverted: " + hash);
}

// Refresh from Factory / Hub / Treasury reads, then invalidate indexer-backed lists.
await refreshCommunityCreationState(receipt);</code></pre>

      <h2>USDC approval is an explicit precondition</h2>
      <p>V2 ideas, V3 Community joining, proposal bonds, votes and Treasury-related flows can require the release settlement token. The correct spender is action-specific: it may be the FundingPool, a Community Treasury or another contract specified by the ABI. Never default to a maximum allowance without a clear user choice, and never assume that approval for one spender grants approval to another.</p>
      <pre><code>const allowance = await publicClient.readContract({
  address: contracts.usdc,
  abi: erc20Abi,
  functionName: "allowance",
  args: [account, spender],
});

if (allowance &lt; requiredAmount) {
  const approvalHash = await walletClient.writeContract({
    account,
    address: contracts.usdc,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, requiredAmount],
  });
  const approvalReceipt = await publicClient.waitForTransactionReceipt({ hash: approvalHash });
  if (approvalReceipt.status !== "success") throw new Error("USDC approval did not succeed");
}</code></pre>
      <table>
        <thead><tr><th>Check before write</th><th>Why it matters</th><th>Expected UX</th></tr></thead>
        <tbody>
          <tr><td><code>balanceOf(account)</code></td><td>Prevents an avoidable signed transaction for an unfunded account.</td><td>Display required amount and shortfall in settlement-token decimals.</td></tr>
          <tr><td><code>allowance(account, spender)</code></td><td>Allowance is scoped to the receiving contract, not to BERT generally.</td><td>Explain the exact spender and request the minimal current action amount.</td></tr>
          <tr><td>Target round/proposal/Treasury state</td><td>Economic values can be valid while the action window is already closed.</td><td>Disable with a state reason, then refresh after receipt/block change.</td></tr>
          <tr><td>PoP / role / membership state</td><td>Protected permissions are evaluated onchain at execution time.</td><td>Do not promise eligibility from an old browser cache.</td></tr>
        </tbody>
      </table>

      <h2>V2 direct read patterns</h2>
      <p>V2 uses global protocol modules. Address users' ideas through IdeaRegistry, round state through VotingSystem, and settlement/custody through FundingPool and GrantManager according to the ABI. The UI can obtain lists from the V2 subgraph, but a proposed write must be simulated against current module state.</p>
      <pre><code>const [idea, round] = await Promise.all([
  publicClient.readContract({
    address: contracts.ideaRegistry,
    abi: ideaRegistryAbi,
    functionName: "getIdea",
    args: [ideaId],
  }),
  publicClient.readContract({
    address: votingSystemAddress,
    abi: votingSystemAbi,
    functionName: "getVotingRound",
    args: [roundId],
  }),
]);

// Convert bigint values only at the presentation boundary.
const isStillLive = BigInt(Math.floor(Date.now() / 1000)) &lt; round.endTime;
if (!isStillLive) throw new Error("The V2 voting window has closed");</code></pre>
      <div class="callout info"><strong>Bigint rule:</strong> retain amounts, timestamps, counters and IDs as <code>bigint</code> in integration logic. Format to strings only at the UI boundary. JavaScript <code>number</code> is not a safe representation for arbitrary uint256 values.</div>

      <h2>V3 Community discovery and direct reads</h2>
      <p>V3 is a Factory-created graph of a Community Hub and a paired Community Treasury. A Community is not identified by a user-supplied address. Start from the current Factory, resolve its canonical record, then use the returned Hub/Treasury pair. This is the same rule for directory pages, deep links and automated integrations.</p>
      <pre><code>const community = await publicClient.readContract({
  address: contracts.v3Factory,
  abi: communityFactoryAbi,
  functionName: "getCommunity",
  args: [communityId],
});

const hub = community.hub;
const treasury = community.treasury;
if (hub === zeroAddress || treasury === zeroAddress) {
  throw new Error("Community ID is not active in the current Factory registry");
}

const [communityState, treasuryState] = await Promise.all([
  publicClient.readContract({ address: hub, abi: communityHubAbi, functionName: "getCommunityState" }),
  publicClient.readContract({ address: treasury, abi: communityTreasuryAbi, functionName: "getTreasuryState" }),
]);</code></pre>
      <table>
        <thead><tr><th>V3 object</th><th>Read it from</th><th>Why it is canonical</th></tr></thead>
        <tbody>
          <tr><td>Community ID → Hub/Treasury pair</td><td>CommunityFactory</td><td>The Factory owns canonical Community creation and discovery.</td></tr>
          <tr><td>Members, Validators, Admins, proposals, rounds</td><td>Community Hub</td><td>The Hub owns local Community governance state.</td></tr>
          <tr><td>Entry stake, bonds, vote escrow, withdrawals, reward epochs</td><td>Community Treasury</td><td>The Treasury owns local economic accounting and transfers.</td></tr>
          <tr><td>Role mutation requests</td><td>Community Hub action queue plus relevant Treasury state</td><td>Quorum and terminal status must be checked at execution time.</td></tr>
          <tr><td>Directory/search/history</td><td>V3 subgraph, reconciled with Factory/Hub reads</td><td>Subgraph is efficient for discovery, but is not a write authority.</td></tr>
        </tbody>
      </table>

      <h2>Event indexing: bounded and verified</h2>
      <p>Arc RPC providers can reject historical log scans with <code>pruned history unavailable</code>. This is a provider retention limit, not evidence that no event exists. V3 Factory event queries begin at deployment block <code>61277385</code>. Community-specific queries begin at the Community creation block returned from the Factory event or indexer record. Paginate long ranges and verify the indexed response against direct reads for safety-critical UI.</p>
      <pre><code>const v3FactoryDeploymentBlock = 61_277_385n;

const logs = await publicClient.getContractEvents({
  address: contracts.v3Factory,
  abi: communityFactoryAbi,
  eventName: "CommunityCreated",
  fromBlock: v3FactoryDeploymentBlock,
  toBlock: "latest",
});

for (const event of logs) {
  // Store event.blockNumber, transactionHash and logIndex for deterministic ordering.
  // Resolve the Factory getter before making a capital-moving action.
  console.log(event.args.communityId, event.args.hub, event.args.treasury);
}</code></pre>
      <p>For product lists, use an indexer query with cursor/limit pagination and display its indexed block or freshness indicator. For a detail page with an executable action, load the record from the indexer for speed and then reconcile the specific role, proposal, round or request through a direct Hub/Treasury read.</p>

      <h2>Suggested GraphQL read boundary</h2>
      <pre><code>query CommunityDirectory($first: Int!, $skip: Int!) {
  communities(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
    id
    communityId
    hub
    treasury
    createdAt
    status
  }
  _meta { block { number timestamp } }
}

# Before enabling a write button, query the selected Community's Hub/Treasury directly.
# Never execute a write from a list-card value that may be behind the indexed block.</code></pre>
      <div class="callout warning"><strong>Do not make the subgraph a trust boundary.</strong> If the endpoint is unavailable or behind, preserve safe direct contract reads and explain that history/search is temporarily degraded. Do not let indexer absence create an authorization bypass or a fabricated balance.</div>

      <h2>Demo PoP integration boundary</h2>
      <p>Arc Testnet uses the BERT Demo PoP path so independent testers can exercise protected V2/V3 flows without one shared World ID simulator identity. The backend creates a test-only payload; the wallet submits it to the deployed PoP verifier; the target contract then applies its normal access gate. The Demo provider is intentionally not proof-of-personhood and must not be exposed as a mainnet feature.</p>
      <pre><code>async function getArcDemoProof(walletAddress) {
  const response = await fetch("https://bert-backend-arc.vercel.app/api/pop/demo-proof", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chainId: 5042002, wallet: walletAddress }),
  });
  if (!response.ok) throw new Error("Demo PoP backend request failed");
  return response.json();
}

// Submit the returned proof using the exact PoPVerifier ABI/version used by BERT.
// Validate recipient is the manifest PoPVerifier address and await final receipt.
// A backend response does not itself grant permissions.</code></pre>
      <table>
        <thead><tr><th>Environment</th><th>Identity path</th><th>Security claim</th><th>Allowed use</th></tr></thead>
        <tbody>
          <tr><td>Arc Testnet</td><td>BERT Demo PoP provider and onchain PoPVerifier record.</td><td>Tests integration mechanics only; no uniqueness/personhood claim.</td><td>End-to-end developer, judge and community-flow testing.</td></tr>
          <tr><td>Future mainnet</td><td>Production World ID flow with backend proof verification and durable nullifier-to-wallet policy.</td><td>Only the final production policy may claim proof-of-personhood properties.</td><td>Protected real-value protocol actions after documented launch approval.</td></tr>
        </tbody>
      </table>

      <h2>Handling asynchronous state</h2>
      <p>Wallets, RPCs, subgraphs and backend functions update on different schedules. Correct UX is explicit about that: show “awaiting wallet”, “transaction submitted”, “confirmed onchain”, then “indexing history” as separate states. A receipt success should unlock state that is confirmed by direct reads; a subgraph result may follow later. Do not show a request as executed merely because it reached Admin quorum if the final execute transaction has not succeeded.</p>
      <table>
        <thead><tr><th>Observed state</th><th>Meaning</th><th>Next client action</th></tr></thead>
        <tbody>
          <tr><td>Wallet request open</td><td>No transaction exists yet.</td><td>Allow cancellation; do not update balances or counts.</td></tr>
          <tr><td>Hash returned</td><td>Node accepted a transaction for processing.</td><td>Link explorer and wait for receipt; retain the hash for recovery.</td></tr>
          <tr><td>Receipt success</td><td>EVM execution succeeded in a block.</td><td>Decode logs and refresh the contract state involved in the action.</td></tr>
          <tr><td>Receipt reverted</td><td>State changed or arguments/permission were invalid.</td><td>Simulate against current state; render decoded error where safe.</td></tr>
          <tr><td>Indexer behind</td><td>History/list UI is stale, not necessarily contract state.</td><td>Show confirmed direct state and retry indexed query with freshness information.</td></tr>
        </tbody>
      </table>

      <h2>Release and incident checklist</h2>
      <ol class="numbered-flow">
        <li>Read the deployment manifest and verify every configured address has non-empty bytecode on Arc Testnet.</li>
        <li>Read FundingPool's configured V3 Factory and compare it to the manifest Factory address.</li>
        <li>Check backend health after each deployment; then complete one fresh Demo PoP transaction to test signer-to-verifier compatibility.</li>
        <li>Query the V3 Factory from block <code>61277385</code> and verify a new Community is indexed by the V3 subgraph.</li>
        <li>Run the V2/V3 matrix scenarios affected by the change, recording receipts and direct reads.</li>
        <li>For a suspected security issue, stop at minimum proof of impact and use the private advisory channel with redacted evidence.</li>
      </ol>

      <h2>Never put these values in public code</h2>
      <table>
        <thead><tr><th>Secret class</th><th>Why it is sensitive</th><th>Correct location</th></tr></thead>
        <tbody>
          <tr><td>Deployer/ProxyAdmin private key</td><td>Can change deployment or upgrade state according to its authority.</td><td>Dedicated secret store and operational signing process.</td></tr>
          <tr><td><code>POP_SIGNER_PRIVATE_KEY</code></td><td>Can sign onchain-verifiable PoP payloads for the configured verifier.</td><td>Backend production environment only; rotate on suspected exposure.</td></tr>
          <tr><td><code>WORLD_RP_SIGNING_KEY</code></td><td>Authenticates World RP payload operations.</td><td>Backend secret environment only, never browser bundle.</td></tr>
          <tr><td>Redis / Upstash credential</td><td>Can expose or mutate backend rate-limit/nullifier binding data.</td><td>Backend secret environment only.</td></tr>
          <tr><td>Graph Studio deploy key</td><td>Can publish or alter an indexed deployment.</td><td>Developer/CI secret, never <code>NEXT_PUBLIC_*</code>.</td></tr>
        </tbody>
      </table>
      <div class="callout danger"><strong>Public contract addresses are safe; keys are not.</strong> If a key is ever pasted into a commit, issue, screenshot, terminal recording or browser variable, revoke/rotate it immediately and assume it is compromised even if the repository is private.</div>
    `,
  },
];
