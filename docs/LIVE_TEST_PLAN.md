# Live Studionet proof protocol

The completed scenarios below document the previous source release. They are historical and do not prove the `cogent/2` contract or updated UI. Use a fresh deployment and preserve new receipts and readbacks before acceptance.

## Completed scenarios

- Role-correct compliant payment and noncompliant refusal.
- Both challenge directions with exact 5% bonds; a disclosed controlled-source reversal.
- Real OpenAI business/API data-use policy excerpt at a public immutable commit URL. The official live host returned `SOURCE_UNAVAILABLE` in GenLayer; this was separately settled as INCONCLUSIVE, while the attributed excerpt review reached COMPLIANT in primary and challenge phases.
- Review window expiry recorded `CONTESTED`, 10-minute retry spacing, three unavailable-source attempts, and `expire_unresolved` release. A second direct-source proposal confirmed the same bounded behavior.
- Withdrawals and final exact-wei bond/accounting conservation.

## Reproduction parameters

The recovery test used a 0.10 GEN mandate with 0.001 GEN purchase/vendor cap, fixed principal, agent and vendor addresses, and a source URL deliberately returning unavailable content. `expire_review` is eligible only after the 20-minute review window; each retry requires 10 minutes from the last attempt; `expire_unresolved` is eligible after three attempts. The full transaction receipts and timestamps are recorded in `LIVE_VERIFICATION.md`.

The real vendor source fixture contains an attributed excerpt of 25 words and the original official source URL; it does not present the controlled demo vendor wallet as an OpenAI account.

## Cogent/2 verification still required

1. Deploy the exact `contracts/cogent.py` source and record its SHA-256 and finalized deployment receipt. Run `frontend/scripts/verify-live.mjs` against the new address to compare local and deployed source bytes and check accounting.
2. Through the browser UI, use distinct wallets to create/fund a mandate, submit a proposal with the complete `cogent.offer.v1` document (see `examples/cogent-offer.v1.json`), accept as the vendor, open review and verify the manifest fingerprints and quote pairs.
3. Test a same-label/different-source validator mismatch, then separately test a challenge reversal and an unavailable/contested challenge. Confirm an unadjudicated challenge preserves the previous verdict, returns the exact bond, and settles only once.
4. Trigger a vendor credit withdrawal. Record the finalized parent receipt and the recipient wallet balance before and after. Confirm the withdrawal only after the recipient verifies receipt; assert the pending credit clears and a second withdrawal cannot emit a duplicate transfer.
5. Publish a final readback with all reservation/bond/credit invariants, the fresh deployment hash, relevant transaction receipts and the source-to-deployment comparison. The user deploys the Vercel frontend after setting the new contract address.

The development-only `braces` advisory remains documented in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md); retain it in any submission.
