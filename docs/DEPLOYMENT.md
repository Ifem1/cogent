# Canonical deployment record

**Status: NOT DEPLOYED.** To be filled strictly from real CLI output and GenLayer Studio Explorer after the Codex handoff.

- Contract source commit SHA: PENDING (set after the reviewed source commit)
- Contract source SHA-256: PENDING (generate with `scripts/preflight.py` after the reviewed source commit)
- GenVM lint/typecheck: PASSED locally; v0.11.0 / GenVM v0.2.12; see `docs/TESTING.md`
- Network: Studionet (61999)
- RPC: `https://studio.genlayer.com/api`
- Deployed contract address: PENDING
- Deployment transaction hash: PENDING
- Consensus result: PENDING
- Execution result: PENDING
- Frontend production URL: PENDING
- Frontend contract address: PENDING
- Actual production build check: PASSED locally; Next.js 15.5.28; no production deployment has been checked
- Live proof: PENDING

## Deploy workflow

Install repository-local CLI `genlayer@0.39.1`. Verify configured network and use `npx genlayer network set studionet` and `npx genlayer network info`. Never deploy to chain 61997. After GenVM validation and Direct Mode green, deploy `contracts/cogent.py` to `https://studio.genlayer.com/api` through the pinned CLI and record the address, tx and source bytes. Never invent a deployment. If the deployed source changes, deploy a new canonical contract rather than updating docs against old source.

Set Vercel env `NEXT_PUBLIC_COGENT_CONTRACT=<actual deployed address>`; redeploy frontend manually. Remove GitHub auto-deploy connection if required by the deployment workflow. Verify public chain reads and injected wallet writes before marking ready.

The read-only auditor `frontend/scripts/verify-live.mjs` checks contract-level accounting without a wallet; wallet-based lifecycle scripts should use existing explicitly authorised CLI wallet identities, not committed keys.
