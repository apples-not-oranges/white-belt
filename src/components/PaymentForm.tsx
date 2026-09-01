import { useState } from 'react';
import { ArrowUpRight, LoaderCircle, Send } from 'lucide-react';
import { Asset, Horizon, Networks, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import type { PaymentFormProps } from '@/types';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

export default function PaymentForm({ publicKey, onPaymentSubmitted }: PaymentFormProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendPayment(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSending(true);
    try {
      if (!StrKey.isValidEd25519PublicKey(destination.trim())) throw new Error('Enter a valid Stellar public key beginning with G.');
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error('Enter an amount greater than 0 XLM.');
      if (numericAmount < 0.0000001) throw new Error('The minimum payment is 0.0000001 XLM.');

      const account = await horizon.loadAccount(publicKey);
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination: destination.trim(),
          asset: Asset.native(),
          amount: numericAmount.toFixed(7),
        }))
        .setTimeout(180)
        .build();

      const signed = await signTransaction(transaction.toXDR(), {
        networkPassphrase: Networks.TESTNET,
        address: publicKey,
      });
      if (signed.error) throw new Error(signed.error.message);
      if (!signed.signedTxXdr) throw new Error('Freighter did not return a signed transaction.');

      const submitted = await horizon.submitTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET));
      onPaymentSubmitted({ hash: submitted.hash, ledger: submitted.ledger, createdAt: new Date().toISOString() });
      setDestination('');
      setAmount('');
    } catch (paymentError) {
      const message = paymentError instanceof Error ? paymentError.message : 'Payment could not be completed.';
      setError(message.includes('op_underfunded') ? 'Your wallet does not have enough XLM for this payment and network fee.' : message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div className="section-icon blue"><Send size={18} /></div>
        <div><h2>Send XLM</h2><p>Transfer testnet lumens to another wallet.</p></div>
      </div>
      <form onSubmit={(event) => void sendPayment(event)} className="mt-6 space-y-4">
        <label className="field-label">Destination public key
          <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="G…" className="text-input" autoComplete="off" />
        </label>
        <label className="field-label">Amount
          <div className="relative">
            <input type="number" min="0.0000001" step="0.0000001" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="text-input pr-14" />
            <span className="input-suffix">XLM</span>
          </div>
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isSending} className="primary-button w-full justify-center py-3">
          {isSending ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowUpRight size={17} />}
          {isSending ? 'Confirm in Freighter…' : 'Send payment'}
        </button>
      </form>
    </section>
  );
}
