import { Hex } from 'viem';

import { ROUTER_V1_0_0 } from '../versions/Router-1.0.0';

export const CONTARCT_ABI = ROUTER_V1_0_0.abi;
export const CONTARCT_ADDRESS: Hex = ROUTER_V1_0_0.address as Hex;
export const SUBROUTE_SEPERATOR = '::';
export const SEARCH_REPLACEMENT = '%@@@';
export const ORIGIN_REPLACEMENT = '%0000';
export const BROWSER_SEARCH_PARAM = 'q';
export const BROWSER_SEARCH_VALUE = '%s';
