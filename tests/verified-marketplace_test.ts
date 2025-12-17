import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';
import { assertEquals, assertExists } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

// ============================================
// READ-ONLY FUNCTION TESTS
// ============================================

Clarinet.test({
  name: "Unverified contract check returns false",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let result = chain.callReadOnlyFn(
      'verified-marketplace',
      'is-contract-verified',
      [types.principal(deployer.address)],
      deployer.address
    );

    result.result.expectBool(false);
  }
});

Clarinet.test({
  name: "Can calculate marketplace fees correctly (2.5%)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    // Calculate fees for 100 STX sale (100000000 microSTX)
    let result = chain.callReadOnlyFn(
      'verified-marketplace',
      'calculate-fees',
      [types.uint(100000000), types.principal(deployer.address)],
      deployer.address
    );

    assertExists(result.result);
    // Should have marketplace-fee: 2500000 (2.5%), royalty-fee: 0, seller-proceeds: 97500000
  }
});

Clarinet.test({
  name: "Can generate provenance string using to-ascii?",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let result = chain.callReadOnlyFn(
      'verified-marketplace',
      'generate-provenance',
      [types.uint(1), types.uint(42), types.uint(100000000)],
      deployer.address
    );

    assertExists(result.result);
    result.result.expectAscii('PROVENANCE|LISTING:1|TOKEN:42|PRICE:100000000|SOLD_AT:0');
  }
});

Clarinet.test({
  name: "Can get current block time using stacks-block-time",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let result = chain.callReadOnlyFn(
      'verified-marketplace',
      'get-current-time',
      [],
      deployer.address
    );

    assertExists(result.result);
    result.result.expectUint(0); // Initial block time is 0
  }
});

Clarinet.test({
  name: "Get listing returns none for non-existent listing",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let result = chain.callReadOnlyFn(
      'verified-marketplace',
      'get-listing',
      [types.uint(999)],
      deployer.address
    );

    result.result.expectNone();
  }
});

Clarinet.test({
  name: "Collection stats return defaults for unknown contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let result = chain.callReadOnlyFn(
      'verified-marketplace',
      'get-collection-stats',
      [types.principal(deployer.address)],
      deployer.address
    );

    assertExists(result.result);
    // Should return { total-volume: u0, total-sales: u0, floor-price: u0, highest-sale: u0 }
  }
});

Clarinet.test({
  name: "Is listing active returns false for non-existent listing",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let result = chain.callReadOnlyFn(
      'verified-marketplace',
      'is-listing-active',
      [types.uint(999)],
      deployer.address
    );

    result.result.expectBool(false);
  }
});

// ============================================
// CONTRACT VERIFICATION TESTS
// ============================================

Clarinet.test({
  name: "Admin can verify NFT contract using contract-hash?",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet1.address),
          types.ascii("Test NFT Collection"),
          types.uint(500), // 5% royalty
          types.principal(deployer.address)
        ],
        deployer.address
      )
    ]);

    block.receipts[0].result.expectOk();

    // Verify contract is now verified
    let checkResult = chain.callReadOnlyFn(
      'verified-marketplace',
      'is-contract-verified',
      [types.principal(wallet1.address)],
      deployer.address
    );

    checkResult.result.expectBool(true);
  }
});

Clarinet.test({
  name: "Non-admin cannot verify contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(wallet1.address)
        ],
        wallet1.address // Non-admin trying to verify
      )
    ]);

    block.receipts[0].result.expectErr(types.uint(3001)); // ERR_UNAUTHORIZED
  }
});

Clarinet.test({
  name: "Cannot verify contract with royalty > 10%",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet1.address),
          types.ascii("Test NFT"),
          types.uint(1500), // 15% royalty (too high)
          types.principal(deployer.address)
        ],
        deployer.address
      )
    ]);

    block.receipts[0].result.expectErr(types.uint(3013)); // ERR_ROYALTY_TOO_HIGH
  }
});

Clarinet.test({
  name: "Admin can revoke contract verification",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    let block = chain.mineBlock([
      // First verify
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet1.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      // Then revoke
      Tx.contractCall(
        'verified-marketplace',
        'revoke-verification',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);

    block.receipts[0].result.expectOk();
    block.receipts[1].result.expectOk();

    // Contract should no longer be verified
    let checkResult = chain.callReadOnlyFn(
      'verified-marketplace',
      'is-contract-verified',
      [types.principal(wallet1.address)],
      deployer.address
    );

    checkResult.result.expectBool(false);
  }
});

// ============================================
// FIXED-PRICE LISTING TESTS
// ============================================

Clarinet.test({
  name: "Cannot create listing for unverified contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'create-listing',
        [
          types.principal(wallet2.address), // Unverified contract
          types.uint(1), // token-id
          types.uint(100000000), // price: 100 STX
          types.uint(0) // duration: use default
        ],
        wallet1.address
      )
    ]);

    block.receipts[0].result.expectErr(types.uint(3007)); // ERR_CONTRACT_NOT_VERIFIED
  }
});

Clarinet.test({
  name: "Can create fixed-price listing for verified contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      // First verify the contract
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      // Create listing
      Tx.contractCall(
        'verified-marketplace',
        'create-listing',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(100000000),
          types.uint(2592000) // 30 days
        ],
        wallet1.address
      )
    ]);

    block.receipts[0].result.expectOk();
    block.receipts[1].result.expectOk();

    // Check listing was created
    let listing = chain.callReadOnlyFn(
      'verified-marketplace',
      'get-listing',
      [types.uint(1)],
      deployer.address
    );

    assertExists(listing.result);
    listing.result.expectSome();
  }
});

