// scripts/verify-onchain.mjs
import { readFileSync } from "fs";
import { ethers } from "ethers";
import { groth16 } from "snarkjs";

const RPC = "YOUR_RPC_URL";
const VERIFIER = "0xA71917C4A9b783Ce681178Bbd9bf17Ef0b3bc0d4";
const ABI = [
  "function verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[1]) view returns (bool)"
];

const proof = JSON.parse(readFileSync("../outputs/proof.json","utf8"));
const pub   = JSON.parse(readFileSync("../outputs/pub.json","utf8"));

const calldataStr = await groth16.exportSolidityCallData(proof, pub);
const [A,B,C,Pub] = JSON.parse("[" + calldataStr + "]");

const provider = new ethers.JsonRpcProvider(RPC);
const verifier = new ethers.Contract(VERIFIER, ABI, provider);

const ok = await verifier.verifyProof(A,B,C,Pub);
console.log("On-chain verification:", ok ? "VALID ✅" : "INVALID ❌");
if (!ok) process.exit(1);
