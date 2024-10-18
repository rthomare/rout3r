import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { Button, Flex, Text, VStack } from '@chakra-ui/react';

import { useRouterContract } from '../hooks/useRouterContract';
import { useOnchain } from '../hooks/useOnchain';

export function DeployContract({
  onComplete,
}: {
  onComplete?: () => void;
}): JSX.Element {
  const { config } = useOnchain();
  const { isDeployed, contract, deploy } = useRouterContract();
  const navigate = useNavigate();
  const onSuccess = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
    navigate('/setup');
  }, [onComplete, navigate]);
  return (
    <Flex>
      {isDeployed && (
        <VStack alignItems="flex-start">
          <Link
            to={`${config.client.chain?.blockExplorers?.default.url}/search?q=${contract?.address}`}
            target="_blank"
          >
            <Text textDecoration="underline">
              router contract already deployed at {contract?.address}
            </Text>
          </Link>
        </VStack>
      )}
      {!isDeployed && (
        <VStack alignItems="flex-start">
          <Text>click the button below to deploy your router</Text>
          <Button
            onClick={() =>
              deploy.mutate(undefined, {
                onSuccess,
              })
            }
            isLoading={deploy.isPending}
          >
            deploy router
          </Button>
        </VStack>
      )}
    </Flex>
  );
}
