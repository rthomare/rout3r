import { Link, Text, VStack } from '@chakra-ui/react';

export function Footer() {
  return (
    <VStack alignItems="center" w="100%" color="GrayText" gap={0}>
      <Text p={0} m={0}>
        Made with love 🤍
      </Text>
      <Link
        style={{ margin: 0, padding: 0 }}
        href="https://etherscan.io/address/0x197A002614cd5D82Fa547988A0FF0455f658894A"
      >
        Donate to 0x197A002614cd5D82Fa547988A0FF0455f658894A
      </Link>
    </VStack>
  );
}
