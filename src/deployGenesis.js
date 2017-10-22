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

  // Deploy contract
  console.log('Confirm deployment on Parity');
  var myContractReturned = MyContract.new(data, function(err, myContract) {
    if (!err) {
      if (!myContract.address) {
        console.log('Deployment transaction hash', myContract.transactionHash);
      } else {
        let receipt = web3.eth.getTransactionReceipt(myContract.transactionHash);
        console.log('Deployed EquioGenesis at: ');
        switch (network.id) {
          case "1":
            console.log(`https://etherscan.io/address/${myContract.address}`);
            break;
          case "42":
            console.log(`https://kovan.etherscan.io/address/${myContract.address}`);
            break;
          default:
            break;
        }
        // save contract address
        fs.writeFile('.equioGenesisAddress', myContract.address, (err) => {
            if (err) throw err;
            console.log('Saved EquioGenesis Address');
        });
      }
      console.log('Password hash', prgm.password_hash);
      // deploy the contract
      await deploy(web3, abi, deployData, Contract, prgm, network);
    } catch (err) {
      console.log(err);
    }
  }
})();
