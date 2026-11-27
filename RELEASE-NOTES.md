# BERT Documentation - Handbook & Navigation Redesign

Tag: `docs-handbook-2026-11-27`

This release expands BERT's documentation into a task-oriented handbook and
redesigns its standalone documentation website. It is a documentation release,
not a new V2/V3 contract version, deployment or change to financial rules.

## A New Reading Experience

- A start page with four routes: use BERT, understand the protocol, build and
  integrate, or inspect the security and deployment boundaries.
- Blue/lilac/rose accents, ink-toned dark mode and a tinted light mode, clearer
  typography, SVG navigation icons and a two-tier header.
- Smooth sidebar and section navigation, accessible closed regions, mobile
  drawer, keyboard support and reduced-motion behavior.
- Full-text search across guides and source references, heading permalinks,
  page outlines, copyable code, lexical highlighting and responsive tables.
- Expanded footer navigation and preserved whitepaper PDF/HTML links.

## A Broader Handbook

The site contains 138 routes:

- 19 new handbook pages covering purpose, wallet access, dApp navigation,
  V2 proposals/pledges/grants, V3 Communities/governance/execution, payments,
  rewards, exits, revenue, recovery, contribution, trust and version history.
- 47 retained technical and integration guides, reorganized under clearer
  sections with current/legacy boundaries.
- 53 generated Solidity-file reference pages, including interfaces and
  libraries. These are not 53 separately deployed contracts or complete
  inherited ABI listings.
- 16 pinned Core source guides and three directory/glossary pages.

The source reference is pinned to Core revision
`171a9463c1e3b6bed90a21c6f29898abdd24bf6a`. Pages link to that exact source;
historical deployed instances may have different behavior. The reference
refresh script reads committed source and rejects dirty Core contracts/docs.

## Corrections And Compatibility

- Current V2 indexer examples use Graph `v0.4.0`.
- Revenue controls link to Control Center rather than the former Pool panel.
- V3 execution explains reservation, proof review, fresh Admin authorization
  and actual transfer as distinct steps; settlement alone does not pay 20%.
- V2.4 eligible fee revenue is distinguished from reserve, grant funds, bonds
  and total custody. The first testnet fee policy is already active; users
  must not repeat its activation.
- Legacy 30/40/30 and current backer-governed 20/40/40 remain explicitly
  distinguished. Existing guide hash routes are preserved.

## Verification And Limits

- 10 Node tests pass for routes, links, source inventory, release facts and
  accounting/version distinctions.
- Local Chromium checks cover all 138 routes and 320px page overflow, with
  representative layouts at 320/390/768/1024/1190/1440px.
- Themes, search/keyboard behavior, copy, headings, blocked storage, icons,
  whitepaper responses and normal/reduced-motion navigation are checked.
- No wallet transactions, contract changes or dependency migrations are part
  of this release. Private environment files and QA output are excluded.

This is not an independent security audit, exhaustive factual review of every
sentence, or a claim of mainnet readiness. Test assets have no monetary value;
Demo verification is not proof of personhood. Known security/operational
limitations remain documented. The whitepaper is preserved, not rewritten
or re-audited by this release.

Public site: https://bertdao-docs.vercel.app

The GitHub release identifies source; Vercel deployment status is verified
separately. See `DOCS-REDESIGN.md` for the implementation/acceptance record.
