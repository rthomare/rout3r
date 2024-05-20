import { useMemo } from 'react';
import { useOnchainRaw } from './useOnchain';
import { useGetRouterAddress } from '../lib/endpoints';

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
  const onchain = useOnchainRaw();
  const routerAddress = useGetRouterAddress();
  return useMemo(() => {
    if (!onchain?.config.account.address) {
      // just make sure we're not connected with a wallet
      return {
        isLoading: false,
        isWalletConnected: false,
        isContractDeployed: false,
        cachedBlock: 0,
        error: null,
      };
    }
    if (routerAddress.isLoading) {
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
      isContractDeployed: routerAddress.data !== '0x',
      cachedBlock: 0,
      error: null,
    };
  }, [
    onchain?.config.account.address,
    routerAddress.data,
    routerAddress.isLoading,
    routerAddress.error,
  ]);
}
