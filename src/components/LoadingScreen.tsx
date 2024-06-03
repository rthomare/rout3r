import { Center, Heading, Spinner, VStack } from '@chakra-ui/react';

export function LoadingScreen({ summary }: { summary: string }) {
  return (
    <Center h="100vh" w="100vw">
      <VStack>
        <Spinner size="xl" />
        <Heading size="sm">{summary}</Heading>
      </VStack>
    </Center>
  );
}
