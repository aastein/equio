const program = require('commander');
const prompt = require('prompt');
const fs = require("fs");
const Web3 = require('web3');
const solc = require('solc');
const path = require('path');

const coder = require('web3/lib/solidity/coder');

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
const deploy = async (web3, abi, data, Contract, args, network) => (
  new Promise((resolve, reject) => {
    console.log('Confirm function call on Parity');
    // TODO: create own web3js with args array
    Contract.new(args.ico_name,
      args.sale,
      args.token,
      args.password_hash,
      args.earliest_buy_block,
      args.earliest_buy_time,
      data,
      function(err, contract) {
        if (!err) {
          if (!contract.address) {
            console.log('Deployment transaction hash', contract.transactionHash);
          } else {
            console.log('Deployed Equio at:');
            switch (network.id) {
              case "1":
                console.log(`https://etherscan.io/address/${contract.address}`);
                break;
              case "42":
                console.log(`https://kovan.etherscan.io/address/${contract.address}`);
                break;
              default:
                break;
            }
            resolve(contract.address);
          }
        } else {
          console.log(err);
          reject(err);
        }
      }
    );
  })
);

// Encodes constructor params
const encodeConstructorParams = function (abi, params) {
    return abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
    }).map(function (json) {
        return json.inputs.map(function (input) {
            return input.type;
        });
    }).map(function (types) {
        return coder.encodeParams(types, params);
    })[0] || '';
};

(async () => {

  // store list of arguments in EquioGenesis generate method
  const args = [];
  // flag for validation erros
  let error = false;
  let prgm = program.version('0.1.0');

  // contract initialization
  const contractPath = path.resolve('src/equio.sol');
  const source = fs.readFileSync(contractPath, 'utf8');
  const compiledContract = solc.compile(source, 1);
  const abi = JSON.parse(compiledContract.contracts[':Equio'].interface);
  const bytecode = '0x' + compiledContract.contracts[':Equio'].bytecode;

  // get arguments from abi for 'generate' method
  const constructorInputs = abi.find( block => (block.type === 'constructor')).inputs;

  for (let i = 0; i < constructorInputs.length; i += 1) {
    const input = constructorInputs[i];
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
    try {
      const web3 = new Web3();
      // connect to ETH node
      web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
      // log network name
      const network = await networkInfo(web3);
      console.log('Connected to network', network.name);
      // Constract stuff
      const Contract = web3.eth.contract(abi);
      const deployData = {
        from: web3.eth.accounts[0],
        data: bytecode,
      };
      // If no password_hash, get pw from user and hash it
      if (!prgm.password_hash) {
        prgm.password_hash = web3.sha3(await getPassword());
      }
      console.log('Password hash', prgm.password_hash);
      // deploy the contract
      await deploy(web3, abi, deployData, Contract, prgm, network);
      const params = [prgm.ico_name, prgm.sale, prgm.token, prgm.password_hash, prgm.earliest_buy_block, prgm.earliest_buy_time];
      const encodedConstructorParams = encodeConstructorParams(abi, params);
      console.log('encodeConstructorParams', encodedConstructorParams);
      
    } catch (err) {
      console.log(err);
    }
  }
})();


/*

  web3/lib/web3/contract.js 36 encodeConstructorParams

*/
