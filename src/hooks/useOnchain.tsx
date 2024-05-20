import { PropsWithChildren, createContext, useContext } from 'react';
import { OnchainConfig } from '../lib/onchain';
import { usePublicClient, useWalletClient } from 'wagmi';
import { Center, Spinner } from '@chakra-ui/react';

const ConfigContext = createContext<{ config: OnchainConfig } | undefined>(
  undefined
);

export const ConfigProvider = ({ children }: PropsWithChildren<{}>) => {
  const publicClient = usePublicClient();
  const walletClientQuery = useWalletClient();
  const walletClient = walletClientQuery.data;
  if (walletClientQuery.isLoading) {
    return (
      <Center w="100%" h="100%">
        <Spinner />
      </Center>
    );
  } else if (!walletClient) {
    return <>{children}</>;
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
