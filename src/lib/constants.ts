import { Hex } from 'viem';
import ROUTER_V1_0_0 from '../../contracts/versions/Router-1.0.0.json';
import { Route } from './types';

// TODO: Replace with the actual v1.0 pinned bytecode
// Warning: Changing this value changes the contract addresses moving forward.
// If there is an existing user never change this value. First deploy this bytecode,
// then update the contract onchain.
export const PINNED_CONTRACT_BYTECODE: Hex = ROUTER_V1_0_0.deployedBytecode
  .object as Hex;

export const RESERVED_ROUTES: Route[] = [
  {
    id: -1n,
    command: 'r3',
    name: 'rout3r Menu',
    url: `${origin}/rout3r/`,
    description: 'The rout3r menu',
    subRoutes: [
      `setup::${origin}/rout3r/#setup`,
      `about::${origin}/rout3r/#about`,
      `new::${origin}/rout3r/#routes/new`,
      `search::${origin}/rout3r/#route/%@@@`,
    ],
    isValue: true,
    type: 'reserved',
  },
];
