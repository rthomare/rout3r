import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Box, HStack, Icon, Switch, useColorMode } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BsGithub } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { useConnectorClient } from 'wagmi';

export function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const result = useConnectorClient();
  return (
    <HStack justifyContent="space-between" w="100%">
      <HStack fontSize="lg" gap={4}>
        <Link to="/">Home</Link>
        {result.status === 'success' && <Link to="/setup">Setup</Link>}
        <Link to="/about">About</Link>
      </HStack>
      <HStack fontSize="lg" gap={4}>
        {result.status === 'success' && (
          <ConnectButton accountStatus="address" showBalance={false} />
        )}
        <Link
          aria-label="Go to rout3r github"
          to="https://github.com/rthomare/rout3r"
          target={'_blank'}
        >
          <Icon
            as={BsGithub}
            display="block"
            transition="color 0.2s"
            fontSize="2xl"
            size="2xl"
            _hover={{ color: 'gray.600' }}
          />
        </Link>
        <Box position="relative">
          <Switch
            size="lg"
            isChecked={colorMode === 'light'}
            onChange={toggleColorMode}
            aria-label="Toggle color mode"
            colorScheme={colorMode === 'light' ? 'gray' : 'whiteAlpha'}
          />
          <MoonIcon
            fontSize="md"
            position="absolute"
            top="8px"
            left="5px"
            color="white"
            pointerEvents={'none'}
          />
          <SunIcon
            fontSize="md"
            position="absolute"
            top="8px"
            right="5px"
            color="white"
            pointerEvents={'none'}
          />
        </Box>
      </HStack>
    </HStack>
  );
}
