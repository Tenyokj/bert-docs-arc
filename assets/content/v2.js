export const v2Docs = [
  {
    slug: "v2-overview",
    section: "BERT V2 / Contract reference",
    group: "Core mechanics",
    title: "V2 contract architecture",
    summary: "The V2 contract topology, caller boundaries, write sequence and event model for global USDC funding.",
    tags: ["v2", "ideas", "voting", "funding-pool", "grants", "usdc"],
    content: `
      <p class="eyebrow">BERT V2 / Contract reference</p><h1>Global funding<br /><span>as an integration surface.</span></h1>
      <p class="lead">BERT V2 is the global funding layer. Integrators use its contracts to create stake-backed ideas, inspect USDC vote commitments, follow funding rounds and observe staged grant release. The contract state machine, not the UI, decides every transition.</p>
      <div class="callout info"><strong>Scope boundary.</strong> V2 is global. It does not run Community membership, local validator queues or local Treasury withdrawals; those belong to V3. V2 can receive authenticated reserve capital from V3, but a V3 Community is not a V2 idea.</div>
      <h2>Contract topology for clients</h2><table><thead><tr><th>Contract</th><th>User-facing write</th><th>Critical reads / indexed events</th></tr></thead><tbody><tr><td><code>IdeaRegistryUpgradeable</code></td><td><code>createIdea</code>; curator/reviewer quality actions</td><td><code>getIdea</code>, <code>getStatus</code>; <code>IdeaCreated</code>, <code>IdeaStatusUpdated</code></td></tr><tr><td><code>VotingSystemUpgradeable</code></td><td><code>startVotingRound</code>, <code>vote</code>, <code>endVotingRound</code></td><td><code>getRoundInfo</code>, <code>hasVoted</code>; <code>VotingRoundStarted</code>, <code>VoteCast</code>, <code>VotingRoundEnded</code></td></tr><tr><td><code>FundingPoolUpgradeable</code></td><td><code>deposit</code> only for a normal wallet</td><td><code>poolByRoundAndIdea</code>, <code>authorStakeByIdea</code>; deposit, reserve and distribution events</td></tr><tr><td><code>GrantManagerUpgradeable</code></td><td><code>claimGrant</code>, <code>submitMilestoneProof</code>, <code>reviewMilestoneProof</code></td><td><code>canClaimGrant</code>, payout/request reads; grant and milestone events</td></tr></tbody></table>
      <div class="callout warning"><strong>Never call internal accounting surfaces from a wallet UI.</strong> FundingPool functions such as <code>depositForIdeaFrom</code>, <code>distributeFunds</code> and <code>moveIdeaFundsToReserve</code> are restricted to protocol roles. The correct wallet path is IdeaRegistry, VotingSystem or GrantManager.</div>
      <h2>Lifecycle at a glance</h2>
      <ol class="numbered-flow"><li><strong>Submit.</strong> An author creates an idea and locks the configured proposal deposit in USDC.</li><li><strong>Select.</strong> A voting round moves eligible pending ideas into the voting state.</li><li><strong>Commit.</strong> Voters lock USDC against one eligible idea, subject to the live minimum, cap and verification gate.</li><li><strong>Settle.</strong> The round resolves deterministically; the winner becomes grant-eligible and losing ideas follow their configured terminal path.</li><li><strong>Execute.</strong> GrantManager releases the initial tranche, then reviewer-approved milestone tranches.</li></ol>
      <h2>Module ownership</h2>
      <table><thead><tr><th>Module</th><th>Owns</th><th>Must not be inferred from it</th></tr></thead><tbody><tr><td>IdeaRegistry</td><td>Idea metadata, author, status and deposit policy</td><td>Current treasury liquidity</td></tr><tr><td>VotingSystem</td><td>Round selection, voting window, commitments and winner</td><td>Grant milestone approval</td></tr><tr><td>FundingPool</td><td>USDC accounting, deposits, reserve and distributions</td><td>Whether a milestone is valid</td></tr><tr><td>GrantManager</td><td>Claim and milestone release state</td><td>Voting totals or vote eligibility</td></tr><tr><td>PoPVerifier</td><td>Active signed verification records</td><td>Identity-provider policy itself</td></tr></tbody></table>
      <h2>Current parameter model</h2>
      <table><thead><tr><th>Parameter</th><th>Live testnet default</th><th>Integration meaning</th></tr></thead><tbody><tr><td>Author minimum stake</td><td>50 USDC</td><td>Read from IdeaRegistry; do not hard-code in production clients.</td></tr><tr><td>Vote minimum stake</td><td>10 USDC</td><td>Read from VotingSystem before showing an approval or vote action.</td></tr><tr><td>Vote cap</td><td>10,000 USDC per idea</td><td>Enforced onchain when human-only voting is active.</td></tr><tr><td>Grant rail</td><td>30 / 40 / 30</td><td>Initial claim, approved milestone, approved final delivery.</td></tr><tr><td>Verification window</td><td>14 days</td><td>The active record must not be expired at the protected write.</td></tr></tbody></table>
      <div class="callout warning"><strong>Testnet policy.</strong> Arc Testnet currently uses Demo verification to exercise the onchain gate. It does not establish that an account is a unique human. Production World ID policy is documented separately from testnet behavior.</div>
      <h2>Read the exact V2 mechanics</h2><div class="doc-cards two-up compact"><a class="doc-card" data-doc-link href="#v2-idea-lifecycle"><span class="mini-icon">01</span><h3>Idea state machine</h3><p>Every allowed and forbidden status transition.</p></a><a class="doc-card" data-doc-link href="#v2-voting-rounds"><span class="mini-icon">02</span><h3>Voting rounds</h3><p>Selection, vote gates, ties and settlement.</p></a><a class="doc-card" data-doc-link href="#v2-capital-accounting"><span class="mini-icon">03</span><h3>Capital accounting</h3><p>What the FundingPool records and moves.</p></a><a class="doc-card" data-doc-link href="#v2-grant-milestones"><span class="mini-icon">04</span><h3>Grant milestones</h3><p>Author share, reviewer thresholds and retries.</p></a></div>
    `,
  },
  {
    slug: "v2-idea-lifecycle",
    section: "BERT V2 / Contract reference",
    group: "Core mechanics",
    title: "IdeaRegistry API and states",
    summary: "The IdeaRegistry read/write surface, creation preflight, events and forward-only V2 state machine.",
    tags: ["v2", "ideas", "state-machine", "stake", "reputation", "curator"],
    content: `
      <p class="eyebrow">BERT V2 / IdeaRegistry</p><h1>Create ideas through<br /><span>IdeaRegistry.</span></h1>
      <p class="lead">IdeaRegistryUpgradeable is V2's canonical idea API and state machine. It stores metadata, author, vote aggregate, reviews and status. A frontend may preflight impossible actions, but the Registry ultimately permits only the transition sequence below.</p>
      <h2>Public API surface</h2><table><thead><tr><th>Call</th><th>Caller</th><th>Use in an integration</th></tr></thead><tbody><tr><td><code>createIdea(title, description, link, amount)</code></td><td>Any eligible wallet</td><td>Create a pending idea after USDC allowance and live policy checks.</td></tr><tr><td><code>getIdea(id)</code>, <code>getStatus(id)</code></td><td>Read-only</td><td>Render canonical metadata, author, aggregate votes and lifecycle status.</td></tr><tr><td><code>getIdeasByAuthor(account)</code></td><td>Read-only</td><td>Build an author profile without assuming IDs are contiguous for that author.</td></tr><tr><td><code>markLowQuality(id)</code>, <code>addReview(id, comment)</code></td><td>Curator / Reviewer role</td><td>Only expose after role and <code>Voting</code>-state reads.</td></tr><tr><td><code>updateStatus</code>, <code>addVote</code>, <code>markAsCompleted</code></td><td>Protocol-role callers</td><td>Observe through events; do not present as ordinary wallet writes.</td></tr></tbody></table>
      <h2>Events to index</h2><p>Use <code>IdeaCreated(ideaId, author, title)</code> as the discovery event. Update the local read model from <code>IdeaStatusUpdated</code>, <code>IdeaVoted</code>, <code>IdeaMarkedLowQuality</code> and <code>ReviewAdded</code>. Always re-read the Registry before a state-sensitive write, because events and a subgraph can lag the latest block.</p>
      <div class="flow-diagram"><div><small>Intake</small><strong>Pending</strong><span>Created with author stake.</span></div><b>→</b><div><small>Round</small><strong>Voting</strong><span>Selected by VotingSystem.</span></div><b>→</b><div><small>Outcome</small><strong>WonVoting / Rejected</strong><span>Only one branch continues.</span></div></div>
      <h2>Allowed transitions</h2>
      <table><thead><tr><th>From</th><th>Allowed next status</th><th>Caller that can cause it</th><th>Economic consequence</th></tr></thead><tbody><tr><td><code>Pending</code></td><td><code>Voting</code></td><td>VotingSystem during round start</td><td>None. The author stake remains tracked in FundingPool.</td></tr><tr><td><code>Voting</code></td><td><code>WonVoting</code></td><td>VotingSystem when the idea has the strict highest vote amount</td><td>Winner becomes eligible for grant claim.</td></tr><tr><td><code>Voting</code></td><td><code>Rejected</code></td><td>VotingSystem when it loses, or all ideas receive zero votes</td><td>Registry asks FundingPool to slash its author stake to protocol reserve.</td></tr><tr><td><code>WonVoting</code></td><td><code>Funded</code></td><td>GrantManager after valid author claim</td><td>Protocol share is reserved; initial author tranche is transferred.</td></tr><tr><td><code>Funded</code></td><td><code>InProcess</code></td><td>GrantManager after approved stage 1 proof</td><td>40% author-side in-process tranche is transferred.</td></tr><tr><td><code>InProcess</code></td><td><code>Completed</code></td><td>GrantManager after approved stage 2 proof</td><td>Remaining 30% author-side completion tranche is transferred.</td></tr></tbody></table>
      <div class="callout danger"><strong>Terminal means terminal.</strong> <code>Rejected</code> and <code>Completed</code> have no outgoing transition. The Registry rejects a status change that repeats the current value, skips a stage, moves backwards, or attempts to revive a terminal idea.</div>
      <h2>Submitting an idea</h2><ol class="numbered-flow"><li>Prepare non-empty title and description. Link is optional.</li><li>Read <code>authorMinStake</code> from the live Registry. The initializer default is 50 USDC, but Admin can change future-submission policy.</li><li>Ensure the wallet has USDC and has approved FundingPool for at least the chosen stake.</li><li>If human-only creation is enabled, complete the active PoP policy before sending.</li><li><code>createIdea</code> writes the idea as <code>Pending</code>, initializes reputation when needed, and routes the stake to FundingPool.</li></ol>
      <pre><code>const { request } = await publicClient.simulateContract({
  account,
  address: ideaRegistry,
  abi: ideaRegistryAbi,
  functionName: "createIdea",
  args: [title, description, link, authorStake],
});
const hash = await walletClient.writeContract(request);</code></pre>
      <h2>Author stake is not a vote</h2><p>The author stake is separately recorded as <code>authorStakeByIdea[ideaId]</code>. It is not added to a round's vote total and it is not a vote for the author's idea. On a rejection transition, the Registry calls <code>slashAuthorStakeToReserve</code>, which zeroes that idea's tracked author stake and increases protocol reserve.</p>
      <div class="callout warning"><strong>Do not promise an automatic stake refund.</strong> The V2 FundingPool exposes the explicit rejection-slash path, but not a generic author-stake withdrawal method. Product copy must describe the live contract behavior, not assume a refund path that the contract does not provide.</div>
      <h2>Reviews and quality signals</h2><p>During <code>Voting</code>, a wallet holding <code>CURATOR_ROLE</code> may mark an idea low quality and a wallet holding <code>REVIEWER_ROLE</code> may add a review. Neither action changes the state machine by itself. The author cannot curate or review their own idea, and neither action is accepted outside the <code>Voting</code> state.</p>
    `,
  },
  {
    slug: "v2-voting-rounds",
    section: "BERT V2 / Contract reference",
    group: "Core mechanics",
    title: "VotingSystem API and settlement",
    summary: "The round reads, vote write API, events, deterministic tie behavior and settlement preflight for V2.",
    tags: ["v2", "voting", "rounds", "tie-break", "human-verification", "usdc"],
    content: `
      <p class="eyebrow">BERT V2 / VotingSystem</p><h1>Round writes.<br /><span>Deterministic settlement.</span></h1>
      <p class="lead">VotingSystemUpgradeable creates a deterministic batch of pending ideas, receives one USDC commitment from each voter per round, and resolves the batch after the configured end time. It does not require an Admin to settle: anyone can call the ending function once time has elapsed.</p>
      <h2>Public API surface</h2><table><thead><tr><th>Call</th><th>Use</th><th>Preflight reads</th></tr></thead><tbody><tr><td><code>canStartNewRound()</code></td><td>Read whether public round creation is currently possible.</td><td>Use its boolean and reason as informational UX only; state may change before inclusion.</td></tr><tr><td><code>startVotingRound()</code></td><td>Create the next eligible batch of pending ideas.</td><td>Read pause state, the current idea count and the returned startability reason.</td></tr><tr><td><code>vote(roundId, ideaId, amount)</code></td><td>Commit a wallet's USDC to one idea in one round.</td><td><code>getRoundInfo</code>, <code>hasVoted</code>, idea author/status, USDC allowance and verification policy.</td></tr><tr><td><code>endVotingRound(roundId)</code></td><td>Publicly settle an elapsed round.</td><td><code>getRoundInfo</code> and the chain timestamp; it must be strictly after <code>endTime</code>.</td></tr></tbody></table>
      <p>Index <code>VotingRoundStarted</code>, <code>VoteCast</code> and <code>VotingRoundEnded</code> to build lists and history. The full <code>getRoundInfo</code> response is the right live read for an individual round: it returns IDs, timestamps, active/ended flags, total votes and winner data together.</p>
      <h2>How a round begins</h2><p><code>startVotingRound()</code> is public when the contract is unpaused. It takes exactly <code>IDEAS_PER_ROUND</code> consecutive unused idea IDs, starting after <code>lastUsedIdeaId</code>. Every selected idea must still be <code>Pending</code>. The initializer defaults are 30 ideas per round and a one-day voting duration; both are live Admin-configurable parameters.</p>
      <table><thead><tr><th>Gate</th><th>Contract check</th><th>Default at initialization</th></tr></thead><tbody><tr><td>Enough ideas</td><td><code>totalIdeas - lastUsedIdeaId &gt;= IDEAS_PER_ROUND</code></td><td>30 pending sequential IDs</td></tr><tr><td>Round availability</td><td>VotingSystem must not be paused</td><td>Starts paused after initialization until Admin unpauses</td></tr><tr><td>Selected status</td><td>Each selected idea must be <code>Pending</code></td><td>Required</td></tr><tr><td>Voting window</td><td><code>startTime &lt;= now &lt;= endTime</code></td><td>1 day</td></tr></tbody></table>
      <h2>Vote eligibility and amount</h2><p>Calling <code>vote(roundId, ideaId, amount)</code> first records the vote state, then calls FundingPool to transfer USDC from the voter. The full transaction reverts if that transfer or the Registry vote update fails, so a partial local vote record cannot persist.</p>
      <pre><code>const round = await publicClient.readContract({
  address: votingSystem,
  abi: votingSystemAbi,
  functionName: "getRoundInfo",
  args: [roundId],
});
const alreadyVoted = await publicClient.readContract({
  address: votingSystem,
  abi: votingSystemAbi,
  functionName: "hasVoted",
  args: [roundId, account],
});</code></pre>
      <div class="doc-cards three-up compact"><div class="doc-card static-card"><span class="mini-icon">A</span><h3>Identity</h3><p>If <code>humanOnlyVoting</code> is true, the active <code>humanVerifier</code> must say the wallet is verified. Testnet currently uses Demo PoP only.</p></div><div class="doc-card static-card"><span class="mini-icon">B</span><h3>One vote</h3><p><code>hasVoted[roundId][wallet]</code> blocks a second vote, even for another idea in the same round.</p></div><div class="doc-card static-card"><span class="mini-icon">C</span><h3>Limits</h3><p>Amount must meet <code>minStake</code>; the initial value is 10 USDC. A non-zero <code>maxVoteAmount</code> caps one vote; initial cap is 10,000 USDC.</p></div></div>
      <h2>Additional hard gates</h2><ul><li>The voted idea must be in that round.</li><li>The voter cannot be the idea author.</li><li>Each idea accepts at most <code>MAX_VOTERS_PER_IDEA</code>, fixed at 30, to bound settlement gas.</li><li>The round must still be active and inside its timestamp window.</li><li>The wallet must have enough USDC allowance for FundingPool, because FundingPool pulls the committed amount.</li></ul>
      <h2>Ending a round and ties</h2><p>After <code>block.timestamp &gt; endTime</code>, anyone may call <code>endVotingRound(roundId)</code>. The contract walks the stored idea IDs in their round order and selects an idea only when its vote total is <strong>strictly greater</strong> than the running maximum. Therefore an equal-vote tie remains with the first idea encountered in that order, which is the lower sequential ID in a normal V2 batch.</p>
      <div class="callout info"><strong>Zero-vote result.</strong> If no idea receives a positive commitment, the round ends with winner ID <code>0</code> and every included idea transitions to <code>Rejected</code>. No grant is claimable for that round.</div>
      <h2>Settlement effects</h2><p>For a non-zero winner, its status becomes <code>WonVoting</code> and its author receives a reputation increase. Every other included idea becomes <code>Rejected</code> and its author receives a reputation decrease. Voters who selected the winner are registered in VoterProgression. Ending a round does not itself transfer a grant; the winning author must later call <code>claimGrant</code>.</p>
    `,
  },
  {
    slug: "v2-capital-accounting",
    section: "BERT V2 / Contract reference",
    group: "Capital & grants",
    title: "FundingPool API and accounting",
    summary: "The FundingPool public read surface, wallet deposit path, protocol-only accounting calls and event model.",
    tags: ["v2", "funding-pool", "usdc", "reserve", "accounting", "distribution"],
    content: `
      <p class="eyebrow">BERT V2 / FundingPool</p><h1>Every USDC path<br /><span>has a named ledger.</span></h1>
      <p class="lead">FundingPoolUpgradeable is V2 custody and accounting infrastructure, not a generic wallet. It separately tracks general pool deposits, author submission stakes and vote commitments indexed by round and idea. Those ledgers determine what GrantManager may release or reserve.</p>
      <h2>Public versus protocol-only calls</h2><table><thead><tr><th>Surface</th><th>Who calls it</th><th>Integration rule</th></tr></thead><tbody><tr><td><code>deposit(amount)</code></td><td>Any wallet</td><td>The only normal direct deposit write. Obtain USDC allowance first.</td></tr><tr><td><code>poolByRoundAndIdea</code>, <code>authorStakeByIdea</code>, <code>isDistributed</code>, <code>getDistribution</code></td><td>Read-only</td><td>Use for current accounting and historical display.</td></tr><tr><td><code>depositAuthorStakeFrom</code>, <code>depositForIdeaFrom</code></td><td>IdeaRegistry / VotingSystem</td><td>Never call from an end-user UI; invoke the outer Registry or VotingSystem action.</td></tr><tr><td><code>distributeFunds</code>, <code>moveIdeaFundsToReserve</code></td><td>Grant/distributor role</td><td>Observe through GrantManager and events; a wallet should not construct these calls.</td></tr><tr><td><code>receiveCommunityReserve</code></td><td>Authenticated V3 CommunityTreasury</td><td>Not an arbitrary cross-contract deposit path.</td></tr></tbody></table>
      <p>Index <code>FundsDeposited</code>, <code>AuthorStakeDeposited</code>, <code>IdeaFundsReserved</code>, <code>AuthorStakeSlashed</code>, <code>FundsDistributed</code>, <code>ProtocolReserveAllocated</code> and <code>CommunityReserveReceived</code>. The event stream explains a historical movement; direct reads establish the currently spendable protocol state.</p>
      <h2>Accounting surfaces</h2><table><thead><tr><th>Ledger / value</th><th>How it increases</th><th>How it decreases or changes</th></tr></thead><tbody><tr><td><code>totalPoolBalance</code></td><td>General deposits, author stakes and vote commitments</td><td>Author grant transfers through <code>distributeFunds</code></td></tr><tr><td><code>donorBalances[wallet]</code></td><td><code>deposit</code> and author-stake deposits</td><td>Accounting record only; do not treat it as a redemption claim without a dedicated withdrawal method</td></tr><tr><td><code>authorStakeByIdea[id]</code></td><td>Idea creation stake</td><td>Explicit rejection slash zeros it and credits reserve</td></tr><tr><td><code>poolByRoundAndIdea[round][idea]</code></td><td>Votes for that exact round and idea</td><td>Protocol carve-out and author tranches</td></tr><tr><td><code>protocolReserve</code></td><td>Rejected author-stake slash; winning idea protocol share; admin reserve allocation flows</td><td>Only configured reserve allocation path</td></tr></tbody></table>
      <h2>USDC transfer paths</h2><ol class="numbered-flow"><li>A supporter may use <code>deposit(amount)</code>; FundingPool transfers USDC from that wallet into its custody.</li><li>IdeaRegistry calls <code>depositAuthorStakeFrom</code> when an idea passes validation.</li><li>VotingSystem calls <code>depositForIdeaFrom</code> after a vote passes all local gates.</li><li>GrantManager moves the winning idea's protocol share to <code>protocolReserve</code>.</li><li>GrantManager transfers author tranches with <code>distributeFunds</code>.</li></ol>
      <h2>What a winning pool pays for</h2><p>At grant claim, GrantManager reads only <code>poolByRoundAndIdea[roundId][winningIdeaId]</code>. It calculates the author share and protocol share, moves the protocol share into reserve, then releases the first author tranche. General deposits and an idea's author stake are not silently folded into that round-specific vote pool.</p>
      <div class="callout warning"><strong>Frontends must read, not reconstruct.</strong> Indexer data is useful for history, but action availability and balances must be read from the contracts. A stale index can never make an unavailable grant, vote or reserve allocation valid.</div>
      <h2>Distribution finality</h2><p><code>distributeFunds</code> can only be called by the grant/distributor path, only while FundingPool is unpaused, and only up to the live per-round-per-idea amount. It marks <code>distributed[roundId]</code> true only once the remaining amount for that winning round becomes zero. GrantManager also records tranche flags before moving funds, preventing duplicate payment even when subsequent dependency calls revert.</p>
      <h2>Protocol reserve is not the dApp balance</h2><p><code>protocolReserve</code> is a dedicated accounting value inside FundingPool. It increases when an author stake is slashed or when GrantManager carves the non-author share from a winning vote pool. It should not be presented as liquid user-owned voting capital, nor confused with any V3 Community Treasury balance.</p>
    `,
  },
  {
    slug: "v2-grant-milestones",
    section: "BERT V2 / Contract reference",
    group: "Capital & grants",
    title: "GrantManager API and milestones",
    summary: "The grant claim, milestone proof, reviewer write APIs and payout reads for an integration.",
    tags: ["v2", "grants", "milestones", "reviewers", "payout", "reserve"],
    content: `
      <p class="eyebrow">BERT V2 / GrantManager</p><h1>Grant API.<br /><span>Staged settlement.</span></h1>
      <p class="lead">GrantManagerUpgradeable converts a completed winning round into a staged grant. It preserves the author share in a per-round payout record, sends the protocol share to FundingPool reserve, and releases the author side only as claim and milestone conditions are met.</p>
      <h2>Public API surface</h2><table><thead><tr><th>Call</th><th>Caller</th><th>Read before calling</th></tr></thead><tbody><tr><td><code>canClaimGrant(roundId)</code></td><td>Read-only</td><td>Use the boolean and returned reason before displaying claim.</td></tr><tr><td><code>calculateDistribution(roundId, ideaId)</code></td><td>Read-only</td><td>Preview author/protocol amounts; do not calculate percentages client-side.</td></tr><tr><td><code>claimGrant(roundId)</code></td><td>Winning author</td><td>Claimability, winner/author/status and current payout record.</td></tr><tr><td><code>submitMilestoneProof(roundId, stage, metadataURI, details)</code></td><td>Winning author</td><td>Active request state, stage eligibility and retry timestamp.</td></tr><tr><td><code>reviewMilestoneProof(roundId, stage, approved)</code></td><td>Reviewer role</td><td>Request activity, reviewer count and author inequality.</td></tr></tbody></table>
      <p>Index <code>RoundFunded</code>, <code>MilestoneProofSubmitted</code>, <code>MilestoneReviewed</code>, <code>MilestoneApproved</code> and <code>MilestoneRejected</code>. For a live grant screen, combine the event history with <code>getGrantPayout</code> and <code>getMilestoneRequest</code> reads.</p>
      <h2>Claim preconditions</h2><ul><li>The round exists and has ended.</li><li>It has a non-zero winner.</li><li>The winning idea is exactly in <code>WonVoting</code> status.</li><li>The caller is exactly the winning idea author.</li><li>The winning round/idea vote pool is non-zero.</li><li>No prior initial claim exists and the round is not already fully distributed.</li></ul>
      <h2>Split before tranches</h2><p>The initializer sets <code>authorSharePercent</code> to 95. GrantManager calculates that percentage from the winning round's vote pool, moves the remaining protocol share to reserve, then makes all milestones percentages of the resulting author-side amount. This means <code>30 / 40 / 30</code> is not 30/40/30 of the gross vote pool: it is 30/40/30 of the author share after the protocol carve-out.</p>
      <table><thead><tr><th>Step</th><th>Amount basis</th><th>Required event</th><th>Status after payment</th></tr></thead><tbody><tr><td>Initial claim</td><td>30% of author share</td><td>Winning author calls <code>claimGrant</code></td><td><code>Funded</code></td></tr><tr><td>In-process</td><td>40% of author share</td><td>3 approvals from up to 5 reviewers</td><td><code>InProcess</code></td></tr><tr><td>Completion</td><td>Remaining 30% of author share</td><td>2 approvals from up to 3 reviewers</td><td><code>Completed</code></td></tr></tbody></table>
      <h2>Milestone request lifecycle</h2><ol class="numbered-flow"><li>After initial claim, the author submits non-empty <code>metadataURI</code> and details for stage 1 or 2.</li><li>Only one active request can exist for a given round and stage.</li><li>A <code>REVIEWER_ROLE</code> wallet other than the author casts one approval or rejection for that request ID.</li><li>Approval threshold immediately releases the associated tranche and advances the status.</li><li>Otherwise the request closes when rejection makes approval impossible or its reviewer cap is exhausted.</li></ol>
      <h2>Rejection and retry</h2><p>A rejected milestone does not destroy the grant payout record. It sets <code>lastRejectedAt</code> for that stage. The author can submit a new request for the same stage only after the fixed <code>MILESTONE_RESUBMIT_COOLDOWN</code> of 48 hours. Reviewer votes are keyed by round, stage and request ID, so an old review cannot be reused on a resubmission.</p>
      <div class="callout danger"><strong>Reviewers cannot self-deal.</strong> The winning author is rejected when attempting to review their own milestone. A reviewer may vote only once per active request and only until its maximum reviewer count is reached.</div>
      <h2>Operational reads</h2><p>Before presenting a claim or review button, query <code>canClaimGrant(roundId)</code>, <code>getGrantPayout(roundId)</code> and <code>getMilestoneRequest(roundId, stage)</code>. A UI countdown should calculate its retry date from the contract's returned rejection timestamp and the immutable 48-hour cooldown, not from a browser-local action timestamp.</p>
    `,
  },
  {
    slug: "v2-invariants-and-failures",
    section: "BERT V2 / Contract reference",
    group: "Security reference",
    title: "V2 events, errors and invariants",
    summary: "How to decode V2 custom errors, subscribe to lifecycle events and preserve protocol invariants in an integration.",
    tags: ["v2", "security", "invariants", "reverts", "integration", "pause"],
    content: `
      <p class="eyebrow">BERT V2 / Integration safety</p><h1>Decode the revert.<br /><span>Preserve the invariant.</span></h1>
      <p class="lead">A reverted transaction is often the protocol protecting an invariant, not merely an RPC failure. Decode custom errors with the same ABI used for simulation, map them to an actionable current-state read, and always accept the chain result as final.</p>
      <h2>Event subscription map</h2><table><thead><tr><th>Concern</th><th>Events</th><th>Client response</th></tr></thead><tbody><tr><td>Idea lifecycle</td><td><code>IdeaCreated</code>, <code>IdeaStatusUpdated</code>, <code>IdeaVoted</code></td><td>Invalidate idea, profile and round queries.</td></tr><tr><td>Round lifecycle</td><td><code>VotingRoundStarted</code>, <code>VoteCast</code>, <code>VotingRoundEnded</code></td><td>Invalidate active round and result views.</td></tr><tr><td>Capital movement</td><td><code>FundsDeposited</code>, <code>FundsDistributed</code>, reserve events</td><td>Refresh FundingPool reads; update history asynchronously.</td></tr><tr><td>Grant lifecycle</td><td><code>RoundFunded</code>, milestone proof/review/outcome events</td><td>Refresh payout and request state for that round.</td></tr></tbody></table>
      <h2>Core invariants</h2><table><thead><tr><th>Invariant</th><th>How V2 enforces it</th><th>Integration implication</th></tr></thead><tbody><tr><td>Idea lifecycle is forward-only</td><td>IdeaRegistry allows a fixed transition graph and terminal statuses.</td><td>Never offer a manual reopen or status repair action.</td></tr><tr><td>One wallet, one vote per round</td><td><code>hasVoted</code> locks the voter before token transfer.</td><td>Changing the chosen idea after submission is not a V2 feature.</td></tr><tr><td>Authors cannot vote for themselves</td><td>VotingSystem compares voter and Registry author.</td><td>Hide the action, but still handle <code>CannotVoteForOwnIdea</code>.</td></tr><tr><td>Round result is deterministic</td><td>Strict <code>&gt;</code> preserves the first highest-vote idea.</td><td>Display an equal-vote tie as first-in-round selection.</td></tr><tr><td>Milestones cannot pay twice</td><td>Payout flags and active request checks gate each stage.</td><td>Wait for confirmed state after each transaction.</td></tr><tr><td>Only role-bound contracts move protected capital</td><td>FundingPool methods use Registry, Voting and Grant role guards.</td><td>Do not call internal settlement methods from a wallet UI.</td></tr></tbody></table>
      <h2>High-signal failure conditions</h2><table><thead><tr><th>Failure</th><th>Typical cause</th><th>Correct next check</th></tr></thead><tbody><tr><td><code>HumanVerificationRequired</code></td><td>PoP gate is enabled and the wallet lacks an active record.</td><td>Read verifier state; on Arc Testnet use only labelled Demo verification.</td></tr><tr><td><code>InsufficientAllowance</code></td><td>USDC approval for FundingPool is below the proposed stake.</td><td>Read token allowance and approve the exact required amount.</td></tr><tr><td><code>NotEnoughIdeas</code></td><td>Fewer unused pending idea IDs than <code>IDEAS_PER_ROUND</code>.</td><td>Read <code>canStartNewRound()</code> and live counters.</td></tr><tr><td><code>AlreadyVoted</code></td><td>Wallet has already committed in that round.</td><td>Read <code>hasVoted</code>; do not retry with another idea.</td></tr><tr><td><code>RoundNotEnded</code></td><td>Settlement was attempted at or before <code>endTime</code>.</td><td>Use onchain timestamp and retry only after it is strictly later.</td></tr><tr><td><code>MilestoneCooldownActive</code></td><td>Rejected stage was resubmitted before its 48-hour retry time.</td><td>Read the request timestamp and the contract cooldown.</td></tr></tbody></table>
      <h2>Pause is an explicit safety state</h2><p>VotingSystem, FundingPool and GrantManager have independent pause controls. A paused contract blocks its protected write paths even if the other modules are healthy. Treat pause as a state to display plainly, not a condition to work around with retries or alternate function calls.</p>
      <div class="callout warning"><strong>Proxy safety is separate from user safety.</strong> V2 modules are upgradeable contracts. Their proxy/role administration must be controlled operationally, while normal user interfaces should rely on the current implementation's public read and write interface only.</div>
      <h2>Incident-quality report</h2><p>For any unexpected V2 behavior, record the network, contract address, transaction hash, caller, function arguments, observed event logs, expected invariant and actual result. Avoid publishing a potentially exploitable proof before using the private disclosure channel in the Testnet guide.</p>
    `,
  },
  {
    slug: "v2-wallet-integration",
    section: "BERT V2 / Contract reference",
    group: "Integration guides",
    title: "Wallet integration cookbook",
    summary: "Production client flows for USDC approvals, PoP gating, idea submission, voting, settlement and grants.",
    tags: ["v2", "viem", "wallet", "usdc", "approval", "pop"],
    content: `
      <p class="eyebrow">BERT V2 / Wallet integration</p><h1>Simulate first.<br /><span>Then ask for a signature.</span></h1>
      <p class="lead">A reliable V2 client is a read-and-simulate client. It never assumes that an allowance, verification record, idea status or voting window observed a minute ago is still valid when the wallet opens. Read the current chain state, simulate with the active account, submit the resulting request, wait for a receipt and invalidate the related queries.</p>
      <h2>Required contract dependencies</h2>
      <table><thead><tr><th>Need</th><th>Source</th><th>Why it matters</th></tr></thead><tbody><tr><td>USDC address and decimals</td><td>FundingPool <code>usdc()</code>, then ERC-20 metadata</td><td>Use token-native values in writes and accurate decimals in display.</td></tr><tr><td>FundingPool address</td><td>Deployment registry</td><td>It is the spender for idea stakes and votes, not the Registry or VotingSystem.</td></tr><tr><td>Human-verification policy</td><td>PoPVerifier + app environment</td><td>Protected V2 writes require a live proof when human-only policy is enabled.</td></tr><tr><td>Live parameter values</td><td>Registry/VotingSystem reads</td><td>Minimum stake, caps, pause state and durations are contract state, not constants in the frontend.</td></tr></tbody></table>
      <h2>Universal write pipeline</h2>
      <div class="state-track"><div><small>01 READ</small><strong>Current state</strong><span>Fetch role, status, deadline, allowance and relevant local record.</span></div><div><small>02 PREFLIGHT</small><strong>Validate UX input</strong><span>Reject malformed amount or empty metadata before a wallet prompt.</span></div><div><small>03 SIMULATE</small><strong>Exact account</strong><span>Use <code>simulateContract</code> with the connected account and decode custom errors.</span></div><div><small>04 SUBMIT</small><strong>Wait and refresh</strong><span>Wait for receipt, then invalidate reads/indexer entity state.</span></div></div>
      <h2>USDC allowance pattern</h2>
      <p>Idea creation and voting result in FundingPool calling <code>transferFrom</code>. The wallet must therefore approve the <strong>FundingPool</strong>, not IdeaRegistry or VotingSystem. The client should read the current allowance, avoid an unnecessary approval if it already covers the action, and simulate the outer protocol write after the approval confirms.</p>
      <pre><code>const allowance = await publicClient.readContract({
  address: usdcAddress,
  abi: erc20Abi,
  functionName: "allowance",
  args: [account, fundingPoolAddress],
});

if (allowance &lt; requiredAmount) {
  const approval = await walletClient.writeContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [fundingPoolAddress, requiredAmount],
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash: approval });
}</code></pre>
      <div class="callout warning"><strong>Approval is not idea creation or a vote.</strong> A successful ERC-20 approval only authorizes a later FundingPool pull. Keep the protocol write as a distinct wallet transaction and report its result separately.</div>
      <h2>Submit an idea</h2>
      <ol class="numbered-flow"><li>Read the live author minimum stake and whether the Registry accepts a new submission.</li><li>Validate title and description locally, then ensure USDC allowance for the chosen stake.</li><li>Complete the currently configured human-verification policy if the protected write requires it.</li><li>Simulate <code>createIdea</code> from the author's account.</li><li>Wait for <code>IdeaCreated</code> in the receipt; refetch the new Registry record instead of guessing the ID from UI order.</li></ol>
      <pre><code>const simulation = await publicClient.simulateContract({
  account,
  address: ideaRegistryAddress,
  abi: ideaRegistryAbi,
  functionName: "createIdea",
  args: [title.trim(), description.trim(), link.trim(), authorStake],
});

const hash = await walletClient.writeContract(simulation.request);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
// Decode IdeaCreated from receipt.logs using ideaRegistryAbi, then refetch getIdea(id).</code></pre>
      <h2>Cast a vote</h2>
      <p>Vote UI needs more than a list of cards. It must read the round, confirm the round is active, verify that the selected idea belongs to the round, read <code>hasVoted(roundId, account)</code>, prevent self-voting, check the active PoP condition and ensure USDC allowance for the requested amount. The contract enforces every condition; these reads make the user experience predictable.</p>
      <pre><code>const [round, voted, idea] = await Promise.all([
  publicClient.readContract({ address: votingAddress, abi: votingAbi, functionName: "getRoundInfo", args: [roundId] }),
  publicClient.readContract({ address: votingAddress, abi: votingAbi, functionName: "hasVoted", args: [roundId, account] }),
  publicClient.readContract({ address: registryAddress, abi: registryAbi, functionName: "getIdea", args: [ideaId] }),
]);

if (voted || idea.author.toLowerCase() === account.toLowerCase()) throw new Error("Vote is not eligible");
const vote = await publicClient.simulateContract({
  account, address: votingAddress, abi: votingAbi,
  functionName: "vote", args: [roundId, ideaId, amount],
});
await walletClient.writeContract(vote.request);</code></pre>
      <h2>Permissionless settlement and grant UI</h2>
      <p>After the chain timestamp is strictly later than a round's <code>endTime</code>, any account can call <code>endVotingRound</code>. Do not restrict a settlement button to an Admin in your own interface. After settlement, only the winning author should see a claim control, and that control must be gated by <code>canClaimGrant(roundId)</code>, not just an indexed winner label.</p>
      <table><thead><tr><th>User intent</th><th>Canonical read</th><th>Canonical write</th></tr></thead><tbody><tr><td>Settle elapsed round</td><td><code>getRoundInfo</code> + chain timestamp</td><td><code>endVotingRound(roundId)</code></td></tr><tr><td>Claim winning grant</td><td><code>canClaimGrant(roundId)</code></td><td><code>claimGrant(roundId)</code></td></tr><tr><td>Submit milestone</td><td><code>getGrantPayout</code>, <code>getMilestoneRequest</code></td><td><code>submitMilestoneProof(...)</code></td></tr><tr><td>Review milestone</td><td>Request state + reviewer role</td><td><code>reviewMilestoneProof(...)</code></td></tr></tbody></table>
      <div class="callout info"><strong>Testnet versus mainnet:</strong> on Arc Testnet, Demo PoP is deliberately a functional gate for exercising protected writes and is not evidence of unique personhood. Keep environment labels visible. A production World ID rollout is a distinct policy and deployment step.</div>
    `,
  },
  {
    slug: "v2-indexing-reference",
    section: "BERT V2 / Contract reference",
    group: "Integration guides",
    title: "V2 indexing and read models",
    summary: "Event sources, entity keys, reconciliation rules and GraphQL patterns for a correct V2 explorer.",
    tags: ["v2", "subgraph", "events", "indexing", "graphql", "read-model"],
    content: `
      <p class="eyebrow">BERT V2 / Indexing</p><h1>Build history from events.<br /><span>Build actions from reads.</span></h1>
      <p class="lead">An indexer makes V2 navigable: ideas can be searched, round activity can be listed, and grant history can be displayed without a wallet repeatedly fetching every ID. It must not be the final authority for a capital-moving transaction. Index events for history, then re-read the responsible contract before an action.</p>
      <h2>Minimum event subscription set</h2>
      <table><thead><tr><th>Domain</th><th>Events</th><th>Suggested entity key</th><th>Invalidate on receipt</th></tr></thead><tbody><tr><td>Ideas</td><td><code>IdeaCreated</code>, <code>IdeaStatusUpdated</code>, <code>IdeaVoted</code>, quality/review events</td><td><code>chainId:ideaId</code></td><td>Idea details, author profile, pending-idea list.</td></tr><tr><td>Rounds</td><td><code>VotingRoundStarted</code>, <code>VoteCast</code>, <code>VotingRoundEnded</code></td><td><code>chainId:roundId</code></td><td>Active round, totals, voter history, result view.</td></tr><tr><td>Funding</td><td>Deposit, author stake, reserved/distributed/slashed/reserve events</td><td><code>chainId:roundId:ideaId</code> where applicable</td><td>FundingPool balance and grant preview.</td></tr><tr><td>Grants</td><td><code>RoundFunded</code>, milestone submitted/reviewed/approved/rejected</td><td><code>chainId:roundId:stage:requestId</code></td><td>Payout record, milestone request and reviewer queues.</td></tr></tbody></table>
      <h2>Entity modelling rules</h2>
      <ul><li><strong>IDs are scoped:</strong> store chain ID with every onchain numeric ID, even if the current product uses one network.</li><li><strong>Address normalization:</strong> use canonical lower-case keys in storage while preserving checksum form for display.</li><li><strong>Events are ordered:</strong> persist block number, transaction hash and log index. The log index resolves multiple lifecycle events in one transaction.</li><li><strong>Never derive an outcome from totals alone:</strong> the official winner and terminal state are emitted/recorded by settlement.</li><li><strong>Keep raw and derived data distinct:</strong> raw event payloads aid replay; derived fields make search fast.</li></ul>
      <h2>Reconciliation after a user transaction</h2>
      <div class="state-track"><div><small>RECEIPT</small><strong>Decode logs</strong><span>Show the user an immediate confirmed outcome from their receipt.</span></div><div><small>READ</small><strong>Refetch contract</strong><span>Query exact changed idea, round, payout or allowance state.</span></div><div><small>INDEX</small><strong>Await entity update</strong><span>Subgraph/backend eventually reflects historical and search state.</span></div><div><small>RENDER</small><strong>Prefer newest source</strong><span>Direct read wins for current action eligibility; indexer supplies list/history.</span></div></div>
      <h2>GraphQL query shape</h2>
      <p>The exact names depend on the deployed V2 subgraph schema, but the query must fetch terminal fields that drive presentation: status, round timing, winner, vote totals, author and milestone state. Avoid a list query that cannot tell a user whether an item is still actionable.</p>
      <pre><code>query IdeaWithRoundContext($ideaId: ID!) {
  idea(id: $ideaId) {
    id
    onchainId
    author
    title
    status
    totalVotes
    createdAt
    reviews { reviewer comment createdAt }
  }
}

query RecentRounds($first: Int!) {
  votingRounds(first: $first, orderBy: startTime, orderDirection: desc) {
    id startTime endTime ended winnerIdeaId totalVotes
    ideaIds
  }
}</code></pre>
      <h2>RPC and pagination</h2>
      <p>Use deployment start blocks and bounded ranges when querying logs. Do not ask an Arc RPC for historical logs from block zero, because provider history may be pruned. Paginate idea and round lists, cache successful reads by <code>chainId + contract address + ID</code>, and make event handlers idempotent so replaying a block range cannot duplicate an entity or balance movement.</p>
      <h2>Explorer integrity checks</h2>
      <table><thead><tr><th>Screen</th><th>Indexed source</th><th>Fresh onchain check before write</th></tr></thead><tbody><tr><td>Idea card</td><td>Metadata, status, reviews, history</td><td><code>getIdea</code>/<code>getStatus</code> before quality action or author-specific UI.</td></tr><tr><td>Round page</td><td>Participants, vote history, totals</td><td><code>getRoundInfo</code> and <code>hasVoted</code> before vote/settlement.</td></tr><tr><td>Grant page</td><td>Milestone history, reviews, notifications</td><td><code>canClaimGrant</code>, payout and request reads before submit/review.</td></tr><tr><td>Capital dashboard</td><td>Transfer history, reserve movements</td><td>FundingPool accounting reads before displaying action availability.</td></tr></tbody></table>
      <div class="callout warning"><strong>Reorg and failure handling:</strong> testnet reorg risk may be low, but a correct indexer still needs idempotent event IDs and rollback/replay capability. A failed or replaced wallet transaction must never be converted into a successful history item merely because the UI optimistically rendered it.</div>
    `,
  },
];
