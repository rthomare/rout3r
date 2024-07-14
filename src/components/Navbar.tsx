import { useRef } from 'react';
import { BsGithub } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import { mainnet } from 'viem/chains';

import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  Icon,
  IconButton,
  Switch,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';

import { AppDestinationsResponse } from '../hooks/useAppDestinations';
import { useAppState } from '../hooks/useAppState';

import { ConnectButton } from './ConnectButton';
import { GlowButton } from './GlowButton';

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
