## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

Make sure to copy `.env.example` to `.env` and fill in the required environment variables.

```shell
$ source .env
$ forge script script/Deploy.s.sol:DeployFactory --rpc-url $RPC_URL --private-key $PRIVATE_KEY # dry-run the transaction
$ forge script script/Deploy.s.sol:DeployFactory --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast # broadcast the transaction
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
