pragma circom 2.1.9;

template BoundedRange(){

signal input score;

constraint score >= 0;
constraint score <= 100;

}

component main = BoundedRange();