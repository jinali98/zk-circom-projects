pragma circom 2.1.9;

include "circomlib/circuits/poseidon.circom";


template HashSecret() {

// Declare signals
    signal input x;
    signal input H;

// Declare components
    component poseidon = Poseidon(1);

// Assign signals
    poseidon.inputs[0] <== x;


    poseidon.out === H;
}

component main {public [H]} = HashSecret();

