import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { getContract } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { PINNED_CONTRACT_ABI } from '../lib/constants';
import { queryKeyForRouterAddress } from '../lib/endpoints';
import { getRouterContract } from '../lib/onchain';
import { OnchainConfig } from '../lib/types';

import { useGlobalLoader } from './useGlobalLoader';

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
  publicClient: OnchainConfig['publicClient'],
  walletClient: OnchainConfig['walletClient']
) {
  const queryClient = useQueryClient();
  const queryKey = queryKeyForRouterAddress({
    address: walletClient.account.address,
    chainId: walletClient.chain.id,
  });
  const query = useQuery({
    queryKey,
    queryFn: async () =>
      getRouterContract(publicClient, walletClient).then((v) => v ?? null),
  });
  const isNull = query.isFetched && query.data === null;
  useEffect(() => {
    if (isNull) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [isNull, queryKey, queryClient]);
  return query;
}

export function OnchainProvider({ children }: PropsWithChildren) {
  const walletClientQuery = useWalletClient();
  const walletClient = walletClientQuery.data;
  const publicClient = usePublicClient();
  const { isDisconnected } = useAccount();
  const showLoader =
    !isDisconnected && (!walletClient || walletClientQuery.isLoading);
  const value = useMemo(() => {
    if (!walletClient || walletClientQuery.isLoading || !publicClient) {
      return undefined;
    }
    return { walletClient, publicClient };
  }, [walletClient, publicClient, walletClientQuery.isLoading]);
  useGlobalLoader({
    id: 'onchain-client',
    showLoader,
    helperText: 'initializing your wallet client',
  });
  useGlobalLoader({
    id: 'onchain-data',
    showLoader: !value && !isDisconnected,
    helperText: 'initializing onchain data',
  });

  if (isDisconnected || !value) {
    return children;
  }
  return (
    <ClientContext.Provider value={value}>
      <ConfigProvider>{children}</ConfigProvider>
    </ClientContext.Provider>
  );
}

function ConfigInnerProvider({
  walletClient,
  publicClient,
  children,
}: PropsWithChildren<{
  publicClient: OnchainConfig['publicClient'];
  walletClient: OnchainConfig['walletClient'];
}>) {
  const contractQuery = useContractQuery(publicClient, walletClient);
  useGlobalLoader({
    id: 'deployed-contracts',
    showLoader: !!contractQuery && contractQuery.isLoading,
    helperText: 'finding your account',
  });
  const contract = useMemo(
    () =>
      contractQuery.data
        ? getContract({
            address: contractQuery.data,
            abi: PINNED_CONTRACT_ABI,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          })
        : null,
    [contractQuery.data, publicClient, walletClient]
  );

  const value = useMemo(() => {
    if (!contractQuery || contractQuery.isLoading) {
      return undefined;
    }
    return {
      config: {
        publicClient,
        walletClient,
        contract,
      },
    };
  }, [contract, contractQuery, publicClient, walletClient]);

  if (!value) {
    return children;
  }

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

function ConfigProvider({ children }: PropsWithChildren) {
  const clients = useContext(ClientContext);
  if (!clients) {
    return children;
  }

  return (
    <ConfigInnerProvider
      publicClient={clients.publicClient}
      walletClient={clients.walletClient}
    >
      {children}
    </ConfigInnerProvider>
  );
}

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
