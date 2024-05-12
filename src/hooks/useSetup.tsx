import { usePublicClient, useWalletClient } from 'wagmi';
import {
  contractExists as _contractExists,
  deployContract,
} from '../lib/onchain';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useSetup() {
  const walletClientQuery = useWalletClient();
  const publicClientQuery = usePublicClient();
  const deploy = useMutation({
    onMutate: async () => {
      const client = walletClientQuery.data;
      if (!client) {
        throw new Error('Client not loaded');
      }
      return deployContract(client);
    },
  });

  const contractExists = useQuery({
    queryKey: ['contractExists'],
    queryFn: async () => {
      const pclient = publicClientQuery;
      const wclient = walletClientQuery.data;
      if (!pclient || !wclient) {
        throw new Error('Client not loaded');
      }
      return _contractExists(wclient.account.address, pclient);
    },
  });

  return { deploy, contractExists };
}
