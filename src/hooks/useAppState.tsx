import { useMemo } from 'react';
import { useOnchainRaw } from './useOnchain';
import { useAccount } from 'wagmi';

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
  const { isConnected } = useAccount();
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
    if (!onchain) {
      // make sure we have the onchain data
      return {
        isLoading: true,
        isWalletConnected: true,
        isContractDeployed: false,
        cachedBlock: 0,
        error: null,
      };
    }
    return {
      isLoading: false,
      isWalletConnected: true,
      isContractDeployed: !!onchain.config.contract,
      cachedBlock: 0,
      error: null,
    };
  }, [onchain, isConnected]);
}
