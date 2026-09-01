import { CheckCircle2, ExternalLink, X, XCircle } from 'lucide-react';
import type { TransactionFeedbackProps } from '@/types';

export default function TransactionFeedback({ result, error, onDismiss }: TransactionFeedbackProps) {
  if (!result && !error) return null;
  return (
    <div className={`feedback ${result ? 'success' : 'failure'}`} role="status">
      {result ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{result ? 'Payment submitted successfully' : 'Payment failed'}</p>
        {result ? <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"><span>Transaction confirmed on testnet.</span><a href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`} target="_blank" rel="noreferrer" className="feedback-link">View on Stellar Expert <ExternalLink size={12} /></a></div> : <p className="mt-1 text-xs">{error}</p>}
      </div>
      <button onClick={onDismiss} className="feedback-dismiss" aria-label="Dismiss notification"><X size={16} /></button>
    </div>
  );
}
