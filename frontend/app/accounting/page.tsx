'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {getAccounting,listMandates,configured} from '@/lib/client';
import type {Accounting,Mandate} from '@/lib/types';
import {asBig,gen} from '@/lib/amounts';
import {Empty} from '@/components/ui';
export default function AccountingPage(){
 const[books,setBooks]=useState<Accounting>();const[rows,setRows]=useState<Mandate[]>([]);const[error,setError]=useState('');
 const refresh=useCallback(async()=>{setError('');try{const[b,m]=await Promise.all([getAccounting(),listMandates()]);setBooks(b);setRows(m)}catch(e){setError(e instanceof Error?e.message:String(e))}},[]);
 useEffect(()=>{if(configured)void refresh()},[refresh]);
 const conserved=(m:Mandate)=>asBig(m.funded)===asBig(m.available)+asBig(m.reserved)+asBig(m.paid)+asBig(m.refunded);
 return <><div className="pagehead"><span className="eyebrow">EXACT WEI · FINALIZED PUBLIC READS</span><h1>Follow the funds.</h1><p>Paid and refunded amounts are credited obligations. Successful outbound transfers must be verified separately from these books.</p><button className="btn ghost" onClick={()=>void refresh()}>Refresh accounting</button></div>
 {error&&<p className="banner" role="alert">{error}</p>}
 {!configured?<Empty title="Deployment pending" detail="Accounting appears after a verified contract is configured."/>:!books?<p>Reading contract books…</p>:<>
 <div className="grid">{[['Withdrawable credits',books.owed],['Locked bonds',books.bonds_locked],['Rejected payable value',books.refused_payable_value]].map(([label,value])=><div className="card" key={label}><span className="eyebrow">{label}</span><h2>{gen(value)} GEN</h2><p className="mono">{value} wei</p></div>)}</div>
 <section className="card section"><h2>Challenge bond conservation</h2><p className={asBig(books.bonds_received)===asBig(books.bonds_locked)+asBig(books.bonds_returned)+asBig(books.bonds_forfeited)?'success':'error'}>Received = locked + returned + forfeited</p><div className="policyText mono">{books.bonds_received} = {books.bonds_locked} + {books.bonds_returned} + {books.bonds_forfeited} wei</div></section>
 <section className="section"><h2>Mandate conservation</h2><div className="grid section">{rows.map(m=><article key={m.id} className="card"><Link href={`/mandates/${m.id}`}><h3>#{m.id} · {m.title}</h3></Link><p className={conserved(m)?'success':'error'}>{conserved(m)?'Conserved':'Invariant failure'}</p><p className="small">Funded = available + reserved + paid + refunded</p><div className="policyText mono">{m.funded} = {m.available} + {m.reserved} + {m.paid} + {m.refunded} wei</div></article>)}</div></section></>}
 </>;
}
