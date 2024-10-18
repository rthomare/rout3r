import { useCallback, useEffect } from 'react';

import { useToast } from '@chakra-ui/react';
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useErrorToast } from '../hooks/useErrorToast';
import { useOnchain } from '../hooks/useOnchain';

import { deployContract, getRoute, getRoutes, searchRoute } from './onchain';
import { AppSettings, OnchainConfig, Route } from './types';
import { useSendUserOperation } from '@account-kit/react';
import { decodeFunctionData, encodeFunctionData } from 'viem';

const STALE_TIME = 1000 * 60 * 60; // 1 hour

export function appSettingsFromConfig(
  config: OnchainConfig
): Omit<AppSettings, 'searchFallback'> {
  if (!config.client.account) {
    throw new Error('No account found for app settings.');
  }
  if (!config.client.chain) {
    throw new Error('No chain found for app settings.');
  }

  return {
    rpc: config.client.chain.rpcUrls.default.http[0],
    address: config.client.account.address,
    chainId: config.client.chain.id,
    contract: config.contract?.address ?? '0x',
  };
}

function queryKeyForRoute(
  command: string,
  appSettings: Omit<AppSettings, 'searchFallback' | 'rpc'>
) {
  return [
    'route',
    appSettings.address,
    appSettings.chainId,
    appSettings.contract,
    command,
  ];
}

function queryKeyForRoutes(
  appSettings: Omit<AppSettings, 'searchFallback' | 'rpc'>
) {
  return [
    'routes',
    appSettings.address,
    appSettings.chainId,
    appSettings.contract,
  ];
}

export function queryKeyForRouterAddress(
  appSettings: Omit<AppSettings, 'searchFallback' | 'rpc' | 'contract'>
) {
  return ['router_address', appSettings.chainId, appSettings.address];
}

/*
 * @function useSearchRoute
 * Query hook to search for a route by command.
 * @param command - The route command.
 * @returns The route or null if not found.
 *
 * @example
 * const routeQuerier = useSearchRoute(config);
 * routeQuerier('g').then((route) => console.log(route));
 */
export function useSearchRoute(
  appSettings: Omit<AppSettings, 'searchFallback'>
) {
  const queryClient = useQueryClient();
  return useCallback(
    async (command: string) => {
      const cacheKey = queryKeyForRoute(command, appSettings);
      const cachedRoute = queryClient.getQueryData(cacheKey) as
        | Route
        | undefined;
      if (cachedRoute) {
        return cachedRoute;
      }
      const fetchedRoute = searchRoute(command, appSettings);
      queryClient.setQueryData(cacheKey, fetchedRoute);
      return fetchedRoute;
    },
    [appSettings, queryClient]
  );
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
  const props = appSettingsFromConfig(config);
  const qk = queryKeyForRoute(command, props);
  const isMutating = useIsMutating({ mutationKey: qk }, queryClient);
  const errorToast = useErrorToast("route couldn't be found");
  const query = useQuery({
    queryKey: qk,
    queryFn: async () => getRoute(config, command),
    // stale after 1 hours (unless invalidated)
    staleTime: STALE_TIME,
    enabled: !isMutating,
  });
  useEffect(() => {
    if (query.fetchStatus !== 'fetching' && query.isError) {
      if (!isMutating) {
        errorToast(query.error);
      }
    }
  }, [query.fetchStatus, query.isError, isMutating, errorToast, query.error]);
  return query;
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
  const props = appSettingsFromConfig(config);
  const qk = queryKeyForRoutes(props);
  const isMutating = useIsMutating({ mutationKey: qk }, queryClient);
  const errorToast = useErrorToast("routes couldn't be found");
  const query = useQuery({
    queryKey: qk,
    queryFn: async () => {
      const routes = await getRoutes(config, '', 100n);
      routes.routes.forEach((route) => {
        queryClient.setQueryData(queryKeyForRoute(route.command, props), route);
      });
      return routes;
    },
    enabled: !isMutating,
    // stale after 1 hours (unless invalidated)
    staleTime: 1000 * 60 * 60,
  });
  useEffect(() => {
    if (query.fetchStatus !== 'fetching' && query.isError && !isMutating) {
      errorToast(query.error);
    }
  }, [query.fetchStatus, query.isError, isMutating, errorToast, query.error]);
  return query;
}

/*
 * @function useCreateRoute
 * Mutation hook to create a route.
 * @param onSuccess - The function to call on success.
 * @param onError - The function to call on error.
 * @returns The mutation.
 *
 * @example
 * const { createRoute, isLoading } = useCreateRoute(
 *   () => console.log('Route created'),
 *   (error) => console.error(error)
 * );
 *
 * createRoute({
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   subRoutes: [],
 * });
 */
