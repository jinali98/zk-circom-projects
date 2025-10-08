# ZK Learning Projects (Circom + snarkjs)

Practical, progressively harder projects to learn Zero-Knowledge Proofs without drowning. Each has purpose, deliverables, stack, scope, concepts, tests, and a timebox. Time caps: **Easy ≤ 6h**, **Medium ≤ 12h**, **Hard ≤ 20h**.

## Table of Contents

1. [Environment & Repo Structure](#environment--repo-structure)
2. [Easy (4)](#easy-4)

   - [E1. Poseidon Preimage (“Hash-a-Secret”)](#e1-poseidon-preimage-hash-a-secret)
   - [E2. Bounded Range Proof (0–100)](#e2-bounded-range-proof-0100)
   - [E3. Merkle Set Membership (Static Root)](#e3-merkle-set-membership-static-root)
   - [E4. Groth16 vs PLONK Comparison](#e4-groth16-vs-plonk-comparison)

3. [Medium (4)](#medium-4)

   - [M1. Anonymous Coupon (Membership + Nullifier)](#m1-anonymous-coupon-membership--nullifier)
   - [M2. Mini Semaphore “Anonymous Ping”](#m2-mini-semaphore-anonymous-ping)
   - [M3. Range-Limited Transfer Intent](#m3-range-limited-transfer-intent)
   - [M4. Incremental Merkle Tree (Append-Only)](#m4-incremental-merkle-tree-append-only)

4. [Hard (2)](#hard-2)

   - [H1. Tiny Mixer (Educational, Local)](#h1-tiny-mixer-educational-local)
   - [H2. Anonymous Poll w/ One-Vote Guarantee](#h2-anonymous-poll-w-one-vote-guarantee)

5. [Concepts & Math Cheatsheet](#concepts--math-cheatsheet)
6. [Quality & Safety Checks](#quality--safety-checks)
7. [Picking Your Path](#picking-your-path)

---

## Environment & Repo Structure

### Prerequisites

- Node 18+ (pnpm or yarn recommended)
- `circom` 2.x
- `snarkjs`
- `circomlib` / `circomlibjs`
- Optional (for medium+): `@zk-kit/incremental-merkle-tree`, `semaphore-protocol`
- Rust toolchain (for faster builds on some platforms)

### Install (example)

```bash
# macOS examples
brew install node rust circom
pnpm add -D snarkjs
pnpm add circomlibjs @zk-kit/incremental-merkle-tree semaphore-protocol
```

### Common Commands

```bash
# compile
circom circuit.circom --r1cs --wasm --sym -o build

# setup (Groth16)
snarkjs groth16 setup build/circuit.r1cs powersOfTau.ptau build/circuit.zkey
snarkjs zkey export verificationkey build/circuit.zkey build/verification_key.json

# witness + proof
node build/circuit_js/generate_witness.js build/circuit_js/circuit.wasm input.json witness.wtns
snarkjs groth16 prove build/circuit.zkey witness.wtns proof.json public.json

# verify
snarkjs groth16 verify build/verification_key.json public.json proof.json
```

---

## Easy (4)

### E1. Poseidon Preimage (“Hash-a-Secret”)

**Goal**: Prove knowledge of a secret `x` such that `Poseidon(x) = H` without revealing `x`.
**Why**: Canonical private-auth/commitment pattern.
**Deliverables**:

- `preimage.circom` (Poseidon from `circomlib`)
- CLI compile/prove/verify scripts
- Unit tests: valid + negative cases
  **Stack**: Circom, snarkjs, circomlibjs
  **I/O**: Private `x`; Public `H`; constraint `Poseidon(x) == H`
  **Concepts**: signals, constraints, witness, in-circuit hash
  **Math**: field arithmetic basics; ZK-friendly sponge intuition
  **Timebox**: ~3–4h
  **Accept**:
- Correct `(x, H)` verifies
- Mutated `x` or `H` fails

---

### E2. Bounded Range Proof (0–100)

**Goal**: Prove private `score ∈ [0,100]`.
**Why**: Eligibility checks (e.g., age ≥ 18) without revealing exact value.
**Deliverables**:

- `range_0_100.circom` (bit-decomp or inequality gadget)
- Node verifier with JSON I/O
- Tests: edge (0,100), invalid (−1,101)
  **Stack**: Circom, snarkjs
  **Concepts**: boolean constraints, range checks, constraint cost
  **Math**: integers in a field, modular arithmetic
  **Timebox**: ~4–5h
  **Accept**: 0/42/100 pass; −1/101 fail

---

### E3. Merkle Set Membership (Static Root)

**Goal**: Prove a leaf belongs to a fixed Merkle root (Poseidon).
**Why**: Whitelists/allowlists, claims, access control.
**Deliverables**:

- `merkle_membership.circom` with `leaf`, `pathElements`, `pathDirections`, `root`
- Off-chain builder to produce root + paths
- Tests: correct path passes; wrong direction/element fails
  **Stack**: Circom, snarkjs, circomlibjs
  **Concepts**: inclusion proofs, left/right selector, arity/depth
  **Math**: hash collision resistance; `O(log N)` paths
  **Timebox**: ~5–6h
  **Accept**: Valid leaf verifies; invalid path fails

---

### E4. Groth16 vs PLONK Comparison

**Goal**: Run the same circuit under Groth16 & PLONK; compare setup & metrics.
**Why**: Understand trusted vs universal setup & iteration speed.
**Deliverables**:

- `compare/` scripts running both on E1/E2
- Markdown table with proof sizes, verify times, setup steps
  **Stack**: snarkjs (Groth16 + PLONK)
  **Concepts**: CRS/SRS, trusted vs universal, DX tradeoffs
  **Math**: light overview of pairing-based proofs
  **Timebox**: ~3–4h
  **Accept**: Both verify same public inputs; metrics reported

---

## Medium (4)

### M1. Anonymous Coupon (Membership + Nullifier)

**Goal**: Prove allowlist membership and prevent double-redeem via `nullifierHash`.
**Why**: Single-use anonymous actions (coupons, tickets).
**Deliverables**:

- Circuit: Merkle inclusion + output `nullifierHash = H(nullifier)`
- Minimal redemption registry (JSON/in-mem) rejecting repeats
- Scripts + tests
  **Stack**: Circom, snarkjs, circomlibjs
  **I/O**: Private `leaf`/path + `nullifier`; Public `root`, `nullifierHash`
  **Concepts**: replay protection, root history (start with single root)
  **Math**: hash preimage; uniqueness via published nullifiers
  **Timebox**: ~8–10h
  **Accept**: First redeem passes; second (same secret) fails

---

### M2. Mini Semaphore “Anonymous Ping”

**Goal**: Anonymous message from a group member using Semaphore-style identities.
**Why**: Anonymous signaling/voting/attestations.
**Deliverables**:

- Identity gen (trapdoor, nullifier → commitment)
- Group IMT; use Semaphore circuits or simplified variant
- CLI: `ping "hello"` → proof + verification
  **Stack**: `semaphore-protocol`, `@zk-kit/incremental-merkle-tree`, snarkjs
  **Concepts**: identity commitments, external nullifier (topic-scoped uniqueness)
  **Math**: same Merkle/hash; anonymity set intuition
  **Timebox**: ~10–12h
  **Accept**: Two identities can ping once per topic; duplicates rejected

---

### M3. Range-Limited Transfer Intent

**Goal**: Prove privately that `amount ≤ LIMIT` and `balance ≥ amount` without revealing either.
**Why**: Policy/compliance checks without leaking financial data.
**Deliverables**:

- `transfer_intent.circom`: private `amount`, `balance`; public `limit` and a commitment to `(sender,receiver,amount)` or `H(amount‖tag)`
- Node verifier; boundary tests
  **Stack**: Circom, snarkjs
  **Concepts**: multi-constraint circuits; public vs private signals; binding commitments
  **Math**: range proofs; collision resistance
  **Timebox**: ~10–12h
  **Accept**: `(balance=5000, amount=1000, limit=2000)` passes; `amount=2500` fails

---

### M4. Incremental Merkle Tree (Append-Only)

**Goal**: Maintain an append-only IMT; prove membership against latest root.
**Why**: Backbone for mixers & anonymous groups.
**Deliverables**:

- IMT builder via `@zk-kit/incremental-merkle-tree`
- Circuit verifies path to provided `root`
- CLI: `append <leaf>` and `prove <leaf>`
  **Stack**: JS IMT lib, Circom, snarkjs
  **Concepts**: root updates, path recompute, snapshots
  **Math**: `O(log N)` updates; Poseidon properties
  **Timebox**: ~8–10h
  **Accept**: Old leaves verify vs latest root; wrong path fails

---

## Hard (2)

### H1. Tiny Mixer (Educational, Local)

**Goal**: Deposit (commitment) and withdraw (membership + `nullifierHash` once). No tokens/relayers.
**Why**: Learn core privacy mechanics behind mixers safely.
**Deliverables**:

- **Deposit**: `(secret, nullifier)` → `C = H(secret‖nullifier)`; append to IMT; keep root history
- **Withdraw circuit**: inclusion against a recent root; outputs `nullifierHash`
- **State service**: commitment set, root history, nullifier set
- **Demo**: deposit N notes → withdraw one → double-spend blocked
  **Stack**: Circom, snarkjs, circomlibjs, IMT lib (optional minimal Solidity/TS verifier)
  **Concepts**: note structure, root history, replay protection, fixed denomination
  **Math**: commitments & nullifiers; binding/hiding
  **Scope**: fixed value; depth 16–20; local JSON registry
  **Timebox**: ~14–18h
  **Accept**: First withdraw passes; second with same note fails

---

### H2. Anonymous Poll w/ One-Vote Guarantee

**Goal**: Anonymous poll where any group member can vote once per poll.
**Why**: Anonymous governance & community votes.
**Deliverables**:

- Identity setup (as in M2)
- Poll topic ID used as **external nullifier** to enforce one-vote-per-identity
- CLI: create poll → cast votes → tally privately
  **Stack**: Semaphore circuits or simplified variant, IMT, snarkjs
  **Concepts**: external nullifier defines uniqueness scope; public signal = vote
  **Math**: Merkle/hash; uniqueness via `(identityNullifier, pollId)`
  **Timebox**: ~14–18h
  **Accept**: Two users vote once each → counted; same user twice → rejected

---

## Concepts & Math Cheatsheet

- **Circom essentials**: signals (private/public), templates, arrays, constraints → R1CS → witness
- **Proving systems**:

  - _Groth16_: per-circuit trusted setup, tiny proofs, fast verify
  - _PLONK_: universal setup, easier iteration, slightly larger proofs

- **Hashes in circuits**: Poseidon/MiMC (ZK-friendly; fewer constraints than SHA/Keccak)
- **Merkle trees**: inclusion proofs (elements + directions), static vs incremental, depth tradeoffs
- **Nullifiers**: publish `H(nullifier)` to block replays without deanonymizing
- **Commitments**: binding + hiding; typically `H(secret || randomness || data)`; never reuse randomness
- **Range proofs**: bit-decomp vs inequality gadgets; watch overflow vs field size
