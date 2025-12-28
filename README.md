# 🎨 Verified NFT Marketplace

An NFT marketplace that only allows verified/audited NFT contracts, built with **Clarity 4**.

## ✅ Project Status

- ✅ **Deployed to Testnet** - Live on Stacks Testnet
- ✅ **Clarity 4 compatible** - Using Clarinet 3.11.0+
- ✅ **Epoch 3.3** - Configured in Clarinet.toml
- ✅ **All tests passing** - 27 comprehensive tests included
- ✅ **Best practices .gitignore** - Excludes cache, secrets, and build artifacts
- ✅ **Event logging** - Comprehensive tracking for monitoring
- ✅ **Week 3 Builder Challenge** - WalletKit SDK integration complete

## 🚀 Deployed Contract

**Network**: Stacks Testnet
**Contract**: `SP12KRGRZ2N2Q5B8HKXHETGRD0JVF282TAA3R3HXX.verified-marketplace`
**Deployer**: `SP12KRGRZ2N2Q5B8HKXHETGRD0JVF282TAA3R3HXX`
**Transaction ID**: `e14d687e34b443f27608cde700a0c75d24d16bdcf3cf32af9f0c86d6e12e427e`
**Deployed**: December 27, 2025
**Contract Size**: 18,039 bytes
**Explorer**: [View Transaction](https://explorer.hiro.so/txid/e14d687e34b443f27608cde700a0c75d24d16bdcf3cf32af9f0c86d6e12e427e?chain=testnet)
**Contract URL**: [View Contract](https://explorer.hiro.so/txid/SP12KRGRZ2N2Q5B8HKXHETGRD0JVF282TAA3R3HXX.verified-marketplace?chain=testnet)

## 🎯 Clarity 4 Features Used

| Feature | Usage |
|---------|-------|
| `contract-hash?` | Verify NFT contracts before allowing listings |
| `stacks-block-time` | Auction timing and listing expiration |
| `to-ascii?` | Generate provenance strings and receipts |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Verified NFT Marketplace                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Contract Verification Layer             │   │
│   │         (contract-hash? checks all NFTs)            │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│           ┌───────────────┼───────────────┐                 │
│           ▼               ▼               ▼                 │
│   ┌───────────┐   ┌───────────┐   ┌───────────────┐        │
│   │  Fixed    │   │  Auction  │   │   Royalty     │        │
│   │  Price    │   │  Listings │   │   Enforcement │        │
│   └───────────┘   └───────────┘   └───────────────┘        │
│                                                             │
│   Features:                                                 │
│   • 2.5% marketplace fee                                   │
│   • Up to 10% creator royalties                            │
│   • Time-based auction expiration                          │
│   • On-chain provenance tracking                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Clarinet 3.11.0 or higher (for Clarity 4 support)
- Configured for epoch 3.3

### Setup & Testing

```bash
# Navigate to project
cd verified-nft-marketplace

# Check contract syntax (Clarinet 4)
clarinet check

# Run comprehensive test suite
# Note: Tests are written in TypeScript using Clarinet test framework
# 27 tests covering all contract functions and Clarity 4 features
clarinet devnet start  # In a separate terminal
# Then run your tests

# Start interactive console
clarinet console
```

### Verify Configuration

The project is pre-configured with:
- **Clarity version**: 4 (in Clarinet.toml)
- **Epoch**: 3.3 (in Clarinet.toml)
- **Test accounts**: Configured in settings/Simnet.toml

### Console Examples

```clarity
;; Verify an NFT contract (admin)
(contract-call? .verified-marketplace verify-contract 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.my-nft
  "My NFT Collection"
  u500  ;; 5% royalty
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Check if contract is verified
(contract-call? .verified-marketplace is-contract-verified 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.my-nft)

;; Calculate fees for a sale
(contract-call? .verified-marketplace calculate-fees 
  u100000000 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.my-nft)
```

## 📋 Contract Functions

### Admin Functions
| Function | Description |
|----------|-------------|
| `verify-contract` | Whitelist an NFT contract |
| `revoke-verification` | Remove contract from whitelist |

### Listing Functions
| Function | Description |
|----------|-------------|
| `create-listing` | Create fixed-price listing |
| `create-auction` | Create auction listing |
| `buy-listing` | Purchase fixed-price NFT |
| `place-bid` | Bid on auction |
| `settle-auction` | Finalize ended auction |
| `cancel-listing` | Cancel your listing |

### Read-Only Functions
| Function | Description |
|----------|-------------|
| `get-listing` | Get listing details |
| `is-contract-verified` | Check if NFT contract is approved |
| `calculate-fees` | Calculate marketplace + royalty fees |
| `generate-provenance` | Create provenance string |

## 🏆 Builder Challenge

### Week 3 Challenge ✅
- ✅ **WalletKit SDK Integration** - @stacks/connect v7.10.0
- ✅ **Multi-Wallet Support** - Hiro, Xverse, Leather, OKX
- ✅ **WalletConnect Project ID** - 973aec75d9c96397c8ccd94d62bada81
- ✅ **User Tracking** - Active wallet connection and transaction events
- ✅ **Fee Tracking** - Marketplace (2.5%) + Royalty (up to 10%) monitoring
- ✅ **Reown AppKit** - Optional advanced integration configured

### Clarity 4 Features ✅
- ✅ `contract-hash?` for NFT verification
- ✅ `stacks-block-time` for auctions
- ✅ `to-ascii?` for provenance
- ✅ Royalty enforcement
- ✅ Complete auction system

## 🌐 Frontend Application (Week 3)

### Quick Start
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Features
- **Multi-Wallet Connection**: Hiro, Xverse, Leather, OKX wallets
- **WalletKit SDK**: Seamless wallet integration via WalletConnect
- **NFT Marketplace UI**: Browse, list, and trade verified NFTs
- **Auction System**: Real-time bidding interface
- **User Dashboard**: Track listings, bids, and transactions
- **Fee Analytics**: Monitor marketplace and royalty fees

### Week 3 Integration Details

**WalletConnect Configuration**:
- Project ID: `973aec75d9c96397c8ccd94d62bada81`
- Location: `frontend/src/config/walletConfig.js`
- SDK: @stacks/connect v7.10.0

**Multi-Wallet Support**:
- Hiro Wallet
- Xverse
- Leather
- OKX Wallet

**Tracking & Analytics**:
- User connections tracked for leaderboard
- Transaction fees monitored (marketplace + royalties)
- Event logging for Builder Challenge metrics

## 📜 License

MIT License
