'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/components/wallet';
import { read, listProposals } from '@/lib/client';
import { gen, short } from '@/lib/amounts';
import type { Proposal } from '@/lib/types';
import { Call, Empty, Pill } from '@/components/ui';

function activityError(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  if (/failed to fetch|networkerror|load failed|timed? ?out/i.test(detail)) {
    return 'Studionet could not be reached just now. Refresh to retry; this page only reads contract state and has not submitted a transaction.';
  }
  return `Could not load contract activity from Studionet. Refresh to retry. ${detail}`;
}

export default function Activity() {
  const wallet = useWallet();
  const [credit, setCredit] = useState<unknown>();
  const [pendingWithdrawal, setPendingWithdrawal] = useState('0');
  const [refusal, setRefusal] = useState('');
  const [items, setItems] = useState<Proposal[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError('');

    if (!wallet.address) {
      setItems([]);
      setCredit(undefined);
      setPendingWithdrawal('0');
      setRefusal('');
      setLoading(false);
      return;
    }

    try {
      const all = await listProposals();
      const [nextCredit, nextPendingWithdrawal, nextRefusal] = await Promise.all([
        read('owed_to', [wallet.address]),
        read('withdrawal_pending_for', [wallet.address]),
        read('last_refusal_of', [wallet.address]),
      ]);

      if (requestId.current !== currentRequest) return;
      const account = wallet.address.toLowerCase();
      setItems(all.filter(proposal =>
        [proposal.principal, proposal.agent, proposal.vendor]
          .some(role => role.toLowerCase() === account),
      ).reverse());
      setCredit(nextCredit);
      setPendingWithdrawal(String(nextPendingWithdrawal));
      setRefusal(String(nextRefusal));
    } catch (cause) {
      if (requestId.current === currentRequest) setError(activityError(cause));
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => { void refresh(); }, [refresh]);

  return <>
    <div className="pagehead">
      <span className="eyebrow">NO BACKEND INDEXER REQUIRED</span>
      <h1>Your contract activity.</h1>
      <p>Credits and proposal states come directly from GenLayer&apos;s finalized contract reads, scoped to your external wallet.</p>
    </div>
    {error && <div className="banner" role="alert">{error}</div>}
    {wallet.address ? <>
      <div className="grid two">
        <div className="card">
          <span className="eyebrow">YOUR WALLET</span>
          <h3 style={{ margin: '12px 0' }}>{short(wallet.address)}</h3>
          <p className="muted">Use the connected address to make authorised transactions.</p>
        </div>
        <div className="card">
          <span className="eyebrow">CREDITED FUNDS</span>
          <h2 style={{ margin: '12px 0' }}>{credit === undefined ? '—' : `${gen(credit)} GEN`}</h2>
          {BigInt(pendingWithdrawal) > 0n ? <>
            <p className="muted">A transfer was requested. Check this wallet&apos;s GEN balance and confirm only after the payment arrived. The recorded credit cannot be sent again while pending.</p>
            <Call name="confirm_withdrawal" confirm="Confirm only after you have verified that the GEN transfer reached this wallet. This clears the recorded credit and cannot be undone." after={refresh} />
          </> : credit !== undefined && BigInt(String(credit)) > 0n && <Call name="withdraw" after={refresh} />}
          <button className="btn ghost tiny" onClick={() => void refresh()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
      {refusal && <p className="banner">Most recent refused payable transaction: {refusal}. Its value was credited for withdrawal, not silently absorbed.</p>}
      <section className="section">
        <h2 style={{ marginBottom: 20 }}>Related proposals</h2>
        {items.length ? <div className="grid">{items.map(proposal =>
          <Link className="card item" key={proposal.id} href={`/proposals/${proposal.id}`}>
            <div className="row"><span className="eyebrow">#{proposal.id}</span><Pill status={proposal.status} /></div>
            <h3>{gen(proposal.amount)} GEN</h3>
            <span className="mono">{short(proposal.vendor)}</span>
          </Link>,
        )}</div> : <Empty title="No activity for this wallet" detail="Agent proposals, vendor acceptances, challenges and finalization will appear here from actual on-chain state." />}
      </section>
    </> : <Empty title="Connect your external wallet" detail="Wallet connection determines which principal, agent and vendor actions you can take. Public mandate records remain accessible without connection." />}
  </>;
}
