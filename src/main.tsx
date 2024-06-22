import React from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';

import { Box, ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { GlobalLoaderProvider } from './hooks/useGlobalLoader';
import { config } from './lib/config';
import { persister, queryClient } from './lib/queryClient';
import { Routing } from './routing/Routing';
import App from './App';
import theme from './theme';

const isGoRoute = window.location.href.match('/#go') !== null;
const container = document.getElementById('root');
if (!container) {
  console.error("Couldn't find root element");
  process.exit(1);
}

// Dynamically load the appropriate module based on the condition
const root = createRoot(container);
const appConfig = config();
root.render(
  <React.StrictMode>
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
              <App />
            </WagmiProvider>
          )}
        </PersistQueryClientProvider>
      </GlobalLoaderProvider>
    </ChakraProvider>
  </React.StrictMode>
);
