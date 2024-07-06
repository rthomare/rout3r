import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { createConfig } from 'wagmi';

import { anvilConnector } from './anvilConnector';
// import { injected, walletConnect } from 'wagmi/connectors';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const anvilChain = defineChain({
  /** Collection of block explorers */
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
  id: 31337,
  name: 'Anvil',
  /** Currency used by chain */
  nativeCurrency: {
    name: 'anvil Token',
    symbol: 'MTK',
    decimals: 18,
  },
  /** Collection of RPC endpoints */
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
  /** Flag for test networks */
  testnet: true,
});

export const anvilClients = () => {
  const anvilWallet = privateKeyToAccount(
    '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  );
  const account = anvilWallet;
  const chain = anvilChain;
  const transport = http('http://localhost:8545');
  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  });
  const publicClient = createPublicClient({
    chain,
    transport,
  });
  return {
    walletClient,
    publicClient,
  };
};

const IS_FULL_DEV = !!process.env.VITE_FULL_DEV;
export const config = () => {
  if (IS_FULL_DEV) {
    const { walletClient } = anvilClients();
    const connector = anvilConnector({
      account: walletClient.account,
    });
    return createConfig({
      ssr: false,
      chains: [walletClient.chain],
      client: () => walletClient,
      connectors: [connector],
    });
  }
  const connectors = connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: [injectedWallet, walletConnectWallet],
      },
    ],
    {
      appName: 'Rout3r',
      projectId: 'daba908b6f524d3924a0ed3ac48d4077',
    }
  );
  return createConfig({
    chains: [arbitrumSepolia],
    transports: {
      [arbitrumSepolia.id]: http(),
    },
    connectors,
  });
};

export const appConfig = config();
