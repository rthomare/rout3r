import { Button, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { useRouterContract } from '../hooks/useRouterContract';
import { useErrorToast } from '../hooks/useErrorToast';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';

export function DeployContract(): JSX.Element {
  const { chain } = useAccount();
  const { address, deploy } = useRouterContract();
  const deployErrorToast = useErrorToast('Failed to deploy contract');
  return (
    <Flex>
      {address.isLoading && <Spinner />}
      {!address.isLoading && address.data && (
        <VStack alignItems="flex-start">
          <Link
            to={`${chain?.blockExplorers.default.url}/search?q=${address.data}`}
            target="_blank"
          >
            <Text textDecoration="underline">
              Router contract already deployed at {address.data}
            </Text>
          </Link>
        </VStack>
      )}
      {!address.isLoading && !address.data && (
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
