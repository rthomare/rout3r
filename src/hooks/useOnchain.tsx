import { PropsWithChildren, createContext, useContext } from 'react';
import { OnchainConfig } from '../lib/onchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Center, Spinner } from '@chakra-ui/react';
import { mnemonicToAccount } from 'viem/accounts';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from 'viem';
import { IS_FULL_DEV } from '../utils/general';

const ConfigContext = createContext<{ config: OnchainConfig } | undefined>(
  undefined
);

export const devConfig = () => {
  const account = mnemonicToAccount(
    'test test test test test test test test test test test junk'
  );
  const chain = defineChain({
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
      name: 'Hammer',
      symbol: 'HAM',
      decimals: 18,
    },
    /** Collection of RPC endpoints */
    rpcUrls: {
      default: { http: ['http://localhost:8545'] },
    },
    /** Flag for test networks */
    testnet: true,
  });
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
    account,
    chain,
    walletClient,
    publicClient,
  };
};

export const ConfigProvider = ({ children }: PropsWithChildren<{}>) => {
  const publicClient = usePublicClient();
  const walletClientQuery = useWalletClient();
  if (IS_FULL_DEV) {
    const config = devConfig();
    return (
      <ConfigContext.Provider value={{ config }}>
        {children}
      </ConfigContext.Provider>
    );
  }

  const { isDisconnected } = useAccount();
  if (isDisconnected) {
    return <>{children}</>;
  }

  const walletClient = walletClientQuery.data;
  if (walletClientQuery.isLoading || !walletClient) {
    return (
      <Center w="100%" h="100%">
        <Spinner />
      </Center>
    );
  }

  return (
    <ConfigContext.Provider
      value={{
        config: {
          account: walletClient.account,
          walletClient,
          publicClient,
          chain: walletClient.chain,
        },
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export function useOnchain() {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error(
      'There was no config found, did you forget to wrap your component in ConfigProvider?'
    );
  }
  return config;
}

export function useOnchainRaw() {
  return useContext(ConfigContext);
}
