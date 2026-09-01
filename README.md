# Stellar Journey to Mastery: Level 1 – White Belt dApp

A production-ready decentralized application (dApp) built on the Stellar Testnet to fulfill all criteria for the **Stellar Journey to Mastery: Level 1 – White Belt Challenge**.

---

## 1. Introduction & Overview

The **Stellar White Belt dApp** serves as an interactive entry point for decentralized development on the Stellar network. The goal of this project is to implement, test, and demonstrate core blockchain interactions through an intuitive, accessible web interface:

1. **Non-Custodial Authentication:** Establishing identity and secure sessions without holding user private keys.
2. **Ledger Querying:** Reading state from the Stellar distributed ledger via public Horizon RPC endpoints.
3. **Transaction Architecture:** Constructing, fee-calculating, sequence-matching, and non-custodially signing on-chain payment operations.
4. **Lifecycle Verification:** Handling synchronous submission, mempool execution, on-chain finality confirmation, and explorer traceability.

---

## 2. Requirements & Challenge Compliance

| Level 1 Challenge Requirement | Implementation Details | Status |
| :--- | :--- | :--- |
| **Freighter Wallet Setup** | Configured to work natively on the **Stellar Testnet** | Completed |
| **Wallet Connection** | `connectWallet` handler utilizing `@stellar/freighter-api` | Completed |
| **Wallet Disconnection** | `disconnectWallet` session teardown resetting internal state | Completed |
| **Balance Fetching** | Horizon API RPC querying native (`XLM`) asset arrays | Completed |
| **Balance Display** | Real-time reactive numeric balance display with dynamic refresh | Completed |
| **Send XLM Transaction** | `StellarSdk.TransactionBuilder` payment operation on Testnet | Completed |
| **Transaction Feedback** | Reactive states for Loading, Error, Success, and Tx Hash | Completed |
| **Explorer Verification** | Direct deep-linking to **StellarExpert Testnet Explorer** | Completed |
| **Git Standards** | Clean, atomic, and meaningful commit history (10+ commits) | Completed |

---

## 3. Key Features

* **Instant Wallet Discovery:** Automatically detects browser presence of the Freighter extension; prompts direct installation if absent.
* **One-Click Testnet Funding:** Integrated **Friendbot** faucet trigger enabling automatic 10,000 XLM test funding for newly generated keypairs.
* **Non-Custodial Signature Handoff:** Encodes operations to raw Transaction Envelope XDR strings and requests explicit cryptographic signing through Freighter.
* **Safe Input Sanitization:** Form-level validation for 56-character public keys (`G...`) and decimal XLM limits with automatic fee buffer calculations.
* **Transaction History Inspection:** Real-time query mechanism loading recent operations and asset flows for the active account.
* **Responsive Modern UI:** Minimalist dark-mode dashboard styled with Tailwind CSS, supporting desktop and mobile viewports.

---

## 4. Tech Stack & Dependencies

