# Crypto Receipt Viewer (Read-Only PWA)

**Crypto Receipt Viewer** is a lightweight, mobile-first Progressive Web App that converts any Starknet transaction hash or explorer URL into a human-friendly, shareable receipt (QR + PNG). The app is **read-only** — no wallets, no keys, no transactions.

## Why
Blockchain transactions are cryptic (long hashes). This app makes payment proof easy to show, share, and verify using the official explorers (Voyager, Starkscan).

## Features
- Paste a Starknet transaction hash or full Voyager / Starkscan URL
- Add optional fields: payee, token, amount, note
- Generate a QR code that encodes the receipt JSON
- Open transaction on Voyager and Starkscan directly
- Export the receipt as a PNG image
- Optional: toggle a read-only USD price estimate (CoinGecko)

## Security
- **No signing**, **no wallets**, **no private keys**.
- App is read-only and runs entirely client-side.

## Tech
- React (Create React App)
- `qrcode` for QR generation
- `html-to-image` for PNG export
- PWA-friendly (manifest + service worker ready)

## Quick Start (local)
1. Install Node LTS (if needed): https://nodejs.org  
2. Create app (if starting from scratch):
   ```bash
   npx create-react-app crypto-receipt-viewer --template cra-template
   cd crypto-receipt-viewer
   npm install qrcode html-to-image
