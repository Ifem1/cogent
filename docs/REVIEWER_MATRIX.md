# Steward reviewer matrix

The matrix records evidence, not predicted scores.

| Category | Evidence target | Evidence available | Current status |
| --- | --- | --- | --- |
| GenLayer fit | Independent external evidence fetch and semantic mandate evaluation with scalar consensus | `contracts/cogent.py`, `docs/ARCHITECTURE.md`, Direct Mode tests and finalized Studionet primary/challenge reviews | Implemented and live tested with public fixtures; the reversal fixture was intentionally mutable |
| Contract safety | Funded reservations, immutable policy, vendor consent, bonded challenges, deterministic credits | 88 passing tests, 9 killed mutants, finalized role-correct settlements and zero-invariant-failure live audit | Core paths verified |
| Engineering | Reproducible CI, source matching, accounting invariants, adversarial tests | CI, mutation tests, source-matched deployment and refreshed `docs/evidence/live-read-audit.json` | Pass; one unpatched high dev-only `braces` advisory remains; production dependencies are clear |
| Frontend | Public chain reads, EIP-1193 actions, role/state gates, responsive screens | `frontend/`, Vitest tests, production URL | Production live and contract address verified; no Git-connected preview deployment |
| Liveness | Bounded recovery for contested or unavailable consensus | `request_review`, `expire_review`, `expire_unresolved`, Direct Mode expiry/replay tests | Locally tested; full inconclusive live recovery remains unverified |
| Safety | No application-held key, admin settlement or model-directed payout | Contract, frontend and security-hygiene CI | Source checked; hosted hygiene scan passes |
| Live proof | Opposite outcomes, both challenge directions, bond conservation and withdrawals | `docs/LIVE_VERIFICATION.md`, `docs/evidence/live-read-audit.json` | Core role-correct flows finalized; live recovery protocol and real-vendor-document review remain open |

The repository does not assign a score. See `docs/DEPLOYMENT.md` and `docs/HANDOFF_STATUS.md` for the precise remaining gates.
