/**
 * Submit one Studionet write using an encrypted local GenLayer keystore.
 * Usage: node scripts/live-tx.mjs <account-name> <method> '<JSON args>' [value-wei]
 * Encode uint arguments larger than Number.MAX_SAFE_INTEGER as {"$int":"..."}.
 * This helper never reads or writes private keys outside the encrypted keystore
 * and never accepts passwords or private keys on the command line.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { Wallet } from 'ethers';
import { createAccount, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const [accountName, method, rawArgs, rawValue = '0'] = process.argv.slice(2);
if (!accountName || !/^[a-zA-Z0-9_-]+$/.test(accountName) || !method || !rawArgs) {
  console.error("Usage: node scripts/live-tx.mjs <account-name> <method> '<JSON args>' [value-wei]");
  process.exit(2);
}
const address = process.env.COGENT_CONTRACT;
if (!/^0x[a-fA-F0-9]{40}$/.test(address || '')) throw new Error('Set COGENT_CONTRACT to the verified Studionet address.');
if (!/^\d+$/.test(rawValue)) throw new Error('value-wei must be a non-negative integer.');

function decode(value) {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === 'object') {
    if (Object.keys(value).length === 1 && typeof value.$int === 'string' && /^-?\d+$/.test(value.$int)) return BigInt(value.$int);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item)]));
  }
  return value;
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

const keystorePath = path.join(os.homedir(), '.genlayer', 'keystores', `${accountName}.json`);
const keystore = fs.readFileSync(keystorePath, 'utf8');
const password = await promptPassword();
const wallet = await Wallet.fromEncryptedJson(keystore, password);
const client = createClient({ chain: studionet, account: createAccount(wallet.privateKey) });
await client.initializeConsensusSmartContract();
const args = decode(JSON.parse(rawArgs));
const txHash = await client.writeContract({
  address,
  functionName: method,
  args,
  value: BigInt(rawValue),
});
console.log(`Submitted ${method}: ${txHash}`);
await client.waitForTransactionReceipt({
  hash: txHash,
  status: 'FINALIZED',
  interval: 10000,
  retries: 120,
});
const receipt = await client.getTransaction({ hash: txHash });
if (receipt.statusName !== 'FINALIZED') {
  throw new Error(`Transaction did not finalize (status=${receipt.statusName ?? receipt.status}).`);
}
console.log(JSON.stringify({
  hash: receipt.hash ?? txHash,
  status: receipt.statusName,
  consensus: receipt.resultName ?? null,
  sender: receipt.from_address ?? receipt.sender ?? null,
  contract: receipt.to_address ?? receipt.recipient ?? null,
  transactionResult: receipt.txExecutionResultName ?? receipt.txExecutionResult ?? null,
  execution: (receipt.consensus_data?.leader_receipt ?? []).map((item) => ({
    executionResult: item.execution_result ?? null,
    errorCode: item.genvm_result?.error_code ?? null,
    errorDescription: item.genvm_result?.error_description ?? null,
  })),
  validators: Object.values(receipt.consensus_data?.votes ?? {}),
}, null, 2));
