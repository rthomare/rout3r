import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { getContract } from 'viem';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PINNED_CONTRACT_ABI } from '../lib/constants';
import { queryKeyForRouterAddress } from '../lib/endpoints';
import { getRouterContract } from '../lib/onchain';
import { OnchainConfig } from '../lib/types';

import { useGlobalLoader } from './useGlobalLoader';
import { useChain } from '@account-kit/react';

const ConfigContext = createContext<{ config: OnchainConfig } | undefined>(
  undefined
);

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
  const chain = useChain();
  const { isDisconnected } = useAccount();
  const contractQuery = useContractQuery(publicClient, walletClient);
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
    [contractQuery.data]
  );
  const value = useMemo(() => {
    if (!contractQuery || contractQuery.isLoading) {
      return undefined;
    }
    return {
      config: {
        contract,
      },
    };
  }, [contract, contractQuery]);
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
  useGlobalLoader({
    id: 'deployed-contracts',
    showLoader: !!contractQuery && contractQuery.isLoading,
    helperText: 'finding your account',
  });

  if (isDisconnected || !value) {
    return children;
  }
  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
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
