import { contractAddress, deployContract } from '../lib/onchain';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useOnchain } from './useOnchain';
import { useDeployRouter, useGetRouterAddress } from '../lib/endpoints';

/*
 * Hook to deploy and check for the router contract address
 * @returns a deploy mutation and a query for the contract address
 *
 * @example
 * const { deploy, address } = useRouterContract();
 */
export function useRouterContract() {
  const { config } = useOnchain();
  const deploy = useDeployRouter();
  const address = useGetRouterAddress();

  const isDeployed = !!address.data && address.data !== '0x';

  return { isDeployed, deploy, address };
}
