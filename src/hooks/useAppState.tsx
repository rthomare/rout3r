import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useRouterContract } from './useRouterContract';

/*
 * The type depicting Application State
 * isLoading: boolean - whether the app is loading
 * isWalletConnected: boolean - whether the wallet is connected
 * isContractDeployed: boolean - whether the contract is deployed
 * cachedBlock: number - the block number
 */
export type AppState = {
  isLoading: boolean;
  isWalletConnected: boolean;
  isContractDeployed: boolean;
  cachedBlock: number;
  error: Error | null;
};

/*
 * Hook to get the application state
 * @returns the application state
 */
export function useAppState() {
  const { isConnected } = useAccount();
  const { address } = useRouterContract();
  return useMemo(() => {
    if (!isConnected) {
      // just make sure we're not connected with a wallet
      return {
        isLoading: false,
        isWalletConnected: false,
        isContractDeployed: false,
        cachedBlock: 0,
        error: null,
      };
    }
    if (address.isLoading) {
      return {
        isLoading: true,
        isWalletConnected: false,
        isContractDeployed: false,
        cachedBlock: 0,
        error: null,
      };
    }
    return {
      isLoading: false,
      isWalletConnected: true,
      isContractDeployed: address.data,
      cachedBlock: 0,
      error: null,
    };
  }, [isConnected, address.data, address.isLoading, address.error]);
}
