import {
  Account,
  Address,
  Chain,
  GetContractReturnType,
  Hex,
  PublicClient,
  Transport,
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
const PINNED_CONTRACT_BYTECODE: Hex = ROUTER_V1_0_0.deployedBytecode
  .object as Hex;
const PINNED_CONTRACT_ABI = ROUTER_V1_0_0.abi;

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
  publicClient: PublicClient;
  walletClient: WalletClient<Transport, Chain, Account>;
  contract?: GetContractReturnType<
    typeof PINNED_CONTRACT_ABI,
    WalletClient & PublicClient
  >;
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

/*
 * A function to get the the rout3r contract if it exists onchain
 * @param config - the onchain config to use that contains the account, chain and client info
 *
 * @example
 * const publicClient = usePublicClient();
 * const walletClient = useWalletClient();
 * const contract = await getRouterContract(publicClient, walletClient);
 */
export async function getRouterContract(
  publicClient: PublicClient,
  walletClient: WalletClient<Transport, Chain, Account>
): Promise<OnchainConfig['contract']> {
  const count = await publicClient.getTransactionCount({
    address: walletClient.account.address,
  });
  let nonce = BigInt(count - 1);
  while (nonce > -1) {
    const contractAddress = getContractAddress({
      from: walletClient.account.address,
      nonce,
    });
    const code = await publicClient.getBytecode({
      address: contractAddress,
    });
    // simple heuristic to check if the contract is the pinned contract by just checking the first 10 and last 10 bytes
    if (code && code === PINNED_CONTRACT_BYTECODE) {
      return getContract({
        address: contractAddress,
        abi: PINNED_CONTRACT_ABI,
        client: {
          public: publicClient,
          wallet: walletClient,
        },
      });
    }
    nonce = nonce - 1n;
  }
  return undefined;
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
 * Deploy the rout3r contract onchain
 * @param client - the wallet client to use for deployment
 * @returns the txn hash if successful
 * @throws an error if the client does not have an account
 *
 * @example
 * const { config } = useOnchain();
 * const hash = await deployContract(walletClient);
 */
export async function deployContract(config: OnchainConfig): Promise<Address> {
  if (!config.walletClient.account) {
    throw new Error('No account found to deploy contract.');
  }
  const hash = await config.walletClient.deployContract({
    abi: PINNED_CONTRACT_ABI,
    account: config.walletClient.account.address,
    bytecode: PINNED_CONTRACT_BYTECODE,
    maxFeePerBlobGas: 0n,
    blobs: [],
    chain: config.walletClient.chain,
  });
  return hash;
}

export async function getRoute(
  config: OnchainConfig,
  id: bigint
): Promise<ContractStoredRoute> {
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  if (id < 0n) {
    const value = RESERVED_ROUTES.find((r) => r.id === id);
    if (!value) {
      throw Error("Couldn't find reserved route");
    }
    return value;
  }
  const route = (await config.contract.read.getRoute([id], {
    account: config.walletClient.account as any,
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
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  const data = (await config.contract.read.getRoutes([cursor, limit], {
    account: config.walletClient.account as any,
  })) as [ContractStoredRoute[], bigint, bigint];
  const contractRoutes = data[0].filter((val) => val.route.isValue);
  return RESERVED_ROUTES.concat(contractRoutes);
}

//here
export async function addRoute(
  config: OnchainConfig,
  route: ContractStoredRouteData
): Promise<ContractStoredRoute> {
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  if (isReservedCommand(route.command)) {
    throw new Error('Command is reserved.');
  }
  const { result: id } = await config.contract.simulate.addRoute([route], {
    account: config.walletClient.account as any,
  });
  const hash = await config.contract.write.addRoute([route], {
    account: config.walletClient.account as any,
  });
  await createPublicClient({
    chain: config.walletClient.chain,
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
  if (!config.walletClient.account) {
    throw new Error('No account found to add route.');
  }
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  if (isReservedCommand(routeData.command)) {
    throw new Error('Command is reserved.');
  }
  if (isReservedId(id)) {
    throw new Error('Command is reserved.');
  }
  const { request } = await config.contract.simulate.updateRoute(
    [id, routeData],
    {
      account: config.walletClient.account as any,
    }
  );
  const hash = await config.walletClient.writeContract({
    ...request,
    account: config.walletClient.account,
  });
  await createPublicClient({
    chain: config.walletClient.chain,
    transport: http(),
  }).waitForTransactionReceipt({ hash });
  return {
    id,
    route: routeData,
  };
}

export async function deleteRoute(config: OnchainConfig, id: bigint) {
  if (!config.contract) {
    throw new Error('No contract found to delete route.');
  }
  if (isReservedId(id)) {
    throw new Error('Command is reserved.');
  }
  const { request } = await config.contract.simulate.deleteRoute([id], {
    account: config.walletClient.account as any,
  });
  return config.walletClient.writeContract({
    ...request,
    account: config.walletClient.account,
  });
}
