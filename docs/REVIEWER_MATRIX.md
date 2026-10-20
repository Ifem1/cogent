# Reviewer evidence matrix

This matrix describes the current `cogent/2` source and its Studionet deployment. Historical transactions for the previous release are labeled separately in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md).

| Review area | Current implementation and evidence | Status |
| --- | --- | --- |
| GenLayer fit | Independent bounded source retrieval, semantic review, exact source/terms fingerprints and supporting quotations; Direct Mode coverage and current live manifests in [`evidence/live-cycle.json`](evidence/live-cycle.json) | Implemented and live exercised for compliant and purchase-binding refusal cases |
| Contract safety | Immutable funded mandate, reservations, vendor consent, exact purchase caps, challenge bonds and deterministic settlement; 97 tests and 13 selected mutants killed | Local tests pass; current live challenged settlement evidence published |
| Source equivalence | Deployment receipt compares exact local and on-chain contract source SHA-256 in [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json) | Verified on Studionet |
| Challenge fairness | Complete review window required before accepting a challenge; inconclusive challenge returns the bond and preserves the prior consensus-backed result. Direct tests cover timing and technical recovery; current live cycle includes both challenge directions | Implemented and tested; unresolved technical fallback is Direct Mode tested |
| Purchase authenticity | Structured `cogent.offer.v1` binds reference, vendor, amount, product and terms. Direct adversarial tests cover mismatched fields; current live cycle proves a one-wei amount mismatch is refused | Implemented and adversarially tested |
| Financial accounting | Current live audit records zero locked bonds, owed credits, refused payable value and invariant errors | Verified after successful withdrawals |
| Withdrawal failure recovery | Pending credits and liabilities persist; duplicate requests are blocked until explicit beneficiary confirmation. Successful transfers were balance-checked live. Failed/stalled child recovery has no safe on-chain recovery path and has not been tested; see [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md) | Disclosed residual risk; not verified |
| Frontend | Local frontend renders the live deployment; typecheck, lint, 11 tests and production build pass | Local checks pass; browser-originated wallet flow through deployed Vercel remains outstanding |
| Operations and security | No application-held keys or admin settlement; authorization is distinct from vendor identity and service delivery. Development-only dependency advisory is retained | Documented |

The repository does not assign a score. The user manages Vercel deployment. Acceptance still requires the browser-originated lifecycle and a clear acknowledgement of the outgoing-transfer failure limitation.
