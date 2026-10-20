# Engineering handoff status — 20 October 2026

**Status: Cogent/2 is deployed and source-verified on Studionet; funded live challenge and withdrawal tests passed; local frontend reads the live contract.** The user handles Vercel deployment.

The local and deployed contract source SHA-256 is `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`. Contract `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` on chain 61999 was deployed by finalized transaction `0x3ec5bda2617f3cf20366d608e5e2f8139ce51842b060a5b1af1194ca665c5fdc`, with five agreeing validators. See [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json).

The live test finalized a challenged compliant release and a challenged amount-mismatch refusal. Both challenge outcomes were upheld by the second review. Vendor and principal withdrawals were confirmed after exact balance increases; final credits and locked bonds are zero. Receipts and complete snapshots are in [`evidence/live-cycle.json`](evidence/live-cycle.json); the canonical read audit reports zero invariant failures in [`evidence/live-read-audit.json`](evidence/live-read-audit.json).

The local frontend on port 3002 renders live proposal state and both review manifests. The remaining release evidence is a browser-originated wallet flow on the user's Vercel deployment, with browser transaction receipts, observed withdrawal balances, explicit withdrawal confirmations and final canonical readback. The CLI live cycle must not be presented as proof of the browser flow. See [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`REVIEW_REMEDIATION.md`](REVIEW_REMEDIATION.md) for the handoff.

Failed or stalled external GEN transfer recovery is not verified and has no safe contract-level recovery method in this release. The credit remains pending and duplicate withdrawals are blocked until beneficiary confirmation, but operators must not confirm without observing the exact incoming balance. See [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md).

The previously documented development-only dependency advisory remains in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md).
