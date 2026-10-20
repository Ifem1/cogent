# Cogent adversarial threat model

This is a pre-deployment threat model. Entries marked **NEEDS LIVE PROOF** are not yet evidenced on chain.

| ID | Attack | Designed defence | Required verification |
| --- | --- | --- | --- |
| T1 | Agent proposes purchase above owner cap | Mandatory per-purchase and available budget checks | Direct sender/payment tests |
| T2 | Agent splits payments to same vendor | Cumulative per-vendor committed cap | Competing proposal and failed reservation tests |
| T3 | Agent redirects vendor payment to own address | Agent and principal prohibited as direct vendor; vendor address signs proposal | Sender tests, malicious vendor alias/related account limitation |
| T4 | Vendor offer URL is on spoofed or unrelated host | Principal freezes prefixes; exact URL prefix and ref checks | URL adversarial tests |
| T5 | Vendor swaps offer after acceptance | Validators independently hash complete bounded bytes and terms; exact source and terms fingerprints must agree | Changed-version validator mismatch test; page content is still mutable between primary and challenge reviews |
| T6 | Vendor page contains a prompt injection | Distinct untrusted block, constrained label, validator re-evaluation | Live malicious evidence test **NEEDS LIVE PROOF** |
| T7 | Ambiguous policy triggers paid approval | Only COMPLIANT permits provisional authorization; inconclusive returns reservation | Direct and live scenarios |
| T8 | Leader returns one decision but validator sees another page or evidence | Exact label, source hash, terms hash, bindings and quote-pair consensus; undetermined cannot pay | Different-page same-label validator disagreement test |
| T9 | Validator disagreement stalls funds forever | Review request recorded before consensus; permissionless `expire_review`, bounded retries | Live contested request expiry **NEEDS LIVE PROOF** |
| T10 | Challenge replay or wrong payable amount | Exact 5% bond and one challenge per proposal, invalid payable amount credited back | Direct bond tests |
| T11 | Principal challenges correct approval to block payment | Bounded unresolved challenge preserves the provisional decision and returns the bond; no merits finding is inferred | Timeout and challenge review recovery tests |
| T12 | Funds counted twice or stuck after mandate close | Reservation accounting, post-close failure credits principal | Late reservation close tests |
| T13 | Vendor double withdrawal | One pending transfer at a time; credit persists until beneficiary acknowledgement | Duplicate request, pending accounting and single emission test; live balance evidence remains required |
| T14 | Replay offer reference | `(mandate, vendor, ref)` immutable unique key | Duplicate proposal tests |
| T15 | External transfer fails or remains uncertain | Pending entitlement remains recorded; no automatic duplicate send; beneficiary checks wallet balance before acknowledgement | Direct transfer-hook and pending test; failed transfer cannot be independently reconciled by contract, disclosed in release notes |
| T16 | Failed payable creation traps GEN | Invalid input becomes withdrawable credit | Live invalid payable case **NEEDS LIVE PROOF** |
| T17 | Contract reads leak secrets | Public URLs must be plain HTTPS without query/userinfo; no confidential content | Strict input tests |
| T18 | Source contains redirects or points to local addresses | Origin/path allow-list excludes obvious local host targets; redirect behavior remains an explicit limitation | Network-specific redirect probe **NEEDS LIVE PROOF** |
| T19 | Unlocked admin changes policy | No admin mutator, mandates immutable | ABI search + adversarial tests |
| T20 | Fake on-chain evidence | Publish exact Cogent/2 deployment hash, finalized receipts and canonical state only after redeployment | **NEEDS LIVE PROOF** for current checkout |

## Security boundaries

Cogent verifies **published terms against a frozen mandate**, not delivery or legal enforceability. Vendor wallet acceptance does not establish domain ownership. An agent could collude with a vendor, or a vendor could serve different pages to different validators; contested reviews fail closed but cannot prevent a majority being consistently deceived. Bounded web source and prompt sizes reduce but do not eliminate malicious data risks.

## Financial invariants

For every mandate: `funded = available + reserved + paid + refunded`.
For valid bonds: `received = locked + returned + forfeited`.
Never use JavaScript floating point to handle wei. A successful transaction hash alone is not a success certificate.
