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

## Live verification still required

Use Studionet chain 61999 and save transaction receipts, deployed source hash, final contract accounting, withdrawal parent receipt and before/after recipient balance evidence. The live plan in `docs/LIVE_TEST_PLAN.md` describes historic tests and must be extended to the `cogent/2` terms schema and pending-withdrawal acknowledgement. Do not infer live consensus or an outbound transfer from a mocked model response, a Direct Mode transfer hook, a transaction hash alone, or a successful local build.

## Coverage map

The checked-in unit and Direct Mode suites cover role and vendor signatures; immutable funded mandates; purchase and cumulative vendor limits; source and URL restrictions; vendor acceptance; duplicate offer replay; independent leader/validator scalar outputs; provisional decisions and both challenge directions; failed challenge bonds; invalid payable credits; review expiry and bounded recovery; closed mandate refunds; exact-once withdrawals; randomized accounting invariants; and terminal replay protection.

Mutation testing weakens selected role, source, cap, bond, replay and recovery rules and requires the targeted test to fail. The generated records are retained in `docs/evidence/mutations.json`.
