import { Button, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { useRouterContract } from '../hooks/useRouterContract';
import { useAccount } from 'wagmi';
import { Link, useNavigate } from 'react-router-dom';

export function DeployContract({
  onComplete,
}: {
  onComplete?: () => void;
}): JSX.Element {
  const { chain } = useAccount();
  const { isDeployed, address, deploy } = useRouterContract();
  const navigate = useNavigate();
  return (
    <Flex>
      {address.isLoading && <Spinner />}
      {isDeployed && (
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
      {!address.isLoading && !isDeployed && (
        <VStack alignItems="flex-start">
          <Text>Click the button below to deploy your router</Text>
          <Button
            onClick={() =>
              deploy.mutate(void 0, {
                onSuccess: () => {
                  onComplete?.();
                  navigate('/setup');
                },
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
