# Steward reviewer matrix

The matrix records evidence, not predicted scores. Live criteria remain open until backed by Studionet transactions and matching public readback.

| Category | Evidence target | Evidence available | Current status |
| --- | --- | --- | --- |
| GenLayer fit | Independent external evidence fetch and semantic mandate evaluation with scalar consensus | `contracts/cogent.py`, `docs/ARCHITECTURE.md`, Direct Mode tests | Implemented and locally tested; validator consensus unverified |
| Contract safety | Funded reservations, immutable policy, vendor consent, bonded challenges, deterministic credits | `contracts/cogent.py`, 88 passing tests, 9 killed mutants | Local checks pass |
| Engineering | Reproducible CI, source matching, accounting invariants, adversarial tests | `.github/workflows/ci.yml`, `tests/`, `scripts/`, `docs/evidence/mutations.json`, `docs/evidence/frontend-audit.json` | All three hosted CI jobs pass; production dependency audit is clear; one unpatched high dev-tooling advisory and source-matched chain verification remain open |
| Frontend | Public chain reads, EIP-1193 actions, role/state gates, responsive screens | `frontend/`, Vitest tests, production URL | Production is live; HTTP 200, configured address present in client bundles; wallet settlement remains open |
| Liveness | Bounded recovery for contested or unavailable consensus | `request_review`, `expire_review`, `expire_unresolved`; Direct Mode expiry/replay tests | Locally tested; live timeout behavior unverified |
| Safety | No application-held key, admin settlement or model-directed payout | `contracts/cogent.py`, `frontend/`, security-hygiene CI | Source checked; hosted hygiene scan passes |
| Live proof | Opposite mandate outcomes, both challenge directions, failed challenge, actual withdrawals | `docs/LIVE_VERIFICATION.md`, `docs/evidence/live-read-audit.json` | Primary outcomes observed on a diagnostic mandate; role-correct mandate review is pending Studionet validators; challenges and withdrawals remain unverified |

The intended target is 5/5/5/5; no score is awarded by this repository alone. See `docs/DEPLOYMENT.md` and `docs/HANDOFF_STATUS.md` for remaining release blockers.
