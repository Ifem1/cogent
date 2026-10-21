# Engineering handoff status — 21 October 2026

**Status: Cogent/2 is deployed and source-verified on Studionet; the fresh funded live cycle, semantic policy challenge, successful withdrawals, and requested new-user mandate smoke check are complete.** The user manages Vercel deployment.

The deployed contract is `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` on Studionet chain 61999. Its local and deployed source SHA-256 is `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`; deployment transaction `0x3ec5bda2617f3cf20366d608e5e2f8139ce51842b060a5b1af1194ca665c5fdc` finalized with five agreeing validator votes. See [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json).

The fresh role-separated live cycle is recorded in [`evidence/live-cycle.json`](evidence/live-cycle.json). It includes the compliant release, amount-cap refusal, and the semantic policy violation where amount, vendor, reference, and product bindings were valid but monthly renewal violated the frozen one-time policy. The challenge was upheld. The cycle's read audit reports zero invariant failures and zero locked bonds; the principal has 250,000,000,000,000 wei of owed credit from the final challenge, not yet withdrawn. See [`evidence/live-read-audit.json`](evidence/live-read-audit.json).

The browser smoke check created and verified a new one-wei mandate from the connected wallet; it intentionally stopped there, as requested. It did not exercise proposal, challenge, settlement, or withdrawal through the browser. The GitHub commit adding the adjacent Copy wallet control passed CI. The user handles Vercel deployment.

Failed or stalled external GEN transfer recovery is not proven. A regression verifies that an uncertain payout remains owed and cannot be emitted twice, while [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md) documents independent reconciliation and the runtime limitation: the contract has no authenticated terminal-failure proof or callback, so an unresolved entitlement can remain pending indefinitely. This is a documented runtime limitation, not a demonstrated recovery path.
