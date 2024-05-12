import {
  Button,
  Flex,
  Spinner,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useRouterContract } from '../hooks/useRouterContract';
import { useErrorToast } from '../hooks/useErrorToast';

export function DeployContract(): JSX.Element {
  const { contractExists, deploy } = useRouterContract();
  const deployErrorToast = useErrorToast('Failed to deploy contract');
  return (
    <Flex>
      {contractExists.isLoading && <Spinner />}
      {!contractExists.isLoading && contractExists.data && (
        <VStack alignItems="flex-start">
          <Text>Router contract already deployed</Text>
        </VStack>
      )}
      {!contractExists.isLoading && !contractExists.data && (
        <VStack alignItems="flex-start">
          <Text>Router contract not deployed</Text>
          <Button
            onClick={() =>
              deploy.mutate(void 0, {
                onError: deployErrorToast,
              })
            }
            isLoading={deploy.isPending}
          >
            Deploy Router
          </Button>
        </VStack>
      )}
    </Flex>
  );
}
