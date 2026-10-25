# BERTDAO Protocol Whitepaper

This directory contains the editable, print-ready source for the BERTDAO Protocol
Whitepaper.

## Files

- `BERTDAO-Protocol-Whitepaper.html` - canonical editable source and browser-readable version.
- `BERTDAO-Protocol-Whitepaper.pdf` - generated distribution copy.

## Scope and status

Deployment addendum (25 October 2026): V3.2.1 infrastructure and graph v3.2.1 are
now deployed with Manager 2.0.1's correction-deadline fix. The HTML/PDF revision
1.3.1 below is the dated 24 October V3.2.0 snapshot, not the current address registry.
Use the [V3.2.1 release addendum](https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/V3.2.1-ARC-TESTNET-RELEASE.md)
for current addresses, receipts and immutable-instance limitations. This rollout
has not regenerated the whitepaper PDF.

The paper documents BERT V2.3 Global Funding Layer and the modular BERT V3.2
Community Layer deployed on Arc Testnet with internal automated tests. Broader
manual E2E testing and independent security review remain outstanding. V2.3 uses refundable,
idea-specific pledges and winning-backer-governed 20/40/40 milestones; V3.2
uses isolated Community Treasuries, focused runtime modules and
supporter-governed 20/40/40 execution plans. It distinguishes real testnet
execution from planned mainnet behavior, including the fact that Demo
verification is not a proof-of-personhood system.

It must be updated when a material protocol change, deployment change, audit,
or mainnet policy decision occurs. Contract source and the current deployment
manifest remain the authority for live values.

Document revision 1.3.1 (24 October 2026) distinguishes original deployed V3.1
from **V3.2 deployed on Arc Testnet on 24 October 2026** (Manager 2.0.0): execution-recipient review
exclusion, fresh Admin quorum for all 20/40/40 payments, seven-active-day
authorization/payment expiry and refunds of the whole unpaid execution budget.
The PDF and HTML now both include this section. The deployment appendix records current V3.2 addresses and receipt-backed anchors,
while retaining historical V3.1 release evidence. V2 remains unchanged.

V2 and V3 remain separate parts of **one** whitepaper, not two independently
versioned papers. Legacy V2 round policy, exact V3 review thresholds, Demo PoP
limitations and outstanding manual E2E/independent audit remain explicit.

See the [quorum specification](https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/V3.2-TRANCHE-QUORUM.md)
and [self-review record](https://github.com/Tenyokj/bert-core-arc/blob/arc-usdc-migration/docs/V3.1-SELF-REVIEW-FIX.md)
before claiming that a particular Community uses the new behavior.

## Generating the PDF locally

On macOS with Google Chrome installed:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/whitepaper/BERTDAO-Protocol-Whitepaper.pdf" \
  "file://$PWD/whitepaper/BERTDAO-Protocol-Whitepaper.html"
```

The source uses A4 print styling. Review the generated PDF before publishing.

V2 remains V2.3; documentation/NatSpec corrections do not create V2.4 or V2.3.1. V3.2, each contract's custom version and this document's 1.3.1 revision are separate scopes.
