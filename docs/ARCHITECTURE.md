# Cogent architecture and state transitions

## Design constraints

One authoritative Intelligent Contract. No off-chain indexer, signing backend, independent data oracle, administrator, ERC-20 custody, hidden model-selected payout or locally stored browser wallet private keys. External applications may use injected wallet accounts. Smart-contract verification is based on confirmed StudioNet only (chain 61999).

## Why not clone RedLine

RedLine is a continuous watcher of changing contractual rights with time-proportional vendor earnings. Cogent is an event-oriented spend-authorization system with per-proposal reservations, vendor-signed offers, semantic mandate checks and challenges. It intentionally does not monitor external offer changes after settlement or pretend to insure delivery. Its single contract avoids asynchronous watcher/treasury message failure at the cost of a simpler bounded observation window on each proposal.

## Money model

`create_mandate` places payable GEN into a mandate. Invalid payable creations are converted into withdrawable credits because returning after receiving funds is safer than relying on revert behavior. Subsequent proposals do not receive GEN; they reserve already-funded wei.

Accounting:

`funded = available + reserved + paid + refunded`

`available` may fund further proposals while open. `reserved` funds submitted but unresolved proposals. `paid` records obligations credited to vendors. `refunded` records obligations credited to the owner when a mandate closes or when a late failed reservation resolves after closure. To prevent unexpected overconsumption, per-vendor running commitments count reserved and paid amounts, and failures decrement them.

Separately, challenge bonds are funded by payable `challenge`, and valid bonds obey:

`bonds_received = bonds_locked + bonds_returned + bonds_forfeited`.

The losing challenger transfers bond credit to the counterparty, while a decision reversal returns the bond to challenger. `withdraw` is the only actual value-transfer method. It marks one transfer pending while retaining the credit and global owed balance; the beneficiary confirms after checking the external wallet balance. A pending transfer blocks another emission. Cogent cannot independently query or prove an external EOA transfer, and GenLayer does not return value automatically if a child fails. The entitlement remains recorded, but safe automatic retry is unavailable. Invalid payable challenge attempts create caller credits rather than trapping attached value.

## Proposal transitions

- `AWAITING_VENDOR`: reserved, vendor acceptance pending; issuer/vendor-independent owner can cancel unaccepted; anyone can cancel after acceptance deadline.
- `READY`: vendor accepted; anyone can open bounded review.
- `REVIEW_OPEN`: represented by `review_due>0`, not a separate string status. Prevents concurrent observations on same proposal. Observations may fail GenLayer consensus without committing; anyone expires the recorded window.
- `RETRYABLE`: review was unavailable, inconclusive, invalid or contested. Bounded retries can continue after spacing. After expiry/grace or exhausted attempts, the reservation is returned.
- `PROVISIONAL_COMPLIANT` / `PROVISIONAL_NON_COMPLIANT`: frozen validator decision. No funds moved yet; one challenge before deadline by economically adverse party.
- `CHALLENGED`: exact 5% bond locked; second independently verified review or deterministic timeout fallback.
- `RELEASED`: vendor credited allocated exact amount, and terminal.
- `REFUSED`: reservation unlocked (or credited back to closed mandate owner), and terminal.
- `CANCELLED`: terminal unaccepted offer cancellation.

## Source, consensus and AI constraints

Principal chooses up to three allowed URL prefixes. Agent provides one offer URL under those frozen prefixes, an immutable offer reference, and the specific product/service. Vendor must explicitly accept the exact on-chain proposal using its wallet. Validators fetch the complete bounded document independently and require strict `cogent.offer.v1` JSON binding the reference, vendor address, amount, product, and commercial terms. Duplicate keys, unknown schemas, and oversized sources are rejected. They evaluate ONLY the frozen principal policy and complete commercial terms. The public web page is untrusted data.

Leader and validator each fetch and prompt independently inside `run_nondet_unsafe`. Consensus checks the label, exact raw-source SHA-256, canonical bound-terms SHA-256, purchase-binding result and up to eight exact supporting quote pairs. A valid leader result without exact validator agreement cannot commit settlement or a provisional decision.

Strict labels: `COMPLIANT`, `NON_COMPLIANT`, `INCONCLUSIVE`, `SOURCE_UNAVAILABLE`, `MODEL_OUTPUT_INVALID`. Only first two permit provisional decisions. Malformed outputs never become a payout. All arithmetic is independent of the model.

## Review failure tolerance

`request_review` persists a deterministic request before `observe_review`. If non-deterministic consensus cannot decide, `observe_review` need not commit. After review deadline, anybody may call `expire_review`, generating a contested manifest and advancing the attempt count. Attempts/recovery are bounded, and `expire_unresolved` returns a reserved payment that did not receive a valid verdict. A disagreement is not equivalent to COMPLIANT.

## Challenge

Principal may challenge compliant, vendor may challenge non-compliant. Each posts exactly ceil(amount*500/10000) wei. A reversed decision makes challenger successful and returns the bond; unchanged decision forfeits bond to the counterparty. Challenges are rejected unless a complete review attempt fits before the recovery cutoff. If bounded review remains inconclusive or unavailable, the original provisional decision settles, the bond returns, and the proposal records `UNADJUDICATED_BOND_RETURNED`. This is separate from network-level GenLayer transaction appeals.

## Known intentional limits

- A principal-approved HTTPS prefix and vendor signature are not cryptographic proof that the vendor owns the domain.
- No inspection of changing vendor terms after already-authorized settlement.
- A silent agent cannot be made to submit proposals and a silent vendor cannot be made to accept; expiring offers are reclaimable.
- Strict scalar comparison may disagree among validators on ambiguous terms. The correct outcome is retry/expiry, never forced approval.
- Offers may redirect or be dynamically served; validator fetch behavior, content type limits and redirects must be empirically tested and documented.
- Single contract is enough at this scope. Cross-contract asynchronous receipts are not needed.
