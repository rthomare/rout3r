import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { processQuery } from './lib/engine';
import App from './App';
import theme from './theme';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Address } from 'viem';
import { createOcrDb } from './database/ocrDatabase';

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

var condition = window.location.href.match('/rout3r/#go') !== null;

// Dynamically load the appropriate module based on the condition
if (condition) {
  // get the query parameters after /#go
  const queryString = window.location.href.split('/#go?')[1];
  if (!queryString) {
    console.error('No query string');
    process.exit(1);
  }
  const params = new URLSearchParams(queryString);
  const searchFallback = params.get('searchFallback');
  const rpc = params.get('rpc');
  const address = params.get('address') as Address;
  const contract = params.get('contract') as Address;
  const query = params.get('q');

  if (!searchFallback || !rpc || !address || !contract) {
    console.error(
      'The URL was not setup correctly please check to see that ' +
        'searchFallback, rpc, address, & contract were all setup correctly'
    );
    process.exit(1);
  }

  const db = createOcrDb({
    origin: window.location.origin,
    searchFallback,
    rpc,
    address,
    contract,
  });
  processQuery(db, query ?? '', searchFallback)
    .then((url) => {
      // redirect to the processed url
      window.location.href = url;
    })
    .catch((err) => {
      console.error(err);
    });
} else {
  const container = document.getElementById('root');
  if (!container) {
    console.error("Couldn't find root element");
    process.exit(1);
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </WagmiProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
}
