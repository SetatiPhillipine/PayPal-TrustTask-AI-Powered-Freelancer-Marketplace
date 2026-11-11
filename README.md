# TrustTask — AI-Powered Freelancer Marketplace
Clear projects. Trusted partnerships.

React + Node/Express + MongoDB + AI brief generator + PayPal sandbox checkout.

## Setup (VS Code terminal)
1. Install Node 20+ and MongoDB (local) or create a free MongoDB Atlas cluster.
2. `npm run install:all`
3. Copy `server/.env.example` to `server/.env` and fill in values (see below).
4. Copy `client/.env.example` to `client/.env` and add your PayPal sandbox client ID.
5. Terminal 1: `npm run dev:server`   Terminal 2: `npm run dev:client`
6. Open http://localhost:5173

## PayPal sandbox
1. developer.paypal.com > Apps & Credentials > Sandbox > Create App.
2. Client ID goes in `client/.env` (VITE_PAYPAL_CLIENT_ID) and `server/.env` (PAYPAL_CLIENT_ID).
3. Secret goes ONLY in `server/.env` (PAYPAL_CLIENT_SECRET).
4. Test with the sandbox personal (buyer) account under Testing Tools > Sandbox Accounts.

## AI
Set ANTHROPIC_API_KEY in `server/.env`. Without it, a built-in fallback planner drafts the brief so the demo still works.

## Demo flow
Register a client and a freelancer (use two browsers or one normal and one private window).
Client: New project > Draft brief > Post project. Freelancer: Accept project > Start / Submit work.
Client: Approve milestones and pay with PayPal sandbox.

## Security notes
- Secrets only in server/.env (git-ignored). Never commit .env.
- Payment amount is computed on the server; the server captures and verifies the PayPal order before marking a project paid.
- Passwords are hashed with bcrypt; routes are protected by JWT and role checks.
