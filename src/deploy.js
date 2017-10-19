const fs = require("fs");
const Web3 = require('web3');
const solc = require('solc');
const path = require('path');

console.log('Deploying EquioGenesis');

let web3 = new Web3();
let networkId;
// connect to ETH node
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// log network name
web3.version.getNetwork((err, netId) => {
  let networkName;
  switch (netId) {
    case "1":
      networkName = "Main";
      break;
    case "2":
      networkName = "Morden";
      break;
    case "3":
      networkName = "Ropsten";
      break;
    case "4":
      networkName = "Rinkeby";
      break;
    case "42":
      networkName = "Kovan";
      break;
    default:
      networkName = "Unknown";
  }
  networkId = netId;
  console.log('Connected to network', networkName);
})

// Do contract things
let contractPath = path.resolve('src/equio.sol');
let source = fs.readFileSync(contractPath, 'utf8');
let compiledContract = solc.compile(source, 1);
let abi = compiledContract.contracts[':EquioGenesis'].interface;
let bytecode = '0x' + compiledContract.contracts[':EquioGenesis'].bytecode;
let gasEstimate = web3.eth.estimateGas({data: bytecode});
let MyContract = web3.eth.contract(JSON.parse(abi));

let data = {
  from: web3.eth.accounts[0],
  data: bytecode,
  gas: gasEstimate
};

while (web3.eth.syncing) {
  console.log('still syncing');
}

// Deploy contract
var myContractReturned = MyContract.new(data, function(err, myContract) {
  if (!err) {
    if (!myContract.address) {
      console.log('Deployment transaction hash', myContract.transactionHash);
    } else {
      let receipt = web3.eth.getTransactionReceipt(myContract.transactionHash);
      console.log(receipt);
      console.log('Deployed EquioGenesis at: ');
      switch (networkId) {
        case "1":
          console.log(`https://etherscan.io/address/${myContract.address}`);
          break;
        case "2":
          break;
        case "3":
          break;
        case "4":
          break;
        case "42":
          console.log(`https://kovan.etherscan.io/address/${myContract.address}`);
          break;
        default:
          networkName = "Unknown";
      }
      // save contract address
      const fs = require('fs');
      fs.writeFile('equioGenesisAddress', myContract.address, (err) => {
          // throws an error, you could also catch it here
          if (err) throw err;
          // success case, the file was saved
          console.log('Saved EquioGenesis Address');
      });
    }
  }
});
