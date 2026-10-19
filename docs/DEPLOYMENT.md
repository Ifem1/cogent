# Canonical deployment record

**Status: DEPLOYED TO STUDIONET; CORE LIVE SETTLEMENT AND CHALLENGE FLOWS VERIFIED.** The source-matched contract and production frontend are public. Finalized live receipts and current state are documented in [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md).

- Repository: [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
- Contract source commit: `2b0f06912f6e225af209ce2efffcc89294bfd199`
- Contract source SHA-256: `6ad15f02bab30fcf6910e8099090d310ee1b3cb8138939c3c7f8bc8622b14a61`
- Network: GenLayer Studionet, chain 61999; RPC `https://studio.genlayer.com/api`
- Contract: `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93`
- Deployment transaction: `0xe5fc6564d85aded41b4234709ca9f22f0a6b564ce31be725775a44fdef6c8887`; `FINALIZED`, `MAJORITY_AGREE`, five validator votes agree, GenVM execution `SUCCESS`.
- Production frontend: [`https://frontend-olive-one-18.vercel.app`](https://frontend-olive-one-18.vercel.app)
- Vercel deployment [`DmMQrzU1dpCVxBMhtafeZ6rRLnkg`](https://vercel.com/ifem1s-projects/frontend/DmMQrzU1dpCVxBMhtafeZ6rRLnkg): READY, production; HTTP 200 and served bundles contain the configured contract address.
- Contract source was validated with GenVM and Direct Mode before deployment. Local and deployed source hashes match. The Vercel project has no Git connection; production was uploaded from the reviewed frontend directory.

## Live proof

The current readback records 3 mandates and 5 proposals with zero accounting invariant failures. The role-correct mandate demonstrates a compliant release with a losing principal challenge and a noncompliant refusal with a losing vendor challenge. A separate controlled fixture test demonstrates a compliant primary result overturned after the public page was changed; the principal bond was returned and withdrawn. The first mandate was mistakenly owned by the deployer and is identified as diagnostic only. See [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) and [`evidence/live-read-audit.json`](evidence/live-read-audit.json).

## Remaining release gates

The core live settlement and challenge flows are verified. Full recovery behavior for inconclusive reviews and evaluation against a real vendor document remain untested. The demo uses a controlled vendor wallet. The full-tree npm audit reports five high records for an unpatched dev-only `braces@3.0.3` advisory; the production dependency audit is clean. Decide whether these documented limits meet the submission rubric before claiming submission readiness.

`frontend/scripts/verify-live.mjs` refreshes source and accounting readback. `scripts/live-tx.mjs` performs authorized local signing using encrypted keystores and does not read plaintext keys from the repository or command line.
