import './globals.css';
import type { Metadata } from 'next';
import { Shell } from '@/components/shell';
export const metadata:Metadata={title:'Cogent | Authority before execution',description:'GenLayer-backed autonomous agent spending mandates. Agents propose. Validators verify. Deterministic code pays.'};
export default function Root({children}:{children:React.ReactNode}){return <html lang="en"><body><Shell>{children}</Shell></body></html>}