export function useCreateRoute(
  onSuccess?: (route: Route) => void,
  onError?: (error: Error) => void
) {
  const { config } = useOnchain();
  const toast = useToast();
  const errorToast = useErrorToast("route couldn't created");
  const { sendUserOperation, isSendingUserOperation: isLoading } =
    useSendUserOperation({
      client: config.client,
      waitForTxn: true,
      onSuccess: ({ request }) => {
        const { args } = decodeFunctionData({
          abi: config.contract!.abi,
          data: request!.callData,
        });
        const route = args![0] as Route;
        toast({
          title: 'route created.',
          description: `route ${route.command} has been created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        onSuccess?.(route);
      },
      onSettled: (_, error) => {
        if (error) {
          errorToast(error);
        }
      },
      onError,
    });

  const createRoute = useCallback(
    (route: Omit<Route, 'id'>) => {
      sendUserOperation({
        uo: {
          target: config.contract!.address,
          data: encodeFunctionData({
            abi: config.contract!.abi,
            functionName: 'addRoute',
            args: [route],
          }),
        },
      });
      return;
    },
    [config]
  );

  return { createRoute, isLoading };
}

/*
 * @function useDeleteRoute
 * Mutation hook to remove a route.
 * @param onSuccess - The function to call on success.
 * @param onError - The function to call on error.
 * @returns The mutation.
 *
 * @example
 * const { deleteRoute, isLoading } = useDeleteRoute(
 *   () => console.log('Route removed'),
 *   (error) => console.error(error)
 * );
 *
 * deleteRoute('g');
 */
export function useDeleteRoute(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const { config } = useOnchain();
  const toast = useToast();
  const errorToast = useErrorToast("route couldn't created");
  const { sendUserOperation, isSendingUserOperation: isLoading } =
    useSendUserOperation({
      client: config.client,
      waitForTxn: true,
      onSuccess: ({ request }) => {
        const { args } = decodeFunctionData({
          abi: config.contract!.abi,
          data: request!.callData,
        });
        const command = args![0] as string;
        toast({
          title: 'route deleted.',
          description: `route (command: ${command}) has been deleted.`,
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        onSuccess?.();
      },
      onSettled: (_, error) => {
        if (error) {
          errorToast(error);
        }
      },
      onError,
    });

  const deleteRoute = useCallback(
    async (command: string) => {
      sendUserOperation({
        uo: {
          target: config.contract!.address,
          data: encodeFunctionData({
            abi: config.contract!.abi,
            functionName: 'deleteRoute',
            args: [command],
          }),
        },
      });
    },
    [config]
  );

  return { deleteRoute, isLoading };
}

/*
 * @function useUpdateRoute
 * Mutation hook to update a route.
 * @param onSuccess - The function to call on success.
 * @param onError - The function to call on error.
 * @returns The mutation.
 *
 * @example
 * const { updateRoute, isLoading } = useUpdateRoute(
 *   () => console.log('Route updated'),
 *   (error) => console.error(error)
 * );
 *
 * updateRoute({
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   subRoutes: [],
 * });
 */
export function useUpdateRoute(
  command: string,
  onSuccess?: (route: Route) => void,
  onError?: (error: Error) => void
) {
  const { config } = useOnchain();
  const toast = useToast();
  const errorToast = useErrorToast("route couldn't created");
  const { sendUserOperation, isSendingUserOperation: isLoading } =
    useSendUserOperation({
      client: config.client,
      waitForTxn: true,
      onSuccess: ({ request }) => {
        const { args } = decodeFunctionData({
          abi: config.contract!.abi,
          data: request!.callData,
        });
        const route = args![0] as Route;
        toast({
          title: 'route Updated.',
          description: `route ${command} has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        onSuccess?.(route);
      },
      onSettled: (_, error) => {
        if (error) {
          errorToast(error);
        }
      },
      onError,
    });

  const createRoute = useCallback(
    (route: Omit<Route, 'command' | 'routeType' | 'isValue'>) => {
      sendUserOperation({
        uo: {
          target: config.contract!.address,
          data: encodeFunctionData({
            abi: config.contract!.abi,
            functionName: 'updateRoute',
            args: [route],
          }),
        },
      });
      return;
    },
    [config]
  );

  return { createRoute, isLoading };
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
// TODO use factory account instead of deploying byte code
export function useDeployRouter(
  onSuccess?: (contract: OnchainConfig['contract']) => void,
  onError?: (error: Error) => void
) {
  const { config } = useOnchain();
  const queryClient = useQueryClient();
  const toast = useToast();
  const errorToast = useErrorToast("couldn't deploy router contract");
  const qk = queryKeyForRouterAddress(appSettingsFromConfig(config));
  return useMutation({
    mutationKey: qk,
    mutationFn: async () =>
      deployContract(config).then(async (contract) => {
        // Invalidate the cache
        await queryClient.invalidateQueries({
          queryKey: qk,
        });
        return contract;
      }),
    onSuccess: (contract) => {
      toast({
        title: 'router Deployed!',
        description: `route deployed at ${contract?.address}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      queryClient.setQueryData(
        [
          'router_address',
          config.client.chain.id,
          config.client.account.address,
        ],
        contract?.address
      );
      onSuccess?.(contract);
    },
    onSettled: (_, error) => {
      if (error) {
        errorToast(error);
      }
    },
    onError,
  });
}
