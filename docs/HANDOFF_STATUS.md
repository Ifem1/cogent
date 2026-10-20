# Engineering handoff status — 20 October 2026

**Status: reviewer fixes implemented locally; fresh deployment and browser-originated verification remain.** The source release is `cogent/2`. The older Studionet deployment and Vercel site remain at the earlier source until separately redeployed. The user will deploy Vercel.

Current local contract SHA-256: `1adc3187940d08d566ad238e9121de43412974b3aa17b973c80838a66e2ef919`. Deployed Cogent/2 SHA-256: not available until redeployment; the prior deployment hash is not a match.

The remediation adds source and purchase-terms commitments, exact evidence-quote comparison, strict complete bounded offers, fair challenge recovery and UTC-correct deadlines. Outbound withdrawals remain recorded as pending until the beneficiary checks the external wallet balance and confirms, preventing silent credit erasure and duplicate sends.

Do not describe the prior deployment, prior source hash, historic test count, or historic live receipts as verification of `cogent/2`. See [`REVIEW_REMEDIATION.md`](REVIEW_REMEDIATION.md) for current requirements and the remaining release checklist. The previously documented development-only dependency advisory remains documented in [`evidence/security-advisory-review.md`](evidence/security-advisory-review.md).
