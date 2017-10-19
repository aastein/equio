const program = require('commander');
const fs = require("fs");
const Web3 = require('web3');
const solc = require('solc');
const path = require('path');

program.version('0.1.0')
  .option('-e, --equio-genesis <address>', 'EquioGenesis address')
  .option('-n, --name <string>', 'ICO name')
  .option('-s, --sale <address>', 'ICO contract address')
  .option('-t, --token <address>', 'ICO token address')
  .option('-p, --password-hash <bytes32>', 'Keccak password hash')
  .option('-B, --buy-block <uint256>', 'Earliest block the contract address will accept funds')
  .option('-T, --buy-time <uint256>', 'Earliest unix time in seconds the contract address will accept funds')
  .parse(process.argv);

let errors = 0;

if (!program.equioGenesis) {
  console.log('error: no EquioGenesis address');
  errors += 1;
}
if (!program.name) {
  console.log('error: no name');
  errors += 1;
}
if (!program.sale) {
  console.log('error: no sale');
  errors += 1;
}
if (!program.token) {
  console.log('error: no token');
  errors += 1;
}
if (!program.passwordHash) {
  console.log('error: no password hash');
  errors += 1;
}
if (!program.buyBlock) {
  console.log('error: no buy block');
  errors += 1;
}
if (!program.buyTime) {
  console.log('error: no buy time');
  errors += 1;
}

// TODO: Two main functions. Deploy EquioGenesis and Call EquioGenesis to create a new Equio contract
if (!errors) {
  console.log('Deploying contract with:');
  console.log(program.equioGenesis, program.name, program.sale, program.token, program.passwordHash, program.buyBlock, program.buyTime);

  let web3 = new Web3();
  // web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

  // connect to ETH node
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

  // TODO: give warning if connected to testnet

  let contractPath = path.resolve('src/equio.sol');
  let source = fs.readFileSync(contractPath, 'utf8');
  let compiledContract = solc.compile(source, 1);
  let abi = compiledContract.contracts[':EquioGenesis'].interface;
  let bytecode = compiledContract.contracts[':EquioGenesis'].bytecode;
  let equioGenesis = new web3.eth.Contract(JSON.parse(abi));

  // console.log(abi);
  // console.log(equioGenesis);
  // console.log(web3.eth.accounts);







  // Automatically determines the use of call or sendTransaction based on the method type
  // myContractInstance.myMethod(param1 [, param2, ...] [, transactionObject] [, defaultBlock] [, callback]);

  /*
    TODO:
      - Verify equioGenesis contract code
      - Gas limit: 1,800,000
      - Create a transaction to post to the blockchain which calls
          EquioGenesis.generate()
      - Send the signed transaction to the BC
        - Sign the transaction with a user entered PK
        - Send the unsigned transaction to the user and wait to get a signed transaction input
      - Ethplor the transaction and wait for the contract to be created
      - Parrot the result of the transaction on the BC
  */
}
