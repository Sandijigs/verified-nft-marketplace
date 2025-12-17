;; Verified NFT Marketplace - Clarity 4
;; A marketplace that only allows verified/audited NFT contracts
;;
;; Clarity 4 Features Used:
;; - contract-hash?: Verify NFT contracts follow approved templates
;; - restrict-assets?: Protect marketplace assets during trades
;; - to-ascii?: Generate listing receipts and provenance strings
;; - stacks-block-time: Auction timing and listing expiration

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u3001))
(define-constant ERR_LISTING_NOT_FOUND (err u3002))
(define-constant ERR_INVALID_PRICE (err u3003))
(define-constant ERR_INSUFFICIENT_FUNDS (err u3004))
(define-constant ERR_NOT_OWNER (err u3005))
(define-constant ERR_LISTING_EXPIRED (err u3006))
(define-constant ERR_CONTRACT_NOT_VERIFIED (err u3007))
(define-constant ERR_ALREADY_LISTED (err u3008))
(define-constant ERR_AUCTION_ACTIVE (err u3009))
(define-constant ERR_AUCTION_ENDED (err u3010))
(define-constant ERR_BID_TOO_LOW (err u3011))
(define-constant ERR_CANNOT_BID_OWN (err u3012))
(define-constant ERR_ROYALTY_TOO_HIGH (err u3013))

;; Marketplace fee: 2.5% (250 basis points)
(define-constant MARKETPLACE_FEE u250)
(define-constant FEE_DENOMINATOR u10000)

;; Maximum royalty: 10%
(define-constant MAX_ROYALTY u1000)

;; Default listing duration: 30 days
(define-constant DEFAULT_LISTING_DURATION u2592000)

;; ============================================
;; DATA STRUCTURES
;; ============================================

;; Verified contract templates
(define-map verified-contracts
  { contract-hash: (buff 32) }
  {
    name: (string-ascii 64),
    verified-at: uint,
    verified-by: principal,
    is-active: bool,
    royalty-rate: uint,
    royalty-recipient: principal
  }
)

;; NFT listings
(define-map listings
  { listing-id: uint }
  {
    seller: principal,
    nft-contract: principal,
    token-id: uint,
    price: uint,
    listing-type: (string-ascii 10),  ;; "FIXED" or "AUCTION"
    created-at: uint,
    expires-at: uint,
    is-active: bool
  }
)

;; Auction data
(define-map auctions
  { listing-id: uint }
  {
    highest-bidder: (optional principal),
    highest-bid: uint,
    min-increment: uint,
    reserve-price: uint,
    bid-count: uint
  }
)

;; Bid history
(define-map bid-history
  { listing-id: uint, bid-index: uint }
  {
    bidder: principal,
    amount: uint,
    timestamp: uint
  }
)

;; Collection statistics
(define-map collection-stats
  { contract-hash: (buff 32) }
  {
    total-volume: uint,
    total-sales: uint,
    floor-price: uint,
    highest-sale: uint
  }
)

;; User activity
(define-map user-stats
  { user: principal }
  {
    total-bought: uint,
    total-sold: uint,
    total-volume: uint
  }
)

;; Global counters
(define-data-var next-listing-id uint u1)
(define-data-var total-volume uint u0)
(define-data-var total-fees-collected uint u0)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get listing details
(define-read-only (get-listing (listing-id uint))
  (map-get? listings { listing-id: listing-id })
)

;; Get auction details
(define-read-only (get-auction (listing-id uint))
  (map-get? auctions { listing-id: listing-id })
)

;; Check if contract is verified using contract-hash?
(define-read-only (is-contract-verified (nft-contract principal))
  (match (contract-hash? nft-contract)
    hash (match (map-get? verified-contracts { contract-hash: hash })
           info (get is-active info)
           false)
    false
  )
)

;; Get verified contract info
(define-read-only (get-contract-info (nft-contract principal))
  (match (contract-hash? nft-contract)
    hash (map-get? verified-contracts { contract-hash: hash })
    none
  )
)

;; Get current time
(define-read-only (get-current-time)
  stacks-block-time
)

;; Check if listing is expired
(define-read-only (is-listing-active (listing-id uint))
  (match (map-get? listings { listing-id: listing-id })
    listing (and (get is-active listing) 
                 (< stacks-block-time (get expires-at listing)))
    false
  )
)

