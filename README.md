# equio

Smart contract to allow entities to invest ETH into ICOs, receive ICO tokens from the ICO into the contract, and then distribute those ICO tokens back to investors in proportion to their ETH contribution.

## Contents

* [Installation](#installation)
* [Developing](#developing)
* [Deployment](#deployment)

## Installation

### Prerequisites

* Homebrew >= 1.3.4 (if using OSX)
* Parity >= 1.7.0
* Node.js >= 8.1.4
* Yarn >= 1.1.0

If you don't have Homebrew

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

If you're not using OSX, you can use a different package manager, or install the other pre-requisites manually.

If you don't have Parity

```bash
brew tap paritytech/paritytech
brew install parity --stable
```

If you don't have Node.js

```bash
brew install nvm
nvm install node
```

If you don't have Yarn

```bash
brew install yarn
```

### Instructions

Run Parity and go to http://127.0.0.1:3001/ and make sure you see something. If you see something, it's working :)

Let Parity sync to the current block, but you can move on to the next step while it does that

Install packages (this might take a while the first time)

```bash
yarn install
```

## Developing

Start Parity at the beginning of each coding session

### Tools

TODO

## Deployment

### Setup

TODO

### Releasing

TODO

#### Debugging

TODO

### Usage

Start Parity before creating each new Equi contract

The rest below needs to be edited into the above structure.

-----

- This contract is located at `address will be provided when functionality is fully tested`
- Call the generate function of the contract with gas limit ~600000 and values for

  `string _name` : Name of the sale. Used for logging and events only.

  `address _sale` : Address of the sale. Must start with 0x.

  `address _token` : Address of the ERC20 token the sale will distribute. Must start with 0x.

  `bytes32 _password_hash` : Keccak256 hash of the kill switch password. Must start with 0x.

  `uint256 _earliest_buy_block` : Earliest block that sale address will accecpt funds. Set to 0 if not needed.

  `uint256 _earliest_buy_time` : Earliest unix time that sale address will accecpt funds. Set to 0 if not needed.


- Record the address of the new Equio contract returned by the generate function.
- Use https://etherscan.io/verifyContract to verify the generated contract source code.
- Share the new Equio contract's address and password.
- Investors should look up the contract address received to check for the expected source code.
- Investments must be made with an amount over 1 finney. Amounts less than this will trigger a withdrawal.
- Anyone with the password can call the kill switch function.
- Someone must call the buy_sale function to trigger sending funds from the contract to the ICO address.
