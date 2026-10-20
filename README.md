# COGENT

**Authority before execution.**

> Agents propose. Validators verify. Deterministic code pays.

Cogent is an escrow-backed spending-authority primitive for autonomous purchasing agents built for **GenLayer Studionet (chain 61999)**. A principal funds an immutable mandate, appoints a spending agent, fixes a human-readable compliance policy and allowed public offer sources, and imposes numeric budget limits. The agent proposes a specific purchase. The vendor accepts it with its own address. Independent GenLayer validators retrieve the vendor offer, check it against the frozen policy and agree on a constrained label. Only the Intelligent Contract decides whether locked funds become vendor credits or return to the mandate. A bounded challenge can trigger independent reevaluation.

**Cogent/2 is deployed and source-verified on Studionet.** Contract `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` runs on chain 61999 and matches this checkout's contract-source SHA-256, `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`. The user manages Vercel and the browser-originated acceptance flow. The previous deployment and receipts in `docs/LIVE_VERIFICATION.md` refer to older source.

## What it solves

A deterministic chain can enforce *amount ≤ spending limit*, but not reliably interpret whether a proposed supplier permits automated processing, commercial reuse, rejects model training on private customer data, or forbids recurring charges. An agent can comply with the amount while violating the owner's delegated authority. Cogent makes semantic compliance a necessary precondition of spending.

**Cogent does not insure vendor delivery or prove that an HTTPS domain belongs to the accepting address.** A signed vendor acceptance and principal-approved public source are explicit trust boundaries, not legal/vendor-identity certification.

## Why GenLayer is essential

- Frozen human-readable spending policies need semantic interpretation against current external vendor offers.
- Each validator independently fetches the exact frozen HTTPS offer URL, validates the structured offer bindings, hashes the complete bounded source, and independently classifies the complete commercial terms.
- Consensus compares the decision label, exact source and terms fingerprints, purchase bindings, and bounded supporting quotations. A matching label over different page bytes is not agreement.
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
                              ├─ determinate reversal/uphold → final payment or refusal
                              └─ unresolved technical/evidence review → original decision,
                                  returned bond, and explicit UNADJUDICATED outcome
```

All successful vendor settlements credit `owed_to(vendor)` first. Only `withdraw` moves value. No admin can move funds, change policy or approve a purchase directly.

## Frozen terms

Mandates fix: owner address, agent address, exact funded GEN, title, policy, 1–3 HTTPS source prefixes, per-purchase cap, cumulative per-vendor cap, expiry, and a bounded total count. Proposals fix: vendor address, exact value, source URL inside those prefixes, unique offer reference, and product/service. The complete source must be JSON using `cogent.offer.v1`, binding reference, vendor wallet, exact `amount_wei`, product and complete commercial terms. Duplicate JSON keys, unsupported schemas, mismatched bindings and source bodies above 16 KiB fail closed. See the [offer example](examples/cogent-offer.v1.json). **Vendor signing acceptance is an additional gate.**

Redirection, source authenticity, mutable off-chain evidence and vendor delivery remain documented limitations; see [Threat model](docs/THREAT_MODEL.md).

## Escrow invariants

For each mandate, accounting is kept with integer wei, and the following is intended to hold after every successful transition:

```text
funded = available + reserved + paid + refunded
```

`paid` and `refunded` mean credited obligations, not necessarily completed outbound transfers. Withdrawal keeps the credit and liability pending until the beneficiary checks their wallet balance and submits `confirm_withdrawal`; pending credits cannot emit a second transfer. GenLayer does not expose an on-chain callback that lets this contract prove an external EOA transfer succeeded, and a failed child transfer is not automatically refunded. A failed or uncertain transfer therefore leaves a visible pending entitlement that cannot safely be retried automatically. Valid challenge-bond accounting obeys:

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
- A challenge cannot be accepted unless at least one complete review window remains. The effective review window includes three bounded attempts and retry gaps. If no determinate second result is reached, the prior verdict settles, the bond is returned, and the manifest records `UNADJUDICATED_BOND_RETURNED`.
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
| Current Cogent/2 contract | `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` (source hash verified; see [`deployment evidence`](docs/evidence/cogent-2-deployment.json)) |
| Previous contract deployment | `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93` (older source; historical only) |
| Vercel | Git-connected and user-managed; confirm latest commit deployment before browser testing |

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for finalized deployment and live-cycle evidence, [`docs/REVIEW_REMEDIATION.md`](docs/REVIEW_REMEDIATION.md) for reviewer status, and [`docs/WITHDRAWAL_FAILURE_LIMITS.md`](docs/WITHDRAWAL_FAILURE_LIMITS.md) for the disclosed transfer-failure limitation. Browser-originated verification through the deployed Vercel UI remains outstanding. Historical transactions remain recorded in [`docs/LIVE_VERIFICATION.md`](docs/LIVE_VERIFICATION.md) and refer to the previous contract.

The web app reads final state without requiring a wallet, presents mandate/proposal IDs and status, converts GEN to wei exactly with Viem, and only offers actions permitted by current state, connected wallet role and network. Wallet writes are checked against the active Studionet account and chain and validate finalized execution. Withdrawal confirmation is an explicit beneficiary attestation after checking their external wallet balance; the contract cannot independently prove that the external payment arrived.

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

- Contract Direct Mode, frontend, deployment-hash and live-cycle evidence for Cogent/2 are recorded in [`docs/TESTING.md`](docs/TESTING.md), [`docs/evidence/cogent-2-deployment.json`](docs/evidence/cogent-2-deployment.json), and [`docs/evidence/live-cycle.json`](docs/evidence/live-cycle.json). Historic live verification is labeled separately and is not evidence for Cogent/2.
- The remaining acceptance proof is the complete browser-originated wallet flow through the user's Vercel deployment, with receipts and final readback. Vercel deployment is managed by the user.

The core contract, direct adversarial tests, source-matched Studionet deployment, challenged live scenarios, successful withdrawals and final accounting audit are verified. Do not call the submission fully evidenced until the browser-originated Vercel flow is captured; failed or stalled outgoing-transfer recovery remains an acknowledged runtime limitation.

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
