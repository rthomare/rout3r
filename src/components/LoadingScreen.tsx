import { Center } from '@chakra-ui/react';
import { Loader } from './Loader';

export function LoadingScreen({ summary }: { summary?: string }) {
  return (
    <Center h="100vh" w="100vw">
      <Loader helperText={summary} />
    </Center>
  );
}
