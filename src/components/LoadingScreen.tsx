import { Center } from '@chakra-ui/react';

import { Loader } from './Loader';

export function LoadingScreen({ summary }: { summary?: string }) {
  return (
    <Center h="100%" w="100%">
      <Loader helperText={summary} />
    </Center>
  );
}
