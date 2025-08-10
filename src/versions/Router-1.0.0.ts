// ignore all es lint errors in this file
/* eslint-disable */
export const ROUTER_V1_0_0 = {
  name: 'RouterV1.0.0',
  address: '0x',
  abi: [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    {
      inputs: [
        {
          internalType: 'struct RouteAddData',
          name: 'route',
          type: 'tuple',
          components: [
            { internalType: 'string', name: 'command', type: 'string' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'url', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            {
              internalType: 'string[]',
              name: 'subRoutes',
              type: 'string[]',
            },
          ],
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
      name: 'addRoute',
      outputs: [
        {
          internalType: 'struct Route',
          name: '',
          type: 'tuple',
          components: [
            { internalType: 'string', name: 'command', type: 'string' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'url', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            {
              internalType: 'string[]',
              name: 'subRoutes',
              type: 'string[]',
            },
            { internalType: 'bool', name: 'isValue', type: 'bool' },
            {
              internalType: 'enum RouteType',
              name: 'routeType',
              type: 'uint8',
            },
          ],
        },
      ],
    },
    {
      inputs: [
        {
          internalType: 'struct RouteAddData[]',
          name: 'newRoutes',
          type: 'tuple[]',
          components: [
            { internalType: 'string', name: 'command', type: 'string' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'url', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            {
              internalType: 'string[]',
              name: 'subRoutes',
              type: 'string[]',
            },
          ],
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
      name: 'addRoutes',
      outputs: [
        {
          internalType: 'struct Route[]',
          name: '',
          type: 'tuple[]',
          components: [
            { internalType: 'string', name: 'command', type: 'string' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'url', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            {
              internalType: 'string[]',
              name: 'subRoutes',
              type: 'string[]',
            },
            { internalType: 'bool', name: 'isValue', type: 'bool' },
            {
              internalType: 'enum RouteType',
              name: 'routeType',
              type: 'uint8',
            },
          ],
        },
      ],
    },
    {
      inputs: [{ internalType: 'string', name: 'command', type: 'string' }],
      stateMutability: 'nonpayable',
      type: 'function',
      name: 'deleteRoute',
    },
    {
      inputs: [
        { internalType: 'string[]', name: 'commands', type: 'string[]' },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
      name: 'deleteRoutes',
    },
    {
      inputs: [{ internalType: 'string', name: 'command', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
      name: 'getRoute',
      outputs: [
        {
          internalType: 'struct Route',
          name: '',
          type: 'tuple',
          components: [
            { internalType: 'string', name: 'command', type: 'string' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'url', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            {
              internalType: 'string[]',
              name: 'subRoutes',
              type: 'string[]',
            },
            { internalType: 'bool', name: 'isValue', type: 'bool' },
            {
              internalType: 'enum RouteType',
              name: 'routeType',
              type: 'uint8',
            },
          ],
        },
      ],
    },
    {
      inputs: [
        { internalType: 'string', name: 'cursor', type: 'string' },
        { internalType: 'uint256', name: 'n', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
      name: 'getRoutes',
      outputs: [
        {
          internalType: 'struct Route[]',
          name: '',
          type: 'tuple[]',
          components: [
            { internalType: 'string', name: 'command', type: 'string' },
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'url', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            {
              internalType: 'string[]',
              name: 'subRoutes',
              type: 'string[]',
            },
            { internalType: 'bool', name: 'isValue', type: 'bool' },
            {
              internalType: 'enum RouteType',
              name: 'routeType',
              type: 'uint8',
            },
          ],
        },
        { internalType: 'uint256', name: '', type: 'uint256' },
        { internalType: 'string', name: '', type: 'string' },
      ],
    },
    {
      inputs: [
        { internalType: 'string', name: 'command', type: 'string' },
        {
          internalType: 'struct RouteUpdateData',
          name: 'route',
          type: 'tuple',
          components: [
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'url', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            {
              internalType: 'string[]',
              name: 'subRoutes',
              type: 'string[]',
            },
          ],
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
      name: 'updateRoute',
    },
  ],
};
