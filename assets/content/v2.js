export const v2Docs = [
  {
    slug: "v2-overview",
    section: "BERT V2.3 / Contract reference",
    group: "Core mechanics",
    title: "V2.3 global funding architecture",
    summary: "The BERT V2.3 global funding layer: refundable pledges, viable-winner selection, and backer-governed milestone escrow.",
    tags: ["v2", "v2.3", "pledges", "grants", "backers", "milestones", "usdc"],
    content: `
      <p class="eyebrow">BERT V2.3 / Global Funding Layer</p><h1>Fund a specific idea.<br /><span>Keep execution accountable.</span></h1>
      <p class="lead">BERT V2.3 is a global, stablecoin-native funding primitive. A pledge is an escrowed commitment to one proposal, not a donation to an unspecified pool winner. A single viable proposal wins a round; losing pledges remain pull-refundable. The winning pledge cohort then governs the release of its own escrow through two evidence-based milestones.</p>
      <div class="callout info"><strong>Release boundary.</strong> V2.3 is active on Arc Testnet. Rules described here apply to V2.3 rounds started after activation. V2 and V3 are separate layers: V2 coordinates global proposal funding; V3 operates isolated Community governance and local treasuries.</div>
      <div class="callout info"><strong>Why the contract still exposes 30%.</strong> GrantManager supports two executable round policies. <code>isBackerMilestoneRound(roundId)</code> selects V2.3 backer-reviewed <strong>20/40/40</strong> or legacy reviewer-approved <strong>30/40/30</strong>. The choice is snapshotted when that round starts; changing the global activation flag does not rewrite an existing round. Legacy constants preserve behavior and public getters, not storage slots. New backer-mode grants cannot use the legacy reviewer payout path.</div>
      <div class="callout warning"><strong>Do not treat testnet as production.</strong> Arc Testnet uses Demo verification to exercise the real onchain access gate. It is not proof of personhood or Sybil resistance. Production participation requires a separately deployed and reviewed World ID policy.</div>
      <h2>Lifecycle at a glance</h2>
      <ol class="numbered-flow"><li><strong>Submit.</strong> An author locks the anti-spam bond, declares a minimum net funding target, then commits an immutable two-stage milestone plan while the proposal is pending.</li><li><strong>Select.</strong> When 30 eligible pending V2.3 proposals exist, <code>startFundingRound</code> selects them in strict queue order and opens a 14-day round.</li><li><strong>Pledge.</strong> Each verified wallet may escrow one USDC pledge for one idea. The author cannot pledge to their own idea.</li><li><strong>Settle.</strong> The highest-supported viable idea wins; every other pledge is individually refundable.</li><li><strong>Execute.</strong> The author receives 20% after a timely claim. Winning backers decide two 40% releases from the remaining escrow.</li></ol>
      <h2>Module ownership</h2>
      <table><thead><tr><th>Module</th><th>Canonical responsibility</th><th>Wallet-facing surface</th></tr></thead><tbody><tr><td><code>IdeaRegistryUpgradeable</code></td><td>Idea metadata, author bond, status, funding target and immutable milestone plan commitment.</td><td><code>createFundingProposal</code>, <code>commitFundingMilestonePlan</code>.</td></tr><tr><td><code>VotingSystemUpgradeable</code></td><td>Sequential round selection, pledge admission, viable winner selection and lazy progression claims.</td><td><code>startFundingRound</code>, <code>vote</code>, <code>endVotingRound</code>, <code>claimWinningParticipation</code>.</td></tr><tr><td><code>FundingPoolUpgradeable</code></td><td>USDC escrow, per-round pledge accounting, pull refunds and protocol reserve accounting.</td><td><code>claimPledgeRefund</code> plus read methods.</td></tr><tr><td><code>GrantManagerUpgradeable</code></td><td>Grant claim, backer proof voting, progressive fee vesting, cancellation and unspent-escrow refunds.</td><td><code>claimGrant</code>, proof, vote and finalization methods.</td></tr><tr><td><code>PoPVerifierUpgradeable</code></td><td>Verification attestations consumed by protected V2 actions.</td><td>Verification is initiated through the application/backend flow, not a direct V2 write.</td></tr></tbody></table>
      <h2>Live Arc Testnet policy</h2>
      <table><thead><tr><th>Parameter</th><th>Current value</th><th>Meaning</th></tr></thead><tbody><tr><td>Ideas per round</td><td>30</td><td>Sequential pending V2.3 ideas; the current queue begins at idea <code>#5</code>.</td></tr><tr><td>Voting window</td><td>14 days</td><td>Full pledge window; a round cannot settle early.</td></tr><tr><td>Author bond / pledge minimum</td><td>50 USDC / 10 USDC</td><td>Bond is anti-spam collateral; a pledge is idea-specific funding intent.</td></tr><tr><td>Round fee</td><td>5% (500 bps)</td><td>Snapshotted at round start and vested progressively with releases.</td></tr><tr><td>Winner eligibility</td><td>Target + 3 backers</td><td>Post-fee net funding must meet the author target and the winning cohort needs at least three distinct backers.</td></tr><tr><td>Grant schedule</td><td>20 / 40 / 40</td><td>Initial author claim, in-process milestone and completion milestone.</td></tr></tbody></table>
      <h2>Read the exact mechanics</h2><div class="doc-cards two-up compact"><a class="doc-card" data-doc-link href="#v2-conditional-pledges"><span class="mini-icon">01</span><h3>Pledges and settlement</h3><p>Targets, viability, fees and refund paths.</p></a><a class="doc-card" data-doc-link href="#v2-idea-lifecycle"><span class="mini-icon">02</span><h3>Proposal intake</h3><p>Bond, immutable plan and the forward-only state machine.</p></a><a class="doc-card" data-doc-link href="#v2-voting-rounds"><span class="mini-icon">03</span><h3>Funding rounds</h3><p>Queue selection, 14-day voting and lazy progression.</p></a><a class="doc-card" data-doc-link href="#v2-grant-milestones"><span class="mini-icon">04</span><h3>Backer milestones</h3><p>20/40/40 escrow, quorum and approval.</p></a></div>
    `,
  },
  {
    slug: "v2-conditional-pledges",
    section: "BERT V2.3 / Contract reference",
    group: "Core mechanics",
    title: "Conditional pledges, viability and refunds",
    summary: "Why a V2 pledge stays attached to its selected proposal, how a winner becomes viable, and when every refund route opens.",
    tags: ["v2", "v2.3", "conditional-pledges", "refunds", "minimum-funding", "fees"],
    content: `
      <p class="eyebrow">V2.3 / Pledge economics</p><h1>Fund intent,<br /><span>not an unintended winner.</span></h1>
      <p class="lead">The ABI still calls the action <code>vote</code>, but its economic meaning is a conditional USDC pledge. FundingPool records the pledge by <code>roundId</code>, <code>ideaId</code> and wallet. That record cannot become capital for a different idea merely because another proposal wins.</p>
      <h2>Inputs are deliberately separate</h2><table><thead><tr><th>Input</th><th>Provided by</th><th>Purpose</th><th>Not used as</th></tr></thead><tbody><tr><td><code>authorBond</code></td><td>Author</td><td>Anti-spam collateral locked on submission.</td><td>A pledge, vote or grant target.</td></tr><tr><td><code>minimumNetFunding</code></td><td>Author</td><td>Minimum amount the author must receive after the round fee.</td><td>A funding cap or promise of selection.</td></tr><tr><td>Pledge amount</td><td>Backer</td><td>Escrowed support for exactly one round idea.</td><td>A general pool deposit or a pledge to every idea.</td></tr></tbody></table>
      <h2>Viability and winner selection</h2><p>At settlement, the protocol ranks round ideas by gross pledge total. It evaluates them in order and selects the first one satisfying both conditions: its post-fee net amount reaches <code>minimumNetFunding</code>, and it has at least three distinct winning backers. A higher-ranked proposal that fails either condition is skipped rather than receiving an underfunded grant.</p>
      <div class="formula-box"><code>net grant = gross winning pledges - (gross winning pledges x snapshotted fee / 10,000)</code></div>
      <h2>Settlement matrix</h2><table><thead><tr><th>Outcome</th><th>Winning pledges</th><th>Losing pledges</th><th>Fee</th></tr></thead><tbody><tr><td>Viable winner claims on time</td><td>Remain in staged grant escrow.</td><td>Individually pull-refundable.</td><td>Vests only as 20/40/40 tranches release.</td></tr><tr><td>No viable idea</td><td>Fully refundable.</td><td>Fully refundable.</td><td>No round fee is vested.</td></tr><tr><td>Winner misses claim deadline</td><td>Fully refundable after permissionless expiry.</td><td>Individually refundable.</td><td>Unvested fee is not retained.</td></tr><tr><td>Grant stops before completion</td><td>Unreleased gross escrow becomes pro-rata refundable to the whole winning cohort.</td><td>Already refundable.</td><td>Only fee corresponding to paid tranches remains in reserve.</td></tr></tbody></table>
      <div class="callout warning"><strong>Refunds are pull-based.</strong> The protocol never loops over an unlimited backer list. The eligible wallet calls <code>claimPledgeRefund(roundId)</code>; the claim is recorded before the transfer. Interfaces should derive eligibility from direct contract reads, not only indexer data.</div>
      <h2>Worked example</h2><p>Idea A receives 100,000 USDC from three or more backers and has a 90,000 USDC net target. With a 5% snapshotted fee, it is viable at 95,000 USDC. If it wins and claims, the author receives 19,000 USDC and the reserve receives 1,000 USDC. The remaining 80,000 USDC gross escrow funds the two 40% stages. If execution stops before a milestone, the unreleased amount returns pro rata to all winning backers.</p>
    `,
  },
  {
    slug: "v2-idea-lifecycle",
    section: "BERT V2.3 / Contract reference",
    group: "Core mechanics",
    title: "Proposal intake and IdeaRegistry",
    summary: "The V2.3 proposal preflight: bond, target, immutable milestone plan and state transitions.",
    tags: ["v2", "v2.3", "ideas", "milestone-plan", "state-machine", "bond"],
    content: `
      <p class="eyebrow">V2.3 / IdeaRegistry</p><h1>Commit the delivery plan<br /><span>before funding starts.</span></h1>
      <p class="lead">IdeaRegistryUpgradeable owns proposal metadata, author identity, lifecycle status, author bond, funding target and V2.3 plan commitment. It is the canonical state source; the frontend and subgraph are read layers, not authorization layers.</p>
      <h2>V2.3 author flow</h2><ol class="numbered-flow"><li>Complete the active verification requirement and approve FundingPool to pull the author bond.</li><li>Call <code>createFundingProposal(title, description, link, authorBond, minimumNetFunding)</code>.</li><li>While the new idea is still <code>Pending</code>, call <code>commitFundingMilestonePlan(ideaId, planURI, planHash)</code>.</li><li>The immutable plan package must define both milestones, acceptance criteria, expected evidence and the fixed 20/40/40 schedule.</li><li>Only then can the proposal enter a V2.3 funding round when it reaches the sequential queue position.</li></ol>
      <h2>Why the plan commitment is separate</h2><p>The plan can point to an IPFS CID or another durable evidence package with many links, repositories, deployment addresses and acceptance criteria. The contract stores one URI and its content hash rather than personal data or an unbounded document. Once committed, the plan cannot be silently replaced after backers have pledged.</p>
      <table><thead><tr><th>Read / write</th><th>Who calls it</th><th>Integration rule</th></tr></thead><tbody><tr><td><code>createFundingProposal</code></td><td>Eligible author</td><td>Requires a non-zero target and the configured bond.</td></tr><tr><td><code>commitFundingMilestonePlan</code></td><td>Idea author</td><td>Allowed only while pending; show URI and hash before round inclusion.</td></tr><tr><td><code>hasFundingMilestonePlan</code></td><td>Anyone</td><td>Use to render V2.3 round readiness.</td></tr><tr><td><code>fundingMilestonePlanURIByIdea</code>, <code>fundingMilestonePlanHashByIdea</code></td><td>Anyone</td><td>Read-only proof of the exact committed plan.</td></tr><tr><td><code>markLowQuality</code>, <code>addReview</code></td><td>Authorized roles</td><td>Quality signals do not replace backer selection and do not make a pledge refundable early.</td></tr></tbody></table>
      <h2>State progression</h2><div class="flow-diagram"><div><small>INTAKE</small><strong>Pending</strong><span>Bond, target and plan committed.</span></div><b>-&gt;</b><div><small>ROUND</small><strong>Voting</strong><span>Eligible for a 14-day pledge round.</span></div><b>-&gt;</b><div><small>RESULT</small><strong>WonVoting or Rejected</strong><span>Only a viable winner continues.</span></div><b>-&gt;</b><div><small>EXECUTION</small><strong>Funded -&gt; InProcess -&gt; Completed</strong><span>20/40/40 releases.</span></div></div>
      <div class="callout danger"><strong>Legacy boundary on Arc Testnet.</strong> Ideas <code>#1</code> through <code>#4</code> were retired during the V2.3 migration and are <code>Cancelled</code>. They cannot enter a new round. The first eligible V2.3 proposal is <code>#5</code>; the next round needs 30 newly eligible V2.3 proposals.</div>
    `,
  },
  {
    slug: "v2-voting-rounds",
    section: "BERT V2.3 / Contract reference",
    group: "Core mechanics",
    title: "Funding rounds and settlement",
    summary: "Sequential V2.3 round selection, the 14-day pledge window, viable-winner settlement and lazy progression claims.",
    tags: ["v2", "v2.3", "rounds", "voting", "pledges", "settlement", "progression"],
    content: `
      <p class="eyebrow">V2.3 / VotingSystem</p><h1>One round, one priority.<br /><span>No forced capital rerouting.</span></h1>
      <p class="lead">VotingSystemUpgradeable starts a round from the next sequential pending proposals and settles it after its full 14-day window. It keeps a single-pledge-per-wallet rule, prohibits an author from pledging to their own proposal, and selects one viable winner or no winner.</p>
      <h2>Starting a V2.3 round</h2><p><code>startFundingRound()</code> does not accept arbitrary idea IDs. It selects the next 30 sequential, pending V2.3 proposals after the queue cursor. Every selected proposal must already have its immutable milestone plan. This prevents manual cherry-picking and prevents an author from adding execution terms after selection.</p>
      <table><thead><tr><th>Round invariant</th><th>Onchain consequence</th></tr></thead><tbody><tr><td>30 eligible ideas are required</td><td>Round start reverts until the next sequential queue slice is complete.</td></tr><tr><td>All selected ideas have plans</td><td>An unplanned proposal cannot be included in a V2.3 round.</td></tr><tr><td>One wallet pledges once</td><td>The wallet cannot switch to another idea in the same round after pledging.</td></tr><tr><td>Author cannot support own idea</td><td>Self-pledge is rejected onchain.</td></tr><tr><td>Round runs for 14 days</td><td>Settlement is permissionless only after the contract deadline.</td></tr></tbody></table>
      <h2>Bounded settlement, unbounded participation</h2><p>V2.2 limited an idea to 30 voters because settlement iterated through voters to issue progression credit. V2.3 removes that loop. <code>endVotingRound</code> has work bounded by the fixed 30 ideas, while a winning backer later calls <code>claimWinningParticipation(roundId)</code> for their own non-financial progression credit. This claim cannot change settlement, grant eligibility or pledge accounting.</p>
      <h2>Client preflight for a pledge</h2><ol class="numbered-flow"><li>Read the active round and confirm the selected idea is included and still live.</li><li>Read <code>hasVoted(roundId, account)</code> and the idea author; reject repeat and self-pledge attempts before opening a wallet.</li><li>Read verification state and current USDC allowance for FundingPool.</li><li>Simulate <code>vote(roundId, ideaId, amount)</code>, submit it, await the receipt and refresh direct state.</li><li>After settlement, render a refund, author claim or participation claim only from live state.</li></ol>
      <div class="callout info"><strong>Indexer rule.</strong> Use the V2.3 subgraph for discovery, cohort pagination and history. Before a state-sensitive write, re-read the contract: indexers are asynchronous and never grant authorization.</div>
    `,
  },
  {
    slug: "v2-capital-accounting",
    section: "BERT V2.3 / Contract reference",
    group: "Capital & grants",
    title: "FundingPool accounting",
    summary: "How FundingPool separates pledge escrow, unvested fees, protocol reserve, author bonds and pull-refund liabilities.",
    tags: ["v2", "v2.3", "funding-pool", "accounting", "reserve", "fees"],
    content: `
      <p class="eyebrow">V2.3 / FundingPool</p><h1>Every USDC bucket<br /><span>has a defined owner and route.</span></h1>
      <p class="lead">FundingPoolUpgradeable is the accounting boundary for V2. It does not decide which idea wins or whether a proof is good; it records escrow and moves USDC only when an authorized lifecycle transition has occurred.</p>
      <table><thead><tr><th>Bucket</th><th>Source</th><th>Permitted route</th></tr></thead><tbody><tr><td>Author bond</td><td>Proposal author</td><td>Anti-spam collateral managed by the idea lifecycle; it is not grant escrow.</td></tr><tr><td>Idea pledge pool</td><td>Round backers</td><td>Winning pool becomes staged grant escrow; losing pool remains individually refundable.</td></tr><tr><td>Unvested fee</td><td>Part of a winning gross pool</td><td>Vests only alongside paid tranches; it returns to refund accounting if the unreleased grant stops.</td></tr><tr><td>Protocol reserve</td><td>Vested tranche fees, slashed bonds and defined protocol inflows</td><td>Protocol accounting, never a substitute for a user's refundable pledge.</td></tr></tbody></table>
      <h2>Progressive fee vesting</h2><p>For a 100,000 USDC winning gross pool at a 5% fee, the protocol does not take all 5,000 USDC at initial claim. The first 20% gross tranche releases 19,000 USDC to the author and vests 1,000 USDC to reserve. Each approved 40% tranche releases 38,000 USDC and vests 2,000 USDC. If execution stops, only fees for already released tranches stay vested.</p>
      <div class="callout warning"><strong>Do not reconstruct accounting from ERC-20 transfers.</strong> Read per-round pool, pledge, payout and refund state. A token transfer alone cannot distinguish a pledge, refund, tranche release, bond route or reserve movement.</div>
      <h2>Refund presentation</h2><p>Losing pledges use the normal per-wallet refund path. A cancelled winning grant makes the <em>unreleased</em> gross escrow refundable pro rata to every member of the original winning cohort. Approve voters, reject voters and non-voters receive the same economic treatment in that refund path; milestone votes decide release, not ownership of the escrow.</p>
    `,
  },
  {
    slug: "v2-grant-milestones",
    section: "BERT V2.3 / Contract reference",
    group: "Capital & grants",
    title: "Backer-governed milestones",
    summary: "The V2.3 20/40/40 release schedule, weighted backer voting, 40% quorum, two-thirds approval and cancellation/refund rules.",
    tags: ["v2", "v2.3", "milestones", "backers", "quorum", "refunds", "grant-manager"],
    content: `
      <p class="eyebrow">V2.3 / GrantManager</p><h1>Backers govern<br /><span>their own remaining escrow.</span></h1>
      <p class="lead">V2.3 replaces the global reviewer gate for new grants with a decision by the winning pledge cohort. The author receives no milestone release merely because time passes. Evidence is submitted by commitment; qualifying backers decide the release under fixed quorum and approval rules.</p>
      <h2>20 / 40 / 40 schedule</h2><table><thead><tr><th>Stage</th><th>Share of gross winning pool</th><th>Author receives at 5% fee</th><th>Trigger</th></tr></thead><tbody><tr><td>Initial claim</td><td>20%</td><td>19% of gross pool</td><td>Winning author claims within 14 days of settlement.</td></tr><tr><td>In-process milestone</td><td>40%</td><td>38% of gross pool</td><td>Winning backers approve the first proof.</td></tr><tr><td>Completion milestone</td><td>40%</td><td>38% of gross pool</td><td>Winning backers approve the second proof.</td></tr></tbody></table>
      <h2>Who can vote and how weight works</h2><ul><li>Only wallets that pledged to the settled winning idea may vote.</li><li>Each wallet's weight equals its recorded winning pledge amount.</li><li>The author is excluded even if they otherwise hold a wallet position.</li><li>A backer chooses approve or reject and may change that position before the deadline; only the final position is counted.</li><li>No one may join the winning cohort after settlement.</li></ul>
      <h2>The decision rule, in plain language</h2><p>Let the winning pool be 100,000 USDC. At least 40,000 USDC of that original pledge weight must take part by casting either approve or reject: this is the <strong>40% quorum</strong>. Among the participating amount, at least two-thirds must be approve. If exactly 40,000 USDC participates, at least 26,666.67 USDC must approve. At least three distinct verified-human backers must be among the approve voters. Participation can exceed 40%; the review remains open for its full window and all final votes count.</p>
      <table><thead><tr><th>Requirement</th><th>Value</th><th>Purpose</th></tr></thead><tbody><tr><td>Review window</td><td>14 days</td><td>Backers have time to inspect evidence and change their final position.</td></tr><tr><td>Quorum</td><td>40% of total winning pledge weight</td><td>A small inactive minority cannot release a tranche.</td></tr><tr><td>Approval</td><td>At least 2/3 of participating pledge weight</td><td>Release needs a strong weighted majority, not merely more yes than no.</td></tr><tr><td>Human safeguard</td><td>At least 3 approving backers</td><td>One large wallet cannot alone pass a milestone.</td></tr><tr><td>Grace after no quorum</td><td>7 days, once</td><td>Silence receives one final response period; it never counts as approval.</td></tr></tbody></table>
      <h2>Proof, finalization and failure paths</h2><ol class="numbered-flow"><li>The author submits <code>submitBackerMilestoneProof</code> with one proof URI, its content hash and a concise summary. The URI may point to a package containing many evidence links.</li><li>Eligible backers call <code>castBackerMilestoneVote</code> before the deadline. A frontend should show participation, approve weight and deadlines but treat finalization as the chain result.</li><li>After the review window, anyone calls <code>finalizeBackerMilestone</code>. Passing conditions release the next fixed tranche.</li><li>With no quorum, the proof receives one 7-day grace window. If quorum is still absent, unreleased escrow becomes refundable.</li><li>With quorum but insufficient approval, the author may submit one corrected proof after a 48-hour cooldown and before the stage deadline. A second rejection, a missed author deadline or failed grace permanently cancels the incomplete grant.</li></ol>
      <div class="callout danger"><strong>Silence is never approval.</strong> Inactivity does not send the remaining 80% to the author and does not send it to protocol reserve. The unreleased gross escrow becomes a pro-rata, pull-based refund liability for the full winning cohort.</div>
      <h2>Expert review is advisory</h2><p>A backer may consult a technical expert offchain and use that opinion when voting. That expert has no protocol role, no direct voting right and no ability to move funds. V2.3 intentionally avoids pretending that an unpaid global reviewer market is a secure execution authority.</p>
    `,
  },
  {
    slug: "v2-invariants-and-failures",
    section: "BERT V2.3 / Contract reference",
    group: "Security reference",
    title: "V2.3 invariants and failure handling",
    summary: "The security properties an integration must preserve across pledges, settlement, milestone voting and refunds.",
    tags: ["v2", "v2.3", "security", "invariants", "reverts", "pause"],
    content: `
      <p class="eyebrow">V2.3 / Integration safety</p><h1>Decode the revert.<br /><span>Preserve the invariant.</span></h1>
      <p class="lead">A V2 revert often means the contract is defending an economic or lifecycle invariant. Integrations should simulate every write with the connected account, decode custom errors from the deployed ABI and refresh direct reads after a receipt.</p>
      <table><thead><tr><th>Invariant</th><th>V2.3 enforcement</th><th>Client consequence</th></tr></thead><tbody><tr><td>Pledges are idea-specific</td><td>Each record binds one wallet, round and idea.</td><td>Never describe a losing pledge as financing a different winner.</td></tr><tr><td>Funding plan is immutable before selection</td><td>V2.3 round admission requires the committed plan.</td><td>Display the URI/hash before a user pledges.</td></tr><tr><td>Settlement cost is bounded</td><td>Progression is claimed lazily by winning backers.</td><td>Do not expect settlement to issue a reward to every winner automatically.</td></tr><tr><td>Milestone authority belongs to the cohort</td><td>Only settled winning pledgers can vote, weighted by pledge.</td><td>Do not expose reviewer writes for a new V2.3 round.</td></tr><tr><td>Inactivity cannot release escrow</td><td>Quorum failure leads to grace then cancellation/refunds.</td><td>Never show an automatic payout countdown after proof submission.</td></tr><tr><td>Unreleased capital remains refundable</td><td>Cancellation activates pro-rata cohort refunds.</td><td>Keep refund state distinct from a lost pledge refund.</td></tr></tbody></table>
      <h2>Operational safety</h2><p>FundingPool, VotingSystem and GrantManager have independent pause controls. A pause is an explicit safety state, not a UI error to retry around. V2 modules are upgradeable; use the published proxy addresses and verify current chain state before sensitive operations.</p>
      <div class="callout warning"><strong>Testnet identity warning.</strong> Demo verification is deliberately open to multiple test wallets. It proves frontend, backend and verifier wiring only. Do not use testnet behavior as evidence of production Sybil resistance.</div>
    `,
  },
  {
    slug: "v2-wallet-integration",
    section: "BERT V2.3 / Contract reference",
    group: "Integration guides",
    title: "Wallet integration cookbook",
    summary: "A safe V2.3 client flow for USDC allowances, proposal plans, pledges, settlement, milestone voting and refunds.",
    tags: ["v2", "v2.3", "viem", "wallet", "usdc", "pop"],
    content: `
      <p class="eyebrow">V2.3 / Wallet integration</p><h1>Read, simulate,<br /><span>submit, then refresh.</span></h1>
      <p class="lead">A correct V2 client treats contract state as final. Check allowance, verification, pause, status and deadline immediately before a wallet prompt; simulate with the active account; await a successful receipt; then invalidate both direct reads and indexed queries.</p>
      <h2>USDC allowance</h2><p>FundingPool is the USDC spender for author bonds and V2 pledges. Approving IdeaRegistry or VotingSystem does not authorize the needed transfer. Keep ERC-20 approval and the following protocol action as separate transactions with separate user-facing status.</p>
      <pre><code>const { request } = await publicClient.simulateContract({
  account,
  address: votingSystem,
  abi: votingAbi,
  functionName: "vote",
  args: [roundId, ideaId, pledgeAmount],
});
const hash = await walletClient.writeContract(request);
await publicClient.waitForTransactionReceipt({ hash });</code></pre>
      <h2>Proposal checklist</h2><ol class="numbered-flow"><li>Read the live author bond, verification policy and FundingPool allowance.</li><li>Submit the proposal with its non-zero minimum net target.</li><li>Commit the plan URI and content hash while its status is <code>Pending</code>.</li><li>Verify the direct <code>hasFundingMilestonePlan</code> read before advertising the idea as round-ready.</li></ol>
      <h2>Milestone checklist</h2><ol class="numbered-flow"><li>Read payout, proof, tally and deadline state from GrantManager before displaying an action.</li><li>Show the proof package URI and hash; never replace evidence silently in the interface.</li><li>For a winning backer, simulate <code>castBackerMilestoneVote</code> and indicate that a later vote may replace the current position before deadline.</li><li>After expiry, allow permissionless finalization only after direct deadline reads confirm eligibility.</li><li>When cancellation occurs, present the appropriate pull-refund claim instead of calculating a payout locally.</li></ol>
    `,
  },
  {
    slug: "v2-indexing-reference",
    section: "BERT V2.3 / Contract reference",
    group: "Integration guides",
    title: "V2.3 indexing and read models",
    summary: "The event and direct-read model for V2.3 plans, backer proof votes, lifecycle state and claims.",
    tags: ["v2", "v2.3", "subgraph", "indexing", "events", "graphql"],
    content: `
      <p class="eyebrow">V2.3 / Indexing</p><h1>Index history.<br /><span>Authorize from the chain.</span></h1>
      <p class="lead">The Arc Testnet V2.3 subgraph indexes proposal plan commitments, proof package commitments and milestone votes so applications can paginate history and render cohort activity. It is not authoritative for a transaction that depends on the latest block.</p>
      <h2>Events that change the V2.3 read model</h2><table><thead><tr><th>Event family</th><th>Indexer responsibility</th></tr></thead><tbody><tr><td>Idea creation, status and <code>FundingMilestonePlanCommitted</code></td><td>Expose target, plan URI/hash and V2.3 queue eligibility.</td></tr><tr><td>Round open, pledge and settlement</td><td>Build idea totals, pledge records, cohort membership and final winner data.</td></tr><tr><td><code>BackerMilestoneProofHashCommitted</code></td><td>Store immutable proof package reference and stage/deadline context.</td></tr><tr><td><code>BackerMilestoneVoteCast</code></td><td>Reflect a wallet's latest position and aggregate weights; preserve event history for audit.</td></tr><tr><td>Grace, finalization, cancellation and refund events</td><td>Render lifecycle state and available claims without treating the index as authorization.</td></tr></tbody></table>
      <h2>Arc Testnet endpoint</h2><pre><code>https://api.studio.thegraph.com/query/1742046/bert-arc-testnet/v0.3.0</code></pre>
      <div class="callout info"><strong>Direct-read rule.</strong> Before any write, read current contract state for pause, deadline, caller eligibility and claimed status. The subgraph may be a few blocks behind a confirmed transaction.</div>
    `,
  },
];
