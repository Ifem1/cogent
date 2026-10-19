/** Read-only exact-wei live auditor. No private keys, no transaction submission. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';

const address=process.env.COGENT_CONTRACT || process.env.NEXT_PUBLIC_COGENT_CONTRACT;
if(!/^0x[a-fA-F0-9]{40}$/.test(address||''))throw Error('Set verified COGENT_CONTRACT=0x…');
const c=createClient({chain:studionet});
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const localSource=fs.readFileSync(path.join(root,'contracts/cogent.py'));
const deployedSource=await c.getContractCode(address);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const sourceSha256=sha(localSource),deployedSourceSha256=sha(Buffer.from(deployedSource,'utf8'));
const read=async(method,args=[])=>c.readContract({address,functionName:method,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
const json=async(method,args=[])=>{const x=await read(method,args);return typeof x==='string'?JSON.parse(x):x};
const asBig=x=>BigInt(String(x));
const nMandates=Number(await read('get_mandate_count'));
const nProposals=Number(await read('get_proposal_count'));
if(!Number.isSafeInteger(nMandates)||!Number.isSafeInteger(nProposals)||nMandates<0||nProposals<0||nMandates>250||nProposals>250)throw Error('Registry over bounded client scan limit');
const mandates=[];const proposals=[];
for(let id=1;id<=nMandates;id++)mandates.push(await json('get_mandate',[id]));
for(let id=1;id<=nProposals;id++)proposals.push(await json('get_proposal',[id]));
const err=[];
if(sourceSha256!==deployedSourceSha256)err.push('Deployed source does not match local audited source');
for(const m of mandates){
 const total=asBig(m.available)+asBig(m.reserved)+asBig(m.paid)+asBig(m.refunded);
 if(total!==asBig(m.funded))err.push(`Mandate ${m.id}: ${total} != funded ${m.funded}`);
 const expectedReserve=proposals.filter(p=>p.mandate_id===m.id&&!['RELEASED','REFUSED','CANCELLED'].includes(p.status)).reduce((a,p)=>a+asBig(p.amount),0n);
 if(expectedReserve!==asBig(m.reserved))err.push(`Mandate ${m.id}: reserved proposal sum mismatch`);
 const offers=proposals.filter(p=>p.mandate_id===m.id);
 const paid=offers.filter(p=>p.status==='RELEASED').reduce((sum,p)=>sum+asBig(p.amount),0n);
 if(paid!==asBig(m.paid))err.push(`Mandate ${m.id}: released proposal sum mismatch`);
 if(m.closed&&asBig(m.available)!==0n)err.push(`Mandate ${m.id}: closed budget is spendable`);
 const commitments=new Map();
 for(const p of offers.filter(p=>!['REFUSED','CANCELLED'].includes(p.status))){
  commitments.set(p.vendor,(commitments.get(p.vendor)||0n)+asBig(p.amount));
 }
 for(const [vendor,amount] of commitments)if(amount>asBig(m.per_vendor_cap))err.push(`Mandate ${m.id}: vendor ${vendor} exceeds cap`);
}
const books=await json('get_accounting');
if(asBig(books.bonds_received)!==asBig(books.bonds_locked)+asBig(books.bonds_returned)+asBig(books.bonds_forfeited))err.push('Bond conservation mismatch');
const proposalBonds=proposals.reduce((sum,p)=>sum+asBig(p.bond),0n);
if(proposalBonds!==asBig(books.bonds_locked))err.push('Proposal bond sum mismatch');
const parties=[...new Set([...mandates.flatMap(m=>[m.owner,m.agent]),...proposals.flatMap(p=>[p.vendor,p.challenger].filter(Boolean))])];
const partyBooks=[];
for(const party of parties)partyBooks.push({address:party,owed:String(await read('owed_to',[party])),lastRefusal:await read('last_refusal_of',[party])});
const report={network:'GenLayer Studionet',chainId:61999,contract:address,sourceSha256,deployedSourceSha256,generatedAt:new Date().toISOString(),mandates:nMandates,proposals:nProposals,books,partyBooks,rows:mandates,offerRows:proposals,errors:err};
const destination=path.join(root,'docs/evidence/live-read-audit.json');
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,JSON.stringify(report,null,2));
console.log(`Cogent audit: ${nMandates} mandates, ${nProposals} proposals, ${err.length} invariant failures`);
if(err.length){console.error(err.join('\n'));process.exitCode=1}
else console.log('Live read invariants PASS (read-only; no transaction-execution proof implied)');
