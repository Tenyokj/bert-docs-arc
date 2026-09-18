# BERTDAO Protocol Whitepaper

This directory contains the editable, print-ready source for the BERTDAO Protocol
Whitepaper.

## Files

- `BERTDAO-Protocol-Whitepaper.html` - canonical editable source and browser-readable version.
- `BERTDAO-Protocol-Whitepaper.pdf` - generated distribution copy.

## Scope and status

The paper documents the BERT V2 Global Funding Layer and BERT V3 Community
Layer as deployed and tested on Arc Testnet. It distinguishes real testnet
execution from planned mainnet behavior, including the fact that Demo
verification is not a proof-of-personhood system.

It must be updated when a material protocol change, deployment change, audit,
or mainnet policy decision occurs. Contract source and the current deployment
manifest remain the authority for live values.

## Generating the PDF locally

On macOS with Google Chrome installed:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/whitepaper/BERTDAO-Protocol-Whitepaper.pdf" \
  "file://$PWD/whitepaper/BERTDAO-Protocol-Whitepaper.html"
```

The source uses A4 print styling. Review the generated PDF before publishing.
