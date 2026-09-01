export interface TransactionResult {
  hash: string;
  ledger: number;
  createdAt: string;
}

export interface WalletConnectionProps {
  publicKey: string | null;
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export interface BalanceDisplayProps {
  publicKey: string;
  balance: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  onFund: () => Promise<void>;
  isFunding: boolean;
}

export interface PaymentFormProps {
  publicKey: string;
  onPaymentSubmitted: (result: TransactionResult) => void;
}

export interface TransactionFeedbackProps {
  result: TransactionResult | null;
  error: string | null;
  onDismiss: () => void;
}

export interface TransactionHistoryProps {
  publicKey: string;
  refreshKey: number;
}
