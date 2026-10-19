# Steward reviewer matrix

The matrix records evidence, not predicted scores. Live criteria remain open until backed by Studionet transactions and matching public readback.

| Category | Evidence target | Evidence available | Current status |
| --- | --- | --- | --- |
| GenLayer fit | Independent external evidence fetch and semantic mandate evaluation with scalar consensus | `contracts/cogent.py`, `docs/ARCHITECTURE.md`, Direct Mode tests | Implemented and locally tested; validator consensus unverified |
| Contract safety | Funded reservations, immutable policy, vendor consent, bonded challenges, deterministic credits | `contracts/cogent.py`, 88 passing tests, 9 killed mutants | Local checks pass |
| Engineering | Reproducible CI, source matching, accounting invariants, adversarial tests | `.github/workflows/ci.yml`, `tests/`, `scripts/`, `docs/evidence/mutations.json` | Local contract gates pass; frontend checks and hosted CI need final run |
| Frontend | Public chain reads, EIP-1193 actions, role/state gates, responsive screens | `frontend/`, Vitest tests, CI build | Source and package locks present; live wallet and production URL unverified |
| Liveness | Bounded recovery for contested or unavailable consensus | `request_review`, `expire_review`, `expire_unresolved`; Direct Mode expiry/replay tests | Locally tested; live timeout behavior unverified |
| Safety | No application-held key, admin settlement or model-directed payout | `contracts/cogent.py`, `frontend/`, security-hygiene CI | Source checked; hosted CI pending |
| Live proof | Opposite mandate outcomes, both challenge directions, failed challenge, actual withdrawals | `docs/LIVE_TEST_PLAN.md`; deployment evidence pending | Not performed |

The intended target is 5/5/5/5; no score is awarded by this repository alone. See `docs/DEPLOYMENT.md` and `docs/HANDOFF_STATUS.md` for remaining release blockers.
