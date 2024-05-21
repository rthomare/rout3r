import { useToast } from '@chakra-ui/react';
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Route } from './types';
import {
  OnchainConfig,
  addRoute,
  contractAddress,
  deleteRoute,
  deployContract,
  getRoute,
  getRoutes,
  updateRoute,
} from './onchain';
import { useErrorToast } from '../hooks/useErrorToast';
import { useOnchain, useOnchainRaw } from '../hooks/useOnchain';
import { Address } from 'viem';

function queryKeyForRoute(id: bigint, config: OnchainConfig) {
  return ['routes', config.account.address, config.chain.id, id.toString()];
}

function queryKeyForRoutes(config: OnchainConfig) {
  return ['routes', config.account.address, config.chain.id];
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
export function useGetRoute(id: bigint) {
  const { config } = useOnchain();
  const queryClient = useQueryClient();
  const qk = queryKeyForRoute(id, config);
  const isMutating = useIsMutating({ mutationKey: qk }, queryClient);
  const errorToast = useErrorToast("Route couldn't updated");
  return useQuery({
    queryKey: [
      'routes',
      config.account.address,
      config.chain.id,
      id.toString(),
    ],
    queryFn: async () => {
      return getRoute(config, id)
        .then(
          (data) =>
            ({
              id: data.id,
              command: data.route.command,
              name: data.route.name,
              description: '',
              url: data.route.url,
              subRoutes: data.route.subRoutes.map((subRoute) => {
                const [command, url] = subRoute.split('::');
                return { command, url };
              }),
              type: 'manual',
            } as Route)
        )
        .catch((error) => {
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
    queryKey: ['routes', config.account.address, config.chain.id],
    queryFn: () =>
      getRoutes(config, 0n, 100n)
        .then((datas) =>
          datas.map(
            (data) =>
              ({
                id: data.id,
                command: data.route.command,
                url: data.route.url,
                name: data.route.name,
                description: '',
                subRoutes: data.route.subRoutes.map((subRoute) => {
                  const [command, url] = subRoute.split('::');
                  return { command, url };
                }),
                type: 'manual',
              } as Route)
          )
        )
        .catch((error) => {
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
    mutationFn: async (route: Route) =>
      addRoute(config, {
        command: route.command,
        name: route.name,
        url: route.url,
        subRoutes: route.subRoutes.map(
          (subRoute) => `${subRoute.command}:${subRoute.url}`
        ),
        isValue: true,
      })
        .then((v) => {
          return {
            id: v.id,
            command: v.route.command,
            name: v.route.name,
            description: '',
            url: v.route.url,
            subRoutes: v.route.subRoutes.map((subRoute) => {
              const [command, url] = subRoute.split('::');
              return { command, url };
            }),
            type: 'manual',
          } as Route;
        })
        .then(async (v) => {
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
  id: bigint,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const { config } = useOnchain();
  const qk = queryKeyForRoute(id, config);
  const qrk = queryKeyForRoutes(config);
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationKey: qk,
    mutationFn: async () =>
      deleteRoute(config, id).then(async (v) => {
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
        description: `Route (id: ${id}) has been deleted.`,
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
  id: bigint,
  onSuccess?: (route: Route) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  const { config } = useOnchain();
  const qk = queryKeyForRoute(id, config);
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationKey: qk,
    mutationFn: async (route: Route) =>
      updateRoute(config, id, {
        name: route.name,
        command: route.command,
        url: route.url,
        subRoutes: route.subRoutes.map(
          (subRoute) => `${subRoute.command}:${subRoute.url}`
        ),
        isValue: true,
      })
        .then(async (v) => {
          // Invalidate the cache
          await queryClient.invalidateQueries({
            queryKey: qk,
          });
        })
        .then(() => route),
    onSuccess: (route) => {
      toast({
        title: 'Route Updated.',
        description: `Route ${route.command} has been updated.`,
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
  onSuccess?: (address: Address) => void,
  onError?: (error: Error) => void
) {
  const { config } = useOnchain();
  const queryClient = useQueryClient();
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationFn: async () => {
      return deployContract(config).then(async (address) => {
        // Invalidate the cache
        await queryClient.invalidateQueries({
          queryKey: ['router_address', config.chain.id, config.account.address],
        });
        return address;
      });
    },
    onSuccess: (address) => {
      toast({
        title: 'Router Deployed!',
        description: `Route deployed at ${address}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onSuccess?.(address);
    },
    onError: (error) => {
      errorToast(error);
      onError?.(error);
    },
  });
}

export function useGetRouterAddress() {
  const onchain = useOnchainRaw();
  const errorToast = useErrorToast("Couldn't get router address");
  return useQuery({
    queryKey: [
      'router_address',
      onchain?.config.chain.id ?? 'unknown chain',
      onchain?.config.account.address ?? 'unknown account',
    ],
    queryFn: async () => {
      if (!onchain?.config) {
        return '0x';
      }
      return contractAddress(onchain.config).catch((error) => {
        errorToast(error);
        throw error;
      });
    },
    // stale after 24 hours
    staleTime: 1000 * 60 * 60 * 24,
  });
}
