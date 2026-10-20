# Cogent threat model and verification status

This model describes the deployed Cogent/2 contract on Studionet chain 61999. Direct Mode tests establish contract behavior under controlled inputs; they do not establish live validator consensus. Current deployment and live transaction evidence is in [`DEPLOYMENT.md`](DEPLOYMENT.md), [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json), [`evidence/live-cycle.json`](evidence/live-cycle.json), and [`evidence/live-read-audit.json`](evidence/live-read-audit.json). The prior source's transactions are retained separately in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md).

| ID | Threat | Control | Verification status |
| --- | --- | --- | --- |
| T1 | Agent proposes more than the principal's cap | Deterministic per-purchase and available-budget checks | Direct adversarial tests; current live amount-over-cap offer refused |
| T2 | Agent splits purchases to exceed a vendor cap | Reservations plus cumulative per-vendor committed-value cap | Direct concurrent reservation and accounting tests |
| T3 | Agent redirects payment to itself or principal | Independent vendor address and vendor-signed acceptance | Direct role/signature tests; related-account collusion remains possible |
| T4 | Offer URL uses an unrelated host or path | Principal-frozen HTTPS prefixes, normalized path checks and reference binding | Direct URL adversarial tests |
| T5 | Vendor changes the offer after acceptance | Leader and validators commit to complete bounded source bytes and terms; mismatch fails consensus | Direct changed-version mismatch test; external pages remain mutable between review rounds |
| T6 | Vendor page contains prompt injection | Evidence treated as untrusted; constrained result schema and exact quotations | No dedicated live prompt-injection scenario is recorded |
| T7 | Ambiguous policy is treated as approval | Only a determinate COMPLIANT result can authorize provisional settlement | Direct uncertain-result tests; current live compliant and mismatched-amount cases |
| T8 | Leader and validators use different page versions | Consensus compares decision, source and terms fingerprints, bindings and quotations | Direct same-label/different-source disagreement test; not separately forced in live consensus |
| T9 | Validator disagreement leaves funds stuck | Review state and permissionless bounded retry/expiry path | Direct recovery tests; current live deployment exercised successful challenged reviews, not an unresolved live validator dispute |
| T10 | Wrong challenge bond or challenge replay | Exact 5% bond and one challenge per proposal; invalid payable value is credited | Direct tests; current live cycle exercised both challenge directions with exact bonds |
| T11 | A valid challenge cannot finish before expiry and unfairly loses its bond | Challenge accepted only when a full review window fits; inconclusive result preserves prior decision and returns bond | Direct boundary/timeout tests; current live challenges were adjudicated successfully |
| T12 | Reservation or mandate-close accounting releases funds twice | Reservations are tracked independently; terminal recovery is one-shot | Direct late-close and replay tests; current live audit reports zero reservations |
| T13 | Beneficiary emits duplicate withdrawals | One pending withdrawal per beneficiary; credit and liability remain until acknowledgement | Direct single-emission/duplicate-lock test and two successful live balance-confirmed withdrawals |
| T14 | Offer reference is replayed | `(mandate, vendor, reference)` uniqueness constraint | Direct duplicate proposal test |
| T15 | Outgoing GEN child transfer fails or stalls | Pending entitlement remains recorded; duplicate send is blocked pending acknowledgement | Successful transfers verified live. Failed/stalled child recovery is untested and has no safe contract-level recovery path; see [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md) |
| T16 | Invalid payable call traps attached GEN | Rejected payable input becomes a withdrawable credit | Direct test; current Cogent/2 live test did not exercise this path |
| T17 | Public contract state contains secrets | No secret storage; source URLs require public HTTPS without userinfo/query | Direct URI validation tests; users must never publish private vendor material |
| T18 | Redirect or local-address fetch bypasses source boundary | URL and host checks reject known invalid targets; runtime redirect handling remains a limitation | Direct URL tests; network-specific redirect behavior not independently probed on Studionet |
| T19 | Admin changes policy or forces settlement | No mutable owner/admin settlement method; mandate terms are frozen | ABI/static review and Direct Mode authorization tests |
| T20 | Deployment evidence refers to different source | Exact local and deployed source bytes compared with SHA-256 | Verified on Studionet; deployment receipt and hash are published |

## Security boundaries

Cogent verifies published offer terms against a frozen spending mandate. It does not prove domain ownership, vendor legal identity, service quality or future delivery. A vendor wallet can collude with an agent; a majority of validators can still be deceived by consistently misleading evidence. Bounded source size, exact purchase fields and supporting quotations reduce these risks but cannot eliminate semantic or real-world uncertainty.

## Financial invariants

For each mandate: `funded = available + reserved + paid + refunded`.

For valid challenge bonds: `received = locked + returned + forfeited`.

All money is represented in integer wei. A transaction hash or parent finality alone does not prove that an asynchronous outgoing transfer reached the recipient.
