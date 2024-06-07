import { useCallback } from 'react';
import { BsTrash } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { RouteForm } from '../components/RouteForm';
import { useDeleteRoute, useGetRoute, useUpdateRoute } from '../lib/endpoints';
import { RouteType } from '../lib/types';
import { LoadingScreen } from '../components/LoadingScreen';

export function EditRoute(): JSX.Element {
  const { command } = useParams();
  if (!command) {
    throw new Error('No command found in route params.');
  }
  const navigate = useNavigate();
  const routeQuery = useGetRoute(command);
  const routeUpdateMutation = useUpdateRoute(command);
  const routeRemoveMutation = useDeleteRoute(command, () => {
    routeQuery.refetch();
    navigate('/routes');
  });
  const { isOpen, onOpen, onClose: onDisclosureClose } = useDisclosure();
  const onClose = useCallback(() => {
    routeRemoveMutation.reset();
    onDisclosureClose();
  }, [routeRemoveMutation, onDisclosureClose]);

  if (routeQuery.isLoading) {
    return <LoadingScreen summary="Loading Route" />;
  }
  if (routeQuery.isError) {
    return (
      <Center h="100%">
        <VStack>
          <Heading size="lg">Error Loading Route</Heading>
          <Text>{routeQuery.error.message}</Text>
        </VStack>
      </Center>
    );
  }
  if (!routeQuery.data) {
    return (
      <Center h="100%">
        <Heading size="lg">Route not Found</Heading>
      </Center>
    );
  }

  return (
    <>
      <HStack marginBottom={3} justifyContent="space-between">
        <Heading size="lg">
          {routeQuery.data.name}
          {routeQuery.data.routeType === RouteType.RESERVED && (
            <Box as="span" color="gray">
              &nbsp;(Reserved Route)
            </Box>
          )}
        </Heading>
        <Button
          colorScheme="red"
          onClick={onOpen}
          isLoading={routeRemoveMutation.isPending}
          leftIcon={<BsTrash />}
          isDisabled={routeQuery.data.routeType === RouteType.RESERVED}
        >
          Delete
        </Button>
      </HStack>

      <RouteForm
        route={routeQuery.data}
        onSubmit={async (route) => {
          routeUpdateMutation.mutateAsync(route);
          routeQuery.refetch();
        }}
        disabledFields={['command']}
        disabled={routeQuery.data.routeType === RouteType.RESERVED}
      />
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Route?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the route {routeQuery.data.name}?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => routeRemoveMutation.mutate()}
              isLoading={routeRemoveMutation.isPending}
              disabled={routeQuery.data.routeType === RouteType.RESERVED}
            >
              Delete
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}