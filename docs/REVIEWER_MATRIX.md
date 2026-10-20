# Steward reviewer matrix

The evidence below is from the previous source release. It remains historical and must not be used as proof for the current `cogent/2` checkout until its new contract and frontend are deployed and verified.

The matrix records evidence, not predicted scores.

| Category | Evidence target | Evidence available | Current status |
| --- | --- | --- | --- |
| GenLayer fit | Independent external evidence fetch and semantic mandate evaluation with scalar consensus | Direct Mode tests and finalized Studionet primary/challenge reviews against pinned GitHub fixtures and an attributed official vendor policy excerpt | Implemented and live tested; direct OpenAI-host fetch limitation was disclosed and safely resolved as inconclusive |
| Contract safety | Funded reservations, immutable policy, vendor consent, bonded challenges, deterministic credits | 88 passing tests, 9 killed mutants, finalized role-correct settlements and zero-invariant-failure live audit | Verified, including bounded unresolved expiry |
| Engineering | Reproducible CI, source matching, accounting invariants, adversarial tests | CI, mutation tests, source-matched deployment and refreshed live audit | Pass; dev-only `braces` advisory explicitly accepted and documented |
| Frontend | Public chain reads, EIP-1193 actions, role/state gates, responsive screens | Frontend checks, production URL, verified served contract address | Production deployed and checked; preview branches unavailable because Vercel is not Git-connected |
| Liveness | Bounded recovery for contested or unavailable consensus | Finalized `expire_review` and `expire_unresolved` transactions after three unavailable-source attempts | Live behavior verified; reservations restored and no proposals remain pending |
| Safety | No application-held key, admin settlement or model-directed payout | Contract, frontend and security-hygiene CI | Source checked; hosted hygiene scan passes |
| Live proof | Opposite outcomes, both challenge directions, bond conservation and withdrawals | `docs/LIVE_VERIFICATION.md`, `docs/evidence/live-read-audit.json` | All scenarios finalized; all credits withdrawn; audit reports zero accounting errors |

The repository does not assign a score. See `docs/DEPLOYMENT.md` and `docs/HANDOFF_STATUS.md` for the final scope and accepted risk.