### Core Framework & Build Tooling
* **[React 18](https://react.dev/):** Declarative component architecture and reactive state management.
* **[TypeScript](https://www.typescriptlang.org/):** Strict static typing, type definitions, and compile-time safety.
* **[Vite](https://vitejs.dev/):** High-speed frontend build tool and Hot Module Replacement (HMR) local dev server.
* **[Tailwind CSS](https://tailwindcss.com/):** Utility-first styling engine powering the dark-mode layout.
* **[PostCSS](https://postcss.org/) & [Autoprefixer](https://github.com/postcss/autoprefixer):** CSS parsing and cross-browser vendor prefixing.

### Blockchain & Web3 Libraries
* **[`@stellar/stellar-sdk`](https://github.com/stellar/js-stellar-sdk):** Official JavaScript/TypeScript SDK for building transaction envelopes, formatting operations, encoding/decoding XDR, and communicating with Horizon.
* **[`@stellar/freighter-api`](https://github.com/stellar/freighter-api):** Dedicated client bridge to communicate with the Freighter wallet extension for identity verification and non-custodial signing.

### Icons & Utilities
* **[Lucide React](https://lucide.dev/):** Lightweight SVG UI icons.

---

## 5. Project Structure

The project uses a modular component structure where each challenge requirement is encapsulated in its own file:

```text
stellar-connect-wallet/
├── .gitignore                   # Git ignore patterns (node_modules, dist, environment files)
├── eslint.config.js             # ESLint linting configuration
├── index.html                   # HTML entry page and root mount node
├── package.json                 # Dependency manifests, package versions, and NPM scripts
├── package-lock.json            # Deterministic lockfile for installed packages
├── postcss.config.js            # PostCSS plugin settings
├── tailwind.config.js           # Tailwind utility layers, theme extensions, and content paths
├── tsconfig.json                # Project-wide TypeScript configuration
├── tsconfig.app.json            # Client application TypeScript rules
├── tsconfig.node.json           # Node environment and Vite config TypeScript rules
├── vite.config.ts               # Vite server configurations, plugins, and port definitions
├── public/                      # Static assets
└── src/
    ├── App.tsx                  # Root layout, global application state, and view coordinator
    ├── main.tsx                 # React application mounting entry point
    ├── index.css                # Base Tailwind CSS directives and global color schemes
    └── components/
        ├── WalletConnection.tsx     # Freighter connection, public key display, and disconnect
        ├── BalanceDisplay.tsx       # Live XLM balance polling and Friendbot faucet funding trigger
        ├── PaymentForm.tsx          # Destination address and XLM amount input with submission trigger
        ├── TransactionFeedback.tsx  # Dynamic status badges, error logs, and StellarExpert explorer link
        └── TransactionHistory.tsx   # Live list rendering of recent on-chain account transactions
```

---

## 6. Technical Architecture & Implementation Details

### A. Wallet Authentication (`WalletConnection.tsx`)

Authentication uses the Freighter browser API:

```typescript
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';

// 1. Verify extension presence
const installed = await isConnected();

// 2. Request user authorization
const accessAllowed = await requestAccess();

// 3. Extract public address
const userPublicKey = await getAddress();
```

### B. Ledger Reading & Faucet Integration (`BalanceDisplay.tsx`)

Account balance is queried from Horizon using the public key:

```typescript
import * as StellarSdk from '@stellar/stellar-sdk';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// Fetch live account record
const account = await server.loadAccount(publicKey);
const nativeAsset = account.balances.find((b) => b.asset_type === 'native');
const balance = nativeAsset ? nativeAsset.balance : '0';
```

If the account is empty or unactivated, Friendbot is called directly via an HTTP request:

```typescript
await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
```

### C. Transaction Assembly & Signing Lifecycle (`PaymentForm.tsx`)

Transactions follow a strict 4-phase lifecycle:

**1. Sequence Resolution:** Fetch current sequence counter via `server.loadAccount(senderAddress)`.

**2. Envelope Construction:**

```typescript
const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET,
})
  .addOperation(
    StellarSdk.Operation.payment({
      destination: recipientPublicKey,
      asset: StellarSdk.Asset.native(),
      amount: sendAmount.toString(),
    })
  )
  .setTimeout(30)
  .build();
```

**3. Cryptographic Signing (Client-side):**

```typescript
import { signTransaction } from '@stellar/freighter-api';

const signedXdr = await signTransaction(transaction.toXDR(), {
  networkPassphrase: StellarSdk.Networks.TESTNET,
});
```

**4. Horizon Ingestion:**

```typescript
const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
  signedXdr,
  StellarSdk.Networks.TESTNET
);
const result = await server.submitTransaction(transactionToSubmit);
console.log("Transaction Hash:", result.hash);
```

---

## 7. Setup & Local Development Instructions

### Prerequisites

* **Node.js:** Ensure Node.js >= 18.0.0 is installed. Check with `node -v`.
* **Package Manager:** npm >= 9.0.0 or yarn / pnpm.
* **Browser Extension:** Install the [Freighter Wallet](https://www.freighter.app/) extension.
  * **Important:** Open Freighter, go to the top right network selector, and set it to **Testnet**.

### Local Setup Steps

1. **Clone the repository:**

```bash
git clone https://github.com/<your-username>/stellar-connect-wallet.git
cd stellar-connect-wallet
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the local development server:**

```bash
npm run dev
```

4. **Access the application:**
   Open your browser and navigate to the local URL (typically `http://localhost:5173`).

---

## 8. Step-by-Step Testing Guide

1. **Ensure Freighter is Ready:** Unlock your Freighter wallet in the browser toolbar and confirm the network dropdown shows **Testnet**.
2. **Connect:** Click **Connect Freighter** on the dApp. A popup will ask to share your address—click **Approve**.
3. **Verify Connection:** Your public key (`G...`) will appear in the dashboard.
4. **Fund Account:** If your balance shows `0` or unfunded, click **Fund (Friendbot)**. Wait 2–3 seconds and your balance will update to `10,000.0000000 XLM`.
5. **Send a Test Transaction:**
   * Enter any valid Stellar testnet destination address (or generate a second account in Freighter to send between accounts).
   * Enter an amount (e.g., `5.5`).
   * Click **Submit Transaction**.
6. **Sign in Wallet:** A Freighter prompt will display the transaction operation, destination, base fee, and network. Click **Approve**.
7. **Verify Feedback:** The UI will display a **Transaction Successful!** notification containing the on-chain hash. Click **View on StellarExpert** to inspect the finalized ledger entry.

---

## 9. Git Commit Log

This repository follows atomic development standards, featuring individual commits for each stage of development:

* `chore: scaffold project structure with vite and typescript`
* `chore: add @stellar/stellar-sdk and @stellar/freighter-api dependencies`
* `feat(wallet): implement freighter wallet connection and state handlers`
* `feat(wallet): implement wallet disconnect and state teardown`
* `feat(network): configure stellar horizon testnet server instance`
* `feat(balance): fetch and render native XLM balance from horizon`
* `feat(faucet): add friendbot funding trigger for testnet accounts`
* `feat(transaction): create payment form UI for destination and amount`
* `feat(transaction): build payment operation and sign via freighter xdr`
* `feat(transaction): handle horizon submission, status feedback, and explorer links`
* `feat(history): list recent account transactions from horizon`
* `refactor(ui): integrate modular components into main layout`
* `docs: add comprehensive project documentation, architecture, and testing instructions`
