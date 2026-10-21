# Cogent/2 live verification

## Current deployment

- Network: GenLayer Studionet, chain 61999.
- Contract: `0x3dC948C81F48E882d59573a9f57464F16B9f2fB6`.
- Source SHA-256: `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`, matching local and deployed bytes.
- Deployment receipt and validator votes: [`evidence/cogent-2-deployment.json`](evidence/cogent-2-deployment.json).
- Latest canonical audit: [`evidence/live-read-audit.json`](evidence/live-read-audit.json), with final mandate/proposal counts, zero invariant errors, zero pending credits and zero locked bonds.

## Completed funded live cycle

The role-separated principal, agent and vendor test accounts ran three offers with a 0.005 GEN mandate cap:

1. A correctly bound one-time offer received a COMPLIANT primary decision. The principal challenged it, the independent challenge review upheld the decision, and the proposal was released.
2. An offer with the correct reference but an amount one wei above the cap received a NON_COMPLIANT decision. The vendor challenged it, the independent challenge review upheld the refusal, and no purchase amount was paid.
3. A new offer with the correct reference, vendor, product, and exact capped amount had `bindings_valid: true`, but its `Renews monthly.` commercial term violated the principal's frozen one-time-only policy. Validators returned NON_COMPLIANT in both primary and challenge rounds; the vendor's challenge was upheld as a refusal.

All exact 5% bonds were adjudicated. Earlier vendor and principal withdrawals were confirmed after independent reconciliation. The fresh policy challenge forfeited 250,000,000,000,000 wei to the principal; that new credit remains owed and awaits withdrawal. Full transactions, validator votes, offer fingerprints, manifests and final accounting are in [`evidence/live-cycle.json`](evidence/live-cycle.json). This is CLI-originated evidence; it is not browser-wallet proof. The unresolved transfer regression and runtime-limited reconciliation procedure are in [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md).

The earlier scenarios in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) are retained as historical records for the previous contract. They do not describe this deployment.

## Reproducing the funded CLI cycle

Use funded throwaway accounts only. Import each role into an encrypted local GenLayer keystore with `scripts/import-encrypted-wallet.mjs <account-name>`, then run `scripts/run-live-cycle.mjs <contract-address>`. The scripts request sensitive values through masked terminal input and do not take private keys or passwords as command-line arguments. The cycle is resumable with `--resume`; challenge reviews respect the contract's retry interval and may take several minutes. Review the emitted transaction receipts and readback before drawing conclusions.

Run `node frontend/scripts/verify-live.mjs` with `COGENT_CONTRACT` set to the address above to refresh read-only source-hash, accounting, and invariant evidence.

## Remaining acceptance evidence

1. Confirm the Git-connected Vercel project has built the latest GitHub commit with the verified contract address and Studionet chain/RPC settings.
2. Run the full lifecycle through the deployed browser UI with separate principal, agent, and vendor wallets: funding, proposal, vendor acceptance, review, challenge, settlement, withdrawal and final readback. Preserve browser-originated receipts and recipient balances before/after transfer.
3. Treat the external transfer's uncertain terminal outcome conservatively: preserve its pending entitlement and do not resend unless authenticated terminal-failure evidence becomes available. Current runtime has no contract-callable proof/callback for recovery; see [`WITHDRAWAL_FAILURE_LIMITS.md`](WITHDRAWAL_FAILURE_LIMITS.md).

The development-only `braces` advisory remains documented in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md).
