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

import {
  addRoute,
  deleteRoute,
  deployContract,
  getRoute,
  getRoutes,
  searchRoute,
  updateRoute,
} from './onchain';
import { AppSettings, OnchainConfig, Route } from './types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour

export function appSettingsFromConfig(
  config: OnchainConfig
): Omit<AppSettings, 'searchFallback'> {
  return {
    rpc: config.walletClient.chain.rpcUrls.default.http[0],
    address: config.walletClient.account.address,
    chainId: config.walletClient.chain.id,
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
  const errorToast = useErrorToast("Route couldn't be found");
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
  const errorToast = useErrorToast("Routes couldn't be found");
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
  const props = appSettingsFromConfig(config);
  const qrk = queryKeyForRoutes(props);
  const errorToast = useErrorToast("Route couldn't created");
  return useMutation({
    mutationKey: qrk,
    mutationFn: async (route: Omit<Route, 'id'>) =>
      addRoute(config, route).then(async (v) => {
        // Update the cache
        const qk = queryKeyForRoute(route.command, props);
        await queryClient.setQueryData(qk, v);
        await queryClient.invalidateQueries({
          queryKey: qrk,
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
    onSettled: (_, error) => {
      if (error) {
        errorToast(error);
      }
    },
    onError,
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
  const props = appSettingsFromConfig(config);
  const qrk = queryKeyForRoutes(props);
  const qk = queryKeyForRoute(command, props);
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't deleted");
  return useMutation({
    mutationKey: qk,
    mutationFn: async () =>
      deleteRoute(config, command).then(async () => {
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
    onSettled: (_, error) => {
      if (error) {
        errorToast(error);
      }
    },
    onError,
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
  const props = appSettingsFromConfig(config);
  const qk = queryKeyForRoute(command, props);
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationKey: qk,
    mutationFn: async (
      updateData: Omit<Route, 'command' | 'routeType' | 'isValue'>
    ) =>
      updateRoute(config, command, updateData).then(async (v) => {
        // Update the cache
        await queryClient.setQueryData(qk, v);
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
    onSettled: (_, error) => {
      if (error) {
        errorToast(error);
      }
    },
    onError,
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
  const errorToast = useErrorToast("Couldn't deploy router contract");
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
