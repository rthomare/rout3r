import {
  Account,
  Address,
  Chain,
  Hex,
  PublicClient,
  WalletClient,
  createPublicClient,
  getContract,
  getContractAddress,
  http,
} from 'viem';
import ROUTER_V1_0_0 from '../../contracts/versions/Router-1.0.0.json';
import { IS_FULL_DEV } from '../utils/general';

let origin;
try {
  origin = window.location.origin;
} catch {
  origin = '';
}

// Replace with the actual pinned bytecode
// Warning: Changing this value changes the contract addresses moving forward.
// If there is an existing user never change this value. First deploy this bytecode,
// then update the contract onchain.
const PINNED_CONTRACT_BYTECODE: Hex = ROUTER_V1_0_0.bytecode.object as Hex;
const PINNED_CONTRACT_ABI = ROUTER_V1_0_0.abi;
const LOCAL_STORAGE_KEY = 'ROUTER_CONTRACT_ADDRESS_KEY';

/*
 * The type depicting the stored route data
 * command: string - the command for the route
 * name: string - the name of the route
 * url: string - the url of the route
 * subRoutes: string[] - the subroutes of the route each being a command::url pair (split on '::')
 * isValue: boolean - whether the route is a value route
 */
export type ContractStoredRouteData = {
  command: string;
  name: string;
  url: string;
  subRoutes: string[];
  isValue: boolean;
};

/*
 * The type depicting the stored route
 * id: bigint - the id of the route
 * data: ContractStoredRouteData - the data of the route
 */
export type ContractStoredRoute = {
  id: bigint;
  route: ContractStoredRouteData;
};

export type OnchainConfig = {
  account: Account;
  chain: Chain;
  publicClient: PublicClient;
  walletClient: WalletClient;
};

export const RESERVED_ROUTES: ContractStoredRoute[] = [
  {
    id: -1n,
    route: {
      command: 'r3',
      name: 'rout3r Menu',
      url: `${origin}/rout3r/`,
      subRoutes: [
        `setup::${origin}/rout3r/#setup`,
        `about::${origin}/rout3r/#about`,
        `new::${origin}/rout3r/#routes/new`,
        `search::${origin}/rout3r/#route/%@@@`,
      ],
      isValue: true,
    },
  },
];

// a funtion to get the contract address given the address, nonce, and bytecode
async function _contractAddress(
  config: OnchainConfig
): Promise<Address | undefined> {
  const count = await config.publicClient.getTransactionCount({
    address: config.account.address,
  });
  let nonce = BigInt(count - 1);
  while (nonce > -1) {
    const contractAddress = getContractAddress({
      from: config.account.address,
      nonce,
    });
    const code = await config.publicClient.getBytecode({
      address: contractAddress,
    });
    if (matchesPinnedContract(code)) {
      return contractAddress;
    }
    nonce = nonce - 1n;
  }
  return undefined;
}

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

// a function to check if a command is reserved
function isReservedCommand(command: string) {
  return RESERVED_ROUTES.some((r) => r.route.command === command);
}

