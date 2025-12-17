;; Minimal test contract to verify Clarity 4 feature support on testnet

(define-read-only (test-stacks-block-time)
  stacks-block-time
)

(define-read-only (test-to-ascii (num uint))
  (to-ascii? num)
)

(define-read-only (test-contract-hash (contract principal))
  (contract-hash? contract)
)

(define-read-only (get-all-tests)
  {
    block-time: stacks-block-time,
    ascii-test: (unwrap! (to-ascii? u42) (err "to-ascii failed")),
    hash-test: (is-some (contract-hash? tx-sender))
  }
)
