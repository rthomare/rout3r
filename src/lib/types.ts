import ROUTER_V1_0_0 from '../../contracts/versions/Router-1.0.0.json';
import {
  Account,
  Chain,
  GetContractReturnType,
  PublicClient,
  Transport,
  WalletClient,
} from 'viem';

export const PINNED_CONTRACT_ABI = ROUTER_V1_0_0.abi;

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
 * @param subRoutes: string[] - the subroutes of the route each being a command::url pair (split on '::')
 *    Note: use SUBROUTE_SEPERATOR and the mapSubroutes util function to be safe.
 * @param isValue: boolean - whether the route is a value route
 * @param type: 'manual' | 'reserved' - the type of the route if manual can be edited if reserved cannot be edited
 *
 *
 * @example
 * {
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   subRoutes: [
 *     {
 *       command: 'i',
 *       name: 'Images',
 *       url: 'https://www.google.com/search?tbm=isch&q=%@@@',
 *     },
 *   ],
 * }
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

export type OnchainConfig = {
  publicClient: PublicClient;
  walletClient: WalletClient<Transport, Chain, Account>;
  contract: GetContractReturnType<
    typeof PINNED_CONTRACT_ABI,
    WalletClient & PublicClient
  > | null;
};
