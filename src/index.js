var program = require('commander');

program
  .version('0.1.0')
  .option('-e, --equio-genesis <address>', 'EquioGenesis address')
  .option('-n, --name <string>', 'ICO name')
  .option('-s, --sale <address>', 'ICO contract address')
  .option('-t, --token <address>', 'ICO token address')
  .option('-p, --password-hash <bytes32>', 'Keccak password hash')
  .option('-B, --buy-block <uint256>', 'Earliest block the contract address will accept funds')
  .option('-T, --buy-time <uint256>', 'Earliest unix time in seconds the contract address will accept funds')
  .parse(process.argv);

var errors = 0;

if (!program.equioGenesis) { console.log('error: no EquioGenesis address'); errors += 1; }
if (!program.name)         { console.log('error: no name');          errors += 1; }
if (!program.sale)         { console.log('error: no sale');          errors += 1; }
if (!program.token)        { console.log('error: no token');         errors += 1; }
if (!program.passwordHash) { console.log('error: no password hash'); errors += 1; }
if (!program.buyBlock)     { console.log('error: no buy block');     errors += 1; }
if (!program.buyTime)      { console.log('error: no buy time');      errors += 1; }

if  (!errors) {
  console.log('Deploying contract with:');
  console.log(
    program.equioGenesis,
    program.name,
    program.sale,
    program.token,
    program.passwordHash,
    program.buyBlock,
    program.buyTime);
  /*
    TODO:
      - Verify equioGenesis contract code
      - Estimate the amount of gas needed for the transaction
      - Create a transaction to post to the blockchain which calls
          EquioGenesis.generate()
      - Send the signed transaction to the BC
        - Sign the transaction with a user entered PK
        - Send the unsigned transaction to the user and wait to get a signed transaction input
      - Ethplor the transaction and wait for the contract to be created
      - Parrot the result of the transaction on the BC
  */
}
