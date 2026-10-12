# Contributing to BERT Documentation

This repository is the public technical reference for BERT V2.3, the V3.1
Community Layer and Arc Testnet operations. It is a contributor surface, not a
marketing site: every factual claim must be traceable to deployed contracts,
the Core deployment record, a reviewed source change or a reproducible test.

## Where Help Is Needed

| Contribution area | Current need | First useful contribution |
| --- | --- | --- |
| Protocol testers | Clear reports for V2.3, V3.1, frontend and indexer behavior | Improve a test case with exact setup, expected state and transaction evidence. |
| Frontend developers | Accurate integration examples, module-routing notes and wallet UX docs | Verify a code sample against the current dApp and Core ABI. |
| Solidity developers and auditors | Security/invariant explanations that match reviewed code | Document a proven invariant or clarify a real failure path. |
| Technical writers | Better onboarding, terminology, diagrams and accessibility | Rewrite one page without changing protocol meaning. |
| SMM and community contributors | Accurate release explainers and educational content | Propose factual copy linked to a released docs page before publication. |

For coordination, use the public [BERT Telegram channel](https://t.me/bertdao)
or open a focused GitHub issue. Do not publish unverified protocol claims,
security findings, private operational information or promises of financial
returns.

## Documentation Rules

1. Start from the current Core source, test, deployment record or confirmed
   transaction. Never use a screenshot, an old social post or UI text as the
   sole authority.
2. Separate current Arc Testnet facts from future mainnet plans. Testnet assets
   have no monetary value; Demo PoP is not Sybil resistance.
3. Label V3.0 as historical where necessary. New Community integrations use
   V3.1 Factory/module architecture.
4. For ABI-sensitive content, state which contract or module owns a read/write.
   Do not imply that every V3.1 getter lives on `CommunityHub`.
5. Do not add secrets, private keys, deploy keys, backend credentials, personal
   data or unredacted security proof material.
6. Keep public address changes synchronized with
   `bert-core/deployments/arc-testnet-v3.json` and the corresponding release
   record.

## Local Preview and Checks

```bash
python3 -m http.server 4040
```

Open `http://localhost:4040`, test navigation, search, deep links, mobile
layout and every edited external link. Validate JavaScript content files before
opening a pull request:

```bash
node --check assets/content/testnet.js
node --check assets/content/testing.js
node --check assets/content/v3.js
git diff --check
```

The editable whitepaper source is
`whitepaper/BERTDAO-Protocol-Whitepaper.html`. When changing it, regenerate
and review the distribution PDF using the command in `whitepaper/README.md`.

## Pull Request Checklist

- Explain the source of truth for every changed factual statement.
- List tested routes, search terms and links.
- Include regenerated PDF when the whitepaper HTML changes.
- Keep prose, source code examples and address registry consistent.
- State whether Core, frontend, backend or subgraph documentation also needs a
  coordinated update.

## Security Reports

Do not disclose a vulnerability in public documentation, issues or a pull
request. Use the [private BERT Core advisory channel](https://github.com/Tenyokj/bert-core-arc/security/advisories/new).

## Review

Contributors work through pull requests. Maintainers review and deploy the
documentation site. A merged documentation contribution does not imply a
security audit, protocol endorsement, compensation or mainnet readiness.
