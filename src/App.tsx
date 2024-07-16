import { useEffect } from 'react';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { AlchemyAccountProvider, useSignerStatus } from '@account-kit/react';
import {
  Box,
  ChakraProvider,
  ColorModeScript,
  Fade,
  VStack,
} from '@chakra-ui/react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { useAppDestinations } from './hooks/useAppDestinations';
import { GlobalLoaderProvider, useGlobalLoader } from './hooks/useGlobalLoader';
import { OnchainProvider } from './hooks/useOnchain';
import { appConfig } from './lib/config';
import { persister, queryClient } from './lib/queryClient';
import { Routing } from './routing/Routing';
import { chakraTheme } from './theme/chakraTheme';

import '@rainbow-me/rainbowkit/styles.css';
import './global.css';

export function Content() {
  const appDestinations = useAppDestinations();
  const navigate = useNavigate();
  const { isDisconnected } = useSignerStatus();

  useEffect(() => {
    if (isDisconnected) {
      navigate('/');
    }
  }, [isDisconnected]);

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
  return <Content />;
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
          <AlchemyAccountProvider config={appConfig} queryClient={queryClient}>
            {isGoRoute ? (
              <Box h="100vh" w="100vw">
                <Routing />
              </Box>
            ) : (
              <HashRouter>
                <OnchainProvider>
                  <UI />
                </OnchainProvider>
              </HashRouter>
            )}
          </AlchemyAccountProvider>
        </PersistQueryClientProvider>
      </GlobalLoaderProvider>
    </ChakraProvider>
  );
}

export default App;
