# Hash a Secret (Poseidon Preimage)

Prove you **know a secret `x`** such that **`Poseidon(x) = H`** without revealing `x`.
`H` is a **public input** to the circuit and the circuit enforces `Poseidon(x) == H`.
You provide both `x` (private) and `H` (public) in `inputs/input.json`. the proof convinces a verifier that your `x` hashes to that exact `H`.

---

## What’s happening under the hood

1. **Compile** the circuit to R1CS/WASM/symbols.
2. **Generate witness**: the WASM computes `Poseidon(x)` and checks it equals the provided `H`.
3. **Setup keys** using a Powers-of-Tau file (`.ptau`).
4. **Prove** using the witness and proving key.
5. **Verify** using the verification key and the public inputs (which include `H`).

> Inputs file tip: `inputs/input.json` should contain both `x` and the matching `H` (as decimal strings). Compute `H` off-chain with `circomlibjs`’s Poseidon to avoid mismatches. the script `scripts/index.js` is used to generate the valid input file content.

---

## Prerequisites

- Node.js 18+
- `circom` 2.x installed

---

## Install dependencies

**Install circomlib & snarkjs (from your repo root)**

```bash
npm i -D circomlib snarkjs
```

---

## Compile the circuit

**Compile with a library path (`-l`) so the Poseidon include resolves**

```bash
circom circuits/hash_secret.circom --r1cs --wasm --sym -o outputs -l node_modules
```

---

## Generate the witness

**Run the WASM to create `witness.wtns` from your input**

```bash
node outputs/hash_secret_js/generate_witness.js outputs/hash_secret_js/hash_secret.wasm inputs/input.json outputs/witness.wtns
```

---

## Download the powers of tau

```bash
curl -L "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_10.ptau" -o outputs/pot10.ptau
```

---

## Generate proving & verification keys

**Groth16 setup using your `.r1cs` and the `.ptau` file**

```bash
snarkjs groth16 setup outputs/hash_secret.r1cs outputs/pot10.ptau outputs/hash_secret.zkey
```

---

## Export the verification key

**Create a JSON verification key for verifiers**

```bash
snarkjs zkey export verificationkey outputs/hash_secret.zkey outputs/vkey.json
```

---

## Generate the proof

**Produce `proof.json` and `pub.json` from the witness**

```bash
# prove (you already generated the witness)

snarkjs groth16 prove outputs/hash_secret.zkey outputs/witness.wtns outputs/proof.json outputs/pub.json
```

---

## Verify the proof

**Check the proof against the verification key and public inputs**

```bash
snarkjs groth16 verify outputs/vkey.json outputs/pub.json outputs/proof.json
```

---

## Expected artifacts

- `outputs/hash_secret.r1cs` – constraint system
- `outputs/hash_secret_js/hash_secret.wasm` – witness generator
- `outputs/witness.wtns` – witness (private)
- `outputs/hash_secret.zkey` – proving key
- `outputs/vkey.json` – verification key
- `outputs/proof.json` – proof
- `outputs/pub.json` – public inputs (includes `H`)

If verification fails, most of the time it could be because `H` in your input doesn’t match `Poseidon(x)`. Recompute `H` off-chain, update `inputs/input.json`, and re-run witness → prove → verify.
