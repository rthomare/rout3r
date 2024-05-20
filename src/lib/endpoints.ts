import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Route } from './types';
import {
  addRoute,
  deleteRoute,
  getRoute,
  getRoutes,
  updateRoute,
} from './onchain';
import { useErrorToast } from '../hooks/useErrorToast';
import { useOnchain } from '../hooks/useOnchain';

// TODO: Solve cache staleness for routes (repro? try update route on UI)

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
  const errorToast = useErrorToast("Route couldn't updated");
  return useQuery({
    queryKey: ['routes', id.toString()],
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
          errorToast(error);
          throw error;
        });
    },
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
  const errorToast = useErrorToast("Route couldn't updated");
  return useQuery({
    queryKey: ['routes'],
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
          errorToast(error);
          throw error;
        }),
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
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationFn: async (route: Route) =>
      addRoute(config, {
        command: route.command,
        name: route.name,
        url: route.url,
        subRoutes: route.subRoutes.map(
          (subRoute) => `${subRoute.command}:${subRoute.url}`
        ),
        isValue: true,
      }).then((v) => {
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
      // Invalidate the cache
      queryClient.invalidateQueries({
        queryKey: ['routes'],
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
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationFn: async () => deleteRoute(config, id),
    onSuccess: () => {
      toast({
        title: 'Route Deleted.',
        description: `Route (id: ${id}) has been deleted.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      // Invalidate the cache
      queryClient.invalidateQueries({
        queryKey: ['routes'],
      });
      queryClient.invalidateQueries({
        queryKey: ['routes', id],
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
  const toast = useToast();
  const errorToast = useErrorToast("Route couldn't updated");
  return useMutation({
    mutationFn: async (route: Route) =>
      updateRoute(config, id, {
        name: route.name,
        command: route.command,
        url: route.url,
        subRoutes: route.subRoutes.map(
          (subRoute) => `${subRoute.command}:${subRoute.url}`
        ),
        isValue: true,
      }).then(() => route),
    onSuccess: (route) => {
      toast({
        title: 'Route Updated.',
        description: `Route ${route.command} has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      // Invalidate the cache
      queryClient.invalidateQueries({
        queryKey: ['routes', id.toString()],
      });
      onSuccess?.(route);
    },
    onError: (error) => {
      errorToast(error);
      onError?.(error);
    },
  });
}
