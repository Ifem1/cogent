'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton, WalletProvider } from './wallet';
import { ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';
const links=[['/','Overview'],['/mandates','Mandates'],['/activity','Activity'],['/accounting','Accounting'],['/about','How it works']];
export function Shell({children}:{children:React.ReactNode}) {const path=usePathname();return <WalletProvider><div className="app">
 <header className="topbar"><Link className="brand" href="/"><span className="brandicon"><ShieldCheck size={19}/></span>COGENT<span className="branddot">.</span></Link>
 <nav aria-label="Main navigation">{links.map(([href,label])=><Link className={path===href || (href==='/mandates'&&path.startsWith('/mandates'))?'active':''} href={href} key={href}>{label}</Link>)}</nav>
 <WalletButton/></header><main className="main">{children}</main>
 <footer className="footer"><span><Sparkles size={13}/> Authority before execution.</span><span>GenLayer Studionet · <a href="/about">Protocol docs <ArrowUpRight size={12}/></a></span></footer>
 </div></WalletProvider>}
