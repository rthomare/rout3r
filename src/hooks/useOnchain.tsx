import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Chain, getContract } from 'viem';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PINNED_CONTRACT_ABI } from '../lib/constants';
import { queryKeyForRouterAddress, useDeployRouter } from '../lib/endpoints';
import { getRouterContract } from '../lib/onchain';
import { OnchainConfig } from '../lib/types';

import { useGlobalLoader } from './useGlobalLoader';
import { useSignerStatus, useSmartAccountClient } from '@account-kit/react';

const ConfigContext = createContext<{ config: OnchainConfig } | undefined>(
  undefined
);

const ClientContext = createContext<OnchainConfig['client'] | undefined>(
  undefined
);

function useContractQuery(client: OnchainConfig['client']) {
  const queryClient = useQueryClient();
  const queryKey = queryKeyForRouterAddress();
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

enum OnboardState {
  FETCHING,
  FAILED_FETCH,
  DEPLOYING,
  DEPLOYED,
  FAILED_DEPLOY,
}

function useGetOrDeployRouter(client: OnchainConfig['client']) {
  const contractQuery = useContractQuery(client);
  const deploy = useDeployRouter(client);

  useEffect(() => {
    if (
      contractQuery.isFetched &&
      contractQuery.data === null &&
      deploy.isIdle
    ) {
      deploy.mutateAsync(undefined);
    }
  }, [contractQuery, deploy]);

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

  if (contractQuery.isLoading) {
    return { state: OnboardState.FETCHING, contract: null, error: null };
  }

  if (contractQuery.isError) {
    return {
      state: OnboardState.FAILED_FETCH,
      contract: null,
      error: contractQuery.error,
    };
  }

  if (contractQuery.isFetched && contract) {
    return {
      state: OnboardState.DEPLOYED,
      contract: contract,
      error: null,
    };
  }

  if (deploy.isPending) {
    return { state: OnboardState.DEPLOYING, contract: null, error: null };
  }

  if (deploy.isError) {
    return {
      state: OnboardState.FAILED_DEPLOY,
      contract: null,
      error: deploy.error,
    };
  }

  if (deploy.isSuccess) {
    return { state: OnboardState.DEPLOYED, contract: deploy.data, error: null };
  }

  return { state: OnboardState.FAILED_FETCH, contract: null, error: null };
}

export function OnchainProvider({ children }: PropsWithChildren) {
  const { isConnected } = useSignerStatus();
  const { client, isLoadingClient } = useSmartAccountClient<Chain>({
    type: 'LightAccount',
  });
  const showLoader = isConnected && (!client || isLoadingClient);
  const value = useMemo(() => {
    if (!client || isLoadingClient || client.chain === undefined) {
      return undefined;
    }
    return client;
  }, [client, isLoadingClient]);
  useGlobalLoader({
    id: 'onchain-client',
    showLoader,
    helperText: 'initializing your wallet client',
  });
  useGlobalLoader({
    id: 'onchain-data',
    showLoader: !value && isConnected,
    helperText: 'initializing onchain data',
  });

  if (!isConnected || !value) {
    return children;
  }
  return (
    <ClientContext.Provider value={value as OnchainConfig['client']}>
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
  // const onboard = useGetOrDeployRouter(client);
  // useGlobalLoader({
  //   id: 'fetching-contracts',
  //   showLoader: onboard.state === OnboardState.FETCHING,
  //   helperText: 'finding your account',
  // });
  // useGlobalLoader({
  //   id: 'deploying-contracts',
  //   showLoader: onboard.state === OnboardState.DEPLOYING,
  //   helperText: 'deploying your router contract',
  // });

  // const value = useMemo(() => {
  //   if (!onboard.contract) {
  //     return undefined;
  //   }
  //   return {
  //     config: {
  //       client,
  //       contract: onboard.contract,
  //     },
  //   };
  // }, [onboard.contract, client]);

  // if (!value) {
  //   return children;
  // }

  // return (
  //   <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  // );
  return children;
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
