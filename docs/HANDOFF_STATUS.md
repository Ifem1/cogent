# Engineering handoff status — 19 October 2026

**Repository:** [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
**Release status:** NOT READY FOR LIVE SUBMISSION. Local implementation and tests are present; deployment and live economic proof have not been performed.

## Verified locally

- GenLayer Direct Mode suite: 88 passed, including unit and VM-backed contract tests on the pinned GenVM v0.2.12 runner.
- Contract mutation suite: 9 deliberate source mutations killed by the targeted VM tests (`docs/evidence/mutations.json`).
- Frontend clean `npm ci`, lint, TypeScript check, 11 Vitest tests and Next.js production build pass.
- GitHub Actions run [39266120598](https://github.com/Ifem1/cogent/actions/runs/39266120598) passed contract, web and security-hygiene jobs on the current `main` commit `f1a3a99`.
- Production dependency audit passes with zero findings. Full-tree audit reports five high entries from one dev-only `braces@3.0.3` advisory in the Next.js ESLint chain; the advisory has no patched release, and npm's suggested breaking downgrade was not applied (`docs/evidence/frontend-audit.json`).
- The contract config selects Studionet chain 61999 at `https://studio.genlayer.com/api`.
- No real deployment, validator consensus, injected wallet transaction, GEN transfer or public website verification is recorded.

## Completion blockers

1. Funded test-wallet keys were pasted into the Codex conversation. Treat those keys as exposed: rotate them and use fresh wallets. Import fresh keys locally through the supported GenLayer wallet flow; do not paste them into chat, command arguments, project files or Git history. The local CLI invocation currently hangs before returning help or network status, so a working signer path has not been verified.
2. Successful real Studionet deployment with the deployed source hash, transaction, address and consensus/execution receipts recorded in `docs/DEPLOYMENT.md`.
3. Two opposite live mandate outcomes; a successful and an unsuccessful challenge; and real pull withdrawals with transaction evidence.
4. Production frontend deployment configured with the verified contract address and successful read/write checks against that address.
5. Reproducible source-matched evidence and final reviewer record after those live steps.
6. Resolve or explicitly accept the unpatched dev-tooling advisory before submission; do not suppress the finding or apply npm's breaking downgrade.

The public GitHub repository is the one supplied by the user: `Ifem1/cogent`. The handoff attachment named a different repository; it is not the destination for this project.
