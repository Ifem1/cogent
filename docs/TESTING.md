# Test plan and current results

## Current checkout

- `python -m pytest tests -q -p no:cacheprovider`: **97 passed**, including GenLayer Direct Mode contract execution.
- `python -m py_compile contracts/cogent.py`: passed.
- GenVM lint passed (3 checks); `genvm-lint validate` passed (22 methods, 8 views, 14 writes) and schema generation passed against the pinned `v0.2.12` runner. The default `genvm-lint check` wrapper still reports a cache permission error after its lint phase in this Windows environment.
- `genvm-lint typecheck contracts/cogent.py`: not verified. This Windows environment's Pyright integration reports that its own `genlayer` imports are unresolved, even though contract validation and Direct Mode execution pass.
- Frontend `npm run typecheck`, `npm run lint`, `npm run test` (**11 passed**) and `npm run build`: passed.
- `python scripts/mutation_test.py`: all **13** selected mutants were killed, including the new amount-binding, source-fingerprint, unresolved-challenge-refund and duplicate-withdrawal cases. Results are in `docs/evidence/mutations.json`.

The withdrawal test checks the actual GenLayer VM transfer message, retained pending credit, duplicate-send lock and explicit acknowledgement. It does not claim a live external GEN transfer or a failed child recovery. Nondeterministic review tests use controlled external fetch/model responses within Direct Mode; they establish contract behavior, not live validator consensus.

## Frontend checks

Run from `frontend/` using the committed lockfile:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Frontend tests and build are local reproducibility gates. They do not prove wallet interaction or production deployment.

## Current live evidence and remaining checks

The current contract is deployed on Studionet chain 61999 at `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6`. The exact deployed/local contract source hash match is recorded in `docs/evidence/cogent-2-deployment.json`. Funded live challenge and withdrawal receipts, balance before/after and terminal accounting are recorded in `docs/evidence/live-cycle.json`; the canonical read audit is `docs/evidence/live-read-audit.json`.

The live cycle used CLI signing. It does not prove the browser-wallet flow, which remains to be run through the user's Vercel deployment. Successful withdrawals were confirmed after exact balance increases. A failed or stalled child transfer has not been tested and has no safe contract-level recovery method; see `docs/WITHDRAWAL_FAILURE_LIMITS.md`. Do not infer live consensus or a successful outbound transfer from a mocked model response, a Direct Mode transfer hook, a transaction hash alone, or a successful local build.

## Coverage map

The checked-in unit and Direct Mode suites cover role and vendor signatures; immutable funded mandates; purchase and cumulative vendor limits; source and URL restrictions; vendor acceptance; duplicate offer replay; independent leader/validator scalar outputs; provisional decisions and both challenge directions; failed challenge bonds; invalid payable credits; review expiry and bounded recovery; closed mandate refunds; exact-once withdrawals; randomized accounting invariants; and terminal replay protection.

Mutation testing weakens selected role, source, cap, bond, replay and recovery rules and requires the targeted test to fail. The generated records are retained in `docs/evidence/mutations.json`.
