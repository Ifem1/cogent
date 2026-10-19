'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/wallet';
import { isHexAddress,toWei } from '@/lib/amounts';
export default function NewMandate(){const w=useWallet(),r=useRouter();const[error,setError]=useState(''),[status,setStatus]=useState('');
 const[title,setTitle]=useState(''),[agent,setAgent]=useState(''),[policy,setPolicy]=useState(''),[sources,setSources]=useState(''),[budget,setBudget]=useState(''),[per,setPer]=useState(''),[vendorCap,setVendorCap]=useState(''),[duration,setDuration]=useState('7');
 async function submit(e:React.FormEvent){e.preventDefault();setError('');setStatus('');try{
  if(!isHexAddress(agent))throw new Error('Enter a valid authorised agent address.');
  const prefixes=sources.split('\n').map(x=>x.trim()).filter(Boolean);
  if(!prefixes.length||prefixes.length>3||prefixes.some(s=>!s.startsWith('https://')||!s.endsWith('/')))throw new Error('Use 1–3 plain HTTPS prefixes, one per line, each ending with /.');
  if(!Number.isInteger(Number(duration))||+duration<1||+duration>90)throw new Error('Duration must be 1–90 days.');
  const funded=toWei(budget),each=toWei(per),vendor=toWei(vendorCap);
  if(vendor>funded||each>vendor)throw new Error('Per-purchase cap ≤ per-vendor cap ≤ funded budget required.');
  const expiry=Math.floor(Date.now()/1000)+Number(duration)*86400;
  setStatus('Submitting and awaiting GenLayer finalization…');
  const hash=await w.write('create_mandate',[agent,title,policy,JSON.stringify(prefixes),each,vendor,expiry],funded);
  setStatus(`Transaction finalized: ${hash}. Checking its outcome in the registry.`);
  r.push('/mandates');r.refresh();
 }catch(err){setStatus('');setError(err instanceof Error?err.message:String(err))}}
 return <><div className="pagehead"><span className="eyebrow">01 / DEFINE AUTHORITY</span><h1>Create a mandate.</h1><p>Set a fixed budget and the precise commercial conditions your agent must satisfy. The contract permanently freezes these fields at funding.</p></div><div className="detailgrid"><form className="form card" onSubmit={submit}>
 <label>Mandate title<input required minLength={5} maxLength={90} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Commercial data procurement"/></label>
 <label>Authorised agent wallet<input required value={agent} onChange={e=>setAgent(e.target.value)} placeholder="0x..."/><small>Only this address may propose purchases. No key is stored by Cogent.</small></label>
 <label>Compliance policy<textarea required minLength={40} maxLength={2400} value={policy} onChange={e=>setPolicy(e.target.value)} placeholder="Commercial use must be explicitly permitted. Automated processing must be allowed. Customer inputs must never be used to train a third-party model. Recurring subscriptions must be forbidden. If any condition is unclear, classify INCONCLUSIVE."/><small>Write independently checkable conditions. Ambiguity produces no approval.</small></label>
 <label>Approved HTTPS source prefixes<textarea required value={sources} onChange={e=>setSources(e.target.value)} placeholder={'https://raw.githubusercontent.com/organisation/vendor-evidence/\nhttps://vendor.example.com/legal/'} /><small>1–3, one per line, with trailing /. Avoid query strings and credentials. Prefixes are frozen at creation.</small></label>
 <div className="grid two"><label>Funded budget (GEN)<input required inputMode="decimal" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="1"/></label><label>Per-purchase limit (GEN)<input required inputMode="decimal" value={per} onChange={e=>setPer(e.target.value)} placeholder="0.2"/></label></div>
 <div className="grid two"><label>Cumulative vendor cap (GEN)<input required inputMode="decimal" value={vendorCap} onChange={e=>setVendorCap(e.target.value)} placeholder="0.4"/></label><label>Mandate duration (days)<input required type="number" min="1" max="90" value={duration} onChange={e=>setDuration(e.target.value)}/></label></div>
 <button className="btn accent" disabled={w.busy||!w.address||!w.networkOk}>{w.busy?'Awaiting finalization…':'Fund and freeze mandate ↗'}</button>
 {status&&<p role="status" className="small success">{status}</p>}{error&&<p className="small error" role="alert">{error}</p>}
 </form><div><div className="card"><span className="eyebrow">SAFETY BEFORE SPENDING</span><h3 style={{marginTop:10}}>Your agent cannot rewrite this policy.</h3><p className="muted">Funds are escrowed on GenLayer. An independent vendor must accept each proposal. Validators check the approved evidence against the frozen policy, and payment requires an agreed compliance decision plus challenge finality.</p><hr className="divider"/><p className="small muted">Invalid payable creation requests are returned as on-chain withdrawable credits. Transaction execution fees remain separate from the escrow amount.</p></div></div></div></>}
