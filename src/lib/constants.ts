import { Hex } from 'viem';

import { ROUTER_V1_0_0 } from '../versions/Router-1.0.0';

// TODO: Replace with the actual v1.0 pinned bytecode
// Warning: Changing this value changes the contract addresses moving forward.
// If there is an existing user never change this value. First deploy this bytecode,
// then update the contract onchain.
export const PINNED_CONTRACT_DEPLOYED_BYTECODE: Hex = ROUTER_V1_0_0
  .deployedBytecode.object as Hex;
export const PINNED_CONTRACT_BYTECODE: Hex = ROUTER_V1_0_0.bytecode
  .object as Hex;
export const PINNED_CONTRACT_ABI = ROUTER_V1_0_0.abi;
export const SUBROUTE_SEPERATOR = '::';
export const SEARCH_REPLACEMENT = '%@@@';
export const ORIGIN_REPLACEMENT = '%0000';
export const BROWSER_SEARCH_PARAM = 'q';
export const BROWSER_SEARCH_VALUE = '%s';
