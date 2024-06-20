import {
  Account,
  Address,
  Chain,
  GetContractReturnType,
  PublicClient,
  Transport,
  WalletClient,
} from 'viem';

import ROUTER_V1_0_0 from '../../contracts/versions/Router-1.0.0.json';

export const PINNED_CONTRACT_ABI = ROUTER_V1_0_0.abi;

// eslint-disable-next-line no-shadow
export enum RouteType {
  MANUAL = 0,
  RESERVED = 1,
}

/*
 * @type Route
 * The shape of the route object.
 * It contains the route data and an array of sub-routes.
 * @param command - The command that triggers the route. This is unique.
 * @param name - The name of the route.
 * @param url - The url that the route redirects to.
 * @param description - The description of the route.
 * @param subRoutes: string[] - the subroutes of the route each being a
 *    command::url pair (split on '::')
 *    Note: use SUBROUTE_SEPERATOR and the mapSubroutes util function to be safe.
 * @param isValue: boolean - whether the route is a value route
 * @param type: 'manual' | 'reserved' - the type of the route if
 *    manual can be edited if reserved cannot be edited
 *
 * @example
 * {
 *  command: 'g',
 *  name: 'Google',
 *  url: 'https://www.google.com/search?q=%@@@',
 *  description: 'Searches Google, can add `i` for images, `v` for video',
 *  subRoutes: [
 *    'i::https://www.google.com/search?tbm=isch&q=%@@@',
 *    'v::https://www.google.com/videohp&q=%@@@'
 *  ],
 *  isValue: true,
 *  type: 'manual',
 * }
 */
export type Route = {
  command: string;
  name: string;
  url: string;
  description: string;
  subRoutes: string[];
  isValue: boolean;
  routeType: RouteType;
};

/*
 * @type AppSettings
 * The properties that are specified as part of a route lookup request.
 * @param origin - The origin of the router.
 * @param searchFallback - The search fallback url if route is not found.
 * @param rpc - The rpc endpoint.
 * @param address - The address of the user for the given chainId in the rpc.
 * @param contract - The contract address of the deployed router.
 *
 * @example
 * {
 *  searchFallback: 'https://duckduckgo.com/?&q=%@@@',
 *  rpc: 'https://rpc.maticvigil.com',
 *  address: '0x1234',
 *  contract: '0x5678',
 * }
 */
export type AppSettings = {
  searchFallback: string;
  rpc: string;
  chainId: number;
  address: Address;
  contract: Address;
};

/*
 * @type OnchainConfig
 * The configuration for the onchain actions within the application
 * @param publicClient - The public client to use for onchain actions.
 * @param walletClient - The wallet client to use for onchain actions.
 * @param contract - The deployed contract to use for the router.
 *   Note: This is optional as the contract may not be deployed yet.
 *
 * @example
 * const walletClient = new WalletClient<Transport, Chain, Account>(transport, chain, account);
 * const publicClient = new PublicClient(transport, chain);
 * const contract = new Contract<Router>(transport, chain, account, Router.abi, Router.address);
 * const config: OnchainConfig = {
 *  publicClient: publicClient,
 *  walletClient: walletClient,
 *  contract: contract,
 * }
 */
export type OnchainConfig = {
  publicClient: PublicClient;
  walletClient: WalletClient<Transport, Chain, Account>;
  contract: GetContractReturnType<
    typeof PINNED_CONTRACT_ABI,
    WalletClient & PublicClient
  > | null;
};
