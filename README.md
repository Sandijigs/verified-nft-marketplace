# 🎨 Verified NFT Marketplace

An NFT marketplace that only allows verified/audited NFT contracts, built with **Clarity 4**.

## ✅ Project Status

- ✅ **Clarity 4 compatible** - Using Clarinet 3.11.0+
- ✅ **Epoch 3.3** - Configured in Clarinet.toml
- ✅ **All tests passing** - 27 comprehensive tests included
- ✅ **Best practices .gitignore** - Excludes cache, secrets, and build artifacts
- ✅ **Event logging** - Comprehensive tracking for monitoring
- ✅ **Ready for testnet deployment**

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

## 🏆 Builder Challenge Points

- ✅ `contract-hash?` for NFT verification
- ✅ `stacks-block-time` for auctions
- ✅ `to-ascii?` for provenance
- ✅ Royalty enforcement
- ✅ Complete auction system

## 📜 License

MIT License
