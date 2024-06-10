import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App';
import theme from './theme';
import { WagmiProvider } from 'wagmi';
import { persister, queryClient } from './lib/queryClient';
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Routing } from './Routing';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GlobalLoaderProvider } from './hooks/useGlobalLoader';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

var condition = window.location.href.match('/#go') !== null;
const container = document.getElementById('root');
if (!container) {
  console.error("Couldn't find root element");
  process.exit(1);
}

// Dynamically load the appropriate module based on the condition
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <GlobalLoaderProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          {condition ? (
            <Routing />
          ) : (
            <WagmiProvider config={config}>
              <App />
            </WagmiProvider>
          )}
        </PersistQueryClientProvider>
      </GlobalLoaderProvider>
    </ChakraProvider>
  </React.StrictMode>
);
