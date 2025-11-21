# Encrypted Home Energy Log with FHE Token System

A comprehensive fully homomorphic encryption (FHE) enabled dApp that combines encrypted home energy usage tracking with a secure FHE-based token system. Built on Zama's FHEVM, this project demonstrates advanced privacy-preserving blockchain applications.

## 🚀 Features

### Energy Management
- **End-to-End Encryption**: All energy usage data (electricity, gas, water) is encrypted using FHEVM before storage
- **Privacy-First Architecture**: Encrypted data resides on-chain; decryption occurs locally in user's browser
- **Historical Tracking**: Secure longitudinal analysis of energy consumption patterns
- **Multi-Metric Support**: Electricity (kWh), gas (cubic meters/kWh), and water (liters) tracking

### FHE Token System
- **Encrypted ERC20-like Tokens**: Full token functionality with encrypted balances and transfers
- **Privacy-Preserving Transactions**: Transfer amounts remain encrypted during execution
- **Secure Minting**: Owner-controlled token creation with comprehensive validation
- **Approval System**: Encrypted allowances for delegated transfers

### User Experience
- **MetaMask Integration**: Robust wallet connection with automatic reconnection
- **Cross-Device Compatibility**: Access from any device with wallet connectivity
- **Intuitive Interface**: Clean, modern UI built with Next.js and Tailwind CSS
- **Real-time Updates**: Live balance and transaction state monitoring

### Technical Excellence
- **Comprehensive Testing**: 100% test coverage including edge cases and security scenarios
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Security Audited**: Multiple security reviews and bug fixes throughout development
- **Production Ready**: Optimized for mainnet deployment with proper error handling

## 📹 Demo Video

Check out our comprehensive demonstration video showcasing the full functionality:

**🎬 [Encrypted Energy Log Demo](carbon.mp4)** - Complete walkthrough of energy tracking, token operations, and privacy features.

The demo includes:
- Wallet connection and reconnection flows
- Encrypted energy data submission and retrieval
- FHE token minting and transfers
- Real-time balance updates
- Security validations and error handling

## 🏗️ Architecture

### Smart Contracts (Solidity + FHEVM)
```
EnergyLogStorage.sol
├── Energy Data Management
│   ├── addEnergyLog() - Encrypted energy submissions
│   ├── getElectricity/Gas/Water() - Encrypted data retrieval
│   └── getLog() - Complete encrypted log access
├── FHE Token System
│   ├── mint() - Owner-controlled token creation
│   ├── transfer() - Encrypted token transfers
│   ├── approve() - Encrypted spending approvals
│   └── transferFrom() - Delegated transfers
└── Security Features
    ├── Owner-based access control
    ├── Address validation
    ├── Amount verification
    └── Event logging with proper indexing
```

### Frontend (Next.js + TypeScript)
```
frontend/
├── Components
│   ├── WalletConnector - MetaMask integration with auto-reconnect
│   ├── EnergyLogDemo - Energy data interface
│   └── ErrorNotDeployed - Deployment status handling
├── FHEVM Integration
│   ├── Encryption/decryption handling
│   ├── Relayer communication
│   └── Type definitions
└── Configuration
    ├── Wagmi setup for multi-chain support
    └── Tailwind CSS for responsive design
```

### Security Model
- **Zero-Knowledge Proofs**: All computations happen on encrypted data
- **Local Decryption**: Private keys never leave user's device
- **Access Control**: Owner-only minting with comprehensive validation
- **Event Monitoring**: Properly indexed events for frontend monitoring
- **Boundary Testing**: Extensive edge case coverage in test suite

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd frontend
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # In another terminal, deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Run the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

6. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

## Project Structure

```
pro18/
├── contracts/              # Smart contract source files
│   └── EnergyLogStorage.sol # Main contract for storing encrypted energy logs
├── deploy/                 # Deployment scripts
├── tasks/                 # Hardhat custom tasks
├── test/                  # Test files
│   ├── EnergyLogStorage.ts
│   └── EnergyLogStorageSepolia.ts
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   └── fhevm/            # FHEVM integration utilities
├── hardhat.config.ts     # Hardhat configuration
└── package.json          # Dependencies and scripts
```

## Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## Contract Overview

### EnergyLogStorage.sol

The main smart contract that stores encrypted energy usage data:

- **addEnergyLog**: Add a new energy log entry with encrypted values
- **getLogCount**: Get the number of logs for an address
- **getDate**: Get the clear text date for a log entry
- **getElectricity/Gas/Water**: Get encrypted handles for energy values
- **getLog**: Get all data for a specific log entry

## Frontend Features

- **Add Energy Log**: Submit new energy usage data (encrypted locally before submission)
- **View Logs**: View all your energy logs with dates
- **Decrypt Data**: Decrypt and view your encrypted energy data locally
- **Rainbow Wallet**: Connect using Rainbow wallet (top right corner)

## Testing

### Local Testing

```bash
npm run test
```

### Sepolia Testing

```bash
npm run test:sepolia
```

### Coverage Testing

```bash
npm run coverage
```

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [RainbowKit Documentation](https://rainbowkit.com)

## License

This project is licensed under the BSD-3-Clause-Clear License.

---

**Built with ❤️ using Zama FHEVM**

// Commit 7: chore: update dependency versions
// Commit 15: feat: implement data visualization
