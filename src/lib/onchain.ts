import {
  Address,
  Hex,
  PublicClient,
  WalletClient,
  getContractAddress,
} from 'viem';
import ROUTER_V1_0_0 from '../../contracts/versions/Router-1.0.0.json';

// Replace with the actual pinned bytecode
// Warning: Changing this value changes the contract addresses moving forward.
// If there is an existing user never change this value. First deploy this bytecode,
// then update the contract onchain.
const PINNED_CONTRACT_BYTECODE: Hex = ROUTER_V1_0_0.bytecode.object as Hex;
const LOCAL_STORAGE_KEY = 'ROUTER_CONTRACT_ADDRESS_KEY_';

// simple heuristic to check if the contract is the pinned contract by just checking the first 10 and last 10 bytes
function matchesPinnedContract(code?: Hex): boolean {
  if (!code) {
    return false;
  }
  return (
    code.startsWith(PINNED_CONTRACT_BYTECODE.slice(0, 10)) &&
    code.endsWith(PINNED_CONTRACT_BYTECODE.slice(-10))
  );
}

async function _contractAddress(
  from: Address,
  publicClient: PublicClient
): Promise<Address | undefined> {
  const count = await publicClient.getTransactionCount({ address: from });
  let nonce = BigInt(count - 1);
  while (nonce > 0) {
    const contractAddress = getContractAddress({
      from,
      nonce,
    });
    const code = await publicClient.getBytecode({ address: contractAddress });
    if (matchesPinnedContract(code)) {
      return contractAddress;
    }
    nonce = nonce - 1n;
  }
  return undefined;
}

/*
 * Check if the rout3r contract exists onchain
 * @param from - the address to check for the contract
 * @param client - the public client to use for RPC requests
 * @returns the contract address if it exists, otherwise undefined
 *
 * @example
 * const publicClient = usePublicClient();
 * const contractAddress = await contractExists('0x1234...', publicClient);
 */
export async function contractAddress(
  from: Address,
  client: PublicClient
): Promise<Address | undefined> {
  // Check local storage for the contract address
  const storedContractAddress = localStorage.getItem(
    `${LOCAL_STORAGE_KEY}${from}`
  ) as Address;
  if (storedContractAddress) {
    return storedContractAddress;
  }
  const add = await _contractAddress(from, client);
  if (add) {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}${from}`, add);
  }
  return add;
}

/*
 * Deploy the rout3r contract onchain
 * @param client - the wallet client to use for deployment
 * @returns the contract address if successful
 * @throws an error if the client does not have an account
 *
 * @example
 * const walletClient = useWalletClient();
 * const contractAddress = await deployContract(walletClient);
 */
export async function deployContract(client: WalletClient): Promise<Address> {
  if (!client.account) {
    throw new Error('No account found to deploy contract.');
  }
  const deploymentAddress = await client.deployContract({
    abi: ROUTER_V1_0_0.abi,
    account: client.account.address,
    bytecode: PINNED_CONTRACT_BYTECODE,
    maxFeePerBlobGas: 0n,
    blobs: [],
    chain: client.chain,
  });
  localStorage.setItem(
    `${LOCAL_STORAGE_KEY}${client.account.address}`,
    deploymentAddress
  );
  return deploymentAddress;
}
