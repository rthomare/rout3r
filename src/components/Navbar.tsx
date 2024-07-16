import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Box, Heading, HStack, useColorMode } from '@chakra-ui/react';

import { AppDestinationsResponse } from '../hooks/useAppDestinations';
import { useAppState } from '../hooks/useAppState';

import { ConnectButton } from './ConnectButton';

export function Navbar({ destinations, isLoading }: AppDestinationsResponse) {
  const { colorMode, toggleColorMode } = useColorMode();
  const appState = useAppState();
  const location = useLocation();
  const btnRef = useRef<HTMLButtonElement>(null);

  if (appState.isLoading || isLoading) {
    return null;
  }
  return (
    <HStack justifyContent="space-between" w="100%">
      <Box display={{ base: 'none', md: 'block' }}>
        <HStack fontSize="lg" gap={4}>
          {destinations
            .filter((v) => !v.shouldHideNav)
            .map((dest) => {
              const isCurrent = location.pathname.includes(dest.path);
              return (
                <Link key={dest.path} to={dest.path}>
                  <Heading
                    size="sm"
                    fontWeight={isCurrent ? 'normal' : 'normal'}
                    color={isCurrent ? undefined : 'gray'}
                    _hover={{ color: isCurrent ? undefined : 'gray.600' }}
                    transition="color 0.2s"
                  >
                    {dest.name}
                  </Heading>
                </Link>
              );
            })}
        </HStack>
      </Box>
      {appState.isWalletConnected && <ConnectButton key="connect" />}
    </HStack>
  );
}
