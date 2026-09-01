import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock3, ExternalLink, LoaderCircle } from 'lucide-react';
import { Horizon } from '@stellar/stellar-sdk';
import type { TransactionHistoryProps } from '@/types';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
interface HistoryItem { hash: string; createdAt: string; successful: boolean; }

export default function TransactionHistory({ publicKey, refreshKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    void horizon.transactions().forAccount(publicKey).limit(5).order('desc').call()
      .then((page) => {
        if (!isMounted) return;
        setTransactions(page.records.map((record) => ({ hash: record.hash, createdAt: record.created_at, successful: record.successful })));
      })
      .catch(() => { if (isMounted) setError('Transaction history is unavailable right now.'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [publicKey, refreshKey]);

  return (
    <section className="panel">
      <div className="flex items-center justify-between"><div className="section-heading"><div className="section-icon slate"><Clock3 size={18} /></div><div><h2>Recent activity</h2><p>Your last five testnet transactions.</p></div></div><span className="count-badge">{transactions.length}</span></div>
      <div className="mt-5 divide-y divide-slate-100">
        {isLoading && <div className="empty-state"><LoaderCircle size={20} className="animate-spin text-sky-600" /><span>Loading activity…</span></div>}
        {!isLoading && error && <div className="empty-state text-red-600">{error}</div>}
        {!isLoading && !error && transactions.length === 0 && <div className="empty-state">No transactions yet. Your activity will appear here.</div>}
        {!isLoading && !error && transactions.map((transaction) => (
          <a key={transaction.hash} href={`https://stellar.expert/explorer/testnet/tx/${transaction.hash}`} target="_blank" rel="noreferrer" className="transaction-row">
            <div className={`transaction-icon ${transaction.successful ? 'positive' : 'negative'}`}>{transaction.successful ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{transaction.hash}</p><p className="mt-1 text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleString()}</p></div><ExternalLink size={15} className="shrink-0 text-slate-400" />
          </a>
        ))}
      </div>
    </section>
  );
}
