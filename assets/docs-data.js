window.BERT_DOCS = [
  {
    slug: "overview",
    group: "Start",
    title: "BERT Overview",
    summary: "What BERT is, what it solves, and which modules define the live Arc-first protocol.",
    content: `
      <h1>BERT Protocol Documentation</h1>
      <p class="lead">BERT is programmable USDC-native funding infrastructure for Arc. It turns ideas into funded outcomes through deterministic state transitions, stablecoin voting rounds, treasury accounting, and milestone-based capital release.</p>

      <div>
        <span class="badge">Arc-first</span>
        <span class="badge">USDC-native</span>
        <span class="badge">50 USDC proposal deposit</span>
        <span class="badge">10 USDC vote commitment</span>
        <span class="badge">30 / 40 / 30 release rail</span>
        <span class="badge">Upgradeable proxies</span>
        <span class="badge">Subgraph indexed</span>
      </div>

      <h2>What BERT solves</h2>
      <ul>
        <li>Reduces low-commitment idea spam by requiring a real USDC-backed proposal deposit at submission.</li>
        <li>Replaces opaque lump-sum treasury release with staged execution tied to proof and reviewer validation.</li>
        <li>Keeps live state authoritative on-chain while using The Graph for history, lists, and analytics.</li>
        <li>Provides a capital allocation surface that is easier to audit, integrate, and extend safely over time.</li>
      </ul>

      <h2>Core modules in the live stack</h2>
      <ul>
        <li><strong>IdeaRegistryUpgradeable</strong>: canonical idea records, lifecycle statuses, reviews, low-quality flags, proposal deposit checks.</li>
        <li><strong>VotingSystemUpgradeable</strong>: round creation, voting windows, min commitment, and winner resolution.</li>
        <li><strong>FundingPoolUpgradeable</strong>: proposal deposit accounting, committed vote capital, treasury balance, and reserve logic.</li>
        <li><strong>GrantManagerUpgradeable</strong>: initial claim, milestone proof review, and staged payout execution.</li>
        <li><strong>ReputationSystemUpgradeable</strong>: outcome-based reputation lifecycle.</li>
        <li><strong>VoterProgressionUpgradeable</strong>: winning-vote progression and role unlock counters.</li>
        <li><strong>RolesRegistryUpgradeable</strong>: central source of functional and system roles.</li>
      </ul>

      <div class="callout info">
        <strong>Scope note:</strong> this site documents the current Arc testnet deployment, the live USDC-native contract behavior, and the frontend/subgraph integration model aligned with the Circle and Arc ecosystem.
      </div>
    `,
  },
  {
    slug: "capital-model",
    group: "Start",
    title: "Capital Model",
    summary: "How proposal deposits, voting commitments, treasury accounting, and release stages work together.",
    content: `
      <h1>Capital Model</h1>
      <p class="lead">BERT is designed around one coherent funding surface: proposal deposits, vote commitments, treasury accumulation, and milestone releases all operate in USDC.</p>

      <h2>Headline rules</h2>
      <table>
        <thead>
          <tr><th>Area</th><th>Current live rule</th><th>Why it matters</th></tr>
        </thead>
        <tbody>
          <tr><td>Idea creation</td><td><strong>50 USDC</strong> minimum proposal deposit</td><td>Filters low-commitment submissions and creates economic accountability at entry.</td></tr>
          <tr><td>Vote commitment</td><td><strong>10 USDC</strong> minimum vote amount</td><td>Makes voting economically meaningful while staying accessible.</td></tr>
          <tr><td>Treasury accounting</td><td>Committed USDC flows into FundingPool</td><td>Creates auditable capital accumulation for downstream grant execution.</td></tr>
          <tr><td>Grant release</td><td><strong>30% / 40% / 30%</strong></td><td>Keeps capital tied to proof of execution instead of hype or one-time vote outcome.</td></tr>
          <tr><td>Settlement asset</td><td><strong>USDC</strong></td><td>Unifies deposits, votes, treasury accounting, and payouts in one stable unit.</td></tr>
        </tbody>
      </table>

      <h2>Why Arc matters here</h2>
      <ul>
        <li>Arc is treated as stablecoin settlement infrastructure rather than a generic chain backdrop.</li>
        <li>That makes it a good fit for treasury coordination, transparent capital movement, and grant execution.</li>
        <li>BERT is therefore positioned as builder funding infrastructure for the Arc and Circle ecosystem.</li>
      </ul>

      <h2>Operational consequences</h2>
      <ul>
        <li>Clients must format token amounts with <strong>6 decimals</strong>.</li>
        <li>Wallet UX should clearly separate the Arc gas asset from protocol value transfer in USDC.</li>
        <li>Frontend, docs, and analytics should use the same USDC-native capital allocation language as the live protocol.</li>
      </ul>

      <div class="callout warning">
        <strong>Integration rule:</strong> if a client or docs page still implies “winning a round immediately unlocks the full grant”, it is describing the protocol incorrectly.
      </div>
    `,
  },
  {
    slug: "architecture",
    group: "Protocol",
    title: "Architecture",
    summary: "Authoritative data paths, cross-contract calls, and why BERT keeps state narrowly owned.",
    content: `
      <h1>Architecture</h1>
      <p class="lead">BERT is a modular proxy-based architecture. Each core contract owns a narrow domain and cross-contract writes are explicit, role-gated, and expected to be auditable.</p>

      <h2>Data authority model</h2>
      <ul>
        <li><strong>Authoritative live state:</strong> direct RPC reads from deployed proxies.</li>
        <li><strong>History, list pages, and analytics:</strong> The Graph projections.</li>
        <li><strong>Policy state:</strong> admin setters, pause state, and role registry wiring.</li>
      </ul>

      <h2>High-level cross-contract graph</h2>
      <ul>
        <li><strong>IdeaRegistry</strong> calls into <strong>FundingPool</strong> for proposal deposit locking on <code>createIdea</code>.</li>
        <li><strong>VotingSystem</strong> calls <strong>FundingPool</strong> for vote commitment deposits and updates <strong>IdeaRegistry</strong> statuses.</li>
        <li><strong>GrantManager</strong> reads winner state from <strong>VotingSystem</strong>, reads idea author/status from <strong>IdeaRegistry</strong>, and executes staged payouts from <strong>FundingPool</strong>.</li>
        <li><strong>ReputationSystem</strong> and <strong>VoterProgression</strong> are update targets for outcome-based behavior and role progression.</li>
      </ul>

      <h2>Frontend read model</h2>
      <ol>
        <li>Use direct RPC for current eligibility, allowance, role, stake, and status checks.</li>
        <li>Use subgraph for large historical lists, page-level aggregation, and resilient fallback when older read paths are unavailable.</li>
        <li>Patch ABI layer centrally rather than scattering hand-written fragments across components.</li>
      </ol>

      <pre><code>// Recommended UI strategy
// 1) authoritative eligibility from RPC
const payout = await grantManager.read.getGrantPayout([roundId])
const status = await ideaRegistry.read.getStatus([ideaId])

// 2) page history from subgraph
const votes = await fetchAllVotesByIdeaFromSubgraph(String(ideaId))</code></pre>

      <h2>Why narrow ownership matters</h2>
      <ul>
        <li>Storage layout changes become easier to reason about per module.</li>
        <li>Incidents can be isolated by pausing only affected write surfaces.</li>
        <li>Frontend teams can map business rules to one clear source of truth per feature.</li>
      </ul>
    `,
  },
  {
    slug: "contract-reference",
    group: "Protocol",
    title: "Contract Reference",
    summary: "Business behavior and critical functions for each on-chain module.",
    content: `
      <h1>Contract Reference</h1>
      <p class="lead">This section documents what each contract owns in the live Arc stack and which functions matter most for protocol behavior and integrations.</p>

      <h2>RolesRegistryUpgradeable</h2>
      <ul>
        <li>Canonical source of admin, functional, and system roles.</li>
        <li>Used through the RolesAware pattern by most core contracts.</li>
        <li>Critical for upgrade safety, write permissions, and inter-contract trust.</li>
      </ul>

      <h2>IdeaRegistryUpgradeable</h2>
      <ul>
        <li>Stores canonical idea metadata and lifecycle status.</li>
        <li><code>createIdea(title, description, link, amount)</code> requires a USDC proposal deposit and FundingPool wiring.</li>
        <li>Exposes <code>authorMinStake()</code> and <code>fundingPool()</code> for clients.</li>
        <li>Supports review and low-quality marking guards while idea is in <code>Voting</code>.</li>
        <li>Lifecycle: <code>Pending → Voting → WonVoting/Rejected → Funded → InProcess → Completed</code>.</li>
      </ul>

      <h2>VotingSystemUpgradeable</h2>
      <ul>
        <li>Owns round creation, vote window timing, minimum commitment, and winner selection.</li>
        <li>Maintains <code>currentRoundId</code>, <code>lastUsedIdeaId</code>, and per-round totals.</li>
        <li>Enforces one vote per wallet per round.</li>
        <li>Transitions selected ideas into <code>Voting</code> and finalizes winner on end.</li>
      </ul>

      <h2>FundingPoolUpgradeable</h2>
      <ul>
        <li>Stores proposal deposits, vote commitments, and treasury accounting.</li>
        <li>Tracks <code>authorStakeByIdea(ideaId)</code> for proposal deposits.</li>
        <li>Receives author stake through <code>depositAuthorStakeFrom</code>.</li>
        <li>Can slash author stake to reserve where policy requires it.</li>
        <li>Owns <code>totalPoolBalance</code>, <code>protocolReserve</code>, distribution records, and <code>syncBalance()</code>.</li>
      </ul>

      <h2>GrantManagerUpgradeable</h2>
      <ul>
        <li>Owns initial author claim and staged milestone releases.</li>
        <li>Exposes read model: <code>getGrantPayout(roundId)</code> and <code>getMilestoneRequest(roundId, stage)</code>.</li>
        <li>Exposes write model: <code>submitMilestoneProof</code> and <code>reviewMilestoneProof</code>.</li>
        <li>Moves idea status from <code>Funded</code> to <code>InProcess</code> and later to <code>Completed</code> through validated execution flow.</li>
      </ul>

      <h2>ReputationSystemUpgradeable</h2>
      <ul>
        <li>Tracks reputation initialization and win/loss effects.</li>
        <li>Requires correct system role wiring for author initialization and outcome updates.</li>
      </ul>

      <h2>VoterProgressionUpgradeable</h2>
      <ul>
        <li>Tracks successful voting on winning ideas.</li>
        <li>Feeds reviewer and curator unlock criteria shown in the frontend.</li>
      </ul>

      <div class="callout warning">
        <strong>Integration tip:</strong> clients should always pre-check status, stake, allowance, and reviewer/author role context before attempting writes.
      </div>
    `,
  },
  {
    slug: "idea-creation",
    group: "Protocol",
    title: "Idea Creation",
    summary: "Exact author entry rules, deposit path, and failure conditions for createIdea.",
    content: `
      <h1>Idea Creation</h1>
      <p class="lead">Every idea must be backed by a locked USDC proposal deposit before it can enter the round pipeline.</p>

      <h2>Current live rule</h2>
      <ul>
        <li><strong>Minimum author deposit:</strong> <code>50 USDC</code></li>
        <li><strong>Entry function:</strong> <code>IdeaRegistry.createIdea(title, description, link, amount)</code></li>
        <li><strong>Initial status:</strong> <code>Pending</code></li>
      </ul>

      <h2>Execution sequence</h2>
      <ol>
        <li>Frontend reads <code>IdeaRegistry.authorMinStake()</code>.</li>
        <li>Wallet checks USDC balance and allowance to FundingPool.</li>
        <li>Author approves USDC spend to FundingPool if needed.</li>
        <li><code>createIdea</code> validates metadata, configured FundingPool, balance, allowance, and minimum amount.</li>
        <li>IdeaRegistry calls FundingPool to lock the proposal deposit for the new idea id.</li>
        <li>Idea is stored with status <code>Pending</code>.</li>
      </ol>

      <h2>Why the deposit exists</h2>
      <ul>
        <li>Prevents free spam submissions.</li>
        <li>Aligns idea entry with economic commitment.</li>
        <li>Creates a stronger quality signal before an idea can ever reach a round.</li>
      </ul>

      <h2>Frontend preflight checklist</h2>
      <ul>
        <li>Read <code>IdeaRegistry.authorMinStake()</code>.</li>
        <li>Read <code>IdeaRegistry.fundingPool()</code> and ensure it matches configured FundingPool proxy address.</li>
        <li>Read USDC <code>balanceOf(user)</code>.</li>
        <li>Read USDC <code>allowance(user, fundingPool)</code>.</li>
        <li>Block submit if <code>authorMinStake == 0</code> or FundingPool wiring is broken.</li>
      </ul>

      <h2>Important revert causes</h2>
      <ul>
        <li><code>FundingPoolNotConfigured</code></li>
        <li><code>InsufficientStake</code></li>
        <li><code>InsufficientTokenBalance</code></li>
        <li><code>InsufficientAllowance</code></li>
        <li><code>ExternalCallFailed("FundingPool", "depositAuthorStakeFrom")</code></li>
      </ul>
    `,
  },
  {
    slug: "voting-round-flow",
    group: "Protocol",
    title: "Voting Round Flow",
    summary: "How pending ideas enter rounds, how USDC voting works, and how winner finalization behaves.",
    content: `
      <h1>Voting Round Flow</h1>
      <p class="lead">Round mechanics are stablecoin-backed: committed USDC becomes the vote weight that determines round outcomes and downstream grant eligibility.</p>

      <h2>Round creation</h2>
      <ul>
        <li>Anyone can call <code>startVotingRound()</code> when enough pending ideas are available.</li>
        <li>The threshold is controlled by <code>IDEAS_PER_ROUND</code>.</li>
        <li>Ideas selected into the round move from <code>Pending</code> to <code>Voting</code>.</li>
      </ul>

      <h2>Vote mechanics</h2>
      <ul>
        <li>Votes are backed by committed USDC through FundingPool.</li>
        <li><code>minStake</code> is enforced by VotingSystem and currently defaults to <strong>10 USDC</strong>.</li>
        <li>One wallet can vote only once per round.</li>
        <li>Frontend should check token balance, allowance, min stake, round window, and <code>hasVoted</code> before write.</li>
      </ul>

      <h2>Round end</h2>
      <ol>
        <li>Round can be ended once <code>endTime</code> has passed.</li>
        <li>Highest total committed vote weight wins.</li>
        <li>Winning idea moves to <code>WonVoting</code>.</li>
        <li>Non-winning ideas move to <code>Rejected</code>.</li>
        <li>Progression and reputation hooks can be applied from result state.</li>
      </ol>

      <h2>Why round data still matters</h2>
      <ul>
        <li>The winner of the round is the only idea eligible for staged grant release.</li>
        <li>GrantManager uses round result state to gate initial claim and milestone execution.</li>
        <li>Frontend round pages should explain that “winning the round” does not mean “receive 100% immediately”.</li>
      </ul>
    `,
  },
  {
    slug: "grant-flow",
    group: "Protocol",
    title: "Grant Flow",
    summary: "The exact 30 / 40 / 30 payout rail, milestone proof process, and reviewer thresholds.",
    content: `
      <h1>Grant Flow</h1>
      <p class="lead">Winning a round does not trigger a blind full treasury release. Payout follows a validated milestone rail.</p>

      <h2>Release rail</h2>
      <table>
        <thead>
          <tr><th>Stage</th><th>Release</th><th>Condition</th></tr>
        </thead>
        <tbody>
          <tr><td>Initial claim</td><td><strong>30%</strong></td><td>Winning author claims after round settlement</td></tr>
          <tr><td>Checkpoint one</td><td><strong>40%</strong></td><td>Reviewers confirm build is actively in progress</td></tr>
          <tr><td>Final checkpoint</td><td><strong>30%</strong></td><td>Reviewers confirm project is launched / working</td></tr>
        </tbody>
      </table>

      <h2>State progression behind the payouts</h2>
      <ul>
        <li><code>WonVoting</code> → initial claim → <code>Funded</code></li>
        <li>After stage 1 proof approval → <code>InProcess</code></li>
        <li>After stage 2 proof approval → <code>Completed</code></li>
      </ul>

      <h2>Milestone proof mechanics</h2>
      <ul>
        <li>Author submits proof through <code>submitMilestoneProof(roundId, stage, metadataURI, details)</code>.</li>
        <li>Reviewers evaluate through <code>reviewMilestoneProof(roundId, stage, approved)</code>.</li>
        <li>Frontend can read live milestone state through <code>getMilestoneRequest</code>.</li>
      </ul>

      <h2>Reviewer thresholds</h2>
      <ul>
        <li><strong>Stage 1:</strong> reviewer threshold is enforced by contract configuration.</li>
        <li><strong>Stage 2:</strong> reviewer threshold is enforced by contract configuration.</li>
      </ul>

      <h2>Important restrictions</h2>
      <ul>
        <li>The idea author cannot review their own proof.</li>
        <li>Only reviewer role wallets can approve or reject proof.</li>
        <li>If proof is rejected, the author must wait through cooldown before re-submitting.</li>
        <li>No milestone UI should appear for non-winning ideas.</li>
      </ul>

      <div class="callout danger">
        <strong>Presentation rule:</strong> describe the protocol as milestone-based funding infrastructure, not as immediate winner-takes-all payout logic.
      </div>
    `,
  },
  {
    slug: "deployment-checklist",
    group: "Deployment",
    title: "Arc Deployment Checklist",
    summary: "Step-by-step checklist for deploying contracts, frontend, subgraph, and docs into one coherent Arc environment.",
    content: `
      <h1>Arc Deployment Checklist</h1>
      <p class="lead">Use this checklist when preparing a coherent Arc environment across contracts, frontend, subgraph, and docs.</p>

      <h2>1. Contracts</h2>
      <ul>
        <li>Deploy all proxy-backed contracts to Arc Testnet.</li>
        <li>Record proxy addresses, implementation addresses, and deploy blocks.</li>
        <li>Verify role wiring, funding pool wiring, pause state, and live USDC configuration.</li>
      </ul>

      <h2>2. Frontend</h2>
      <ul>
        <li>Point all <code>NEXT_PUBLIC_*</code> contract addresses to Arc proxies.</li>
        <li>Use Arc RPC and explorer URLs.</li>
        <li>Ensure token formatting uses 6 decimals and wallet UX is Arc-first.</li>
      </ul>

      <h2>3. Subgraph</h2>
      <ul>
        <li>Refresh ABIs in the subgraph config if contracts changed.</li>
        <li>Update <code>startBlock</code> values from Arc deploy receipts.</li>
        <li>Regenerate types and rebuild the subgraph.</li>
        <li>Deploy a new Studio version and update frontend query URL.</li>
      </ul>

      <h2>4. Docs</h2>
      <ul>
        <li>Update addresses, explorer links, subgraph links, and public contact links.</li>
        <li>Keep wording aligned with Arc-first, USDC-native funding flows.</li>
      </ul>

      <h2>5. Final smoke pass</h2>
      <ol>
        <li>Create idea with <code>50 USDC</code></li>
        <li>Vote in active round with <code>10 USDC</code> minimum</li>
        <li>End round when eligible</li>
        <li>Claim initial <code>30%</code> from winner wallet</li>
        <li>Submit milestone proof</li>
        <li>Review proof from reviewer wallet</li>
      </ol>
    `,
  },
  {
    slug: "arc-addresses",
    group: "Deployment",
    title: "Arc Addresses",
    summary: "Current proxy addresses and integration endpoints for the live Arc testnet stack.",
    content: `
      <h1>Arc Testnet Addresses</h1>
      <p class="lead">This page is the canonical environment snapshot for the current Arc testnet deployment used by the frontend, subgraph, and docs.</p>

      <h2>Core proxies</h2>
      <table>
        <thead>
          <tr><th>Contract</th><th>Address</th></tr>
        </thead>
        <tbody>
          <tr><td>RolesRegistryUpgradeable</td><td><code>0xf15c6213666EB4c09f594567DEf1345E2899BCC7</code></td></tr>
          <tr><td>ReputationSystemUpgradeable</td><td><code>0x3594C46983460733F6470f7b61De2f3bB2918a81</code></td></tr>
          <tr><td>VoterProgressionUpgradeable</td><td><code>0xF6EB65957bb5e363FCD6B84AAdf76E41Ba754E14</code></td></tr>
          <tr><td>IdeaRegistryUpgradeable</td><td><code>0xE6563acfdc194Ba3861EfD928Bd8B1B33a5D29d5</code></td></tr>
          <tr><td>USDC</td><td><code>0x3600000000000000000000000000000000000000</code></td></tr>
          <tr><td>FundingPoolUpgradeable</td><td><code>0x5eDdccd772a9E0F079cC6646b529C20e3D46e585</code></td></tr>
          <tr><td>VotingSystemUpgradeable</td><td><code>0xD008fC96902A9680FF77305881Ad6C6C075e7a68</code></td></tr>
          <tr><td>GrantManagerUpgradeable</td><td><code>0xA110baB4562d59d8bb7eDA4a05E53F40c678ccB2</code></td></tr>
        </tbody>
      </table>

      <h2>Important live checks</h2>
      <ul>
        <li><code>IdeaRegistry.fundingPool()</code> should resolve to <code>0x5eDdccd772a9E0F079cC6646b529C20e3D46e585</code></li>
        <li><code>IdeaRegistry.authorMinStake()</code> should resolve to a 50 USDC value in 6-decimal units.</li>
        <li><code>VotingSystem.minStake()</code> should resolve to a 10 USDC value in 6-decimal units.</li>
        <li><code>FundingPool.totalPoolBalance()</code> should be read from live RPC, not guessed from subgraph alone.</li>
      </ul>

      <h2>Network and endpoints</h2>
      <ul>
        <li>Network: <strong>Arc Testnet</strong> (chainId <code>5042002</code>)</li>
        <li>RPC: <code>https://rpc.testnet.arc.network</code></li>
        <li>Explorer: <code>https://explorer.testnet.arc.network</code></li>
        <li>Subgraph endpoint: <code>https://api.studio.thegraph.com/query/1742046/bert-arc-testnet/v1.0.0</code></li>
      </ul>

      <h2>Verification checklist</h2>
      <ol>
        <li>Wallet network is Arc Testnet.</li>
        <li>Frontend <code>.env</code> matches the addresses above.</li>
        <li>USDC displays with correct 6-decimal formatting.</li>
        <li>Smoke flow succeeds: approve → create idea → vote → read round → read profile.</li>
      </ol>
    `,
  },
  {
    slug: "admin-operations",
    group: "Operations",
    title: "Admin Operations",
    summary: "Runbook for setters, pause controls, upgrades, and post-deploy verification.",
    content: `
      <h1>Admin Operations</h1>
      <p class="lead">Admin control is sensitive because proposal deposits, milestone payout, and upgrade safety all depend on correct wiring and disciplined operations.</p>

      <h2>Highest-priority operator responsibilities</h2>
      <ol>
        <li>Protect proxy admin and admin signers.</li>
        <li>Verify role registry wiring before enabling new flows.</li>
        <li>Keep pause state explicit and documented.</li>
        <li>Treat every upgrade as a storage and wiring event, not only an implementation swap.</li>
      </ol>

      <h2>Critical setter surface</h2>
      <ul>
        <li><code>IdeaRegistry.setFundingPool</code></li>
        <li><code>IdeaRegistry.setAuthorMinStake</code></li>
        <li><code>VotingSystem.setVotingDuration</code></li>
        <li><code>VotingSystem.setMinStake</code></li>
        <li><code>VotingSystem.setIdeaPerRound</code></li>
        <li><code>GrantManager.setAuthorShare</code></li>
        <li><code>FundingPool.syncBalance</code></li>
        <li><code>FundingPool.setUsdc</code></li>
      </ul>

      <h2>Upgrade runbook</h2>
      <pre><code>1. Confirm ProxyAdmin owner signer
2. Verify new implementation storage layout
3. Deploy implementation
4. Run upgrade or upgradeAndCall
5. Re-check live reads
6. Run frontend smoke flow
7. Publish updated addresses and release notes</code></pre>

      <div class="callout warning">
        Never batch a proxy upgrade, role rewiring, and unrelated parameter changes into one opaque admin session. Keep admin actions atomic so rollback and audit stay realistic.
      </div>
    `,
  },
  {
    slug: "frontend-integration",
    group: "Integration",
    title: "Frontend Integration",
    summary: "How the frontend should read, preflight, and write against live Arc contracts.",
    content: `
      <h1>Frontend Integration</h1>
      <p class="lead">Frontend behavior should be deterministic: read current truth from RPC, use subgraph for history, and block invalid writes before the wallet prompt whenever possible.</p>

      <h2>Required environment alignment</h2>
      <ul>
        <li>Wallet network</li>
        <li>Wagmi default chain</li>
        <li>RPC transport URL</li>
        <li>Frontend contract addresses</li>
        <li>Subgraph endpoint</li>
      </ul>

      <h2>Critical client preflight rules</h2>
      <ul>
        <li><strong>Create idea:</strong> check min stake, balance, allowance, FundingPool wiring.</li>
        <li><strong>Vote:</strong> check round status, min stake, allowance, balance, hasVoted, own-idea restriction.</li>
        <li><strong>Claim 30%:</strong> check round ended, winner exists, wallet is winner author, grant is claimable.</li>
        <li><strong>Submit milestone proof:</strong> check wallet is author and the correct previous payout state is complete.</li>
        <li><strong>Review proof:</strong> check reviewer role, active request, and not-author constraint.</li>
      </ul>

      <h2>RPC-first / subgraph-second rule</h2>
      <table>
        <thead><tr><th>Use case</th><th>Preferred source</th></tr></thead>
        <tbody>
          <tr><td>Current eligibility / role / status / allowance</td><td>Direct RPC</td></tr>
          <tr><td>Lists of ideas, votes, rounds, historical reviews</td><td>Subgraph</td></tr>
          <tr><td>Write gating</td><td>Direct RPC only</td></tr>
          <tr><td>Analytics cards</td><td>Subgraph or mixed</td></tr>
        </tbody>
      </table>

      <h2>Known frontend responsibilities</h2>
      <ul>
        <li>Map common contract errors into readable UX messages.</li>
        <li>Pin reads to Arc and avoid stale localhost or foreign-chain addresses.</li>
        <li>Fall back to subgraph for list pages when older or broken direct read paths are unsafe.</li>
        <li>Present the release rail accurately as <strong>30 / 40 / 30</strong>.</li>
      </ul>
    `,
  },
  {
    slug: "subgraph",
    group: "Integration",
    title: "The Graph Integration",
    summary: "How docs, frontend, and operations should treat subgraph data versus direct on-chain reads.",
    content: `
      <h1>The Graph Integration</h1>
      <p class="lead">The subgraph is essential for scalable lists and history, but it is not the authority for write gating. Eligibility checks must remain on RPC.</p>

      <h2>Current Studio deployment</h2>
      <ul>
        <li>Studio subgraph: <a href="https://thegraph.com/studio/subgraph/bert-arc-testnet" target="_blank" rel="noreferrer">bert-arc-testnet</a></li>
        <li>Queries endpoint: <code>https://api.studio.thegraph.com/query/1742046/bert-arc-testnet/v1.0.0</code></li>
      </ul>

      <h2>What the subgraph is best at</h2>
      <ul>
        <li>Idea lists</li>
        <li>Vote history</li>
        <li>Round pages with many historical rows</li>
        <li>Profile timelines</li>
        <li>Homepage and protocol analytics widgets</li>
      </ul>

      <h2>What should stay on direct RPC</h2>
      <ul>
        <li><code>authorMinStake()</code></li>
        <li><code>fundingPool()</code> wiring</li>
        <li>Allowance and token balance checks</li>
        <li>Claim eligibility</li>
        <li>Live milestone request state before write</li>
      </ul>

      <h2>Deployment commands</h2>
      <pre><code>npm run codegen:arc
npm run build:arc
npx graph deploy bert-arc-testnet subgraph.yaml</code></pre>
    `,
  },
  {
    slug: "arc-user-guide",
    group: "User Guides",
    title: "Arc User Guide",
    summary: "What users need for gas, USDC setup, approvals, and the full Arc test flow.",
    content: `
      <h1>Arc User Guide</h1>
      <p class="lead">This guide is for testers and early users interacting with the live Arc deployment.</p>

      <h2>Gas asset vs protocol asset</h2>
      <ul>
        <li><strong>The network gas asset</strong> pays transaction fees.</li>
        <li><strong>USDC</strong> is used for proposal deposits, voting commitments, and treasury accounting.</li>
      </ul>

      <h2>Basic user journey</h2>
      <ol>
        <li>Prepare gas funds for Arc transactions.</li>
        <li>Make sure the wallet holds USDC.</li>
        <li>Approve USDC when prompted.</li>
        <li>Create idea with a <code>50 USDC</code> minimum if testing author flow.</li>
        <li>Vote in active rounds with a <code>10 USDC</code> minimum commitment.</li>
        <li>If your idea wins, claim the first <code>30%</code>.</li>
        <li>Submit milestone proof for the next payout stages.</li>
      </ol>

      <h2>Common user confusion points</h2>
      <ul>
        <li><strong>“Why did MetaMask open but tx reverted?”</strong> Usually deposit, allowance, or role preconditions were not met.</li>
        <li><strong>“Why can’t I create an idea?”</strong> Most often because USDC balance or FundingPool allowance is below the required deposit.</li>
        <li><strong>“Why didn’t I get the full grant after win?”</strong> Because BERT uses staged milestone payouts, not immediate 100% release.</li>
      </ul>
    `,
  },
  {
    slug: "faq",
    group: "Reference",
    title: "FAQ",
    summary: "Concise answers to recurring technical and product questions around the Arc deployment.",
    content: `
      <h1>FAQ</h1>

      <h2>Why does createIdea require USDC?</h2>
      <p>BERT uses a proposal deposit to reduce spam and force real economic commitment before an idea enters the round pipeline.</p>

      <h2>What is the current minimum for idea creation?</h2>
      <p>The live configuration is <strong>50 USDC</strong>.</p>

      <h2>What is the current minimum vote amount?</h2>
      <p>The live configuration is <strong>10 USDC</strong>.</p>

      <h2>Does winning a round still release the full grant immediately?</h2>
      <p>No. The release rail is <strong>30% / 40% / 30%</strong>, with reviewer checkpoints between stages.</p>

      <h2>Who can approve milestone proofs?</h2>
      <p>Only wallets with reviewer role, and the idea author cannot review their own proof.</p>

      <h2>Where are the official project links?</h2>
      <p>
        Core repo: <a href="https://github.com/Tenyokj/bert-core-arc" target="_blank" rel="noreferrer">Tenyokj/bert-core-arc</a><br/>
        Subgraph: <a href="https://thegraph.com/studio/subgraph/bert-arc-testnet" target="_blank" rel="noreferrer">bert-arc-testnet</a><br/>
        YouTube: <a href="https://www.youtube.com/@bertdaoARC" target="_blank" rel="noreferrer">@bertdaoARC</a><br/>
        Telegram: <a href="https://t.me/+8DEt_M62Db00NzYy" target="_blank" rel="noreferrer">channel</a><br/>
        Email: <a href="mailto:bertdaoarc@gmail.com">bertdaoarc@gmail.com</a>
      </p>
    `,
  },
  {
    slug: "release-notes-template",
    group: "Reference",
    title: "Release Notes Template",
    summary: "Template for documenting future protocol, frontend, and subgraph releases.",
    content: `
      <h1>Release Notes Template</h1>
      <p class="lead">Use this template for every release that touches contracts, addresses, env manifests, subgraph, or frontend write paths.</p>

      <pre><code># BERT Release - YYYY-MM-DD

## Scope
- Contracts:
- Frontend:
- Subgraph:
- Docs:

## Changed modules
- IdeaRegistry:
- FundingPool:
- GrantManager:
- VotingSystem:
- Other:

## Storage layout impact
- None / appended fields / reinitializer used / tests updated

## Deployment changes
- New implementation addresses:
- Proxies touched:
- Post-deploy calls:

## Frontend changes
- New ABI functions:
- New env vars:
- New preflight checks:

## Verification
- Role wiring:
- Pause state:
- Direct RPC reads:
- Subgraph sync:
- Smoke flows:

## Rollback plan
- Trigger conditions:
- Revert strategy:
- Owner / operator:
</code></pre>
    `,
  },
];
