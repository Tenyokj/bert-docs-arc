# Documentation handbook redesign

Implementation and acceptance record, November 27, 2026.
Owner reviewed the local design and authorized publication after successful
checks. GitHub records the released revision and PR; Vercel separately records
site deployment. Local acceptance alone does not establish public deployment.

## Scope

Visual refinement after owner feedback: ink-blue/plum dark theme and tinted light
theme, blue/lilac/rose accents, larger home typography, SVG icon vocabulary,
two-tier header, early task cards and illustrated navigation/footer/code actions.
The content and route inventory below are preserved. Sidebar width, mobile drawer
and in-place section accordions animate, with closed navigation made inert and
reduced-motion preferences respected. No icon CDN or UI package was added.

- Calm text-first shell, collapsible sidebar, header navigation, light/dark themes,
  section outline, heading permalinks, previous/next navigation and footer links.
- Full-text local search across guides and source, keyboard selection, copyable
  code examples, lightweight lexical highlighting, responsive tables and callouts.
- Four home entry points: use the app, understand the protocol, build, and verify.
- 138 routes: 19 newly authored handbook pages, 47 retained layer/integration
  guides, 53 generated Solidity-file references, 16 pinned source guides and
  three navigation/glossary pages. These are not 138 newly authored tutorials
  or 53 independently deployed contracts.
- User guides cover wallet access, page purposes, proposals, support, settlement,
  delivery/review, Community administration, payments, rewards, exit and recovery.
- Technical content separates V2/V3 custody, roles, snapshots, legacy behavior,
  current releases, upgrade authority, revenue and future candidates.
- Existing hash routes and the whitepaper HTML/PDF are retained. `v3.html`
  redirects legacy links to the V3 overview.

## Source And Accuracy

Core snapshot: `171a9463c1e3b6bed90a21c6f29898abdd24bf6a`, captured November 27.
Generated pages link to the exact revision and display their provenance.
`scripts/sync-reference.mjs` reads committed source and rejects dirty contracts/docs.
This preserves public reproducibility; private notes and environment files are
not included. User guides are authored separately and require editorial review
when behavior changes.

Explicit function listings are a source index, not a complete inherited ABI.
Historical deployments can behave differently from the current source. The
reference is not a fresh live-chain verification or an independent audit.
Security findings and readiness limitations remain documented rather than hidden.

## Verification

Run from this directory with Node supporting JSON import attributes:

```sh
node --test scripts/release-docs.test.mjs scripts/handbook.test.mjs
node scripts/preview.mjs
# In another terminal, with frontend Playwright installed:
node scripts/browser-smoke.mjs
```

Node checks cover release facts, page uniqueness, internal links, content scopes
and source-reference inventory. Browser checks cover every route, page-level
overflow at 320px, representative layouts at 320/390/768/1024/1190/1440px, themes,
search/keyboard navigation, copy, mobile navigation, heading links, blocked
storage and the whitepaper response. Screenshots/reports are ignored in `.qa/`.
No wallet transactions are sent. These checks do not establish factual accuracy
of every sentence, full accessibility conformance or mainnet readiness.

## Release Boundaries

- Owner reviewed the local style and structure. Publication still requires
  successful remote checks; the release is independent of protocol versions.
- This is a static hash-routed site, not per-page server rendering/SEO.
- Google Fonts are optional external requests; CSS fallbacks remain available.
- The reference uses native JSON modules and targets modern browsers.
- Existing technical guides were reorganized and supplemented, not all rewritten
  from scratch. The source Markdown renderer handles the repository's common
  constructs, not every extension of GitHub-flavored Markdown.
- This work changes the documentation site only, not the dApp, contracts,
  backend, Console or onchain policies.
