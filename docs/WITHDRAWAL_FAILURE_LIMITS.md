# Outgoing GEN transfer reconciliation

## State and safety invariant

`withdraw()` records one pending amount per beneficiary, keeps that amount in `credits` and `owed_total`, and emits one external GEN transfer to the beneficiary's EOA. While the amount is pending, a second `withdraw()` reverts. Only the beneficiary's `confirm_withdrawal()` clears the credit and liability. The contract has no administrator override, retry, cancel, or receipt-proof callback. This preserves the entitlement and prevents a second contract-originated send while the first outcome is uncertain.

An uncertain request must remain pending. Never reset or clear the record, and never submit another withdrawal while it is pending. This can lock an entitlement indefinitely if the network cannot establish the outcome; that is the deliberate duplicate-payment-safe failure mode. There is no permissionless or owner recovery transaction in this release.

## Correct runtime boundary

Cogent pays an EOA with `@gl.evm.contract_interface(...).emit_transfer`, which is an **external message** executed by the IC ghost on finalization. It is not an IC-to-IC asynchronous child transfer. GenLayer's [Messages guide](https://docs.genlayer.com/developers/intelligent-contracts/features/messages) and [Value Transfers guide](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers) make that distinction; the Value Transfers guide's statement that failed child value is not automatically returned describes an internal IC message and must not be applied as proof of this EOA payout's failure behavior. Studionet and Studio also do not model the real EVM/ghost layer, so their transfer behavior is not production-runtime evidence.

The contract cannot query the canonical EVM transaction receipt or authenticate an operator's claim about it. The available [GenLayer transaction guide](https://docs.genlayer.com/developers/decentralized-applications/querying-a-transaction) supports off-chain inspection of the finalized parent, triggered transaction IDs, and debug traces; those are diagnostic evidence, not an on-chain proof accepted by Cogent. A missing triggered child is not proof of failure for an external message.

## Reconciliation procedure

For each withdrawal, preserve the finalized Cogent transaction hash, beneficiary, pending amount, and a canonical pre-withdrawal EVM balance. Then reconcile independently against the Studionet RPC:

1. Read the Cogent transaction and require finalized successful execution. Record its receipt and debug trace; inspect triggered IDs if the node exposes any. Do not infer success or failure from a timeout, a missing child ID, or a user-interface message.
2. Inspect the canonical EVM execution associated with finalization. Confirm the external value operation's sender is the Cogent ghost, recipient is the beneficiary, and value equals the pending amount. Cross-check the beneficiary's EVM balance against the recorded baseline and account for intervening transactions. Preserve RPC responses and block/transaction identifiers in the evidence manifest.
3. Call `confirm_withdrawal()` only after the exact outgoing operation and receipt are independently established and the beneficiary's balance reconciles. If evidence is incomplete, contradictory, or the operation is still pending, leave the entitlement locked and escalate with the parent transaction and trace. Do not retry, confirm, or edit state.

The procedure can safely confirm an observed payment; it intentionally cannot restore a credit after a purported failure because this release has no authenticated terminal-failure proof available to contract code. Recovery after a proven failure needs a reviewed protocol-level proof/callback design or a new deployment and a separately audited migration plan. No such failure proof or callback is established by the Studionet evidence here.

## Regression and live evidence

Direct Mode regression tests assert that a single withdrawal emits one external transfer, keeps the full entitlement and liability pending, and rejects a second send. `test_stalled_outgoing_transfer_stays_owed_and_cannot_be_reemitted` models an unresolved outcome: the state remains owed and pending, with exactly one emission after a retry attempt. These tests verify Cogent's duplicate lock; they do not emulate Studionet's EVM/ghost finalization.

The successful Studionet transfer checks and transaction identifiers are recorded in [`evidence/live-cycle.json`](evidence/live-cycle.json). They verify only observed successful withdrawals. A production failed/stalled transfer and an authenticated failure recovery have not been exercised. The independently verifiable reconciliation process above is the supported operator response; automatic recovery remains a runtime limitation.
