export const v3Docs = [
  {
    slug: "v3-overview",
    section: "BERT V3 / Contract reference",
    group: "Architecture & deployment",
    title: "V3 architecture",
    summary: "Factory, Hub and Treasury boundaries for isolated onchain Communities.",
    tags: ["v3", "architecture", "factory", "hub", "treasury", "usdc"],
    content: `
      <p class="eyebrow">BERT V3 / Architecture</p><h1>One Community.<br /><span>Three execution boundaries.</span></h1>
      <p class="lead">V3 is a deployment system for independent Communities, not one global DAO contract. A Factory records a canonical deployment, a Hub owns Community governance state, and a paired Treasury owns the Community's USDC accounting. An integration should treat these as separate contracts with separate trust boundaries.</p>
      <div class="protocol-illustration"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><span class="orbit-node node-v2">V2 Rail</span><img src="assets/bert-logo.png" alt="BERT protocol logo" /><span class="orbit-node node-v3">V3 Community</span></div>
      <div class="contract-rail"><div><b>01</b><small>Discovery</small><strong>CommunityFactory</strong><span>Reserves configuration, creates the paired Treasury through its deployer and registers the final Community pair.</span></div><div><b>02</b><small>Governance</small><strong>CommunityHub</strong><span>Owns roles, member state, proposals, validation, votes, rounds and pause-aware Community time.</span></div><div><b>03</b><small>Custody</small><strong>CommunityTreasury</strong><span>Holds USDC, tracks all local buckets and processes settlement, claims and quorum-approved withdrawals.</span></div></div>
      <h2>Deployment topology</h2>
      <p>The Factory is the canonical registry. It is the upgradeable V3 infrastructure contract and is deployed behind a Transparent proxy. Every Hub and Treasury are deployed per Community. Their addresses are meaningful only after Factory activation. Resolve an active Community through <code>CommunityFactory.getCommunity(communityId)</code>; do not trust a Hub or Treasury address supplied by an unverified frontend parameter.</p>
      <div class="state-track"><div><small>STEP 01</small><strong>Reserve</strong><span><code>createCommunity(config)</code> stores intended configuration and creates the paired Treasury.</span></div><div><small>STEP 02</small><strong>Deploy Hub</strong><span>The creator deploys a Hub with that exact configuration and reserved Treasury address.</span></div><div><small>STEP 03</small><strong>Activate</strong><span><code>activateCommunity(id, hub)</code> verifies creator, config hash and Treasury linkage.</span></div><div><small>STEP 04</small><strong>Operate</strong><span>Index the canonical Hub/Treasury pair only once the Factory reports it active.</span></div></div>
      <div class="callout info"><strong>Activation is a security boundary.</strong> A reserved Treasury is not an active Community. A deployed Hub is not necessarily canonical. Factory activation binds both only after verification.</div>
      <h2>What is local and what is shared</h2>
      <table><thead><tr><th>Domain</th><th>Scope</th><th>Integration implication</th></tr></thead><tbody><tr><td>Membership, proposals, votes, rounds</td><td>One Hub</td><td>IDs are local to a Community. Pair every proposal/round ID with its Hub address.</td></tr><tr><td>USDC escrow, execution, rewards, refunds</td><td>One Treasury</td><td>Never call raw ERC-20 balance the available balance. Read Treasury buckets and events.</td></tr><tr><td>Discovery and activation</td><td>Factory</td><td>Use Factory events or V3 subgraph as the canonical discovery source.</td></tr><tr><td>Human-verification policy</td><td>Protocol-wide policy</td><td>Testnet Demo PoP and future production World ID do not replace Community role checks.</td></tr><tr><td>Global reserve routing</td><td>Configured BERT reserve</td><td>Specific rejected-proposal and NO-side settlement routes leave the local Treasury explicitly.</td></tr></tbody></table>
      <h2>Integration invariants</h2>
      <ul><li><strong>Address pairing:</strong> Factory is the source of truth for a Community Hub and Treasury.</li><li><strong>Local accounting:</strong> one Community cannot use another Community's stake, execution balance, rewards or refund liabilities.</li><li><strong>Role separation:</strong> active Members cannot overlap with Admin or Validator roles.</li><li><strong>Pause-aware time:</strong> governance deadlines use <code>communityTime()</code>, not only wall-clock time.</li><li><strong>Terminal settlement:</strong> each proposal and slate round settles once. Consume terminal events instead of reconstructing outcomes from UI state.</li></ul>
      <h2>Read-first client pattern</h2>
      <p>For a transaction UI, resolve the Factory record, read current Hub/Treasury state, then simulate the intended write from the connected account. This avoids offering stale transactions after a proposal settles, a withdrawal is cancelled, an exit becomes pending or Community status changes.</p>
      <div class="code-sample"><div class="code-sample-header"><span>Viem / resolve canonical deployment</span><button type="button" class="code-copy-button" data-copy-code="v3-resolve" data-copy-label="Copy">Copy</button></div><pre><code id="v3-resolve">const deployment = await publicClient.readContract({
  address: factoryAddress,
  abi: communityFactoryAbi,
  functionName: "getCommunity",
  args: [communityId],
});

if (deployment.hub === zeroAddress || deployment.treasury === zeroAddress) {
  throw new Error("Community is reserved or not activated");
}

const [member, status, available] = await Promise.all([
  publicClient.readContract({ address: deployment.hub, abi: communityHubAbi, functionName: "getMember", args: [account] }),
  publicClient.readContract({ address: deployment.hub, abi: communityHubAbi, functionName: "communityStatus" }),
  publicClient.readContract({ address: deployment.treasury, abi: communityTreasuryAbi, functionName: "availableExecutionBalance" }),
]);</code></pre></div>
      <div class="callout warning"><strong>Network addresses are not permanent documentation prose.</strong> Testnet deployments can change during development. Use the verified address table and a pinned event start block for the network you are integrating.</div>
    `,
  },
  {
    slug: "v3-factory-deployment",
    section: "BERT V3 / Contract reference",
    group: "Architecture & deployment",
    title: "Factory deployment and activation",
    summary: "Reserve/deploy/activate workflow, immutable configuration and canonical Factory events.",
    tags: ["v3", "factory", "deployment", "config", "activation", "events"],
    content: `
      <p class="eyebrow">BERT V3 / Factory</p><h1>Reserve first.<br /><span>Activate only an exact match.</span></h1>
      <p class="lead">Community creation is intentionally a multi-transaction flow. It prevents an app from treating an arbitrary deployed Hub as a Community and binds the final Hub to the exact configuration and Treasury that the Factory reserved.</p>
      <h2>Factory API</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Caller</th><th>Result</th><th>Critical condition</th></tr></thead><tbody><tr><td>createCommunity(config)</td><td>Creator</td><td>Allocates an ID and records the paired Treasury reservation.</td><td>Config establishes the intended roles, economics and timing.</td></tr><tr><td>activateCommunity(id, hub)</td><td>Original creator</td><td>Registers canonical Hub/Treasury pair.</td><td>Hub must match reserved creator, configuration hash and Treasury linkage.</td></tr><tr><td>getCommunity(id)</td><td>Anyone</td><td>Creator, Hub, Treasury and creation time.</td><td>Use this as address discovery source.</td></tr><tr><td>getCreatorCommunityIds(creator)</td><td>Anyone</td><td>IDs created by address.</td><td>Creator history is not a substitute for active-pair validation.</td></tr><tr><td>isActiveCommunityTreasury(treasury)</td><td>Anyone</td><td>Whether Treasury is attached to an active Factory record.</td><td>Useful defensive check for integrations.</td></tr></tbody></table>
      <h2>CommunityConfig is immutable policy</h2>
      <p><code>CommunityTypes.CommunityConfig</code> is not presentation metadata. It becomes the policy of an isolated Community. A creation UI should convert USDC to native token units, validate unique role addresses, show the full policy before signing and treat timing values according to the target environment.</p>
      <table><thead><tr><th>Area</th><th>Fields</th><th>Developer concern</th></tr></thead><tbody><tr><td>Identity/routing</td><td><code>name</code>, <code>metadataURI</code>, <code>usdc</code>, <code>globalBertReserve</code></td><td>Metadata and asset route; show both addresses clearly.</td></tr><tr><td>Initial roles</td><td><code>initialAdmins</code>, <code>initialValidators</code></td><td>Role overlap is invalid; initial security surface begins here.</td></tr><tr><td>Member economics</td><td><code>entryStakeUSDC</code>, <code>proposalBondUSDC</code>, <code>voteMinStakeUSDC</code></td><td>Explains allowances and capital required for each action.</td></tr><tr><td>Thresholds/fees</td><td><code>validatorApprovalThreshold</code>, <code>adminApprovalThreshold</code>, <code>binaryRejectionFeeBps</code>, <code>validatorRewardShareBps</code></td><td>Controls validation, critical actions, NO refunds and Member-review rewards.</td></tr><tr><td>Community clock</td><td><code>membershipExitCooldown</code>, <code>validationWindow</code>, <code>binaryVotingDuration</code>, <code>roundVotingDuration</code>, <code>validatorRewardEpoch</code></td><td>Must be rendered from chain config and measured with pause-aware time.</td></tr><tr><td>Validator activity</td><td><code>validatorActiveThresholdBps</code>, <code>validatorProposalPointsThreshold</code></td><td>Sets eligibility for an epoch reward share.</td></tr></tbody></table>
      <h2>Reserve with simulation</h2>
      <div class="code-sample"><div class="code-sample-header"><span>Viem / createCommunity</span><button type="button" class="code-copy-button" data-copy-code="v3-create" data-copy-label="Copy">Copy</button></div><pre><code id="v3-create">const config = {
  name: "Research Guild", metadataURI: "ipfs://community-metadata",
  usdc: usdcAddress, globalBertReserve: reserveAddress,
  initialAdmins: [creator, secondAdmin], initialValidators: [validatorOne, validatorTwo],
  entryStakeUSDC: parseUnits("10", 6), proposalBondUSDC: parseUnits("50", 6),
  voteMinStakeUSDC: parseUnits("10", 6), membershipExitCooldown: 7n * 24n * 60n * 60n,
  validatorApprovalThreshold: 2n, adminApprovalThreshold: 2n,
  binaryRejectionFeeBps: 300n, validatorRewardShareBps: 1500n,
  validationWindow: 3n * 24n * 60n * 60n, binaryVotingDuration: 5n * 24n * 60n * 60n,
  roundVotingDuration: 5n * 24n * 60n * 60n, validatorRewardEpoch: 30n * 24n * 60n * 60n,
  validatorActiveThresholdBps: 6000n, validatorProposalPointsThreshold: 1n,
};

const simulation = await publicClient.simulateContract({
  account: creator, address: factoryAddress, abi: communityFactoryAbi,
  functionName: "createCommunity", args: [config],
});
const hash = await walletClient.writeContract(simulation.request);</code></pre></div>
      <h2>Events required for discovery</h2>
      <table class="api-matrix"><thead><tr><th>Event</th><th>Indexed fields</th><th>Indexer action</th></tr></thead><tbody><tr><td>CommunityTreasuryCreated</td><td>ID, creator, Treasury, config hash, name, metadata URI</td><td>Create a reserved record only. It is not active yet.</td></tr><tr><td>CommunityCreated</td><td>ID, creator, Hub, Treasury</td><td>Mark active and start indexing Hub/Treasury dynamic sources.</td></tr></tbody></table>
      <div class="callout danger"><strong>Do not infer activation from deployment.</strong> Wait for <code>CommunityCreated</code>, or a Factory read returning a non-zero linked Hub and Treasury, before enabling normal Community operations.</div>
      <h2>Expected failure paths</h2><ul><li><strong>Creator mismatch:</strong> activation must be sent by the reservation creator.</li><li><strong>Config mismatch:</strong> changing a field after reservation makes the intended Hub incompatible. Create a fresh reservation.</li><li><strong>Treasury mismatch:</strong> a Hub must point to the Treasury created for that reservation.</li><li><strong>Already activated:</strong> after a mined transaction, refetch Factory state before exposing a retry.</li></ul>
    `,
  },
  {
    slug: "v3-hub-membership",
    section: "BERT V3 / Contract reference",
    group: "Community runtime",
    title: "Hub roles and membership API",
    summary: "Community status, role boundaries, membership stakes, cooldowns and the pause-aware clock.",
    tags: ["v3", "hub", "membership", "roles", "exit", "pause"],
    content: `
      <p class="eyebrow">BERT V3 / CommunityHub</p><h1>Membership is state.<br /><span>Not a UI toggle.</span></h1>
      <p class="lead">The Hub stores Community lifecycle state: active Members, Admins and Validators; proposal and round state; pause-aware time; and exit blockers. A client must read this state before it decides what an account can do.</p>
      <div class="three-up"><article class="doc-card static-card"><span class="mini-icon">MEM</span><h3>Member</h3><p>Joins with configured USDC stake. While active, can create Member proposals and vote.</p></article><article class="doc-card static-card"><span class="mini-icon">VAL</span><h3>Validator</h3><p>Reviews Member proposals. Eligible validated work can earn epoch rewards.</p></article><article class="doc-card static-card"><span class="mini-icon">ADM</span><h3>Admin</h3><p>Creates Admin proposals and controls protected Community actions through local quorum.</p></article></div>
      <div class="callout warning"><strong>Role exclusivity is onchain.</strong> An active Member cannot be an Admin or Validator. A role holder cannot join as an active Member. Build role change UI as an explicit transition, never a composable set of badges.</div>
      <h2>Read API</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Returns</th><th>Client use</th></tr></thead><tbody><tr><td>communityTreasury()</td><td>Paired Treasury</td><td>Cross-check with Factory before allowances or accounting reads.</td></tr><tr><td>communityTime()</td><td>Pause-adjusted timestamp</td><td>Calculate validation, voting, expiry and exit availability.</td></tr><tr><td>getMember(account)</td><td>Active, join/exit time, stake, proposal points</td><td>Gate join/propose/vote/exit actions.</td></tr><tr><td>isAdminAccount(account)</td><td>Boolean</td><td>Gate control-plane and Admin proposal UI.</td></tr><tr><td>isValidatorAccount(account)</td><td>Boolean</td><td>Gate validation and Validator reward UI.</td></tr><tr><td>isValidatorEligible(account)</td><td>Boolean</td><td>Read before creating an action to add a Validator.</td></tr></tbody></table>
      <h2>Membership lifecycle</h2>
      <div class="state-track"><div><small>JOIN</small><strong>Approve USDC</strong><span>Treasury pulls exactly <code>entryStakeUSDC</code>.</span></div><div><small>ACTIVE</small><strong>Participate</strong><span>Member can propose and vote under each flow's preconditions.</span></div><div><small>EXIT REQUEST</small><strong>Cooldown starts</strong><span>New Member proposals are blocked and timing begins on Community clock.</span></div><div><small>FINALIZE</small><strong>Stake returns</strong><span>Cooldown plus every governance blocker must be clear.</span></div></div>
      <h2>Writes and preconditions</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Caller</th><th>Important preconditions</th></tr></thead><tbody><tr><td>joinCommunity()</td><td>Any account</td><td>Community Active; account is not active Member/Admin/Validator; allowance covers entry stake.</td></tr><tr><td>requestMembershipExit()</td><td>Active Member</td><td>Not paused and no existing exit request. It does not transfer funds.</td></tr><tr><td>finalizeMembershipExit()</td><td>Active Member</td><td>Not paused; cooldown complete unless archived; no role, active Member proposal or unresolved vote lock.</td></tr><tr><td>renounceValidatorRole()</td><td>Validator</td><td>Role-specific exit; refetch pending eligibility after it mines.</td></tr></tbody></table>
      <div class="code-sample"><div class="code-sample-header"><span>Viem / join after allowance</span><button type="button" class="code-copy-button" data-copy-code="v3-join" data-copy-label="Copy">Copy</button></div><pre><code id="v3-join">const member = await publicClient.readContract({
  address: hubAddress, abi: communityHubAbi, functionName: "getMember", args: [account],
});
if (member.active) throw new Error("Already an active Member");

await walletClient.writeContract({
  address: usdcAddress, abi: erc20Abi, functionName: "approve",
  args: [treasuryAddress, entryStakeUSDC], account,
});
await walletClient.writeContract({
  address: hubAddress, abi: communityHubAbi, functionName: "joinCommunity", account,
});</code></pre></div>
      <h2>Pause and archive semantics</h2>
      <p><strong>Paused</strong> freezes normal active-governance operations and stops the Community clock, so validation and voting cannot silently expire. <strong>Archived</strong> is terminal and more restrictive. It does not erase state; a member with an already-requested exit can finalize without remaining cooldown, but ordinary governance is not resumed.</p>
      <div class="callout info"><strong>Timing rule:</strong> show an estimate for humans, but decide eligibility from <code>communityTime()</code> compared with the stored onchain deadline.</div>
    `,
  },
  {
    slug: "v3-proposal-engine",
    section: "BERT V3 / Contract reference",
    group: "Community runtime",
    title: "Proposal, validation and voting API",
    summary: "Admin/Member lanes, Binary/Slate modes, validator review, vote escrow and settlement.",
    tags: ["v3", "proposals", "validation", "binary", "slate", "voting"],
    content: `
      <p class="eyebrow">BERT V3 / Governance engine</p><h1>Four proposal lanes.<br /><span>Different economic paths.</span></h1>
      <p class="lead">A V3 proposal has an origin lane and voting mode. Admin-originated items start ready for voting or a Slate round. Member-originated items first enter validator review and lock a proposal bond. Similar-looking cards do not imply equivalent lifecycle or settlement rules.</p>
      <table><thead><tr><th>Lane</th><th>Create call</th><th>Review</th><th>Member action</th><th>Validator reward</th></tr></thead><tbody><tr><td>Admin Binary</td><td><code>createAdminProposal</code></td><td>None</td><td>YES or NO vote</td><td>Zero: no validation occurred.</td></tr><tr><td>Member Binary</td><td><code>createMemberProposal</code></td><td>Validator approvals</td><td>YES or NO after approval</td><td>Validation epoch can receive configured share.</td></tr><tr><td>Admin Slate</td><td><code>createAdminSlateProposal</code></td><td>None</td><td>Select one proposal in Admin round</td><td>Zero: no validation occurred.</td></tr><tr><td>Member Slate</td><td><code>createMemberSlateProposal</code></td><td>Validator approvals</td><td>Select one eligible proposal in Member round</td><td>Validation epoch can receive configured share.</td></tr></tbody></table>
      <h2>Proposal state machine</h2>
      <div class="state-track"><div><small>MEMBER ONLY</small><strong>PendingValidation</strong><span>Validators approve/reject until threshold resolves or deadline is finalized.</span></div><div><small>APPROVED</small><strong>Ready</strong><span>Binary becomes <code>ApprovedForVoting</code>; Slate becomes <code>ApprovedForRound</code>.</span></div><div><small>LIVE</small><strong>Voting</strong><span>Member stake is escrowed and the voter receives an exit lock.</span></div><div><small>TERMINAL</small><strong>Settled</strong><span>Hub records outcome; Treasury performs one-time capital routing.</span></div></div>
      <h2>Validation API and liveness</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Caller</th><th>Behavior</th></tr></thead><tbody><tr><td>castValidationDecision(id, approved)</td><td>Validator</td><td>One decision per Validator on a pending Member proposal. It can finalize automatically on success or mathematical impossibility.</td></tr><tr><td>finalizeMemberProposalValidation(id)</td><td>Anyone after deadline</td><td>Resolves a remaining pending case after window close. Include it in keeper/indexer action surfaces.</td></tr><tr><td>getProposal(id)</td><td>Anyone</td><td>Origin, mode, status, deadlines, vote totals, validation counts, bond and settlement fields.</td></tr></tbody></table>
      <div class="callout info"><strong>Validation rejection is terminal for the entry flow.</strong> A rejected Member proposal does not reach member voting. It becomes <code>RejectedByValidators</code> and its proposal bond follows the rejection route.</div>
      <h2>Binary voting</h2>
      <p>Admin opens a ready Binary proposal with <code>openBinaryVoting(id)</code>. An active Member calls <code>castBinaryVote(id, choice, amount)</code>. The choice cannot be <code>None</code>, proposal authors cannot vote for their own proposal, a member votes once, and the stake must satisfy the Community minimum and maximum. Treasury pulls stake using ERC-20 allowance.</p>
      <ul><li><strong>YES wins only when strictly greater:</strong> <code>yesVotes &gt; noVotes</code>; a tie is a NO/rejection settlement.</li><li><strong>YES settlement:</strong> NO stake routes to global reserve. A Member proposal allocates configured reward share from YES stake to its validation epoch; an Admin proposal allocates zero.</li><li><strong>NO/tie settlement:</strong> YES stake and NO-side fee route to reserve. Each NO voter claims their remaining refund directly from Treasury.</li><li><strong>Settlement:</strong> after deadline, anyone calls <code>settleBinaryProposal(id)</code>. It is permissionless but one-time.</li></ul>
      <h2>Slate rounds</h2>
      <p>Admins create a same-origin round using <code>createAdminSlateRound(ids)</code> or <code>createMemberSlateRound(ids)</code>. Each Member selects a single proposal using <code>castSlateRoundVote(roundId, proposalId, amount)</code>. Full round escrow settles to execution plus optional Member-validation rewards. Slate has no NO side and no per-voter refund.</p>
      <div class="callout warning"><strong>Deterministic tie-break:</strong> a Slate tie selects the first proposal in submitted proposal-ID order. Index and display that order; do not randomize or imply a tie replay.</div>
      <div class="code-sample"><div class="code-sample-header"><div class="code-tabs" role="tablist"><button class="code-tab active" type="button" role="tab" aria-selected="true" data-code-tab="member" data-code-group="proposal-flow">Member proposal</button><button class="code-tab" type="button" role="tab" aria-selected="false" data-code-tab="validation" data-code-group="proposal-flow">Validator review</button><button class="code-tab" type="button" role="tab" aria-selected="false" data-code-tab="vote" data-code-group="proposal-flow">Binary vote</button></div><button type="button" class="code-copy-button" data-copy-code="v3-member-proposal" data-copy-label="Copy">Copy</button></div><div class="code-pane active" data-code-panel="member" data-code-group="proposal-flow"><pre><code id="v3-member-proposal">await walletClient.writeContract({
  address: usdcAddress, abi: erc20Abi, functionName: "approve",
  args: [treasuryAddress, proposalBondUSDC], account: member,
});
await walletClient.writeContract({
  address: hubAddress, abi: communityHubAbi, functionName: "createMemberProposal",
  args: ["Fund audit", "Scope and deliverables", "ipfs://proposal-metadata"], account: member,
});</code></pre></div><div class="code-pane" hidden data-code-panel="validation" data-code-group="proposal-flow"><pre><code id="v3-validation">await walletClient.writeContract({
  address: hubAddress, abi: communityHubAbi, functionName: "castValidationDecision",
  args: [proposalId, true], account: validator,
});
// Anyone can resolve a still-pending case after validation deadline.
await walletClient.writeContract({
  address: hubAddress, abi: communityHubAbi,
  functionName: "finalizeMemberProposalValidation", args: [proposalId], account,
});</code></pre></div><div class="code-pane" hidden data-code-panel="vote" data-code-group="proposal-flow"><pre><code id="v3-binary-vote">await walletClient.writeContract({
  address: usdcAddress, abi: erc20Abi, functionName: "approve",
  args: [treasuryAddress, voteAmount], account: voter,
});
await walletClient.writeContract({
  address: hubAddress, abi: communityHubAbi, functionName: "castBinaryVote",
  args: [proposalId, 1, voteAmount], // generated ABI enum: VoteChoice.Yes
  account: voter,
});</code></pre></div></div>
    `,
  },
  {
    slug: "v3-treasury-accounting",
    section: "BERT V3 / Contract reference",
    group: "Treasury & control",
    title: "Treasury accounting and reward API",
    summary: "USDC buckets, binary/slate settlement, refunds and validator reward claims.",
    tags: ["v3", "treasury", "usdc", "rewards", "refunds", "accounting"],
    content: `
      <p class="eyebrow">BERT V3 / CommunityTreasury</p><h1>Every USDC unit<br /><span>has a local bucket.</span></h1>
      <p class="lead">CommunityTreasury is not a generic wallet. It maintains membership stakes, proposal bonds, Binary escrow, Slate escrow, execution capital, validator rewards, pending withdrawal reservations and claimable refund liabilities separately. Use its accounting methods and events, not only ERC-20 transfers.</p>
      <h2>Accounting surface</h2>
      <table><thead><tr><th>Bucket</th><th>Source</th><th>Recipient</th><th>Read/claim route</th></tr></thead><tbody><tr><td>Membership stake</td><td>Join</td><td>That Member after valid exit</td><td>Hub member state; released by <code>finalizeMembershipExit</code>.</td></tr><tr><td>Proposal bond</td><td>Member proposal</td><td>Author or global reserve</td><td><code>getProposalBond(id)</code>; return after fair vote or slash after validator rejection.</td></tr><tr><td>Vote escrow</td><td>Binary/Slate votes</td><td>Execution, reserve, rewards or NO voters</td><td>Hub state plus settlement events.</td></tr><tr><td>Execution balance</td><td>Winning settlement</td><td>Approved withdrawal recipient</td><td><code>availableExecutionBalance()</code> and withdrawal requests.</td></tr><tr><td>Validator rewards</td><td>Member settlement share</td><td>Active Validators</td><td><code>claimValidatorReward(epochId)</code> after finalized epoch.</td></tr><tr><td>Refund liability</td><td>NO/tie Binary settlement</td><td>Each NO voter</td><td><code>getRefundPreview</code>, then <code>claimNoVoteRefund</code>.</td></tr></tbody></table>
      <h2>Settlement map</h2>
      <div class="contract-rail"><div><b>YES</b><small>Binary accepted</small><strong>Execution + optional reward</strong><span>YES stake enters execution less Member-validation reward share. NO stake routes to global reserve.</span></div><div><b>NO</b><small>Binary rejected/tied</small><strong>Reserve + refund liability</strong><span>YES stake and NO fee route to reserve. Remaining NO stake becomes individually claimable.</span></div><div><b>SLT</b><small>Slate settled</small><strong>Execution + optional reward</strong><span>All round stake settles locally. No NO path and no per-voter refund claim.</span></div></div>
      <h2>Direct read and claim API</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Caller</th><th>When valid</th></tr></thead><tbody><tr><td>claimNoVoteRefund(id)</td><td>NO voter</td><td>NO/tie Binary settled; caller cast NO; caller has not claimed.</td></tr><tr><td>claimValidatorReward(epoch)</td><td>Validator</td><td>Epoch final; caller active in epoch; not already claimed; non-zero reward.</td></tr><tr><td>getRefundPreview(id, voter)</td><td>Anyone</td><td>Read-only eligibility/amount check before rendering claim control.</td></tr><tr><td>availableExecutionBalance()</td><td>Anyone</td><td>Execution balance minus open-withdrawal reservations.</td></tr><tr><td>getWithdrawalRequest(id)</td><td>Anyone</td><td>Recipient, amount, approvals, reason, metadata and terminal flags.</td></tr></tbody></table>
      <h2>Validator reward epochs</h2><p>Each Member-originated proposal is associated with the current validation epoch when it enters review. Once the epoch ends, the Hub finalizes which Validators are active under Community policy, then Treasury exposes equal pull-based rewards. Admin-originated proposal settlements use epoch ID zero and allocate no validator reward, because there was no validator review.</p>
      <div class="code-sample"><div class="code-sample-header"><div class="code-tabs" role="tablist"><button class="code-tab active" type="button" role="tab" aria-selected="true" data-code-tab="refund" data-code-group="treasury-flow">NO refund</button><button class="code-tab" type="button" role="tab" aria-selected="false" data-code-tab="reward" data-code-group="treasury-flow">Validator reward</button></div><button type="button" class="code-copy-button" data-copy-code="v3-refund" data-copy-label="Copy">Copy</button></div><div class="code-pane active" data-code-panel="refund" data-code-group="treasury-flow"><pre><code id="v3-refund">const [amount, claimable] = await publicClient.readContract({
  address: treasuryAddress, abi: communityTreasuryAbi,
  functionName: "getRefundPreview", args: [proposalId, voter],
});
if (claimable && amount > 0n) await walletClient.writeContract({
  address: treasuryAddress, abi: communityTreasuryAbi,
  functionName: "claimNoVoteRefund", args: [proposalId], account: voter,
});</code></pre></div><div class="code-pane" hidden data-code-panel="reward" data-code-group="treasury-flow"><pre><code id="v3-reward">const epoch = await publicClient.readContract({
  address: hubAddress, abi: communityHubAbi,
  functionName: "getValidatorRewardEpoch", args: [epochId],
});
if (epoch.finalized) await walletClient.writeContract({
  address: treasuryAddress, abi: communityTreasuryAbi,
  functionName: "claimValidatorReward", args: [epochId], account: validator,
});</code></pre></div></div>
      <h2>Reconciliation rule</h2><p>Use Treasury events as the accounting ledger and contract reads as the current-state checkpoint. <code>BinaryNoWinSettled</code> establishes refund liability; later <code>RefundClaimed</code> events reduce it. A raw USDC <code>Transfer</code> cannot determine whether an amount was a stake return, bond settlement, reward claim, withdrawal or reserve route.</p>
      <div class="callout warning"><strong>Decimals:</strong> current Arc Testnet uses USDC-style 6 decimals. A production integration should read configured token metadata rather than hard-code display formatting.</div>
    `,
  },
  {
    slug: "v3-admin-actions",
    section: "BERT V3 / Contract reference",
    group: "Treasury & control",
    title: "Admin actions and withdrawals",
    summary: "Immutable Admin quorum, roster protections, pause/archive and execution withdrawal safety.",
    tags: ["v3", "admin", "quorum", "withdrawals", "archive", "security"],
    content: `
      <p class="eyebrow">BERT V3 / Control plane</p><h1>No unilateral<br /><span>Community takeover.</span></h1>
      <p class="lead">V3 distinguishes Admin proposals from security-sensitive Community control. Roster changes, pause/resume, archive and withdrawal cancellation are Admin action requests. The creator supplies the first approval, other Admins approve, and any Admin executes only after the immutable local threshold is met.</p>
      <h2>Admin action API</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Caller</th><th>Behavior</th></tr></thead><tbody><tr><td>createAdminActionRequest(action,target,value)</td><td>Admin</td><td>Creates request and records proposer as first approval.</td></tr><tr><td>approveAdminActionRequest(id)</td><td>Admin</td><td>Records one approval for an open request.</td></tr><tr><td>executeAdminActionRequest(id)</td><td>Admin</td><td>Executes only after immutable <code>adminApprovalThreshold</code>.</td></tr></tbody></table>
      <table><thead><tr><th>Action</th><th>Target/value</th><th>Why quorum matters</th></tr></thead><tbody><tr><td>Add/Remove Admin</td><td>Target account</td><td>Prevents a single Admin from capturing or removing control. Last Admin cannot be removed.</td></tr><tr><td>Add/Remove Validator</td><td>Target account</td><td>Protects reviewer set that gates Member proposals and reward eligibility.</td></tr><tr><td>Pause/Resume</td><td>Zero target/value</td><td>Controls normal governance and Community clock.</td></tr><tr><td>Archive</td><td>Zero target/value</td><td>Terminal action with its own eligibility checks.</td></tr><tr><td>Cancel withdrawal</td><td><code>value = request ID</code></td><td>Releases reserved execution balance through collective control.</td></tr></tbody></table>
      <h2>Request lifecycle</h2>
      <div class="state-track"><div><small>CREATE</small><strong>First approval</strong><span>Proposer is counted automatically. UI should state this clearly.</span></div><div><small>APPROVE</small><strong>Quorum grows</strong><span>Each eligible Admin approves only once.</span></div><div><small>EXECUTE</small><strong>Threshold met</strong><span>Any Admin executes final action.</span></div><div><small>EXPIRE</small><strong>Seven active days</strong><span>Open request expires after seven Community-clock days.</span></div></div>
      <div class="callout danger"><strong>No generic reject button is intentional.</strong> This is not a negative-vote queue. An action reaches quorum, expires, or is superseded by another valid action. A risky withdrawal is cancelled only through its own quorum-protected cancellation request.</div>
      <h2>Safe Admin handover</h2><p>First execute <strong>Add Admin</strong> for the replacement. Then execute <strong>Remove Admin</strong> for the departing account. This ordering preserves a valid control set and prevents unilateral ownership capture.</p>
      <h2>Withdrawal execution is separate</h2><p>An Admin calls <code>createWithdrawalRequest(to, amount, reason, metadataURI)</code>; that reserves execution capital and counts first approval. Other Admins call <code>approveWithdrawal(id)</code>. Once approvals satisfy Hub threshold, any Admin calls <code>executeWithdrawal(id)</code>. Cancellation is not direct: it goes through the Admin action queue.</p>
      <div class="code-sample"><div class="code-sample-header"><span>Viem / 2-of-N withdrawal</span><button type="button" class="code-copy-button" data-copy-code="v3-withdrawal" data-copy-label="Copy">Copy</button></div><pre><code id="v3-withdrawal">await walletClient.writeContract({
  address: treasuryAddress, abi: communityTreasuryAbi,
  functionName: "createWithdrawalRequest",
  args: [recipient, parseUnits("250", 6), "Audit payment", "ipfs://invoice"],
  account: firstAdmin,
});
await walletClient.writeContract({
  address: treasuryAddress, abi: communityTreasuryAbi,
  functionName: "approveWithdrawal", args: [requestId], account: secondAdmin,
});
await walletClient.writeContract({
  address: treasuryAddress, abi: communityTreasuryAbi,
  functionName: "executeWithdrawal", args: [requestId], account: secondAdmin,
});</code></pre></div>
      <h2>Client safeguards</h2><ul><li>Display <code>approvalCount / adminApprovalThreshold</code> on every action and withdrawal.</li><li>Enable execution only after a fresh read confirms quorum and non-terminal state.</li><li>Show reserved execution separately from <code>availableExecutionBalance()</code>.</li><li>Render post-action Admin set and warning before a removal/handover transaction.</li><li>Use Community-clock expiry, never a browser-only countdown, for action status.</li></ul>
    `,
  },
  {
    slug: "v3-events-indexing-errors",
    section: "BERT V3 / Contract reference",
    title: "Events, indexers and errors",
    summary: "V3 subgraph design, required event domains, error handling and Arc RPC resilience.",
    tags: ["v3", "events", "subgraph", "indexing", "errors", "observability"],
    content: `
      <p class="eyebrow">BERT V3 / Observability</p><h1>Index events.<br /><span>Verify with reads.</span></h1>
      <p class="lead">Direct reads are enough for a transaction, but explorer, search and notification surfaces need events. V3 indexing begins with Factory discovery, then creates Community-local Hub and Treasury sources after Factory activation.</p>
      <h2>Canonical indexing sequence</h2>
      <ol class="numbered-flow"><li><strong>Start at Factory deployment block.</strong> Do not query public RPC from genesis; history can be pruned.</li><li><strong>Handle <code>CommunityTreasuryCreated</code>.</strong> Store reservation metadata but keep Community inactive.</li><li><strong>Handle <code>CommunityCreated</code>.</strong> Persist canonical pair and start Hub/Treasury dynamic sources.</li><li><strong>Index Hub transitions.</strong> Members, proposals, validator decisions, votes, rounds and Admin actions are local entities.</li><li><strong>Index Treasury ledger.</strong> Stakes, bonds, settlement, claims and withdrawals provide the economic record.</li></ol>
      <h2>Event domains</h2>
      <table><thead><tr><th>Contract</th><th>Events to model</th><th>Entity data</th></tr></thead><tbody><tr><td>Factory</td><td><code>CommunityTreasuryCreated</code>, <code>CommunityCreated</code></td><td>ID, creator, canonical Hub/Treasury, configuration hash, metadata, activation state.</td></tr><tr><td>Hub</td><td>Membership, roles, status, proposals, validation, binary/slate votes, epochs, Admin actions</td><td>Member state, proposal state, deadlines, counts, outcomes, approval state.</td></tr><tr><td>Treasury</td><td>Stake/bond, escrow, settlement, refund, validator claim, withdrawal events</td><td>USDC amount, related ID, route, actor and terminal claim status.</td></tr></tbody></table>
      <h2>Prepared subgraph model</h2><p>The V3 subgraph models <code>Community</code>, <code>CommunityMember</code>, <code>CommunityProposal</code>, <code>CommunitySlateRound</code>, <code>CommunityBinaryVote</code>, <code>CommunitySlateVote</code>, <code>CommunityValidatorDecision</code>, <code>CommunityValidatorEpoch</code>, <code>CommunityValidatorRewardClaim</code>, <code>CommunityWithdrawal</code> and <code>CommunityAdminAction</code>. It is an indexed view. Before any security-critical write, simulate and read the latest contract state.</p>
      <div class="code-sample"><div class="code-sample-header"><span>GraphQL / Community runtime</span><button type="button" class="code-copy-button" data-copy-code="v3-query" data-copy-label="Copy">Copy</button></div><pre><code id="v3-query">query CommunityRuntime($hub: Bytes!) {
  community(id: $hub) {
    id communityId name hub treasury status
    members(where: { active: true }, first: 100) { account membershipStake proposalPoints }
    proposals(first: 100, orderBy: createdAt, orderDirection: desc) {
      proposalId origin mode status validationDeadline votingDeadline yesVotes noVotes settled
    }
  }
}</code></pre></div>
      <h2>Errors are product states</h2>
      <table><thead><tr><th>Family</th><th>Examples</th><th>Client response</th></tr></thead><tbody><tr><td>Lifecycle</td><td><code>CommunityNotActive</code>, <code>CommunityIsPaused</code>, <code>CommunityIsArchived</code></td><td>Refetch status and replace stale action with explanation.</td></tr><tr><td>Roles/membership</td><td><code>NotCommunityMember</code>, <code>AdminValidatorRoleConflict</code>, <code>ExitAlreadyRequested</code>, <code>MembershipExitBlocked</code></td><td>Read Member + role state and show the blocker.</td></tr><tr><td>Proposals/votes</td><td><code>InvalidProposalState</code>, <code>VotingNotOpen</code>, <code>VotingWindowClosed</code>, <code>BinaryVoteAlreadyCast</code></td><td>Refetch proposal and invalidate local cache.</td></tr><tr><td>Treasury</td><td><code>InsufficientExecutionBalance</code>, <code>RefundNotAvailable</code>, <code>ValidatorRewardAlreadyClaimed</code></td><td>Refresh accounting preview before retry.</td></tr><tr><td>Admin control</td><td><code>AdminActionExpired</code>, <code>AdminApprovalThresholdNotMet</code></td><td>Render approvals and Community-clock expiry; no bypass.</td></tr></tbody></table>
      <h2>Arc RPC resilience</h2><p>Arc Testnet RPC providers may not retain logs from block zero. Set every event client to a verified deployment start block, paginate ranges and use the V3 subgraph for search/discovery. A <em>pruned history unavailable</em> response is an index configuration issue, not evidence of absent events.</p>
      <div class="callout warning"><strong>Finality:</strong> persist block number and log index, make handlers idempotent and re-read canonical state after UI transactions. A wallet receipt is not the complete indexed truth.</div>
    `,
  },
];
