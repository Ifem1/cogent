# Locked Cogent product specification

## One finished project, not a V1/V2 roadmap

Cogent is an agent spending-authority and procurement mandate protocol. Its on-chain value proposition is semantic compliance before releasing previously escrowed funds. It is **not** a vendor-delivery guarantee, identity protocol, transferable claim, insurer, marketplace matching service, price oracle or arbitration court.

## Product scope

- Principal creates and funds an immutable mandate, picking one agent, fixed source prefixes, policy, expiry, per-purchase and cumulative per-vendor caps.
- Agent proposes a purchase for an independent vendor using one URL and immutable offer ref; exact funds reserved at proposal creation.
- Vendor signs acceptance through its external wallet.
- Anyone opens bounded evaluation request; independent GenLayer validators refetch source and derive scalar semantic verdict.
- Provisional allowed/refused state; exact 5% bonded challenge by economically opposing principal or vendor.
- Second independent review may reverse decision; otherwise default provisional result after bounded challenge recovery.
- Approved proposal credits vendor once, refused proposal unlocks reservation; withdrawals explicit.
- Permissionless timeout paths for unaccepted offers, never-decided reviews and expired mandates.
- Public read-only app, role-appropriate controls, no mocked records.
- CI, source-matched deployment records and two publicly verifiable opposite outcome live scenarios before submission.

## Exclusions

No DB, backend, Docker, admin approval, browser-generated wallets, ERC-20 contract, cross-chain payments, secret URLs, uploaded files, private or paywalled evidence, arbitrary model payouts, reputation, tokens, off-chain escrow authority, background keeper dependency or speculative extra contract. Do not add APIs merely for reviewers.

## Business model

Testnet GEN is used to demonstrate actual native-value escrow. A real service would require asset/identity/payment compliance work outside this hackathon deliverable. No fee is charged by Cogent itself; network protocol fees are separate.
