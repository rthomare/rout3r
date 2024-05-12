import {
  Address,
  Hex,
  PublicClient,
  WalletClient,
  getContractAddress,
  toBytes,
} from 'viem';
import ROUTER_V1_0_0 from '../../contracts/versions/Router-1.0.0.json';

// Replace with the actual pinned bytecode
// Warning: Changing this value changes the contract addresses moving forward.
// If there is an existing user never change this value. First deploy this bytecode,
// then update the contract onchain.
const PINNED_CONTRACT_BYTECODE: Hex = ROUTER_V1_0_0.bytecode.object as Hex;
const SALT = 'testv1';

export function contractAddress(from: Address): Address {
  return getContractAddress({
    bytecode: PINNED_CONTRACT_BYTECODE,
    from,
    opcode: 'CREATE2',
    salt: toBytes(''),
  });
}

export async function contractExists(
  from: Address,
  client: PublicClient
): Promise<boolean> {
  const address = contractAddress(from);
  // Check if the contract exists
  const code = await client.getBytecode({ address });
  return code ? code !== '0x' : false;
}

export async function deployContract(client: WalletClient): Promise<Address> {
  if (!client.account) {
    throw new Error('No account found to deploy contract.');
  }
  return client.deployContract({
    abi: ROUTER_V1_0_0.abi,
    account: client.account.address,
    bytecode: PINNED_CONTRACT_BYTECODE,
    maxFeePerBlobGas: 0n,
    blobs: [],
    chain: client.chain,
  });
}
