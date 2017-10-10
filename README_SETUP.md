### Testing

IDE: https://remix.ethereum.org/
Test token code: https://etherscan.io/address/0x0F5D2fB29fb7d3CFeE444a200298f468908cC942#code

- Add the Equio and token code to separate files in Remix.
- Deploy the token address code to 0x0F5D2fB29fb7d3CFeE444a200298f468908cC942
- Deploy EquioGenesis
- Use password: password with hash: 0xb68fe43f0d1a0d7aef123722670be50268e15365401c442f8806ef83b612976b
- Call EquioGenesis.generate with
`"name","0xA66d83716c7CFE425B44D0f7ef92dE263468fb3d","0x0F5D2fB29fb7d3CFeE444a200298f468908cC942","b68fe43f0d1a0d7aef123722670be50268e15365401c442f8806ef83b612976b","earliest_buy_block","earliest_buy_time"`



- Download parity
- Go to settings > parity > Select `Parity uses Kovan testnet`
- Add the CONTRACTS button to the navbar by going to settings > views > Select the `Contracts` checkbox
- Click the `CONTRACTS` button
- Click `DEVELOP` in the sub-navigation bar
- Copy-paste in the test token source code
- In the `Select a contract` dropdown select `MANAToken`
- Click `DEPLOY` and deploy the contract
- Copy-paste in the Equio source code
- In the `Select a contract` dropdown select `EquioGenesis`
- Click `DEPLOY` and deploy the contract
- In the
