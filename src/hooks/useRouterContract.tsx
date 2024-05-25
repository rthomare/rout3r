import { useOnchain } from './useOnchain';
import { useDeployRouter } from '../lib/endpoints';

/*
 * Hook to deploy and check for the router contract address
 * @returns a deploy mutation and a query for the contract address
 *
 * @example
 * const { deploy, contract } = useRouterContract();
 */
export function useRouterContract() {
  const { config } = useOnchain();
  const deploy = useDeployRouter();
  const isDeployed = !!config.contract;
  return { isDeployed, deploy, contract: config.contract };
}
