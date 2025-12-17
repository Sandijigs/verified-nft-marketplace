# 🚀 Verified NFT Marketplace - Deployment Information

## 📍 Deployer Address

**Testnet Address:** `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`

**Mnemonic (KEEP SECURE!):**
```
twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw
```

⚠️ **SECURITY WARNING**: This mnemonic is for testnet use only. Never use testnet mnemonics on mainnet!

---

## 💰 Step 1: Fund the Deployer Address

### Get Testnet STX from Faucet

1. **Visit the Hiro Testnet Faucet:**
   https://explorer.hiro.so/sandbox/faucet?chain=testnet

2. **Enter the deployer address:**
   ```
   ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
   ```

3. **Request STX:**
   - Click "Request STX"
   - You'll receive 500 testnet STX (free)
   - Wait ~10 minutes for confirmation

4. **Verify Balance:**
   Check your balance on the explorer:
   https://explorer.hiro.so/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM?chain=testnet

---

## 📋 Deployment Plan Details

**File:** `deployments/default.testnet-plan.yaml`

**Network:** Testnet
**Contract Name:** verified-marketplace
**Clarity Version:** 4
**Epoch:** 3.3
**Estimated Cost:** 2,780,693 microSTX (~2.78 STX)

---

## 🚀 Step 2: Deploy the Contract

Once the deployer address is funded, run:

```bash
# Navigate to project directory
cd verified-nft-marketplace

# Apply the deployment plan
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Wait for deployment confirmation (~10 minutes)
```

---

## ✅ Step 3: Verify Deployment

After deployment, verify on the testnet explorer:

**Contract URL:**
```
https://explorer.hiro.so/txid/TRANSACTION_ID?chain=testnet
```

**Contract Address:**
```
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.verified-marketplace
```

### Check Contract Source

Visit:
```
https://explorer.hiro.so/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM?chain=testnet
```

Look for the "verified-marketplace" contract in the Transactions tab.

---

## 🧪 Step 4: Test the Deployed Contract

### Using Clarinet Console (Testnet Mode)

```bash
clarinet console --testnet
```

### Or Use Hiro Platform

1. Visit: https://platform.hiro.so/
2. Connect your wallet
3. Navigate to: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.verified-marketplace
4. Test contract functions

---

## 📊 Deployment Checklist

- [ ] Deployer address funded with testnet STX
- [ ] Verified balance > 3 STX (to cover deployment + fees)
- [ ] Deployment plan generated (`default.testnet-plan.yaml` exists)
- [ ] Run deployment command
- [ ] Wait for confirmation
- [ ] Verify contract on explorer
- [ ] Test contract functions

---

## 🔗 Useful Links

### Testnet Resources
- **Testnet Faucet**: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Testnet Explorer**: https://explorer.hiro.so/?chain=testnet
- **Deployer Address**: https://explorer.hiro.so/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM?chain=testnet

### Documentation
- **Clarinet Docs**: https://docs.hiro.so/clarinet
- **Stacks Docs**: https://docs.stacks.co/
- **Clarity Reference**: https://docs.stacks.co/clarity

---

## 💡 Quick Commands

```bash
# Check if address is funded
curl "https://api.testnet.hiro.so/v2/accounts/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" | jq '.balance'

# Deploy
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Check deployment status
clarinet deployments check -p deployments/default.testnet-plan.yaml
```

---

## ⚠️ Troubleshooting

### Issue: "Insufficient balance"
**Solution:** Request more testnet STX from the faucet

### Issue: "Transaction failed"
**Solution:** Check that:
1. Address is funded
2. Testnet API is accessible
3. Network connection is stable

### Issue: "Contract already exists"
**Solution:** The contract may already be deployed. Check the explorer.

---

## 📝 Notes

- Deployment costs approximately 2.78 STX on testnet
- Transaction confirmation takes ~10 minutes
- Keep your mnemonic secure (for testnet only!)
- After deployment, you can interact with the contract at: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.verified-marketplace`

---

**Generated**: 2024-12-17
**Status**: Ready for deployment after funding
