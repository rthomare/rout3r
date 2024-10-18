import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Chain, getContract } from 'viem';
import { useAccount } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PINNED_CONTRACT_ABI } from '../lib/constants';
import { queryKeyForRouterAddress } from '../lib/endpoints';
import { getRouterContract } from '../lib/onchain';
import { OnchainConfig } from '../lib/types';

import { useGlobalLoader } from './useGlobalLoader';
import { useSmartAccountClient } from '@account-kit/react';
import { AlchemySmartAccountClient } from '@account-kit/infra';

const ConfigContext = createContext<{ config: OnchainConfig } | undefined>(
  undefined
);

const ClientContext = createContext<OnchainConfig['client'] | undefined>(
  undefined
);

function useContractQuery(client: AlchemySmartAccountClient) {
  const queryClient = useQueryClient();
  const queryKey = queryKeyForRouterAddress({
    address: client.account?.address ?? '0x0',
    chainId: client.chain?.id ?? 0,
  });
  const query = useQuery({
    queryKey,
    queryFn: async () => getRouterContract(client).then((v) => v ?? null),
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
  const { client, isLoadingClient } = useSmartAccountClient<Chain>({
    type: 'LightAccount',
  });
  const { isDisconnected } = useAccount();
  const showLoader = !isDisconnected && (!client || isLoadingClient);
  const value = useMemo(() => {
    if (!client || isLoadingClient || client.chain === undefined) {
      return undefined;
    }
    return { client };
  }, [client, isLoadingClient]);
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
    <ClientContext.Provider value={value as unknown as OnchainConfig['client']}>
      <ConfigProvider>{children}</ConfigProvider>
    </ClientContext.Provider>
  );
}

function ConfigInnerProvider({
  client,
  children,
}: PropsWithChildren<{
  client: OnchainConfig['client'];
}>) {
  const contractQuery = useContractQuery(client);
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
            client: client,
          })
        : null,
    [contractQuery.data, client]
  );

  const value = useMemo(() => {
    if (!contractQuery || contractQuery.isLoading) {
      return undefined;
    }
    return {
      config: {
        client,
        contract,
      },
    };
  }, [contract, contractQuery, client]);

  if (!value) {
    return children;
  }

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

function ConfigProvider({ children }: PropsWithChildren) {
  const client = useContext(ClientContext);
  if (!client) {
    return children;
  }

  return <ConfigInnerProvider client={client}>{children}</ConfigInnerProvider>;
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