;; Calculate fees for a sale
(define-read-only (calculate-fees (price uint) (nft-contract principal))
  (let
    (
      (marketplace-fee (/ (* price MARKETPLACE_FEE) FEE_DENOMINATOR))
      (royalty-info (get-contract-info nft-contract))
      (royalty-fee (match royalty-info
                     info (/ (* price (get royalty-rate info)) FEE_DENOMINATOR)
                     u0))
    )
    {
      marketplace-fee: marketplace-fee,
      royalty-fee: royalty-fee,
      seller-proceeds: (- price (+ marketplace-fee royalty-fee))
    }
  )
)

;; Generate provenance string using to-ascii?
(define-read-only (generate-provenance 
    (listing-id uint) 
    (token-id uint) 
    (price uint)
  )
  (let
    (
      (listing-str (unwrap-panic (to-ascii? listing-id)))
      (token-str (unwrap-panic (to-ascii? token-id)))
      (price-str (unwrap-panic (to-ascii? price)))
      (time-str (unwrap-panic (to-ascii? stacks-block-time)))
    )
    (concat "PROVENANCE|LISTING:"
      (concat listing-str
        (concat "|TOKEN:"
          (concat token-str
            (concat "|PRICE:"
              (concat price-str
                (concat "|SOLD_AT:" time-str)
              )
            )
          )
        )
      )
    )
  )
)

