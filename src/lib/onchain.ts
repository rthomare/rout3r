import {
  Address,
  Hex,
  PublicClient,
  WalletClient,
  createPublicClient,
  getContract,
  getContractAddress,
  http,
} from 'viem';
import ROUTER_V1_0_0 from '../../contracts/versions/Router-1.0.0.json';

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
const LOCAL_STORAGE_KEY = 'ROUTER_CONTRACT_ADDRESS_KEY_';

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

export async function getRouteContract(walletClient: WalletClient) {
  if (!walletClient.account) {
    throw new Error('No account found to get route.');
  }
  const publicClient = createPublicClient({
    chain: walletClient.chain,
    transport: http(),
  });
  const address = await contractAddress(
    walletClient.account.address,
    publicClient
  );
  if (!address) {
    throw new Error('Contract not deployed.');
  }

  // 1. Create contract instance
  return getContract({
    address,
    abi: PINNED_CONTRACT_ABI,
    client: {
      wallet: walletClient,
      public: publicClient,
    },
  });
}

export async function getRoute(
  walletClient: WalletClient,
  id: bigint
): Promise<ContractStoredRoute> {
  if (id < 0n) {
    const value = RESERVED_ROUTES.find((r) => r.id === id);
    if (!value) {
      throw Error("Couldn't find reserved route");
    }
    return value;
  }
  const contract = await getRouteContract(walletClient);
  const route = (await contract.read.getRoute([id])) as any;
  return {
    id,
    route,
  };
}

export async function getRoutes(
  walletClient: WalletClient,
  cursor: bigint,
  limit: bigint
): Promise<ContractStoredRoute[]> {
  const contract = await getRouteContract(walletClient);
  const data = (await contract.read.getRoutes([0n, 10n])) as [
    ContractStoredRoute[],
    bigint,
    bigint
  ];
  const contractRoutes = data[0].filter((val) => val.route.isValue);
  return RESERVED_ROUTES.concat(contractRoutes);
}

//here
export async function addRoute(
  walletClient: WalletClient,
  route: ContractStoredRouteData
): Promise<ContractStoredRoute> {
  if (!walletClient.account) {
    throw new Error('No account found to add route.');
  }
  if (isReservedCommand(route.command)) {
    throw new Error('Command is reserved.');
  }
  const contract = await getRouteContract(walletClient);
  const { result: id } = await contract.simulate.addRoute([route], {
    account: walletClient.account as any,
  });
  const hash = await contract.write.addRoute([route]);
  await createPublicClient({
    chain: walletClient.chain,
    transport: http(),
  }).waitForTransactionReceipt({ hash });
  return {
    id,
    route,
  };
}

export async function updateRoute(
  walletClient: WalletClient,
  id: bigint,
  routeData: ContractStoredRouteData
) {
  if (!walletClient.account) {
    throw new Error('No account found to add route.');
  }
  if (isReservedCommand(routeData.command)) {
    throw new Error('Command is reserved.');
  }
  if (isReservedId(id)) {
    throw new Error('Command is reserved.');
  }
  const contract = await getRouteContract(walletClient);
  const { request } = await contract.simulate.updateRoute([id, routeData], {
    account: walletClient.account as any,
  });
  const hash = await walletClient.writeContract({
    ...request,
    account: walletClient.account,
  });
  await createPublicClient({
    chain: walletClient.chain,
    transport: http(),
  }).waitForTransactionReceipt({ hash });
  return {
    id,
    route: routeData,
  };
}

export async function deleteRoute(walletClient: WalletClient, id: bigint) {
  if (!walletClient.account) {
    throw new Error('No account found to add route.');
  }
  if (isReservedId(id)) {
    throw new Error('Command is reserved.');
  }
  const contract = await getRouteContract(walletClient);
  const { request } = await contract.simulate.deleteRoute([id]);
  return walletClient.writeContract({
    ...request,
    account: walletClient.account,
  });
}
