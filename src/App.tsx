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
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { useAppDestinations } from './hooks/useAppDestinations';
import { GlobalLoaderProvider, useGlobalLoader } from './hooks/useGlobalLoader';
import { OnchainProvider } from './hooks/useOnchain';
import { appConfig, config } from './lib/config';
import { persister, queryClient } from './lib/queryClient';
import { Routing } from './routing/Routing';
import theme from './theme';

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

function App(): JSX.Element {
  const { colorMode } = useColorMode();
  const isGoRoute = window.location.href.match('/#go') !== null;

  return (
    <ChakraProvider theme={theme}>
      <GlobalLoaderProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
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
                  <RainbowKitProvider
                    theme={
                      colorMode === 'dark'
                        ? darkTheme({
                            accentColor: '#0f0f0f',
                            accentColorForeground: 'white',
                            borderRadius: 'large',
                            fontStack: 'rounded',
                            overlayBlur: 'small',
                          })
                        : undefined
                    }
                  >
                    <Content />
                  </RainbowKitProvider>
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
