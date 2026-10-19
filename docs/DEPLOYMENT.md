# Canonical deployment record

**Status: DEPLOYED TO STUDIONET; LIVE SUBMISSION PROOF INCOMPLETE.** The source-matched contract and production frontend are public. See [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) for transaction-level evidence and the remaining on-chain blockers.

- Repository: [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
- Contract source commit: `2b0f06912f6e225af209ce2efffcc89294bfd199`
- Contract source SHA-256: `6ad15f02bab30fcf6910e8099090d310ee1b3cb8138939c3c7f8bc8622b14a61`
- Network: GenLayer Studionet, chain 61999
- RPC: `https://studio.genlayer.com/api`
- Contract: `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93`
- Deployment transaction: `0xe5fc6564d85aded41b4234709ca9f22f0a6b564ce31be725775a44fdef6c8887`
- Deployment status: `FINALIZED`, consensus `MAJORITY_AGREE`, five validator votes agree, GenVM execution `SUCCESS`
- Local/deployed source hash comparison: PASS; both SHA-256 values above match
- Production frontend: [`https://frontend-olive-one-18.vercel.app`](https://frontend-olive-one-18.vercel.app)
- Vercel deployment: [`DmMQrzU1dpCVxBMhtafeZ6rRLnkg`](https://vercel.com/ifem1s-projects/frontend/DmMQrzU1dpCVxBMhtafeZ6rRLnkg), `READY`, production
- Frontend verification: HTTP 200; served JavaScript includes the contract address above; remote Next.js production build passed
- Frontend production variable: `NEXT_PUBLIC_COGENT_CONTRACT` points at the deployed contract

The deployment source was validated with GenVM lint/type checks and Direct Mode before deployment. The production site was built locally and again by Vercel. No Git repository is connected to the Vercel project; this production deployment was uploaded from the local, reviewed frontend directory.

## Remaining release gate

The canonical mandate funded by the designated principal has a source review transaction whose leader successfully returned `COMPLIANT`, but Studionet remains in `COMMITTING` with zero validator votes. Its review window expired; the contract's `expire_review` recovery transaction is also pending. Do not infer an on-chain verdict or settlement from either hash. Role-correct live challenge outcomes, withdrawals, and settlement readback remain unverified. The application is deployed, but Cogent is not submission-ready until [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) records those results from finalized transactions.

Use `frontend/scripts/verify-live.mjs` to compare the deployed source and check exact-wei accounting. Its report is read-only; it is not transaction execution proof. Use `scripts/live-tx.mjs` for authorized local signing where payable GEN is required; it prompts for an encrypted keystore password and never reads a plaintext key from the repository or command line.
