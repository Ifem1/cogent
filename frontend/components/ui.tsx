'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from './wallet';
import { gen,short } from '@/lib/amounts';
import Link from 'next/link';
export function Pill({status}:{status:string}){return <span className={`pill ${/REFUSED|NON_COMPLIANT|CANCELLED/.test(status)?'negative':/RELEASED|COMPLIANT|READY/.test(status)?'positive':''}`}>{status.replaceAll('_',' ')}</span>}
export function Stat({label,value,sub}:{label:string;value:string;sub?:string}){return <div className="stat card"><span className="eyebrow">{label}</span><strong>{value}</strong>{sub&&<span className="muted">{sub}</span>}</div>}
export function Account({address}:{address:string}){return <span className="mono">{short(address)}</span>}
export function Money({value}:{value:unknown}){return <span>{gen(value)} <small>GEN</small></span>}
export function Call({name,args=[],value,confirm,after}:{name:string;args?:unknown[];value?:bigint;confirm?:string;after?:()=>void|Promise<void>}) {
 const w=useWallet(),r=useRouter();const[message,setMessage]=useState('');const[error,setError]=useState('');
 return <div className="call"><button disabled={w.busy||!w.address||!w.networkOk} className="btn accent" onClick={async()=>{
  if(confirm&&!window.confirm(confirm))return;
  setError('');setMessage('Waiting for wallet and GenLayer finalization…');
  try{const hash=await w.write(name,args,value);setMessage('Finalized: '+short(hash));await after?.();r.refresh()}
  catch(e){setMessage('');setError(e instanceof Error?e.message:String(e))}
 }}>{w.busy?'Processing…':name.replaceAll('_',' ')}</button>{message&&<p role="status" className="small success">{message}</p>}{error&&<p role="alert" className="small error">{error}</p>}</div>
}
export function Empty({title,detail,href,action}:{title:string;detail:string;href?:string;action?:string}){return <div className="empty card"><div className="emptyicon">∅</div><h3>{title}</h3><p>{detail}</p>{href&&<Link href={href} className="btn accent">{action??'Get started'} ↗</Link>}</div>}
