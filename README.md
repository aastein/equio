# Equio

Smart contract to invest in ICOs and distribute ICO tokens back to investors in proportion to their contribution.

## Requirements

Use a wallet that is compatible with [web3.js](https://github.com/ethereum/web3.js/) like [Parity](https://parity.io/)

## Usage

Install dependencies with `yarn install`

Deploy a new EquioGenesis contract with `yarn deployGenesis`

Deploy a new Equio contract through an EquioGenesis address with `yarn callGenerate <args>`

Deploy a new Equio contract with `yarn deployNew <args>`

Get encoded contructor params with `yarn encode <args>`

## Commands

</br>

#### yarnDeployGenesis

Deploys an EquioGenesis contract which can create new Equio contracts.

</br>

#### yarn deployNew / yarn callGenerate <args>

Deploys a new Equio contract.

Arguments are generated by the Equio constructor `src/equio.sol`

If the password hash is known then use the `password_hash` argument

If the password hash is unknown then leave the  `password_hash` argument empty. The CLI will prompt for the password and calculate it's hash.

Run `yarn deploy --help` to see arguments

```sh
Options:

  -V, --version                       output the version number
  -i, --ico_name <string>             
  -s, --sale <address>                
  -t, --token <address>               
  -p, --password_hash <bytes32>       
  -e, --earliest_buy_block <uint256>  
  -f, --earliest_buy_time <uint256>   
  -h, --help                          output usage information

```

</br>

#### yarn encode <args>

Encodes a comma separated list of constructor aguments. Helpful for validating deployed contracts.

Run `yarn enoce --help` to see arguments

```sh
Options:

  -V, --version                       output the version number
  -a, --raw_abi  <JSON>         
  -c, --contract_path <String>  
  -p, --abi_path <String>       
  -m, --params <String>         
  -h, --help                          output usage information

```
