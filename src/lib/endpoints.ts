import { useToast } from '@chakra-ui/react';
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { OnchainConfig, Route } from './types';
import {
  addRoute,
  deleteRoute,
  deployContract,
  getRoute,
  getRoutes,
  updateRoute,
} from './onchain';
import { useErrorToast } from '../hooks/useErrorToast';
import { useOnchain } from '../hooks/useOnchain';
import { Address } from 'viem';

function queryKeyForRoute(command: string, config: OnchainConfig) {
  return [
    'routes',
    config.walletClient.account.address,
    config.walletClient.chain.id,
    command,
  ];
}

function queryKeyForRoutes(config: OnchainConfig) {
  return [
    'routes',
    config.walletClient.account.address,
    config.walletClient.chain.id,
  ];
}

/*
 * @function useGetRoute
 * Query hook to retreive a route by command.
 * @param command - The route command.
 * @returns The route.
 *
 * @example
 * const routeQuery = useGetRoute('g');
 * console.log(routeQuery.data);
 */
export function useGetRoute(command: string) {
  const { config } = useOnchain();
  const queryClient = useQueryClient();
  const qk = queryKeyForRoute(command, config);
  const isMutating = useIsMutating({ mutationKey: qk }, queryClient);
  const errorToast = useErrorToast("Route couldn't updated");
  return useQuery({
    queryKey: [
      'routes',
      config.walletClient.account.address,
      config.walletClient.chain.id,
      command,
    ],
    queryFn: async () => {
      return getRoute(config, command).catch((error) => {
        !isMutating && errorToast(error);
        throw error;
      });
    },
    // stale after 1 hours (unless invalidated)
    staleTime: 1000 * 60 * 60,
    enabled: !isMutating,
  });
}

/*
 * @function useGetRoutes
 * Query hook to retreive all routes for the user.
 * @returns The routes.
 *
 * @example
 * const routesQuery = useGetRoutes();
 * console.log(routesQuery.data);
 */
export function useGetRoutes() {
  const { config } = useOnchain();
  const queryClient = useQueryClient();
  const qk = queryKeyForRoutes(config);
  const isMutating = useIsMutating({ mutationKey: qk }, queryClient);
  const errorToast = useErrorToast("Route couldn't updated");
  return useQuery({
    queryKey: [
      'routes',
      config.walletClient.account.address,
      config.walletClient.chain.id,
    ],
    queryFn: () =>
      getRoutes(config, '', 100n).catch((error) => {
        !isMutating && errorToast(error);
        throw error;
      }),
    enabled: !isMutating,
    // stale after 1 hours (unless invalidated)
    staleTime: 1000 * 60 * 60,
  });
}

/*
 * @function useCreateRoute
 * Mutation hook to create a route.
 * @param onSuccess - The function to call on success.
 * @param onError - The function to call on error.
 * @returns The mutation.
 *
 * @example
 * const { mutate, mutateAsync } = useCreateRoute(
 *   () => console.log('Route created'),
 *   (error) => console.error(error)
 * );
 *
 * mutate({
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   subRoutes: [],
 * });
 *
 * const route = await mutateAsync({
 *  command: 'b',
 *   name: 'Bing',
 *   description: 'Searches Bing',
 *   url: 'https://www.bing.com/search?q=%@@@',
 *   subRoutes: [{
 *     command: 'i',
 *     url: 'https://www.bing.com/images/search?q=%@@@',
 *   }],
 * });
 */
