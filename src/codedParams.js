const program = require('commander');
const coder = require('web3/lib/solidity/coder');
const fs = require("fs");
const solc = require('solc');
const Web3 = require('web3');

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

// Decodes constructor params
const decodeConstructorParams = function (abi, params) {
    const web3 = new Web3();
    return params.map(p => (web3.toAscii(p)));
};

let abi;
let prgm = program.version('0.1.0')
  .option('-d, --decode')
  .option('-e, --encode')
  .option('-a, --raw_abi  <JSON>')
  .option('-c, --contract_path <String>')
  .option('-p, --abi_path <String>')
  .option('-m, --params <String>')
  .parse(process.argv);

// Get abi
if (prgm.raw_abi) {
  abi = program.raw_abi;
} else if (prgm.abi_path) {
  abi =  fs.readFileSync(prgm.contract_path, 'utf8');
} else if (prgm.contract_path) {
  const compiledContract = solc.compile(fs.readFileSync(prgm.contract_path, 'utf8'), 0); // non-optimize compile for speed
  abi = compiledContract.contracts[':Equio'].interface;
}

if (abi) {
  abi = JSON.parse(abi);
  if (prgm.decode) {
    var chunks = [];
    for (var i = 0; i < prgm.params.length; i += 64) {
        chunks.push(prgm.params.substring(i, i + 64));
    }
    console.log(chunks);
    console.log(decodeConstructorParams(abi, chunks));
  } else if (prgm.encode) {
    console.log(encodeConstructorParams(abi, prgm.params.split(',')));
  }
} else {
  console.log('No ABI provided');
}
