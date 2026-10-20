'use client';
import { useEffect,useState,useCallback,use } from 'react';
import Link from 'next/link';
import { useWallet } from '@/components/wallet';
import { getMandate,getProposal } from '@/lib/client';
import type { Mandate,Proposal } from '@/lib/types';
import { asBig,bondWei,date,gen,short } from '@/lib/amounts';
import { Call,Money,Pill } from '@/components/ui';
export default function ProposalDetail({params}:{params:Promise<{id:string}>}){const{id}=use(params),idn=Number(id);const[p,setP]=useState<Proposal>(),[m,setM]=useState<Mandate>(),[error,setError]=useState('');const w=useWallet();
 const refresh=useCallback(async()=>{try{const v=await getProposal(idn);setP(v);setM(await getMandate(v.mandate_id))}catch(e){setError(e instanceof Error?e.message:String(e))}},[idn]);
 useEffect(()=>{if(Number.isInteger(idn)&&idn>0)void refresh()},[idn,refresh]);
 if(!p||!m)return <div className="pagehead">{error||'Loading verified proposal…'}</div>;
 const now=Math.floor(Date.now()/1000),me=w.address.toLowerCase(),vendor=me===p.vendor.toLowerCase(),principal=me===p.principal.toLowerCase();
 const pending=p.review_due>0;const provisional=['PROVISIONAL_COMPLIANT','PROVISIONAL_NON_COMPLIANT'].includes(p.status);
 const refundable=['READY','RETRYABLE'].includes(p.status)&&(now>m.expires_at+3600||p.attempts>=3);
 const challenger=p.status==='PROVISIONAL_COMPLIANT'?principal:vendor;
 const challengeReviewEligible=now+1200<=Math.min(p.challenge_review_deadline,m.expires_at+3600);
 return <><div className="pagehead"><span className="eyebrow">PROPOSAL #{p.id} · MANDATE #{p.mandate_id}</span><h1>Evidence before<br/>execution.</h1><div className="buttons"><Pill status={p.status}/><Link className="btn ghost" href={`/mandates/${p.mandate_id}`}>← Mandate</Link></div></div>
 <div className="grid"><div className="stat card"><span className="eyebrow">Funds reserved</span><strong><Money value={p.amount}/></strong></div><div className="stat card"><span className="eyebrow">Provisional result</span><strong style={{fontSize:25}}>{p.provisional_code||'Awaiting review'}</strong></div><div className="stat card"><span className="eyebrow">Final result</span><strong style={{fontSize:25}}>{p.final_code||'Not finalized'}</strong></div></div>
 <div className="detailgrid section"><div className="card"><span className="eyebrow">FROZEN VENDOR EVIDENCE</span><h2 style={{margin:'10px 0 20px'}}>Offer under review</h2><div className="kv"><span>Offer reference</span><strong className="mono">{p.offer_ref}</strong></div><div className="kv"><span>Product or service</span><strong>{p.product}</strong></div><div className="kv"><span>Bound amount</span><strong><Money value={p.amount}/></strong></div><div className="kv"><span>Vendor</span><strong className="mono">{short(p.vendor)}</strong></div><div className="kv"><span>Principal</span><strong className="mono">{short(p.principal)}</strong></div><div className="kv"><span>Agent</span><strong className="mono">{short(p.agent)}</strong></div><div className="kv"><span>Accepted</span><strong>{date(p.accepted_at)}</strong></div><div className="kv"><span>Vendor evidence</span><a href={p.offer_url} target="_blank" rel="noreferrer" className="small" style={{color:'var(--accent)',overflowWrap:'anywhere'}}>Open the approved HTTPS source ↗</a></div><div className="kv"><span>Review attempts</span><strong>{p.attempts}</strong></div><div className="kv"><span>Challenge deadline</span><strong>{date(p.challenge_deadline)}</strong></div><div className="kv"><span>Challenge review cutoff</span><strong>{date(p.challenge_review_deadline)}</strong></div><div className="kv"><span>Challenge outcome</span><strong>{p.challenge_outcome||'—'}</strong></div></div>
 <div className="card"><span className="eyebrow">PERMISSIONED LIFECYCLE</span><h2 style={{margin:'10px 0 20px'}}>Available actions</h2><div style={{display:'grid',gap:17}}>
 {p.status==='AWAITING_VENDOR'&&vendor&&now<p.accept_by&&<Call name="accept_offer" args={[p.id]} after={refresh}/>}
 {p.status==='AWAITING_VENDOR'&&(now>=p.accept_by||principal)&&<Call name="cancel_unaccepted" args={[p.id]} after={refresh}/>}
 {['READY','RETRYABLE'].includes(p.status)&&!pending&&now<=m.expires_at+3600&&p.attempts<3&&(!p.last_attempt||now>=p.last_attempt+600)&&<Call name="request_review" args={[p.id]} after={refresh}/>}
 {p.status==='CHALLENGED'&&!pending&&p.challenge_attempts<3&&now+1200<=p.challenge_review_deadline&&(!p.last_attempt||now>=p.last_attempt+600)&&<Call name="request_review" args={[p.id]} after={refresh}/>}
 {pending&&now<=p.review_due&&<Call name="observe_review" args={[p.id]} after={refresh}/>}
 {pending&&now>p.review_due&&<Call name="expire_review" args={[p.id]} after={refresh}/>}
 {provisional&&challenger&&now<p.challenge_deadline&&challengeReviewEligible&&<><p className="small muted">Exact bond required: <b>{gen(bondWei(asBig(p.amount)))} GEN</b>. A merits-upheld challenge forfeits the bond; if evidence or network problems prevent adjudication, the previous decision stands and the bond is returned.</p><Call name="challenge" args={[p.id]} value={bondWei(asBig(p.amount))} confirm="Challenge with the exact 5% GEN bond? If the second review confirms the original decision, this bond is forfeited." after={refresh}/></>}
 {provisional&&now>=p.challenge_deadline&&<Call name="finalize" args={[p.id]} after={refresh}/>}
 {p.status==='CHALLENGED'&&(p.challenge_attempts>=3||now>=p.challenge_review_deadline)&&(!pending||now>p.review_due)&&<Call name="expire_challenge" args={[p.id]} after={refresh}/>}
 {refundable&&(!pending||now>p.review_due)&&<Call name="expire_unresolved" args={[p.id]} after={refresh}/>}
 {['RELEASED','REFUSED','CANCELLED'].includes(p.status)&&<p className="success">Terminal state recorded. Withdrawable credits are available on Activity to their owners.</p>}
 {!w.address&&<p className="small muted">Connect your external wallet to see actions permitted for your address. Public evidence remains visible without a wallet.</p>}
 <button className="btn ghost" onClick={()=>void refresh()}>Refresh live state</button>
 </div></div></div>
 <section className="section grid two"><div className="card"><span className="eyebrow">PRIMARY MANIFEST</span><h3 style={{margin:'10px 0'}}>Initial independent review</h3><pre className="policyText">{p.primary_manifest?JSON.stringify(JSON.parse(p.primary_manifest),null,2):'No consensus record yet.'}</pre></div><div className="card"><span className="eyebrow">CHALLENGE MANIFEST</span><h3 style={{margin:'10px 0'}}>Second independent review</h3><pre className="policyText">{p.challenge_manifest?JSON.stringify(JSON.parse(p.challenge_manifest),null,2):'No challenge review recorded.'}</pre></div></section>
 <p className="small muted section">Finalized accounting follows contract state. Transaction acceptance and execution are different; Cogent waits for actual successful finalization before showing success.</p></>}
