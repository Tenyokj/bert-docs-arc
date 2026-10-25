export const v3Docs = [
  {
    slug: "v3-overview",
    section: "BERT V3 / Contract reference",
    group: "Architecture & deployment",
    title: "V3.2 modular architecture",
    summary: "Factory, thin Hub, isolated modules and Treasury boundaries for reviewable onchain Communities.",
    tags: ["v3.2", "architecture", "factory", "hub", "modules", "treasury", "usdc"],
    content: `
      <p class="eyebrow">BERT V3.2 / Architecture</p><h1>One Community.<br /><span>Modular execution boundaries.</span></h1>
      <p class="lead">V3.2 is a deployment system for independent Communities, not one global DAO contract. A Factory records a canonical deployment, a thin Hub owns immutable policy and Community time, dedicated modules own membership/proposals/voting/milestones, and a paired Treasury owns USDC accounting. An integration should treat these as separate trust boundaries.</p>
      <div class="protocol-illustration"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><span class="orbit-node node-v2">V2 Rail</span><img src="assets/bert-logo.png" alt="BERT protocol logo" /><span class="orbit-node node-v3">V3 Community</span></div>
      <div class="contract-rail"><div><b>01</b><small>Discovery</small><strong>CommunityFactory</strong><span>Reserves configuration, deploys the paired Treasury/modules and registers the final Community pair.</span></div><div><b>02</b><small>Orchestration</small><strong>CommunityHub</strong><span>Owns immutable configuration, pause-aware Community time and quorum-protected Admin actions.</span></div><div><b>03</b><small>Runtime modules</small><strong>Membership, Proposal, Voting, Milestone</strong><span>Each capability is deployed separately rather than hidden inside a monolithic Hub.</span></div></div>
      <div class="callout warning"><strong>Current and historical deployments.</strong> Original immutable V3.1 Communities retain their original payout policy. The V3.2.1 release deployed on Arc Testnet on 25 October 2026 (Manager 2.0.1) excludes the execution recipient from reviews and adds fresh Admin quorum for every tranche; see <a href="#v3-tranche-authorizations">execution payment authorizations</a>. New Communities use the V3.2.1 Factory; older immutable instances are not upgraded.</div>
      <h2>Deployment topology</h2>
      <p>The Factory is the canonical registry. It is the upgradeable V3 infrastructure contract and is deployed behind a Transparent proxy. Every Hub, Treasury and runtime module set is deployed per Community. Their addresses are meaningful only after Factory activation. Resolve an active Community through <code>CommunityFactory.getCommunity(communityId)</code>, then resolve the module addresses from that Hub; do not trust a Hub, Treasury or module address supplied by an unverified frontend parameter.</p>
      <div class="state-track"><div><small>STEP 01</small><strong>Reserve</strong><span><code>createCommunity(config)</code> stores intended configuration and creates the paired Treasury.</span></div><div><small>STEP 02</small><strong>Deploy Hub</strong><span>The creator deploys a Hub with that exact configuration and reserved Treasury address; it deploys the runtime modules.</span></div><div><small>STEP 03</small><strong>Activate</strong><span><code>activateCommunity(id, hub)</code> verifies creator, config hash and Treasury linkage.</span></div><div><small>STEP 04</small><strong>Operate</strong><span>Index the canonical Hub, Treasury and module set only once the Factory reports it active.</span></div></div>
      <div class="callout info"><strong>Activation is a security boundary.</strong> A reserved Treasury is not an active Community. A deployed Hub is not necessarily canonical. Factory activation binds both only after verification.</div>
      <h2>What is local and what is shared</h2>
      <table><thead><tr><th>Domain</th><th>Scope</th><th>Integration implication</th></tr></thead><tbody><tr><td>Membership, proposals, votes, rounds</td><td>One Community's modules</td><td>IDs are local to a Community. Pair every proposal/round ID with its Hub address.</td></tr><tr><td>USDC escrow, execution, rewards, refunds</td><td>One Treasury</td><td>Never call raw ERC-20 balance the available balance. Read Treasury buckets and events.</td></tr><tr><td>Reviewed delivery</td><td>One Milestone Manager</td><td>Only sealed winner supporters review the 20 / 40 / 40 execution plan.</td></tr><tr><td>Discovery and activation</td><td>Factory</td><td>Use Factory events or V3 subgraph as canonical discovery source.</td></tr><tr><td>Human-verification policy</td><td>Protocol-wide policy</td><td>Testnet Demo PoP and future production World ID do not replace Community role checks.</td></tr></tbody></table>
      <h2>Integration invariants</h2>
      <ul><li><strong>Address pairing:</strong> Factory is source of truth for canonical Hub/Treasury/modules.</li><li><strong>Local accounting:</strong> one Community cannot use another Community's stake, execution balance, rewards or refund liabilities.</li><li><strong>Role separation:</strong> active Members cannot overlap with Admin or Validator roles.</li><li><strong>Pause-aware time:</strong> governance deadlines use <code>communityTime()</code>, not browser-only wall-clock time.</li><li><strong>Supporter review:</strong> unspent failed-plan capital is refundable only to winner supporters. V3.2 excludes the execution recipient from review weight/count while retaining its financial refund rights; original V3.1 retains the documented self-review gap.</li><li><strong>Terminal settlement:</strong> each proposal and slate round settles once. Consume terminal events instead of reconstructing outcomes from UI state.</li></ul>
      <h2>Read-first client pattern</h2>
      <p>For a transaction UI, resolve the Factory record, resolve the Hub module set, read the responsible module/Treasury state, then simulate the intended write from the connected account. The Hub is deliberately not a copy of every module getter: for example, proposal count belongs to the Proposal module. This avoids offering stale transactions after a proposal settles, a withdrawal is cancelled, an exit becomes pending or Community status changes.</p>
      <div class="code-sample"><div class="code-sample-header"><span>Viem / resolve canonical deployment</span><button type="button" class="code-copy-button" data-copy-code="v3-resolve" data-copy-label="Copy">Copy</button></div><pre><code id="v3-resolve">const deployment = await publicClient.readContract({
  address: factoryAddress,
  abi: communityFactoryAbi,
  functionName: "getCommunity",
  args: [communityId],
});

if (deployment.hub === zeroAddress || deployment.treasury === zeroAddress) {
  throw new Error("Community is reserved or not activated");
}

const [membershipModule, proposalModule, votingModule, milestoneManager] = await Promise.all([
  publicClient.readContract({ address: deployment.hub, abi: communityHubAbi, functionName: "membershipModule" }),
  publicClient.readContract({ address: deployment.hub, abi: communityHubAbi, functionName: "proposalModule" }),
  publicClient.readContract({ address: deployment.hub, abi: communityHubAbi, functionName: "votingModule" }),
  publicClient.readContract({ address: deployment.hub, abi: communityHubAbi, functionName: "milestoneManager" }),
]);

const [member, proposalCount, status, available] = await Promise.all([
  publicClient.readContract({ address: membershipModule, abi: membershipAbi, functionName: "getMember", args: [account] }),
  publicClient.readContract({ address: proposalModule, abi: proposalAbi, functionName: "proposalCount" }),
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
      <h2>Factory identity across releases</h2><p>The current Factory does not expose setters for module-deployer references. V3.2 uses a fresh matching infrastructure bundle for the new Manager instead of combining a new Hub artifact with old module deployers. Keep old Communities accessible. Identity is <code>(chainId, factoryAddress, communityId)</code>; two Factories can each have Community #1. Frontend links bind the Factory address, and numeric Arc bookmarks remain pinned to the original modular V3.1 Factory.</p>
      <h2>Factory API</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Caller</th><th>Result</th><th>Critical condition</th></tr></thead><tbody><tr><td>createCommunity(config)</td><td>Creator</td><td>Allocates an ID and records the paired Treasury reservation.</td><td>Config establishes the intended roles, economics and timing.</td></tr><tr><td>activateCommunity(id, hub)</td><td>Original creator</td><td>Registers canonical Hub/Treasury pair.</td><td>Hub must match reserved creator, configuration hash and Treasury linkage.</td></tr><tr><td>getCommunity(id)</td><td>Anyone</td><td>Creator, Hub, Treasury and creation time.</td><td>Use this as address discovery source.</td></tr><tr><td>getCreatorCommunityIds(creator)</td><td>Anyone</td><td>IDs created by address.</td><td>Creator history is not a substitute for active-pair validation.</td></tr><tr><td>isActiveCommunityTreasury(treasury)</td><td>Anyone</td><td>Whether Treasury is attached to an active Factory record.</td><td>Useful defensive check for integrations.</td></tr></tbody></table>
      <h2>CommunityConfig is immutable policy</h2>
      <p><code>CommunityTypes.CommunityConfig</code> is not presentation metadata. It becomes the policy of an isolated Community. A creation UI should convert USDC to native token units, validate unique role addresses, show the full policy before signing and treat timing values according to the target environment.</p>
      <table><thead><tr><th>Area</th><th>Fields</th><th>Developer concern</th></tr></thead><tbody><tr><td>Identity/routing</td><td><code>name</code>, <code>metadataURI</code>, <code>usdc</code>, <code>globalBertReserve</code></td><td>Metadata and asset route; show both addresses clearly.</td></tr><tr><td>Initial roles</td><td><code>initialAdmins</code>, <code>initialValidators</code></td><td>Role overlap is invalid; initial security surface begins here.</td></tr><tr><td>Member economics</td><td><code>entryStakeUSDC</code>, <code>proposalBondUSDC</code>, <code>voteMinStakeUSDC</code></td><td>Explains allowances and capital required for each action.</td></tr><tr><td>Thresholds/fees</td><td><code>validatorApprovalThreshold</code>, <code>adminApprovalThreshold</code>, <code>binaryRejectionFeeBps</code>, <code>validatorRewardShareBps</code></td><td>Controls validation, critical actions, NO refunds and Member-review rewards.</td></tr><tr><td>Community clock</td><td><code>membershipExitCooldown</code>, <code>validationWindow</code>, <code>binaryVotingDuration</code>, <code>roundVotingDuration</code>, <code>validatorRewardEpoch</code></td><td>Must be rendered from chain config and measured with pause-aware time.</td></tr><tr><td>Execution plan</td><td><code>executionRecipient</code>, <code>milestoneReviewDuration</code>, <code>milestoneProofDuration</code></td><td>Treasury keeps custody; only approved winner tranches route to immutable Administration execution wallet. Review duration is 1-14 days.</td></tr><tr><td>Validator activity</td><td><code>validatorActiveThresholdBps</code>, <code>validatorProposalPointsThreshold</code></td><td>Sets eligibility for an epoch reward share.</td></tr></tbody></table>
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
  executionRecipient: administrationSafe,
  milestoneReviewDuration: 14n * 24n * 60n * 60n,
  milestoneProofDuration: 7n * 24n * 60n * 60n,
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
      <p class="lead">The Hub stores immutable Community policy, pause-aware time and module routing. The Membership module owns active Members, Admins, Validators and exit blockers; Proposal/Voting modules own proposal and round state. A client must read the responsible module before it decides what an account can do.</p>
      <div class="three-up"><article class="doc-card static-card"><span class="mini-icon">MEM</span><h3>Member</h3><p>Joins with configured USDC stake. While active, can create Member proposals and vote.</p></article><article class="doc-card static-card"><span class="mini-icon">VAL</span><h3>Validator</h3><p>Reviews Member proposals. Eligible validated work can earn epoch rewards.</p></article><article class="doc-card static-card"><span class="mini-icon">ADM</span><h3>Admin</h3><p>Creates Admin proposals and controls protected Community actions through local quorum.</p></article></div>
      <div class="callout warning"><strong>Role exclusivity is onchain.</strong> An active Member cannot be an Admin or Validator. A role holder cannot join as an active Member. Build role change UI as an explicit transition, never a composable set of badges.</div>
      <h2>Read API</h2>
      <table class="api-matrix"><thead><tr><th>Function</th><th>Returns</th><th>Client use</th></tr></thead><tbody><tr><td>membershipModule(), proposalModule(), votingModule(), milestoneManager()</td><td>Responsible runtime module addresses</td><td>Resolve these first; cache only with Community/factory invalidation.</td></tr><tr><td>communityTreasury()</td><td>Paired Treasury</td><td>Cross-check with Factory before allowances or accounting reads.</td></tr><tr><td>communityTime()</td><td>Pause-adjusted timestamp</td><td>Calculate validation, voting, expiry and exit availability.</td></tr><tr><td>Membership.getMember(account)</td><td>Active, join/exit time, stake, proposal points</td><td>Gate join/propose/vote/exit actions.</td></tr><tr><td>Membership.isAdmin(account) / isValidator(account)</td><td>Boolean</td><td>Direct module reads. Hub compatibility wrappers are named isAdminAccount / isValidatorAccount.</td></tr></tbody></table>
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
      <p>Admins create a same-origin round using <code>createAdminSlateRound(ids)</code> or <code>createMemberSlateRound(ids)</code>. Each Member selects a single proposal using <code>castSlateRoundVote(roundId, proposalId, amount)</code>. Full round escrow settles to execution plus optional Member-validation rewards. With non-zero winning support, the execution budget is immediately reserved for the winner's 20/40/40 plan. Slate has no NO side or ordinary losing-vote refund; a failed execution plan instead provides pro-rata pull refunds to eligible winning supporters.</p>
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
      <h2>Milestone custody is separate from free execution</h2><p>On a funded winner's settlement, Treasury removes the plan budget from <code>executionBalance</code> into <code>milestoneReserveByPlan</code>. In V3.2, settlement opens the initial 20% authorization without transferring it; both later 40% stages first require supporter proof approval. Every payment needs fresh Admin quorum within seven active Community days. None of the reserved budget is available through the ordinary withdrawal queue. Terminal failure moves only the unreleased balance into failed-plan refund custody for eligible winning supporters. Already released tranches are not clawed back.</p>
      <h2>Accounting surface</h2>
      <table><thead><tr><th>Bucket</th><th>Source</th><th>Recipient</th><th>Read/claim route</th></tr></thead><tbody><tr><td>Membership stake</td><td>Join</td><td>That Member after valid exit</td><td>Hub member state; released by <code>finalizeMembershipExit</code>.</td></tr><tr><td>Proposal bond</td><td>Member proposal</td><td>Author or global reserve</td><td><code>getProposalBond(id)</code>; return after fair vote or slash after validator rejection.</td></tr><tr><td>Vote escrow</td><td>Binary/Slate votes</td><td>Execution, reserve, rewards or NO voters</td><td>Hub state plus settlement events.</td></tr><tr><td>Execution balance</td><td>Winning settlement</td><td>Approved withdrawal recipient</td><td><code>availableExecutionBalance()</code> and withdrawal requests.</td></tr><tr><td>Validator rewards</td><td>Member settlement share</td><td>Active Validators</td><td><code>claimValidatorReward(epochId)</code> after finalized epoch.</td></tr><tr><td>Refund liability</td><td>NO/tie Binary settlement</td><td>Each NO voter</td><td><code>getRefundPreview</code>, then <code>claimNoVoteRefund</code>.</td></tr></tbody></table>
      <h2>Settlement map</h2>
      <div class="contract-rail"><div><b>YES</b><small>Binary accepted</small><strong>20/40/40 plan + optional reward</strong><span>YES stake less applicable Member-validation rewards funds the protected execution plan. NO stake routes to global reserve.</span></div><div><b>NO</b><small>Binary rejected/tied</small><strong>Reserve + refund liability</strong><span>YES stake and NO fee route to reserve. Remaining NO stake becomes individually claimable.</span></div><div><b>SLT</b><small>Slate settled</small><strong>Winner plan + optional reward</strong><span>The full round funds the winner, less applicable rewards. Failed-plan refunds belong to eligible winning supporters, not all slate voters.</span></div></div>
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
    slug: "v3-execution-milestones",
    section: "BERT V3.2 / Contract reference",
    group: "Treasury & control",
    title: "Execution milestones and supporter refunds",
    summary: "All four lanes share protected 20/40/40 plans, snapshot-weighted review and failed-plan refunds.",
    tags: ["v3.2", "milestones", "snapshot", "refunds", "execution"],
    content: `
      <p class="eyebrow">V3.2 / CommunityMilestoneManager</p><h1>Support the winner.<br /><span>Review its delivery.</span></h1>
      <p class="lead">Admin Binary, Member Binary, Admin Slate and Member Slate use the same execution-plan machinery. The Administration execution recipient, not the proposal author, receives the initial 20% and the approved 40% / 40% releases, each after fresh Admin quorum in V3.2. The plan ID equals its winning proposal ID and is local to that Community.</p>
      <h2>Who can review</h2><p>Only supporters sealed in CommunityWinnerSnapshot may vote: YES supporters for a Binary winner, or voters for the winning Slate proposal. NO voters and voters for losing candidates cannot review. Authors cannot vote for their own proposal. A reviewer votes once per proof attempt. Membership changes do not rewrite sealed weights.</p>
      <div class="callout warning"><strong>Current V3.2 versus historical V3.1.</strong> Original V3.1 Managers allow a distinct Member execution recipient to support and review its own execution. The deployed V3.2 Manager 2.0.1 rejects recipient reviews and excludes its weight/count from review thresholds, while preserving its original financial refund share. This policy applies to new V3.2 Communities and does not alter existing immutable V3.1 instances. Use a non-participating execution wallet for legacy pilots. See the <a href="https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/V3.1-SELF-REVIEW-FIX.md" target="_blank" rel="noreferrer">patch record</a> for review, refund and rollout boundaries.</div>
      <table><thead><tr><th>Rule</th><th>V3.2 requirement</th></tr></thead><tbody><tr><td>Participation</td><td>At least 40% of eligible snapshot support weight.</td></tr><tr><td>Approval</td><td>At least 6,667 bps (66.67%) of participating weight, slightly above V2.3's exact two-thirds.</td></tr><tr><td>Approving wallets</td><td>At least max(3, ceil(3% of eligible snapshot supporters)). A cohort smaller than three cannot approve.</td></tr><tr><td>Review deadline</td><td>Immutable Community configuration, 1-14 days; passing early does not close review early.</td></tr><tr><td>No quorum</td><td>One two-day grace window. Silence never releases funds.</td></tr><tr><td>Rejected proof</td><td>One correction after a 48-hour cooldown; a second rejection fails the plan.</td></tr><tr><td>Expired proof deadline / terminal failure</td><td>Unreleased plan capital becomes pro-rata claimable by eligible winning supporters, not free Administration balance.</td></tr></tbody></table>
      <h2>Wallet routes through CommunityHub</h2><p>The execution recipient calls <code>submitMilestoneProof(planId, evidenceHash)</code> and, when permitted, <code>reopenAfterCorrection(planId)</code>. Eligible snapshot supporters call <code>castMilestoneReview(planId, approved)</code>. Deadline finalization uses <code>finalizeMilestoneReview(planId)</code> or <code>failExpiredPlan(planId)</code>. Each eligible supporter pulls their own terminal refund with <code>claimFailedPlanRefund(planId)</code>. Read <code>getPlan</code> and <code>getReview</code> on the Milestone Manager; write calls to modules are Hub-restricted.</p>
      <div class="callout warning"><strong>No instant recovery of released capital.</strong> A failure returns the unpaid portion only. If failure occurs after the first 40% milestone, only the remaining 40% is refundable, not the original 80%. Review duties can keep membership exit locked until resolved; use the actual lock/read state.</div>
    `,
  },
  {
    slug: "v3-tranche-authorizations",
    section: "BERT V3.2 / Contract reference",
    group: "Treasury & control",
    title: "V3.2 Admin quorum for execution payments",
    summary: "Deployed V3.2.1 / Manager 2.0.1: fixed 20/40/40 payments, current Admin approvals, active-time expiry and refunds.",
    tags: ["v3", "quorum", "tranches", "refunds", "testnet"],
    content: `
      <p class="eyebrow">Arc Testnet / Deployed 25 October 2026</p><h1>Review is approval.<br /><span>Payment needs Admin quorum.</span></h1>
      <div class="callout warning"><strong>Deployment boundary.</strong> Manager 2.0.1 is deployed through the new V3.2.1 Factory <code>0x23E023E0D8B3436319BC6e5e72615Bc7A0c6234E</code> from block <code>69044184</code>. Original immutable V3.1 Managers retain automatic transfers and their existing behavior. New source, ABI or frontend code does not upgrade them. Factory module-deployer references determine the modules used by a new Community.</div>
      <p class="lead">In the quorum-enabled flow, settlement reserves the execution budget and opens initial 20% payment authorization. Each passed supporter proof opens the corresponding 40% authorization. Every transfer separately requires the Community's existing Admin quorum. Recipient and amount are fixed; capital never becomes freely withdrawable execution balance.</p>
      <h2>Version scopes</h2><p>Community Layer V3.2.1 is the current patch release; V2 remains V2.3 because only its comments and documentation changed. Manager 2.0.1 and Hub 2.1.0 are independent contract versions. Whitepaper 1.3.2 is a document revision. None of these labels updates an existing immutable Community.</p><h2>One fixed window per stage</h2><p>Both approvals and actual payment must finish within seven days of active Community time from tranche readiness. Pause freezes the clock. A fresh request cannot restart the deadline. Next proof timing starts only after actual payment; final proof approval is not completion until the last tranche is transferred.</p>
      <h2>V3.2.1 correction liveness fix</h2><p>At the first proof rejection, Manager 2.0.1 fixes the correction deadline at rejection Community time + 48-hour cooldown + configured proof duration. Reopening cannot extend it. Anyone may expire an overdue correction cooldown or proof window through the Hub. Failure refunds only unpaid execution capital. Historical V3.2.0 Managers retain the earlier correction-deadline defect; a frontend update cannot patch them. The new bundle and graph are deployed, while a new public pilot remains a separate verification task.</p>
      <h2>Current Admins, current approvals</h2><p>Each stage needs explicit approvals. Removal and reappointment invalidate the old role-incarnation nonce. Anyone can relay payment with a sorted unique witness containing exactly the threshold number of current approving Admins; the caller cannot redirect funds. Historical indexer approvals are not sufficient proof of current quorum.</p>
      <table><thead><tr><th>Already paid</th><th>After an unpaid tranche expires</th></tr></thead><tbody><tr><td>Nothing</td><td>100% execution budget becomes refundable.</td></tr><tr><td>20%</td><td>80% remains refundable.</td></tr><tr><td>60%</td><td>The remaining approximately 40% becomes refundable.</td></tr></tbody></table>
      <p>Anyone may expire an unpaid authorization at its deadline, even if enough approvals were collected but payment never occurred. Refunds use original financial supporter weights. Validator rewards are reserved separately before execution-budget formation and are not consumed. Already paid tranches are not clawed back.</p>
      <h2>Hub write API</h2><p><code>approveExecutionTranche(planId)</code> is Admin-only. <code>executeExecutionTranche(planId, sortedApprovingAdmins)</code> and <code>expireExecutionTranche(planId)</code> may be relayed by anyone while Community lifecycle rules permit. Manager views expose fixed terms, recorded approvers and current-role approval validity.</p>
      <p>Self-review protection remains: the recipient cannot approve or reject its own proof and is excluded from review thresholds, but keeps any financial refund rights. Distinct events represent tranche readiness, Admin approval, actual payment and expiry; do not count a passed proof as released USDC.</p>
      <p>Full source specification and rollout checklist: <a href="https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/V3.2-TRANCHE-QUORUM.md" target="_blank" rel="noreferrer">Admin tranche quorum</a>. This extra quorum adds an Administration veto/liveness dependency; it is not a substitute for supporter review or an independent audit.</p>
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
      <p>For deployed V3.2, the manifest generator retains original modular V3.1 Factory <code>0xe16Cd61a21feA97393e6eEE3A7F7A26828021dD0</code> from block <code>66809847</code> and adds each configured new Factory with its actual deployment block. Entity IDs include Factory address. The new schema tracks tranche readiness, approvals, payment and expiry; old approval events must not be treated as currently valid Admin quorum.</p>
      <p class="lead">Direct reads are enough for a transaction, but explorer, search and notification surfaces need events. V3 indexing begins with Factory discovery, then creates Community-local Hub and Treasury sources after Factory activation.</p>
      <h2>Canonical indexing sequence</h2>
      <ol class="numbered-flow"><li><strong>Start at Factory deployment block.</strong> Do not query public RPC from genesis; history can be pruned.</li><li><strong>Handle <code>CommunityTreasuryCreated</code>.</strong> Store reservation metadata but keep Community inactive.</li><li><strong>Handle <code>CommunityCreated</code>.</strong> Persist canonical pair and start Hub/Treasury dynamic sources.</li><li><strong>Index Hub transitions.</strong> Hub events track lifecycle and Admin actions; separate Membership, Proposal, Voting, Milestone and Snapshot templates track their own module emissions.</li><li><strong>Index Treasury ledger.</strong> Stakes, bonds, settlement, claims and withdrawals provide the economic record.</li></ol>
      <h2>Event domains</h2>
      <table><thead><tr><th>Contract</th><th>Events to model</th><th>Entity data</th></tr></thead><tbody><tr><td>Factory</td><td><code>CommunityTreasuryCreated</code>, <code>CommunityCreated</code></td><td>ID, creator, canonical Hub/Treasury, configuration hash, metadata, activation state.</td></tr><tr><td>Hub and runtime modules</td><td>Hub lifecycle/Admin actions; module-local membership, proposal, vote, milestone and snapshot events</td><td>Member state, proposal state, deadlines, counts, outcomes, approval state.</td></tr><tr><td>Treasury</td><td>Stake/bond, escrow, settlement, refund, validator claim, withdrawal events</td><td>USDC amount, related ID, route, actor and terminal claim status.</td></tr></tbody></table>
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
