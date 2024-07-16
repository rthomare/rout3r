import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import {
  Chain,
  getContract,
  HttpTransport,
  PublicClient,
  zeroAddress,
} from 'viem';

import {
  useBundlerClient,
  useChain,
  useSignerStatus,
  useSmartAccountClient,
} from '@account-kit/react';
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
  const { chain } = useChain();
  const queryKey = queryKeyForRouterAddress({
    address: walletClient?.account.address || zeroAddress,
    chainId: chain.id,
  });

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!walletClient) return null;

      return getRouterContract(publicClient, walletClient).then(
        (v) => v ?? null
      );
    },
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
  const { client } = useSmartAccountClient({
    type: 'LightAccount',
    // TODO: wtf is the bug that's not using this from config??
    gasManagerConfig: {
      policyId: import.meta.env.VITE_POLICY_ID!,
    },
  });
  const bundlerClient = useBundlerClient();
  const { isAuthenticating, isInitializing, isDisconnected } =
    useSignerStatus();

  const showLoader = isAuthenticating || isInitializing;
  const value = useMemo(
    () =>
      client ? { publicClient: bundlerClient, walletClient: client } : null,
    [bundlerClient, client]
  );

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
            client: publicClient as PublicClient<HttpTransport, Chain>,
          })
        : null,
    [contractQuery.data, publicClient]
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
