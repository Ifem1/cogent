# Studionet live verification

**Snapshot: 19 October 2026, 18:14 UTC.** Three mandates and five proposals are finalized and readable from the source-matched Cogent deployment. The durable readback is [`evidence/live-read-audit.json`](evidence/live-read-audit.json). The read audit reports zero accounting invariant failures.

## Deployment

- Repository: [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
- Contract source commit: `2b0f06912f6e225af209ce2efffcc89294bfd199`
- Local and deployed SHA-256: `6ad15f02bab30fcf6910e8099090d310ee1b3cb8138939c3c7f8bc8622b14a61`
- GenLayer Studionet, chain 61999; RPC `https://studio.genlayer.com/api`
- Contract: `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93`
- Deployment transaction: `0xe5fc6564d85aded41b4234709ca9f22f0a6b564ce31be725775a44fdef6c8887`, `FINALIZED`, `MAJORITY_AGREE`, five agreeing validators, GenVM `SUCCESS`.
- Production: [`https://frontend-olive-one-18.vercel.app`](https://frontend-olive-one-18.vercel.app), HTTP 200; Vercel deployment [`DmMQrzU1dpCVxBMhtafeZ6rRLnkg`](https://vercel.com/ifem1s-projects/frontend/DmMQrzU1dpCVxBMhtafeZ6rRLnkg) is READY. Served bundles contain the configured contract address.

## Test accounts

| Role | Alias | Address |
| --- | --- | --- |
| Deployer | `cogent-deployer` | `0xd6423ae82a975d55c6ceac222827a727325e0459` |
| Principal | `cogent-principal` | `0x39680bd423437c0eaa18493629652821ec672c61` |
| Agent | `cogent-agent` | `0xa49c51d759790116d451f256654dd9f0549d341f` |
| Vendor/challenger | `cogent-vendor` | `0x77e2edbb43277bf772e207c517dde731935ffba5` |

These were user-provided throwaway test wallets. No private keys are stored in the repository.

## Live outcomes

Mandate 1 is diagnostic: it was created by the deployer, so the deployer became its principal. It is excluded from the role-correct proof. The separate principal’s wrong-owner challenge was rejected and refunded. Its proposals nevertheless settled: proposal 1 RELEASED after a compliant primary result; proposal 2 REFUSED after noncompliant reviews. All credits from this diagnostic mandate were withdrawn.

Mandate 2 was created by the designated principal with the designated agent and vendor, 0.10 GEN funding, 0.02 GEN per-purchase cap, 0.08 GEN vendor cap, frozen policy and a commit-pinned source prefix. Proposal 3 was compliant. The principal challenged it with the exact 0.001 GEN bond; the second review remained COMPLIANT, proposal 3 RELEASED, and the bond was forfeited to the vendor. Proposal 4 was noncompliant. The vendor’s exact 0.001 GEN challenge was upheld by the second review, proposal 4 became REFUSED, its reservation was restored and the bond was forfeited to the principal. A first too-early review request for proposal 4 failed the contract’s retry interval and did not mutate state; the correctly spaced retry finalized.

Mandate 3 was created by the designated principal for a controlled source-reversal test. Proposal 5’s initial public fixture was compliant during primary review. After the primary result finalized, the public fixture was deliberately changed to include prohibited model training and monthly automatic renewal, committed as `47de018`, and fetched twice over HTTPS to verify it matched the local bytes. The principal submitted an exact 0.001 GEN challenge. The challenge review finalized NON_COMPLIANT, proposal 5 became REFUSED, and the principal’s bond was returned. This is a disclosed mutable-source demonstration, not an immutable-fixture test.

Key proposal 5 receipts:

| Action | Transaction | Result |
| --- | --- | --- |
| Create mandate 3 | `0x41a63b4712e6450294f1cea2dcdfcdf61054dee0f9b0bb38ca0f8c43db0ae1a6` | Finalized |
| Propose 5 | `0xae883b390e5f4ae901bdbe0836f3051e8af3fc534d91af8c314ee9d8c1b73bfd` | Finalized |
| Vendor accepts | `0x2e493946df1d8ce162475f4dd106a3655b23881ee6b9d13fd7d8a2cba58de1dd` | Finalized |
| Request primary review | `0x793068911592581a374f548053b9959cd63cf8c6c2379ad6d9acbf9dda52ef7a` | Finalized |
| Observe primary review | `0x797740750361a07f4e26b6121cfbf4bb949e475db32a9854ae5e5da742504093` | COMPLIANT, finalized |
| Principal challenges with 0.001 GEN | `0x40408838e0d43b70ac25f8e2b4884c6af172a470a61ed188c9afb8f28bfd1fd6` | Finalized |
| Request challenge review | `0xc0325839b0a09110e5cbb3bf5b1f8f927079aff3ea3f21378225daafa70ca955` | Finalized, majority agree |
| Observe challenge review | `0xb547d3ac3877b45e0a5ef2ee13eedc799c0ec336fefe383c7615d688ab8f8079` | NON_COMPLIANT, finalized, majority agree |
| Principal withdraws returned bond | `0x108dcb817596dd055464eb5ef56e1a83d476c845dd2f8d2faca7011d2203add9` | Finalized, majority agree |

The read audit confirms proposal states `[RELEASED, REFUSED, RELEASED, REFUSED, REFUSED]`, all reservations and proposal bonds at zero, and all party credits withdrawn. Across all mandates it records 0.004 GEN challenge bonds received, 0.003 GEN forfeited and 0.001 GEN returned. Mandate 2’s compliant proposal paid 0.02 GEN; mandate 3’s refused offer value was not paid.

## Verification and remaining release gates

- Contract Direct Mode suite: 88 passed; 9 deliberate source mutations killed.
- Frontend lint, TypeScript, 11 Vitest tests and production build passed; hosted Vercel production build passed.
- GitHub Actions passed for the fixture changes through commit `47de018`.
- Read-only audit: deployed source hash matches; 3 mandates, 5 proposals, 0 invariant failures.
- Full-tree npm audit still has five high records from one unpatched dev-only `braces@3.0.3` advisory in the ESLint chain; production dependency audit is clean. See [`evidence/frontend-audit.json`](evidence/frontend-audit.json).
- The live exercise proves role-correct compliant settlement, both challenge directions and a controlled source reversal. It does not yet execute the full inconclusive-review recovery protocol or a real external vendor document, and the demo vendor is a controlled wallet.
- Vercel has no connected Git repository, so preview-branch configuration is unavailable; production was deployed from the reviewed local frontend.

These remaining scope and advisory items must be accepted or completed before describing the project as fully submission-ready.
