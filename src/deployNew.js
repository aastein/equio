const program = require('commander');
const prompt = require('prompt');
const fs = require("fs");
const Web3 = require('web3');
const solc = require('solc');
const path = require('path');
const coder = require('web3/lib/solidity/coder');

import  { networkInfo } from './utils';
import  { getChar, getName } from './utils';

/**
 * Prompt the user for matching passwords and return the password
 * @return {String} the password or an empty string if the passwords were invalid
 */
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
        if (res1.password !== res2.password) {
          console.log('Passwords did not match');
          resolve('');
        } else if (!res1.password || !res2.password) {
          console.log('Empty password not allowed');
          resolve('');
        } else {
          resolve(res1.password);
        }
      });
    });
  })
);

/**
 * Compile Equio and return its abi and bytecode
 * @return {Object} contract abi and bytecode
 */
const compileContract = () => {
  // contract initialization
  const contractPath = path.resolve('src/equio.sol');
  const source = fs.readFileSync(contractPath, 'utf8');
  // compile with optimization enabled
  const compiledContract = solc.compile(source, 1);
  const abi = JSON.parse(compiledContract.contracts[':Equio'].interface);
  const bytecode = '0x' + compiledContract.contracts[':Equio'].bytecode;
  // get the contracts constructor arguments from the abi
  const constructorInputs = abi.find(func => (func.type === 'constructor')).inputs;
  return { abi, bytecode, constructorInputs};
}

/**
 * @param {Array} constructorInputs - list of constructor input names
 * @param {Array} web3 - web3 instance used for hashing
 * @return {Object} values for construcor arguments
 */
const getCommandLineArgs = async (constructorInputs, web3) => {
  // flag for validation errors
  let error = false;
  // stores list of constructor arguments
  const inputNames = [];
  // stores input values
  const inputValues = [];
  // initalize command line arg library
  let prgm = program.version('0.1.0');

  // generate a command line argument for each constructor argument
  // maintain an array of all constructor input names
  for (let i = 0; i < constructorInputs.length; i += 1) {
    const input = constructorInputs[i];
    // decide on a command line arg flag for the parameter
    const char = getChar(input.name);
    // format the parameter name
    const name = getName(input.name);
    const type = input.type;
    const argDesc = `-${char}, --${name} <${type}>`
    inputNames.push(name);
    prgm = prgm.option(argDesc);
  }

  // ingest values supplied by the user at function invocation. example: yarn run thisScript -a value -b value
  prgm.parse(process.argv);

  // validate user supplied values.
  // prompt if password hash is missing.
  // add values to inputValues in the order the contract constructor declates its arguments
  for (let i = 0; i < inputNames.length; i += 1) {
    let value = prgm[inputNames[i]];
    if (!value) {
      // log which parameter was not supplied
      console.log('No value for', inputNames[i], prgm.options.reduce((res, option) => (
        inputNames[i] === option.long.slice(2, option.long.length) ? option.flags : res
      ), ''));
      // set error to true if an argument other than password hash was not supplied
      if (inputNames[i] === 'password_hash') {
        // If no password_hash, get a valid password from the user and hash it
        let password = '';
        while (password.length < 1) password = await getPassword();
        value = web3.sha3(password);
      } else {
        error = true
      };
    }
    inputValues.push(value);
  }

  // exit after all errors are logged
  if (error) process.exit(1);
  return inputValues;
}

/**
 * Called during contract deployment
 * @param {Object} err - deployment errors
 * @param {Object} contract - web3js contract object
 * @return {String} the deployed contract's address
 */
const deployCallback = (err, contract) => {
  // this callback is called twice. Once when the transaction is posed and once when the transaction is confirmed.
  if (!err) {
    if (!contract.address) {
      // First callback: Transaction has been posted
      console.log('Deployment transaction hash', contract.transactionHash);
      console.log('Waiting for confirmation...');
    } else {
      // Second callback: The contract has been deployed at an address
      console.log('Deployed Equio at:');
      // log URLs to view the deployed contract
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

/**
 * Deploys a smart contract
 * @param {Web3} web3 - a web3js instance
 * @param {Object} abi -  smart contract abi
 * @param {Object} deployData - ETH account and compiled smart contract bytecode
 * @param {Array} args - smart contract constructor arguments
 * @param {Object} network - info about the network the Web3 instance is connected to
 * @return {String} deployed smart contract address
 */
const deploy = async (web3, abi, deployData, args, network) => (
  new Promise((resolve, reject) => {
    // Instruct the user to confirm the transaction on the Parity GUI
    console.log('Confirm function call on Parity');
    // TODO: Fork and modify web3.js so that this method accepts contract args as an array
    // Deploy the contract
    const Contract = web3.eth.contract(abi);
    Contract.new(args[0], args[1], args[2], args[3], args[4], args[5], deployData, deployCallback);
  })
);

/**
 * Encodes contract constructor parameters.
 * @param {Array} constructorInputs - Array of smart contract contructor inputs
 * @param {Array} params - smart contract constructor paramters
 * @return {Object} the encoded smart contract constructor parameters
 */
const encodeConstructorParams = (constructorData, constructorInputs) => {
  const types = constructorInputs.map(input => { return input.type; });
  return coder.encodeParams(types, constructorData);
};

/**
 * todo: use these parameters to verify the source code on etherscan.
 * Create encoded constructor parameters. This data is needed to verify the deployed contract's source code.
 * @param {Array} constructorData - values for constructor arguments
 */
const reportEncodedConstructorParams = (constructorData, contractData) => {
  const encodedConstructorParams = encodeConstructorParams(constructorData, contractData.constructorInputs);
  console.log('Encoded Constructor Parameters:\n', encodedConstructorParams);
}

/**
 * Script exexution begins at this self-executing async anonymous function.
 */
(async () => {
  try {
    const web3 = new Web3();
    // compile and get smart contract data
    const contractData = compileContract();
    // get command line arg values for constructor arguments
    const constructorData = await getCommandLineArgs(contractData.constructorInputs, web3);
    // connect to ETH node
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
    // log the network name
    const network = await networkInfo(web3);
    console.log('Connected to network', network.name);
    const deployData = {
      from: web3.eth.accounts[0],
      data: contractData.bytecode,
    };
    // deploy the contract
    await deploy(web3, contractData.abi, deployData, constructorData, network);
    // print encoded constructor params
    reportEncodedConstructorParams(constructorData, contractData);
  } catch (err) {
    console.log(err);
  }
})();
