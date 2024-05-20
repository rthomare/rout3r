import { contractAddress, deployContract } from '../lib/onchain';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePublicClient, useWalletClient } from 'wagmi';

/*
 * Hook to deploy and check for the router contract address
 * @returns a deploy mutation and a query for the contract address
 *
 * @example
 * const { deploy, address } = useRouterContract();
 */
export function useRouterContract() {
  const walletClientQuery = useWalletClient();
  const publicClient = usePublicClient();

  const deploy = useMutation({
    mutationFn: async () => {
      if (walletClientQuery.isLoading || !walletClientQuery.data) {
        return undefined;
      }
      const config = {
        account: walletClientQuery.data?.account,
        walletClient: walletClientQuery.data,
        publicClient,
        chain: walletClientQuery.data?.chain,
      };
      return deployContract(config);
    },
  });

  const address = useQuery({
    queryKey: [
      'router_address',
      walletClientQuery.data?.account?.address ?? '',
    ],
    queryFn: async () => {
      if (walletClientQuery.isLoading || !walletClientQuery.data) {
        return null;
      }
      const config = {
        account: walletClientQuery.data?.account,
        walletClient: walletClientQuery.data,
        publicClient,
        chain: walletClientQuery.data?.chain,
      };
      return contractAddress({
        account: config.account,
        walletClient: config.walletClient,
        publicClient: config.publicClient,
        chain: config.chain,
      });
    },
  });

  return { deploy, address };
}
