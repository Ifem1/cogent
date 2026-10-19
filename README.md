# COGENT

**Authority before execution.**

> Agents propose. Validators verify. Deterministic code pays.

Cogent is an escrow-backed spending-authority primitive for autonomous purchasing agents built for **GenLayer Studionet (chain 61999)**. A principal funds an immutable mandate, appoints a spending agent, fixes a human-readable compliance policy and allowed public offer sources, and imposes numeric budget limits. The agent proposes a specific purchase. The vendor accepts it with its own address. Independent GenLayer validators retrieve the vendor offer, check it against the frozen policy and agree on a constrained label. Only the Intelligent Contract decides whether locked funds become vendor credits or return to the mandate. A bounded challenge can trigger independent reevaluation.

**This is source code plus a full integration handoff, not a claim of a completed live deployment.** No address or transaction proof is fabricated. Read [Delivery status](#delivery-status) before using the site.

## What it solves

A deterministic chain can enforce *amount ≤ spending limit*, but not reliably interpret whether a proposed supplier permits automated processing, commercial reuse, rejects model training on private customer data, or forbids recurring charges. An agent can comply with the amount while violating the owner's delegated authority. Cogent makes semantic compliance a necessary precondition of spending.

**Cogent does not insure vendor delivery or prove that an HTTPS domain belongs to the accepting address.** A signed vendor acceptance and principal-approved public source are explicit trust boundaries, not legal/vendor-identity certification.

## Why GenLayer is essential

- Frozen human-readable spending policies need semantic interpretation against current external vendor offers.
- Each validator independently fetches the exact frozen HTTPS offer URL, validates that the quoted reference is present, and independently classifies the same policy.
- Consensus compares *only* a single stable label: `COMPLIANT`, `NON_COMPLIANT`, `INCONCLUSIVE`, `SOURCE_UNAVAILABLE` or `MODEL_OUTPUT_INVALID`.
- Model-generated prose cannot affect money, introduce new sources, invent a vendor address or select a payout.
- A failed consensus need not strand funds. The deterministic `request_review` opens an observable window; if `observe_review` never reaches consensus, anyone may call `expire_review` and consume a bounded retry.

## Actors

| Actor | Authority |
| --- | --- |
| Principal | Pays the mandate, fixes policy, receives residual funds, can challenge a provisional COMPLIANT decision |
| Agent | Can propose vendor purchases within frozen numeric limits; cannot withdraw, modify policy or choose a settlement outcome |
| Vendor | Must sign acceptance, may challenge a provisional NON_COMPLIANT decision, may withdraw only credited amounts |
| Any wallet | May request/observe/recover reviews, finalize eligible proposals, close expired mandates and inspect public records |

## Lifecycle

```text
create_mandate (exact value) → funded mandate
  └─ propose (agent; reserves value) → AWAITING_VENDOR
       ├─ cancel_unaccepted / expired acceptance → reservation returned
       └─ accept_offer (vendor signature) → READY
             └─ request_review (deterministic) → pending observation window
                   ├─ observe_review (independent web + LLM consensus)
                   │    ├─ COMPLIANT → PROVISIONAL_COMPLIANT
                   │    ├─ NON_COMPLIANT → PROVISIONAL_NON_COMPLIANT
                   │    └─ unavailable/inconclusive/invalid → RETRYABLE
                   └─ expire_review (no agreed observation) → RETRYABLE
              PROVISIONAL → challenge window
                   ├─ finalize (unchallenged after deadline)
                   └─ challenge (exact 5% by economically opposing party)
                         → CHALLENGED → request/observe second review
                              ├─ resolved decision → final payment or refusal
                              └─ recovery timeout → original provisional decision
                                          with unsuccessful challenger bond forfeiture
```

All successful vendor settlements credit `owed_to(vendor)` first. Only `withdraw` moves value. No admin can move funds, change policy or approve a purchase directly.

## Frozen terms

Mandates fix: owner address, agent address, exact funded GEN, title, policy, 1–3 HTTPS source prefixes, per-purchase cap, cumulative per-vendor cap, expiry, and a bounded total count. Proposals fix: vendor address, exact value, source URL inside those prefixes and unique 8–120-character offer reference. The public offer body must contain the exact reference. **Vendor signing acceptance is an additional gate.**

Redirection, source authenticity, mutable off-chain evidence and vendor delivery remain documented limitations; see [Threat model](docs/THREAT_MODEL.md).

## Escrow invariants

For each mandate, accounting is kept with integer wei, and the following is intended to hold after every successful transition:

```text
funded = available + reserved + paid + refunded
```

`paid` and `refunded` mean credited obligations, not necessarily completed outbound transfers. Valid challenge-bond accounting obeys:

```text
bonds_received = bonds_locked + bonds_returned + bonds_forfeited
```

Rejected payable calls create withdrawable credits and are tracked separately. Vendor cap accounting counts outstanding reservations plus approved spend; a refused or cancelled reservation releases the vendor allowance. After a mandate closes, a subsequently released reservation is credited to the principal rather than re-opening the mandate.

## Failure and recovery

- Model cannot interpret → `INCONCLUSIVE`, never paid.
- Evidence unavailable or missing offer reference → no approval.
- Validator disagreement means no nondeterministic state mutation. The previously stored review request can expire deterministically.
- Requests are spaced by retry intervals, attempted only a bounded number of times.
- An unsettled accepted offer can be released to the principal's available mandate balance at recovery deadline.
- A challenged decision that cannot be re-reviewed before final grace falls back to the **previous consensus-backed provisional verdict**, and the challenger loses the bond. This trade-off prioritizes challenge liveness but should be explicitly reviewed.
- An expired mandate can refund only unreserved value; outstanding reservations remain protected until their own terminal resolution.

## Deployment and app

| Setting | Value |
| --- | --- |
| Network | GenLayer Studionet |
| Chain ID | 61999 |
| RPC | `https://studio.genlayer.com/api` |
| Contract | [`contracts/cogent.py`](contracts/cogent.py) |
| SDK (frontend) | `genlayer-js@1.1.8` |
| Wallet | External injected EIP-1193, no application-managed keys |
| Frontend | Next.js App Router, TypeScript, custom responsive design |
| Deployed contract address | `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93` (Studionet) |
| Live Vercel URL | https://frontend-olive-one-18.vercel.app |

The source-matched Studionet deployment and production frontend are live. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) and [`docs/LIVE_VERIFICATION.md`](docs/LIVE_VERIFICATION.md) for finalized receipts, current readback and remaining release gates.

