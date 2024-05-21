import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

/*
 * Hook to copy a string to the clipboard
 * @returns a function that then copies the string to the clipboard
 * and shows a success toast
 *
 * @example
 * const copy = useCopy();
 * const copyAddress = copy('0x1234...')
 * copyAddress()
 */
export function useCopy() {
  const toast = useToast();
  return useCallback(
    (item: string, toastTitle?: string) => () => {
      navigator.clipboard.writeText(item);
      toast({
        position: 'top',
        title: toastTitle ?? 'Copied!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    [toast]
  );
}
