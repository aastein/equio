const fs = require("fs");
const Web3 = require('web3');
const solc = require('solc');
const path = require('path');
import  { networkInfo } from './utils';

console.log('Deploying EquioGenesis');
(async () => {
  let web3 = new Web3();
  // connect to ETH node
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
  // log network name
  let network = await networkInfo(web3);
  console.log('Connected to network', network.name);
  // contract initialization
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
    }
  });
})();
