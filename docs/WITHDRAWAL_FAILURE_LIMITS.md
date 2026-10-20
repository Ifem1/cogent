# Outgoing GEN transfer failure limits

## What the contract guarantees

`withdraw()` leaves the beneficiary's credit and `owed_total` intact, records the same amount in `pending_withdrawals`, and emits one external GEN transfer. A second withdrawal by that beneficiary is rejected while an amount is pending. `confirm_withdrawal()` clears the credit and liability only when the beneficiary calls it and the recorded pending amount still matches the credit. The function cannot verify receipt itself: confirmation is an explicit beneficiary attestation.

This ordering protects the contract's accounting record when a transfer is delayed or uncertain. It does **not** provide an on-chain recovery path. If the transfer child fails, is not activated, or its result cannot be established, the contract exposes no method to cancel the pending transfer, restore send eligibility, or prove that value returned. The entitlement remains recorded, but it can remain locked pending manual investigation. Do not call `confirm_withdrawal()` unless the recipient has independently observed the exact expected balance increase.

## Runtime evidence and its limits

GenLayer's [Value Transfers documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers) says value is deducted from the sender and held in the message until the child activates, and that failed child value is not automatically returned. Its [Messages documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/messages) describes child execution as asynchronous. The [transaction querying guide](https://docs.genlayer.com/developers/decentralized-applications/querying-a-transaction) exposes triggered child transaction IDs and debug traces for investigation. Those facilities aid diagnosis; they do not give this contract an authenticated callback or a safe recovery operation.

The Direct Mode test `test_withdraw_keeps_credit_pending_and_emits_once_until_confirmation` verifies one transfer message, retained pending credit and global liability, duplicate-send rejection, explicit acknowledgement, and cleanup after acknowledgement. The test does not simulate a failed child and does not establish the production runtime's failure handling.

The live Studionet cycle demonstrates successful transfers only. Vendor withdrawal `0x783d84444bb61a8d4e447925db1733643b15eaacfc1ade319704f741df977e7e` increased the vendor balance by exactly `5250000000000000` wei before confirmation `0x74ba3fb138345f05befe998ab1bceed2dcc54609c8a8e4086cab723d6067b364`. Principal withdrawal `0x26c81ccf9d8afca77de96c63cff546b8153f4167505fc4f19b383b661ef00968` increased the principal balance by exactly `250000000000000` wei before confirmation `0xa674c01d0130a7bf8a50556d7da9fc50a6eebae79f00a31fa63af0c2a28c5e03`. Per-account before/after values and final zero liability are in [`evidence/live-cycle.json`](evidence/live-cycle.json) and [`evidence/live-read-audit.json`](evidence/live-read-audit.json). Neither transaction tests failed-child recovery.

## Operational rule and acceptance status

For an uncertain withdrawal, preserve the pending record. Inspect the parent transaction, its triggered child ID, the child receipt/trace, and the recipient's canonical balance. Confirm only after the exact transfer is visible. If the child failed or the balance cannot establish receipt, stop: Cogent currently has no safe contract-level recovery action. Do not resend from the contract or manually alter the accounting. Recovery requires a separately reviewed protocol/runtime procedure or a future contract release with a trusted reconciliation design.

Accordingly, successful EOA withdrawal is verified; failed or stalled child-transfer recovery is **not** verified. This limitation is disclosed for reviewers and remains a residual risk for production use.
