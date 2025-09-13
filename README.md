# Sonic10 Mint Page (Option 2: ES Modules)

This is a static HTML + ES‐module site that:

- Imports wagmi & ethers directly from a CDN
- Uses `InjectedConnector` (MetaMask, Rabby)
- Calls `feeForPower` & `mint` on the Sonic10 contract

## Files

- **index.html** – markup, styles, layout
- **main.js** – wallet/connect & mint logic

## Deploying

1. Push to GitHub.
2. In Cloudflare Pages, connect this repo.
3. Set build command to **None** (no bundler).
4. Set the root directory to `/` and publish.

Make sure your CSP (if any) allows CDN origins: