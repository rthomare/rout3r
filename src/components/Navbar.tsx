import { BsGithub } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Switch,
  useColorMode,
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { AppDestinationsResponse } from '../hooks/useAppDestinations';
import { useAppState } from '../hooks/useAppState';

export function Navbar({ destinations, isLoading }: AppDestinationsResponse) {
  const { colorMode, toggleColorMode } = useColorMode();
  const appState = useAppState();
  const location = useLocation();

  if (appState.isLoading || isLoading) {
    return null;
  }
  return (
    <HStack justifyContent="space-between" w="100%">
      <HStack fontSize="lg" gap={4}>
        {destinations
          .filter((v) => !v.shouldHideNav)
          .map((dest) => (
            <Link key={dest.path} to={dest.path}>
              <Heading
                size="md"
                color={
                  location.pathname.includes(dest.path) ? undefined : 'gray'
                }
                transition="color 0.2s"
              >
                {dest.name}
              </Heading>
            </Link>
          ))}
      </HStack>
      <HStack fontSize="lg" gap={4}>
        {appState.isWalletConnected && (
          <ConnectButton accountStatus="address" showBalance={false} />
        )}
        <Link
          aria-label="Go to rout3r github"
          to="https://github.com/rthomare/rout3r"
          target="_blank"
        >
          <Icon
            as={BsGithub}
            display="block"
            transition="color 0.2s"
            fontSize="2xl"
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
            pointerEvents="none"
          />
          <SunIcon
            fontSize="md"
            position="absolute"
            top="8px"
            right="5px"
            color="white"
            pointerEvents="none"
          />
        </Box>
      </HStack>
    </HStack>
  );
}
