import { PropsWithChildren, createContext, useContext } from 'react';
import { getRouterContract } from '../lib/onchain';
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
import { useQuery } from '@tanstack/react-query';
import { OnchainConfig } from '../lib/types';

const ConfigContext = createContext<{ config: OnchainConfig } | undefined>(
  undefined
);

const ClientContext = createContext<
  | {
      walletClient: OnchainConfig['walletClient'];
      publicClient: OnchainConfig['publicClient'];
    }
  | undefined
>(undefined);

function useContractQuery(
  publicClient?: OnchainConfig['publicClient'],
  walletClient?: OnchainConfig['walletClient']
) {
  if (!publicClient || !walletClient) {
    return undefined;
  }
  return useQuery({
    queryKey: [
      'router_address',
      walletClient.chain.id,
      walletClient.account.address,
    ],
    queryFn: async () =>
      getRouterContract(publicClient, walletClient).then((v) => v ?? null),
    staleTime: Infinity,
  });
}

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
    walletClient,
    publicClient,
  };
};

// TODO: Add a better loading state ui component
const Loading = () => {
  return (
    <Center w="100%" h="100%">
      <Spinner />
    </Center>
  );
};

export const OnchainProvider = ({ children }: PropsWithChildren<{}>) => {
  const dc = devConfig();
  const walletClientQuery = useWalletClient();
  const walletClient = IS_FULL_DEV ? dc.walletClient : walletClientQuery.data;
  const publicClient = IS_FULL_DEV ? dc.publicClient : usePublicClient();
  const { isDisconnected } = useAccount();
  if (isDisconnected && !IS_FULL_DEV) {
    return <>{children}</>;
  }
  if (!walletClient || walletClientQuery.isLoading) {
    return <Loading />;
  }
  return (
    <ClientContext.Provider value={{ walletClient, publicClient }}>
      <ConfigProvider>{children}</ConfigProvider>
    </ClientContext.Provider>
  );
};

const ConfigProvider = ({ children }: PropsWithChildren<{}>) => {
  const clients = useContext(ClientContext);
  const contractQuery = useContractQuery(
    clients?.publicClient,
    clients?.walletClient
  );
  if (!clients || !contractQuery) {
    return <>{children}</>;
  }
  if (contractQuery.isLoading) {
    return <Loading />;
  }
  return (
    <ConfigContext.Provider
      value={{
        config: {
          walletClient: clients.walletClient,
          publicClient: clients.publicClient,
          contract: contractQuery.data ?? null,
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
