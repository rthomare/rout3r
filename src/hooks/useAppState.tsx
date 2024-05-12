import { useEffect } from 'react';
import { useConnectorClient } from 'wagmi';
import { useSetup } from './useSetup';

export type AppState = {
  isLoading: boolean;
  isWalletConnected: boolean;
  isContractDeployed: boolean;
  cachedBlock: number;
  error: Error | null;
};

export function useAppState() {
  const connection = useConnectorClient();
  const { contractExists } = useSetup();
  if (connection.isLoading || contractExists.isLoading) {
    return {
      isLoading: true,
      isWalletConnected: false,
      isContractDeployed: false,
      cachedBlock: 0,
      error: null,
    };
  }
  if (connection.status === 'error' || !connection.data?.account) {
    // just make sure we're not connected with a wallet
    return {
      isLoading: false,
      isWalletConnected: false,
      isContractDeployed: false,
      cachedBlock: 0,
      error: null,
    };
  }
  return {
    isLoading: false,
    isWalletConnected: true,
    isContractDeployed: contractExists.data,
    cachedBlock: 0,
    error: null,
  };
}
