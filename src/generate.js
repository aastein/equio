const program = require('commander');
const fs = require("fs");
const Web3 = require('web3');
const solc = require('solc');
const path = require('path');

import  { getChar, getName } from './utils';

let prgm = program.version('0.1.0');

const args = [];
let errors = 0;

// contract stuff
let contractPath = path.resolve('src/equio.sol');
let source = fs.readFileSync(contractPath, 'utf8');
let compiledContract = solc.compile(source, 1);
let abi = compiledContract.contracts[':EquioGenesis'].interface;
const abiObject = JSON.parse(abi);
let bytecode = compiledContract.contracts[':EquioGenesis'].bytecode;

// generate program args from abi
for (let i = 0; i < abiObject[0].inputs.length; i += 1) {
  const input = abiObject[0].inputs[i];
  const char = getChar(input.name);
  const name = getName(input.name);
  const type = input.type;
  const argDesc = `-${char}, --${name} <${type}>`
  args.push(name);
  prgm = prgm.option(argDesc);
}

// validate args
prgm.parse(process.argv);
for (let i = 0; i < args.length; i += 1) {
  if (!prgm[args[i]]) {
    errors += 1;
    console.log('No arg for', args[i]);
  }
}

// TODO: Two main functions. Deploy EquioGenesis and Call EquioGenesis to create a new Equio contract
if (!errors) {

}
