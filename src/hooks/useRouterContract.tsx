import { usePublicClient, useWalletClient } from 'wagmi';
import { contractAddress, deployContract } from '../lib/onchain';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useRouterContract() {
  const walletClientQuery = useWalletClient();
  const publicClientQuery = usePublicClient();
  const accountAddress = walletClientQuery.data?.account.address;
  const deploy = useMutation({
    mutationFn: async () => {
      const client = walletClientQuery.data;
      if (!client) {
        throw new Error('Client not loaded');
      }
      return deployContract(client);
    },
  });

  const address = useQuery({
    queryKey: ['address', accountAddress],
    queryFn: async () => {
      const pclient = publicClientQuery;
      if (!pclient || !accountAddress) {
        throw new Error('Client not loaded');
      }
      return contractAddress(accountAddress, pclient);
    },
  });

  return { deploy, address };
}
