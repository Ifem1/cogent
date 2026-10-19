# Studionet live verification

**Snapshot: 19 October 2026, 16:02 UTC. Verdict: NOT READY.** This record distinguishes finalized actions from transactions that have not reached validator consensus. The machine-readable readback is [`evidence/live-read-audit.json`](evidence/live-read-audit.json).

## Deployed source and frontend

- Repository: [`Ifem1/cogent`](https://github.com/Ifem1/cogent)
- Source commit: `2b0f06912f6e225af209ce2efffcc89294bfd199`
- Local and deployed SHA-256: `6ad15f02bab30fcf6910e8099090d310ee1b3cb8138939c3c7f8bc8622b14a61`
- Chain: GenLayer Studionet, 61999 (`https://studio.genlayer.com/api`)
- Contract: `0x5E09f5E1b5E0c3c2e1A85aDcC3C0F097f5902d93`
- Deployment transaction: `0xe5fc6564d85aded41b4234709ca9f22f0a6b564ce31be725775a44fdef6c8887`; status `FINALIZED`; consensus `MAJORITY_AGREE`; five validators agreed; deployment GenVM result `SUCCESS`.
- Production site: [`https://frontend-olive-one-18.vercel.app`](https://frontend-olive-one-18.vercel.app), HTTP 200; Vercel deployment [`DmMQrzU1dpCVxBMhtafeZ6rRLnkg`](https://vercel.com/ifem1s-projects/frontend/DmMQrzU1dpCVxBMhtafeZ6rRLnkg) is `READY`.
- Served client bundles contain the contract address; production `NEXT_PUBLIC_COGENT_CONTRACT` is configured.

## Test wallet roles

| Role | Account alias | Address |
| --- | --- | --- |
| Deployment | `cogent-deployer` | `0xd6423ae82a975d55c6ceac222827a727325e0459` |
| Principal | `cogent-principal` | `0x39680bd423437c0eaa18493629652821ec672c61` |
| Agent | `cogent-agent` | `0xa49c51d759790116d451f256654dd9f0549d341f` |
| Vendor/challenger | `cogent-vendor` | `0x77e2edbb43277bf772e207c517dde731935ffba5` |

The user supplied these as funded throwaway wallets and authorized their use for deployment and tests. Private keys are intentionally excluded from the repository.

## Source fixture availability

The compliant fixture URL pinned to commit `e24e3092723c1867590c850dc242ee802d37e578` was fetched twice over HTTPS. Both responses were 328 characters and exactly matched `examples/offer-compliant.json`. The noncompliant immutable fixture uses the same commit and allowed source prefix. Both primary source observations below were finalized.

## Preliminary diagnostic mandate (not submission proof)

The first 0.10 GEN mandate was created by `cogent-deployer`; that made the deployer the on-chain owner/principal even though the user assigned a separate principal wallet. The distinct principal's challenge was correctly rejected as the wrong owner, and its 0.001 GEN was credited back. This mandate is retained only as a diagnostic record and must not be counted as role-correct challenge proof.

| Action | Transaction | Result |
| --- | --- | --- |
| Create 0.10 GEN mandate 1 | `0x93bd7026bd2f4ee5a0a083df78eb385689d9b3a2c020238c44bb3451b0e79544` | Finalized, majority agree |
| Propose compliant offer, proposal 1 | `0x3fafb62384e18e1f30d853400dd9c1b1a52937ab006aa05b26208618f1660358` | Finalized |
| Vendor accepts proposal 1 | `0xe8d160dc460b734f6e21c513d7f6979b798facab6d61f7d76c21dcbfe51f4cae` | Finalized |
| Primary review request/observation | `0x490e8c0d82683bbdf178982c2b30f6e4de8d35bb90c4084ea20b69fe1287effa`; `0x17be3f4122219b79be2bbf6b8fbb126c563ffffb5b87fe903a1a7d31e4402a35` | Final primary manifest `COMPLIANT`; no settlement proof |
| Principal-key challenge attempt | `0x13b58e2f5b1ad4db4c8de7092675cac489cb8997d7c8c027779e7969ab92b806` | Rejected; wrong on-chain principal; 0.001 GEN credited back |
| Propose/accept noncompliant proposal 2 | `0xb34a0b4959ad0249ccacf805ccb2f6abd0bfd3e6c8893f7b24f2289b0fcb6bfd`; `0xea6dc0d1bd95a0fdac22b698749610554b3083a07da47c2513ea2687e36ba9fe` | Finalized |
| Primary review request/observation | `0x0048f9c7e7ac8b6a850194255d95b61f9fc168396ce25b17d8f73704f2134f31`; `0xd3f70b503b69b532d7b9956a0ae81cd4a9f6c2137e9de68f5363bca03957ed19` | Final primary manifest `NON_COMPLIANT`; no settlement proof |
| Vendor challenge attempt | `0xa4aac33ed580d22037c9e4f8f5eb31244f04b1b0d027351fdbd50ba357a99577` | Bond accepted, but challenge re-review has not been proven |

## Role-correct mandate and pending review

Mandate 2 was funded by the designated principal wallet, with the designated agent, vendor, 0.02 GEN purchase cap, 0.08 GEN vendor cap, 0.10 GEN funding, two-day expiry, frozen policy, and source prefix pinned to the public Git commit above.

| Action | Transaction | Result |
| --- | --- | --- |
| Create mandate 2 from principal wallet | `0x6c882312319bcb5d6e5de5a426ccc899fb934fce7a325e6e187f7552ab245138` | Finalized, majority agree, 0.10 GEN value |
| Agent proposes compliant 0.02 GEN offer, proposal 3 | `0x54096dd116f21394351d3015ada11473240d705a6551717ad8840d6add9c269c` | Finalized |
| Vendor accepts proposal 3 | `0xab4e9ada709774c8125363ffd176a16c24fb105155ed6aa9261d677d50f2ab98` | Finalized |
| Request primary review | `0x50f1cb1ef0fa31c927acc21e4c03253208993fda95cc9659199fe3e46aa16e14` | Finalized; proposal entered `READY` with a review deadline |
| Observe primary review | `0x141a5188ddc4a9e23c12e4d77429f80e7e8b0f539bd9694395e4d7afe29bd8cd` | Leader execution succeeded and independently returned `COMPLIANT`, but transaction remains **not finalized** in `COMMITTING` with zero validator commits/reveals (`NO_MAJORITY`). Receipt polling later received an HTML error from the RPC. Review deadline passed without an on-chain verdict. |
| Expire review 3 | `0xa6891a4e0aefcd55c59ddf372311db2536d6ae482a32be4781c31e8cb529e095` | **Pending.** Last queried status was `PENDING`, no validator votes. |

No verdict, challenge outcome, payment, bond forfeiture, or withdrawal is inferred from the pending transactions. Current canonical readback reports zero invariant failures, but proposal 3 remains unsettled. The network must finalize the review/recovery transaction before the role-correct test can continue.

## Local and hosted checks

- GenLayer Direct Mode: 88 passed; 9 mutation tests killed.
- Frontend: lint, TypeScript, 11 tests and production build passed locally.
- Vercel remote production build: passed; site returned HTTP 200 and client bundles carried the configured contract address.
- GitHub Actions: run [39268459378](https://github.com/Ifem1/cogent/actions/runs/39268459378) passed all three jobs on commit `e24e3092723c1867590c850dc242ee802d37e578`.
- Live read audit: source hash equality and exact-wei accounting invariants passed at the recorded snapshot; it does not prove pending transaction execution.
- Full-tree npm audit retains five high dev-only entries from the same unpatched `braces@3.0.3` advisory. Production dependency audit has zero findings.
