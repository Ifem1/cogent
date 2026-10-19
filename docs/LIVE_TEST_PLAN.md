# Live Studionet proof protocol and execution record

The protocol below was run on the canonical contract after GenVM checks and Direct Mode. All transaction hashes and final state are in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md); the canonical readback is [`evidence/live-read-audit.json`](evidence/live-read-audit.json).

## Completed scenarios

- Role-correct compliant payment and noncompliant refusal.
- Both challenge directions with exact 5% bonds; a disclosed controlled-source reversal.
- Real OpenAI business/API data-use policy excerpt at a public immutable commit URL. The official live host returned `SOURCE_UNAVAILABLE` in GenLayer; this was separately settled as INCONCLUSIVE, while the attributed excerpt review reached COMPLIANT in primary and challenge phases.
- Review window expiry recorded `CONTESTED`, 10-minute retry spacing, three unavailable-source attempts, and `expire_unresolved` release. A second direct-source proposal confirmed the same bounded behavior.
- Withdrawals and final exact-wei bond/accounting conservation.

## Reproduction parameters

The recovery test used a 0.10 GEN mandate with 0.001 GEN purchase/vendor cap, fixed principal, agent and vendor addresses, and a source URL deliberately returning unavailable content. `expire_review` is eligible only after the 20-minute review window; each retry requires 10 minutes from the last attempt; `expire_unresolved` is eligible after three attempts. The full transaction receipts and timestamps are recorded in `LIVE_VERIFICATION.md`.

The real vendor source fixture contains an attributed excerpt of 25 words and the original official source URL; it does not present the controlled demo vendor wallet as an OpenAI account.

## Submission gate

The final deployment, source match, local and hosted checks, live scenarios, terminal states, withdrawal, and canonical read audit have passed. The dev-only unpatched `braces` advisory was accepted in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md), with production dependencies clean and the full-tree finding still visible.
