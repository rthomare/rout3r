import {
  Address,
  concat,
  decodeFunctionResult,
  encodeAbiParameters,
  encodeFunctionData,
  getContract,
  getContractAddress,
  Hex,
  keccak256,
  PublicClient,
  toHex,
  WalletClient,
} from 'viem';

import { UseSmartAccountClientResult } from '@account-kit/react';

import { origin } from '../utils/general';

import {
  ORIGIN_REPLACEMENT,
  PINNED_CONTRACT_ABI,
  PINNED_CONTRACT_BYTECODE,
  PINNED_CONTRACT_DEPLOYED_BYTECODE,
} from './constants';
import { AppSettings, OnchainConfig, Route } from './types';

function getRouterContractDeployData(
  walletClient: Exclude<UseSmartAccountClientResult['client'], undefined>
) {
  const byteCode = concat([
    PINNED_CONTRACT_BYTECODE,
    encodeAbiParameters(
      [
        {
          name: 'owner_',
          type: 'address',
          internalType: 'address',
        },
      ],
      [walletClient.account.address]
    ),
  ]);

  const salt = keccak256(toHex(BigInt(walletClient.account.address) + 2n));

  return {
    salt,
    byteCode,
    deployer: '0x4e59b44847b379578588920ca78fbf26c0b4956c' as Address,
  };
}

async function checkTransactionSuccess(
  onchainConfig: OnchainConfig,
  hash: Hex,
  errorTitle?: string
) {
  return onchainConfig.publicClient
    .waitForTransactionReceipt({ hash })
    .then((r) => {
      if (r.status !== 'success') {
        throw new Error(`Transaction failed ${errorTitle ?? ''}`);
      }
    });
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
  walletClient: UseSmartAccountClientResult['client']
): Promise<Address | null> {
  if (!walletClient) return null;

  const { salt, byteCode, deployer } =
    getRouterContractDeployData(walletClient);

  const contractAddress = getContractAddress({
    from: deployer,
    opcode: 'CREATE2',
    bytecode: byteCode,
    salt,
  });
  // We need to check if the contract is the pinned contract successively
  // until we can find the contract
  // eslint-disable-next-line no-await-in-loop
  const code = await publicClient.getBytecode({
    address: contractAddress,
  });

  // simple heuristic to check if the contract is the pinned
  // contract by just checking the first 10 and last 10 bytes
  if (code && code === PINNED_CONTRACT_DEPLOYED_BYTECODE) {
    return contractAddress;
  }

  return null;
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
export async function deployContract(
  config: OnchainConfig
): Promise<OnchainConfig['contract']> {
  if (!config.walletClient) {
    throw new Error('No account found to deploy contract.');
  }

  const { salt, byteCode, deployer } = getRouterContractDeployData(
    config.walletClient
  );

  const contractAddress = getContractAddress({
    from: deployer,
    opcode: 'CREATE2',
    bytecode: byteCode,
    salt,
  });

  const { hash } = await config.walletClient.sendUserOperation({
    uo: {
      target: deployer,
      data: concat([salt, byteCode]),
    },
  });

  const txHash = await config.walletClient.waitForUserOperationTransaction({
    hash,
  });

  return checkTransactionSuccess(config, txHash).then(() =>
    getContract({
      address: contractAddress,
      abi: PINNED_CONTRACT_ABI,
      client: {
        public: config.publicClient as PublicClient,
        wallet: config.walletClient as unknown as WalletClient,
      },
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
  appSettings: Omit<AppSettings, 'searchFallback'>,
  publicClient: OnchainConfig['publicClient']
): Promise<Route | undefined> {
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
  if (!config.contract || !config.walletClient) {
    throw new Error('No contract found to update route.');
  }

  return searchRoute(
    command,
    {
      address: config.walletClient?.account.address,
      contract: config.contract.address,
      chainId: config.publicClient.chain.id,
    },
    config.publicClient
  ).then((route) => {
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
  if (!config.contract || !config.walletClient) {
    throw new Error('No contract found to update route.');
  }

  const [routes, length, newCursor] = (await config.publicClient.readContract({
    abi: PINNED_CONTRACT_ABI,
    address: config.contract.address,
    functionName: 'getRoutes',
    args: [cursor, limit],
  })) as [Route[], bigint, string];

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
 *   subRoutes: [],,
 * });
 */
export async function addRoute(
  config: OnchainConfig,
  createRouteData: Omit<Route, 'routeType' | 'isValue'>
): Promise<Route> {
  if (!config.contract || !config.walletClient) {
    throw new Error('No contract found to update route.');
  }

  const { result: route } = await config.contract.simulate.addRoute(
    [createRouteData],
    {
      account: config.walletClient.account.address,
    }
  );

  const { hash } = await config.walletClient.sendUserOperation({
    uo: {
      target: config.contract.address,
      data: encodeFunctionData({
        abi: config.contract.abi,
        functionName: 'addRoute',
        args: [createRouteData],
      }),
    },
  });

  const txHash = await config.walletClient.waitForUserOperationTransaction({
    hash,
  });
  await checkTransactionSuccess(config, txHash);

  return route as unknown as Route;
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
 *   command: 'g',
 *   name: 'Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   description: 'Searches Google',
 *   subRoutes: [],
 * });
 */
export async function updateRoute(
  config: OnchainConfig,
  command: string,
  updateRouteData: Omit<Route, 'command' | 'routeType' | 'isValue'>
) {
  if (!config.walletClient) {
    throw new Error('No account found to add route.');
  }
  if (!config.contract) {
    throw new Error('No contract found to update route.');
  }
  const { result: route } = await config.contract.simulate.updateRoute(
    [command, updateRouteData],
    {
      account: config.walletClient.account.address,
    }
  );

  const { hash } = await config.walletClient.sendUserOperation({
    uo: {
      target: config.contract.address,
      data: encodeFunctionData({
        abi: config.contract.abi,
        functionName: 'updateRoute',
        args: [command, updateRouteData],
      }),
    },
  });

  const txHash = await config.walletClient.waitForUserOperationTransaction({
    hash,
  });

  await checkTransactionSuccess(config, txHash);
  return route as unknown as Route;
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
 * await deleteRoute(config, 'g');
 */
export async function deleteRoute(config: OnchainConfig, command: string) {
  if (!config.contract || !config.walletClient) {
    throw new Error('No contract found to delete route.');
  }

  const { hash } = await config.walletClient.sendUserOperation({
    uo: {
      target: config.contract.address,
      data: encodeFunctionData({
        abi: config.contract.abi,
        functionName: 'deleteRoute',
        args: [command],
      }),
    },
  });

  return config.walletClient.waitForUserOperationTransaction({ hash });
}
