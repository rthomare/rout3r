import {
  Account,
  Address,
  Chain,
  Hex,
  PublicClient,
  Transport,
  WalletClient,
  createPublicClient,
  getContract,
  getContractAddress,
  http,
} from 'viem';
import { OnchainConfig, PINNED_CONTRACT_ABI, Route } from './types';
import { PINNED_CONTRACT_BYTECODE, RESERVED_ROUTES } from './constants';

let origin;
try {
  origin = window.location.origin;
} catch {
  origin = '';
}

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

/*
 * Get a route by id
 * @param config - the onchain config to use that contains the account, chain and client info
 * @param id - the id of the route to get
 * @returns the route if it exists
 *
 * @example
 * const { config } = useOnchain();
 * const route = await getRoute(config, 1n);
 */
export async function getRoute(
  config: OnchainConfig,
  id: bigint
): Promise<Route> {
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
  return route;
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
  cursor: bigint,
  limit: bigint
): Promise<{
  routes: Route[];
  cursor: bigint;
  length: bigint;
}> {
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  const [routes, newCursor, length] = (await config.contract.read.getRoutes(
    [cursor, limit],
    {
      account: config.walletClient.account as any,
    }
  )) as [Route[], bigint, bigint];
  const validatedRoutes = routes.filter((val) => val.isValue);
  return {
    routes: validatedRoutes,
    cursor: newCursor,
    length,
  };
}

/*
 * Add a route onchain
 * @param config - the onchain config to use that contains the account, chain and client info
 * @param route - the route to add
 * @returns the route with the id
 *
 * @example
 * const { config } = useOnchain();
 * const route = await addRoute(config, {
 *   command: 'g',
 *   name: 'Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   description: 'Searches Google',
 *   subRoutes: [],
 *   isValue: true,
 *   type: 'manual',
 * });
 */
export async function addRoute(
  config: OnchainConfig,
  route: Omit<Route, 'id'>
): Promise<Route> {
  if (!config.contract) {
    throw new Error('No contract found to update route.');
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
    ...route,
    id,
  };
}

/*
 * Update a route onchain
 * @param config - the onchain config to use that contains the account, chain and client info
 * @param route - the route to update
 * @returns the route
 * @throws an error if the client does not have an account
 * @throws an error if the contract is not found
 *
 * @example
 * const { config } = useOnchain();
 * const route = await updateRoute(config, {
 *   id: 1n,
 *   command: 'g',
 *   name: 'Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   description: 'Searches Google',
 *   subRoutes: [],
 *   isValue: true,
 *   type: 'manual',
 * });
 */
export async function updateRoute(config: OnchainConfig, route: Route) {
  if (!config.walletClient.account) {
    throw new Error('No account found to add route.');
  }
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  const { id, ...rest } = route;
  const { request } = await config.contract.simulate.updateRoute([id, rest], {
    account: config.walletClient.account as any,
  });
  const hash = await config.walletClient.writeContract({
    ...request,
    account: config.walletClient.account,
  });
  await createPublicClient({
    chain: config.walletClient.chain,
    transport: http(),
  }).waitForTransactionReceipt({ hash });
  return route;
}

/*
 * Delete a route onchain
 * @param config - the onchain config to use that contains the account, chain and client info
 * @param id - the id of the route to delete
 * @returns the route
 * @throws an error if the contract is not found
 *
 * @example
 * const { config } = useOnchain();
 * await deleteRoute(config, 1n);
 */
export async function deleteRoute(config: OnchainConfig, id: bigint) {
  if (!config.contract) {
    throw new Error('No contract found to delete route.');
  }
  const { request } = await config.contract.simulate.deleteRoute([id], {
    account: config.walletClient.account as any,
  });
  return config.walletClient.writeContract({
    ...request,
    account: config.walletClient.account,
  });
}
