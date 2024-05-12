import { Heading, Text, Tooltip, VStack, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

/*
 * Hook to show an error toast
 * @param title the title of the toast
 * @returns a function that then shows the toast
 *
 * @example
 * const errorToast = useErrorToast('Error');
 * const showDeployToast = errorToast('Failed to deploy contract');
 * showDeployToast(new Error('some rpc error'))
 */
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
