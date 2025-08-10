import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { Chain, getContract } from 'viem';
import { CONTARCT_ABI, CONTARCT_ADDRESS } from '../lib/constants';
import { OnchainConfig } from '../lib/types';
import { useGlobalLoader } from './useGlobalLoader';
import { useSignerStatus, useSmartAccountClient } from '@account-kit/react';

const ConfigContext = createContext<{ config: OnchainConfig } | undefined>(
  undefined
);

const ClientContext = createContext<OnchainConfig['client'] | undefined>(
  undefined
);

export function OnchainProvider({ children }: PropsWithChildren) {
  const { isConnected } = useSignerStatus();
  if (!isConnected) {
    throw new Error('OnchainProvider must be used within a connected wallet');
  }
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
  const contract = getContract({
    address: CONTARCT_ADDRESS,
    abi: CONTARCT_ABI,
    publicClient: client,
  });

  return (
    <ConfigContext.Provider
      value={{
        config: {
          client,
          contract,
        },
      }}
    >
      {children}
    </ConfigContext.Provider>
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