Clarinet.test({
  name: "Cannot create listing with zero price",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-listing',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(0), // Invalid: zero price
          types.uint(0)
        ],
        wallet1.address
      )
    ]);

    block.receipts[1].result.expectErr(types.uint(3003)); // ERR_INVALID_PRICE
  }
});

// ============================================
// AUCTION TESTS
// ============================================

Clarinet.test({
  name: "Can create auction listing",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-auction',
        [
          types.principal(wallet2.address),
          types.uint(1), // token-id
          types.uint(50000000), // starting-price: 50 STX
          types.uint(100000000), // reserve-price: 100 STX
          types.uint(5000000), // min-increment: 5 STX
          types.uint(604800) // duration: 7 days
        ],
        wallet1.address
      )
    ]);

    block.receipts[0].result.expectOk();
    block.receipts[1].result.expectOk().expectUint(1);

    // Check auction was created
    let auction = chain.callReadOnlyFn(
      'verified-marketplace',
      'get-auction',
      [types.uint(1)],
      deployer.address
    );

    assertExists(auction.result);
    auction.result.expectSome();
  }
});

Clarinet.test({
  name: "Cannot bid on own auction",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-auction',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(50000000),
          types.uint(100000000),
          types.uint(5000000),
          types.uint(604800)
        ],
        wallet1.address
      ),
      // Try to bid on own auction
      Tx.contractCall(
        'verified-marketplace',
        'place-bid',
        [types.uint(1), types.uint(50000000)],
        wallet1.address
      )
    ]);

    block.receipts[2].result.expectErr(types.uint(3012)); // ERR_CANNOT_BID_OWN
  }
});

Clarinet.test({
  name: "Can place valid bid on auction",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    const wallet3 = accounts.get('wallet_3')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-auction',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(50000000),
          types.uint(100000000),
          types.uint(5000000),
          types.uint(604800)
        ],
        wallet1.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'place-bid',
        [types.uint(1), types.uint(50000000)],
        wallet3.address
      )
    ]);

    block.receipts[2].result.expectOk();
  }
});

Clarinet.test({
  name: "Cannot place bid below minimum increment",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    const wallet3 = accounts.get('wallet_3')!;
    const wallet4 = accounts.get('wallet_4')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-auction',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(50000000),
          types.uint(100000000),
          types.uint(5000000),
          types.uint(604800)
        ],
        wallet1.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'place-bid',
        [types.uint(1), types.uint(50000000)],
        wallet3.address
      ),
      // Try to bid without meeting minimum increment
      Tx.contractCall(
        'verified-marketplace',
        'place-bid',
        [types.uint(1), types.uint(52000000)], // Only 2 STX more (need 5 STX)
        wallet4.address
      )
    ]);

    block.receipts[3].result.expectErr(types.uint(3011)); // ERR_BID_TOO_LOW
  }
});

// ============================================
// CANCEL LISTING TESTS
// ============================================

Clarinet.test({
  name: "Seller can cancel their listing",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-listing',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(100000000),
          types.uint(0)
        ],
        wallet1.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'cancel-listing',
        [types.uint(1)],
        wallet1.address
      )
    ]);

    block.receipts[2].result.expectOk();

    // Listing should no longer be active
    let isActive = chain.callReadOnlyFn(
      'verified-marketplace',
      'is-listing-active',
      [types.uint(1)],
      deployer.address
    );

    isActive.result.expectBool(false);
  }
});

Clarinet.test({
  name: "Non-seller cannot cancel listing",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    const wallet3 = accounts.get('wallet_3')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-listing',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(100000000),
          types.uint(0)
        ],
        wallet1.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'cancel-listing',
        [types.uint(1)],
        wallet3.address // Different user trying to cancel
      )
    ]);

    block.receipts[2].result.expectErr(types.uint(3001)); // ERR_UNAUTHORIZED
  }
});

// ============================================
// CLARITY 4 FEATURE VERIFICATION TESTS
// ============================================

Clarinet.test({
  name: "Verify contract-hash? returns proper hash for contracts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(`${deployer.address}.verified-marketplace`),
          types.ascii("Marketplace Self"),
          types.uint(0),
          types.principal(deployer.address)
        ],
        deployer.address
      )
    ]);

    block.receipts[0].result.expectOk();
  }
});

Clarinet.test({
  name: "Verify stacks-block-time is used for expiration checks",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(
        'verified-marketplace',
        'verify-contract',
        [
          types.principal(wallet2.address),
          types.ascii("Test NFT"),
          types.uint(500),
          types.principal(deployer.address)
        ],
        deployer.address
      ),
      Tx.contractCall(
        'verified-marketplace',
        'create-listing',
        [
          types.principal(wallet2.address),
          types.uint(1),
          types.uint(100000000),
          types.uint(100) // Very short duration
        ],
        wallet1.address
      )
    ]);

    block.receipts[1].result.expectOk();

    // Initially should be active
    let isActive = chain.callReadOnlyFn(
      'verified-marketplace',
      'is-listing-active',
      [types.uint(1)],
      deployer.address
    );

    isActive.result.expectBool(true);
  }
});
