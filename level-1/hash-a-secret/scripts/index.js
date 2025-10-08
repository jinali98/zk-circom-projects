import { buildPoseidon } from "circomlibjs";

// top-level await works because "type":"module"
const poseidon = await buildPoseidon();
const F = poseidon.F;

// choose your secret x (as BigInt)
const x = 12345678901234567890n;

// compute H = Poseidon(x)
const H = poseidon([x]);              // returns a field element
const Hstr = F.toString(H);           // decimal string for JSON

// IMPORTANT (Pattern B): witness generation needs BOTH public+private inputs
const input = { x: x.toString(), H: Hstr };
console.log(input);

