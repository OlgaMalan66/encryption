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
- **MetaMask Integration**: Robust wallet connection with intelligent auto-reconnection
- **Cross-Device Compatibility**: Access from any device with wallet connectivity
- **Intuitive Interface**: Clean, modern UI built with Next.js and Tailwind CSS
- **Real-time Updates**: Live encrypted balance and transaction state monitoring

### Technical Excellence
- **Comprehensive Testing**: Extensive test coverage including edge cases, security scenarios, and FHE operations
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Security Audited**: Multiple security reviews with systematic bug identification and fixes
- **Production Ready**: Optimized for mainnet deployment with proper error handling and validation

## 🌐 Live Demo

**🚀 [View Live Demo on Vercel](https://carbon-eosin-alpha.vercel.app/)**

The live demo showcases the complete Encrypted Home Energy Log with FHE Token System.

## 📹 Demo Video

**🎬 [Watch Full Demo Video](https://github.com/OlgaMalan66/encryption/blob/main/carbon.mp4)**

The demo video provides a comprehensive walkthrough of:
- MetaMask wallet connection with auto-reconnection
- Encrypted energy data submission (electricity, gas, water)
- FHE token operations (minting, transfers, approvals)
- Real-time encrypted balance monitoring
- Security validations and error handling
- Privacy-preserving data management

## 📋 Testnet Deployment

### Sepolia Testnet Contract
- **Contract Address**: `0xaDa7b9535b9347490Bb09b70fE439f771F9a3b11`
- **Network**: Ethereum Sepolia Testnet
- **Block Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xaDa7b9535b9347490Bb09b70fE439f771F9a3b11)

### Contract Features
- **Energy Data Storage**: Encrypted electricity, gas, and water usage logs
- **FHE Token System**: Mint, transfer, and approve encrypted tokens
- **Security Controls**: Owner-only minting with comprehensive validation
- **Event Logging**: Properly indexed Transfer and Approval events

## 🏗️ Architecture

### Smart Contracts (Solidity + FHEVM)
```
EnergyLogStorage.sol
├── Energy Data Management
│   ├── addEnergyLog() - Submit encrypted energy logs (electricity/gas/water)
│   ├── getElectricity/Gas/Water() - Retrieve encrypted energy values
│   ├── getLogCount() - Get total logs per user
│   └── getDate() - Access clear text dates
├── FHE Token System
│   ├── balanceOf() - Check encrypted token balances
│   ├── mint() - Owner-controlled token minting with validation
│   ├── transfer() - Encrypted token transfers with security checks
│   ├── approve() - Set encrypted spending allowances
│   └── transferFrom() - Delegated token transfers
└── Security & Events
    ├── Owner-based access control with constructor initialization
    ├── Comprehensive input validation (addresses, amounts, permissions)
    ├── Transfer & Approval events with proper indexing
    └── Systematic bug fixes and security enhancements
```

### Frontend (Next.js + TypeScript)
```
frontend/
├── Components
│   ├── WalletConnector - MetaMask integration with intelligent auto-reconnect
│   ├── EnergyLogDemo - Energy data submission and viewing interface
│   └── ErrorNotDeployed - Deployment status handling
├── FHEVM Integration
│   ├── Encryption/decryption handling via relayer
│   ├── Type definitions for encrypted operations
│   └── Mock environment support for testing
└── Configuration
    ├── Wagmi setup for multi-chain support
    ├── Tailwind CSS for responsive design
    └── TypeScript configuration
```

### Security Model
- **Zero-Knowledge Proofs**: All computations happen on encrypted data
- **Local Decryption**: Private keys never leave user's device
- **Access Control**: Owner-only minting with comprehensive validation
- **Event Monitoring**: Properly indexed events for frontend monitoring
- **Boundary Testing**: Extensive edge case coverage in test suite

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **MetaMask**: Browser extension for wallet connectivity

### Installation & Local Development

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/OlgaMalan66/encryption.git
   cd encryption
   npm install
   cd frontend
   npm install
   cd ..
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Run local development**

   ```bash
   # Start local FHEVM node
   npx hardhat node

   # Deploy to localhost (in another terminal)
   npx hardhat deploy --network localhost

   # Start frontend
   cd frontend
   npm run dev
   ```

### Testnet Deployment

**Sepolia Testnet Contract**: `0xaDa7b9535b9347490Bb09b70fE439f771F9a3b11`

```bash
# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia 0xaDa7b9535b9347490Bb09b70fE439f771F9a3b11
```

### Live Demo

**🌐 [View on Vercel](https://carbon-eosin-alpha.vercel.app/)** - Fully functional demo with MetaMask integration

## 📁 Project Structure

```
pro18/
├── contracts/
│   └── EnergyLogStorage.sol          # Main FHE contract with energy logs + token system
├── deploy/
│   └── deploy.ts                     # Hardhat deployment scripts
├── test/
│   ├── EnergyLogStorage.ts          # Comprehensive unit tests with edge cases
│   └── EnergyLogStorageSepolia.ts   # Sepolia testnet integration tests
├── frontend/
│   ├── components/
│   │   ├── WalletConnector.tsx      # MetaMask integration with auto-reconnect
│   │   ├── EnergyLogDemo.tsx        # Energy data interface
│   │   └── ErrorNotDeployed.tsx     # Deployment status handling
│   ├── hooks/
│   │   └── useInMemoryStorage.tsx   # Local storage utilities
│   ├── fhevm/                       # FHEVM integration layer
│   │   ├── FhevmDecryptionSignature.ts
│   │   ├── fhevmTypes.ts
│   │   ├── GenericStringStorage.ts
│   │   └── useFhevm.tsx             # FHEVM React hooks
│   └── app/                         # Next.js 13+ app directory
├── deployments/
│   └── sepolia/
│       └── EnergyLogStorage.json    # Sepolia deployment artifacts
├── tasks/                           # Custom Hardhat tasks
├── hardhat.config.ts               # Hardhat configuration with FHEVM
└── README.md                       # This documentation
```

## Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 📄 Contract Overview

### EnergyLogStorage.sol

Comprehensive FHE-enabled smart contract combining energy data storage with token functionality:

#### Energy Data Management
- **addEnergyLog**: Submit encrypted energy logs (electricity/gas/water) with FHE protection
- **getLogCount**: Retrieve total log count per user
- **getDate**: Access clear text dates for log entries
- **getElectricity/Gas/Water**: Retrieve encrypted energy value handles
- **getLog**: Get complete encrypted log data for specific entries

#### FHE Token System (ERC20-like)
- **balanceOf**: Check encrypted token balances
- **mint**: Owner-controlled token creation with comprehensive validation
- **transfer**: Encrypted token transfers with security checks
- **approve**: Set encrypted spending allowances
- **transferFrom**: Execute delegated token transfers

#### Security & Validation
- **Owner Access Control**: Constructor-based owner initialization
- **Input Validation**: Address validation, amount positivity checks
- **Event Logging**: Properly indexed Transfer and Approval events
- **Boundary Testing**: Extensive edge case handling in contract logic

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