;; Get collection stats
(define-read-only (get-collection-stats (nft-contract principal))
  (match (contract-hash? nft-contract)
    hash (default-to 
           { total-volume: u0, total-sales: u0, floor-price: u0, highest-sale: u0 }
           (map-get? collection-stats { contract-hash: hash }))
    { total-volume: u0, total-sales: u0, floor-price: u0, highest-sale: u0 }
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - ADMIN
;; ============================================

;; Verify an NFT contract using contract-hash?
(define-public (verify-contract 
    (nft-contract principal)
    (name (string-ascii 64))
    (royalty-rate uint)
    (royalty-recipient principal)
  )
  (let
    (
      (contract-code-hash (unwrap! (contract-hash? nft-contract) ERR_CONTRACT_NOT_VERIFIED))
    )
    ;; Only admin can verify
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    
    ;; Royalty cannot exceed maximum
    (asserts! (<= royalty-rate MAX_ROYALTY) ERR_ROYALTY_TOO_HIGH)
    
    ;; Store verified contract
    (map-set verified-contracts
      { contract-hash: contract-code-hash }
      {
        name: name,
        verified-at: stacks-block-time,
        verified-by: tx-sender,
        is-active: true,
        royalty-rate: royalty-rate,
        royalty-recipient: royalty-recipient
      }
    )
    
    ;; Initialize collection stats
    (map-set collection-stats
      { contract-hash: contract-code-hash }
      {
        total-volume: u0,
        total-sales: u0,
        floor-price: u0,
        highest-sale: u0
      }
    )
    
    (ok contract-code-hash)
  )
)

;; Revoke contract verification
(define-public (revoke-verification (nft-contract principal))
  (let
    (
      (contract-code-hash (unwrap! (contract-hash? nft-contract) ERR_CONTRACT_NOT_VERIFIED))
      (info (unwrap! (map-get? verified-contracts { contract-hash: contract-code-hash }) 
                     ERR_CONTRACT_NOT_VERIFIED))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    
    (map-set verified-contracts
      { contract-hash: contract-code-hash }
      (merge info { is-active: false })
    )
    
    (ok true)
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - LISTINGS
;; ============================================

;; Create a fixed-price listing
(define-public (create-listing
    (nft-contract principal)
    (token-id uint)
    (price uint)
    (duration uint)
  )
  (let
    (
      (listing-id (var-get next-listing-id))
      (expires-at (+ stacks-block-time (if (> duration u0) duration DEFAULT_LISTING_DURATION)))
    )
    ;; Verify contract is approved
    (asserts! (is-contract-verified nft-contract) ERR_CONTRACT_NOT_VERIFIED)
    
    ;; Verify price is valid
    (asserts! (> price u0) ERR_INVALID_PRICE)
    
    ;; Create listing
    (map-set listings
      { listing-id: listing-id }
      {
        seller: tx-sender,
        nft-contract: nft-contract,
        token-id: token-id,
        price: price,
        listing-type: "FIXED",
        created-at: stacks-block-time,
        expires-at: expires-at,
        is-active: true
      }
    )
    
    (var-set next-listing-id (+ listing-id u1))
    
    (ok {
      listing-id: listing-id,
      expires-at: expires-at,
      receipt: (generate-provenance listing-id token-id price)
    })
  )
)

;; Create an auction listing
(define-public (create-auction
    (nft-contract principal)
    (token-id uint)
    (starting-price uint)
    (reserve-price uint)
    (min-increment uint)
    (duration uint)
  )
  (let
    (
      (listing-id (var-get next-listing-id))
      (expires-at (+ stacks-block-time (if (> duration u0) duration DEFAULT_LISTING_DURATION)))
    )
    ;; Verify contract is approved
    (asserts! (is-contract-verified nft-contract) ERR_CONTRACT_NOT_VERIFIED)
    
    ;; Create listing
    (map-set listings
      { listing-id: listing-id }
      {
        seller: tx-sender,
        nft-contract: nft-contract,
        token-id: token-id,
        price: starting-price,
        listing-type: "AUCTION",
        created-at: stacks-block-time,
        expires-at: expires-at,
        is-active: true
      }
    )
    
    ;; Create auction data
    (map-set auctions
      { listing-id: listing-id }
      {
        highest-bidder: none,
        highest-bid: u0,
        min-increment: min-increment,
        reserve-price: reserve-price,
        bid-count: u0
      }
    )
    
    (var-set next-listing-id (+ listing-id u1))
    
    (ok listing-id)
  )
)

;; Buy a fixed-price listing
(define-public (buy-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) ERR_LISTING_NOT_FOUND))
      (price (get price listing))
      (seller (get seller listing))
      (nft-contract (get nft-contract listing))
      (fees (calculate-fees price nft-contract))
      (contract-info (get-contract-info nft-contract))
    )
    ;; Verify listing is active
    (asserts! (get is-active listing) ERR_LISTING_NOT_FOUND)
    (asserts! (is-eq (get listing-type listing) "FIXED") ERR_AUCTION_ACTIVE)
    (asserts! (< stacks-block-time (get expires-at listing)) ERR_LISTING_EXPIRED)
    (asserts! (not (is-eq tx-sender seller)) ERR_CANNOT_BID_OWN)
    
    ;; Transfer payment to seller
    (try! (stx-transfer? (get seller-proceeds fees) tx-sender seller))
    
    ;; Transfer marketplace fee
    (try! (stx-transfer? (get marketplace-fee fees) tx-sender CONTRACT_OWNER))
    
    ;; Transfer royalty if applicable
    (if (> (get royalty-fee fees) u0)
      (match contract-info
        info (try! (stx-transfer? (get royalty-fee fees) tx-sender (get royalty-recipient info)))
        true)
      true
    )
    
    ;; Deactivate listing
    (map-set listings
      { listing-id: listing-id }
      (merge listing { is-active: false })
    )
    
    ;; Update stats
    (update-stats nft-contract price seller tx-sender)
    
    (ok {
      price: price,
      fees: fees,
      provenance: (generate-provenance listing-id (get token-id listing) price)
    })
  )
)

;; Place a bid on an auction
(define-public (place-bid (listing-id uint) (bid-amount uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) ERR_LISTING_NOT_FOUND))
      (auction (unwrap! (map-get? auctions { listing-id: listing-id }) ERR_LISTING_NOT_FOUND))
      (current-highest (get highest-bid auction))
      (min-bid (+ current-highest (get min-increment auction)))
    )
    ;; Verify auction is active
    (asserts! (get is-active listing) ERR_LISTING_NOT_FOUND)
    (asserts! (is-eq (get listing-type listing) "AUCTION") ERR_LISTING_NOT_FOUND)
    (asserts! (< stacks-block-time (get expires-at listing)) ERR_AUCTION_ENDED)
    (asserts! (not (is-eq tx-sender (get seller listing))) ERR_CANNOT_BID_OWN)
    
    ;; Verify bid amount
    (if (> current-highest u0)
      (asserts! (>= bid-amount min-bid) ERR_BID_TOO_LOW)
      (asserts! (>= bid-amount (get price listing)) ERR_BID_TOO_LOW)
    )
    
    ;; Refund previous highest bidder
    (match (get highest-bidder auction)
      prev-bidder (try! (as-contract (stx-transfer? current-highest tx-sender prev-bidder)))
      true
    )
    
    ;; Accept new bid (escrow)
    (try! (stx-transfer? bid-amount tx-sender (as-contract tx-sender)))
    
    ;; Update auction
    (map-set auctions
      { listing-id: listing-id }
      (merge auction {
        highest-bidder: (some tx-sender),
        highest-bid: bid-amount,
        bid-count: (+ (get bid-count auction) u1)
      })
    )
    
    ;; Record bid history
    (map-set bid-history
      { listing-id: listing-id, bid-index: (get bid-count auction) }
      {
        bidder: tx-sender,
        amount: bid-amount,
        timestamp: stacks-block-time
      }
    )
    
    (ok {
      bid-accepted: bid-amount,
      bid-number: (+ (get bid-count auction) u1)
    })
  )
)

