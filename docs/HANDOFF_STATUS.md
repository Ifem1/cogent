# Engineering handoff status — 19 October 2026

**Repository:** [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
**Release status:** NOT READY FOR LIVE SUBMISSION. The source-matched contract and production frontend are deployed, but role-correct end-to-end settlement remains blocked by pending Studionet consensus.

## Verified

- GenLayer Direct Mode suite: 88 passed, including unit and VM-backed contract tests on the pinned GenVM v0.2.12 runner.
- Contract mutation suite: 9 deliberate source mutations killed by targeted VM tests (`docs/evidence/mutations.json`).
- Frontend lint, TypeScript, 11 Vitest tests and Next.js production build pass with the deployed contract address configured.
- GitHub Actions run [39268459378](https://github.com/Ifem1/cogent/actions/runs/39268459378) passed contract, web and security-hygiene jobs on commit `e24e3092723c1867590c850dc242ee802d37e578`.
- Production dependency audit passes with zero findings. Full-tree audit reports five high entries from one dev-only `braces@3.0.3` advisory in the Next.js ESLint chain; the advisory has no patched release, and npm's suggested breaking downgrade was not applied (`docs/evidence/frontend-audit.json`).
- Studionet deployment finalized with `MAJORITY_AGREE`, five agreeing validators, and successful GenVM execution. Deployed source SHA-256 matches the audited source.
- Vercel production site is live at [`https://frontend-olive-one-18.vercel.app`](https://frontend-olive-one-18.vercel.app), returns HTTP 200, and its served bundles contain the deployed contract address.
- Two independent HTTPS fetches of the pinned compliant fixture matched the local fixture bytes.
- Read-only on-chain audit currently reports zero accounting invariant failures (`docs/evidence/live-read-audit.json`).

## Remaining blockers

1. The first test mandate was accidentally funded by the deployer wallet, so it did not use the separate principal role. Its two source classifications were observed, but its role-mismatched challenge and pending challenge state do not count as submission proof.
2. A fresh 0.10 GEN mandate was funded by the designated principal. Its compliant proposal was accepted by the vendor and the primary review request finalized. The `observe_review` transaction `0x141a5188ddc4a9e23c12e4d77429f80e7e8b0f539bd9694395e4d7afe29bd8cd` has a successful leader execution that returned `COMPLIANT`, but remains at `COMMITTING` with zero validator votes; the review window has expired. The explicit `expire_review` recovery transaction `0xa6891a4e0aefcd55c59ddf372311db2536d6ae482a32be4781c31e8cb529e095` is still `PENDING` with no validator votes.
3. Correct-role compliant and noncompliant final settlement, both challenge directions, bond conservation after settlement, and vendor/principal withdrawals are not proven yet. Do not claim submission readiness until finalized receipts and durable contract readback exist for these actions.
4. The Vercel project has no connected Git repository, so preview-branch environment configuration is unavailable. Production was deployed directly from the reviewed local frontend and uses the verified contract address.
5. The unpatched high dev-only `braces` advisory remains documented. Production dependencies are clean; do not suppress the finding or apply npm's breaking downgrade.

The four wallets were explicitly supplied as funded throwaway test wallets. Their account names and addresses are recorded in `docs/LIVE_VERIFICATION.md`; private keys are not stored in the project. Treat those keys as disposable and never reuse them for personal funds.
