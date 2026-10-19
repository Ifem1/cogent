# Test plan and current results

## Executed locally

- `GENVM_VERSION=v0.2.12 python -m pytest -q`: **88 passed** (unit helpers and GenLayer Direct Mode VM contract tests).
- `genvm-lint check contracts/cogent.py`: **3 lint checks passed**.
- `genvm-lint validate contracts/cogent.py`: passed; 20 contract methods, 7 views and 13 writes.
- `genvm-lint schema contracts/cogent.py`: passed.
- `genvm-lint typecheck contracts/cogent.py`: passed, no type errors.
- `python scripts/mutation_test.py`: all **9** selected contract mutants were killed by targeted tests. Results are in `docs/evidence/mutations.json`.

The withdrawal test checks the actual GenLayer VM transfer message and accounting. It does not claim a live external GEN transfer. Nondeterministic review tests use controlled external fetch/model responses within Direct Mode; they establish contract behavior, not live validator consensus.

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

Use Studionet chain 61999 and save transaction receipts, deployed source hash, final contract accounting and actual withdrawal receipts. The live plan in `docs/LIVE_TEST_PLAN.md` covers compliant and noncompliant purchases, both challenge directions, a failed challenge, expiry/recovery and pull withdrawals. Do not infer live consensus or an outbound transfer from a mocked model response, a Direct Mode transfer hook, a transaction hash alone, or a successful local build.

## Coverage map

The checked-in unit and Direct Mode suites cover role and vendor signatures; immutable funded mandates; purchase and cumulative vendor limits; source and URL restrictions; vendor acceptance; duplicate offer replay; independent leader/validator scalar outputs; provisional decisions and both challenge directions; failed challenge bonds; invalid payable credits; review expiry and bounded recovery; closed mandate refunds; exact-once withdrawals; randomized accounting invariants; and terminal replay protection.

Mutation testing weakens selected role, source, cap, bond, replay and recovery rules and requires the targeted test to fail. The generated records are retained in `docs/evidence/mutations.json`.