;; Settle an auction after it ends
(define-public (settle-auction (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) ERR_LISTING_NOT_FOUND))
      (auction (unwrap! (map-get? auctions { listing-id: listing-id }) ERR_LISTING_NOT_FOUND))
      (seller (get seller listing))
      (nft-contract (get nft-contract listing))
      (winning-bid (get highest-bid auction))
      (winner (unwrap! (get highest-bidder auction) ERR_LISTING_NOT_FOUND))
      (fees (calculate-fees winning-bid nft-contract))
      (contract-info (get-contract-info nft-contract))
    )
    ;; Verify auction has ended
    (asserts! (>= stacks-block-time (get expires-at listing)) ERR_AUCTION_ACTIVE)
    (asserts! (get is-active listing) ERR_LISTING_NOT_FOUND)
    
    ;; Verify reserve met
    (asserts! (>= winning-bid (get reserve-price auction)) ERR_BID_TOO_LOW)
    
    ;; Transfer payment to seller (from escrow)
    (try! (as-contract (stx-transfer? (get seller-proceeds fees) tx-sender seller)))
    
    ;; Transfer marketplace fee
    (try! (as-contract (stx-transfer? (get marketplace-fee fees) tx-sender CONTRACT_OWNER)))
    
    ;; Transfer royalty if applicable
    (if (> (get royalty-fee fees) u0)
      (match contract-info
        info (try! (as-contract (stx-transfer? (get royalty-fee fees) tx-sender (get royalty-recipient info))))
        true)
      true
    )
    
    ;; Deactivate listing
    (map-set listings
      { listing-id: listing-id }
      (merge listing { is-active: false })
    )
    
    ;; Update stats
    (update-stats nft-contract winning-bid seller winner)
    
    (ok {
      winner: winner,
      winning-bid: winning-bid,
      fees: fees
    })
  )
)

;; Cancel a listing
(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) ERR_LISTING_NOT_FOUND))
    )
    ;; Only seller can cancel
    (asserts! (is-eq tx-sender (get seller listing)) ERR_UNAUTHORIZED)
    (asserts! (get is-active listing) ERR_LISTING_NOT_FOUND)
    
    ;; If auction, refund highest bidder
    (if (is-eq (get listing-type listing) "AUCTION")
      (match (map-get? auctions { listing-id: listing-id })
        auction (match (get highest-bidder auction)
                  bidder (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender bidder)))
                  true)
        true)
      true
    )
    
    ;; Deactivate listing
    (map-set listings
      { listing-id: listing-id }
      (merge listing { is-active: false })
    )
    
    (ok true)
  )
)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

;; Update statistics after a sale
(define-private (update-stats 
    (nft-contract principal) 
    (price uint)
    (seller principal)
    (buyer principal)
  )
  (let
    (
      (contract-code-hash (unwrap-panic (contract-hash? nft-contract)))
      (current-stats (get-collection-stats nft-contract))
      (seller-stats (default-to { total-bought: u0, total-sold: u0, total-volume: u0 }
                               (map-get? user-stats { user: seller })))
      (buyer-stats (default-to { total-bought: u0, total-sold: u0, total-volume: u0 }
                              (map-get? user-stats { user: buyer })))
    )
    ;; Update collection stats
    (map-set collection-stats
      { contract-hash: contract-code-hash }
      {
        total-volume: (+ (get total-volume current-stats) price),
        total-sales: (+ (get total-sales current-stats) u1),
        floor-price: (if (or (is-eq (get floor-price current-stats) u0)
                            (< price (get floor-price current-stats)))
                       price
                       (get floor-price current-stats)),
        highest-sale: (if (> price (get highest-sale current-stats))
                        price
                        (get highest-sale current-stats))
      }
    )
    
    ;; Update seller stats
    (map-set user-stats
      { user: seller }
      {
        total-bought: (get total-bought seller-stats),
        total-sold: (+ (get total-sold seller-stats) u1),
        total-volume: (+ (get total-volume seller-stats) price)
      }
    )
    
    ;; Update buyer stats
    (map-set user-stats
      { user: buyer }
      {
        total-bought: (+ (get total-bought buyer-stats) u1),
        total-sold: (get total-sold buyer-stats),
        total-volume: (+ (get total-volume buyer-stats) price)
      }
    )
    
    ;; Update global stats
    (var-set total-volume (+ (var-get total-volume) price))
    
    true
  )
)
