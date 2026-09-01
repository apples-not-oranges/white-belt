import { useCallback, useState } from 'react';
import { CircleHelp, Github, ShieldCheck, Sparkles } from 'lucide-react';
import { Horizon } from '@stellar/stellar-sdk';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';
import TransactionFeedback from '@/components/TransactionFeedback';
import TransactionHistory from '@/components/TransactionHistory';
import WalletConnection from '@/components/WalletConnection';
import type { TransactionResult } from '@/types';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [feedback, setFeedback] = useState<{ result: TransactionResult | null; error: string | null }>({ result: null, error: null });
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [appError, setAppError] = useState<string | null>(null);

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!publicKey) return;
    setIsBalanceLoading(true);
    setAppError(null);
    try {
      const account = await horizon.loadAccount(publicKey);
      const nativeBalance = account.balances.find((asset) => asset.asset_type === 'native');
      setBalance(nativeBalance && 'balance' in nativeBalance ? nativeBalance.balance : '0.00');
    } catch (error) {
      setBalance(null);
      setAppError(error instanceof Error && error.message.includes('404') ? 'This wallet is not funded yet. Use “Get test XLM” to activate it.' : 'Could not load the wallet balance.');
    } finally {
      setIsBalanceLoading(false);
    }
  }, [publicKey]);

  async function fundWallet(): Promise<void> {
    if (!publicKey) return;
    setIsFunding(true);
    setAppError(null);
    try {
      const response = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`);
      if (!response.ok) throw new Error('Friendbot could not fund this wallet right now.');
      await refreshBalance();
    } catch (error) {
      setAppError(error instanceof Error ? error.message : 'Could not request test XLM.');
    } finally {
      setIsFunding(false);
    }
  }

  function handleConnect(address: string): void { setPublicKey(address); setFeedback({ result: null, error: null }); }
  function handleDisconnect(): void { setPublicKey(null); setBalance(null); setFeedback({ result: null, error: null }); }
  function handlePayment(result: TransactionResult): void { setFeedback({ result, error: null }); setHistoryRefreshKey((key) => key + 1); void refreshBalance(); }

  return (
    <div className="app-shell">
      <header className="topbar flex h-[72px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-3"><div className="brand-mark"><Sparkles size={19} /></div><div><p className="m-0 text-sm font-extrabold tracking-tight text-slate-800">Stellar White Belt</p><p className="m-0 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Testnet studio</p></div></div>
        <div className="flex items-center gap-3"><a href="https://developers.stellar.org/" target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-700 sm:flex"><CircleHelp size={15} /> Learn Stellar</a><WalletConnection publicKey={publicKey} onConnect={handleConnect} onDisconnect={handleDisconnect} /></div>
      </header>
      <main className="hero-wrap">
        <div className="mb-10"><div className="eyebrow">A hands-on introduction to Stellar</div><h1 className="hero-title">Move value at the speed of light.</h1><p className="hero-copy">A simple workspace for learning how Stellar wallets, balances, and payments work. Connect Freighter and start exploring on the safe, free testnet.</p></div>
        {!publicKey ? <div className="rounded-2xl border border-dashed border-sky-200 bg-white/60 px-6 py-16 text-center shadow-sm"><ShieldCheck size={28} className="mx-auto mb-4 text-sky-600" /><h2 className="text-lg font-extrabold text-slate-800">Your testnet workspace is ready</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Connect your Freighter wallet above to view your balance, request test XLM, and send your first payment.</p></div> : <><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><BalanceDisplay publicKey={publicKey} balance={balance} isLoading={isBalanceLoading} onRefresh={refreshBalance} onFund={fundWallet} isFunding={isFunding} /><PaymentForm publicKey={publicKey} onPaymentSubmitted={handlePayment} /></div>{appError && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">{appError}</div>}<div className="mt-5"><TransactionFeedback result={feedback.result} error={feedback.error} onDismiss={() => setFeedback({ result: null, error: null })} /></div><div className="mt-5"><TransactionHistory publicKey={publicKey} refreshKey={historyRefreshKey} /></div></>}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-5 text-[11px] font-semibold text-slate-400"><span>Built on Stellar Testnet · For learning only</span><a href="https://github.com/stellar" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-600"><Github size={13} /> Stellar on GitHub</a></footer>
      </main>
    </div>
  );
}

export default App;
