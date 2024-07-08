import { Text, VStack } from '@chakra-ui/react';

import packageJson from '../../package.json';

export function Footer() {
  // get the version from the package.json
  const { version } = packageJson;
  return (
    <VStack alignItems="center" w="100%" color="GrayText">
      <Text fontSize="small" p={0} m={0}>
        version {version}
      </Text>
    </VStack>
  );
}
