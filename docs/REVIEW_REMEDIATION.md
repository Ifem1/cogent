# Reviewer feedback remediation

The current checkout is the `cogent/2` contract source. The prior Studionet contract and Vercel site documented in `DEPLOYMENT.md` and `LIVE_VERIFICATION.md` predate these changes. Those records are historical evidence only; they do not prove the behavior or hash of this source. The contract must be redeployed and the user will deploy the updated Vercel frontend.

Current local contract SHA-256: `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`. The deployed Cogent/2 hash is pending. After deployment, `frontend/scripts/verify-live.mjs` compares the exact local source bytes with `getContractCode()` and exits nonzero on mismatch.

## Corrected behavior

- Every validator independently retrieves the full vendor document. Bodies above 16 KiB are rejected; no prefix is silently truncated. Duplicate JSON keys and unknown schemas are rejected.
- Offers use `cogent.offer.v1` JSON with exactly `schema`, `reference`, `vendor_address`, `amount_wei`, `product`, and `commercial_terms`. The contract binds every purchase field before asking for policy review. Determinate results require up to eight pairs of exact source quotations.
- The public review manifest records the exact source SHA-256, canonical bound-terms SHA-256, binding result, classification and supporting quotations. Validator output must equal the leader output, including both hashes and all quotations. A same-label result from different source bytes is disagreement.
- A challenge is accepted only when a complete review attempt fits before mandate expiry plus grace. Its bounded 80-minute review period provides three 20-minute attempts separated by two 10-minute retry gaps. An unresolved challenge preserves the previous consensus-backed decision, returns the bond and records `UNADJUDICATED_BOND_RETURNED`.
- Withdrawals create one pending transfer and retain the credit/liability. The beneficiary checks their external wallet balance and explicitly submits `confirm_withdrawal`. The contract blocks duplicate transfer requests while pending. GenLayer’s SDK exposes triggered IDs for internal messages; it does not give this contract a trusted callback or status query proving that an external EOA transfer arrived. If a child fails or remains uncertain, the credit stays recorded and the UI does not retry it automatically. GenLayer documents that failed child-transfer value is not automatically returned; this remains a disclosed runtime limitation requiring manual investigation before any future recovery design.
- The interface and policy copy distinguish authorization from vendor identity, domain ownership, and service delivery.

## Checks run for this checkout

Run `python -m pytest tests -q -p no:cacheprovider` from the repository root: 97 tests pass, including Direct Mode cases for mismatched amount/vendor/product, oversized and duplicate-key sources, changed-page fingerprints, technical challenge recovery, challenge timing, and pending-withdrawal duplicate protection. The mutation suite killed all 13 selected mutants, including four new adversarial cases. Contract validation (22 methods), schema generation, GenVM lint, and frontend typecheck/lint/tests/build pass. GenVM's separate Pyright typecheck remains unverified because it reports unresolved `genlayer` imports in this Windows cache configuration.

Frontend checks are `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from `frontend/`. Historical counts in older handoff documents do not describe this checkout.

## Required before acceptance

1. Run all repository tests and lint/type checks against this exact checkout.
2. Deploy `contracts/cogent.py` to Studionet with a fresh transaction. Save the finalized deployment receipt and compare the deployed source bytes to this checkout with SHA-256.
3. Configure the new contract address in the frontend, then deploy the frontend to Vercel yourself.
4. Complete a browser-originated flow through that deployed UI using separate principal, agent and vendor accounts: fund, propose, vendor-accept, review, challenge/review, settle, record the withdrawal parent receipt and recipient wallet balance before/after, then explicitly confirm it. Preserve receipts, balance evidence and canonical final readback.
5. Run the adversarial source and recovery scenarios against the deployed new contract, and publish their finalized transaction evidence. Direct Mode and the previous deployment do not satisfy this requirement.

