import { PropsWithChildren, createContext, useContext, useEffect } from 'react';
import { getRouterContract } from '../lib/onchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OnchainConfig, PINNED_CONTRACT_ABI } from '../lib/types';
import { queryKeyForRouterAddress } from '../lib/endpoints';
import { useGlobalLoader } from './useGlobalLoader';
import { LoadingScreen } from '../components/LoadingScreen';

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
  }, [isNull, queryKey]);
  return query;
}

export const OnchainProvider = ({ children }: PropsWithChildren<{}>) => {
  const walletClientQuery = useWalletClient();
  const walletClient = walletClientQuery.data;
  const publicClient = usePublicClient();
  const { isDisconnected } = useAccount();
  const showLoader = !walletClient || walletClientQuery.isLoading;
  useGlobalLoader({
    id: 'onchain',
    showLoader,
    helperText: 'Initializing your Wallet Client',
  });

  if (isDisconnected) {
    return <>{children}</>;
  }
  if (!walletClient || walletClientQuery.isLoading) {
    return <LoadingScreen summary="Initializing Onchain Data" />;
  }
  if (!publicClient) {
    throw new Error('No public client found');
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
  useGlobalLoader({
    id: 'deployed-contracts',
    showLoader: !!contractQuery && contractQuery.isLoading,
    helperText: 'Finding your account',
  });
  if (!clients || !contractQuery) {
    return <>{children}</>;
  }
  if (contractQuery.isLoading) {
    return null;
  }
  const contract = contractQuery.data
    ? getContract({
        address: contractQuery.data,
        abi: PINNED_CONTRACT_ABI,
        client: {
          public: clients?.publicClient,
          wallet: clients?.walletClient,
        },
      })
    : null;

  return (
    <ConfigContext.Provider
      value={{
        config: {
          ...clients,
          contract,
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
