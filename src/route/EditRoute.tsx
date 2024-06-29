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
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { PageHeader } from '../components/PageHeader';
import { RouteForm } from '../components/RouteForm';
import { useGlobalLoader } from '../hooks/useGlobalLoader';
import { useDeleteRoute, useGetRoute, useUpdateRoute } from '../lib/endpoints';
import { RouteType } from '../lib/types';

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
  useGlobalLoader({
    id: 'edit-route',
    showLoader: routeQuery.isLoading,
    helperText: `Getting route ${command}`,
  });

  if (routeQuery.isLoading) {
    return <Spinner size="xl" />;
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
        <PageHeader>
          {routeQuery.data.name}
          {routeQuery.data.routeType === RouteType.RESERVED && (
            <Box as="span" color="gray">
              &nbsp;(reserved route)
            </Box>
          )}
        </PageHeader>
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
