/**
 * Deploy the current Cogent source with a locally encrypted GenLayer keystore.
 * Usage: node scripts/live-deploy.mjs <account-name>
 * The password is read from a masked TTY prompt; no key or password is accepted
 * on the command line. The receipt must reach FINALIZED before an address is saved.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createInterface } from 'node:readline';
import { Wallet } from 'ethers';
import { createAccount, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const [accountName] = process.argv.slice(2);
if (!accountName || !/^[a-zA-Z0-9_-]+$/.test(accountName)) {
  console.error('Usage: node scripts/live-deploy.mjs <account-name>');
  process.exit(2);
}

function promptPassword() {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) throw new Error('Run this helper in an interactive terminal.');
  return new Promise((resolve, reject) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.close();
    process.stdout.write('Keystore password: ');
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

const root = process.cwd();
const contractPath = path.join(root, 'contracts', 'cogent.py');
const code = fs.readFileSync(contractPath);
if (code.length === 0) throw new Error('Contract source is empty.');
const localSourceSha256 = crypto.createHash('sha256').update(code).digest('hex');
const keystorePath = path.join(os.homedir(), '.genlayer', 'keystores', `${accountName}.json`);
const keystore = fs.readFileSync(keystorePath, 'utf8');
const wallet = await Wallet.fromEncryptedJson(keystore, await promptPassword());
const client = createClient({ chain: studionet, account: createAccount(wallet.privateKey) });
await client.initializeConsensusSmartContract();

console.log(`Deploying source SHA-256 ${localSourceSha256} to GenLayer Studionet (61999).`);
const hash = await client.deployContract({ code, args: [], leaderOnly: false });
console.log(`Deployment transaction submitted: ${hash}`);
await client.waitForTransactionReceipt({ hash, status: 'FINALIZED', interval: 10_000, retries: 120 });
// waitForTransactionReceipt currently returns a receipt with numeric status but
// omits statusName on this SDK release. getTransaction normalizes the status.
const receipt = await client.getTransaction({ hash });
const contractAddress = receipt.data?.contract_address ?? receipt.txDataDecoded?.contractAddress;
if (!contractAddress || receipt.statusName !== 'FINALIZED') {
  throw new Error(`Deployment did not finalize with a contract address (status=${receipt.statusName ?? receipt.status}).`);
}
const deployed = await client.getContractCode(contractAddress);
const deployedSourceSha256 = crypto.createHash('sha256').update(Buffer.from(deployed, 'utf8')).digest('hex');
console.log(JSON.stringify({
  network: 'GenLayer Studionet',
  chainId: 61999,
  account: wallet.address,
  transactionHash: receipt.hash ?? hash,
  status: receipt.statusName,
  contractAddress,
  localSourceSha256,
  deployedSourceSha256,
  sourceMatches: localSourceSha256 === deployedSourceSha256,
}, null, 2));
if (localSourceSha256 !== deployedSourceSha256) process.exitCode = 1;
