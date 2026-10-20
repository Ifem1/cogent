# Reviewer feedback remediation

The current checkout is the `cogent/2` contract source. Its deployed Studionet contract source hash is verified against this checkout. The previous contract and Vercel site documented in `LIVE_VERIFICATION.md` predate these changes and remain historical evidence only. The user will deploy the updated frontend to Vercel.

Current local and deployed contract SHA-256: `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`. Contract `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` is on Studionet chain 61999. [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json) records the finalized receipt and exact source-hash match. [`evidence/live-cycle.json`](evidence/live-cycle.json) records a finalized compliant challenge and release, a correct-reference/one-wei-amount-mismatch refusal with a successful challenge, exact balance-confirmed withdrawals and zero remaining credits. The final read audit has zero invariant failures.

## Corrected behavior

- Every validator independently retrieves the full vendor document. Bodies above 16 KiB are rejected; no prefix is silently truncated. Duplicate JSON keys and unknown schemas are rejected.
- Offers use `cogent.offer.v1` JSON with exactly `schema`, `reference`, `vendor_address`, `amount_wei`, `product`, and `commercial_terms`. The contract binds every purchase field before asking for policy review. Determinate results require up to eight pairs of exact source quotations.
- The public review manifest records the exact source SHA-256, canonical bound-terms SHA-256, binding result, classification and supporting quotations. Validator output must equal the leader output, including both hashes and all quotations. A same-label result from different source bytes is disagreement.
- A challenge is accepted only when a complete review attempt fits before mandate expiry plus grace. Its bounded 80-minute review period provides three 20-minute attempts separated by two 10-minute retry gaps. An unresolved challenge preserves the previous consensus-backed decision, returns the bond and records `UNADJUDICATED_BOND_RETURNED`.
- Withdrawals create one pending transfer and retain the credit/liability. The beneficiary checks their external wallet balance and explicitly submits `confirm_withdrawal`. The contract blocks duplicate transfer requests while pending. Successful live EOA transfers were confirmed against exact balance changes. Failed or stalled child-transfer recovery has **not** been verified: the contract has no authenticated transfer callback or safe on-chain recovery method, and GenLayer documents that failed child-transfer value is not automatically returned. The evidence, operator rule and residual risk are stated in [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md); preserve a pending credit and do not confirm unless the recipient proves receipt.
- The interface and policy copy distinguish authorization from vendor identity, domain ownership, and service delivery.

## Checks run for this checkout

Run `python -m pytest tests -q -p no:cacheprovider` from the repository root: 97 tests pass, including Direct Mode cases for mismatched amount/vendor/product, oversized and duplicate-key sources, changed-page fingerprints, technical challenge recovery, challenge timing, and pending-withdrawal duplicate protection. The mutation suite killed all 13 selected mutants, including four new adversarial cases. Contract validation (22 methods), schema generation, GenVM lint, and frontend typecheck/lint/tests/build pass. GenVM's separate Pyright typecheck remains unverified because it reports unresolved `genlayer` imports in this Windows cache configuration.

Frontend checks are `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from `frontend/`. Historical counts in older handoff documents do not describe this checkout.

## Remaining before reviewer acceptance

1. The user deploys the frontend to Vercel with the verified Studionet contract address.
2. Complete the browser-originated wallet flow through that deployed UI using separate principal, agent and vendor accounts. Capture browser transaction receipts, review/challenge outcomes, withdrawal recipient balances before/after, explicit confirmations and canonical final readback. The funded CLI cycle proves the contract's live behavior but does not substitute for browser-originated evidence.

Repository tests, deployment source verification, live adversarial amount binding, challenge recovery, withdrawal accounting, canonical read audit and local frontend read rendering have been completed. The user asked to handle Vercel deployment.