The web app reads final state without requiring a wallet, presents mandate/proposal IDs and status, converts GEN to wei exactly with Viem, and only offers actions permitted by current state, connected wallet role and network. Wallet writes are checked against the active Studionet account and chain, await finalization and validate the contract execution result before reporting success. No mock records and no backend authority.

## Local commands

```bash
python3 -m pip install -r requirements-dev.txt
python3 -m pytest tests/unit -q
python3 -m pytest tests/direct -q     # real GenLayer Direct Mode; requires SDK installation
python3 -m py_compile contracts/cogent.py

# GenVM linter v0.11.0 (verify CLI syntax on the installed release):
genvm-lint check contracts/cogent.py
genvm-lint validate contracts/cogent.py
genvm-lint schema contracts/cogent.py
genvm-lint typecheck contracts/cogent.py

cd frontend
npm ci
cp .env.example .env.local
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev
```

Both the root GenLayer CLI and frontend dependencies are pinned with npm lockfiles. CI uses `npm ci` so it installs the committed versions.

## Tests and evidence

- **88 contract tests passed** locally with GenLayer Direct Mode and the pinned GenVM runner; all nine recorded contract mutants were killed.
- GenVM lint, validation, schema inspection and typechecking pass. Frontend checks are recorded in [`docs/TESTING.md`](docs/TESTING.md).
- There are no invented transaction hashes, wallet balances, source-matched chain deployments, or captured end-to-end receipts.

The final Codex handoff requires the critical happy and adversarial Direct Mode flows, two roles and real live wallet executions, immutable public offer fixtures, withdrawn credits, accounting conservation, and a verified deployment report before calling Cogent submission-ready.

See [Testing](docs/TESTING.md), [Reviewer matrix](docs/REVIEWER_MATRIX.md) and [Deployment](docs/DEPLOYMENT.md).

## Files

```text
contracts/cogent.py       authoritative Intelligent Contract
tests/unit/              pure helper tests (offline)
tests/direct/            actual contract VM execution tests
frontend/                complete Next.js UI with wallet, writes, reads and views
frontend/scripts/        read-only on-chain accounting auditor
scripts/                 deployment workflow/preflight
examples/                illustrative public evidence fixtures (NOT live proof)
docs/                    product, architecture, threat model, test and release contracts
.github/workflows/       CI gates
```

## Principles

**Agents propose. Validators verify. Deterministic code pays.**

Cogent is original work, not a copy of RedLine or Redeem. Its economic model is delegated spending authorization and reserved purchase commitments; it does not stream vendor revenue or guarantee future service delivery.

## License

MIT. See [LICENSE](LICENSE).
