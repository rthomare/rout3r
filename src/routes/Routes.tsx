import { Link } from 'react-router-dom';

import {
  Button,
  Center,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

import { PageHeader } from '../components/PageHeader';
import { useGlobalLoader } from '../hooks/useGlobalLoader';
import { useGetRoutes } from '../lib/endpoints';
import { RouteCard } from './RouteCard';

export function Routes(): JSX.Element {
  const routesQuery = useGetRoutes();
  useGlobalLoader({
    id: 'get-routes',
    showLoader: routesQuery.isLoading,
    helperText: 'getting your routes',
  });

  if (routesQuery.isLoading) {
    return <Spinner size="xl" />;
  }
  if (routesQuery.isError) {
    return (
      <Center h="100%">
        <VStack>
          <Heading>Error Loading Routes</Heading>
          <Text>{routesQuery.error.message}</Text>
        </VStack>
      </Center>
    );
  }

  if (!routesQuery.data) {
    return (
      <Center h="100%">
        <Heading>No Routes Found</Heading>
      </Center>
    );
  }

  return (
    <VStack h="100%">
      <HStack w="100%" justifyContent="space-between">
        <PageHeader mb="0">routes</PageHeader>
        {routesQuery.data.routes.length > 0 && (
          <Link to="/routes/new">
            <Button>new route</Button>
          </Link>
        )}
      </HStack>
      {routesQuery.data.routes.length > 0 ? (
        <Wrap width="100%" spacing="40px">
          {routesQuery.data.routes.map((route) => {
            return (
              <WrapItem>
                <RouteCard key={route.command} route={route} />
              </WrapItem>
            );
          })}
        </Wrap>
      ) : (
        <VStack flexGrow={1} justifyContent="center">
          <Heading size="md">you don&apos;t have any routes</Heading>
          <Link to="/routes/new">
            <Button>create a route</Button>
          </Link>
        </VStack>
      )}
    </VStack>
  );
}
