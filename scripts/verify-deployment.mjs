/** Read-only source and finalized-receipt audit for one Cogent deployment. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const [contractAddress, transactionHash] = process.argv.slice(2);
if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress || '') || !/^0x[a-fA-F0-9]{64}$/.test(transactionHash || '')) {
  console.error('Usage: node scripts/verify-deployment.mjs <contract-address> <deployment-transaction-hash>');
  process.exit(2);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = createClient({ chain: studionet });
await client.initializeConsensusSmartContract();
const tx = await client.getTransaction({ hash: transactionHash });
const receiptAddress = tx.data?.contract_address ?? tx.txDataDecoded?.contractAddress;
if (tx.statusName !== 'FINALIZED') throw new Error(`Deployment is not finalized (status=${tx.statusName ?? tx.status}).`);
if (!receiptAddress || receiptAddress.toLowerCase() !== contractAddress.toLowerCase()) {
  throw new Error(`Receipt contract address does not match ${contractAddress}.`);
}

const localCode = fs.readFileSync(path.join(root, 'contracts', 'cogent.py'));
const deployedCode = Buffer.from(await client.getContractCode(contractAddress), 'utf8');
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');
const votes = tx.consensus_data?.votes ?? {};
const report = {
  network: 'GenLayer Studionet',
  chainId: 61999,
  contractAddress: receiptAddress,
  deploymentTransactionHash: tx.hash ?? transactionHash,
  status: tx.statusName,
  transactionResult: tx.resultName ?? tx.result ?? null,
  executionResult: tx.txExecutionResultName ?? tx.txExecutionResult ?? null,
  deployer: tx.from_address ?? tx.sender ?? null,
  validatorVotes: votes,
  validatorVoteCount: Object.keys(votes).length,
  localSourceSha256: sha(localCode),
  deployedSourceSha256: sha(deployedCode),
  sourceMatches: sha(localCode) === sha(deployedCode),
  verifiedAt: new Date().toISOString(),
};
const destination = path.join(root, 'docs', 'evidence', 'cogent-2-deployment.json');
fs.writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.sourceMatches) process.exitCode = 1;
