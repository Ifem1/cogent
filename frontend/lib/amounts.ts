import { formatUnits, parseUnits } from 'viem';
export const toWei = (value: string): bigint => {
  if (!/^\d+(\.\d{1,18})?$/.test(value.trim())) throw new Error('Enter a positive GEN amount (maximum 18 decimals).');
  const wei = parseUnits(value.trim(), 18);
  if (wei <= 0n) throw new Error('Enter a positive GEN amount (maximum 18 decimals).');
  return wei;
};
export const asBig = (value: unknown): bigint => BigInt(String(value ?? '0'));
export const gen = (value: unknown): string => {
  const s = formatUnits(asBig(value), 18);
  if (!s.includes('.')) return s;
  return s.replace(/0+$/,'').replace(/\.$/, '');
};
export const bondWei = (amount: bigint): bigint => (amount * 500n + 9999n) / 10000n;
export const short = (s: string) => !s ? '—' : `${s.slice(0,6)}…${s.slice(-4)}`;
export const date = (ts:number) => !ts ? '—' : new Date(ts*1000).toLocaleString();
export const isHexAddress = (s:string) => /^0x[a-fA-F0-9]{40}$/.test(s) && !/^0x0{40}$/.test(s);
