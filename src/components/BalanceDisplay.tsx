import { useEffect } from 'react';
import { CircleDollarSign, ExternalLink, Gift, LoaderCircle, RefreshCw } from 'lucide-react';
import type { BalanceDisplayProps } from '@/types';

export default function BalanceDisplay({ publicKey, balance, isLoading, onRefresh, onFund, isFunding }: BalanceDisplayProps) {
  useEffect(() => {
    onRefresh();
  }, [publicKey, onRefresh]);

  return (
    <section className="balance-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <CircleDollarSign size={15} className="text-sky-600" />
            Available balance
          </div>
          <div className="flex items-end gap-2">
            <span className="balance-value">{isLoading ? '—' : balance ?? '0.00'}</span>
            <span className="mb-2 text-sm font-semibold text-slate-500">XLM</span>
          </div>
        </div>
        <button onClick={onRefresh} disabled={isLoading} className="icon-button soft" title="Refresh balance" aria-label="Refresh balance">
          <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
        <span className="text-xs text-slate-500">Stellar Testnet</span>
        <button onClick={() => void onFund()} disabled={isFunding} className="secondary-button">
          {isFunding ? <LoaderCircle size={15} className="animate-spin" /> : <Gift size={15} />}
          {isFunding ? 'Funding wallet…' : 'Get test XLM'}
          <ExternalLink size={13} />
        </button>
      </div>
    </section>
  );
}
