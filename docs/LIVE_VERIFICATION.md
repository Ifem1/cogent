# Studionet live verification

**Snapshot: 19 October 2026, 19:29 UTC. Status: all live proof scenarios settled and accounting invariants pass.** The refreshed machine-readable state is [`evidence/live-read-audit.json`](evidence/live-read-audit.json).

## Deployment

- Repository: [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
- Contract source commit: `2b0f06912f6e225af209ce2efffcc89294bfd199`
- Local and deployed SHA-256: `6ad15f02bab30fcf6910e8099090d310ee1b3cb8138939c3c7f8bc8622b14a61`
- GenLayer Studionet, chain 61999; RPC `https://studio.genlayer.com/api`
- Contract: `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93`
- Deployment transaction: `0xe5fc6564d85aded41b4234709ca9f22f0a6b564ce31be725775a44fdef6c8887`; `FINALIZED`, `MAJORITY_AGREE`, five agreeing validators, GenVM `SUCCESS`.
- Production site: [`https://frontend-olive-one-18.vercel.app`](https://frontend-olive-one-18.vercel.app), HTTP 200; Vercel deployment [`DmMQrzU1dpCVxBMhtafeZ6rRLnkg`](https://vercel.com/ifem1s-projects/frontend/DmMQrzU1dpCVxBMhtafeZ6rRLnkg) is READY and serves the verified contract address.

## Test account roles

| Role | Alias | Address |
| --- | --- | --- |
| Deployer | `cogent-deployer` | `0xd6423ae82a975d55c6ceac222827a727325e0459` |
| Principal | `cogent-principal` | `0x39680bd423437c0eaa18493629652821ec672c61` |
| Agent | `cogent-agent` | `0xa49c51d759790116d451f256654dd9f0549d341f` |
| Vendor/challenger | `cogent-vendor` | `0x77e2edbb43277bf772e207c517dde731935ffba5` |

The user supplied these as funded throwaway wallets. Private keys were used only in encrypted local keystores and are not in the repository.

## Core live settlement and challenge proof

Mandate 1 is diagnostic only: it was accidentally created by the deployer, so it does not prove a separate principal role. Proposal 1 finalized RELEASED with a COMPLIANT primary result; proposal 2 finalized REFUSED after NON_COMPLIANT review. The separate principal’s wrong-owner challenge was rejected and refunded. This mandate is excluded from role-correct proof.

Mandate 2 was created by the designated principal with the designated agent and vendor, 0.10 GEN funding, 0.02 GEN purchase cap, 0.08 GEN vendor cap and commit-pinned fixtures. Proposal 3 was compliant, the principal challenged it with the exact 0.001 GEN bond, the independent review agreed, and it was released. The bond was forfeited to the vendor. Proposal 4 was noncompliant, the vendor challenged it with the exact 0.001 GEN bond, and the challenge review agreed; it was refused and its bond was forfeited to the principal. An early retry request correctly failed the spacing assertion without a state change; the spaced retry finalized.

Mandate 3 was created by the designated principal for a controlled reversal test. Proposal 5’s immutable-at-primary source returned COMPLIANT. After that finalized result, the public fixture was changed to include prohibited model training and a monthly renewal, committed as `47de018` and independently fetched twice. The principal’s exact 0.001 GEN challenge review returned NON_COMPLIANT, reversed the result, refused the offer, and returned the principal’s bond. That bond was withdrawn. This scenario intentionally changes a public page between reviews and is not represented as an immutable-source test.

## Live recovery proof

Mandate 4 funded proposal 6 against a deliberately unavailable URL inside the frozen source prefix. The review request was left open past its 20-minute deadline. `expire_review` finalized with a `CONTESTED` primary manifest; the retry after the enforced 10-minute gap returned `SOURCE_UNAVAILABLE`. A third spaced attempt also returned `SOURCE_UNAVAILABLE`. `expire_unresolved` then finalized with `INCONCLUSIVE` and `REFUSED`, restoring the full 0.001 GEN reservation. No payment or provisional approval occurred.

Mandate 5 tested OpenAI’s official live data-use policy URL directly. The source was publicly readable in two independent HTTPS fetches, but GenLayer recorded `SOURCE_UNAVAILABLE` on all three spaced review attempts. The bounded `expire_unresolved` path finalized the proposal as `INCONCLUSIVE` and `REFUSED`, restoring its reservation. This direct-host result is documented rather than treated as a policy verdict.

To complete the semantic real-document review, the repository contains an attributed 25-word excerpt from OpenAI’s official policy, at its immutable GitHub commit URL. The source page says API and other business-user inputs/outputs are excluded from model training by default unless a customer opts in. Proposal 8 reviewed that pinned excerpt twice: primary and challenge reviews both finalized COMPLIANT. The principal’s exact 5% challenge bond was forfeited to the vendor, the proposal was RELEASED, and the vendor withdrew the 0.001 GEN payment plus 0.00005 GEN bond. The test vendor was a controlled wallet and is not affiliated with OpenAI.

- Official source page: [OpenAI data-use policy](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/), updated 13 March 2026 according to the page.
- Attributed excerpt: [`../examples/openai-business-data-policy.json`](../examples/openai-business-data-policy.json)
- Immutable fixture commit: `6d74c77c9a098707cd7db321ddbbf13d8983cd88`
- Immutable raw URL: `https://raw.githubusercontent.com/Ifem1/cogent/6d74c77c9a098707cd7db321ddbbf13d8983cd88/examples/openai-business-data-policy.json`

## Key recovery and real-document receipts

All hashes below were queried from the live helper; finalized state is also confirmed by canonical readback.

| Proposal | Action | Transaction | Result |
| --- | --- | --- | --- |
| 6 | Create recovery mandate 4 | `0x372bdbe5fb63230be220c541090b5cd5a0fd410af9f6965a9868b5949ddb54a4` | Finalized |
| 6 | Propose unavailable source | `0x3236e856f331a79aca16b1dda8a3ccf2944873084a12db31dafdfa9bfb6dfee1` | Finalized |
| 6 | Vendor accepts | `0x9a2d46b982c77e7ef1baecde23be6130570bd6e39fb225d3e741a4eabfa1497c` | Finalized |
| 6 | Request first review | `0x727c55d45d4ade6d0635b47d477d30f505b489de0d2d0ce41a79e1a30d6ff90e` | Finalized |
| 6 | Expire first review | `0xb3f444e2fb67823651854cd7f5dd4b4d8478785e10aa0418b60a6197d34c2118` | `CONTESTED`, finalized |
| 6 | Request retry 2 | `0x3e11ef8e4b0363cf607a77f84923443d9e63346c25ba39a5ba41d53dc92e713e` | Finalized |
| 6 | Observe retry 2 | `0xe99ede41063b840c203643c3a67daaf6e50cc54d3e566bcb5c0c3062ff37513a` | `SOURCE_UNAVAILABLE`, finalized |
| 6 | Request retry 3 | `0x8a1b8e815e8822c63388ddc6edae9cc7fff2031e13515989f224a7430550054c` | Finalized |
| 6 | Observe retry 3 | `0x18e04a86d4cfcc80dd68e140d30c0522aa315161eaec92dbd621e88295aaa7b6` | `SOURCE_UNAVAILABLE`, finalized |
| 6 | Expire unresolved | `0x0a373644aae36986a7916ec5be8cd6256add4559365df7073d0663eb123f547e` | `INCONCLUSIVE`; reservation restored |
| 7 | Create direct-source mandate 5 | `0x51ab4f5f4cb3a0f0fb3f3f3bb7e616be832a97f46bf9c12665e9a3ce4170f798` | Finalized |
| 7 | Vendor accepts | `0xd46300d97022e3afd02d756885a5886e3ee8e4cf3d5c6ea006dfaf8576efb503` | Finalized |
| 7 | Request/observe review 1 | `0xf07242f48ac87899510ae603312bb90cab41c32ec75c27abb3a81f563ea9569e`; `0x58550d5a3ab6c3143995e9fb6ec7d14c58e19dfcf6248d86efe4649a1970645b` | `SOURCE_UNAVAILABLE` |
| 7 | Request/observe review 2 | `0x4e3a38dce134f0b68c253bd5759c00954ca0b1dd00a03f2e8341b579b745a4a4`; `0xa78b7a59705b6463dfa14ce2219948dfc23219b5a514c4dbbdec8cb1a1ff96d2` | `SOURCE_UNAVAILABLE` |
| 7 | Request/observe review 3 | `0x337cd568b4170f20727b02ea3512e0b6fcff908a8f80323be11bafcd27f66682`; `0xeed30b372ad5e27262406268b5e4ffd71d071e2ead656dbd338f3add4cef5282` | `SOURCE_UNAVAILABLE` |
| 7 | Expire unresolved | `0x355eedccd0abca8128081a014b456ab563214984e11557baa8a270a14416aaf7` | `INCONCLUSIVE`; reservation restored |
| 8 | Create immutable real-document mandate 6 | `0xf71221b39c6ef0ef0bf4bc896050c14c5c61b7852f1d8aa7f8ac77c56a6a8352` | Finalized |
| 8 | Propose real policy excerpt | `0x3af51f68ac86d68fcc0a9c09ee55816bee20751d2cf396a4c1f18437bc7ac039` | Finalized |
| 8 | Vendor accepts | `0xe639d5037ff673885d19ea8a45f7d7a406fed568eef3a7a28008c025c3a7055c` | Finalized; readback READY |
| 8 | Request/observe primary | `0xc6cb872fa90ef59fd3414497c55e0868a97f8f6315bd8d73b6d6d84689da16e7`; `0x912877097c4f61c8d2dc660db0bf02cf2939369482bb0d1e8483cdfcce9bb9b7` | `COMPLIANT`, finalized |
| 8 | Principal exact 5% challenge | `0x34a8ea84eec3903ce35dbed6d1f5711c269bf904081609b367db5087daa24737` | Finalized |
| 8 | Request/observe challenge | `0x921e6155c0baa4ac100b51420aa34e3f00c5faa0ef76a47cfd25137080e2fc63`; `0xb4f2de9e810f9f70ef1e93cef682d4d92455dbfe168457153b48281c1a9ef878` | `COMPLIANT`, finalized; proposal RELEASED |
| 8 | Vendor withdraw payment and forfeited bond | `0x198cd86064c5ec83a517d8a989a79979777a054aa268a370b70b7dd65de3836d` | Finalized; canonical owed balance is zero |

## Final canonical state

The audit reads 6 mandates and 8 proposals. Proposal statuses are `[RELEASED, REFUSED, RELEASED, REFUSED, REFUSED, REFUSED, REFUSED, RELEASED]`. Every proposal is terminal; all mandate and vendor reservations are zero; all proposal bonds are zero; all party owed balances are zero; and source SHA-256 equals the deployed code hash.

Accounting books: `bonds_received = 4,050,000,000,000,000 wei`; `bonds_forfeited = 3,050,000,000,000,000 wei`; `bonds_returned = 1,000,000,000,000,000 wei`; `bonds_locked = 0`; `owed = 0`. The 0.001 GEN proposal 8 payment was withdrawn. The final read audit reports zero invariant failures.

Unused budget remains spendable in open test mandates: 0.005 GEN in mandate 4, 0.005 GEN in mandate 5 and 0.004 GEN in mandate 6. Their proposals are terminal and none of these amounts is reserved or owed. The mandate owners can reclaim remaining available amounts after each mandate expires and is closed.

## Build, deployment and accepted advisory

- GenLayer Direct Mode: 88 passed; 9 deliberate contract mutations killed.
- Frontend lint, TypeScript, 11 Vitest tests and production build passed; Vercel’s production build passed.
- GitHub Actions passed, including the public-document fixture commit (`39306008198`). The final handoff documentation commit will run the same CI workflow.
- Production frontend returns HTTP 200 and serves the verified contract address. Vercel is not Git-connected, so preview-branch configuration is unavailable.
- The full-tree audit reports five high records from the single dev-only `braces@3.0.3` advisory. The production-only audit is clean and no patched release is listed. This residual risk is explicitly accepted for this submission and remains visible in npm audit; rationale and controls are in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md).
