# Canonical deployment record

## Cogent/2 Studionet deployment

- Repository: [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
- Network: GenLayer Studionet, chain 61999; RPC `https://studio.genlayer.com/api`
- Contract source SHA-256: `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`
- Contract: `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6`
- Deployment transaction: `0x3ec5bda2617f3cf20366d608e5e2f8139ce51842b060a5b1af1194ca665c5fdc`, finalized with five agreeing validator votes.
- Deployer/principal: `0x39680bd423437C0Eaa18493629652821Ec672C61`
- Source equivalence: local and on-chain source hashes match; receipt in [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json).

## Live cycle evidence

The funded role-separated live cycle used principal, agent and vendor test accounts and is recorded in [`evidence/live-cycle.json`](evidence/live-cycle.json). It records three proposals:

- Proposal 1 bound a compliant one-time offer. The principal challenged the compliant result; a second independent review upheld it and the proposal was released.
- Proposal 2 used the correct reference but an amount one wei above the cap. It was refused; the vendor challenged the refusal and a second independent review upheld the refusal.
- Proposal 3 used the frozen one-time-only mandate, correct vendor, matching offer reference, matching product and exactly capped amount, but its offer said `Renews monthly.`. Both primary and challenge review refused it on commercial policy with `bindings_valid: true`; the vendor challenged and the independent challenge review upheld refusal.

Each challenge used exactly 5% (250,000,000,000,000 wei). The losing vendor challenger bond is credited to the principal; the policy proposal's reserved purchase amount is released, never paid. The report records every finalized transaction, validator vote, primary/challenge manifest, exact role balance delta, mandate ledger and bond ledger. The earlier vendor and principal credits were withdrawn only after independent balance reconciliation. The fresh policy challenge's 250,000,000,000,000 wei principal credit remains owed and unwithdrawn. Final mandate 2 accounting is 100,000,000,000,000,000 wei funded = 95,000,000,000,000,000 available + 0 reserved + 5,000,000,000,000,000 paid + 0 refunded. Challenge bonds received/forfeited are each 750,000,000,000,000 wei; locked/returned are zero. The read-only audit in [`evidence/live-read-audit.json`](evidence/live-read-audit.json) reports zero invariant failures and the outstanding principal credit. This CLI-run cycle does not count as browser-originated wallet proof.

The withdrawal regression verifies that a stalled/uncertain external payout leaves the full liability pending and prevents a second send. The contract deliberately has no recovery/cancel method without authenticated failure proof. Automatic recovery of an uncertain external payout is unavailable; use the independent reconciliation procedure and runtime limitation in [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md).

## User deployment handoff

The user manages the Git-connected Vercel project. The frontend must use contract `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` and Studionet chain 61999 / RPC `https://studio.genlayer.com/api`. GitHub's latest Vercel status must be READY before deployment claims. Browser-originated wallet proof remains separate from the CLI receipts in `live-cycle.json`; do not present CLI transactions as browser-originated evidence.

The previous Studionet contract and Vercel site predate Cogent/2 and are retained in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) as historical evidence only.

## Security and verification notes

`frontend/scripts/verify-live.mjs` refreshes read-only source and accounting evidence. `scripts/live-tx.mjs` signs using encrypted local keystores and does not accept plaintext private keys on the command line. `scripts/import-encrypted-wallet.mjs <account-name>` reads a key and keystore password through masked terminal prompts and stores only encrypted JSON under the local GenLayer keystore directory. `scripts/live-deploy.mjs <account-name>` deploys the local contract and checks its finalized receipt and source hash.

The full-tree npm audit reports five high records from one dev-only `braces@3.0.3` advisory; the production-only audit is clean and the patched release list is empty. Scope and controls are recorded in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md).
