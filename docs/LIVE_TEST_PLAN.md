# Live Studionet proof protocol (UNEXECUTED)

All steps must be run on the final canonical contract address after the source passed GenVM checks and Direct Mode. Use three externally controlled CLI wallets already available to the operator: principal A, agent B and vendor C. No keys belong in the repository, dotenv, frontend or evidence files. Capture actual transaction hashes, `FINALIZED`, consensus Accepted, actual successful GenVM execution and durable contract state for each action. A hash alone does not equal success.

## Source fixtures

Use `examples/offer-compliant.json` and `examples/offer-noncompliant.json` only as source templates. Publish each on a *public immutable commit URL* within the frozen allowed source prefix. The offer reference must match the JSON body. Verify public HTTPS response through two independent fetches before issuing a mandate. For actual reviewer relevance, also execute one scenario with a real public vendor document rather than only made-for-demo text, while carefully disclosing that the demo vendor addresses are controlled test wallets.

## Mandate

Fund a 0.10 GEN mandate. Per purchase cap 0.02 GEN, cumulative vendor cap 0.08 GEN, 2-day expiry. Frozen policy includes: commercial use permitted, autonomous processing permitted, customer data not used for model training, and no recurring subscription. Fix the owner and agent addresses and GitHub raw immutable source prefix. Vendor wallet C must sign acceptance.

## Scenario A: COMPLIANT / paid

1. A `create_mandate` payable 0.10 GEN, verify initial accounting.
2. B `propose` 0.02 GEN against immutable compliant offer fixture and vendor C address.
3. C `accept_offer`.
4. Anyone `request_review`, `observe_review` and inspect `get_proposal` PRIMARY manifest, provisional `COMPLIANT`. Do not mistake `FINISHED_WITH_RETURN` for a compliant classification; confirm state.
5. Allow normal challenge deadline to pass; `finalize`.
6. Assert terminal RELEASED, vendor C has `owed_to(C)` increased by 0.02 GEN, mandate `paid=0.02 GEN`, reserved falls by 0.02 GEN.
7. C withdraws and prove finalized transfer and contract books.

## Scenario B: NON_COMPLIANT / refused

1. B proposes 0.02 GEN against immutable fixture which permits vendor model training or recurring charges; C accepts.
2. `request_review`, `observe_review` and inspect `NON_COMPLIANT` PRIMARY result.
3. Allow challenge deadline to pass and finalize refusal.
4. Assert `REFUSED`, reservation returns to spendable mandate availability (or principal refund if mandate closed), vendor receives zero and cap is restored.

## Challenged A/B

Repeat both scenarios with two separate proposal IDs. Principal challenges provisional COMPLIANT with exact 5% bond; source remains compliant so bond forfeits to vendor after second review. Vendor challenges provisional NON_COMPLIANT with 5% bond; source remains non-compliant so bond forfeits to principal. Also run an adversarial reversing fixture where a genuinely different source verdict flips the decision and the challenger bond is returned. **Never manufacture a reversed on-chain verdict by replacing the contract result or local arithmetic.** A mutable page changing between reviews is a valid deliberately controlled scenario but must be documented as such.

## Recovery proof

Create an offer whose page is unavailable or consistently produces inconclusive evidence; prove no provisional COMPLIANT state appears. Let a deterministic review request expire, record CONTESTED and retry spacing, then prove `expire_unresolved` releases reserved funds after exhausted attempts or expiry/grace. Test unauthorized challenge, exact bond mismatch, offer ref replay and cumulative vendor cap.

## Accounting

`funded = available + reserved + paid + refunded` per mandate. Check `bonds_received = bonds_locked + bonds_returned + bonds_forfeited`. Use `frontend/scripts/verify-live.mjs` on the canonical contract and save outputs. Actual readback including source SHA, deployed contract tx, GUI wallet action receipts and transfer result goes into `docs/LIVE_VERIFICATION.md` only after verified.

## Submission stop gate

Do not claim production readiness if any validation fails, any expected challenge/settlement is unproven, Vercel reads another contract address, or the last source change occurred after deployment.