export function useCreateRoute(
  onSuccess?: (route: Route) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const { config } = useOnchain();
  const toast = useToast();
  const qk = queryKeyForRoutes(config);
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationKey: qk,
    mutationFn: async (route: Omit<Route, 'id'>) =>
      addRoute(config, route).then(async (v) => {
        // Invalidate the cache
        await queryClient.invalidateQueries({
          queryKey: qk,
        });
        return v;
      }),
    onSuccess: (route) => {
      toast({
        title: 'Route created.',
        description: `Route ${route.command} has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onSuccess?.(route);
    },
    onError: (error) => {
      errorToast(error);
      onError?.(error);
    },
  });
}

/*
 * @function useDeleteRoute
 * Mutation hook to remove a route.
 * @param onSuccess - The function to call on success.
 * @param onError - The function to call on error.
 * @returns The mutation.
 *
 * @example
 * const { mutate, mutateAsync } = useDeleteRoute(
 *   () => console.log('Route removed'),
 *   (error) => console.error(error)
 * );
 *
 * mutate('g');
 *
 * await mutateAsync('b');
 */
export function useDeleteRoute(
  command: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const { config } = useOnchain();
  const qk = queryKeyForRoute(command, config);
  const qrk = queryKeyForRoutes(config);
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationKey: qk,
    mutationFn: async () =>
      deleteRoute(config, command).then(async (v) => {
        // Invalidate the cache
        await queryClient.invalidateQueries({
          queryKey: qk,
        });
        await queryClient.invalidateQueries({
          queryKey: qrk,
        });
      }),
    onSuccess: () => {
      toast({
        title: 'Route Deleted.',
        description: `Route (command: ${command}) has been deleted.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onSuccess?.();
    },
    onError: (error) => {
      errorToast(error);
      onError?.(error);
    },
  });
}

/*
 * @function useUpdateRoute
 * Mutation hook to update a route.
 * @param onSuccess - The function to call on success.
 * @param onError - The function to call on error.
 * @returns The mutation.
 *
 * @example
 * const { mutate, mutateAsync } = useUpdateRoute(
 *   () => console.log('Route updated'),
 *   (error) => console.error(error)
 * );
 *
 * mutate({
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   subRoutes: [],
 * });
 *
 * await mutateAsync({
 *   command: 'b',
 *   name: 'Bing',
 *   description: 'Searches Bing',
 *   url: 'https://www.bing.com/search?q=%@@@',
 *   subRoutes: [{
 *     command: 'i',
 *     url: 'https://www.bing.com/images/search?q=%@@@',
 *   }],
 * });
 */
export function useUpdateRoute(
  command: string,
  onSuccess?: (route: Route) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const { config } = useOnchain();
  const qk = queryKeyForRoute(command, config);
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationKey: qk,
    mutationFn: async (
      updateData: Omit<Route, 'command' | 'routeType' | 'isValue'>
    ) =>
      updateRoute(config, command, updateData).then(async (v) => {
        // Invalidate the cache
        await queryClient.invalidateQueries({
          queryKey: qk,
        });
        return v;
      }),
    onSuccess: (route) => {
      toast({
        title: 'Route Updated.',
        description: `Route ${command} has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onSuccess?.(route);
    },
    onError: (error) => {
      errorToast(error);
      onError?.(error);
    },
  });
}

/*
 * @function useDeployRouter
 * Mutation hook to deploy the router contract.
 * @param onSuccess - The function to call on success.
 * @param onError - The function to call on error.
 * @returns The mutation.
 *
 * @example
 * const { mutate, mutateAsync } = useDeployRouter(
 *   () => console.log('Router deployed'),
 *   (error) => console.error(error)
 * );
 *
 * mutate();
 *
 * await mutateAsync();
 */
export function useDeployRouter(
  onSuccess?: (contract: OnchainConfig['contract']) => void,
  onError?: (error: Error) => void
) {
  const { config } = useOnchain();
  const queryClient = useQueryClient();
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationFn: async () => {
      return deployContract(config).then(async (contract) => {
        // Invalidate the cache
        await queryClient.invalidateQueries({
          queryKey: [
            'router_address',
            config.walletClient.chain.id,
            config.walletClient.account.address,
          ],
        });
        return contract;
      });
    },
    onSuccess: (contract) => {
      toast({
        title: 'Router Deployed!',
        description: `Route deployed at ${contract?.address}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      queryClient.setQueryData(
        [
          'router_address',
          config.walletClient.chain.id,
          config.walletClient.account.address,
        ],
        contract
      );
      onSuccess?.(contract);
    },
    onError: (error) => {
      errorToast(error);
      onError?.(error);
    },
  });
}
