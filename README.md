# Decentralized Voting DApp

A secure, transparent, and decentralized voting system built on Ethereum using Solidity smart contracts, Hardhat, Next.js, Tailwind CSS, and Wagmi.

## Project Overview

This decentralized voting application enables fair and transparent elections on the blockchain. It features voter registration, candidate management, secure ballot casting, and real-time verifiable election results.

### Features

- **Decentralized Voting**: Tamper-proof voting secured by Ethereum smart contracts.
- **Admin Dashboard**: Register eligible voters and candidates, and manage election phases.
- **Voter Verification**: Transparent tracking of voter status to ensure one person, one vote.
- **Live Results & Analytics**: Real-time vote tallying and interactive charts.
- **Decentralized Storage**: IPFS integration (via Pinata) for storing candidate and voter metadata.
- **Web3 Wallet Integration**: Seamless connection via Wagmi and WalletConnect/Reown.

## Tech Stack

- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: Next.js, React, Tailwind CSS
- **Web3 Integration**: Ethers.js, Wagmi, WalletConnect / Reown
- **Decentralized Storage**: Pinata (IPFS)

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.17.1` or higher
- **NPM**: `8.19.2` or higher
- **MetaMask** or any Web3-compatible browser wallet

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/anandyadav018/Advance-Voting-Dapp.git
cd Advance-Voting-Dapp
```

#### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install smart contract dependencies
cd web3
npm install
cd ..
```

#### 3. Environment Configuration
Create a `.env.local` file in the root directory based on the following template:

```env
# Platform Configuration
NEXT_PUBLIC_PLATFORM_NAME=VotingDApp

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Network Configuration (Localhost)
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_CHAIN_NAME=Localhost
NEXT_PUBLIC_CHAIN_SYMBOL=ETH
NEXT_PUBLIC_BLOCK_EXPLORER=http://localhost:8545
NEXT_PUBLIC_NETWORK=localhost
NEXT_PUBLIC_BLOCK_EXPLORER_NAME=Local Explorer

# Smart Contract Address (Update after deployment)
NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS=your_deployed_contract_address

# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
```

---

### Running the Project Locally

#### 1. Start Hardhat Local Node
In a separate terminal:
```bash
cd web3
npx hardhat node
```

#### 2. Deploy Smart Contract
In another terminal:
```bash
cd web3
npx hardhat run scripts/deploy.js --network localhost
```
*Copy the deployed contract address and update `NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS` in `.env.local`.*

#### 3. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authors

- **Anand Yadav** - [GitHub](https://github.com/anandyadav018)
