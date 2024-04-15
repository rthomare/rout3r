import { ExternalLinkIcon, InfoIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  Divider,
  Heading,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';

function App(): JSX.Element {
  return (
    <Center
      as="header"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="100%"
      fontSize="3xl"
    >
      <VStack>
        <Heading size="2xl">welcome to rout3r</Heading>
        <Text fontSize="lg">
          Open sourced web3 routes to simplify browsing.
        </Text>
        <Divider />
      </VStack>
      <VStack>
        <Link href="/setup">
          <SettingsIcon mx="2px" />
          &nbsp; Setup
        </Link>
        <Link href="/about">
          <InfoIcon mx="2px" />
          &nbsp; About
        </Link>
      </VStack>
    </Center>
  );
}

export default App;
