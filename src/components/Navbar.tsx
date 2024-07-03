import { BsGithub } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

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
import { useRef } from 'react';
import { ConnectButton } from './ConnectButton';
import { GlowButton } from './GlowButton';
import { mainnet } from 'viem/chains';

export function Navbar({ destinations, isLoading }: AppDestinationsResponse) {
  const { colorMode, toggleColorMode } = useColorMode();
  const appState = useAppState();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  if (appState.isLoading || isLoading) {
    return null;
  }
  return (
    <HStack justifyContent="space-between" w="100%">
      {/* If on mobile show a hamburger menu wuth desinations as opposed to hstack */}
      {appState.isWalletConnected ? (
        <Box display={{ base: 'block', md: 'none' }}>
          <IconButton
            icon={<HamburgerIcon />}
            fontSize={'2xl'}
            ref={btnRef}
            onClick={onOpen}
            aria-label={'menu'}
            background="transparent"
          >
            Open
          </IconButton>

          <Drawer
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent
              background={colorMode === 'dark' ? 'black' : 'white'}
            >
              <DrawerCloseButton />
              <DrawerHeader padding={'20px 10px 0px 25px'}>
                {appState.isWalletConnected && (
                  <Box as="span">
                    <ConnectButton />
                  </Box>
                )}
              </DrawerHeader>
              <DrawerBody>
                <Divider />
                {destinations
                  .filter((v) => !v.shouldHideNav)
                  .map((dest) => (
                    <Box as="span" key={dest.path}>
                      <Link to={dest.path} onClickCapture={onClose}>
                        <Heading
                          size="sm"
                          padding="1rem 0"
                          color={
                            location.pathname.includes(dest.path)
                              ? undefined
                              : 'gray'
                          }
                          transition="color 0.2s"
                        >
                          {dest.name}
                        </Heading>
                      </Link>
                      <Divider />
                    </Box>
                  ))}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Box>
      ) : (
        <Box></Box>
      )}
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
          {appState.isWalletConnected && <ConnectButton key="connect" />}
        </HStack>
      </Box>

      <HStack fontSize="lg" gap={4}>
        <Link
          style={{ margin: 0, padding: 0 }}
          to={
            `${mainnet.blockExplorers?.default.url}/address/` +
            `0x197A002614cd5D82Fa547988A0FF0455f658894A`
          }
          target="_blank"
        >
          <GlowButton fontWeight="normal" size={'sm'}>
            donate
          </GlowButton>
        </Link>
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
