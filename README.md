
# Crypto Receipt Viewer (Read‑Only PWA)

A **read‑only**, mobile‑first web app that visualizes **Starknet** transactions as human‑friendly receipts.Paste any Starkscan/Voyager **transaction hash or URL**, add simple metadata (payee, token, amount), then generate:

- **Explorer links** (Voyager + Starkscan)
- **QR code** with embedded receipt payload
- **PNG export** of the receipt card

No wallets. No keys. **No on‑chain writes.** Optional USD estimate toggle (CoinGecko), **off by default**.

---

## Features

- Read‑only viewer (safe by design)
- Transaction **hash/URL parsing** → explorer links
- **QR code** generation for sharing
- **PNG export** of the receipt card
- Optional **USD estimate** (public API; opt‑in)

## Safety

- No wallet connections, no private data
- No transactions or contract calls
- All logic runs client‑side in the browser

## Tech Stack

- React (Create React App)
- PWA (service worker + manifest)
- `qrcode` + `html-to-image`
