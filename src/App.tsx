import { useMemo } from 'react';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { useAccountEffect, WagmiProvider } from 'wagmi';

import {
  Box,
  ChakraProvider,
  ColorModeScript,
  Fade,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { WalletAvatar } from './components/AvatarComponent';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { useAppDestinations } from './hooks/useAppDestinations';
import { GlobalLoaderProvider, useGlobalLoader } from './hooks/useGlobalLoader';
import { OnchainProvider } from './hooks/useOnchain';
import { appConfig } from './lib/config';
import { persister, queryClient } from './lib/queryClient';
import { Routing } from './routing/Routing';
import { chakraTheme } from './theme/chakraTheme';
import { darkRainbowTheme, lightRainbowTheme } from './theme/rainbowTheme';

import '@rainbow-me/rainbowkit/styles.css';

export function Content() {
  const appDestinations = useAppDestinations();
  const navigate = useNavigate();
  useAccountEffect({
    onDisconnect() {
      navigate('/');
    },
  });
  useGlobalLoader({
    id: 'app-destinations',
    showLoader: appDestinations.isLoading,
    helperText: 'booting up application',
  });
  return (
    <Fade
      transition={{ enter: { duration: 0.5, delay: 0 } }}
      in={!appDestinations.isLoading}
      unmountOnExit
    >
      <VStack h="100vh" w="100vw" padding={8} paddingBottom={4}>
        <Navbar {...appDestinations} />
        <Box flexGrow={1} w="100%" padding="1rem 0">
          <Routes>
            {appDestinations.destinations.map((destination) => (
              <Route
                key={destination.path}
                path={destination.path}
                element={destination.content}
              />
            ))}
          </Routes>
        </Box>
        <Footer />
      </VStack>
    </Fade>
  );
}

function UI(): JSX.Element {
  const { colorMode } = useColorMode();
  const rainbowTheme: Theme | undefined = useMemo(
    () => (colorMode === 'light' ? lightRainbowTheme : darkRainbowTheme),
    [colorMode]
  );
  return (
    <RainbowKitProvider
      modalSize="compact"
      avatar={WalletAvatar}
      theme={rainbowTheme}
    >
      <Content />
    </RainbowKitProvider>
  );
}

function App(): JSX.Element {
  const isGoRoute = window.location.href.match('/#go') !== null;
  return (
    <ChakraProvider theme={chakraTheme}>
      <GlobalLoaderProvider>
        <ColorModeScript
          initialColorMode={chakraTheme.config.initialColorMode}
        />
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          {isGoRoute ? (
            <Box h="100vh" w="100vw">
              <Routing />
            </Box>
          ) : (
            <WagmiProvider config={appConfig}>
              <HashRouter>
                <OnchainProvider>
                  <UI />
                </OnchainProvider>
              </HashRouter>
            </WagmiProvider>
          )}
        </PersistQueryClientProvider>
      </GlobalLoaderProvider>
    </ChakraProvider>
  );
}

export default App;
