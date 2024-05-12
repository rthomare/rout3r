import { Heading, Text, Tooltip, VStack, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

export function useErrorToast(title: string) {
  const toast = useToast();
  return useCallback(
    (error?: Error) => {
      console.error(error);
      toast({
        position: 'top',
        title: (
          <VStack alignItems="flex-start">
            <Heading size="sm">{title}</Heading>
            <Tooltip label={error?.message} aria-label="error message">
              <Text fontSize="sm" textDecoration="underline">
                Hover for more details
              </Text>
            </Tooltip>
          </VStack>
        ),
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    },
    [toast]
  );
}
