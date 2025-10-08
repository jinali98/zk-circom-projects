// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import "../src/Verifier.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        Groth16Verifier verifier = new Groth16Verifier();
        vm.stopBroadcast();
    }
}
