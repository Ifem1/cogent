import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';
import type { CalldataEncodable } from 'genlayer-js/types';
import type { Mandate, Proposal, Accounting } from './types';

export const CONTRACT = (process.env.NEXT_PUBLIC_COGENT_CONTRACT ?? '').trim();
export const configured = /^0x[a-fA-F0-9]{40}$/.test(CONTRACT);
export const CHAIN_ID = 61999;
// Account-free public reads. Never generate or store a browser private key.
const publicClient = createClient({ chain: studionet });
function parse<T>(data:unknown): T { return typeof data === 'string' ? JSON.parse(data) as T : data as T; }
export async function read(functionName:string,args:CalldataEncodable[]=[]):Promise<unknown> {
  if (!configured) throw new Error('Cogent has not been deployed. Set NEXT_PUBLIC_COGENT_CONTRACT to the verified Studionet address.');
  return await publicClient.readContract({address:CONTRACT as `0x${string}`,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
}
export async function getMandate(id:number):Promise<Mandate>{return parse<Mandate>(await read('get_mandate',[id]));}
export async function getProposal(id:number):Promise<Proposal>{return parse<Proposal>(await read('get_proposal',[id]));}
export async function getAccounting():Promise<Accounting>{return parse<Accounting>(await read('get_accounting'));}
export async function listMandates():Promise<Mandate[]> {
  const count = Number(await read('get_mandate_count'));
  if(!Number.isSafeInteger(count)||count<0||count>250) throw new Error('Registry exceeds the supported bounded read window.');
  const result:Mandate[]=[];
  for(let start=1;start<=count;start+=5) {
    result.push(...(await Promise.all(Array.from({length:Math.min(5,count-start+1)},(_,i)=>getMandate(start+i)))));
  }
  return result;
}
export async function listProposals():Promise<Proposal[]> {
  const count = Number(await read('get_proposal_count'));
  if(!Number.isSafeInteger(count)||count<0||count>250) throw new Error('Registry exceeds the supported bounded read window.');
  const result:Proposal[]=[];
  for(let start=1;start<=count;start+=5) {
    result.push(...(await Promise.all(Array.from({length:Math.min(5,count-start+1)},(_,i)=>getProposal(start+i)))));
  }
  return result;
}
