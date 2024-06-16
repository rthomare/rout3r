import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { createConfig } from 'wagmi';
import { IS_FULL_DEV } from '../utils/general';
import { anvilConnector } from './anvilConnector';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const anvilWallet = mnemonicToAccount(
  'test test test test test test test test test test test junk'
);

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
  } else {
    return createConfig({
      chains: [arbitrumSepolia],
      transports: {
        [arbitrumSepolia.id]: http(),
      },
    });
  }
};
