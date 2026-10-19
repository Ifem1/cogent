# Cogent interface handoff

The UI uses a responsive ink-black surface and acid-lime/soft-violet accents, consistent typography, accessible labels and explicit action statuses. It is a working multi-page App Router source rather than a static portfolio illustration. All cards use public finalized contract data; none uses fixtures as if live.

Route inventory:

- `/`: purpose, live global counts and recent mandates.
- `/mandates`: ordered real numeric IDs, budgets, expires.
- `/mandates/new`: owner funding with validation, exact 18-decimal values and immutable policy form.
- `/mandates/[id]`: immutable policy, caps, real proposals, agent-only purchase submission, owner expiry reclaim.
- `/proposals/[id]`: frozen vendor offer, review manifests, status, role/time-gated acceptance, observations, challenge/finalize/expiry recovery.
- `/activity`: connected wallet's related proposals, withdrawable credit, withdrawal action and payable refusals.
- `/about`: protocol explanation, assumptions and limitations.

Wallet is EIP-1193 injected only. Network chain 61999 with explicit switch action; manual connect/disconnect; listeners for chain/account changes; no localStorage keys. Public reads require no wallet. Payment transaction `value` differs from estimated network protocol fees.

Mandatory validation: Next.js `npm ci`, TypeScript, ESLint, Vitest, production build, real wallet end-to-end and UI regression on both 375px and desktop widths. Restore actual state after each write; don't report success on transaction hash alone.
