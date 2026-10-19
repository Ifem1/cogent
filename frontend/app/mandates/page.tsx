'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { configured,listMandates } from '@/lib/client';
import { gen,short,date } from '@/lib/amounts';
import { Empty,Pill } from '@/components/ui';
import type { Mandate } from '@/lib/types';
export default function Mandates(){const[rows,setRows]=useState<Mandate[]>([]);const[error,setError]=useState('');const[loading,setLoading]=useState(true);
 useEffect(()=>{if(!configured){setLoading(false);return}listMandates().then(a=>setRows(a.reverse())).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <><div className="pagehead"><span className="eyebrow">PUBLIC MANDATE REGISTRY</span><h1>Authority in the open.</h1><p>Every entry is read from GenLayer&apos;s finalized contract state. IDs, balances and principals are not inferred from titles or mock feeds.</p><Link href="/mandates/new" className="btn accent">+ New mandate</Link></div>{error&&<div className="banner" role="alert">{error}</div>}{loading?<p className="muted">Reading finalized contract data…</p>:rows.length?<div className="grid">{rows.map(m=><Link href={`/mandates/${m.id}`} className="item card" key={m.id}><div className="row"><span className="eyebrow">MANDATE #{m.id}</span><Pill status={m.closed?'CLOSED':'ACTIVE'}/></div><h3>{m.title}</h3><p className="muted">Principal <span className="mono">{short(m.owner)}</span></p><div className="kv"><span>Available</span><strong>{gen(m.available)} GEN</strong></div><div className="kv"><span>Reserved</span><strong>{gen(m.reserved)} GEN</strong></div><p className="small muted">Expires {date(m.expires_at)}</p></Link>)}</div>:<Empty title="No mandates yet" detail="This registry intentionally remains empty until a real on-chain mandate is created." href="/mandates/new" action="Create a mandate"/>}</>}
