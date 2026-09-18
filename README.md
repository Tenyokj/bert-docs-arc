<p align="center">
  <img src="https://img.shields.io/badge/version-BERT%20Docs-cddc39?style=for-the-badge&labelColor=171717" alt="BERT Docs" />
  <img src="https://img.shields.io/badge/docs-standalone-8bc34a?style=for-the-badge&labelColor=171717" alt="Standalone docs" />
  <img src="https://img.shields.io/badge/theme-day%20%2F%20night-f4d03f?style=for-the-badge&labelColor=171717" alt="Day and night theme" />
  <img src="https://img.shields.io/badge/domain-docs.bert.app-7cb342?style=for-the-badge&labelColor=171717" alt="docs.bert.app" />
</p>

<p align="center">
  <img src="./assets/banner.png" alt="BERT Docs banner" width="720" />
</p>

# BERT Docs

Standalone developer documentation portal for the **BERT** protocol. It
documents V2 and V3 contract integration, events, indexers, deployment
operations and the current Arc Testnet boundary without presenting testnet
behavior as a mainnet guarantee.

This folder is intentionally isolated from the main frontend so it can be:
- deployed as a separate static site
- moved into its own repository later
- maintained as the canonical technical reference for BERT integrators

## Current network policy

BERT is in active development on **Arc Testnet** (`5042002`). Contract
transactions are real testnet transactions, but test assets, balances, rewards
and outcomes have no monetary value.

Protected actions currently use explicitly labelled **Demo verification**. It
exercises the real frontend, backend signer and onchain `PoPVerifierUpgradeable`
path, but it is not proof of personhood and makes no Sybil-resistance claim.
Demo verification is testnet-only. A production World ID policy and mainnet
launch criteria will be documented only after they are finalized.

## Live domain

- `https://bertdao-docs.vercel.app`

## Whitepaper

The technical BERTDAO Protocol Whitepaper is available in the
[`whitepaper/`](./whitepaper/) directory as an editable HTML source and a
distribution PDF. It covers the implemented V2 Global Funding Layer, V3
Community Layer, current Arc Testnet boundary, security assumptions, public
deployment registry, and mainnet readiness conditions.

## Repository map

| Resource | Purpose |
| --- | --- |
| [BERT dApp](https://bertdao.vercel.app) | Reference interface for V2, V3 Communities and Arc Testnet Demo PoP. |
| [Core contracts](https://github.com/Tenyokj/bert-core-arc) | Solidity contracts, deployment scripts and canonical deployment manifest. |
| [Frontend](https://github.com/Tenyokj/bert-front-arc) | Next.js dApp implementation. |
| [Backend](https://github.com/Tenyokj/bert-backend-arc) | Verification and testnet backend service. |
| [V2 subgraph](https://thegraph.com/studio/subgraph/bert-arc-testnet/) | Indexed V2 protocol history. |
| [V3 subgraph](https://thegraph.com/studio/subgraph/bert-v-3-arc-testnet/) | Indexed V3 Factory, Community Hub and Treasury history. |

| [Telegram](https://t.me/bertdao) | Official BERT community channel. |
| [YouTube](https://www.youtube.com/@bertdaoARC) | Official BERT video channel. |

## Local preview

```bash
cd bert-docs-old
python3 -m http.server 4040
```

Open:

- `http://localhost:4040`

## What is inside

- `index.html` - docs app shell
- `assets/styles.css` - docs UI, theme system, layout
- `assets/docs-data.js` - combines the modular documentation pages
- `assets/content/` - page modules grouped by developer topic and protocol version
- `assets/app.js` - routing, search, theme toggle, in-page search jump
- `assets/banner.png` - docs brand banner
- `CNAME` - custom domain for static hosting
- `robots.txt` - crawler rules
- `sitemap.xml` - sitemap for indexing

## Documentation navigation

The site is organized for protocol developers, not as a marketing guide:

- **Build with BERT**: architecture, client setup and integration conventions.
- **BERT V2 / Contract reference**: global funding flow, voting, grants,
  reputation and voter progression.
- **BERT V3 / Contract reference**: Factory-created Communities, Hubs,
  Treasuries, validation, rounds and quorum-protected actions.
- **Infrastructure & operations**: Arc Testnet deployment registry, direct-read
  reference, RPC/subgraph operations, test matrix, Demo PoP and incident
  response.

Use the command search (`Cmd/Ctrl + K`) to search titles, tags, summaries and
page content. Every code block has a copy control.

## Search behavior

Search checks:

- page title
- page summary
- full page text content
- section names and tags

When a developer opens a result:

- the matching page opens
- the page outline is regenerated from its headings

## SEO / indexing

This static docs site now includes:

- `robots.txt`
- `sitemap.xml`

For Google Search Console verification, place the verification file in the **root of `bert-docs`**, next to:

- `index.html`
- `CNAME`
- `robots.txt`
- `sitemap.xml`

Example:

- `bert-docs/google1234567890abcdef.html`

If Google gives you a meta-tag instead of a file, place it inside the `<head>` of `bert-docs/index.html`.

## Writing a page

Each entry in `assets/content/` exports an array of page objects with:

- `slug` - the stable hash route, for example `v3-overview`
- `section` - its left-navigation group
- `title`, `summary` and `tags` - searchable page metadata
- `content` - reviewed HTML rendered inside the documentation shell

The app assembles the left navigation, next/previous pager, heading outline and
client-side command search from those fields. Use onchain reads and deployment
artifacts as the authority for live values; never hard-code temporary testnet
addresses or balances as protocol facts.

## Contributing and security

Public contributors can fork this repository and open pull requests. Direct
push access is restricted to repository maintainers. Keep documentation claims
grounded in deployed code and manifests; do not add secrets, private keys or
unverified contract addresses.

For a security issue, do not open a public issue or pull request. Use the
[private BERT Core advisory channel](https://github.com/Tenyokj/bert-core-arc/security/advisories/new).

## License

Documentation and repository source are published under [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html).
