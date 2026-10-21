'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from 'genlayer-js';
import { TransactionStatus, type CalldataEncodable, type TransactionHash } from 'genlayer-js/types';
import { assertSuccessfulReceipt } from '@/lib/receipts';
import { studionet } from 'genlayer-js/chains';
import { CHAIN_ID, CONTRACT, configured } from '@/lib/client';
import { short } from '@/lib/amounts';

type Provider = {request:(req:{method:string;params?:unknown[]|object})=>Promise<unknown>;on?:(e:string,cb:(x:unknown)=>void)=>void;removeListener?:(e:string,cb:(x:unknown)=>void)=>void};
declare global {interface Window {ethereum?:Provider}}
type WalletApi={address:string;networkOk:boolean;busy:boolean;connect:()=>Promise<void>;disconnect:()=>void;switchNetwork:()=>Promise<void>;write:(method:string,args:unknown[],value?:bigint)=>Promise<string>};
const Ctx=createContext<WalletApi|null>(null);
export const useWallet=()=>{const v=useContext(Ctx);if(!v)throw new Error('Wallet provider missing');return v};
export function WalletProvider({children}:{children:React.ReactNode}){
 const [address,setAddress]=useState(''); const [networkOk,setNetworkOk]=useState(false);const [busy,setBusy]=useState(false);
 const pending=useRef(false);
 const refresh=useCallback(async()=>{
  if(!window.ethereum){setNetworkOk(false);return}
  try{const chain=String(await window.ethereum.request({method:'eth_chainId'}));setNetworkOk(parseInt(chain,16)===CHAIN_ID)}catch{setNetworkOk(false)}
 },[]);
 useEffect(()=>{
  const e=window.ethereum;if(!e)return;
  const accounts=(a:unknown)=>setAddress(Array.isArray(a)&&typeof a[0]==='string'?a[0]:'');
  const changed=()=>void refresh();
  e.on?.('accountsChanged',accounts);e.on?.('chainChanged',changed);
  void refresh();
  // Do not auto-connect: require deliberate wallet permission.
  return()=>{e.removeListener?.('accountsChanged',accounts);e.removeListener?.('chainChanged',changed)};
 },[refresh]);
 async function connect(){if(!window.ethereum)throw new Error('Install an external EIP-1193 wallet, such as MetaMask.');
  const accounts=await window.ethereum.request({method:'eth_requestAccounts'});
  if(!Array.isArray(accounts)||typeof accounts[0]!=='string')throw new Error('Wallet returned no account');
  setAddress(accounts[0]);await refresh();
 }
 function disconnect(){setAddress('');setNetworkOk(false)}
 async function switchNetwork(){if(!window.ethereum)throw new Error('No injected wallet');
  try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xF22F'}]})}
  catch(error){if((error as {code?:number}).code!==4902)throw error;await window.ethereum.request({method:'wallet_addEthereumChain',params:[{chainId:'0xF22F',chainName:'GenLayer Studionet',rpcUrls:['https://studio.genlayer.com/api'],nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18}}]});await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xF22F'}]})}
  await refresh();
 }
 const write=useCallback(async(method:string,args:unknown[],value?:bigint):Promise<string>=>{
  const provider=window.ethereum;if(!provider||!address)throw new Error('Connect your external wallet before writing.');
  if(!networkOk)throw new Error('Switch wallet to GenLayer Studionet (61999).');
  if(!configured)throw new Error('Verified Cogent contract address not configured.');
  if(pending.current)throw new Error('A transaction is already pending.');
  pending.current=true;
  setBusy(true);
  try {
   const client=createClient({chain:studionet,provider:provider as never,account:address as `0x${string}`});
   const liveChain=String(await provider.request({method:'eth_chainId'}));
   const liveAccounts=await provider.request({method:'eth_accounts'});
   if(BigInt(liveChain)!==BigInt(CHAIN_ID)||!Array.isArray(liveAccounts)||String(liveAccounts[0]).toLowerCase()!==address.toLowerCase())throw new Error('Wallet account or network changed. Reconnect before submitting.');
   const waitFinalized=async(hash:TransactionHash,receiptMethod:string)=>{
    await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:240,interval:3000});
    const receipt=await client.getTransaction({hash});
    assertSuccessfulReceipt(receipt,receiptMethod);
   };
   const tx={address:CONTRACT as `0x${string}`,functionName:method,args:args as CalldataEncodable[],value:value??0n};
   const hash=await client.writeContract(tx) as TransactionHash;
   await waitFinalized(hash,method);
   return hash;
  } finally {pending.current=false;setBusy(false)}
 },[address,networkOk]);
 return <Ctx.Provider value={{address,networkOk,busy,connect,disconnect,switchNetwork,write}}>{children}</Ctx.Provider>
}
export function WalletButton(){const w=useWallet();const[error,setError]=useState('');const[copied,setCopied]=useState(false);
 async function copyAddress(){try{await navigator.clipboard.writeText(w.address);setError('');setCopied(true);window.setTimeout(()=>setCopied(false),1600)}catch{setError('Could not copy wallet address. Copy it from your wallet app.')}}
 return <div className="walletcluster">
 {error&&<span className="walletError" role="alert">{error}</span>}
 {!w.address?<button className="btn accent" onClick={()=>w.connect().catch(e=>setError(String(e.message)))}>Connect wallet</button>:
 <><span className="walletaddr">{short(w.address)}</span>{!w.networkOk?<button className="btn warning" onClick={()=>w.switchNetwork().catch(e=>setError(e.message))}>Switch network</button>:<span className="network">● Studionet · 61999</span>}<button className="btn ghost tiny" onClick={()=>void copyAddress()}>{copied?'Copied':'Copy address'}</button><button className="btn ghost tiny" onClick={()=>{setCopied(false);w.disconnect()}}>Disconnect</button></>}
 </div>
}
