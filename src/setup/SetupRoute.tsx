import { useCallback } from 'react';

import { Button, Code, Heading, VStack } from '@chakra-ui/react';

import { RouteForm } from '../components/RouteForm';
import { useCreateRoute, useGetRoutes } from '../lib/endpoints';
import { Route } from '../lib/types';

export function SetupRoute({
  selectedRoute,
  generatedRoute,
}: {
  selectedRoute?: Route;
  generatedRoute: (route?: Route) => void;
}) {
  const routeQuery = useGetRoutes();
  const createRouteMutation = useCreateRoute();
  const reset = useCallback(() => {
    generatedRoute(undefined);
  }, [generatedRoute]);
  return selectedRoute ? (
    <VStack alignItems="start">
      <Heading size="md">
        Your route: <Code>{selectedRoute.command}</Code> has been created!
      </Heading>
      <Button onClick={reset}>Redo this step!</Button>
    </VStack>
  ) : (
    <VStack>
      <RouteForm
        route={{}}
        onSubmit={async (routeData) => {
          const route = await createRouteMutation.mutateAsync(routeData);
          generatedRoute(route);
        }}
        cancel={
          routeQuery.data?.routes[0]
            ? {
                text: `Skip and use ${routeQuery.data.routes[0].command}`,
                onClick: () => {
                  generatedRoute(routeQuery.data.routes[0]);
                },
                isLoading: routeQuery.isLoading,
              }
            : undefined
        }
      />
    </VStack>
  );
}
