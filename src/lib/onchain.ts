import {
  Address,
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  getContract,
  getContractAddress,
  http,
} from 'viem';
import { origin } from '../utils/general';
import {
  ORIGIN_REPLACEMENT,
  PINNED_CONTRACT_ABI,
  PINNED_CONTRACT_DEPLOYED_BYTECODE,
} from './constants';
import { AppSettings, OnchainConfig, Route } from './types';

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
  client: OnchainConfig['client']
): Promise<Address | null> {
  if (!client.account) {
    throw new Error('No account found to get contract.');
  }

  const count = await client.getTransactionCount({
    address: client.account.address,
  });
  let nonce = BigInt(count - 1);
  while (nonce > -1) {
    const contractAddress = getContractAddress({
      from: client.account.address,
      nonce,
    });
    // We need to check if the contract is the pinned contract successively
    // until we can find the contract
    // eslint-disable-next-line no-await-in-loop
    const code = await client.getCode({
      address: contractAddress,
    });
    // simple heuristic to check if the contract is the pinned
    // contract by just checking the first 10 and last 10 bytes
    if (code && code === PINNED_CONTRACT_DEPLOYED_BYTECODE) {
      return contractAddress;
    }
    nonce -= 1n;
  }
  return null;
}

// TODO: Look into if we need this function
// async function checkTransactionSuccess(
//   onchainConfig: OnchainConfig,
//   hash: Hex,
//   errorTitle?: string
// ) {
//   return onchainConfig.client
//     .waitForTransactionReceipt({ hash })
//     .then((r) => {
//       if (r.status !== 'success') {
//         throw new Error(`Transaction failed ${errorTitle ?? ''}`);
//       }
//     });
// }

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
export async function deployContract(
  client: OnchainConfig['client']
): Promise<OnchainConfig['contract']> {
  if (!client.account) {
    throw new Error('No account found to deploy contract.');
  }
  const count = await client.getTransactionCount({
    address: client.account.address,
  });
  const contractAddress = getContractAddress({
    from: client.account.address,
    nonce: BigInt(count),
  });

  const hash = await client.deployContract({
    abi: [],
    account: client.account.address,
    bytecode: PINNED_CONTRACT_DEPLOYED_BYTECODE,
  });
  return checkTransactionSuccess(config, hash).then(() =>
    getContract({
      address: contractAddress,
      abi: PINNED_CONTRACT_ABI,
      client,
    })
  );
}

/*
 * Get a route by command
 * @param command - the command of the route to get
 * @param appSettings - the request properties to use for the route lookup
 * @returns the route if it exists or undefined if it does not
 *
 * @example
 * const appSettings = {
 *  account: '0x1234',
 *  contract: '0x5678',
 *  rpc: 'https://rpc.maticvigil.com',
 *  origin: 'https://rout3r.com',
 * };
 * const route = await searchRoute('g', appSettings);
 */
export async function searchRoute(
  command: string,
  appSettings: Omit<AppSettings, 'searchFallback'>
): Promise<Route | undefined> {
  const publicClient = createPublicClient({
    transport: http(appSettings.rpc),
  });
  const data = encodeFunctionData({
    abi: PINNED_CONTRACT_ABI,
    functionName: 'getRoute',
    args: [command],
  });
  const result = await publicClient
    .call({
      to: appSettings.contract,
      data,
      account: appSettings.address,
    })
    .catch(() => ({ data: undefined }));
  if (!result.data) {
    return undefined;
  }
  const route = decodeFunctionResult({
    abi: PINNED_CONTRACT_ABI,
    functionName: 'getRoute',
    data: result.data,
  }) as Route;
  return {
    ...route,
    url: route.url.replace(ORIGIN_REPLACEMENT, origin()),
    subRoutes: route.subRoutes.map((sr: string) =>
      sr.replace(ORIGIN_REPLACEMENT, origin())
    ),
  };
}

/*
 * Get a route by id
 * @param config - the onchain config to use that contains the account, chain and client info
 * @param id - the id of the route to get
 * @returns the route if it exists
 *
 * @example
 * const { config } = useOnchain();
 * const route = await getRoute(config, 'r3');
 */
export async function getRoute(
  config: OnchainConfig,
  command: string
): Promise<Route> {
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  if (!config.client.chain) {
    throw new Error('No chain found to get route.');
  }
  return searchRoute(command, {
    address: config.client.account.address,
    contract: config.contract.address,
    chainId: config.client.chain.id,
    rpc: config.client.chain.rpcUrls.default.http[0],
  }).then((route) => {
    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  });
}

/*
 * Get a list of routes
 * @param config - the onchain config to use that contains the account, chain and client info
 * @param cursor - the cursor to start at, 0n for the first route
 * @param limit - the limit of routes to get
 * @returns the list of routes, the new cursor and the length of the routes.
 *   If the cursor is 0n or length is 0n then there are no more routes to get.
 *
 * @example
 * const { config } = useOnchain();
 * const { routes, cursor, length } = await getRoutes(config, 0n, 10n);
 */
export async function getRoutes(
  config: OnchainConfig,
  cursor: string,
  limit: bigint
): Promise<{
  routes: Route[];
  cursor: string;
  length: bigint;
}> {
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  const [routes, length, newCursor] = (await config.contract.read.getRoutes(
    [cursor, limit],
    {
      account: config.client.account,
    }
  )) as [Route[], bigint, string];
  const validatedRoutes = routes
    .filter((val) => val.isValue)
    .map((v) => ({
      ...v,
      url: v.url.replace(ORIGIN_REPLACEMENT, origin()),
      subRoutes: v.subRoutes.map((sr) =>
        sr.replace(ORIGIN_REPLACEMENT, origin())
      ),
    }));
  return {
    routes: validatedRoutes,
    cursor: newCursor,
    length,
  };
}
