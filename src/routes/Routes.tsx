import { BsCheckSquare, BsInfoCircle, BsSquare } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';

import {
  Button,
  Center,
  Heading,
  HStack,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  VStack,
} from '@chakra-ui/react';

import { useGetRoutes } from '../lib/endpoints';

export function Routes(): JSX.Element {
  const routesQuery = useGetRoutes();
  const navigate = useNavigate();
  const colorMode = useColorMode();
  if (routesQuery.isLoading) {
    return (
      <Center h="100%">
        <Spinner />
      </Center>
    );
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
        <Heading size="lg">Routes</Heading>
        <Link to="/routes/new">
          <Button>+ Add a Route</Button>
        </Link>
      </HStack>
      {routesQuery.data.length > 0 ? (
        <TableContainer w="100%">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Command</Th>
                <Th>Name</Th>
                <Th>URL</Th>
                <Th isNumeric>Subroutes</Th>
                <Th>Reserved</Th>
              </Tr>
            </Thead>
            <Tbody>
              {routesQuery.data.map((route) => (
                <Tr
                  cursor="pointer"
                  onClick={() => {
                    navigate(`/route/${route.id}`);
                  }}
                  transition="background-color 0.2s"
                  _hover={{
                    bg:
                      colorMode.colorMode === 'light' ? 'gray.200' : 'gray.700',
                  }}
                  key={route.command}
                >
                  <Td>{route.command}</Td>
                  <Td>{route.name}</Td>
                  <Td isTruncated>{route.url}</Td>
                  <Td isNumeric>{route.subRoutes.length}</Td>
                  <Td>
                    {route.type === 'reserved' ? (
                      <BsCheckSquare />
                    ) : (
                      <BsSquare />
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <VStack flexGrow={1} justifyContent="center">
          <Heading size="md">You don&apos;t have any routes</Heading>
          <Link to="/routes/new">
            <Button>Create a Route</Button>
          </Link>
        </VStack>
      )}
    </VStack>
  );
}
