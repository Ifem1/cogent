/**
 * Run a role-separated Studionet live cycle using encrypted local keystores.
 * Usage: node scripts/run-live-cycle.mjs <verified-contract-address>
 * This is a CLI transaction test, not a browser-wallet end-to-end test.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createInterface } from 'node:readline';
import { Wallet } from 'ethers';
import { createAccount, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const [contractAddress, resumeFlag] = process.argv.slice(2);
if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress || '')) {
  console.error('Usage: node scripts/run-live-cycle.mjs <verified-contract-address>');
  process.exit(2);
}
if (!process.stdin.isTTY || !process.stdin.setRawMode) throw new Error('Run this helper in an interactive terminal.');

function promptPassword(label) {
  return new Promise((resolve, reject) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.close();
    process.stdout.write(label);
    let value = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = (chunk) => {
      for (const char of chunk.toString()) {
        if (char === '\u0003') {
          process.stdin.setRawMode(false);
          process.stdin.off('data', onData);
          process.stdin.pause();
          reject(new Error('Cancelled.'));
          return;
        }
        if (char === '\r' || char === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.off('data', onData);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u007f' || char === '\b') {
          value = value.slice(0, -1);
          process.stdout.write('\b \b');
        } else {
          value += char;
          process.stdout.write('*');
        }
      }
    };
    process.stdin.on('data', onData);
  });
}

async function loadWallet(name) {
  const file = path.join(os.homedir(), '.genlayer', 'keystores', `${name}.json`);
  const encrypted = fs.readFileSync(file, 'utf8');
  return Wallet.fromEncryptedJson(encrypted, await promptPassword(`${name} keystore password: `));
}
const principal = await loadWallet('cogent-review-deployer');
const agent = await loadWallet('cogent-review-agent');
const vendor = await loadWallet('cogent-review-vendor');
const addresses = { principal: principal.address, agent: agent.address, vendor: vendor.address };
if (new Set(Object.values(addresses).map((x) => x.toLowerCase())).size !== 3) throw new Error('Live-cycle roles must use distinct addresses.');

const root = process.cwd();
const publicClient = createClient({ chain: studionet });
const clients = Object.fromEntries([
  ['principal', principal], ['agent', agent], ['vendor', vendor],
].map(([role, wallet]) => [role, createClient({ chain: studionet, account: createAccount(wallet.privateKey) })]));
const evidencePath = path.join(root, 'docs', 'evidence', 'live-cycle.json');
const resume = resumeFlag === '--resume';
const previous = resume && fs.existsSync(evidencePath) ? JSON.parse(fs.readFileSync(evidencePath, 'utf8')) : null;
if (previous && previous.contractAddress.toLowerCase() !== contractAddress.toLowerCase()) throw new Error('Existing live-cycle evidence belongs to a different contract.');
const receipts = previous?.transactions ?? [];
const amount = 5_000_000_000_000_000n; // 0.005 GEN
const bond = amount / 20n; // exact 5% bond
const sourcePrefix = 'https://httpbin.org/base64/';
const policy = 'Only one-time purchases are permitted overall.';

function offer(reference, amountWei) {
  return {
    schema: 'cogent.offer.v1', reference, vendor_address: addresses.vendor,
    amount_wei: amountWei, product: 'Cogent', commercial_terms: 'One-time purchase.',
  };
}
function offerUrl(document) {
  const encoded = Buffer.from(JSON.stringify(document), 'utf8').toString('base64');
  return `${sourcePrefix}${encoded}`;
}
async function verifySource(url, expected) {
  if (url.length > 300) throw new Error(`Offer URL exceeds contract limit (${url.length}).`);
  const response = await fetch(url);
  const body = await response.text();
  if (!response.ok || body !== JSON.stringify(expected)) throw new Error(`Offer source did not return exact bounded JSON (HTTP ${response.status}).`);
  return crypto.createHash('sha256').update(body, 'utf8').digest('hex');
}
function save() {
  fs.writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
}
const report = previous ?? {
  network: 'GenLayer Studionet', chainId: 61999, contractAddress,
  roles: addresses, amountWei: amount.toString(), bondWei: bond.toString(),
  policy, sourcePrefix, transactions: receipts, startedAt: new Date().toISOString(),
};
if (JSON.stringify(report.roles).toLowerCase() !== JSON.stringify(addresses).toLowerCase()) throw new Error('Existing live-cycle evidence uses different role accounts.');
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');
async function send(role, phase, method, args = [], value = 0n) {
  const prior = receipts.find((entry) => entry.phase === phase && entry.status === 'FINALIZED');
  if (prior) return prior;
  const client = clients[role];
  const hash = await client.writeContract({ address: contractAddress, functionName: method, args, value });
  const entry = { phase, role, method, hash, sender: addresses[role], status: 'SUBMITTED' };
  receipts.push(entry);
  save();
  console.log(`${phase}: ${hash}`);
  await client.waitForTransactionReceipt({ hash, status: 'FINALIZED', interval: 10_000, retries: 120 });
  const tx = await client.getTransaction({ hash });
  if (tx.statusName !== 'FINALIZED') throw new Error(`${method} did not finalize (status=${tx.statusName ?? tx.status}).`);
  entry.status = tx.statusName;
  entry.votes = tx.consensus_data?.votes ?? {};
  entry.execution = (tx.consensus_data?.leader_receipt ?? []).map((item) => ({
    result: item.execution_result ?? null,
    errorCode: item.genvm_result?.error_code ?? null,
    errorDescription: item.genvm_result?.error_description ?? null,
  }));
  save();
  const agreeingValidators = Object.values(entry.votes).filter((vote) => vote === 'agree').length;
  if (agreeingValidators < 3) throw new Error(`${method} finalized without successful quorum (${agreeingValidators} agreeing validators).`);
  return entry;
}
async function read(method, args = []) {
  const result = await publicClient.readContract({ address: contractAddress, functionName: method, args });
  return typeof result === 'string' ? JSON.parse(result) : result;
}
async function waitPastRetryGap(lastAttempt) {
  const readyAtMs = (Number(lastAttempt) + 600 + 30) * 1000;
  while (Date.now() < readyAtMs) {
    const seconds = Math.ceil((readyAtMs - Date.now()) / 1000);
    console.log(`Waiting ${seconds}s for the contract's 10-minute retry interval.`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(seconds * 1000, 30_000)));
  }
}

const offerA = offer('CGT2026A', amount.toString());
const offerAUrl = offerUrl(offerA);
const offerASha256 = await verifySource(offerAUrl, offerA);
const offerB = offer('CGT2026B', (amount + 1n).toString()); // deliberate amount mismatch
const offerBUrl = offerUrl(offerB);
const offerBSha256 = await verifySource(offerBUrl, offerB);
const offerC = offer('CGT2026C', amount.toString());
offerC.commercial_terms = 'Renews monthly.';
const offerCUrl = offerUrl(offerC);
const offerCSha256 = await verifySource(offerCUrl, offerC);
report.offers = [
  { expected: offerA, url: offerAUrl, sourceSha256: offerASha256 },
  { expected: { ...offerB, amount_wei: amount.toString() }, fetched: offerB, url: offerBUrl, sourceSha256: offerBSha256, adversarialCase: 'correct reference but mismatched amount' },
  { expected: offerC, url: offerCUrl, sourceSha256: offerCSha256, adversarialCase: 'all purchase bindings valid; recurring commercial term violates frozen principal policy' },
];
save();

const beforeCount = Number(await publicClient.readContract({ address: contractAddress, functionName: 'get_mandate_count' }));
const mandateId = Number(report.mandateId ?? beforeCount + 1);
report.mandateId = mandateId;
const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
await send('principal', 'fund mandate', 'create_mandate', [
  addresses.agent, 'Cogent Review Live Cycle', policy, JSON.stringify([sourcePrefix]),
  amount, 50_000_000_000_000_000n, expiresAt,
], 100_000_000_000_000_000n);
if (Number(await publicClient.readContract({ address: contractAddress, functionName: 'get_mandate_count' })) !== mandateId) throw new Error('Mandate count did not increment.');

async function acceptAndReview(reference, url, phase) {
  const before = Number(await publicClient.readContract({ address: contractAddress, functionName: 'get_proposal_count' }));
  const proposalId = Number(report[`${phase}ProposalId`] ?? before + 1);
  report[`${phase}ProposalId`] = proposalId;
  await send('agent', `${phase} propose`, 'propose', [mandateId, addresses.vendor, amount, url, reference, 'Cogent']);
  if (Number(await publicClient.readContract({ address: contractAddress, functionName: 'get_proposal_count' })) < proposalId) throw new Error('Proposal count did not reach the recorded proposal ID.');
  await send('vendor', `${phase} vendor accept`, 'accept_offer', [proposalId]);
  await send('principal', `${phase} request primary review`, 'request_review', [proposalId]);
  await send('principal', `${phase} observe primary review`, 'observe_review', [proposalId]);
  const proposal = await read('get_proposal', [proposalId]);
  const primaryManifest = JSON.parse(proposal.primary_manifest);
  report[`${phase}Primary`] = { status: primaryManifest.label, manifest: primaryManifest, currentProposalStatus: proposal.status };
  save();
  return { proposalId, proposal };
}

const first = await acceptAndReview('CGT2026A', offerAUrl, 'compliant');
if (report.compliantPrimary.status !== 'COMPLIANT') throw new Error(`Expected COMPLIANT primary decision, got ${report.compliantPrimary.status}.`);
if (first.proposal.status === 'PROVISIONAL_COMPLIANT') {
  await send('principal', 'principal posts exact 5% challenge', 'challenge', [first.proposalId], bond);
} else if (!['CHALLENGED', 'RELEASED'].includes(first.proposal.status)) {
  throw new Error(`Unexpected compliant proposal state before challenge: ${first.proposal.status}.`);
}
let challenged = await read('get_proposal', [first.proposalId]);
if (challenged.status === 'CHALLENGED' && Number(challenged.review_due) === 0) {
  await waitPastRetryGap(challenged.last_attempt);
  await send('agent', 'request challenge review after retry interval', 'request_review', [first.proposalId]);
  challenged = await read('get_proposal', [first.proposalId]);
  if (challenged.status === 'CHALLENGED' && Number(challenged.review_due) === 0) throw new Error('Challenge review request did not open a live review window.');
}
if (challenged.status === 'CHALLENGED' && Number(challenged.review_due) > 0) {
  await send('agent', 'observe challenge review', 'observe_review', [first.proposalId]);
}
const firstFinal = await read('get_proposal', [first.proposalId]);
if (firstFinal.status === 'RELEASED') {
  report.compliantFinal = { status: firstFinal.status, finalCode: firstFinal.final_code, challengeOutcome: firstFinal.challenge_outcome, challengeManifest: JSON.parse(firstFinal.challenge_manifest) };
  save();
  if (firstFinal.challenge_outcome !== 'UPHELD') throw new Error('Expected the same-source compliant challenge to be upheld.');
}

const second = await acceptAndReview('CGT2026B', offerBUrl, 'mismatchedAmount');
const mismatchManifest = JSON.parse(second.proposal.primary_manifest);
if (mismatchManifest.bindings_valid !== false || mismatchManifest.label !== 'NON_COMPLIANT') throw new Error('Purchase amount mismatch was not rejected by the contract binding check.');
if (second.proposal.status === 'PROVISIONAL_NON_COMPLIANT') {
  await send('vendor', 'vendor posts exact 5% challenge to mismatch refusal', 'challenge', [second.proposalId], bond);
  let mismatchChallenged = await read('get_proposal', [second.proposalId]);
  if (Number(mismatchChallenged.review_due) === 0) {
    await waitPastRetryGap(mismatchChallenged.last_attempt);
    await send('agent', 'request mismatch challenge review after retry interval', 'request_review', [second.proposalId]);
    mismatchChallenged = await read('get_proposal', [second.proposalId]);
    if (Number(mismatchChallenged.review_due) === 0) throw new Error('Mismatch challenge review request did not open a live review window.');
  }
  if (Number(mismatchChallenged.review_due) > 0) await send('agent', 'observe mismatch challenge review', 'observe_review', [second.proposalId]);
} else if (second.proposal.status !== 'REFUSED' || second.proposal.challenge_outcome !== 'UPHELD') {
  throw new Error(`Expected an open or upheld mismatch refusal, got ${second.proposal.status}.`);
}
const secondFinal = await read('get_proposal', [second.proposalId]);
report.mismatchFinal = { status: secondFinal.status, finalCode: secondFinal.final_code, challengeOutcome: secondFinal.challenge_outcome, challengeManifest: JSON.parse(secondFinal.challenge_manifest) };
save();
if (secondFinal.status !== 'REFUSED' || secondFinal.challenge_outcome !== 'UPHELD') throw new Error('The mismatched-amount purchase was not refused after challenge review.');

const third = await acceptAndReview('CGT2026C', offerCUrl, 'policyViolation');
const policyManifest = JSON.parse(third.proposal.primary_manifest);
report.policyViolationPrimary.manifest = policyManifest;
if (policyManifest.bindings_valid !== true || policyManifest.label !== 'NON_COMPLIANT') {
  throw new Error(`Expected a binding-valid policy refusal, got ${policyManifest.label}/${policyManifest.bindings_valid}.`);
}
if (policyManifest.source_sha256 !== offerCSha256 || !policyManifest.supporting_clauses.some((item) =>
  item.policy_clause === 'Only one-time purchases are permitted overall.' && item.offer_clause === 'Renews monthly.')) {
  throw new Error('Primary manifest is missing the expected source fingerprint or exact policy evidence.');
}
if (third.proposal.status !== 'PROVISIONAL_NON_COMPLIANT') throw new Error(`Unexpected policy-violation state: ${third.proposal.status}.`);
await send('vendor', 'vendor posts exact 5% challenge to policy refusal', 'challenge', [third.proposalId], bond);
let policyChallenged = await read('get_proposal', [third.proposalId]);
if (Number(policyChallenged.review_due) === 0) {
  await waitPastRetryGap(policyChallenged.last_attempt);
  await send('agent', 'request policy challenge review after retry interval', 'request_review', [third.proposalId]);
  policyChallenged = await read('get_proposal', [third.proposalId]);
  if (Number(policyChallenged.review_due) === 0) throw new Error('Policy challenge review request did not open a live review window.');
}
if (Number(policyChallenged.review_due) > 0) await send('agent', 'observe policy challenge review', 'observe_review', [third.proposalId]);
const thirdFinal = await read('get_proposal', [third.proposalId]);
report.policyViolationFinal = {
  status: thirdFinal.status,
  finalCode: thirdFinal.final_code,
  challengeOutcome: thirdFinal.challenge_outcome,
  challengeManifest: JSON.parse(thirdFinal.challenge_manifest),
};
save();
if (thirdFinal.status !== 'REFUSED' || thirdFinal.challenge_outcome !== 'UPHELD') throw new Error('The frozen-policy violation was not refused after challenge review.');
if (report.policyViolationFinal.challengeManifest.label !== 'NON_COMPLIANT'
    || report.policyViolationFinal.challengeManifest.bindings_valid !== true
    || report.policyViolationFinal.challengeManifest.source_sha256 !== offerCSha256
    || !report.policyViolationFinal.challengeManifest.supporting_clauses.some((item) =>
      item.policy_clause === 'Only one-time purchases are permitted overall.' && item.offer_clause === 'Renews monthly.')) {
  throw new Error('Challenge manifest does not independently support the binding-valid policy refusal.');
}

async function attemptVerifiedWithdrawal(role) {
  const address = addresses[role];
  const owed = BigInt(String(await publicClient.readContract({ address: contractAddress, functionName: 'owed_to', args: [address] })));
  if (owed === 0n) return { role, address, owed: '0', skipped: true };
  const pendingBefore = BigInt(String(await publicClient.readContract({ address: contractAddress, functionName: 'withdrawal_pending_for', args: [address] })));
  const balanceBefore = await publicClient.getBalance({ address });
  if (pendingBefore === 0n) await send(role, `${role} withdraw policy challenge proceeds`, 'withdraw');
  let balanceAfter = balanceBefore;
  for (let attempt = 0; attempt < 30; attempt++) {
    balanceAfter = await publicClient.getBalance({ address });
    if (balanceAfter > balanceBefore) break;
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  const pending = BigInt(String(await publicClient.readContract({ address: contractAddress, functionName: 'withdrawal_pending_for', args: [address] })));
  const record = { role, address, owed: owed.toString(), pending: pending.toString(), balanceBefore: balanceBefore.toString(), balanceAfter: balanceAfter.toString(), balanceIncrease: (balanceAfter - balanceBefore).toString(), confirmed: false };
  if (pending === owed && balanceAfter - balanceBefore >= owed) {
    await send(role, `${role} confirm policy challenge withdrawal after observed balance increase`, 'confirm_withdrawal');
    record.confirmed = true;
  }
  return record;
}

report.withdrawals = [];
for (const role of ['vendor', 'principal']) {
  report.withdrawals.push(await attemptVerifiedWithdrawal(role));
  save();
}
report.finalMandate = await read('get_mandate', [mandateId]);
report.finalAccounting = await read('get_accounting');
report.finalPrincipalCredit = String(await publicClient.readContract({ address: contractAddress, functionName: 'owed_to', args: [addresses.principal] }));
report.finalVendorCredit = String(await publicClient.readContract({ address: contractAddress, functionName: 'owed_to', args: [addresses.vendor] }));
report.completedAt = new Date().toISOString();
save();
console.log(`Live-cycle evidence saved to ${evidencePath}`);
