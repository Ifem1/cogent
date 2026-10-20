/**
 * Import a user-authorized test wallet into the local encrypted GenLayer keystore.
 * Usage: node scripts/import-encrypted-wallet.mjs <account-name> [--overwrite]
 * The private key and keystore password are read from a masked TTY prompt; neither
 * is accepted on the command line or written to an unencrypted file.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Wallet } from 'ethers';

const [name, option] = process.argv.slice(2);
if (!name || !/^[a-zA-Z0-9_-]+$/.test(name) || (option && option !== '--overwrite')) {
  console.error('Usage: node scripts/import-encrypted-wallet.mjs <account-name> [--overwrite]');
  process.exit(2);
}
if (!process.stdin.isTTY || !process.stdin.setRawMode) throw new Error('Run this helper in an interactive terminal.');

function readHidden(label) {
  return new Promise((resolve, reject) => {
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

const inputKey = (await readHidden('Private key: ')).trim();
const privateKey = inputKey.startsWith('0x') ? inputKey : `0x${inputKey}`;
if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) throw new Error('Private key must be 32 bytes of hex.');
const password = await readHidden('New keystore password: ');
if (password.length < 20) throw new Error('Use a keystore password of at least 20 characters.');
if (password !== await readHidden('Repeat keystore password: ')) throw new Error('Passwords do not match.');

const directory = path.join(os.homedir(), '.genlayer', 'keystores');
fs.mkdirSync(directory, { recursive: true });
const destination = path.join(directory, `${name}.json`);
if (fs.existsSync(destination) && option !== '--overwrite') throw new Error(`Keystore already exists: ${destination}`);
const wallet = new Wallet(privateKey);
const encrypted = await wallet.encrypt(password);
fs.writeFileSync(destination, encrypted, { encoding: 'utf8', flag: option === '--overwrite' ? 'w' : 'wx' });
console.log(`Encrypted account '${name}' saved locally at ${destination}.`);
console.log(`Address: ${wallet.address}`);
