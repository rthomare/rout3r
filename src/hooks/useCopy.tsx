import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

export function useCopy() {
  const toast = useToast();
  return useCallback(
    (item: string) => () => {
      navigator.clipboard.writeText(item);
      toast({
        position: 'top',
        title: 'Copied!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    [toast]
  );
}
