import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { Text, VStack } from '@chakra-ui/react';

export function Footer() {
  const { chain } = useAccount();
  return (
    <VStack alignItems="center" w="100%" color="GrayText" gap={0}>
      <Text p={0} m={0}>
        Made with love 🤍
      </Text>
      <Link
        style={{ margin: 0, padding: 0 }}
        to={
          `${chain?.blockExplorers?.default.url}/address/` +
          `0x197A002614cd5D82Fa547988A0FF0455f658894A`
        }
        target="_blank"
      >
        Donate to 0x197A002614cd5D82Fa547988A0FF0455f658894A
      </Link>
    </VStack>
  );
}