// a function to check if a command is reserved
function isReservedId(id: bigint) {
  return RESERVED_ROUTES.some((r) => r.id === id);
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
export async function contractAddress(config: OnchainConfig): Promise<Address> {
  // Check local storage for the contract address
  const key = `${LOCAL_STORAGE_KEY}_${config.account.address}_${config.chain.id}`;
  const storedContractAddress = localStorage.getItem(key) as Address;
  if (storedContractAddress && !IS_FULL_DEV) {
    return storedContractAddress;
  }
  const add = await _contractAddress(config);
  if (add) {
    localStorage.setItem(key, add);
  }
  return add ?? '0x';
}

/*
 * Deploy the rout3r contract onchain
 * @param client - the wallet client to use for deployment
 * @returns the contract address if successful
 * @throws an error if the client does not have an account
 *
 * @example
 * const { config } = useOnchain();
 * const contractAddress = await deployContract(walletClient);
 */
export async function deployContract(config: OnchainConfig): Promise<Address> {
  if (!config.account) {
    throw new Error('No account found to deploy contract.');
  }
  const deploymentAddress = await config.walletClient.deployContract({
    abi: ROUTER_V1_0_0.abi,
    account: config.account.address,
    bytecode: PINNED_CONTRACT_BYTECODE,
    maxFeePerBlobGas: 0n,
    blobs: [],
    chain: config.walletClient.chain,
  });
  localStorage.setItem(
    `${LOCAL_STORAGE_KEY}${config.account.address}`,
    deploymentAddress
  );
  return deploymentAddress;
}

export async function getRouteContract(config: OnchainConfig) {
  const address = await contractAddress(config);
  if (!address) {
    throw new Error('Contract not deployed.');
  }

  // 1. Create contract instance
  return getContract({
    address,
    abi: PINNED_CONTRACT_ABI,
    client: {
      public: config.publicClient,
      wallet: config.walletClient,
    },
  });
}

export async function getRoute(
  config: OnchainConfig,
  id: bigint
): Promise<ContractStoredRoute> {
  if (id < 0n) {
    const value = RESERVED_ROUTES.find((r) => r.id === id);
    if (!value) {
      throw Error("Couldn't find reserved route");
    }
    return value;
  }
  const contract = await getRouteContract(config);
  const route = (await contract.read.getRoute([id], {
    account: config.account as any,
  })) as any;
  return {
    id,
    route,
  };
}

export async function getRoutes(
  config: OnchainConfig,
  cursor: bigint,
  limit: bigint
): Promise<ContractStoredRoute[]> {
  const contract = await getRouteContract(config);
  const data = (await contract.read.getRoutes([cursor, limit], {
    account: config.account as any,
  })) as [ContractStoredRoute[], bigint, bigint];
  const contractRoutes = data[0].filter((val) => val.route.isValue);
  return RESERVED_ROUTES.concat(contractRoutes);
}

//here
export async function addRoute(
  config: OnchainConfig,
  route: ContractStoredRouteData
): Promise<ContractStoredRoute> {
  if (!config.account) {
    throw new Error('No account found to add route.');
  }
  if (isReservedCommand(route.command)) {
    throw new Error('Command is reserved.');
  }
  const contract = await getRouteContract(config);
  const { result: id } = await contract.simulate.addRoute([route], {
    account: config.account as any,
  });
  const hash = await contract.write.addRoute([route], {
    account: config.account as any,
  });
  await createPublicClient({
    chain: config.chain,
    transport: http(),
  }).waitForTransactionReceipt({ hash });
  return {
    id,
    route,
  };
}

export async function updateRoute(
  config: OnchainConfig,
  id: bigint,
  routeData: ContractStoredRouteData
) {
  if (!config.account) {
    throw new Error('No account found to add route.');
  }
  if (isReservedCommand(routeData.command)) {
    throw new Error('Command is reserved.');
  }
  if (isReservedId(id)) {
    throw new Error('Command is reserved.');
  }
  const contract = await getRouteContract(config);
  const { request } = await contract.simulate.updateRoute([id, routeData], {
    account: config.account as any,
  });
  const hash = await config.walletClient.writeContract({
    ...request,
    account: config.account,
  });
  await createPublicClient({
    chain: config.chain,
    transport: http(),
  }).waitForTransactionReceipt({ hash });
  return {
    id,
    route: routeData,
  };
}

export async function deleteRoute(config: OnchainConfig, id: bigint) {
  if (isReservedId(id)) {
    throw new Error('Command is reserved.');
  }
  const contract = await getRouteContract(config);
  const { request } = await contract.simulate.deleteRoute([id], {
    account: config.account as any,
  });
  return config.walletClient.writeContract({
    ...request,
    account: config.account,
  });
}
