import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createRouteDB } from './database';
import { Route } from './types';

const db = createRouteDB();

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
  return useQuery({
    queryKey: ['routes', command],
    queryFn: async () => {
      const route = await db.getRoute(command);
      return route;
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
  return useQuery({
    queryKey: ['routes'],
    queryFn: db.getAllRoutes,
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
  const toast = useToast();
  return useMutation({
    mutationFn: db.addRoute,
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
  const toast = useToast();
  return useMutation({
    mutationFn: () => db.removeRoute(command),
    onSuccess: () => {
      toast({
        title: 'Route Deleted.',
        description: `Route ${command} has been deleted.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      // Invalidate the cache
      queryClient.invalidateQueries({
        queryKey: ['routes'],
      });
      onSuccess?.();
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
  const toast = useToast();
  return useMutation({
    mutationFn: (route: Omit<Route, 'command'>) =>
      db.updateRoute(command, route),
    onSuccess: (route) => {
      toast({
        title: 'Route Updated.',
        description: `Route ${command} has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      // Invalidate the cache
      queryClient.invalidateQueries({
        queryKey: ['routes', command],
      });
      onSuccess?.(route);
    },
    onError,
  });
}
