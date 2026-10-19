# Canonical deployment record

**Status: COGENT COMPLETE — VERIFIED AND SUBMISSION READY.** The source-matched Studionet contract and production frontend are deployed. The happy path, both challenge directions, controlled reversal, real vendor document review, bounded unavailable-source recovery and withdrawals have finalized receipts. Current canonical readback reports zero accounting invariant failures. The dev-only dependency advisory is explicitly accepted and documented.

- Repository: [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
- Contract source commit: `2b0f06912f6e225af209ce2efffcc89294bfd199`
- Contract source SHA-256: `6ad15f02bab30fcf6910e8099090d310ee1b3cb8138939c3c7f8bc8622b14a61`
- GenLayer Studionet, chain 61999; RPC `https://studio.genlayer.com/api`
- Contract: `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93`
- Deployment transaction: `0xe5fc6564d85aded41b4234709ca9f22f0a6b564ce31be725775a44fdef6c8887`, `FINALIZED`, `MAJORITY_AGREE`, five agreeing validators, GenVM `SUCCESS`.
- Production frontend: [`https://frontend-olive-one-18.vercel.app`](https://frontend-olive-one-18.vercel.app), HTTP 200; Vercel deployment [`DmMQrzU1dpCVxBMhtafeZ6rRLnkg`](https://vercel.com/ifem1s-projects/frontend/DmMQrzU1dpCVxBMhtafeZ6rRLnkg) is READY and serves the verified contract address.

## Verification

The canonical read audit records 6 mandates and 8 terminal proposals, zero reservation, zero locked bond, zero owed credits and zero invariant failures. Role-correct live transactions prove compliant release, noncompliant refusal, both challenge directions, a deliberately disclosed source reversal, an official vendor data-use policy evaluation, and unavailable-source timeout/retry/expiry. Transaction receipts and the complete state are in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) and [`evidence/live-read-audit.json`](evidence/live-read-audit.json).

GenLayer Direct Mode (88 tests), mutation checks (9 mutants), frontend lint/typecheck/tests/build and hosted CI all pass. The GitHub Actions run for the immutable OpenAI excerpt fixture passed. The final docs commit runs CI again.

## Accepted dependency risk

The full-tree npm audit still reports five high records from one dev-only `braces@3.0.3` advisory; the production-only audit is clean. The patched release list is empty. This risk is accepted for this submission, not suppressed, and recorded with scope and controls in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md).

The production frontend was deployed from reviewed local source because the Vercel project has no Git connection. Preview-branch deployment is therefore unavailable; the production site and contract address were verified directly.

`frontend/scripts/verify-live.mjs` refreshes read-only source and accounting evidence. `scripts/live-tx.mjs` signs using encrypted local keystores and does not accept plaintext private keys on the command line.
