const program = require('commander');
const prompt = require('prompt');
const fs = require("fs");
const Web3 = require('web3');
const solc = require('solc');
const path = require('path');

import  { networkInfo } from './utils';
import  { getChar, getName } from './utils';

// Prompt the user for a password and return the password
const getPassword = async () => (
  new Promise((resolve, reject) => {
    // promp schemas
    const promptSchema = {
      properties: {
        password: {
          hidden: true,
          message: 'Enter the kill switch password',
        }
      }
    };
    const confirmSchema = {
      properties: {
        password: {
          hidden: true,
          message: 'Re-enter the kill switch password',
        }
      }
    };
    prompt.start();
    prompt.get(promptSchema, (err, res1) => {
      prompt.get(confirmSchema, (err, res2) => {
        if (!res1.password || !res2.password || res1.password !== res2.password) {
          console.log('Passwords did not match');
          reject();
        } else {
          resolve(res1.password);
        }
      });
    });
  })
);

// call the generate function
const generate = async (web3, abi, genesisAddress, args) => (
  new Promise((resolve, reject) => {
    console.log('Confirm function call on Parity');
    // TODO: make these the contract args variable
    web3.eth.contract(abi).at(genesisAddress).generate(args.ico_name, args.sale, args.token,args.password_hash,args.earliest_buy_block,args.earliest_buy_time, { from: web3.eth.accounts[0] }, (err, txHash) => {
      if (!err) {
        resolve(txHash);
      }
      reject(err);
    });
  })
);


// get more info for a transaction by transaction hash
const trace = async (web3, txHash) => (
  new Promise((resolve, reject) => {
    try {
      web3.currentProvider.sendAsync({
        "method":"trace_replayTransaction",
        "params":[txHash, ['trace']],
        "id":1,
        "jsonrpc":"2.0"
      }, function (err, result) {
        resolve(result);
        reject(err);
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  })
);


(async () => {

  // store list of arguments in EquioGenesis generate method
  const args = [];
  // flag for validation erros
  let error = false;
  let prgm = program.version('0.1.0');

  // contract initialization
  const contractPath = path.resolve('src/equio.sol');
  const addressPath = path.resolve('.equioGenesisAddress');
  const source = fs.readFileSync(contractPath, 'utf8');
  const compiledContract = solc.compile(source, 1);
  const abi = JSON.parse(compiledContract.contracts[':EquioGenesis'].interface);
  const bytecode = compiledContract.contracts[':EquioGenesis'].bytecode;

  // get arguments from abi for 'generate' method
  for (let i = 0; i < abi[0].inputs.length; i += 1) {
    const input = abi[0].inputs[i];
    const char = getChar(input.name);
    const name = getName(input.name);
    const type = input.type;
    const argDesc = `-${char}, --${name} <${type}>`
    args.push(name);
    prgm = prgm.option(argDesc);
  }

  // validate command line arguments
  prgm.parse(process.argv);
  for (let i = 0; i < args.length; i += 1) {
    if (!prgm[args[i]]) {
      console.log('No value for', args[i], prgm.options.reduce((res, option) => (
        args[i] === option.long.slice(2, option.long.length) ? option.flags : res
      ), ''));
      if (args[i] !== 'password_hash') error = true;
    }
  }

  if (!error) {
    const web3 = new Web3();
    // connect to ETH node
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
    // log network name
    const network = await networkInfo(web3);
    console.log('Connected to network', network.name);
    // If no password_hash, get pw from user and hash it
    if (!prgm.password_hash) {
      prgm.password_hash = web3.sha3(await getPassword());
    }
    console.log('Password hash', prgm.password_hash);
    // get EquioGenesis address
    const genesisAddress = fs.readFileSync(addressPath, 'utf8');
    console.log('Using EquioGenesis at', genesisAddress);
    // call EquioGenesis generate method
    const txHash = await generate(web3, abi, genesisAddress, prgm);
    console.log('Transaction Hash', txHash);
    let txTrace = await trace(web3, txHash);
    while (!txTrace.result) {
      txTrace = await trace(web3, txHash);
    }
    console.log('New Equio address', txTrace.result.trace[1].result.address);
  }
})();
