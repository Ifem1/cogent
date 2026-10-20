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

The funded role-separated live cycle used principal, agent and vendor test accounts and is recorded in [`evidence/live-cycle.json`](evidence/live-cycle.json). It finalized two proposals:

- Proposal 1 bound a compliant one-time offer. The principal challenged the compliant result; a second independent review upheld it and the proposal was released.
- Proposal 2 used the correct reference but an amount one wei above the cap. It was refused; the vendor challenged the refusal and a second independent review upheld the refusal.

The exact 5% challenge bonds were adjudicated. Vendor and principal withdrawals were confirmed only after each account's observed balance increased by the exact pending amount. The final read-only audit in [`evidence/live-read-audit.json`](evidence/live-read-audit.json) records two mandates, two proposals, zero invariant failures, zero locked bonds, zero pending credits and zero refused payable value. The local frontend at `http://127.0.0.1:3002` loads the live proposal state and manifests. This CLI-run cycle does not count as browser-originated wallet proof.

Both observed withdrawals succeeded; failed-child recovery was not tested. The contract retains credit and blocks duplicate requests while a withdrawal is pending, but offers no safe on-chain recovery if the child fails or remains uncertain. See [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md) for runtime references, exact successful transaction evidence, and the operational rule.

## User deployment handoff

The user handles Vercel deployment. Set the frontend's public contract address to `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` and use Studionet chain 61999 / RPC `https://studio.genlayer.com/api`. After publishing, the remaining reviewer evidence is a browser-originated workflow on that deployment: connect the separate wallets, perform the lifecycle actions, capture transaction receipts and withdrawal balance before/after, then confirm withdrawals and record canonical final state. Do not present the existing CLI transactions as browser-originated evidence.

The previous Studionet contract and Vercel site predate Cogent/2 and are retained in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) as historical evidence only.

## Security and verification notes

`frontend/scripts/verify-live.mjs` refreshes read-only source and accounting evidence. `scripts/live-tx.mjs` signs using encrypted local keystores and does not accept plaintext private keys on the command line. `scripts/import-encrypted-wallet.mjs <account-name>` reads a key and keystore password through masked terminal prompts and stores only encrypted JSON under the local GenLayer keystore directory. `scripts/live-deploy.mjs <account-name>` deploys the local contract and checks its finalized receipt and source hash.

The full-tree npm audit reports five high records from one dev-only `braces@3.0.3` advisory; the production-only audit is clean and the patched release list is empty. Scope and controls are recorded in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md).
