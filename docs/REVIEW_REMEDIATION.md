# Reviewer feedback remediation

The current checkout is the `cogent/2` contract source. Its deployed Studionet contract source hash is verified against this checkout. The previous contract and Vercel site documented in `LIVE_VERIFICATION.md` predate these changes and remain historical evidence only. The user manages the Git-connected Vercel project; verify the latest GitHub commit is ready before browser testing.

Current local and deployed contract SHA-256: `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`. Contract `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6` is on Studionet chain 61999. [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json) records the finalized receipt and exact source-hash match. [`evidence/live-cycle.json`](evidence/live-cycle.json) records the earlier compliant and purchase-binding cases plus a fresh one-time-policy violation case: amount, vendor, reference, product and source all bind, but monthly renewal violates the frozen policy. Primary and challenge manifests, validator votes, finalized transaction IDs and escrow/bond balances are retained there.

## Corrected behavior

- Every validator independently retrieves the full vendor document. Bodies above 16 KiB are rejected; no prefix is silently truncated. Duplicate JSON keys and unknown schemas are rejected.
- Offers use `cogent.offer.v1` JSON with exactly `schema`, `reference`, `vendor_address`, `amount_wei`, `product`, and `commercial_terms`. The contract binds every purchase field before asking for policy review. Determinate results require up to eight pairs of exact source quotations.
- The public review manifest records the exact source SHA-256, canonical bound-terms SHA-256, binding result, classification and supporting quotations. Validator output must equal the leader output, including both hashes and all quotations. A same-label result from different source bytes is disagreement.
- A challenge is accepted only when a complete review attempt fits before mandate expiry plus grace. Its bounded 80-minute review period provides three 20-minute attempts separated by two 10-minute retry gaps. An unresolved challenge preserves the previous consensus-backed decision, returns the bond and records `UNADJUDICATED_BOND_RETURNED`.
- Withdrawals create one pending external EOA payout and retain the credit/liability; a second request is blocked until independently reconciled acknowledgement. A Direct Mode regression models an unresolved transfer and proves one emission, retained entitlement, and no resend. GenLayer's failed-child/no-auto-return statement applies to internal IC messages, not this external EVM payout. The exact reconciliation procedure and production boundary are in [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md). No authenticated terminal-failure proof or automatic recovery is available, so uncertain payouts remain locked.
- The interface and policy copy distinguish authorization from vendor identity, domain ownership, and service delivery.

## Checks run for this checkout

Run `python -m pytest tests -q -p no:cacheprovider` from the repository root: 98 tests pass, including Direct Mode cases for mismatched amount/vendor/product, oversized and duplicate-key sources, changed-page fingerprints, technical challenge recovery, challenge timing, and stalled-withdrawal duplicate protection. The mutation suite killed all 13 selected mutants. Contract validation (22 methods), schema generation, GenVM lint, and frontend typecheck/lint/tests/build pass. GenVM's separate Pyright typecheck remains unverified because it reports unresolved `genlayer` imports in this Windows cache configuration.

Frontend checks are `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from `frontend/`. Historical counts in older handoff documents do not describe this checkout.

## Remaining evidence and runtime limitation

The requested new-user browser smoke check is complete: one one-wei mandate was created and verified using the connected wallet. It was intentionally limited to mandate creation. A full browser-originated lifecycle through proposal, challenge, settlement and withdrawal remains additional evidence only if a reviewer requires those stages to be demonstrated from the production browser UI; the CLI live cycle does not substitute for that proof.

Repository tests, deployment source verification, live adversarial amount binding, live frozen-policy violation and challenge adjudication, successful withdrawal accounting, and canonical read audit are completed. Failed or stalled external payout recovery is not proven: the contract has no authenticated terminal-failure proof/callback and safely retains the entitlement to prevent duplicate payment. This uncertainty and the independent reconciliation procedure are documented in [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md). A genuine recovery proof requires runtime support or a reviewed protocol-level design; a local retry test cannot establish it.

