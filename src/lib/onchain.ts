import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
} from 'viem';
import { origin } from '../utils/general';
import { ORIGIN_REPLACEMENT, CONTARCT_ABI } from './constants';
import { AppSettings, OnchainConfig, Route } from './types';

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
    abi: CONTARCT_ABI,
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
    abi: CONTARCT_ABI,
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
